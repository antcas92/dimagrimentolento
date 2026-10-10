(() => {
  const header = document.getElementById('header');
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('nav-mobile-panel');
  const overlay = document.getElementById('nav-overlay');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const index = document.querySelector('.dl-article-index');
  const links = [...panel.querySelectorAll('a[href]')];
  let isOpen = false;
  if (index) index.open = desktop.matches;

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);

  function setMenu(open, restoreFocus = true) {
    isOpen = open;
    panel.inert = !open;
    panel.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    toggle.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    panel.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) links[0]?.focus();
    else if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setMenu(!isOpen));
  overlay.addEventListener('click', () => setMenu(false));
  links.forEach(link => link.addEventListener('click', () => setMenu(false, false)));
  desktop.addEventListener('change', event => {
    if (event.matches && isOpen) setMenu(false, false);
    if (index) index.open = event.matches;
  });
  document.addEventListener('keydown', event => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false);
    }
    if (event.key === 'Tab') {
      const focusable = [toggle, ...links];
      const index = focusable.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        links[links.length - 1]?.focus();
      } else if (!event.shiftKey && (index === focusable.length - 1 || index === -1)) {
        event.preventDefault();
        toggle.focus();
      }
    }
  });
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // Avanzamento di lettura e voce attiva dell'indice: solo sulle pagine articolo.
  const body = document.querySelector('.dl-blog-body');
  if (!body || !index) return;

  const progress = document.createElement('div');
  progress.className = 'dl-read-progress';
  progress.setAttribute('aria-hidden', 'true');
  const bar = progress.appendChild(document.createElement('span'));
  document.body.appendChild(progress);
  let ticking = false;
  const updateProgress = () => {
    ticking = false;
    const rect = body.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.6;
    const read = total > 0 ? Math.min(1, Math.max(0, (header.offsetHeight - rect.top) / total)) : 0;
    bar.style.setProperty('--read', read.toFixed(4));
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const indexLinks = new Map([...index.querySelectorAll('a[href^="#"]')]
    .map(link => [decodeURIComponent(link.hash.slice(1)), link]));
  const sections = [...indexLinks.keys()].map(id => document.getElementById(id)).filter(Boolean);
  if (!('IntersectionObserver' in window) || !sections.length) return;
  const setCurrent = id => indexLinks.forEach((link, key) => {
    if (key === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  const spy = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting);
    if (visible.length) setCurrent(visible[0].target.id);
  }, { rootMargin: '-25% 0px -65% 0px' });
  sections.forEach(section => spy.observe(section));
})();
