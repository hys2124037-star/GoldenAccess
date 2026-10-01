/* GoldenAccess — page d'accueil : recherche, filtres, grille */
(function () {
  'use strict';
  const esc = GAUI.esc;

  const grid = document.getElementById('tools-grid');
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  const filters = document.getElementById('category-filters');
  const countEl = document.getElementById('results-count');
  const sortEl = document.getElementById('sort-select');
  const heroCount = document.getElementById('hero-tool-count');

  heroCount.textContent = GA.tools.length + '+';

  // État lu depuis l'URL (partageable, historique fonctionnel)
  const state = { q: '', cat: '', sort: 'name' };
  function readUrl() {
    const p = new URLSearchParams(location.search);
    state.q = p.get('q') || '';
    state.cat = p.get('cat') || '';
    state.sort = p.get('sort') || 'name';
  }
  function writeUrl(replace) {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.cat) p.set('cat', state.cat);
    if (state.sort !== 'name') p.set('sort', state.sort);
    const url = location.pathname + (p.toString() ? '?' + p.toString() : '') + (location.hash || '');
    if (replace) history.replaceState(null, '', url); else history.pushState(null, '', url);
  }

  function normalize(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // ---- Filtres catégories ----
  const catCounts = {};
  GA.tools.forEach(function (t) { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });

  function renderFilters() {
    let html = '<button type="button" class="chip' + (!state.cat ? ' active' : '') + '" data-cat="">Toutes <span class="count">' + GA.tools.length + '</span></button>';
    GA.categories.forEach(function (c) {
      html += '<button type="button" class="chip' + (state.cat === c ? ' active' : '') + '" data-cat="' + esc(c) + '">' +
        esc(c) + ' <span class="count">' + catCounts[c] + '</span></button>';
    });
    filters.innerHTML = html;
  }

  filters.addEventListener('click', function (e) {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.cat = btn.dataset.cat;
    renderFilters();
    render();
    writeUrl(false);
  });

  // ---- Recherche ----
  let timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.q = input.value.trim();
      render();
      writeUrl(true);
    }, 120);
  });
  clearBtn.addEventListener('click', function () {
    input.value = '';
    state.q = '';
    render();
    writeUrl(true);
    input.focus();
  });
  sortEl.addEventListener('change', function () {
    state.sort = sortEl.value;
    render();
    writeUrl(true);
  });

  window.addEventListener('popstate', function () {
    readUrl();
    input.value = state.q;
    sortEl.value = state.sort;
    renderFilters();
    render();
  });

  // ---- Carte outil ----
  function cardHtml(t) {
    const best = t.best;
    const outOfStock = t.notes && t.notes.toLowerCase().includes('rupture');
    return '<article class="tool-card" id="tool-' + t.slug + '">' +
      '<div class="tool-card-head">' + GAUI.logoHtml(t) +
        '<div class="tool-meta"><div class="tool-category">' + esc(t.category) + '</div>' +
        '<h3 class="tool-name">' + esc(t.name) + '</h3></div></div>' +
      '<span class="badge-private"><i class="fa-solid fa-lock"></i> 100% Privée</span>' +
      (outOfStock ? '<span class="badge-out-of-stock"><i class="fa-solid fa-circle-exclamation"></i> ' + esc(t.notes) + '</span>' : '') +
      '<div class="tool-offer">' +
        '<div class="tool-offer-label">Offre avantageuse</div>' +
        '<div class="tool-offer-price">' + GA.formatAr(best.price) + '</div>' +
        '<div class="tool-offer-duration">' + esc(best.plan) + ' · <strong>' + esc(best.duration.label) + '</strong></div>' +
      '</div>' +
      '<a href="outil.html?outil=' + t.slug + '" class="btn btn-gold btn-block">Voir tous les plans <i class="fa-solid fa-arrow-right"></i></a>' +
      '<div class="tool-plans-count">' + t.plans.length + (t.plans.length > 1 ? ' plans' : ' plan') + ' · ' + t.offerCount + (t.offerCount > 1 ? ' offres' : ' offre') + '</div>' +
    '</article>';
  }

  function render() {
    const q = normalize(state.q);
    let list = GA.tools.filter(function (t) {
      if (state.cat && t.category !== state.cat) return false;
      if (!q) return true;
      return normalize(t.name).includes(q) ||
        normalize(t.category).includes(q) ||
        t.plans.some(function (p) { return normalize(p.name).includes(q); });
    });

    list = list.slice().sort(function (a, b) {
      switch (state.sort) {
        case 'price-asc': return a.best.price - b.best.price || a.name.localeCompare(b.name, 'fr');
        case 'price-desc': return b.best.price - a.best.price || a.name.localeCompare(b.name, 'fr');
        case 'category': return a.category.localeCompare(b.category, 'fr') || a.name.localeCompare(b.name, 'fr');
        default: return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
      }
    });

    clearBtn.classList.toggle('show', !!state.q);

    const n = list.length;
    countEl.innerHTML = n === 0 ? 'Aucun outil trouvé' :
      '<strong>' + n + '</strong> outil' + (n > 1 ? 's' : '') + ' trouvé' + (n > 1 ? 's' : '') +
      (state.cat ? ' dans <strong>' + esc(state.cat) + '</strong>' : '') +
      (state.q ? ' pour « <strong>' + esc(state.q) + '</strong> »' : '');

    if (n === 0) {
      grid.innerHTML = '<div class="empty-state"><i class="fa-regular fa-face-frown"></i><p>Aucun outil ne correspond à votre recherche.<br>Essayez un autre mot-clé ou <a href="index.html">réinitialisez les filtres</a>.</p>' +
        '<p>Vous ne trouvez pas votre outil ? <a href="' + GA.FACEBOOK_URL + '" target="_blank" rel="noopener">Demandez-le sur Facebook</a>.</p></div>';
      return;
    }
    grid.innerHTML = list.map(cardHtml).join('');
    GAUI.bindLogoFallbacks(grid);
  }

  // Init
  readUrl();
  input.value = state.q;
  sortEl.value = state.sort;
  renderFilters();
  render();
})();
