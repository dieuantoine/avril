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
        <p class="help">Indiquez les noms de fichiers présents dans <span class="mono">/data/wordlists</span>. Séparés par virgules, espaces ou retours à la ligne. Exemple : <span class="mono">animaux.txt, metiers.txt</span></p>
        <div class="row cols-2">
          <div>
            <label class="label" for="words-input">Fichiers</label>
            <textarea id="words-input" placeholder="animaux.txt\nmetiers.txt"></textarea>
            <div class="flex" style="margin-top:8px">
              <button id="btnWordsLoad">Charger</button>
              <button id="btnWordsClear" class="btn-secondary">Vider</button>
            </div>
          </div>
          <div>
            <div class="label">Statut</div>
            <div id="words-stats" class="help"></div>
            <div id="words-missing" class="help" style="margin-top:6px"></div>
          </div>
        </div>
      `}),
      el('section', { className: 'card', innerHTML: html`
        <h2>Listes de catégories (Categories)</h2>
        <p class="help">Même principe : noms de fichiers dans <span class="mono">/data/wordlists</span>. Exemple : <span class="mono">categories_sport.txt</span></p>
        <div class="row cols-2">
          <div>
            <label class="label" for="cats-input">Fichiers</label>
            <textarea id="cats-input" placeholder="categories_sport.txt\ncategories_film.txt"></textarea>
            <div class="flex" style="margin-top:8px">
              <button id="btnCatsLoad">Charger</button>
              <button id="btnCatsClear" class="btn-secondary">Vider</button>
            </div>
          </div>
          <div>
            <div class="label">Statut</div>
            <div id="cats-stats" class="help"></div>
            <div id="cats-missing" class="help" style="margin-top:6px"></div>
          </div>
        </div>
      `})
    );

    const wordsStats = root.querySelector('#words-stats');
    const wordsMissing = root.querySelector('#words-missing');
    const catsStats = root.querySelector('#cats-stats');
    const catsMissing = root.querySelector('#cats-missing');

    const refreshStats = () => {
      wordsStats.textContent = state.words.length
        ? `${state.words.length} entrée(s) chargée(s)`
        : 'Aucune entrée chargée';
      catsStats.textContent = state.categories.length
        ? `${state.categories.length} entrée(s) chargée(s)`
        : 'Aucune entrée chargée';
    };
    refreshStats();

    const parseNames = (raw) => {
      const items = String(raw || '')
        .split(/[\n,\s]+/)
        .map(s => s.trim())
        .filter(Boolean);
      const safe = items
        .map(sanitizeTxtName)
        .filter(Boolean);
      return Array.from(new Set(safe));
    };

    const loadKind = async (names, kind) => {
      const missing = [];
      const arrays = [];
      for (const name of names) {
        const path = toWordlistPath(name);
        const text = await fetchTextOrNull(path);
        if (!text) { missing.push(name); continue; }
        arrays.push(parseTextToLines(text));
      }
      const merged = mergeUnique(arrays);
      if (kind === 'words') state.setWords(merged); else state.setCategories(merged);
      refreshStats();
      return missing;
    };

    // Words handlers
    this.unsubs.push(on(root.querySelector('#btnWordsLoad'), 'click', async () => {
      const names = parseNames(root.querySelector('#words-input').value);
      const missing = await loadKind(names, 'words');
      wordsMissing.textContent = missing.length ? `Introuvables: ${missing.join(', ')}` : '';
      toast('Listes Words chargées');
    }));
    this.unsubs.push(on(root.querySelector('#btnWordsClear'), 'click', () => {
      state.clearWords(); refreshStats(); wordsMissing.textContent = ''; toast('Words vidées');
    }));

    // Categories handlers
    this.unsubs.push(on(root.querySelector('#btnCatsLoad'), 'click', async () => {
      const names = parseNames(root.querySelector('#cats-input').value);
      const missing = await loadKind(names, 'categories');
      catsMissing.textContent = missing.length ? `Introuvables: ${missing.join(', ')}` : '';
      toast('Listes Categories chargées');
    }));
    this.unsubs.push(on(root.querySelector('#btnCatsClear'), 'click', () => {
      state.clearCategories(); refreshStats(); catsMissing.textContent = ''; toast('Categories vidées');
    }));
  }

  unmount() { this.unsubs.forEach(off => off()); this.unsubs = []; }
}
