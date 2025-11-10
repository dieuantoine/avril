import { SettingsView } from './views/SettingsView.js';
import { GamesView } from './views/GamesView.js';
import { PlayView } from './views/PlayView.js';

let currentView = null;
const routes = {
  '#/settings': SettingsView,
  '#/games': GamesView,
  '#/play': PlayView,
};

export function navigateTo(hash) { location.hash = hash; }

export function initRouter() {
  const app = document.getElementById('app');
  const mount = async () => {
    const View = routes[location.hash] || SettingsView;
    if (currentView?.unmount) currentView.unmount();
    app.innerHTML = '';
    currentView = new View();
    await currentView.mount(app);
  };
  window.addEventListener('hashchange', mount);
  mount();
}
