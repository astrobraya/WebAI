import { AIService } from './services/aiService.js';
import { TranslationService } from './services/translationService.js';
import { View } from './views/view.js';
import { FormController } from './controllers/formController.js';

/**
 * Ponto de entrada da aplicação.
 * Instancia os serviços, inicializa a view e verifica os pré-requisitos
 * antes de habilitar a interface para o usuário.
 */
(async function main() {
    // Instancia os serviços de IA e tradução
    const aiService = new AIService();
    const translationService = new TranslationService();

    // Instancia a camada de apresentação (View)
    const view = new View();

    // Exibe o ano atual no rodapé
    view.setYear();

    // Verifica se o navegador suporta as APIs necessárias (Chrome + flags ativas)
    const errors = await aiService.checkRequirements();
    if (errors) {
        view.showError(errors);
        return; // Interrompe a inicialização caso haja erros críticos
    }

    // Obtém os limites de parâmetros suportados pelo modelo e configura os controles
    const params = await aiService.getParams();
    view.initializeParameters(params);

    // Instancia o controller e registra os listeners de eventos do formulário
    const controller = new FormController(aiService, translationService, view);
    controller.setupEventListeners();

    console.log('Aplicação inicializada com sucesso.');
})();
