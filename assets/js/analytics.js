/*
 * Misurazione GA4 centralizzata di dimagrimentolento.it.
 * Dizionario eventi e configurazione lato GA4: vedi README, sezione "Analytics".
 * Debug: aprire una pagina con ?dl_debug=1 (log in console + DebugView di GA4).
 */
(function () {
  'use strict';

  var CONFIG = {
    measurementId: 'G-77WRRK3HT4',
    // 'basic'    → GA4 parte solo dopo il consenso "tracking" del banner cookie.
    // 'advanced' → GA4 parte subito senza cookie (ping anonimi) e li attiva dopo il consenso.
    consentMode: 'basic',
    formId: 'consulenza_gratuita',
    sectionDwellSeconds: 3,
    scrollMilestones: [25, 50, 75, 100],
    articleReadSeconds: 30
  };

  var DEBUG = /[?&]dl_debug=1/.test(location.search);
  var MAX_PENDING = 50;
  var started = false;
  var pending = [];
  var lastConsent = '';
  var pageStart = Date.now();

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  /* ---------- Utilità ---------- */

  function slug(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60);
  }

  function cleanText(text, max) {
    return String(text || '').replace(/\s+/g, ' ').trim().slice(0, max || 80);
  }

  function secondsSince(timestamp) {
    return Math.round((Date.now() - timestamp) / 1000);
  }

  function store(storage, key, value) {
    try { window[storage].setItem(key, JSON.stringify(value)); } catch (error) { /* storage non disponibile */ }
  }

  function load(storage, key) {
    try { return JSON.parse(window[storage].getItem(key)); } catch (error) { return null; }
  }

  /* ---------- Contesto pagina ---------- */

  function pageContext() {
    var path = location.pathname.replace(/\.html$/, '');
    var local = path.match(/^\/nutrizionista-(angri|nocera|salerno)/);
    if (local) return { type: 'local_landing', studio: local[1] };
    if (path === '/' || path === '/index') return { type: 'home' };
    if (/^\/blog\/?(index)?$/.test(path)) return { type: 'blog_hub' };
    if (/^\/blog\//.test(path)) return { type: 'blog_article' };
    if (/^\/mobile-app/.test(path)) return { type: 'app_page' };
    if (/^\/recensioni\/?(index)?$/.test(path)) return { type: 'reviews_hub' };
    if (/^\/recensioni\//.test(path)) return { type: 'review_story' };
    if (/^\/videotestimonianze\//.test(path)) return { type: 'video_testimonial' };
    if (/^\/testimonianze/.test(path)) return { type: 'testimonials_hub' };
    if (/^\/ti-aspettiamo/.test(path)) return { type: 'partner_landing' };
    if (/^\/pps\/grazieLanding/.test(path)) return { type: 'thank_you' };
    return { type: 'other' };
  }

  var PAGE = pageContext();

  /* ---------- Consenso (banner FreePrivacyPolicy) ---------- */

  function consentState() {
    var levels = {};
    var match = document.cookie.match(/(?:^|;\s*)cookie_consent_level=([^;]+)/);
    if (match) {
      try { levels = JSON.parse(decodeURIComponent(match[1])) || {}; } catch (error) { levels = {}; }
    }
    var analytics = levels.tracking ? 'granted' : 'denied';
    var ads = levels.targeting ? 'granted' : 'denied';
    return {
      analytics_storage: analytics,
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads
    };
  }

  function analyticsGranted() {
    return consentState().analytics_storage === 'granted';
  }

  function start() {
    if (started) return;
    started = true;

    var params = { content_group: PAGE.type, page_type: PAGE.type };
    if (PAGE.studio) params.studio_location = PAGE.studio;
    if (DEBUG) params.debug_mode = true;

    gtag('consent', 'default', consentState());
    gtag('js', new Date());
    gtag('set', 'user_properties', { lead_status: load('localStorage', 'dl_lead') ? 'lead' : 'prospect' });
    gtag('config', CONFIG.measurementId, params);
    pending.splice(0).forEach(function (item) { gtag('event', item[0], item[1]); });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.measurementId;
    document.head.appendChild(script);
  }

  function syncConsent() {
    var state = consentState();
    var serialized = JSON.stringify(state);
    if (serialized === lastConsent) return;
    lastConsent = serialized;

    if (started) gtag('consent', 'update', state);
    if (state.analytics_storage === 'granted') {
      start();
      persistJourney();
    }
  }

  function track(name, params) {
    params = params || {};
    if (DEBUG && window.console) console.log('[analytics] ' + name + ' ' + JSON.stringify(params));
    if (started) gtag('event', name, params);
    else if (pending.length < MAX_PENDING) pending.push([name, params]);
  }

  /* ---------- Provenienza della visita ---------- */

  var SEARCH_ENGINES = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|qwant)\./;
  var SOCIAL_NETWORKS = /(^|\.)(facebook|instagram|tiktok|youtube|linkedin)\.|(^|\.)(t\.co|fb\.me)$/;

  function referrerUrl() {
    try { return document.referrer ? new URL(document.referrer) : null; } catch (error) { return null; }
  }

  function detectAttribution() {
    var query = new URLSearchParams(location.search);
    var referrer = referrerUrl();
    var host = referrer ? referrer.hostname.replace(/^www\./, '') : '';
    var internal = host === location.hostname.replace(/^www\./, '');
    var attribution = { lp: location.pathname };

    if (query.get('utm_source')) {
      attribution.src = query.get('utm_source');
      attribution.med = query.get('utm_medium') || 'unknown';
      attribution.camp = query.get('utm_campaign') || '';
    } else if (query.get('gclid')) {
      attribution.src = 'google';
      attribution.med = 'cpc';
    } else if (query.get('fbclid')) {
      attribution.src = 'facebook';
      attribution.med = 'social';
    } else if (host && !internal) {
      attribution.src = host;
      attribution.med = SEARCH_ENGINES.test(host) ? 'organic' : SOCIAL_NETWORKS.test(host) ? 'social' : 'referral';
    } else if (internal) {
      attribution.src = 'unknown';
      attribution.med = 'internal';
    } else {
      attribution.src = 'direct';
      attribution.med = 'none';
    }
    return attribution;
  }

  // Lo storico tra pagine viene salvato solo con consenso analytics; senza, vale la sola pagina corrente.
  var attribution = load('sessionStorage', 'dl_attr') || detectAttribution();
  var lastCta = load('sessionStorage', 'dl_cta');

  function persistJourney() {
    if (!analyticsGranted()) return;
    store('sessionStorage', 'dl_attr', attribution);
    if (lastCta) store('sessionStorage', 'dl_cta', lastCta);
  }

  // URL inviato a Brevo nel campo nascosto URL: collega ogni contatto a sorgente, pagina d'ingresso e CTA.
  function leadUrl() {
    var query = new URLSearchParams();
    var referrer = referrerUrl();
    query.set('src', cleanText(attribution.src, 60));
    query.set('med', cleanText(attribution.med, 40));
    if (attribution.camp) query.set('camp', cleanText(attribution.camp, 60));
    if (attribution.lp !== location.pathname) query.set('lp', attribution.lp);
    if (referrer && referrer.hostname === location.hostname && referrer.pathname !== location.pathname) {
      query.set('from', referrer.pathname);
    }
    if (lastCta) query.set('cta', lastCta.location);
    return location.origin + location.pathname + '?' + query.toString();
  }

  /* ---------- Sezioni e posizione degli elementi ---------- */

  function sectionName(section) {
    if (section.dataset.section) return section.dataset.section;
    if (section.id === 'contacts-widget') return 'contacts';
    if (section.querySelector('#brevo-form')) return 'lead_form';
    if (section.id) return slug(section.id);
    var heading = section.querySelector('h1, h2, h3');
    return heading ? slug(heading.textContent) : '';
  }

  function locationOf(element) {
    if (element.closest('[class*="dl-float"]')) return 'floating_bar';
    if (element.closest('#nav-mobile-panel')) return 'mobile_menu';
    if (element.closest('#contacts-widget')) return 'contacts';
    if (element.closest('nav, #header')) return 'nav';
    if (element.closest('footer')) return 'footer';
    var section = element.closest('section, [data-section]');
    var name = section ? sectionName(section) : '';
    if (name) return name;
    return element.getBoundingClientRect().top + window.scrollY < window.innerHeight ? 'hero' : 'body';
  }

  /* ---------- Click: CTA, contatti, indicazioni, video ---------- */

  function isBookingLink(link) {
    if (!link.hash) return false;
    if (/^#(comeHere|prenota|form|brevo-form)$/.test(link.hash)) return true;
    if (link.pathname !== location.pathname) return false;
    var target = document.getElementById(link.hash.slice(1));
    return Boolean(target && target.querySelector('#brevo-form'));
  }

  function contactMethod(href) {
    if (/^tel:/i.test(href)) return 'phone';
    if (/wa\.me|whatsapp\.com/i.test(href)) return 'whatsapp';
    if (/^mailto:/i.test(href)) return 'email';
    return '';
  }

  function onClick(event) {
    var target = event.target instanceof Element ? event.target : event.target.parentElement;
    if (!target) return;

    var video = target.closest('lite-youtube');
    if (video && video.dataset.dlTracked !== 'true') {
      video.dataset.dlTracked = 'true';
      track('video_start', {
        video_provider: 'youtube',
        video_id: video.getAttribute('videoid') || '',
        video_title: cleanText(video.getAttribute('playlabel'), 100),
        cta_location: locationOf(video)
      });
      return;
    }

    var directions = target.closest('.dl-loc-btn');
    if (directions) {
      var studio = directions.textContent.match(/salerno|angri|nocera/i);
      track('directions_click', { studio_location: studio ? studio[0].toLowerCase() : 'unknown' });
      return;
    }

    var link = target.closest('a[href]');
    if (!link) return;

    var method = contactMethod(link.getAttribute('href'));
    if (method) {
      track('contact_click', {
        contact_method: method,
        cta_location: locationOf(link),
        cta_text: cleanText(link.textContent)
      });
      return;
    }

    if (isBookingLink(link)) {
      lastCta = { location: locationOf(link), text: cleanText(link.textContent), page: location.pathname };
      persistJourney();
      track('cta_click', {
        cta_text: lastCta.text,
        cta_location: lastCta.location,
        cta_destination: link.pathname === location.pathname ? 'same_page' : link.pathname
      });
    }
  }

  /* ---------- Form Brevo: vista → inizio → invio → lead ---------- */

  function initForm() {
    var container = document.getElementById('brevo-form');
    if (!container) return;

    var state = { ready: false, viewed: false, startedAt: 0, submitted: false, done: false, lastField: '', fields: {}, errorShown: false, fieldErrors: {} };

    function fillUrl() {
      var field = container.querySelector('#URL');
      if (field) field.value = leadUrl();
    }

    function fieldsFilled() {
      return Object.keys(state.fields).length;
    }

    function ctaParams() {
      return {
        form_id: CONFIG.formId,
        cta_location: lastCta ? lastCta.location : 'direct_scroll',
        cta_page: lastCta ? lastCta.page : location.pathname
      };
    }

    var viewObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      if (state.viewed || !entries.some(function (entry) { return entry.isIntersecting; })) return;
      state.viewed = true;
      viewObserver.disconnect();
      track('form_view', ctaParams());
    }, { threshold: 0.3 }) : null;

    function inspect() {
      var form = container.querySelector('#sib-form');
      if (!form) return;
      if (!state.ready) {
        state.ready = true;
        fillUrl();
        if (viewObserver) viewObserver.observe(form);
      }

      if (!state.done && container.querySelector('#success-message.sib-form-message-panel--active')) {
        state.done = true;
        var params = ctaParams();
        params.lead_type = 'consulenza_gratuita';
        params.form_duration_sec = state.startedAt ? secondsSince(state.startedAt) : 0;
        params.time_on_page_sec = secondsSince(pageStart);
        track('generate_lead', params);
        if (analyticsGranted()) store('localStorage', 'dl_lead', 1);
        if (started) gtag('set', 'user_properties', { lead_status: 'lead' });
        return;
      }

      var errorShown = Boolean(container.querySelector('#error-message.sib-form-message-panel--active'));
      if (errorShown && !state.errorShown) track('form_error', { form_id: CONFIG.formId, error_field: 'submit' });
      state.errorShown = errorShown;

      container.querySelectorAll('.entry__error').forEach(function (label) {
        if (!label.textContent.trim()) return;
        var entry = label.closest('.form__entry');
        var input = entry ? entry.querySelector('input') : null;
        var name = input ? input.id : 'unknown';
        if (state.fieldErrors[name]) return;
        state.fieldErrors[name] = true;
        track('form_error', { form_id: CONFIG.formId, error_field: name.toLowerCase() });
      });
    }

    container.addEventListener('focusin', function (event) {
      var field = event.target;
      if (!field.id || !field.matches('#sib-form input:not([type="hidden"])')) return;
      state.lastField = field.id.toLowerCase();
      state.fields[state.lastField] = true;
      if (state.startedAt) return;
      state.startedAt = Date.now();
      var params = ctaParams();
      params.first_field = state.lastField;
      track('form_start', params);
    });

    container.addEventListener('submit', function () {
      fillUrl();
      state.submitted = true;
      var params = ctaParams();
      params.fields_filled = fieldsFilled();
      track('form_submit', params);
    }, true);

    window.addEventListener('pagehide', function () {
      if (!state.startedAt || state.done) return;
      track('form_abandon', {
        form_id: CONFIG.formId,
        last_field: state.lastField,
        fields_filled: fieldsFilled(),
        submit_attempted: state.submitted ? 'yes' : 'no',
        form_duration_sec: secondsSince(state.startedAt)
      });
    });

    new MutationObserver(inspect).observe(container, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class']
    });
    inspect();
  }

  /* ---------- Attenzione: sezioni, scroll, lettura ---------- */

  function initEngagement() {
    var sections = [];
    var maxScroll = 0;
    var activeSeconds = 0;
    var milestones = CONFIG.scrollMilestones.slice();
    var articleRead = false;
    var summarySent = false;
    var ticking = false;

    document.querySelectorAll('section, [data-section], #contacts-widget').forEach(function (element) {
      var name = sectionName(element);
      if (name) sections.push({ element: element, name: name, seconds: 0, visible: false });
    });

    if ('IntersectionObserver' in window && sections.length) {
      var steps = [];
      for (var step = 0; step <= 10; step += 1) steps.push(step / 10);
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var section = sections.filter(function (item) { return item.element === entry.target; })[0];
          // Le sezioni più alte dello schermo contano come viste quando ne occupano almeno metà.
          section.visible = entry.isIntersecting &&
            (entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= window.innerHeight * 0.5);
        });
      }, { threshold: steps });
      sections.forEach(function (section) { observer.observe(section.element); });
    }

    function checkArticleRead() {
      if (articleRead || PAGE.type !== 'blog_article') return;
      if (maxScroll < 75 || activeSeconds < CONFIG.articleReadSeconds) return;
      articleRead = true;
      track('article_read', { read_time_sec: activeSeconds });
    }

    setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      activeSeconds += 1;
      sections.forEach(function (section, index) {
        if (!section.visible) return;
        section.seconds += 1;
        if (section.seconds !== CONFIG.sectionDwellSeconds) return;
        track('section_view', {
          section_id: section.name,
          section_index: index + 1,
          section_count: sections.length
        });
      });
      checkArticleRead();
    }, 1000);

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var total = document.documentElement.scrollHeight;
        var percent = Math.min(100, Math.round((window.scrollY + window.innerHeight) / total * 100));
        if (percent > maxScroll) maxScroll = percent;
        while (milestones.length && maxScroll >= Math.min(milestones[0], 99)) {
          track('scroll_depth', { percent_scrolled: milestones.shift() });
        }
        checkArticleRead();
      });
    }, { passive: true });

    function sendSummary() {
      if (summarySent || activeSeconds < 5) return;
      summarySent = true;
      var top = sections.slice().sort(function (a, b) { return b.seconds - a.seconds; })[0];
      track('engagement_summary', {
        top_section: top && top.seconds ? top.name : 'none',
        top_section_sec: top ? top.seconds : 0,
        sections_viewed: sections.filter(function (section) { return section.seconds >= CONFIG.sectionDwellSeconds; }).length,
        max_scroll_pct: maxScroll,
        active_time_sec: activeSeconds
      });
    }

    window.addEventListener('pagehide', sendSummary);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') sendSummary();
    });
  }

  function onToggle(event) {
    var details = event.target;
    if (!details.open || !details.matches('details:not(.dl-article-index)')) return;
    var summary = details.querySelector('summary');
    track('faq_open', {
      faq_question: cleanText(summary ? summary.textContent : '', 100),
      cta_location: locationOf(details)
    });
  }

  /* ---------- Avvio ---------- */

  function init() {
    document.addEventListener('click', onClick, true);
    document.addEventListener('toggle', onToggle, true);
    initForm();
    initEngagement();
  }

  ['cc_userChangedConsent', 'cc_noticeBannerOkOrAgreePressed', 'cc_noticeBannerRejectPressed', 'cc_preferencesCenterSavePressed'].forEach(function (name) {
    // Il banner scrive il cookie subito dopo l'evento.
    document.addEventListener(name, function () { setTimeout(syncConsent, 150); });
  });

  if (CONFIG.consentMode === 'advanced') start();
  syncConsent();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
