(function () {
  'use strict';

  function injectWidget(container, html) {
    container.innerHTML = html;
    container.querySelectorAll('script').forEach(function (oldScript) {
      var script = document.createElement('script');
      if (oldScript.src) {
        script.src = oldScript.src;
        script.async = oldScript.async;
        script.defer = oldScript.defer;
      } else {
        script.textContent = oldScript.textContent;
      }
      document.body.appendChild(script);
      oldScript.remove();
    });
  }

  async function loadWidget(container, url) {
    if (container.dataset.widgetLoaded === 'true') return;
    container.dataset.widgetLoaded = 'true';
    try {
      var response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      injectWidget(container, await response.text());
    } catch (error) {
      container.dataset.widgetLoaded = 'false';
      console.warn('Widget non caricato:', url, error);
    }
  }

  function observeWidget(id, url) {
    var container = document.getElementById(id);
    if (!container) return;
    if (!('IntersectionObserver' in window)) {
      loadWidget(container, url);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
      observer.disconnect();
      loadWidget(container, url);
    }, { rootMargin: '600px 0px' });
    observer.observe(container);
  }

  document.addEventListener('DOMContentLoaded', function () {
    observeWidget('brevo-form', '/brevo-widget.html');
    observeWidget('contacts-widget', '/contacts-widget.html');
  });
}());
