// contribua.js - Sistema de formulários com 1 template EmailJS dinâmico
// VERSÃO CORRIGIDA E ORGANIZADA

(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÃO DO EMAILJS
    // ============================================
    const CONFIG = {
        PUBLIC_KEY: 'ifCiW-oxYT3Rwyr9U',
        SERVICE_ID: 'service_2tystbe',
        TEMPLATE_ID: 'template_kwednuf'
    };

    // ============================================
    // VARIÁVEIS DE VALIDAÇÃO
    // ============================================
    const HONEYPOT_FIELDS = {
        'CORREÇÃO': 'contact_me_by_fax_only',
        'FEEDBACK': 'contact_me_by_fax_only_feedback', 
        'APOIO': 'contact_me_by_fax_only_support'
    };
    
    const MIN_FORM_TIME = 5; // segundos mínimos para preenchimento

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        emailjs.init(CONFIG.PUBLIC_KEY);
        inicializarFormularios();
        configurarTemporizadores();
    });

    // ============================================
    // CONFIGURAÇÃO INICIAL
    // ============================================
    function configurarTemporizadores() {
        document.querySelectorAll('form').forEach(form => {
            form.dataset.startTime = (Date.now() / 1000).toString();
        });
    }

    // ============================================
    // FORMULÁRIOS
    // ============================================
    function inicializarFormularios() {
        const forms = [
            { id: 'correction-form', tipo: 'CORREÇÃO' },
            { id: 'feedback-form', tipo: 'FEEDBACK' },
            { id: 'support-form', tipo: 'APOIO' }
        ];

        forms.forEach(formConfig => {
            const form = document.getElementById(formConfig.id);
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    enviarFormulario(this, formConfig.tipo);
                });
            }
        });
    }

    // ============================================
    // VALIDAÇÕES (HONEYPOT + TEMPO)
    // ============================================
    function validarHoneypot(form, tipo) {
        const honeypotFieldName = HONEYPOT_FIELDS[tipo];
        const honeypotField = form.querySelector(`[name="${honeypotFieldName}"]`);
        
        if (honeypotField && honeypotField.value === '1') {
            console.log('⚠️ Possível bot detectado via honeypot.');
            return false;
        }
        return true;
    }

    function validarTempo(form) {
        const startTime = parseFloat(form.dataset.startTime || '0');
        const currentTime = Date.now() / 1000;
        
        if (currentTime - startTime < MIN_FORM_TIME) {
            console.log('⏱️ Envio muito rápido - possível bot');
            return false;
        }
        return true;
    }

    function validarCamposObrigatorios(form, tipo) {
        if (tipo === 'CORREÇÃO') {
            const nome = form.querySelector('#name-correction');
            if (nome && !nome.value.trim()) {
                alert('Por favor, informe seu nome');
                return false;
            }
        }
        return true;
    }

    // ============================================
    // ENVIO DE EMAIL (FUNÇÃO PRINCIPAL)
    // ============================================
    async function enviarFormulario(form, tipo) {
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;
        
        // 1. VALIDAÇÕES EM ORDEM
        if (!validarHoneypot(form, tipo)) {
            resetarBotao(button, originalText);
            form.reset();
            return;
        }
        
        if (!validarTempo(form)) {
            mostrarErro(form, tipo, 'Por favor, preencha o formulário com mais cuidado.');
            resetarBotao(button, originalText);
            return;
        }
        
        if (!validarCamposObrigatorios(form, tipo)) {
            resetarBotao(button, originalText);
            return;
        }
        
        // 2. PREPARAÇÃO DO ENVIO
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        try {
            // 3. COLETA E ENVIO
            const templateParams = coletarDados(form, tipo);
            console.log('Enviando email:', templateParams);
            
            await emailjs.send(CONFIG.SERVICE_ID, CONFIG.TEMPLATE_ID, templateParams);
            
            // 4. SUCESSO
            console.log('✅ Email enviado com sucesso');
            mostrarSucesso(form, tipo);
            trackGAEvent(tipo);
            resetFormulario(form);
            
        } catch (error) {
            // 5. ERRO
            console.error('❌ Erro no envio:', error);
            mostrarErro(form, tipo);
            
        } finally {
            // 6. LIMPEZA FINAL
            resetarBotao(button, originalText);
        }
    }

    // ============================================
    // FUNÇÕES AUXILIARES
    // ============================================
    function resetarBotao(button, texto) {
        button.disabled = false;
        button.innerHTML = texto;
    }

    function resetFormulario(form) {
        form.reset();
        // Reset do timer
        form.dataset.startTime = (Date.now() / 1000).toString();
        
        // Remove classes de erro se existirem
        form.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    }

    function trackGAEvent(tipo) {
        if (window.getAnalyticsConsent && window.getAnalyticsConsent()) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'form_type': tipo,
                    'event_category': 'engagement',
                    'event_label': 'form_contribution'
                });
                console.log('📈 Evento GA trackeado:', tipo);
            }
        }
    }

    // ============================================
    // COLETA DE DADOS (mantida igual)
    // ============================================
    function coletarDados(form, tipo) {
        const dataFormatada = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const dados = {
            tipo_formulario: tipo,
            data_envio: dataFormatada,
            nome: '',
            email: '',
            nome_planta: '',
            tipo_correcao: '',
            detalhes: '',
            tipo_feedback: '',
            forma_apoio: '',
            mensagem_adicional: ''
        };

        switch(tipo) {
            case 'CORREÇÃO':
                dados.nome = getValue(form, '#name-correction');
                dados.email = getValue(form, '#email-correction');
                dados.nome_planta = getValue(form, '#plant-name');
                dados.tipo_correcao = getSelectText(form, '#correction-type');
                dados.detalhes = getValue(form, '#correction-details');
                break;

            case 'FEEDBACK':
                dados.nome = getValue(form, '#name-feedback') || 'Anônimo';
                dados.email = getValue(form, '#email-feedback') || 'não informado';
                dados.tipo_feedback = getRadioText(form, 'feedback-type');
                dados.detalhes = getValue(form, '#feedback-message');
                break;

            case 'APOIO':
                dados.nome = getValue(form, '#name-support');
                dados.email = getValue(form, '#email-support');
                dados.forma_apoio = getSelectText(form, '#support-type');
                dados.mensagem_adicional = getValue(form, '#support-message');
                break;
        }

        return dados;
    }

    // ============================================
    // FUNÇÕES DE MANIPULAÇÃO DE DOM
    // ============================================
    function getValue(form, seletor) {
        const elemento = form.querySelector(seletor);
        return elemento ? elemento.value.trim() : '';
    }

    function getSelectText(form, seletor) {
        const select = form.querySelector(seletor);
        if (!select) return '';
        const texto = select.options[select.selectedIndex].text;
        return texto.trim();
    }

    function getRadioText(form, name) {
        const radio = form.querySelector(`input[name="${name}"]:checked`);
        if (!radio) return '';
        const label = form.querySelector(`label[for="${radio.id}"]`);
        return label ? label.textContent.trim() : '';
    }

    // ============================================
    // MENSAGENS DE FEEDBACK
    // ============================================
    function mostrarSucesso(form, tipo, mensagemPersonalizada = null) {
        const mensagens = {
            'CORREÇÃO': {
                id: 'correction-success',
                texto: '✅ Correção enviada com sucesso! Obrigado por contribuir com a precisão do nosso herbário.'
            },
            'FEEDBACK': {
                id: 'feedback-success',
                texto: '✅ Feedback recebido! Sua opinião é muito importante para nós.'
            },
            'APOIO': {
                id: 'support-success',
                texto: '✅ Interesse registrado! Entraremos em contato em breve.'
            }
        };

        const config = mensagens[tipo];
        if (!config) return;

        const elemento = document.getElementById(config.id);
        if (elemento) {
            elemento.textContent = mensagemPersonalizada || config.texto;
            elemento.style.cssText = `
                display: block;
                padding: 15px;
                margin-top: 15px;
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
                border-radius: 8px;
            `;

            setTimeout(() => {
                elemento.style.display = 'none';
            }, 5000);
        }
    }

    function mostrarErro(form, tipo, mensagemPersonalizada = null) {
        const elementos = {
            'CORREÇÃO': 'correction-success',
            'FEEDBACK': 'feedback-success',
            'APOIO': 'support-success'
        };

        const elementoId = elementos[tipo];
        if (!elementoId) return;

        const elemento = document.getElementById(elementoId);
        if (elemento) {
            elemento.textContent = mensagemPersonalizada || '❌ Erro ao enviar. Por favor, tente novamente.';
            elemento.style.cssText = `
                display: block;
                padding: 15px;
                margin-top: 15px;
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                border-radius: 8px;
            `;

            setTimeout(() => {
                elemento.style.display = 'none';
            }, 5000);
        }
    }

})(); // FIM DA FUNÇÃO IMEDIATAMENTE INVOCADA