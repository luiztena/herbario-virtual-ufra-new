// categorias.js - VERSÃO OTIMIZADA PARA HERBÁRIO VIRTUAL
document.addEventListener('DOMContentLoaded', async function() {
    let especiesData = {};
    let filtroAtual = 'all';
    let bancoBuscaCategorias = [];

    // ===============================
    // FUNÇÕES UTILITÁRIAS
    // ===============================
    function normalizeText(text) {
        return text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || '';
    }

    function getTipoCssClass(tipo) {
        const mapa = {
            'Medicinal': 'medicinal',
            'Ornamental': 'ornamental',
            'Frutífera': 'frutifera',
            'Madeireira': 'madeireira',
            'Oportunista': 'oportunista',
            'Industrial': 'industrial'
        };
        
        // Mapeamento alternativo
        const alternativas = {
            'madeireira': 'madeireira',
            'madeireiro': 'madeireira',
            'árvore madeireira': 'madeireira',
            'madeira': 'madeireira',
            'ornamental': 'ornamental',
            'ornamentais': 'ornamental',
            'frutífera': 'frutifera',
            'frutíferas': 'frutifera',
            'frutifera': 'frutifera',
            'medicinal': 'medicinal',
            'medicinais': 'medicinal',
            'oportunista': 'oportunista',
            'oportunistas': 'oportunista'
        };
        
        const tipoLower = tipo.toLowerCase().trim();
        return mapa[tipo] || alternativas[tipoLower] || 'outro';
    }

    function criarBadge(tipo) {
        const cssClass = getTipoCssClass(tipo);
        const badgeColors = {
            'medicinal': '#10b981',
            'ornamental': '#ec4899',
            'frutifera': '#fff',
            'madeireira': '#b1b400',
            'oportunista': '#44e6ef',
            'industrial': '#f59e0b'
        };
        
        const textoCor = cssClass === 'frutifera' ? '#000000' : 'white';
        const color = badgeColors[cssClass] || '#6b7280';
        
        return `<span class="badge ${cssClass}" style="background-color: ${color}; color: ${textoCor}; padding: 4px 12px; border-radius: 16px; font-size: 0.8rem; margin: 2px; display: inline-block; font-weight: 600;">${tipo}</span>`;
    }

    function getBasePath() {
        const path = window.location.pathname;
        let cleanPath = path.split('?')[0].split('#')[0];
        
        if (cleanPath.includes('/html/')) {
            return cleanPath.substring(0, cleanPath.indexOf('/html/') + 1);
        }
        
        const parts = cleanPath.split('/').filter(p => p && !p.endsWith('.html'));
        if (parts.length === 0) return '/';
        
        const knownFolders = ['html', 'js', 'css', 'data', 'imagens', 'images'];
        const firstPart = parts[0].toLowerCase();
        
        if (!knownFolders.includes(firstPart)) {
            return `/${parts[0]}/`;
        }
        
        return '/';
    }

    // ===============================
    // FUNÇÕES DE RENDERIZAÇÃO
    // ===============================
    function criarCardEspecie(especie) {
        const tipos = especie.ficha?.['Tipo de planta'] || [];
        const tiposClasses = tipos.map(t => getTipoCssClass(t)).join(' ');
        const badgesHTML = tipos.map(t => criarBadge(t)).join('');
        const nomePopular = especie.ficha?.['Nome popular'] || '';
        const familia = especie.ficha?.['Família'] || especie.family || 'Família não especificada';
        
        // Garantir que a imagem tenha caminho correto
        let imageUrl = especie.image || 'imagens/site-imagem/placeholder.png';
        if (imageUrl.startsWith('imagens/') && !imageUrl.startsWith(getBasePath())) {
            imageUrl = getBasePath() + imageUrl;
        }

        // Descrição curta
        const descricao = especie.descricaoLonga?.[0] || 
                         especie.descricao?.substring(0, 150) + '...' || 
                         'Descrição não disponível';

        return `
            <a href="${especie.page || '#'}" class="card-link" data-tipos="${tiposClasses}">
                <div class="plant-card ${tiposClasses}">
                    <figure>
                        <img src="${imageUrl}" alt="${especie.name || 'Espécie'}" 
                             class="plant-img" 
                             onerror="this.src='${getBasePath()}imagens/site-imagem/placeholder.png'">
                    </figure>
                    <div class="plant-info">
                        <h3 class="plant-name" style="font-style: italic; font-size: 1.1rem; margin-bottom: 8px;">
                            ${especie.name || 'Nome não disponível'}
                        </h3>
                        <div style="margin: 8px 0; min-height: 30px;">
                            ${badgesHTML}
                        </div>
                        ${nomePopular ? `
                            <p style="color: #666; font-size: 0.9rem; margin: 4px 0;">
                                <strong>Nome popular:</strong> ${nomePopular}
                            </p>` : ''}
                        <p style="color: #888; font-size: 0.85rem; margin: 4px 0;">
                            <strong>Família:</strong> ${familia}
                        </p>
                        <p class="plant-description" style="margin-top: 10px; font-size: 0.9rem; color: #555; line-height: 1.4;">
                            ${descricao}
                        </p>
                    </div>
                </div>
            </a>
        `;
    }

    function renderizarEspecies(filtro = 'all', termoBusca = '') {
        const container = document.getElementById('especies-container');
        if (!container) {
            console.error('Container de espécies não encontrado!');
            return;
        }
        
        let especiesFiltradas = Object.values(especiesData);
        
        // Aplicar filtro de categoria
        if (filtro !== 'all') {
            especiesFiltradas = especiesFiltradas.filter(especie => {
                const tipos = especie.ficha?.['Tipo de planta'] || [];
                return tipos.some(tipo => {
                    const tipoNormalizado = getTipoCssClass(tipo);
                    return tipoNormalizado === filtro;
                });
            });
        }
        
        // Aplicar busca
        if (termoBusca) {
            const termoNormalizado = normalizeText(termoBusca);
            especiesFiltradas = especiesFiltradas.filter(especie => {
                const nomeCientifico = normalizeText(especie.name);
                const nomePopular = normalizeText(especie.ficha?.['Nome popular'] || '');
                const familia = normalizeText(especie.ficha?.['Família'] || '');
                
                return nomeCientifico.includes(termoNormalizado) || 
                       nomePopular.includes(termoNormalizado) ||
                       familia.includes(termoNormalizado);
            });
        }
        
        // Ordenar por nome
        especiesFiltradas.sort((a, b) => a.name?.localeCompare(b.name) || 0);
        
        // Renderizar
        if (especiesFiltradas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; width: 100%; color: #666;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; color: #888;"></i>
                    <p style="font-size: 1.2rem; margin-bottom: 10px;">Nenhuma espécie encontrada</p>
                    <p style="color: #777;">Tente ajustar os filtros ou o termo de busca</p>
                    <button id="limpar-tudo" style="margin-top: 20px; padding: 10px 20px; background: #416939; color: white; border: none; border-radius: 20px; cursor: pointer;">
                        Limpar todos os filtros
                    </button>
                </div>
            `;
            
            document.getElementById('limpar-tudo')?.addEventListener('click', () => {
                const searchBar = document.getElementById('search-bar');
                if (searchBar) searchBar.value = '';
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.filter === 'all') btn.classList.add('active');
                });
                filtroAtual = 'all';
                renderizarEspecies();
            });
        } else {
            container.innerHTML = especiesFiltradas.map(especie => criarCardEspecie(especie)).join('');
        }
        
        // Atualizar contador no título
        atualizarContador(filtro, especiesFiltradas.length);
    }

    function atualizarContador(filtro, quantidade) {
        const titulo = document.querySelector('.section-title');
        if (!titulo) return;
        
        const nomesFiltros = {
            'all': 'Todas',
            'medicinal': 'Medicinais',
            'ornamental': 'Ornamentais',
            'frutifera': 'Frutíferas',
            'madeireira': 'Madeireiras',
            'oportunista': 'Oportunistas',
            'industrial': 'Industriais'
        };
        
        const filtroTexto = filtro === 'all' ? '' : ` - ${nomesFiltros[filtro] || filtro}`;
        titulo.textContent = `Catálogo de Espécies Botânicas${filtroTexto} (${quantidade} ${quantidade === 1 ? 'espécie' : 'espécies'})`;
    }

    // ===============================
    // FUNÇÕES DE CONFIGURAÇÃO
    // ===============================
    function configurarFiltros() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const searchBar = document.getElementById('search-bar');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remover active de todos
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adicionar active ao clicado
                button.classList.add('active');
                
                // Atualizar filtro
                const filtroClicado = button.dataset.filter;
                filtroAtual = filtroClicado;
                
                // Se for "all", limpar busca
                if (filtroClicado === 'all' && searchBar) {
                    searchBar.value = '';
                }
                
                // Renderizar
                renderizarEspecies(filtroClicado, searchBar?.value || '');
                
                // Atualizar URL sem recarregar a página
                const novaUrl = new URL(window.location);
                if (filtroClicado === 'all') {
                    novaUrl.searchParams.delete('filter');
                } else {
                    novaUrl.searchParams.set('filter', filtroClicado);
                }
                window.history.replaceState({}, '', novaUrl);
            });
        });
    }

    function configurarBusca() {
        const searchBar = document.getElementById('search-bar');
        const searchBtn = document.getElementById('search-btn');
        const autocompleteList = document.getElementById('autocomplete-list');
        
        if (!searchBar || !searchBtn) return;
        
        // Função para executar busca
        const executarBusca = () => {
            const termo = searchBar.value.trim();
            renderizarEspecies(filtroAtual, termo);
            if (autocompleteList) autocompleteList.innerHTML = '';
        };
        
        // Botão de busca
        searchBtn.addEventListener('click', executarBusca);
        
        // Enter na barra de busca
        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executarBusca();
            }
        });
        
        // Autocomplete
        let timeoutId;
        searchBar.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const termo = searchBar.value.trim().toLowerCase();
                
                if (!termo || !autocompleteList) {
                    if (autocompleteList) autocompleteList.innerHTML = '';
                    return;
                }
                
                const sugestoes = bancoBuscaCategorias.filter(item => 
                    item.searchTerms.some(term => term.includes(termo))
                ).slice(0, 5);
                
                if (sugestoes.length > 0) {
                    autocompleteList.innerHTML = sugestoes.map(item => `
                        <li class="autocomplete-item" data-id="${item.id}">
                            <strong>${item.name}</strong>
                            ${item.nomePopular ? `<span style="color: #666; font-size: 0.85rem;"> (${item.nomePopular})</span>` : ''}
                        </li>
                    `).join('');
                    
                    // Event listeners para sugestões
                    document.querySelectorAll('.autocomplete-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const especieId = item.dataset.id;
                            const especie = especiesData[especieId];
                            if (especie) {
                                searchBar.value = especie.name;
                                executarBusca();
                            }
                            autocompleteList.innerHTML = '';
                        });
                    });
                } else {
                    autocompleteList.innerHTML = '';
                }
            }, 200);
        });
        
        // Fechar autocomplete ao clicar fora
        document.addEventListener('click', (e) => {
            if (autocompleteList && !searchBar.contains(e.target) && !autocompleteList.contains(e.target)) {
                autocompleteList.innerHTML = '';
            }
        });
    }

    function configurarBotaoLimpar() {
        const limparBtn = document.getElementById('limpar-filtros');
        const searchBar = document.getElementById('search-bar');
        
        if (!limparBtn) return;
        
        limparBtn.addEventListener('click', () => {
            // Limpar busca
            if (searchBar) searchBar.value = '';
            
            // Limpar autocomplete
            const autocompleteList = document.getElementById('autocomplete-list');
            if (autocompleteList) autocompleteList.innerHTML = '';
            
            // Ativar filtro "all"
            const todasBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if (todasBtn) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                todasBtn.classList.add('active');
                filtroAtual = 'all';
            }
            
            // Renderizar tudo
            renderizarEspecies('all', '');
            
            // Limpar URL
            window.history.replaceState({}, '', window.location.pathname);
        });
    }

    function processarParametrosURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const filtroURL = urlParams.get('filter');
        
        if (filtroURL) {
            const botaoFiltro = document.querySelector(`.filter-btn[data-filter="${filtroURL}"]`);
            if (botaoFiltro) {
                // Remover active de todos
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                // Ativar filtro da URL
                botaoFiltro.classList.add('active');
                filtroAtual = filtroURL;
                return true;
            }
        }
        return false;
    }

    // ===============================
    // CARREGAMENTO DE DADOS
    // ===============================
    async function carregarDados() {
        const container = document.getElementById('especies-container');
        
        // Mostrar loading
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; width: 100%; color: #666;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px;"></i>
                    <p style="font-size: 1rem;">Carregando espécies...</p>
                </div>
            `;
        }
        
        try {
            // Verificar se já temos os dados carregados globalmente
            if (window.especies && Object.keys(window.especies).length > 0) {
                especiesData = window.especies;
                console.log('Usando dados de espécies já carregados globalmente');
            } else {
                // Tentar diferentes caminhos para o arquivo JSON
                const basePath = getBasePath();
                const possiblePaths = [
                    `${basePath}data/especies.json`,
                    `data/especies.json`,
                    `/data/especies.json`,
                    `../data/especies.json`,
                    `../../data/especies.json`
                ];
                
                let dadosCarregados = false;
                for (const url of possiblePaths) {
                    try {
                        console.log('Tentando carregar espécies de:', url);
                        const response = await fetch(url);
                        if (response.ok) {
                            especiesData = await response.json();
                            dadosCarregados = true;
                            console.log('Espécies carregadas com sucesso de:', url);
                            break;
                        }
                    } catch (error) {
                        console.log('Falha ao carregar de:', url, error);
                        continue;
                    }
                }
                
                if (!dadosCarregados) {
                    throw new Error('Não foi possível carregar os dados das espécies');
                }
            }
            
            // Montar banco de busca para categorias
            montarBancoBuscaCategorias();
            
            // Processar parâmetros da URL
            const temFiltroURL = processarParametrosURL();
            
            // Renderizar inicialmente
            const termoInicial = document.getElementById('search-bar')?.value || '';
            renderizarEspecies(filtroAtual, termoInicial);
            
            // Configurar funcionalidades
            configurarFiltros();
            configurarBusca();
            configurarBotaoLimpar();
            
            console.log('Catálogo de espécies inicializado com sucesso!');
            console.log('Total de espécies:', Object.keys(especiesData).length);
            
        } catch (error) {
            console.error('Erro ao carregar espécies:', error);
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; width: 100%; color: #dc3545; background: #f8d7da; border-radius: 8px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
                        <p style="font-size: 1.1rem; margin-bottom: 10px;">Erro ao carregar as espécies</p>
                        <p style="font-size: 0.9rem; margin-bottom: 20px;">${error.message}</p>
                        
                        <div style="background: white; padding: 15px; border-radius: 6px; text-align: left; margin: 20px 0;">
                            <p style="font-weight: bold; margin-bottom: 10px; color: #333;">Soluções possíveis:</p>
                            <ul style="color: #666; padding-left: 20px;">
                                <li>Verifique se o arquivo especies.json existe</li>
                                <li>Confira o console para mais detalhes</li>
                                <li>Recarregue a página</li>
                            </ul>
                        </div>
                        
                        <button onclick="window.location.reload()" style="padding: 10px 25px; background: #416939; color: white; border: none; border-radius: 20px; font-weight: bold; cursor: pointer;">
                            <i class="fas fa-redo"></i> Tentar Novamente
                        </button>
                    </div>
                `;
            }
        }
    }

    function montarBancoBuscaCategorias() {
        bancoBuscaCategorias = [];
        
        Object.values(especiesData).forEach(especie => {
            if (especie.name) {
                const searchTerms = [normalizeText(especie.name)];
                
                // Adicionar nome popular
                if (especie.ficha?.['Nome popular']) {
                    const nomesPopulares = especie.ficha['Nome popular'].split(',').map(n => normalizeText(n.trim()));
                    searchTerms.push(...nomesPopulares);
                }
                
                // Adicionar família
                if (especie.ficha?.['Família']) {
                    searchTerms.push(normalizeText(especie.ficha['Família']));
                }
                
                bancoBuscaCategorias.push({
                    id: especie.id,
                    name: especie.name,
                    nomePopular: especie.ficha?.['Nome popular'] || '',
                    searchTerms: searchTerms
                });
            }
        });
        
        console.log(`Banco de busca de categorias montado: ${bancoBuscaCategorias.length} itens`);
    }

    // ===============================
    // INICIALIZAÇÃO
    // ===============================
    function inicializar() {
        // Verificar se estamos na página de categorias
        if (!window.location.pathname.includes('categorias.html')) {
            console.log('Não está na página de categorias, saindo...');
            return;
        }
        
        console.log('Inicializando catálogo de categorias...');
        
        // Configurar links do footer (se estiverem na mesma página)
        configurarFooterLinks();
        
        // Carregar dados
        carregarDados();
    }

    function configurarFooterLinks() {
        const footerLinks = document.querySelectorAll('.footer-links a[href*="categorias.html"]');
        
        footerLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Se já estamos na página de categorias
                if (window.location.pathname.includes('categorias.html')) {
                    e.preventDefault();
                    
                    const url = new URL(link.href);
                    const filtro = url.searchParams.get('filter');
                    
                    if (filtro) {
                        // Ativar filtro correspondente
                        const filterBtn = document.querySelector(`.filter-btn[data-filter="${filtro}"]`);
                        if (filterBtn) {
                            filterBtn.click();
                            
                            // Scroll suave para o topo do catálogo
                            const catalogoSection = document.getElementById('especies') || 
                                                    document.querySelector('.especies-section');
                            if (catalogoSection) {
                                catalogoSection.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'start' 
                                });
                            }
                        }
                    }
                }
                // Se não estiver na página de categorias, o link funcionará normalmente
            });
        });
    }

    // Iniciar
    inicializar();
});