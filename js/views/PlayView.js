import { state } from '../state.js';
import { el, on, html, copyText, toast } from '../utils/dom.js';
import { randInt, sample, choice } from '../services/rng.js';

export class PlayView {
  unsubs = [];

  async mount(root) {
    const card = el('section', { className: 'card' });
    root.appendChild(card);

    const ensure = () => {
      if (!state.selectedGames.length) {
        card.innerHTML = '<p>Aucun jeu sélectionné. Rendez-vous dans <a href="#/settings">Paramètres</a>.</p>';
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
      if (!selected.length) {
        card.innerHTML = '<p>Aucun jeu sélectionné. Rendez-vous dans <a href="#/settings">Paramètres</a>.</p>';
        return;
      }
      const game = choice(selected);
      const params = { ...(game.params||{}), ...(state.gameParams[game.id]||{}) };

      details.innerHTML = html`
        <h2>${game.name}</h2>
        <p class="help">${game.description}</p>
      `;

      tools.innerHTML = '';

      if (game.requires.wordLists) {
        tools.append(this.#renderWordsTool(params));
      }
      if (game.requires.numbers) {
        tools.append(this.#renderNumbersTool(params));
      }
    };

    this.unsubs.push(on(btnNext, 'click', pickAndRender));
    // Render initial game
    pickAndRender();
  }

  #renderWordsTool(params) {
    const wrap = el('div', { className: 'card' });
    const need = Number(params.batchSize ?? 1);

    const renderBatch = () => {
      if (!state.wordLists.length) {
        wrap.innerHTML = '<div class="help">Aucune liste chargée. Importez des .txt dans Paramètres.</div>';
        return;
      }
      const words = sample(state.wordLists, need);
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

    renderBatch();

    const off = on(wrap, 'click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      if (btn.dataset.act === 'regen') renderBatch();
      if (btn.dataset.act === 'copy') {
        const area = wrap.querySelector('#wordsArea');
        copyText(area.textContent.trim());
      }
    });
    this.unsubs.push(off);
    return wrap;
  }

  #renderNumbersTool(params) {
    const wrap = el('div', { className: 'card' });

    const getConfig = () => {
      const batch = Number(inputs.batch.value || params.batchSize || 1);
      const min = Number(inputs.min.value || params.min || 0);
      const max = Number(inputs.max.value || params.max || 100);
      return { batch: Math.max(1, batch), min, max };
    };

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
          <input type="number" min="1" id="num-batch" value="${Number(params.batchSize ?? 1)}" />
          <span class="label">Min</span>
          <input type="number" id="num-min" value="${params.min ?? 0}" />
          <span class="label">Max</span>
          <input type="number" id="num-max" value="${params.max ?? 100}" />
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
      const { batch, min, max } = getConfig();
      const arr = Array.from({ length: batch }, () => randInt(min, max));
      inputs.area.textContent = arr.join(' - ');
    };
    render();

    const off = on(wrap, 'click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      if (btn.dataset.act === 'regen') render();
      if (btn.dataset.act === 'copy') copyText(inputs.area.textContent.trim());
    });
    this.unsubs.push(off);

    // Live re-render on params change
    const off2 = on(wrap, 'input', (e) => {
      if (e.target.matches('#num-batch, #num-min, #num-max')) render();
    });
    this.unsubs.push(off2);

    return wrap;
  }

  unmount() { this.unsubs.forEach(off => off()); this.unsubs = []; }
}