// Tour della pagina app: mentre scorri, il telefono fisso mostra la schermata del passaggio in lettura.
(() => {
  const stage = document.querySelector('.dl-tour-stage');
  const steps = [...document.querySelectorAll('.dl-tour-step')];
  if (!stage || !steps.length) return;

  const screens = [...stage.querySelectorAll('.dl-tour-screens img')];
  const tabs = [...stage.querySelectorAll('.dl-tour-tabs button')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function show(key) {
    screens.forEach(img => img.classList.toggle('is-active', img.dataset.screen === key));
    tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.goto === key)));
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    const step = steps.find(item => item.dataset.screen === tab.dataset.goto);
    if (!step) return;
    show(tab.dataset.goto);
    step.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
  }));

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    const current = entries.find(entry => entry.isIntersecting);
    if (current) show(current.target.dataset.screen);
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(step => observer.observe(step));
})();
