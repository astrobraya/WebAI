/**
 * AIService
 * Encapsula todas as interações com as APIs nativas de IA do Chrome
 * (window.ai / LanguageModel). Responsável por verificar requisitos,
 * obter parâmetros do modelo e gerenciar sessões de prompt com streaming.
 */
export class AIService {
    constructor() {
        this.session = null;             // Sessão ativa do modelo de linguagem
        this.abortController = null;     // Controla o cancelamento de requests em andamento
        this.languageModel = null;       // Referência à API LanguageModel do navegador
    }

    /**
     * Verifica se o ambiente do navegador atende todos os requisitos
     * para utilizar as APIs nativas de IA, tradução e detecção de idioma.
     *
     * @returns {Promise<string[] | null>} Lista de erros ou null se tudo estiver ok
     */
    async checkRequirements() {
        const errors = [];
        const returnResults = () => errors.length ? errors : null;

        // Apenas Google Chrome suporta as APIs nativas de IA utilizadas aqui
        // @ts-ignore
        const isChrome = !!window.chrome;
        if (!isChrome) {
            errors.push("⚠️ Esta aplicação funciona apenas no Google Chrome ou Chrome Canary (versão recente).");
        }

        // Verifica a disponibilidade da API LanguageModel
        const languageModel = window.ai?.languageModel ?? window.LanguageModel;
        if (!languageModel) {
            errors.push("⚠️ As APIs nativas de IA não estão ativas neste navegador.");
            errors.push("Ative a flag abaixo em chrome://flags/:");
            errors.push("— Prompt API for Gemini Nano (chrome://flags/#prompt-api-for-gemini-nano)");
            errors.push("Após ativar, reinicie o Chrome e tente novamente.");
            return returnResults();
        }
        this.languageModel = languageModel;

        // Verifica a API de Tradução (Translator)
        if ('Translator' in self) {
            const translatorAvailability = await Translator.availability({
                sourceLanguage: 'en',
                targetLanguage: 'pt'
            });
            console.log('Disponibilidade do Translator:', translatorAvailability);

            if (translatorAvailability === 'no') {
                errors.push("⚠️ A tradução de inglês para português não está disponível neste dispositivo.");
            }
        } else {
            errors.push("⚠️ A API de Tradução não está ativa.");
            errors.push("Ative a flag em chrome://flags/:");
            errors.push("— Translation API (chrome://flags/#translation-api)");
        }

        // Verifica a API de Detecção de Idioma (LanguageDetector)
        if (!('LanguageDetector' in self)) {
            errors.push("⚠️ A API de Detecção de Idioma não está ativa.");
            errors.push("Ative a flag em chrome://flags/:");
            errors.push("— Language Detection API (chrome://flags/#language-detector-api)");
        }

        if (errors.length > 0) return errors;

        // Verifica se o modelo de linguagem está disponível para uso
        const availability = await languageModel.availability({ languages: ["en"] });
        console.log('Disponibilidade do Language Model:', availability);

        if (availability === 'available') return returnResults();

        if (availability === 'unavailable') {
            errors.push("⚠️ Seu dispositivo não é compatível com modelos de linguagem nativos.");
        }

        if (availability === 'downloading') {
            errors.push("⚠️ O modelo de IA está sendo baixado. Aguarde alguns minutos e tente novamente.");
        }

        // Se o modelo pode ser baixado, inicia o download automaticamente
        if (availability === 'downloadable') {
            errors.push("⚠️ Baixando o modelo de linguagem... acompanhe o progresso no console do Chrome.");
            try {
                const session = await languageModel.create({
                    expectedInputLanguages: ["en"],
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            const percent = (e.loaded * 100).toFixed(0);
                            console.log(`Download do modelo: ${percent}%`);
                        });
                    }
                });
                await session.prompt('Hello');
                session.destroy();

