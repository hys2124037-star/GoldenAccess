/* GoldenAccess — page outil : tableaux par plan */
(function () {
  'use strict';
  const esc = GAUI.esc;
  const root = document.getElementById('tool-page');
  // Slug depuis ?outil=… (ou #… en repli, pour des liens partagés sans paramètre)
  const slug = new URLSearchParams(location.search).get('outil') ||
    decodeURIComponent(location.hash.replace(/^#/, '')) || (window.GA_TOOL_SLUG || '');
  const tool = GA.findTool(slug);

  if (!tool) {
    document.title = 'Outil introuvable — GoldenAccess';
    root.innerHTML = '<div class="empty-state" style="padding:5rem 1rem"><i class="fa-regular fa-face-frown"></i>' +
      '<h1 style="font-size:1.6rem;margin:.5rem 0">Outil introuvable</h1>' +
      '<p>Cet outil n\'existe pas ou n\'est plus disponible.</p>' +
      '<a href="index.html" class="btn btn-gold"><i class="fa-solid fa-arrow-left"></i> Retour à tous les outils</a></div>';
    return;
  }

  const toolHasOutOfStock = !!(tool.notes && /rupture/i.test(tool.notes));

  // ---- SEO ----
  document.title = tool.name + ' — Plans, durées et prix en Ariary | GoldenAccess';
  const meta = document.getElementById('meta-description');
  meta.content = tool.name + ' (' + tool.category + ') en abonnement 100% privé chez GoldenAccess : ' +
    tool.plans.map(function (p) { return p.name; }).join(', ') + '. À partir de ' + GA.formatAr(tool.minPrice) + '. Livraison en 1h à 24h.';

  // ---- Tableau d'un plan : « Abonnement » + une colonne par durée ----
  function planTableHtml(plan) {
    const bestPrice = Math.min.apply(null, plan.cells.map(function (c) { return c.price; }));
    const bestCell = tool.best.plan === plan.name ? plan.cells.find(function (c) { return c.duration.key === tool.best.duration.key && c.price === tool.best.price; }) : null;

    let head = '<tr><th scope="col">Abonnement</th>';
    plan.cells.forEach(function (c) { head += '<th scope="col">' + esc(c.duration.label) + '</th>'; });
    head += '</tr>';

    let row = '<tr><td class="sub-name">' + esc(tool.name) + ' — ' + esc(plan.name) + '<small>' + plan.cells.length + (plan.cells.length > 1 ? ' durées disponibles' : ' durée disponible') + '</small></td>';
    plan.cells.forEach(function (c) {
      const noteTag = c.notes && /rupture/i.test(c.notes) ? '<span class="out-of-stock-tag"><i class="fa-solid fa-circle-exclamation"></i> ' + esc(c.notes) + '</span>' : '';
      row += '<td class="price' + (c === bestCell ? ' best' : '') + '">' + GA.formatAr(c.price) +
        (c === bestCell ? '<span class="best-tag"><i class="fa-solid fa-star"></i> Offre avantageuse</span>' : '') +
        (noteTag ? noteTag : '') + '</td>';
    });
    row += '</tr>';

    // Version mobile : liste durée → prix
    let list = '<div class="plan-list-sub">Abonnement : <strong>' + esc(tool.name) + ' — ' + esc(plan.name) + '</strong></div><ul class="plan-list">';
    plan.cells.forEach(function (c) {
      const noteTag = c.notes && /rupture/i.test(c.notes) ? '<span class="out-of-stock-tag"><i class="fa-solid fa-circle-exclamation"></i> ' + esc(c.notes) + '</span>' : '';
      list += '<li><span class="dur"><i class="fa-regular fa-clock" style="color:var(--gold);margin-right:.4rem"></i>' + esc(c.duration.label) + '</span>' +
        '<span class="price">' + GA.formatAr(c.price) + (c === bestCell ? '<span class="best-tag">★ Avantageux</span>' : '') + (noteTag ? noteTag : '') + '</span></li>';
    });
    list += '</ul>';

    return '<section class="plan-block" id="plan-' + GA.slugify(plan.name) + '">' +
      '<div class="plan-block-head"><h3>Plan ' + esc(plan.name) + '</h3><span class="tag">À partir de ' + GA.formatAr(bestPrice) + '</span></div>' +
      '<table class="plan-table"><thead>' + head + '</thead><tbody>' + row + '</tbody></table>' +
      '<div class="plan-list-wrap">' + list + '</div>' +
    '</section>';
  }

  const fbHref = GA.FACEBOOK_URL;
  const durationsAll = Array.from(new Set(tool.offers.map(function (o) { return o.duration.label; })));

  root.innerHTML =
    '<section class="tool-hero" id="tool-hero">' +
      '<nav class="breadcrumb" aria-label="Fil d\'Ariane"><a href="index.html">Outils</a> <i class="fa-solid fa-chevron-right" style="font-size:.7rem"></i> ' +
        '<a href="index.html?cat=' + encodeURIComponent(tool.category) + '">' + esc(tool.category) + '</a> <i class="fa-solid fa-chevron-right" style="font-size:.7rem"></i> <span>' + esc(tool.name) + '</span></nav>' +
      '<div class="tool-hero-card">' + GAUI.logoHtml(tool) +
        '<div class="tool-hero-info"><div class="tool-category">' + esc(tool.category) + '</div><h1>' + esc(tool.name) + '</h1>' +
          '<div class="tool-hero-tags"><span class="badge-private"><i class="fa-solid fa-lock"></i> 100% Privée</span>' +
          (toolHasOutOfStock ? '<span class="badge-out-of-stock"><i class="fa-solid fa-circle-exclamation"></i> ' + esc(tool.notes) + '</span>' : '') +
          '<span class="tag"><i class="fa-solid fa-layer-group"></i> ' + tool.plans.length + (tool.plans.length > 1 ? ' plans' : ' plan') + '</span>' +
          '<span class="tag"><i class="fa-regular fa-clock"></i> ' + durationsAll.join(' · ') + '</span>' +
          '<span class="tag"><i class="fa-solid fa-bolt"></i> Livraison 1h à 24h</span></div></div>' +
        '<div class="tool-hero-actions"><a href="' + fbHref + '" target="_blank" rel="noopener" class="btn btn-fb"><i class="fa-brands fa-facebook"></i> Commander via Facebook</a>' +
          '<span style="text-align:center;font-size:.85rem;color:var(--muted)">À partir de <strong style="color:var(--gold-dark)">' + GA.formatAr(tool.minPrice) + '</strong></span></div>' +
      '</div>' +
    '</section>' +
    '<section class="plans-section" id="plans-section">' +
      '<h2>Plans et tarifs</h2>' +
      '<p class="plans-intro">Un tableau par plan : la première colonne indique l\'abonnement, puis une colonne par durée disponible avec son prix en Ariary.</p>' +
      tool.plans.map(planTableHtml).join('') +
    '</section>' +
    '<section class="order-box" id="order-section">' +
      '<div><h2><i class="fa-solid fa-hand-holding-dollar" style="color:var(--gold-dark)"></i> Paiement &amp; commande</h2>' +
        '<p>Contactez la page Facebook <strong>GoldenAccess</strong> pour vérifier la disponibilité de ' + esc(tool.name) + '. Envoyez simplement :</p>' +
        '<ul><li>le nom de l\'outil : <strong>' + esc(tool.name) + '</strong></li><li>le plan d\'abonnement souhaité</li><li>la durée souhaitée</li></ul>' +
        '<p style="margin-top:.6rem">…ou envoyez une <strong>capture d\'écran</strong> du tableau ci-dessus. Livraison environ <strong>1h à 24h</strong> après contact.</p></div>' +
      '<div style="display:flex;flex-direction:column;gap:.6rem"><a href="' + fbHref + '" target="_blank" rel="noopener" class="btn btn-fb"><i class="fa-brands fa-facebook"></i> Commander via Facebook</a>' +
        '<a href="paiement.html" class="btn btn-outline"><i class="fa-solid fa-circle-info"></i> Infos paiement</a></div>' +
    '</section>' +
    '<a href="index.html" class="back-link"><i class="fa-solid fa-arrow-left"></i> Retour à tous les outils</a>';

  GAUI.bindLogoFallbacks(root);
})();
