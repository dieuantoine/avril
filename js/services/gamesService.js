export async function loadGames() {
const res = await fetch('./data/games.json', { cache: 'no-cache' });
if (!res.ok) throw new Error('Impossible de charger games.json');
return await res.json();
}