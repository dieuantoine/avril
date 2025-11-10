export function sanitizeTxtName(raw) {
  const name = String(raw || '').trim();
  if (!name) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(name)) return null;
  return name.endsWith('.txt') ? name : name + '.txt';
}

export function toWordlistPath(safeName) {
  return `./data/wordlists/${safeName}`;
}

export async function fetchTextOrNull(path) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
