import { load, save } from './storage.js';
import { loadGames } from './services/gamesService.js';


const KEYS = {
WORD_LISTS: 'AVRIL_WORD_LISTS',
SELECTED_GAMES: 'AVRIL_SELECTED_GAMES',
GAME_PARAMS: 'AVRIL_GAME_PARAMS', // dictionnaire par id
};


export const state = {
games: [],
wordLists: [], // tableau de mots (dédupliqués)
selectedGames: [], // [ids]
gameParams: {}, // { [id]: {min,max,batchSize} }


async init() {
this.games = await loadGames();
this.wordLists = load(KEYS.WORD_LISTS, []);
this.selectedGames = load(KEYS.SELECTED_GAMES, []);
this.gameParams = load(KEYS.GAME_PARAMS, {});
},


setWordLists(words) {
this.wordLists = Array.from(new Set(words.filter(Boolean)));
save(KEYS.WORD_LISTS, this.wordLists);
},
clearWordLists() { this.setWordLists([]); },


setSelectedGames(ids) {
this.selectedGames = ids;
save(KEYS.SELECTED_GAMES, this.selectedGames);
},


setGameParams(id, params) {
this.gameParams = { ...this.gameParams, [id]: params };
save(KEYS.GAME_PARAMS, this.gameParams);
},
};