                // Revalida disponibilidade após download concluído
                const newAvailability = await languageModel.availability({ languages: ["en"] });
                if (newAvailability === 'available') return null;
            } catch (error) {
                console.error('Erro ao baixar o modelo:', error);
                errors.push(`⚠️ Falha ao baixar o modelo: ${error.message}`);
            }
        }

        return returnResults();
    }

    /**
     * Retorna os parâmetros padrão e máximos suportados pelo modelo.
     * Se a API não expuser os parâmetros, utiliza valores padrão seguros.
     *
     * @returns {Promise<{defaultTemperature: number, maxTemperature: number, defaultTopK: number, maxTopK: number}>}
     */
    async getParams() {
        const defaults = {
            defaultTemperature: 1.0,
            maxTemperature: 2.0,
            defaultTopK: 3,
            maxTopK: 8,
        };

        if (typeof this.languageModel.params !== 'function') {
            console.warn('LanguageModel.params() indisponível neste contexto — usando valores padrão.');
            return defaults;
        }

        const params = await this.languageModel.params();
        console.log('Parâmetros do modelo:', params);
        return params ?? defaults;
    }

    /**
     * Retorna o system prompt de acordo com o modo de resposta selecionado.
     *
     * @param {'objective' | 'research'} mode
     * @returns {string}
     */
    #buildSystemPrompt(mode) {
        const languageInstruction =
            'Always respond in Brazilian Portuguese (pt-BR) by default. ' +
            'If the user explicitly requests a response in English or another language, prioritize that language instead.';

        if (mode === 'research') {
            return (
                'You are an in-depth research assistant. ' +
                'Always respond using rich Markdown formatting: use headings (##, ###), ' +
                'bullet lists, numbered lists, **bold**, *italic*, tables, and fenced code blocks where appropriate. ' +
                'Provide comprehensive, well-structured, and descriptive responses that cover ' +
                'multiple perspectives, context, examples, and technical details. ' +
                languageInstruction
            );
        }

        // default: 'objective'
        return (
            'You are a clear and objective AI assistant. ' +
            'Always respond using Markdown formatting: use **bold**, *italic*, ' +
            'bullet lists, numbered lists, headings, and fenced code blocks where appropriate. ' +
            'Be concise and direct — avoid unnecessary verbosity. ' +
            languageInstruction
        );
    }

    /**
     * Cria uma sessão de IA e transmite a resposta via streaming (generator assíncrono).
     * Suporta entradas multimodais: texto, imagem e áudio.
     *
     * @param {string} question - Pergunta ou instrução do usuário
     * @param {number} temperature - Grau de criatividade das respostas
     * @param {number} topK - Número de candidatos considerados por token
     * @param {File | null} file - Arquivo opcional (imagem ou áudio)
     * @param {'objective' | 'research'} responseMode - Modo de resposta da IA
     * @yields {string} Fragmentos (chunks) da resposta gerada
     */
    async* createSession(question, temperature, topK, file = null, responseMode = 'objective') {
        // Cancela qualquer request anterior antes de iniciar um novo
        this.abortController?.abort();
        this.abortController = new AbortController();

        // Destrói sessão anterior para aplicar novos parâmetros
        if (this.session) {
            this.session.destroy();
        }

        // Cria nova sessão com os parâmetros e modalidades configurados
        this.session = await this.languageModel.create({
            expectedInputs: [
                { type: "text" },
                { type: "audio" },
                { type: "image" },
            ],
            expectedOutputs: [{ type: "text" }],
            temperature,
            topK,
            initialPrompts: [
                {
                    role: 'system',
                    content: this.#buildSystemPrompt(responseMode),
                },
            ],
        });

        // Monta o array de conteúdo com texto e, opcionalmente, o arquivo enviado
        const contentArray = [{ type: "text", value: question }];

        if (file) {
            const fileType = file.type.split('/')[0]; // 'image' ou 'audio'

            if (fileType === 'image' || fileType === 'audio') {
                // Converte o arquivo para Blob para compatibilidade com a API
                const blob = new Blob([await file.arrayBuffer()], { type: file.type });
                contentArray.push({ type: fileType, value: blob });
                console.log(`Arquivo ${fileType} adicionado ao prompt:`, file.name);
            }
        }

        // Envia o prompt e itera sobre os chunks da resposta em streaming
        const responseStream = await this.session.promptStreaming(
            [{ role: 'user', content: contentArray }],
            { signal: this.abortController.signal }
        );

        for await (const chunk of responseStream) {
            // Interrompe a iteração se o usuário cancelou a geração
            if (this.abortController.signal.aborted) break;
            yield chunk;
        }
    }

    /**
     * Cria uma sessão de IA com áudio capturado pelo microfone como entrada.
     *
     * @param {Blob} audioBlob - Áudio gravado pelo microfone
     * @param {number} temperature
     * @param {number} topK
     * @param {'objective' | 'research'} responseMode
     * @yields {string} Fragmentos da resposta gerada
     */
    async* createMicSession(audioBlob, temperature, topK, responseMode = 'objective') {
        this.abortController?.abort();
        this.abortController = new AbortController();

        if (this.session) {
            this.session.destroy();
        }

        this.session = await this.languageModel.create({
            expectedInputs: [
                { type: "text" },
                { type: "audio" },
            ],
            expectedOutputs: [{ type: "text" }],
            temperature,
            topK,
            initialPrompts: [
                {
                    role: 'system',
                    content: this.#buildSystemPrompt(responseMode),
                },
            ],
        });

        const contentArray = [
            { type: "audio", value: audioBlob },
            {
                type: "text",
                value:
                    'This audio may contain background noise, long pauses, hesitations, or natural speech imperfections. ' +
                    'Please do the following in your response, using Markdown formatting:\n\n' +
                    '## 🎙️ Transcrição\n' +
                    'Transcribe and reorganize the audio content into a clear, concise summary of what was requested or described. ' +
                    'Correct obvious speech errors and remove filler words, keeping the intent intact. ' +
                    'If the audio is unclear or empty, state that briefly.\n\n' +
                    '## 💬 Resposta\n' +
                    'Now respond to the request identified in the audio, following the system instructions.',
            },
        ];

        const responseStream = await this.session.promptStreaming(
            [{ role: 'user', content: contentArray }],
            { signal: this.abortController.signal }
        );

        for await (const chunk of responseStream) {
            if (this.abortController.signal.aborted) break;
            yield chunk;
        }
    }

    /**
     * Cancela a geração em andamento sinalizando o AbortController.
     */
    abort() {
        this.abortController?.abort();
    }

    /**
     * Retorna true se a última solicitação foi cancelada pelo usuário.
     * @returns {boolean}
     */
    isAborted() {
        return this.abortController?.signal.aborted ?? false;
    }
}
