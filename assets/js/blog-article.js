(() => {
  const header = document.getElementById('header');
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('nav-mobile-panel');
  const overlay = document.getElementById('nav-overlay');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const index = document.querySelector('.dl-article-index');
  const links = [...panel.querySelectorAll('a[href]')];
  let isOpen = false;
  index.open = desktop.matches;

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
    index.open = event.matches;
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
})();
