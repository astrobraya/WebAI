/**
 * View
 * Abstrai toda a manipulação do DOM, expondo métodos semânticos
 * para o controller e evitando referências diretas a elementos HTML
 * fora desta camada.
 */
export class View {
    constructor() {
        // Mapeia todos os elementos da interface utilizados pela aplicação
        this.elements = {
            temperature:       document.getElementById('temperature'),
            temperatureValue:  document.getElementById('temp-value'),
            topKValue:         document.getElementById('topk-value'),
            topK:              document.getElementById('topK'),
            form:              document.getElementById('question-form'),
            questionInput:     document.getElementById('question'),
            output:            document.getElementById('output'),
            button:            document.getElementById('ask-button'),
            buttonLabel:       document.querySelector('#ask-button .btn-label'),
            year:              document.getElementById('year'),
            fileInput:         document.getElementById('file-input'),
            filePreview:       document.getElementById('file-preview'),
            fileUploadBtn:     document.getElementById('file-upload-btn'),
            fileSelectedName:  document.getElementById('file-selected-name'),
        };
    }

    // ── Inicialização ──────────────────────────────────────────────────────────

    /** Preenche o ano atual no rodapé. */
    setYear() {
        this.elements.year.textContent = new Date().getFullYear();
    }

    /**
     * Configura os valores iniciais, mínimos e máximos dos controles
     * de parâmetros do modelo com base nos dados retornados pela API.
     * @param {{ defaultTemperature: number, maxTemperature: number, defaultTopK: number, maxTopK: number }} params
     */
    initializeParameters(params) {
        // Configura o slider de Top K
        this.elements.topK.min   = 1;
        this.elements.topK.max   = params.maxTopK;
        this.elements.topK.value = params.defaultTopK;
        this.elements.topKValue.textContent = params.defaultTopK;

        // Configura o slider de Temperatura
        this.elements.temperature.min   = 0;
        this.elements.temperature.max   = params.maxTemperature;
        this.elements.temperature.value = params.defaultTemperature;
        this.elements.temperatureValue.textContent = params.defaultTemperature;
    }

    // ── Atualização de valores dos parâmetros ──────────────────────────────────

    /** Atualiza o badge exibido ao lado do slider de temperatura. */
    updateTemperatureDisplay(value) {
        this.elements.temperatureValue.textContent = value;
    }

    /** Atualiza o badge exibido ao lado do campo de Top K. */
    updateTopKDisplay(value) {
        this.elements.topKValue.textContent = value;
    }

    // ── Leitura de valores do formulário ──────────────────────────────────────

    /** @returns {string} Texto digitado pelo usuário na caixa de pergunta. */
    getQuestionText() {
        return this.elements.questionInput.value;
    }

    /** @returns {number} Valor atual do slider de temperatura. */
    getTemperature() {
        return parseFloat(this.elements.temperature.value);
    }

    /** @returns {number} Valor atual do campo de Top K. */
    getTopK() {
        return parseInt(this.elements.topK.value, 10);
    }

    /** @returns {File | undefined} Arquivo selecionado pelo usuário, se houver. */
    getFile() {
        return this.elements.fileInput.files[0];
    }

    // ── Área de resposta ──────────────────────────────────────────────────────

    /** Substitui o conteúdo da área de resposta pelo texto fornecido. */
    setOutput(text) {
        this.elements.output.textContent = text;
    }

    /**
     * Exibe mensagens de erro na área de saída e desabilita o botão de envio,
     * impedindo interações enquanto a aplicação estiver em estado inválido.
     * @param {string[]} errors - Lista de mensagens de erro a exibir
     */
    showError(errors) {
        this.elements.output.innerHTML = errors
            .map(e => `<p>${e}</p>`)
            .join('');
        this.elements.button.disabled = true;
    }

    // ── Estado do botão de envio ──────────────────────────────────────────────

    /** Muda o botão para o modo "Parar" (geração em andamento). */
    setButtonToStopMode() {
        if (this.elements.buttonLabel) {
            this.elements.buttonLabel.textContent = 'Parar geração';
        } else {
            this.elements.button.textContent = 'Parar';
        }
        this.elements.button.classList.add('stop-button');
    }

    /** Restaura o botão para o modo "Enviar" (estado padrão). */
    setButtonToSendMode() {
        if (this.elements.buttonLabel) {
            this.elements.buttonLabel.textContent = 'Enviar pergunta';
        } else {
            this.elements.button.textContent = 'Enviar';
        }
        this.elements.button.classList.remove('stop-button');
    }

    // ── Pré-visualização de arquivo ────────────────────────────────────────────

    /**
     * Renderiza uma pré-visualização do arquivo selecionado (imagem ou áudio)
     * junto com um botão para removê-lo.
     * @param {Event} event - Evento "change" disparado pelo input de arquivo
     */
    handleFilePreview(event) {
        const file = event.target.files[0];

        // Limpa pré-visualização anterior
        this.elements.filePreview.innerHTML = '';
        this.elements.fileSelectedName.textContent = '';
        this.elements.fileSelectedName.classList.remove('selected');

        if (!file) return;

        // Exibe o nome do arquivo selecionado
        this.elements.fileSelectedName.textContent = `✓ ${file.name}`;
        this.elements.fileSelectedName.classList.add('selected');

        const fileType = file.type.split('/')[0]; // 'image' ou 'audio'
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';

        // Renderiza o elemento de mídia adequado com base no tipo do arquivo
        if (fileType === 'image') {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'preview-image';
            img.alt = `Pré-visualização: ${file.name}`;
            fileInfo.appendChild(img);
        } else if (fileType === 'audio') {
            const audio = document.createElement('audio');
            audio.src = URL.createObjectURL(file);
            audio.controls = true;
            audio.className = 'preview-audio';
            fileInfo.appendChild(audio);
        }

        // Botão para remover o arquivo selecionado e limpar a pré-visualização
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-file-btn';
        removeBtn.textContent = '× Remover arquivo';
        removeBtn.onclick = () => {
            this.elements.fileInput.value = '';
            this.elements.filePreview.innerHTML = '';
            this.elements.fileSelectedName.textContent = '';
            this.elements.fileSelectedName.classList.remove('selected');
        };
        fileInfo.appendChild(removeBtn);

        this.elements.filePreview.appendChild(fileInfo);
    }

    /** Simula um clique no input de arquivo nativo (oculto). */
    triggerFileInput() {
        this.elements.fileInput.click();
    }

    // ── Registro de eventos (callbacks) ──────────────────────────────────────

    /** @param {(e: Event) => void} callback */
    onTemperatureChange(callback) {
        this.elements.temperature.addEventListener('input', callback);
    }

    /** @param {(e: Event) => void} callback */
    onTopKChange(callback) {
        this.elements.topK.addEventListener('input', callback);
    }

    /** @param {(e: Event) => void} callback */
    onFileChange(callback) {
        this.elements.fileInput.addEventListener('change', callback);
    }

    /** @param {() => void} callback */
    onFileButtonClick(callback) {
        this.elements.fileUploadBtn.addEventListener('click', callback);
    }

    /** @param {(e: SubmitEvent) => void} callback */
    onFormSubmit(callback) {
        this.elements.form.addEventListener('submit', callback);
    }
}
