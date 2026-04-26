/**
 * FormController
 * Gerencia a lógica de interação com o formulário:
 * coleta dados, aciona os serviços de IA e tradução, e atualiza a view.
 */
export class FormController {
    /**
     * @param {import('../services/aiService.js').AIService} aiService
     * @param {import('../services/translationService.js').TranslationService} translationService
     * @param {import('../views/view.js').View} view
     */
    constructor(aiService, translationService, view) {
        this.aiService = aiService;
        this.translationService = translationService;
        this.view = view;

        // Controle do estado de geração (evita submissões concorrentes)
        this.isGenerating = false;

        // Estado da gravação de microfone
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    /**
     * Registra todos os event listeners necessários para o formulário.
     * Deve ser chamado uma única vez durante a inicialização.
     */
    setupEventListeners() {
        // Atualiza o badge de valor exibido ao lado do controle de temperatura
        this.view.onTemperatureChange((e) => {
            this.view.updateTemperatureDisplay(e.target.value);
        });

        // Atualiza o badge de valor exibido ao lado do controle de Top K
        this.view.onTopKChange((e) => {
            this.view.updateTopKDisplay(e.target.value);
        });

        // Exibe pré-visualização quando o usuário seleciona um arquivo
        this.view.onFileChange((event) => {
            this.view.handleFilePreview(event);
        });

        // Delega o clique do botão customizado para o input de arquivo nativo
        this.view.onFileButtonClick(() => {
            this.view.triggerFileInput();
        });

        // Submissão do formulário — alterna entre iniciar e parar a geração
        this.view.onFormSubmit(async (event) => {
            event.preventDefault();

            if (this.isGenerating) {
                // Interrompe a geração em curso ao clicar no botão "Parar"
                this.stopGeneration();
                return;
            }

            await this.handleSubmit();
        });
        // Botão de microfone — alterna entre gravar e parar gravação
        this.view.onMicButtonClick(async () => {
            if (this.isGenerating) return; // bloqueia durante geração de texto

            if (this.isRecording) {
                this.stopMicRecording();
            } else {
                await this.startMicRecording();
            }
        });    }

    /**
     * Inicia a captura de áudio pelo microfone via MediaRecorder.
     * Ao parar, monta o blob e chama handleMicSubmit.
     */
    async startMicRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            this.audioChunks = [];
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.audioChunks.push(e.data);
            };

            this.mediaRecorder.onstop = async () => {
                // Libera o microfone imediatamente após parar
                stream.getTracks().forEach(track => track.stop());

                const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
                await this.handleMicSubmit(audioBlob);
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.view.setMicButtonToRecordingMode();
        } catch (error) {
            console.error('Erro ao acessar microfone:', error);
            if (error.name === 'NotAllowedError') {
                this.view.setOutput('Permissão de microfone negada. Habilite o acesso ao microfone nas configurações do navegador.');
            } else if (error.name === 'NotFoundError') {
                this.view.setOutput('Nenhum microfone encontrado neste dispositivo.');
            } else {
                this.view.setOutput(`Erro ao iniciar gravação: ${error.message}`);
            }
        }
    }

    /**
     * Para a gravação em andamento.
     * O processamento ocorre no callback `onstop` do MediaRecorder.
     */
    stopMicRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.view.setMicButtonToIdleMode();
        }
    }

    /**
     * Envia o blob de áudio do microfone para a IA e exibe a resposta.
     * @param {Blob} audioBlob
     */
    async handleMicSubmit(audioBlob) {
        const temperature = this.view.getTemperature();
        const topK = this.view.getTopK();
        const responseMode = this.view.getResponseMode();

        console.log('Enviando áudio do microfone:', { size: audioBlob.size, type: audioBlob.type });

        this.toggleButton(true);
        this.view.setOutput('Processando áudio...');

        try {
            const aiResponseChunks = await this.aiService.createMicSession(
                audioBlob,
                temperature,
                topK,
                responseMode
            );

            this.view.setOutput('');
            let fullResponse = '';

            for await (const chunk of aiResponseChunks) {
                if (this.aiService.isAborted()) break;
                fullResponse += chunk;
                this.view.setOutput(fullResponse);
            }

            if (fullResponse && !this.aiService.isAborted()) {
                this.view.setOutput('Traduzindo resposta...');
                const translatedResponse = await this.translationService.translateToPortuguese(fullResponse);
                this.view.setOutput(translatedResponse);
            }
        } catch (error) {
            console.error('Erro durante processamento de áudio:', error);
            this.view.setOutput(`Erro: ${error.message}`);
        }

        this.toggleButton(false);
    }

    /**
     * Processa o envio do formulário:
     * valida a entrada, inicia a sessão de IA, transmite os chunks de resposta
     * e ao final aciona a tradução para português.
     */
    async handleSubmit() {
        const question = this.view.getQuestionText();

        // Ignora submissão com campo de pergunta vazio
        if (!question.trim()) return;

        // Lê os parâmetros configurados pelo usuário
        const temperature = this.view.getTemperature();
        const topK = this.view.getTopK();
        const file = this.view.getFile();
        const responseMode = this.view.getResponseMode();

        console.log('Parâmetros utilizados:', { temperature, topK, responseMode });

        // Habilita o modo "Parar" e exibe mensagem de processamento
        this.toggleButton(true);
        this.view.setOutput('Processando sua pergunta...');

        try {
            // Cria a sessão no modelo de IA e obtém o gerador de chunks
            const aiResponseChunks = await this.aiService.createSession(
                question,
                temperature,
                topK,
                file,
                responseMode
            );

            this.view.setOutput('');

            let fullResponse = '';

            // Itera sobre cada fragmento (chunk) da resposta em streaming
            for await (const chunk of aiResponseChunks) {
                if (this.aiService.isAborted()) break; // Respeita cancelamento do usuário

                fullResponse += chunk;
                this.view.setOutput(fullResponse); // Atualiza a tela em tempo real
            }

            // Após receber a resposta completa, traduz para português
            if (fullResponse && !this.aiService.isAborted()) {
                this.view.setOutput('Traduzindo resposta...');
                const translatedResponse = await this.translationService.translateToPortuguese(fullResponse);
                this.view.setOutput(translatedResponse);
            }
        } catch (error) {
            console.error('Erro durante a geração de IA:', error);
            this.view.setOutput(`Erro: ${error.message}`);
        }

        // Restaura o botão para o modo padrão de envio
        this.toggleButton(false);
    }

    /**
     * Cancela a geração em andamento via AbortController.
     */
    stopGeneration() {
        this.aiService.abort();
        this.toggleButton(false);
    }

    /**
     * Alterna o estado visual e funcional do botão de envio.
     * @param {boolean} isGenerating - true para modo "Parar"; false para modo "Enviar"
     */
    toggleButton(isGenerating) {
        this.isGenerating = isGenerating;

        if (isGenerating) {
            this.view.setButtonToStopMode();
        } else {
            this.view.setButtonToSendMode();
        }
    }
}
