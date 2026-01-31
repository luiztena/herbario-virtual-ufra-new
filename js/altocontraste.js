// altocontraste.js - VERSÃO FINAL CORRIGIDA
// Estrutura: index.html e 404.html no ROOT
//           guia-acessibilidade.html em html/

document.addEventListener('DOMContentLoaded', function() {
    let toggleBtn = document.getElementById('toggle-contraste');
    
    // ============================================
    // BOTÃO DE ALTO CONTRASTE
    // ============================================
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggle-contraste';
        toggleBtn.setAttribute('aria-label', 'Alternar alto contraste');
        
        toggleBtn.innerHTML = '<span class="contrast-icon">🌗</span><span class="contrast-text"> Alto Contraste</span>';
        
        Object.assign(toggleBtn.style, {
            position: 'fixed',
            zIndex: '10001', // Aumentado para 10001 (acima do menu)
            background: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 15px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(toggleBtn);
    }
    
    // ============================================
    // BOTÃO DA GUIA DE ACESSIBILIDADE
    // ============================================
    let acessibilidadeBtn = document.getElementById('guia-acessibilidade');
    
    if (!acessibilidadeBtn) {
        acessibilidadeBtn = document.createElement('button');
        acessibilidadeBtn.id = 'guia-acessibilidade';
        acessibilidadeBtn.setAttribute('aria-label', 'Abrir guia de acessibilidade');
        
        acessibilidadeBtn.innerHTML = '<span class="acessibilidade-icon">♿</span><span class="acessibilidade-text"> Guia Acessibilidade</span>';
        
        Object.assign(acessibilidadeBtn.style, {
            position: 'fixed',
            zIndex: '10002', // Aumentado para 10002 (acima do botão de alto contraste)
            background: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 15px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(acessibilidadeBtn);
    }
    
    // ============================================
    // DETECTAR SE ESTÁ NA PASTA HTML/
    // ============================================
    function estaNaPastaHtml() {
        const path = window.location.pathname;
        const cleanPath = path.split('?')[0].split('#')[0];
        
        const contemHtml = cleanPath.includes('/html/');
        const terminaComHtml = cleanPath.endsWith('/html') || cleanPath.endsWith('/html/');
        
        const parts = cleanPath.split('/').filter(p => p && !p.endsWith('.html'));
        const ultimaPasta = parts[parts.length - 1];
        
        const resultado = contemHtml || terminaComHtml || ultimaPasta === 'html';
        
        console.log('🔍 Detecção de pasta:', {
            path: cleanPath,
            contemHtml,
            terminaComHtml,
            ultimaPasta,
            estaNaPastaHtml: resultado
        });
        
        return resultado;
    }
    
    // ============================================
    // AJUSTAR POSIÇÃO DOS BOTÕES
    // ============================================
    function adjustButtonPosition() {
        const isMobile = window.innerWidth <= 768;
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        
        if (isMobile) {
            // MOBILE: botões circulares - abaixo do header
            toggleBtn.style.top = `${headerHeight + 10}px`; // Abaixo do header
            toggleBtn.style.right = '10px';
            toggleBtn.style.left = 'auto';
            toggleBtn.style.padding = '8px';
            toggleBtn.style.width = '40px';
            toggleBtn.style.height = '40px';
            toggleBtn.style.borderRadius = '50%';
            toggleBtn.style.justifyContent = 'center';
            
            acessibilidadeBtn.style.top = `${headerHeight + 10}px`; // Abaixo do header
            acessibilidadeBtn.style.left = '10px';
            acessibilidadeBtn.style.right = 'auto';
            acessibilidadeBtn.style.padding = '8px';
            acessibilidadeBtn.style.width = '40px';
            acessibilidadeBtn.style.height = '40px';
            acessibilidadeBtn.style.borderRadius = '50%';
            acessibilidadeBtn.style.justifyContent = 'center';
            
            // Esconder texto
            const textSpan = toggleBtn.querySelector('.contrast-text');
            if (textSpan) {
                textSpan.style.display = 'none';
                textSpan.style.visibility = 'hidden';
            }
            
            const iconSpan = toggleBtn.querySelector('.contrast-icon');
            if (iconSpan) {
                iconSpan.style.margin = '0';
                iconSpan.style.fontSize = '16px';
                iconSpan.style.display = 'block';
            }
            
            const acessibilidadeText = acessibilidadeBtn.querySelector('.acessibilidade-text');
            if (acessibilidadeText) {
                acessibilidadeText.style.display = 'none';
                acessibilidadeText.style.visibility = 'hidden';
            }
            
            const acessibilidadeIcon = acessibilidadeBtn.querySelector('.acessibilidade-icon');
            if (acessibilidadeIcon) {
                acessibilidadeIcon.style.margin = '0';
                acessibilidadeIcon.style.fontSize = '16px';
                acessibilidadeIcon.style.display = 'block';
            }
        } else {
            // DESKTOP: botões com texto - abaixo do header
            toggleBtn.style.top = `${headerHeight + 10}px`;
            toggleBtn.style.right = '10px';
            toggleBtn.style.left = 'auto';
            toggleBtn.style.width = 'auto';
            toggleBtn.style.height = 'auto';
            toggleBtn.style.borderRadius = '20px';
            toggleBtn.style.padding = '8px 15px';
            
            acessibilidadeBtn.style.top = `${headerHeight + 60}px`;
            acessibilidadeBtn.style.right = '10px';
            acessibilidadeBtn.style.left = 'auto';
            acessibilidadeBtn.style.width = 'auto';
            acessibilidadeBtn.style.height = 'auto';
            acessibilidadeBtn.style.borderRadius = '20px';
            acessibilidadeBtn.style.padding = '8px 15px';
            
            // Mostrar texto
            const textSpan = toggleBtn.querySelector('.contrast-text');
            if (textSpan) {
                textSpan.style.display = 'inline';
                textSpan.style.visibility = 'visible';
            }
            
            const acessibilidadeText = acessibilidadeBtn.querySelector('.acessibilidade-text');
            if (acessibilidadeText) {
                acessibilidadeText.style.display = 'inline';
                acessibilidadeText.style.visibility = 'visible';
            }
        }
    }
    
    // ============================================
    // EVENTO: ALTERNAR ALTO CONTRASTE
    // ============================================
    toggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('alto-contraste');
        
        const isActive = document.body.classList.contains('alto-contraste');
        const icon = toggleBtn.querySelector('.contrast-icon');
        const text = toggleBtn.querySelector('.contrast-text');
        
        if (icon) icon.textContent = isActive ? '🌞' : '🌗';
        if (text) text.textContent = isActive ? ' Normal' : ' Alto Contraste';
        
        localStorage.setItem('altoContraste', isActive);
        
        // Anunciar para leitores de tela
        const announcer = document.getElementById('sr-announcements');
        if (announcer) {
            announcer.textContent = isActive ? 
                'Alto contraste ativado' : 
                'Alto contraste desativado';
        }
    });
    
    // ============================================
    // EVENTO: ABRIR GUIA DE ACESSIBILIDADE
    // ============================================
    acessibilidadeBtn.addEventListener('click', function() {
        const estaEmHtml = estaNaPastaHtml();
        
        let guiaPath;
        
        if (estaEmHtml) {
            // ✅ Estamos EM html/ → guia na mesma pasta
            guiaPath = 'guia-acessibilidade.html';
            console.log('📂 Estamos em html/ → Mesma pasta:', guiaPath);
        } else {
            // ✅ Estamos NO ROOT → guia está em html/
            guiaPath = 'html/guia-acessibilidade.html';
            console.log('📂 Estamos no root → Entrando em html/:', guiaPath);
        }
        
        window.location.href = guiaPath;
    });
    
    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    // Ajustar posição inicial
    adjustButtonPosition();
    window.addEventListener('resize', adjustButtonPosition);
    window.addEventListener('scroll', adjustButtonPosition);
    
    // Restaurar preferência
    if (localStorage.getItem('altoContraste') === 'true') {
        document.body.classList.add('alto-contraste');
        const icon = toggleBtn.querySelector('.contrast-icon');
        const text = toggleBtn.querySelector('.contrast-text');
        if (icon) icon.textContent = '🌞';
        if (text) text.textContent = ' Normal';
    }
    
    console.log('✅ Alto contraste e guia carregados');
});