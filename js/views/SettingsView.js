import { state } from '../state.js';
import { el, on, html, toast } from '../utils/dom.js';
import { parseTextFiles } from '../utils/textParser.js';

export class SettingsView {
  unsubs = [];

  async mount(root) {
    root.append(
      el('section', { className: 'card', innerHTML: html`
        <h2>Listes de mots</h2>
        <p class="help">Chargez un ou plusieurs fichiers <span class="mono">.txt</span> (une ligne = un mot/une phrase).</p>
        <div class="row cols-2">
          <div>
            <input id="fileInput" type="file" accept=".txt" multiple />
            <div class="flex">
              <button id="btnImport">Importer</button>
              <button id="btnClear" class="btn-secondary">Vider</button>
            </div>
          </div>
          <div>
            <div class="label">Statut</div>
            <div id="wordStats"></div>
          </div>
        </div>
      `}),
      el('section', { className: 'card', innerHTML: html`
        <h2>Jeux disponibles</h2>
        <div id="gamesList"></div>
      `})
    );

    // Populate word stats
    const wordStats = root.querySelector('#wordStats');
    const refreshStats = () => {
      wordStats.textContent = state.wordLists.length
        ? `${state.wordLists.length} entrée(s) chargée(s)`
        : 'Aucune liste chargée';
    };
    refreshStats();

    // Import buttons
    const fileInput = root.querySelector('#fileInput');
    const btnImport = root.querySelector('#btnImport');
    const btnClear = root.querySelector('#btnClear');

    this.unsubs.push(on(btnImport, 'click', async () => {
      const words = await parseTextFiles(fileInput.files);
      state.setWordLists(words);
      refreshStats();
      toast('Listes importées');
    }));
    this.unsubs.push(on(btnClear, 'click', () => {
      state.clearWordLists();
      fileInput.value = '';
      refreshStats();
    }));

    // Games list with checkboxes + params
    const gamesList = root.querySelector('#gamesList');
    const selected = new Set(state.selectedGames);

    const fragment = document.createDocumentFragment();
    for (const g of state.games) {
      const params = state.gameParams[g.id] || g.params || {};
      const wrap = el('div', { className: 'card' });
      wrap.innerHTML = html`
        <div class="flex" style="justify-content:space-between; align-items:flex-start">
          <div>
            <label class="flex" style="gap:8px; align-items:center">
              <input type="checkbox" data-id="${g.id}" ${selected.has(g.id) ? 'checked' : ''} />
              <strong>${g.name}</strong>
            </label>
            <div class="help">${g.description}</div>
            <div class="flex" style="margin-top:6px">
              ${g.requires.wordLists ? '<span class="badge">Listes</span>' : ''}
              ${g.requires.numbers ? '<span class="badge">Nombres</span>' : ''}
            </div>
          </div>
          <div class="kv" style="min-width:260px;">
            <span class="label">Batch</span>
            <input type="number" min="1" id="batch-${g.id}" value="${Number(params.batchSize ?? 1)}" />
            <span class="label">Min</span>
            <input type="number" id="min-${g.id}" value="${params.min ?? ''}" ${g.requires.numbers ? '' : 'disabled'} />
            <span class="label">Max</span>
            <input type="number" id="max-${g.id}" value="${params.max ?? ''}" ${g.requires.numbers ? '' : 'disabled'} />
            <div></div>
            <div class="flex">
              <button class="btn-secondary" data-save="${g.id}">Enregistrer</button>
            </div>
          </div>
        </div>
      `;
      fragment.appendChild(wrap);
    }
    gamesList.appendChild(fragment);

    // Save selection on change
    this.unsubs.push(on(gamesList, 'change', (e) => {
      const cb = e.target.closest('input[type="checkbox"][data-id]');
      if (!cb) return;
      if (cb.checked) selected.add(cb.dataset.id); else selected.delete(cb.dataset.id);
      state.setSelectedGames(Array.from(selected));
    }));

    // Save params buttons
    this.unsubs.push(on(gamesList, 'click', (e) => {
      const btn = e.target.closest('button[data-save]');
      if (!btn) return;
      const id = btn.dataset.save;
      const batch = Number(root.querySelector(`#batch-${id}`).value || 1);
      const min = Number(root.querySelector(`#min-${id}`).value || 0);
      const max = Number(root.querySelector(`#max-${id}`).value || 0);
      state.setGameParams(id, { batchSize: Math.max(1, batch), min, max });
      toast('Paramètres enregistrés');
    }));
  }

  unmount() { this.unsubs.forEach(off => off()); this.unsubs = []; }
}