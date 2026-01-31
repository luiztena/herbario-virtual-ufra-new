// ================================================
// atalhos-acessibilidade.js
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
                type: 'focus',
                selector: 'header nav ul li:first-child a', // Primeiro item do menu
                action: 'Navegando para o menu',
                message: 'Focado no menu de navegação'
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
            'h': { 
                type: 'modal',
                action: 'Abrindo ajuda de atalhos',
                message: 'Ajuda de atalhos aberta'
            },
            's': {
                type: 'focus',
                selector: '#search-bar, input[type="search"]',
                action: 'Ir para barra de pesquisa',
                message: 'Focado na barra de pesquisa'
            },
            '0': {
                type: 'top',
                action: 'Voltar ao topo da página',
                message: 'Voltando ao topo da página'
            }
        };
    }
    
    init() {
        console.log('⌨️ Sistema de atalhos carregado');
        this.createModalIfNeeded();
        this.setupEventListeners();
        this.addAccesskeyHints();
    }
    
    createModalIfNeeded() {
        // Cria o modal dinamicamente se não existir
        if (!document.getElementById('keyboard-help-modal')) {
            this.createModal();
        }
        
        // Cria o botão flutuante se não existir
        if (!document.getElementById('show-shortcuts-btn')) {
            this.createFloatingButton();
        }
    }
    
    createModal() {
        const modalHTML = `
            <div id="keyboard-help-modal" class="modal" role="dialog" aria-labelledby="keyboard-help-title" aria-hidden="true">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="keyboard-help-title">Atalhos de Teclado</h3>
                        <button class="modal-close" aria-label="Fechar">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="shortcuts-grid">
                            <div class="shortcut-item">
                                <kbd>Alt</kbd> + <kbd>1</kbd>
                                <span>Ir para o Menu de Navegação</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt</kbd> + <kbd>2</kbd>
                                <span>Ir para o Conteúdo Principal</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt</kbd> + <kbd>3</kbd>
                                <span>Ir para o Rodapé</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt</kbd> + <kbd>S</kbd>
                                <span>Ir para a Barra de Pesquisa</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt</kbd> + <kbd>0</kbd>
                                <span>Voltar ao Topo</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt</kbd> + <kbd>H</kbd>
                                <span>Abrir esta ajuda</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Tab</kbd>
                                <span>Navegar entre elementos</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Shift</kbd> + <kbd>Tab</kbd>
                                <span>Navegar para trás</span>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-modal-close">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    createFloatingButton() {
        const buttonHTML = `
            <button id="show-shortcuts-btn" class="floating-help-btn" aria-label="Mostrar atalhos de teclado" title="Atalhos de teclado (Alt+H)">
                <i class="fas fa-keyboard"></i>
                <span class="tooltip">Atalhos (Alt+H)</span>
            </button>
        `;
        
        document.body.insertAdjacentHTML('beforeend', buttonHTML);
    }
    
    setupEventListeners() {
        const modal = document.getElementById('keyboard-help-modal');
        const showHelpBtn = document.getElementById('show-shortcuts-btn');
        
        // Abrir modal
        if (showHelpBtn) {
            showHelpBtn.addEventListener('click', () => this.openModal());
        }
        
        // Fechar modal
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close') || e.target.closest('.btn-modal-close')) {
                this.closeModal();
            }
            
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                this.closeModal();
            }
        });
        
        // Capturar atalhos Alt+Tecla
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
        // Verifica se Alt está pressionado
        if (e.key === 'Alt' || e.altKey) {
            this.altPressed = true;
            return;
        }
        
        // Se Alt está pressionado e a tecla é um atalho válido
        if (this.altPressed && this.shortcuts[e.key]) {
            e.preventDefault();
            e.stopPropagation();
            
            const shortcut = this.shortcuts[e.key];
            this.executeShortcut(shortcut, e.key);
        }
        
        // Alt+Shift para maiúsculas
        if (e.altKey && e.shiftKey && this.shortcuts[e.key.toLowerCase()]) {
            e.preventDefault();
            e.stopPropagation();
            
            const key = e.key.toLowerCase();
            const shortcut = this.shortcuts[key];
            this.executeShortcut(shortcut, key);
        }
    }
    
    executeShortcut(shortcut, key) {
        // Mostra feedback visual
        this.showFeedback(shortcut.message || shortcut.action);
        
        // Executa ação baseada no tipo
        switch(shortcut.type) {
            case 'focus':
                this.focusElement(shortcut.selector);
                break;
                
            case 'modal':
                this.openModal();
                break;
                
            case 'top':
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Foca no skip link se existir
                const skipLink = document.querySelector('.skip-link');
                if (skipLink) skipLink.focus();
                break;
                
            case 'anchor':
                this.scrollToAnchor(shortcut.selector);
                break;
        }
        
        // Log no console para debug
        console.log(`Atalho executado: Alt+${key.toUpperCase()} - ${shortcut.action}`);
    }
    
    focusElement(selector) {
        // Tenta múltiplos seletores se o primeiro falhar
        const selectors = selector.split(', ');
        
        for (const sel of selectors) {
            const element = document.querySelector(sel);
            if (element) {
                element.focus();
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                return;
            }
        }
        
        // Fallback: foca no primeiro elemento focável
        const firstFocusable = document.querySelector('a, button, input, [tabindex]');
        if (firstFocusable) firstFocusable.focus();
    }
    
    scrollToAnchor(anchorId) {
        const element = document.querySelector(anchorId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.focus();
        }
    }
    
    openModal() {
        const modal = document.getElementById('keyboard-help-modal');
        if (!modal) return;
        
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focar no botão de fechar
        setTimeout(() => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.focus();
        }, 100);
        
        this.showFeedback('Ajuda de atalhos aberta');
    }
    
    closeModal() {
        const modal = document.getElementById('keyboard-help-modal');
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Retornar foco para o botão flutuante
        const showHelpBtn = document.getElementById('show-shortcuts-btn');
        if (showHelpBtn) showHelpBtn.focus();
    }
    
    showFeedback(message) {
        // Remove feedback anterior
        const existingFeedback = document.querySelector('.accesskey-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Cria novo feedback
        const feedback = document.createElement('div');
        feedback.className = 'accesskey-feedback';
        feedback.textContent = message;
        feedback.setAttribute('role', 'alert');
        feedback.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(feedback);
        
        // Remove após 3 segundos
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.transition = 'opacity 0.3s, transform 0.3s';
                feedback.style.opacity = '0';
                feedback.style.transform = 'translate(-50%, -20px)';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 3000);
    }
    
    addAccesskeyHints() {
        // Adiciona dicas visualmente nos elementos existentes com accesskey
        document.querySelectorAll('[accesskey]').forEach(el => {
            const key = el.getAttribute('accesskey');
            if (key && !el.innerHTML.includes('[Alt+')) {
                const hint = document.createElement('span');
                hint.className = 'accesskey-hint';
                hint.textContent = `[Alt+${key.toUpperCase()}]`;
                el.appendChild(hint);
            }
        });
    }
}

// Inicializa automaticamente quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o script já foi carregado
    if (!window.atalhosSistema) {
        window.atalhosSistema = new AtalhosAcessibilidade();
        
        // Mensagem no console
        console.log('%c🔑 ATALHOS DE TECLADO ATIVOS', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
        console.log('%cAlt+1: Menu de Navegação', 'color: #666;');
        console.log('%cAlt+2: Conteúdo Principal', 'color: #666;');
        console.log('%cAlt+3: Rodapé', 'color: #666;');
        console.log('%cAlt+S: Barra de Pesquisa', 'color: #666;');
        console.log('%cAlt+0: Topo da Página', 'color: #666;');
        console.log('%cAlt+H: Mostrar ajuda', 'color: #666;');
    }
});