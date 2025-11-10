import { state } from '../state.js';
import { el, on, html, toast } from '../utils/dom.js';
import { sanitizeTxtName, toWordlistPath, fetchTextOrNull } from '../services/fileService.js';
import { parseTextToLines, mergeUnique } from '../utils/textParser.js';

export class SettingsView {
  unsubs = [];

  async mount(root) {
    root.append(
      el('section', { className: 'card', innerHTML: html`
        <h2>Listes de mots (Words)</h2>
        <p class="help">Indiquez les noms de fichiers de mots dans <span class="mono">/data/wordlists</span>.</p>
        <div class="row cols-2">
          <div>
            <label class="label" for="words-input">Fichiers</label>
            <textarea id="words-input"></textarea>
            <div class="flex" style="margin-top:8px">
              <button id="btnWordsLoad">Charger</button>
              <button id="btnWordsClear" class="btn-secondary">Vider</button>
            </div>
          </div>
          <div>
            <div class="label">Statut</div>
            <div id="words-stats" class="help"></div>
            <div id="words-files" class="help mono" style="margin-top:6px"></div>
            <div id="words-missing" class="help" style="margin-top:6px"></div>
          </div>
        </div>
      `}),
      el('section', { className: 'card', innerHTML: html`
        <h2>Listes de catégories (Categories)</h2>
        <p class="help">Indiquez les noms de fichiers de catégories dans <span class="mono">/data/wordlists</span>.</p>
        <div class="row cols-2">
          <div>
            <label class="label" for="cats-input">Fichiers</label>
            <textarea id="cats-input"></textarea>
            <div class="flex" style="margin-top:8px">
              <button id="btnCatsLoad">Charger</button>
              <button id="btnCatsClear" class="btn-secondary">Vider</button>
            </div>
          </div>
          <div>
            <div class="label">Statut</div>
            <div id="cats-stats" class="help"></div>
            <div id="cats-files" class="help mono" style="margin-top:6px"></div>
            <div id="cats-missing" class="help" style="margin-top:6px"></div>
          </div>
        </div>
      `})
    );

    const wordsInput   = root.querySelector('#words-input');
    const wordsStats   = root.querySelector('#words-stats');
    const wordsFilesEl = root.querySelector('#words-files');
    const wordsMissing = root.querySelector('#words-missing');

    const catsInput    = root.querySelector('#cats-input');
    const catsStats    = root.querySelector('#cats-stats');
    const catsFilesEl  = root.querySelector('#cats-files');
    const catsMissing  = root.querySelector('#cats-missing');

    wordsInput.value = (state.wordsFiles?.length ? state.wordsFiles.join('\n') : 'mots.txt');
    catsInput.value  = (state.categoriesFiles?.length ? state.categoriesFiles.join('\n') : 'categories.txt');

    const refreshStats = () => {
      wordsStats.textContent = state.words.length
        ? `${state.words.length} entrée(s) chargée(s)`
        : 'Aucune entrée chargée';
      wordsFilesEl.textContent = state.wordsFiles?.length
        ? `Fichiers: ${state.wordsFiles.join(', ')}`
        : 'Fichiers: —';

      catsStats.textContent = state.categories.length
        ? `${state.categories.length} entrée(s) chargée(s)`
        : 'Aucune entrée chargée';
      catsFilesEl.textContent = state.categoriesFiles?.length
        ? `Fichiers: ${state.categoriesFiles.join(', ')}`
        : 'Fichiers: —';
    };
    refreshStats();

    const parseNames = (raw) => {
      const items = String(raw || '')
        .split(/[\n,\s]+/)
        .map(s => s.trim())
        .filter(Boolean);
      const safe = items.map(sanitizeTxtName).filter(Boolean);
      return Array.from(new Set(safe));
    };

    const loadKind = async (names, kind) => {
      const missing = [];
      const arrays = [];
      const loadedNames = [];

      for (const name of (names.length ? names : [kind === 'words' ? 'mots.txt' : 'categories.txt'])) {
        const safe = sanitizeTxtName(name);
        if (!safe) continue;
        const path = toWordlistPath(safe);
        const text = await fetchTextOrNull(path);
        if (!text) { missing.push(safe); continue; }
        arrays.push(parseTextToLines(text));
        loadedNames.push(safe);
      }

      const merged = mergeUnique(arrays);
      if (kind === 'words') {
        state.setWords(merged);
        state.setWordsFiles(loadedNames);
      } else {
        state.setCategories(merged);
        state.setCategoriesFiles(loadedNames);
      }
      refreshStats();
      return { missing, loadedNames };
    };

    this.unsubs.push(on(root.querySelector('#btnWordsLoad'), 'click', async () => {
      const names = parseNames(wordsInput.value);
      const { missing } = await loadKind(names, 'words');
      wordsMissing.textContent = missing.length ? `Introuvables: ${missing.join(', ')}` : '';
      toast('Listes Words chargées');
    }));
    this.unsubs.push(on(root.querySelector('#btnWordsClear'), 'click', () => {
      state.clearWords();
      wordsMissing.textContent = '';
      refreshStats();
      toast('Listes Words vidées');
    }));

    this.unsubs.push(on(root.querySelector('#btnCatsLoad'), 'click', async () => {
      const names = parseNames(catsInput.value);
      const { missing } = await loadKind(names, 'categories');
      catsMissing.textContent = missing.length ? `Introuvables: ${missing.join(', ')}` : '';
      toast('Listes des categories chargées');
    }));
    this.unsubs.push(on(root.querySelector('#btnCatsClear'), 'click', () => {
      state.clearCategories();
      catsMissing.textContent = '';
      refreshStats();
      toast('Catégories vidées');
    }));
  }

  unmount() { this.unsubs.forEach(off => off()); this.unsubs = []; }
}
