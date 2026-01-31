// CONFIGURAÇÃO DE ATALHOS PARA NAVEGAÇÃO INTERNA
// Alt+1 = Menu | Alt+2 = Conteúdo principal | Alt+3 = Footer

const defaultShortcuts = {
    '1': { 
        type: 'focus',
        selector: 'header nav a', // Primeiro link do menu
        action: 'Navegando para o menu',
        message: 'Focado no menu de navegação'
    },
    '2': { 
        type: 'focus',
        selector: '#main-content',
        action: 'Navegando para o conteúdo principal',
        message: 'Focado no conteúdo principal'
    },
    '3': { 
        type: 'focus',
        selector: 'footer',
        action: 'Navegando para o rodapé',
        message: 'Focado no rodapé'
    },
    'h': { 
        type: 'modal',
        action: 'Abrindo ajuda de atalhos',
        message: 'Ajuda de atalhos aberta'
    },
    's': {
        type: 'focus',
        selector: '#search-bar',
        action: 'Ir para barra de pesquisa',
        message: 'Focado na barra de pesquisa'
    }
};