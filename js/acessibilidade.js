/**
 * acessibilidade.js
 * VLibras com proteção de links e botões
 * Herbário Virtual UFRA
 */

(function() {
    'use strict';
    
    console.log('🚀 Iniciando proteção de links e botões para VLibras...');
    
    // Aguardar tudo carregar
    window.addEventListener('load', function() {
        
        // Aguardar VLibras inicializar completamente (5 segundos)
        setTimeout(function() {
            protegerElementosInterativos();
        }, 5000);
        
    });
    
    /**
     * Proteger todos os links e botões do site
     */
    function protegerElementosInterativos() {
        console.log('🔗 Protegendo links e botões contra VLibras...');
        
        // PROTEÇÃO ESPECÍFICA PARA BOTÕES DE FILTRO
        const botoesFiltroPrincipal = document.querySelectorAll('.filter-buttons .filter-btn');
        
        botoesFiltroPrincipal.forEach(function(botao) {
            botao.addEventListener('click', function(e) {
                console.log('🔘 Botão de filtro clicado:', this.getAttribute('data-filter'));
                e.stopPropagation();
                e.stopImmediatePropagation();
            }, true);
        });
        
        console.log(`✅ ${botoesFiltroPrincipal.length} botões de filtro protegidos`);
        
        // PROTEÇÃO GERAL PARA TODOS OS CLIQUES
        document.addEventListener('click', function(e) {
            
            // Verificar se clicou em um link, botão ou elemento clicável
            const link = e.target.closest('a');
            const button = e.target.closest('button');
            const inputButton = e.target.closest('input[type="button"]');
            const inputSubmit = e.target.closest('input[type="submit"]');
            const filterBtn = e.target.closest('.filter-btn');
            const anyBtn = e.target.closest('.btn');
            
            const elementoClicado = link || button || inputButton || inputSubmit || filterBtn || anyBtn;
            
            if (elementoClicado) {
                
                // Verificar se NÃO é o botão do VLibras
                const isVLibras = e.target.closest('[vw-access-button]') || 
                                 e.target.closest('[vw]') ||
                                 e.target.closest('[vw-plugin-wrapper]');
                
                if (!isVLibras) {
                    console.log('🔗 Elemento protegido clicado');
                    
                    // Parar propagação para o VLibras não interceptar
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    // Se for link, navegar
                    if (link && link.href && link.href !== '#' && link.href !== 'javascript:void(0)') {
                        e.preventDefault();
                        
                        const href = link.href;
                        const target = link.target;
                        
                        setTimeout(function() {
                            if (target === '_blank') {
                                window.open(href, '_blank');
                            } else {
                                window.location.href = href;
                            }
                        }, 100);
                    }
                    // Botões e outros elementos: deixar executar normalmente
                    // (já bloqueamos a propagação do VLibras)
                }
            }
            
        }, true); // true = captura na fase de captura (antes do VLibras)
        
        console.log('✅ Proteção geral ativada!');
    }
    
    console.log('✅ Módulo de proteção carregado');
    
})();