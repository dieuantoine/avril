import { load, save } from './storage.js';
import { loadGames } from './services/gamesService.js';

const KEYS = {
  WORDS: 'AVRIL_WORDS',
  CATEGORIES: 'AVRIL_CATEGORIES',
  SELECTED_GAMES: 'AVRIL_SELECTED_GAMES',
  GAME_PARAMS: 'AVRIL_GAME_PARAMS',
  WORDS_FILES: 'AVRIL_WORDS_FILES',
  CATEGORIES_FILES: 'AVRIL_CATEGORIES_FILES',
};

export const state = {
  games: [],
  words: [],
  categories: [],
  selectedGames: [],
  gameParams: {},

  wordsFiles: [],
  categoriesFiles: [],

  async init() {
    this.games = await loadGames();
    this.words = load(KEYS.WORDS, []);
    this.categories = load(KEYS.CATEGORIES, []);
    this.selectedGames = load(KEYS.SELECTED_GAMES, []);
    this.gameParams = load(KEYS.GAME_PARAMS, {});
    this.wordsFiles = load(KEYS.WORDS_FILES, []);
    this.categoriesFiles = load(KEYS.CATEGORIES_FILES, []);
  },

  setWords(lines) {
    this.words = Array.from(new Set(lines.filter(Boolean)));
    save(KEYS.WORDS, this.words);
  },
  clearWords() { this.setWords([]); this.setWordsFiles([]); },

  setCategories(lines) {
    this.categories = Array.from(new Set(lines.filter(Boolean)));
    save(KEYS.CATEGORIES, this.categories);
  },
  clearCategories() { this.setCategories([]); this.setCategoriesFiles([]); },

  setSelectedGames(ids) {
    this.selectedGames = ids;
    save(KEYS.SELECTED_GAMES, this.selectedGames);
  },

  setGameParams(id, params) {
    this.gameParams = { ...this.gameParams, [id]: params };
    save(KEYS.GAME_PARAMS, this.gameParams);
  },

  setWordsFiles(names) {
    this.wordsFiles = names;
    save(KEYS.WORDS_FILES, this.wordsFiles);
  },
  setCategoriesFiles(names) {
    this.categoriesFiles = names;
    save(KEYS.CATEGORIES_FILES, this.categoriesFiles);
  },
};
