(function () {
  'use strict';

  var REVIEWS_URL = '/assets/reviews.json';
  var PER_PAGE = 6;
  var HOME_PICKS = [17, 4, 6];

  /* ── Inietta CSS del componente una sola volta ───────────────── */
  function injectCSS() {
    if (document.getElementById('tpw-css')) return;
    var el = document.createElement('style');
    el.id = 'tpw-css';
    el.textContent =
      /* shell home */
      '.tp-home-shell{background:#E4F5EC!important;border-radius:20px!important;' +
      'padding:1.5rem 1.25rem 1.75rem!important;margin-top:1.5rem!important;}' +
      /* grids */
      '.tpw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:1rem;}' +
      '.tpw-grid-full{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:1.1rem;}' +
      /* card */
      '.tpw-card{background:#ffffff;border:1.5px solid #b8d9c8;border-top:3px solid #00B67A;' +
      'border-radius:12px;padding:1rem 1.25rem .95rem;display:flex;flex-direction:column;' +
      'box-shadow:0 2px 12px rgba(0,0,0,.09),0 1px 4px rgba(0,0,0,.05);' +
      'transition:transform .2s,box-shadow .2s;}' +
      '.tpw-card:hover{transform:translateY(-3px);box-shadow:0 7px 24px rgba(0,0,0,.13);}' +
      /* head: stelle + badge su una riga */
      '.tpw-head{display:flex;align-items:center;gap:6px;margin-bottom:8px;}' +
      '.tpw-stars{display:flex;gap:3px;flex-shrink:0;}' +
      '.tpw-star{display:inline-block;width:15px;height:15px;background:#DCDCE6;' +
      'clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);}' +
      '.tpw-star.on{background:#00B67A;}' +
      '.tpw-badge{font-size:11px;font-weight:600;color:#146B3E;opacity:.75;white-space:nowrap;}' +
      /* citazione */
      '.tpw-text{font-size:.88rem;line-height:1.6;color:#18212E;font-style:italic;' +
      'margin:0 0 .6rem;flex-grow:1;padding-left:1rem;position:relative;}' +
      '.tpw-text::before{content:"“";position:absolute;left:0;top:-.05rem;' +
      'font-size:1.45rem;line-height:1;color:#00B67A;font-style:normal;font-weight:800;}' +
      /* testo espanso */
      '.tpw-full{font-size:.85rem;line-height:1.62;color:#18212E;font-style:italic;' +
      'margin:0 0 .4rem;padding-left:1rem;}' +
      '.tpw-toggle{background:none;border:none;padding:0 0 .4rem 1rem;font-size:.75rem;' +
      'color:#22A05A;cursor:pointer;text-decoration:underline;text-align:left;' +
      'font-family:inherit;display:block;line-height:1.4;}' +
      '.tpw-toggle:hover{color:#146B3E;}' +
      /* footer nome + data */
      '.tpw-footer{display:flex;justify-content:space-between;align-items:center;' +
      'border-top:1px solid #C4E0CE;padding-top:.5rem;margin-top:auto;gap:.5rem;}' +
      '.tpw-name{font-weight:700;font-size:.8rem;color:#18212E;white-space:nowrap;' +
      'overflow:hidden;text-overflow:ellipsis;}' +
      '.tpw-date{font-size:.7rem;color:#4B5568;white-space:nowrap;flex-shrink:0;}' +
      /* link storia completa */
      '.tpw-link{display:inline-block;margin-top:.55rem;font-size:.78rem;font-weight:700;' +
      'color:#146B3E;text-decoration:none;border-bottom:1.5px solid #6DD09C;line-height:1.5;}' +
      '.tpw-link:hover{color:#16A34A;border-color:#16A34A;}';
    document.head.appendChild(el);
  }

  /* ── Helper: 5 stelle ────────────────────────────────────────── */
  function renderStars(n) {
    var h = '<div class="tpw-stars" role="img" aria-label="' + n + ' stelle su 5">';
    for (var i = 1; i <= 5; i++) {
      h += '<span class="tpw-star' + (i <= n ? ' on' : '') + '"></span>';
    }
    return h + '</div>';
  }

  /* ── Helper: data in italiano ────────────────────────────────── */
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  }

  /* ── Helper: escape HTML ─────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Costruisce HTML della singola card ──────────────────────── */
  function buildCard(r, compact) {
    var hasMore = !compact
      && r.full_text
      && r.full_text.trim() !== r.excerpt.trim()
      && r.full_text.length > r.excerpt.length + 30;

    return (
      '<article class="tpw-card" itemscope itemtype="https://schema.org/Review">' +
        '<div class="tpw-head">' +
          renderStars(r.rating) +
          '<span class="tpw-badge">&#10003; Verificata</span>' +
        '</div>' +
        '<p class="tpw-text" itemprop="reviewBody">' + esc(r.excerpt) + '</p>' +
        (hasMore
          ? '<p class="tpw-full" hidden>' + esc(r.full_text) + '</p>' +
            '<button class="tpw-toggle" aria-expanded="false">Leggi tutto</button>'
          : '') +
        '<footer class="tpw-footer">' +
          '<span class="tpw-name" itemprop="author" itemscope itemtype="https://schema.org/Person">' +
            '<span itemprop="name">' + esc(r.name) + '</span>' +
          '</span>' +
          '<time class="tpw-date" datetime="' + esc(r.date) + '">' + fmtDate(r.date) + '</time>' +
        '</footer>' +
        (r.url
          ? '<a class="tpw-link" href="' + r.url + '">Leggi la storia completa &#8594;</a>'
          : '') +
      '</article>'
    );
  }

  /* ── Bind espandi/chiudi ─────────────────────────────────────── */
  function bindToggles(container) {
    container.querySelectorAll('.tpw-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card  = btn.closest('.tpw-card');
        var text  = card.querySelector('.tpw-text');
        var full  = card.querySelector('.tpw-full');
        var open  = btn.getAttribute('aria-expanded') === 'true';
        text.hidden = !open;
        full.hidden =  open;
        btn.setAttribute('aria-expanded', String(!open));
        btn.textContent = open ? 'Leggi tutto' : 'Chiudi';
      });
    });
  }

  /* ── Home: 3 card scelte ─────────────────────────────────────── */
  function initHome(reviews) {
    var grid = document.getElementById('tp-home-cards');
    if (!grid) return;
    grid.className = 'tpw-grid';
    var picks = HOME_PICKS.map(function (i) { return reviews[i]; }).filter(Boolean);
    grid.innerHTML = picks.map(function (r) { return buildCard(r, true); }).join('');
  }

  /* ── Testimonianze: grid completa con filtro ─────────────────── */
  function initFull(reviews) {
    var grid      = document.getElementById('tp-full-grid');
    var filterEl  = document.getElementById('filter-tp');
    var loadMore  = document.getElementById('tp-load-more');
    if (!grid) return;

    grid.className = 'tpw-grid-full';

    var filtered = reviews.slice();
    var page = 0;

    function render() {
      var end = (page + 1) * PER_PAGE;
      grid.innerHTML = filtered.slice(0, end).map(function (r) { return buildCard(r, false); }).join('');
      bindToggles(grid);
      if (loadMore) loadMore.style.display = end >= filtered.length ? 'none' : '';
    }

    if (filterEl) {
      filterEl.addEventListener('change', function () {
        page = 0;
        var val = this.value;
        filtered = val === 'all'
          ? reviews.slice()
          : reviews.filter(function (r) { return r.date.slice(0, 4) === val; });
        render();
      });
    }

    if (loadMore) {
      loadMore.addEventListener('click', function () { page++; render(); });
    }

    render();
  }

  /* ── Bootstrap ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    injectCSS();
    fetch(REVIEWS_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var reviews = (data && data.reviews) || [];
        initHome(reviews);
        initFull(reviews);
      })
      .catch(function () { /* fallback silenzioso */ });
  });

}());
