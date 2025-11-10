import { state } from '../state.js';
import { el, on, html, copyText } from '../utils/dom.js';
import { randInt, sample, choice } from '../services/rng.js';

function deepMergeParams(base = {}, override = {}) {
  const out = { ...base, ...override };
  if (base.numbers || override.numbers) {
    out.numbers = { ...(base.numbers || {}), ...(override.numbers || {}) };
  }
  return out;
}

export class PlayView {
  unsubs = [];

  async mount(root) {
    const card = el('section', { className: 'card' });
    root.appendChild(card);

    const ensure = () => {
      if (!state.selectedGames.length) {
        card.innerHTML = '<p>Aucun jeu sélectionné. Rendez-vous dans <a href="#/games">Jeux</a>.</p>';
        return false;
      }
      return true;
    };
    if (!ensure()) return;

    const btnNext = el('button', { textContent: 'Proposer un jeu' });
    const header = el('div', { className: 'flex' });
    header.append(btnNext);

    const details = el('div');
    const tools = el('div');

    card.append(header, el('hr'), details, tools);

    const pickAndRender = () => {
      if (!ensure()) return;
      const selected = state.games.filter(g => state.selectedGames.includes(g.id));
      if (!selected.length) { card.innerHTML = '<p>Aucun jeu sélectionné. <a href="#/games">Choisir des jeux</a>.</p>'; return; }
      const game = choice(selected);
      const params = deepMergeParams(game.params || {}, state.gameParams[game.id] || {});
      const needs = game.needs || {};

      details.innerHTML = html`<h2>${game.name}</h2><p class="help">${game.description}</p>`;
      tools.innerHTML = '';

      if (needs.categories) tools.append(this.#renderCategoriesTool(params));
      if (needs.words) tools.append(this.#renderWordsTool(params));
      if (needs.numbers) tools.append(this.#renderNumbersTool(params));
    };

    this.unsubs.push(on(btnNext, 'click', pickAndRender));
    pickAndRender();
  }

  #renderWordsTool(params) {
    const need = Math.max(1, Number(params.wordsBatch ?? 1));
    const wrap = el('div', { className: 'card' });

    const render = () => {
      if (!state.words.length) {
        wrap.innerHTML = '<div class="help">Aucune liste Words chargée. Allez dans Paramètres.</div>';
        return;
      }
      const words = sample(state.words, need);
      wrap.innerHTML = html`
        <div class="flex" style="justify-content:space-between; align-items:center">
          <strong>Mots (${need})</strong>
          <div class="flex">
            <button class="btn-secondary" data-act="regen">Régénérer</button>
            <button data-act="copy">Copier</button>
          </div>
        </div>
        <div class="copy-target" id="wordsArea">${words.join(' \u2022 ')}</div>
      `;
    };

    render();
    const off = on(wrap, 'click', (e) => {
      const btn = e.target.closest('button[data-act]'); if (!btn) return;
      if (btn.dataset.act === 'regen') render();
      if (btn.dataset.act === 'copy') {
        const area = wrap.querySelector('#wordsArea');
        copyText(area.textContent.trim());
      }
    });
    this.unsubs.push(off);
    return wrap;
  }

  #renderCategoriesTool(params) {
    const need = Math.max(1, Number(params.categoriesBatch ?? 1));
    const wrap = el('div', { className: 'card' });

    const render = () => {
      if (!state.categories.length) {
        wrap.innerHTML = '<div class="help">Aucune liste Categories chargée. Allez dans Paramètres.</div>';
        return;
      }
      const cats = sample(state.categories, need);
      wrap.innerHTML = html`
        <div class="flex" style="justify-content:space-between; align-items:center">
          <strong>Catégories (${need})</strong>
          <div class="flex">
            <button class="btn-secondary" data-act="regen">Régénérer</button>
            <button data-act="copy">Copier</button>
          </div>
        </div>
        <div class="copy-target" id="catsArea">${cats.join(' \u2022 ')}</div>
      `;
    };

    render();
    const off = on(wrap, 'click', (e) => {
      const btn = e.target.closest('button[data-act]'); if (!btn) return;
      if (btn.dataset.act === 'regen') render();
      if (btn.dataset.act === 'copy') {
        const area = wrap.querySelector('#catsArea');
        copyText(area.textContent.trim());
      }
    });
    this.unsubs.push(off);
    return wrap;
  }

  #renderNumbersTool(params) {
    const wrap = el('div', { className: 'card' });
    const defaults = { min: 0, max: 100, batch: 1, ...(params.numbers || {}) };

    wrap.innerHTML = html`
      <div class="flex" style="justify-content:space-between; align-items:center; margin-bottom:8px">
        <strong>Nombres</strong>
        <div class="flex">
          <button class="btn-secondary" data-act="regen">Régénérer</button>
          <button data-act="copy">Copier</button>
        </div>
      </div>
      <div class="row cols-2">
        <div class="kv">
          <span class="label">Batch</span>
          <input type="number" min="1" id="num-batch" value="${Number(defaults.batch)}" />
          <span class="label">Min</span>
          <input type="number" id="num-min" value="${defaults.min}" />
          <span class="label">Max</span>
          <input type="number" id="num-max" value="${defaults.max}" />
        </div>
        <div>
          <div class="label">Résultat</div>
          <div class="copy-target" id="numbersArea"></div>
        </div>
      </div>
    `;

    const inputs = {
      batch: wrap.querySelector('#num-batch'),
      min: wrap.querySelector('#num-min'),
      max: wrap.querySelector('#num-max'),
      area: wrap.querySelector('#numbersArea'),
    };

    const render = () => {
      const batch = Math.max(1, Number(inputs.batch.value || defaults.batch));
      const min = Number(inputs.min.value || defaults.min);
      const max = Number(inputs.max.value || defaults.max);
      const arr = Array.from({ length: batch }, () => randInt(min, max));
      inputs.area.textContent = arr.join(' - ');
    };
    render();

    const off = on(wrap, 'click', (e) => {
      const btn = e.target.closest('button[data-act]'); if (!btn) return;
      if (btn.dataset.act === 'regen') render();
      if (btn.dataset.act === 'copy') copyText(inputs.area.textContent.trim());
    });
    this.unsubs.push(off);

    const off2 = on(wrap, 'input', (e) => {
      if (e.target.matches('#num-batch, #num-min, #num-max')) render();
    });
    this.unsubs.push(off2);

    return wrap;
  }

  unmount() { this.unsubs.forEach(off => off()); this.unsubs = []; }
}
