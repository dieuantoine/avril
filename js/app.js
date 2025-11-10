import { initRouter, navigateTo } from './router.js';
import { state } from './state.js';


// Boot
window.addEventListener('DOMContentLoaded', async () => {
// Navigation active state
const syncActive = () => {
document.querySelectorAll('[data-nav]').forEach(a => {
const isActive = location.hash === a.getAttribute('href');
a.classList.toggle('active', isActive);
});
};
window.addEventListener('hashchange', syncActive);
syncActive();


await state.init();
initRouter();
if (!location.hash) navigateTo('#/settings');
});