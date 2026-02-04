(function() {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'keydown' || type === 'click' || type === 'input') {
      const wrappedListener = function(event) {
        try {
          const result = listener.call(this, event);
          if (result && typeof result.then === 'function') {
            result.catch(error => {
              console.warn(`Promise rejeitada em listener ${type}:`, error);
            });
            return false;
          }
          return result;
        } catch (error) {
          console.error(`Erro em listener ${type}:`, error);
          return true;
        }
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
})();

// VARIÁVEIS GLOBAIS
let familias = null;
let subfamilias = null;
let generos = null;
let especies = null;
let bancoBusca = [];

// ===============================
// ACESSIBILIDADE
// ===============================
function criarLiveRegion() {
  if (document.getElementById('filter-announcer')) return;
  
  const announcer = document.createElement('div');
  announcer.id = 'filter-announcer';
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  document.body.appendChild(announcer);
}

function anunciarFiltro(mensagem) {
  const announcer = document.getElementById('filter-announcer');
  if (!announcer) return;
  announcer.textContent = '';
  setTimeout(() => announcer.textContent = mensagem, 100);
}

function atualizarAriaLabels() {
  const botoesFiltro = document.querySelectorAll(".filter-btn");
  const nomesFiltros = {
    'all': 'Todas as famílias',
    'monocotiledonia': 'Monocotiledôneas',
    'eudicodiledonia': 'Eudicotiledôneas',
    'bassais': 'Angiospermas Basais'
  };
  
  botoesFiltro.forEach(btn => {
    const filter = btn.getAttribute('data-filter');
    const isActive = btn.classList.contains('active');
    const nomeFiltro = nomesFiltros[filter] || filter;
    const estado = isActive ? ', ativado' : '';
    const label = `Botão de filtro: ${nomeFiltro}${estado}`;
    
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.setAttribute('title', label);
  });
}

// ===============================
// UTILITÁRIOS
// ===============================
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

function normalize(text) {
  if (!text) return '';
  return text.toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

function darkenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}

// ===============================
// CARREGAR DADOS
// ===============================
async function carregarFamilias() {
  try {
    const resposta = await fetch("data/familias.json");
    if (!resposta.ok) throw new Error("Erro ao carregar familias.json");
    familias = await resposta.json();
    Object.freeze(familias);
  } catch (erro) {
    console.error("Erro:", erro);
  }
}

async function carregarSubfamilias() {
  try {
    const resposta = await fetch("data/subfamilias.json");
    if (!resposta.ok) {
      subfamilias = {};
      return;
    }
    subfamilias = await resposta.json();
    Object.freeze(subfamilias);
  } catch (erro) {
    subfamilias = {};
  }
}

async function carregarGeneros() {
  try {
    const resposta = await fetch("data/generos.json");
    if (!resposta.ok) throw new Error("Erro ao carregar generos.json");
    generos = await resposta.json();
    Object.freeze(generos);
  } catch (erro) {
    console.error("Erro:", erro);
  }
}

async function carregarEspecies() {
  try {
    const basePath = getBasePath();
    const possiblePaths = [
      `${basePath}data/especies.json`,
      `data/especies.json`,
      `/data/especies.json`,
      `../data/especies.json`
    ];
    
    for (const url of possiblePaths) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          especies = await res.json();
          Object.freeze(especies);
          return;
        }
      } catch (e) {
        continue;
      }
    }
    especies = {};
  } catch (erro) {
    especies = {};
  }
}

