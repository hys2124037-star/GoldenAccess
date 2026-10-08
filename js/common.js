/* GoldenAccess — helpers partagés (logo, échappement HTML, footer) */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** HTML du logo : image officielle (favicon) avec repli sur initiale colorée. */
  function logoHtml(tool) {
    const initial = esc(tool.name.trim().charAt(0).toUpperCase());
    if (tool.logo) {
      return '<span class="tool-logo" data-initial="' + initial + '" data-color="' + tool.color + '">' +
        '<img src="' + tool.logo + '" alt="Logo ' + esc(tool.name) + '" loading="lazy" width="36" height="36"></span>';
    }
    return '<span class="tool-logo fallback" style="background:' + tool.color + '">' + initial + '</span>';
  }

  /** Remplace l'image par une initiale colorée si le favicon ne charge pas (ou est le globe générique 16px). */
  function bindLogoFallbacks(root) {
    (root || document).querySelectorAll('.tool-logo img').forEach(function (img) {
      const wrap = img.parentElement;
      const fail = function () {
        wrap.classList.add('fallback');
        wrap.style.background = wrap.dataset.color;
        wrap.textContent = wrap.dataset.initial;
      };
      img.addEventListener('error', fail);
      img.addEventListener('load', function () {
        // Le service renvoie un globe 16x16 quand le domaine n'a pas d'icône
        if (img.naturalWidth <= 16) fail();
      });
      if (img.complete && img.naturalWidth > 0 && img.naturalWidth <= 16) fail();
    });
  }

  function renderFooterCategories() {
    const ul = document.getElementById('footer-categories');
    if (!ul || !global.GA) return;
    const counts = {};
    GA.tools.forEach(function (t) { counts[t.category] = (counts[t.category] || 0) + 1; });
    const top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 6);
    ul.innerHTML = top.map(function (c) {
      return '<li><a href="index.html?cat=' + encodeURIComponent(c) + '">' + esc(c) + '</a></li>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
    const headerSearch = document.getElementById('header-search');
    const searchTerm = new URLSearchParams(window.location.search).get('q');
    if (headerSearch && searchTerm) headerSearch.value = searchTerm;
    renderFooterCategories();
  });

  global.GAUI = { esc: esc, logoHtml: logoHtml, bindLogoFallbacks: bindLogoFallbacks };
})(window);
