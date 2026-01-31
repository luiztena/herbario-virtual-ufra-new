// cookies.js - VERSÃO SEGURA (sem chaves expostas)
(function() {
    'use strict';
    
    console.log('🌿 cookies.js INICIADO - Herbário Virtual UFRA');
    
    // ============================================
    // VERIFICAÇÃO DE CONFIGURAÇÃO (PASSO 2)
    // ============================================
    if (!window.CONFIG || !window.CONFIG.GA_MEASUREMENT_ID) {
        console.warn('⚠️ Configurações não encontradas. Carregue config.js primeiro');
        console.warn('ℹ️ O banner de cookies NÃO será exibido sem as configurações.');
        return; // Não executa se não tiver chaves
    }
    
    // ============================================
    // CONFIGURAÇÃO (pega do config.js externo)
    // ============================================
    const CONFIG = {
        GA_MEASUREMENT_ID: window.CONFIG.GA_MEASUREMENT_ID,
        BANNER_ID: 'cookie-banner',
        EXPIRY_DAYS: 365
    };
    
    console.log('✅ Configurações carregadas:', {
        GA_ID: CONFIG.GA_MEASUREMENT_ID ? 'Presente' : 'Ausente',
        BannerID: CONFIG.BANNER_ID
    });

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📋 DOM carregado, iniciando banner...');
        initCookieBanner();
    });

    // ============================================
    // FUNÇÕES PRINCIPAIS
    // ============================================
    function initCookieBanner() {
        console.log('🎯 Iniciando banner de cookies...');
        
        // Cria banner se não existir
        if (!document.getElementById(CONFIG.BANNER_ID)) {
            console.log('🆕 Criando banner...');
            createBanner();
        }
        
        // Verifica decisão anterior
        const decision = getCookieDecision();
        console.log('🤔 Decisão anterior:', decision || 'Nenhuma');
        
        if (!decision) {
            console.log('👋 Mostrando banner (primeira visita)');
            showBanner();
        } else if (decision === 'accepted') {
            console.log('✅ Cookies aceitos, carregando GA...');
            loadGoogleAnalytics();
        }
        // Se 'rejected', não faz nada
    }

    // ============================================
    // FUNÇÕES DO BANNER
    // ============================================
    function createBanner() {
        const bannerHTML = `
            <div id="${CONFIG.BANNER_ID}" style="display: none; position: fixed; bottom: 0; left: 0; right: 0; background: #f8f9fa; padding: 20px; border-top: 2px solid #2e7d32; z-index: 10000; box-shadow: 0 -2px 10px rgba(0,0,0,0.1);">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                    <div style="flex: 1; min-width: 300px;">
                        <p style="margin: 0; color: #333; line-height: 1.5;">
                            <strong>🌿 Respeitamos sua privacidade</strong><br>
                            O Herbário Virtual UFRA usa cookies para analytics e melhorar sua experiência. 
                            <a href="POLITICA_DE_PRIVACIDADE.md" style="color: #2e7d32; text-decoration: underline;">Política de Privacidade</a>
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button onclick="window.handleCookieAccept()" style="background: #2e7d32; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            Aceitar cookies
                        </button>
                        <button onclick="window.handleCookieReject()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                            Recusar cookies
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        console.log('✅ Banner criado com sucesso!');
    }

    function showBanner() {
        const banner = document.getElementById(CONFIG.BANNER_ID);
        if (banner) {
            banner.style.display = 'block';
            console.log('👁️ Banner visível!');
        }
    }

    function hideBanner() {
        const banner = document.getElementById(CONFIG.BANNER_ID);
        if (banner) banner.style.display = 'none';
    }

    // ============================================
    // FUNÇÕES DE GERENCIAMENTO DE COOKIES
    // ============================================
    function getCookieDecision() {
        // 1. Tenta do localStorage primeiro
        const localData = localStorage.getItem('cookie_consent');
        if (localData) {
            try {
                const data = JSON.parse(localData);
                return data.decision;
            } catch (e) {
                console.warn('⚠️ Erro ao ler localStorage:', e);
            }
        }
        
        // 2. Fallback para cookies tradicionais
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'cookie_consent' && value) {
                try {
                    const data = JSON.parse(decodeURIComponent(value));
                    localStorage.setItem('cookie_consent', JSON.stringify(data));
                    return data.decision;
                } catch (e) {
                    console.warn('⚠️ Erro ao ler cookie:', e);
                }
            }
        }
        
        return null;
    }

    function setCookieDecision(decision, preferences) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + CONFIG.EXPIRY_DAYS);
        
        const cookieValue = JSON.stringify({
            decision: decision,
            preferences: preferences || {},
            date: new Date().toISOString()
        });
        
        // Salva no cookie tradicional
        document.cookie = `cookie_consent=${encodeURIComponent(cookieValue)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        
        // Salva também no localStorage
        localStorage.setItem('cookie_consent', cookieValue);
        
        hideBanner();
        
        if (decision === 'accepted') {
            loadGoogleAnalytics();
        }
    }

    // ============================================
    // GOOGLE ANALYTICS
    // ============================================
    function loadGoogleAnalytics() {
        if (window.gaLoaded) {
            return;
        }
        
        if (!CONFIG.GA_MEASUREMENT_ID || CONFIG.GA_MEASUREMENT_ID === 'CONFIDENCIAL') {
            console.error('❌ ID do Google Analytics inválido. Verifique config.js');
            return;
        }
        
        console.log('📊 Carregando Google Analytics...');
        
        // Cria a tag do gtag
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_MEASUREMENT_ID}`;
        
        // Configuração do GA4
        const script2 = document.createElement('script');
        script2.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${CONFIG.GA_MEASUREMENT_ID}', {
                'anonymize_ip': true,
                'allow_google_signals': false,
                'allow_ad_personalization_signals': false,
                'restrict_data_processing': true
            });
            console.log('✅ Google Analytics configurado! ID: ${CONFIG.GA_MEASUREMENT_ID}');
        `;
        
        document.head.appendChild(script1);
        document.head.appendChild(script2);
        window.gaLoaded = true;
        
        console.log('✅ Google Analytics carregado com sucesso!');
    }

    // ============================================
    // FUNÇÕES GLOBAIS (para onclick no HTML)
    // ============================================
    window.handleCookieAccept = function() {
        console.log('👍 Usuário aceitou cookies');
        setCookieDecision('accepted', {
            analytics: true,
            necessary: true
        });
        alert('Obrigado! Cookies aceitos. O analytics nos ajuda a melhorar o Herbário Virtual.');
    };

    window.handleCookieReject = function() {
        console.log('👎 Usuário recusou cookies');
        setCookieDecision('rejected', {
            analytics: false,
            necessary: true
        });
        alert('Preferência salva. Não usaremos cookies de analytics.');
    };

    // ============================================
    // FUNÇÕES AUXILIARES PARA OUTROS SCRIPTS
    // ============================================
    window.getAnalyticsConsent = function() {
        const decision = getCookieDecision();
        return decision === 'accepted';
    };

    window.trackEvent = function(category, action, label) {
        if (window.getAnalyticsConsent() && typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
            console.log(`📈 Evento trackeado: ${category} - ${action} - ${label}`);
        }
    };

    console.log('✅ cookies.js carregado com sucesso!');

})();