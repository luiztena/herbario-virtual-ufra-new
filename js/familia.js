// familia.js - Script atualizado com suporte a subfamílias (Fabaceae) e redirecionamento para 404

// Obter ID da família da URL
const urlParams = new URLSearchParams(window.location.search);
const familiaId = urlParams.get('id');

// Verificar se é Fabaceae (família com subfamílias)
const FAMILIAS_COM_SUBFAMILIAS = ['fabaceae'];

// Função para redirecionar para página 404
function redirecionarPara404() {
    window.location.href = '../404.html';
}

// Carregar dados da família
async function carregarFamilia() {
    try {
        // Carregar familias.json
        const response = await fetch('../data/familias.json');
        const familias = await response.json();
        
        // Verificar se a família existe
        if (!familias || !familias[familiaId]) {
            redirecionarPara404();
            return;
        }
        
        const familia = familias[familiaId];
        
        // Preencher informações da família
        preencherFamilia(familia);
        
        // Verificar se família tem subfamílias
        if (FAMILIAS_COM_SUBFAMILIAS.includes(familiaId.toLowerCase())) {
            // Carregar subfamílias
            await carregarSubfamilias(familiaId);
        } else {
            // Carregar gêneros diretamente
            await carregarGeneros(familiaId);
        }
        
    } catch (error) {
        console.error('Erro ao carregar família:', error);
        // Em caso de erro no carregamento, redirecionar para 404
        redirecionarPara404();
    }
}

