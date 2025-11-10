import { state } from '../state.js';
import { el, on, html, toast } from '../utils/dom.js';

export class GamesView {
  unsubs = [];

  async mount(root) {
    const wrap = el('section', { className: 'card' });
    wrap.innerHTML = html`<h2>Jeux</h2><div id="gamesList"></div>`;
    root.appendChild(wrap);

    const gamesList = wrap.querySelector('#gamesList');
    const selected = new Set(state.selectedGames);

    const fragment = document.createDocumentFragment();
    for (const g of state.games) {
      const params = state.gameParams[g.id] || g.params || {};
      const needs = g.needs || {};
      const card = el('div', { className: 'card' });
      card.innerHTML = html`
        <div class="flex" style="justify-content:space-between; align-items:flex-start">
          <div>
            <label class="flex" style="gap:8px; align-items:center">
              <input type="checkbox" data-id="${g.id}" ${selected.has(g.id) ? 'checked' : ''} />
              <strong>${g.name}</strong>
            </label>
            <div class="help">${g.description}</div>
            <div class="flex" style="margin-top:6px">
              ${needs.words ? '<span class="badge">Words</span>' : ''}
              ${needs.categories ? '<span class="badge">Categories</span>' : ''}
              ${needs.numbers ? '<span class="badge">Numbers</span>' : ''}
            </div>
          </div>
          <div class="kv" style="min-width:300px;">
            ${needs.words ? html`
              <span class="label">Words batch</span>
              <input type="number" min="1" id="wb-${g.id}" value="${Number(params.wordsBatch ?? 1)}" />
            ` : ''}
            ${needs.categories ? html`
              <span class="label">Categories batch</span>
              <input type="number" min="1" id="cb-${g.id}" value="${Number(params.categoriesBatch ?? 1)}" />
            ` : ''}
            ${needs.numbers ? html`
              <span class="label">Numbers min</span>
              <input type="number" id="nmin-${g.id}" value="${params.numbers?.min ?? 0}" />
              <span class="label">Numbers max</span>
              <input type="number" id="nmax-${g.id}" value="${params.numbers?.max ?? 100}" />
              <span class="label">Numbers batch</span>
              <input type="number" min="1" id="nb-${g.id}" value="${params.numbers?.batch ?? 1}" />
            ` : ''}
            <div></div>
            <div class="flex">
              <button class="btn-secondary" data-save="${g.id}">Enregistrer</button>
            </div>
          </div>
        </div>
      `;
      fragment.appendChild(card);
    }
    gamesList.appendChild(fragment);

    this.unsubs.push(on(gamesList, 'change', (e) => {
      const cb = e.target.closest('input[type="checkbox"][data-id]');
      if (!cb) return;
      if (cb.checked) selected.add(cb.dataset.id); else selected.delete(cb.dataset.id);
      state.setSelectedGames(Array.from(selected));
    }));

    this.unsubs.push(on(gamesList, 'click', (e) => {
      const btn = e.target.closest('button[data-save]');
      if (!btn) return;
      const id = btn.dataset.save;
      const game = state.games.find(x => x.id === id);
      const needs = game?.needs || {};
      const next = {};
      if (needs.words) next.wordsBatch = Math.max(1, Number(wrap.querySelector(`#wb-${id}`).value || 1));
      if (needs.categories) next.categoriesBatch = Math.max(1, Number(wrap.querySelector(`#cb-${id}`).value || 1));
      if (needs.numbers) next.numbers = {
        min: Number(wrap.querySelector(`#nmin-${id}`).value || 0),
        max: Number(wrap.querySelector(`#nmax-${id}`).value || 100),
        batch: Math.max(1, Number(wrap.querySelector(`#nb-${id}`).value || 1))
      };
      state.setGameParams(id, next);
      toast('Paramètres enregistrés');
    }));
  }

  unmount() { this.unsubs.forEach(off => off()); this.unsubs = []; }
}
