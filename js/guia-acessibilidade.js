// Script para botão voltar ao topo - VERSÃO ABSOLUTA
document.addEventListener('DOMContentLoaded', function() {
    const btnTopoFlutuante = document.getElementById('btn-topo-flutuante');
    const btnTopoConteudo = document.querySelector('.btn-voltar-topo');
    
    // Função para ir ao topo absoluto
    function irParaTopoAbsoluto() {
        // Método 1: Ir direto ao topo (sem animação)
        window.scrollTo(0, 0);
        
        // Método 2: Forçar topo mesmo com elementos fixos
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Método 3: Se ainda não funcionar, usar timeout
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 10);
        
        // Método 4: Forçar foco no skip-link (opcional)
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.focus();
        }
    }
    
    // Botão flutuante
    if (btnTopoFlutuante) {
        // Mostrar/ocultar ao rolar
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300 || window.pageYOffset > 300) {
                btnTopoFlutuante.classList.add('visible');
            } else {
                btnTopoFlutuante.classList.remove('visible');
            }
        });
        
        // Clique no botão flutuante
        btnTopoFlutuante.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            irParaTopoAbsoluto();
        });
        
        // Atalho de teclado Enter/Space
        btnTopoFlutuante.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                irParaTopoAbsoluto();
            }
        });
    }
    
    // Botão no conteúdo
    if (btnTopoConteudo) {
        btnTopoConteudo.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            irParaTopoAbsoluto();
        });
    }
    
    // Adicionar atalho Alt+1 também (para consistência)
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === '1') {
            e.preventDefault();
            irParaTopoAbsoluto();
        }
    });
});