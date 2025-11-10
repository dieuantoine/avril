export function parseTextToLines(text) {
  return text
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function mergeUnique(arraysOfStrings) {
  const set = new Set();
  arraysOfStrings.forEach(arr => arr.forEach(s => set.add(s)));
  return Array.from(set);
}
