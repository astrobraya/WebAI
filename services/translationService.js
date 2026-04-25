/**
 * TranslationService
 * Gerencia a inicialização e uso das APIs nativas do Chrome
 * para detecção de idioma (LanguageDetector) e tradução (Translator).
 * Traduz texto de inglês para português usando streaming.
 */
export class TranslationService {
    constructor() {
        this.translator = null;        // Instância do Translator (en → pt)
        this.languageDetector = null;  // Instância do LanguageDetector
    }

    /**
     * Inicializa o Translator e o LanguageDetector.
     * Caso algum recurso não esteja disponível, registra o erro e
     * mantém o serviço operante (retornando o texto original sem traduzir).
     *
     * @returns {Promise<boolean>} true se inicializado com sucesso, false caso contrário
     */
    async initialize() {
        try {
            // Cria o tradutor inglês → português com acompanhamento de download
            this.translator = await Translator.create({
                sourceLanguage: 'en',
                targetLanguage: 'pt',
                monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                        const percent = (e.loaded * 100).toFixed(0);
                        console.log(`Download do Translator: ${percent}%`);
                    });
                }
            });
            console.log('Translator iniciado com sucesso.');

            // Cria o detector de idioma para evitar traduzir textos já em português
            this.languageDetector = await LanguageDetector.create();
            console.log('LanguageDetector iniciado com sucesso.');

            return true;
        } catch (error) {
            console.error('Falha ao inicializar os serviços de tradução:', error);
            this.translator = null;
            this.languageDetector = null;
            return false;
        }
    }

    /**
     * Traduz o texto fornecido para português.
     * Se o texto já estiver em português (detectado via LanguageDetector),
     * retorna o texto original sem custo adicional.
     *
     * @param {string} text - Texto em inglês a ser traduzido
     * @returns {Promise<string>} Texto traduzido para português ou original em caso de falha
     */
    async translateToPortuguese(text) {
        // Inicializa os serviços de tradução se ainda não foram criados
        if (!this.translator) {
            await this.initialize();
        }

        // Se ainda assim não houver translator, retorna o texto sem traduzir
        if (!this.translator) {
            console.warn('Translator indisponível — retornando texto original.');
            return text;
        }

        try {
            // Detecta o idioma do texto antes de traduzir
            if (this.languageDetector) {
                const detectionResults = await this.languageDetector.detect(text);
                console.log('Idioma detectado:', detectionResults);

                // Evita retraduzir um texto que já está em português
                if (detectionResults?.[0]?.detectedLanguage === 'pt') {
                    console.log('Texto já está em português — tradução ignorada.');
                    return text;
                }
            }

            // Traduz usando streaming — cada chunk contém a tradução acumulada até o momento
            const stream = this.translator.translateStreaming(text);
            let translated = '';
            for await (const chunk of stream) {
                translated = chunk; // O último chunk contém a tradução completa
            }

            console.log('Tradução concluída.');
            return translated;
        } catch (error) {
            console.error('Erro durante a tradução:', error);
            return text; // Retorna o original em caso de falha para não travar a UI
        }
    }
}