// Preencher informações da família na página
function preencherFamilia(familia) {
    // Nome
    const nomeElemento = document.getElementById('familia-nome');
    if (nomeElemento) {
        nomeElemento.textContent = familia.name;
        document.title = `${familia.name} - Herbário Virtual`;
    }
    
    // Descrição
    const descricaoEl = document.getElementById('familia-descricao');
    if (descricaoEl && familia.descricaoLonga && familia.descricaoLonga[0]) {
        descricaoEl.textContent = familia.descricaoLonga[0];
    }
    
    // Artigo (descrição longa)
    const artigoEl = document.getElementById('familia-artigo');
    if (artigoEl && familia.descricaoLonga) {
        artigoEl.innerHTML = ''; // Limpar conteúdo existente
        familia.descricaoLonga.forEach(paragrafo => {
            const p = document.createElement('p');
            p.textContent = paragrafo;
            artigoEl.appendChild(p);
        });
    }
    
    // Ficha botânica
    const fichaContainer = document.querySelector('.ficha-botanica ul');
    if (fichaContainer && familia.ficha) {
        fichaContainer.innerHTML = '';
        Object.entries(familia.ficha).forEach(([chave, valor]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${chave}:</strong> ${valor}`;
            fichaContainer.appendChild(li);
        });
    }
}

// Carregar subfamílias (apenas para Fabaceae)
async function carregarSubfamilias(familiaId) {
    try {
        const response = await fetch('../data/subfamilias.json');
        const subfamilias = await response.json();
        
        if (!subfamilias) {
            // Se não houver subfamílias, carregar gêneros diretamente
            await carregarGeneros(familiaId);
            return;
        }
        
        // Filtrar subfamílias desta família
        const subfamiliasDaFamilia = Object.values(subfamilias).filter(
            sub => sub.family && sub.family.toLowerCase() === familiaId.toLowerCase()
        );
        
        if (subfamiliasDaFamilia.length > 0) {
            exibirSubfamilias(subfamiliasDaFamilia);
        } else {
            // Se não houver subfamílias, carregar gêneros diretamente
            await carregarGeneros(familiaId);
        }
        
    } catch (error) {
        console.error('Erro ao carregar subfamílias:', error);
        // Em caso de erro, tentar carregar gêneros diretamente
        await carregarGeneros(familiaId);
    }
}

// Exibir cards das subfamílias
function exibirSubfamilias(subfamilias) {
    const section = document.getElementById('generos-section');
    
    if (!section) return;
    
    // Atualizar título da seção
    const titulo = section.querySelector('h3');
    if (titulo) {
        titulo.textContent = 'Subfamílias';
    } else {
        const novoTitulo = document.createElement('h3');
        novoTitulo.textContent = 'Subfamílias';
        section.insertBefore(novoTitulo, section.firstChild);
    }
    
    // Criar container se não existir
    let container = section.querySelector('.cards-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'cards-container';
        section.appendChild(container);
    }
    
    container.innerHTML = '';
    
    subfamilias.forEach(subfamilia => {
        const card = document.createElement('a');
        card.href = subfamilia.page || '#';
        card.className = 'card-link';
        
        card.innerHTML = `
            <div class="plant-card">
                <figure>
                    <img src="${subfamilia.image || '../imagens/site-imagem/placeholder.png'}" 
                         alt="${subfamilia.name}" 
                         class="plant-img">
                </figure>
                <div class="plant-info">
                    <h3 class="plant-name">${subfamilia.name}</h3>
                    ${subfamilia.descricaoLonga && subfamilia.descricaoLonga[0] ? 
                        `<p class="plant-description">${subfamilia.descricaoLonga[0].substring(0, 150)}${subfamilia.descricaoLonga[0].length > 150 ? '...' : ''}</p>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Carregar gêneros pertencentes a esta família
async function carregarGeneros(familiaId) {
    try {
        const response = await fetch('../data/generos.json');
        const todosGeneros = await response.json();
        
        if (!todosGeneros) {
            return;
        }
        
        // Filtrar gêneros que pertencem a esta família
        const generosDaFamilia = Object.values(todosGeneros).filter(
            genero => genero.family && genero.family.toLowerCase() === familiaId.toLowerCase()
        );
        
        exibirGeneros(generosDaFamilia);
        
    } catch (error) {
        console.error('Erro ao carregar gêneros:', error);
    }
}



// Exibir cards dos gêneros
function exibirGeneros(generos) {
    console.log("🎯 FUNÇÃO ATUALIZADA - VERSÃO CORRIGIDA!");
    
    const section = document.getElementById('generos-section');
    
    if (!section) return;
    
    // Se não houver gêneros, ocultar a seção
    if (!generos || generos.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    // Garantir que a seção está visível
    section.style.display = 'block';
    
    // Garantir que o título está correto
    const titulo = section.querySelector('h3');
    if (titulo) {
        titulo.textContent = 'Gêneros desta Família';
    } else {
        const novoTitulo = document.createElement('h3');
        novoTitulo.textContent = 'Gêneros desta Família';
        section.insertBefore(novoTitulo, section.firstChild);
    }
    
    // Criar container se não existir
    let container = section.querySelector('.cards-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'cards-container';
        section.appendChild(container);
    }
    
    container.innerHTML = '';
    
    generos.forEach(genero => {
        // ============================================
        // CORREÇÃO DO CAMINHO DA IMAGEM:
        // ============================================
        console.log("🔍 Processando gênero:", genero.name);
        console.log("🔍 Imagem original:", genero.image);
        
        let imagePath = genero.image || '';
        
        // Remove ../ se existir
        if (imagePath.startsWith('../')) {
            imagePath = imagePath.substring(3);
            console.log("🔍 Removeu ../ →", imagePath);
        }
        
        // Constrói o caminho final
        let finalImagePath;
        if (!imagePath) {
            finalImagePath = '../imagens/site-imagem/placeholder.png';
        } else if (imagePath.startsWith('/') || imagePath.startsWith('http')) {
            finalImagePath = imagePath;
        } else {
            // Adiciona ../ no início se não tiver
            finalImagePath = `../${imagePath}`;
        }
        
        console.log("✅ Caminho final:", finalImagePath);
        // ============================================
        
        const card = document.createElement('a');
        card.href = genero.page || '#';
        card.className = 'card-link';
        
        card.innerHTML = `
            <div class="plant-card">
                <figure>
                    <img src="${finalImagePath}" 
                         alt="${genero.name}" 
                         class="plant-img"
                         onerror="console.error('❌ Erro ao carregar:', this.src); this.src='../imagens/site-imagem/placeholder.png'">
                </figure>
                <div class="plant-info">
                    <h3 class="plant-name">${genero.name}</h3>
                    ${genero.descricaoLonga && genero.descricaoLonga[0] ? 
                        `<p class="plant-description">${genero.descricaoLonga[0].substring(0, 150)}${genero.descricaoLonga[0].length > 150 ? '...' : ''}</p>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    if (!familiaId) {
        redirecionarPara404();
        return;
    }
    
    // Verificar se é um ID válido (apenas letras, números e hífens)
    if (!/^[a-zA-Z0-9-]+$/.test(familiaId)) {
        redirecionarPara404();
        return;
    }
    
    carregarFamilia();
});

// Adicionar fallback para caso a página seja acessada sem parâmetros
if (!familiaId && window.location.pathname.includes('familia.html')) {
    redirecionarPara404();
}

