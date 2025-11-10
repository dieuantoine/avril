import { initRouter, navigateTo } from './router.js';
import { state } from './state.js';

window.addEventListener('DOMContentLoaded', async () => {
  const syncActive = () => {
    const h = location.hash || '#/settings';
    document.querySelectorAll('[data-nav]').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', h === href);
    });
  };
  window.addEventListener('hashchange', syncActive);
  syncActive();

  await state.init();
  initRouter();
  if (!location.hash) navigateTo('#/settings');
});