async function carregarCards() {
  try {
    const basePath = getBasePath();
    const possiblePaths = [
      `${basePath}data/cards.html`,
      `data/cards.html`,
      `/data/cards.html`,
      `../data/cards.html`
    ];
    
    let html = null;
    for (const url of possiblePaths) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          html = await res.text();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!html) throw new Error("Erro ao carregar cards");
    
    html = html.replace(/href="\.\.\/html\//g, `href="${basePath}html/`);
    html = html.replace(/src="\s*imagens\//g, `src="${basePath}imagens/`);
    html = html.replace(/src="\s*\.\.\/imagens\//g, `src="${basePath}imagens/`);
    
    const container = document.getElementById("cards-container");
    if (container) {
      container.innerHTML = html;
      const links = container.querySelectorAll('a.card-link[href*="familia.html"], a.card-link[href*="genero.html"]');
      links.forEach(link => {
        const originalHref = link.getAttribute('href');
        if (originalHref.startsWith('../html/')) {
          link.setAttribute('href', `${basePath}html/${originalHref.substring(8)}`);
        } else if (originalHref.startsWith('/html/') && !originalHref.startsWith(basePath)) {
          link.setAttribute('href', `${basePath}html/${originalHref.substring(6)}`);
        } else if (originalHref.startsWith('html/') && !originalHref.startsWith(basePath)) {
          link.setAttribute('href', `${basePath}${originalHref}`);
        }
      });
      aplicarFiltros();
      atualizarAriaLabels();
    }
  } catch (e) {
    console.error("Erro ao carregar cards:", e);
  }
}

// ===============================
// BANCO DE BUSCA
// ===============================
function montarBancoBusca() {
  bancoBusca = [];
  const basePath = getBasePath();

  // Famílias
  if (familias) {
    Object.values(familias).forEach(f => {
      let familiaPage = f.page || `${basePath}html/familia.html?id=${f.id}`;
      if (familiaPage.startsWith('../')) familiaPage = familiaPage.replace('../', basePath);
      else if (!familiaPage.startsWith('/') && !familiaPage.startsWith('http')) familiaPage = `${basePath}${familiaPage}`;
      
      bancoBusca.push({
        id: f.id,
        name: f.name,
        key: normalize(f.id),
        tipo: "Família",
        page: familiaPage,
        searchTerms: [normalize(f.name), normalize(f.id)]
      });
    });
  }

  // Subfamílias
  if (subfamilias && Object.keys(subfamilias).length > 0) {
    Object.values(subfamilias).forEach(s => {
      let subfamiliaPage = s.page || `${basePath}html/subfamilia.html?id=${s.id}`;
      if (subfamiliaPage.startsWith('../')) subfamiliaPage = subfamiliaPage.replace('../', basePath);
      else if (!subfamiliaPage.startsWith('/') && !subfamiliaPage.startsWith('http')) subfamiliaPage = `${basePath}${subfamiliaPage}`;
      
      bancoBusca.push({
        id: s.id,
        name: s.name,
        key: normalize(s.id),
        tipo: "Subfamília",
        page: subfamiliaPage,
        searchTerms: [normalize(s.name), normalize(s.id)]
      });
    });
  }

  // Gêneros
  if (generos) {
    Object.values(generos).forEach(g => {
      bancoBusca.push({
        id: g.id,
        name: g.name,
        key: normalize(g.id),
        tipo: "Gênero",
        page: `${basePath}html/genero.html?id=${g.id}`,
        searchTerms: [normalize(g.name), normalize(g.id)]
      });
    });
  }

  // Espécies
  if (especies) {
    Object.values(especies).forEach(e => {
      let especiePage = e.page || `${basePath}html/especie.html?id=${e.id}`;
      if (especiePage.startsWith('../')) especiePage = especiePage.replace('../', basePath);
      else if (!especiePage.startsWith('/') && !especiePage.startsWith('http')) especiePage = `${basePath}${especiePage}`;
      
      let nomePopular = '';
      if (e.ficha && e.ficha['Nome popular']) nomePopular = e.ficha['Nome popular'];
      
      const searchTerms = [normalize(e.name), normalize(e.id)];
      if (nomePopular && nomePopular !== 'Desconhecido') {
        nomePopular.split(',').map(n => n.trim()).forEach(nome => {
          if (nome) searchTerms.push(normalize(nome));
        });
      }
      
      bancoBusca.push({
        id: e.id,
        name: e.name,
        nomePopular: nomePopular,
        key: normalize(e.id),
        tipo: "Espécie",
        page: especiePage,
        searchTerms: searchTerms
      });
    });
  }
}

// ===============================
// BUSCA
// ===============================
function searchPlant() {
  const input = document.getElementById("search-bar");
  const didYouMean = document.getElementById("did-you-mean");
  const autocomplete = document.getElementById("autocomplete-list");

  if (!input || !didYouMean || !autocomplete) return;
  didYouMean.innerHTML = "";
  autocomplete.innerHTML = "";

  const query = normalize(input.value);
  if (!query) return;

  // Busca exata
  const exato = bancoBusca.find(item => {
    if (item.searchTerms) return item.searchTerms.some(term => term === query);
    return item.key === query;
  });

  if (exato) {
    window.location.href = exato.page;
    return;
  }

  // Busca aproximada
  const melhor = fuzzySearch(query);
  if (melhor) {
    const badgeColor = getBadgeColor(melhor.tipo);
    const badgeStyle = `
      background-color: ${badgeColor};
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: 10px;
    `;
    
    let displayName = melhor.name;
    if (melhor.tipo === 'Espécie' && melhor.nomePopular && melhor.nomePopular !== 'Desconhecido') {
      displayName = `${melhor.name} (${melhor.nomePopular})`;
    }
    
    didYouMean.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>Você quis dizer</span>
        <div style="display: flex; align-items: center; gap: 6px; background: #f5f7f2; padding: 8px 12px; border-radius: 8px; border: 1px solid #ddd;">
          <span id="vqd" class="suggestion-text">${displayName}</span>
          <span style="${badgeStyle}">${melhor.tipo}</span>
        </div>
        <span>?</span>
      </div>
      <div style="text-align: center; margin-top: 10px; font-size: 0.9rem; color: #666;">
        Clique no nome para acessar
      </div>
    `;

    const vqdElement = document.getElementById("vqd");
    vqdElement.onclick = () => window.location.href = melhor.page;
    vqdElement.style.cursor = "pointer";
    vqdElement.style.color = badgeColor;
    vqdElement.style.fontWeight = "600";
    vqdElement.style.transition = "color 0.2s ease";
    
    vqdElement.addEventListener("mouseover", () => {
      vqdElement.style.color = darkenColor(badgeColor, 20);
      vqdElement.style.textDecoration = "underline";
    });
    
    vqdElement.addEventListener("mouseout", () => {
      vqdElement.style.color = badgeColor;
      vqdElement.style.textDecoration = "none";
    });
    return;
  }

  // Não encontrado
  didYouMean.innerHTML = `
    <div style="text-align: center; padding: 15px;">
      <div style="color: #666; margin-bottom: 10px;">
        Não foi possível encontrar o que você procura.
      </div>
      <span id="again" style="cursor: pointer; color: #416939; font-weight: 600; text-decoration: underline; padding: 8px 16px; border: 1px solid #416939; border-radius: 20px; display: inline-block; transition: all 0.3s ease;">
        Tentar novamente
      </span>
    </div>
  `;

  document.getElementById("again").onclick = () => {
    input.value = "";
    input.focus();
    didYouMean.innerHTML = "";
  };
  
  const againElement = document.getElementById("again");
  againElement.addEventListener("mouseover", () => {
    againElement.style.backgroundColor = "#416939";
    againElement.style.color = "white";
  });
  
  againElement.addEventListener("mouseout", () => {
    againElement.style.backgroundColor = "transparent";
    againElement.style.color = "#416939";
  });
}

function getBadgeColor(tipo) {
  const colors = {
    'Família': '#416939',
    'Subfamília': '#5a7c4a',
    'Gênero': '#52796f',
    'Espécie': '#8a5a44'
  };
  return colors[tipo] || '#666';
}

// ===============================
// LEVENSHTEIN
// ===============================
function levenshteinDistance(a, b) {
  const m = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) m[i][0] = i;
  for (let j = 0; j <= b.length; j++) m[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = a[i - 1] === b[j - 1]
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[a.length][b.length];
}

function fuzzySearch(query) {
  let best = null;
  let score = Infinity;

  bancoBusca.forEach(item => {
    if (item.searchTerms) {
      item.searchTerms.forEach(term => {
        const d = levenshteinDistance(query, term);
        if (d < score) {
          score = d;
          best = item;
        }
      });
    } else {
      const d = levenshteinDistance(query, item.key);
      if (d < score) {
        score = d;
        best = item;
      }
    }
  });
  return score <= 3 ? best : null;
}

// ===============================
// AUTOCOMPLETE
// ===============================
function atualizarAutocomplete() {
  const searchInput = document.getElementById("search-bar");
  const autocomplete = document.getElementById("autocomplete-list");
  
  if (!searchInput || !autocomplete) return;
  const value = normalize(searchInput.value);
  autocomplete.innerHTML = "";
  if (!value) return;

  const resultados = bancoBusca.filter(item => {
    if (item.searchTerms) return item.searchTerms.some(term => term.includes(value));
    return item.key.includes(value);
  }).slice(0, 8);

  resultados.forEach(item => {
    const li = document.createElement("li");
    const badgeColor = getBadgeColor(item.tipo);
    
    let subtitle = '';
    if (item.tipo === 'Espécie' && item.nomePopular && item.nomePopular !== 'Desconhecido') {
      subtitle = `<div style="font-size: 0.85rem; color: #666; font-style: italic; margin-top: 2px;">${item.nomePopular}</div>`;
    }
    
    li.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div style="flex: 1;">
          <div style="font-weight: 500; color: #333;">${item.name}</div>
          ${subtitle}
        </div>
        <span style="background-color: ${badgeColor}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; min-width: 70px; text-align: center;">
          ${item.tipo}
        </span>
      </div>
    `;
    
    li.style.cursor = "pointer";
    li.style.padding = "10px 12px";
    li.style.borderBottom = "1px solid #e0e0e0";
    li.style.transition = "all 0.2s ease";
    
    li.addEventListener("mouseover", () => {
      li.style.backgroundColor = "#f5f7f2";
      li.style.transform = "translateX(5px)";
    });
    
    li.addEventListener("mouseout", () => {
      li.style.backgroundColor = "";
      li.style.transform = "";
    });
    
    li.onclick = () => window.location.href = item.page;
    autocomplete.appendChild(li);
  });
}

// ===============================
// FILTROS
// ===============================
function aplicarFiltros() {
  const botoesFiltro = document.querySelectorAll(".filter-btn");
  const nomesFiltros = {
    'all': 'Todas as famílias',
    'monocotiledonia': 'Monocotiledôneas',
    'eudicodiledonia': 'Eudicotiledôneas',
    'bassais': 'Angiospermas Basais'
  };
  
  botoesFiltro.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      const nomeFiltro = nomesFiltros[filter] || filter;
      
      botoesFiltro.forEach(b => {
        b.classList.remove("active");
        b.setAttribute('aria-pressed', 'false');
      });
      
      btn.classList.add("active");
      btn.setAttribute('aria-pressed', 'true');
      atualizarAriaLabels();
      
      const totalCards = document.querySelectorAll(".card-link").length;
      let cardsVisiveis = 0;
      const cards = document.querySelectorAll(".card-link");
      
      cards.forEach(link => {
        const card = link.querySelector(".plant-card");
        if (!card) return;
        
        if (filter === "all" || card.classList.contains(filter)) {
          link.style.display = "block";
          cardsVisiveis++;
        } else {
          link.style.display = "none";
        }
      });
      
      anunciarFiltro(`Filtro ${nomeFiltro} ativado. Mostrando ${cardsVisiveis} de ${totalCards} plantas.`);
    });
    
    // Navegação por teclado
    btn.addEventListener("keydown", (e) => {
      let targetIndex = index;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        targetIndex = (index + 1) % botoesFiltro.length;
        botoesFiltro[targetIndex].focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        targetIndex = (index - 1 + botoesFiltro.length) % botoesFiltro.length;
        botoesFiltro[targetIndex].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        botoesFiltro[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        botoesFiltro[botoesFiltro.length - 1].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🌿 Herbário Virtual - Iniciando...");
  
  try {
    criarLiveRegion();
    await Promise.all([
      carregarFamilias(),
      carregarSubfamilias(),
      carregarGeneros(),
      carregarEspecies()
    ]);
    montarBancoBusca();
    await carregarCards();
    
    // Configurar eventos
    const searchInput = document.getElementById("search-bar");
    const searchBtn = document.getElementById("search-btn");
    
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        searchPlant();
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          searchPlant();
        } else if (e.key === "Escape") {
          const autocomplete = document.getElementById("autocomplete-list");
          const didYouMean = document.getElementById("did-you-mean");
          if (autocomplete) autocomplete.innerHTML = "";
          if (didYouMean) didYouMean.innerHTML = "";
          searchInput.blur();
        }
      });
      
      let timeoutId;
      searchInput.addEventListener("input", () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(atualizarAutocomplete, 150);
      });
      
      searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim()) atualizarAutocomplete();
      });
    }
    
    document.addEventListener("click", (e) => {
      const searchInput = document.getElementById("search-bar");
      const autocomplete = document.getElementById("autocomplete-list");
      if (!searchInput || !autocomplete) return;
      if (!searchInput.contains(e.target) && !autocomplete.contains(e.target)) {
        autocomplete.innerHTML = "";
      }
    }, true);
    
  } catch (erro) {
    console.error("Erro na inicialização:", erro);
  }
});

// ===============================
// MANIPULADORES DE ERROS
// ===============================
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Promise não tratada:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.warn('Erro global:', event.error);
  return true;
});