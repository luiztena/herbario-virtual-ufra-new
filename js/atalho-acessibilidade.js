// ================================================
// atalhos-acessibilidade.js - VERSÃO SEM MODAL
// Sistema de atalhos para navegação interna
// ================================================

class AtalhosAcessibilidade {
    constructor() {
        this.shortcuts = this.getShortcutsConfig();
        this.altPressed = false;
        this.init();
    }
    
    getShortcutsConfig() {
        return {
            '1': { 
                type: 'top',  // Alt+1: Voltar ao topo da página
                action: 'Voltando ao topo da página',
                message: 'Voltando ao topo da página'
            },
            '2': { 
                type: 'focus',
                selector: '#main-content, main, .sectioncontainer',
                action: 'Navegando para o conteúdo principal',
                message: 'Focado no conteúdo principal'
            },
            '3': { 
                type: 'focus',
                selector: 'footer, #contact',
                action: 'Navegando para o rodapé',
                message: 'Focado no rodapé'
            },
            '0': {
                type: 'focus',
                selector: 'header nav ul li:first-child a',
                action: 'Navegando para o menu',
                message: 'Focado no menu de navegação'
            },
            's': {
                type: 'focus',
                selector: '#search-bar, input[type="search"], input[type="text"]',
                action: 'Ir para barra de pesquisa',
                message: 'Focado na barra de pesquisa'
            },
            'c': {
                type: 'focus',
                selector: '.cta-button, .catalogo-cta, .btn-apg',
                action: 'Ir para chamadas de ação',
                message: 'Focado no botão de chamada para ação'
            }
        };
    }
    
    init() {
        console.log('⌨️ Sistema de atalhos carregado');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Remover qualquer listener relacionado a modal
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Alt') {
                this.altPressed = false;
            }
        });
    }
    
    handleKeyDown(e) {
        // Método corrigido: usa e.altKey para verificar se Alt está pressionado
        if (e.altKey && this.shortcuts[e.key]) {
            e.preventDefault();
            e.stopPropagation();
            
            const shortcut = this.shortcuts[e.key];
            this.executeShortcut(shortcut, e.key);
        }
        
        // Mantém o controle da tecla Alt para outros usos
        if (e.key === 'Alt') {
            this.altPressed = true;
        }
    }
    
    executeShortcut(shortcut, key) {
        this.showFeedback(shortcut.message || shortcut.action);
        
        switch(shortcut.type) {
            case 'focus':
                this.focusElement(shortcut.selector);
                break;
                
            case 'top':
                this.scrollToTop();
                break;
        }
        
        console.log(`Atalho: Alt+${key.toUpperCase()} - ${shortcut.action}`);
    }
    
    scrollToTop() {
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
        
        // Focar no skip link ou no cabeçalho
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.focus();
        } else {
            const header = document.querySelector('header');
            if (header) {
                header.tabIndex = -1;
                header.focus();
            }
        }
    }
    
    focusElement(selector) {
        const selectors = selector.split(', ');
        
        for (const sel of selectors) {
            const element = document.querySelector(sel.trim());
            if (element) {
                // Tenta focar no elemento
                if (element.tabIndex < 0) {
                    element.tabIndex = -1;
                }
                
                // Rolar até o elemento
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                });
                
                // Focar no elemento após a rolagem
                setTimeout(() => {
                    element.focus();
                    
                    // Adicionar destaque visual
                    element.classList.add('atalho-focado');
                    setTimeout(() => {
                        element.classList.remove('atalho-focado');
                    }, 2000);
                }, 400);
                
                return;
            }
        }
        
        // Fallback para conteúdo principal
        if (selector.includes('main-content')) {
            const main = document.querySelector('main');
            if (main) {
                main.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => {
                    const firstFocusable = main.querySelector('h1, h2, [tabindex]');
                    if (firstFocusable) {
                        firstFocusable.tabIndex = -1;
                        firstFocusable.focus();
                        firstFocusable.classList.add('atalho-focado');
                        setTimeout(() => {
                            firstFocusable.classList.remove('atalho-focado');
                        }, 2000);
                    }
                }, 400);
            }
        }
    }
    
    showFeedback(message) {
        const existingFeedback = document.querySelector('.accesskey-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const feedback = document.createElement('div');
        feedback.className = 'accesskey-feedback';
        feedback.textContent = message;
        feedback.setAttribute('role', 'alert');
        feedback.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.opacity = '0';
                feedback.style.transform = 'translate(-50%, -20px)';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 2500);
    }
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    if (!window.atalhosSistema) {
        window.atalhosSistema = new AtalhosAcessibilidade();
        
        console.log('%c🔑 ATALHOS ATIVOS - Herbário Virtual UFRA', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
        console.log('Alt+1: Topo da página');
        console.log('Alt+2: Conteúdo principal');
        console.log('Alt+3: Rodapé');
        console.log('Alt+0: Menu de navegação');
        console.log('Alt+S: Barra de pesquisa');
        console.log('Alt+C: Chamadas de ação');
    }
});