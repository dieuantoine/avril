export const el = (tag, opts = {}) => Object.assign(document.createElement(tag), opts);
export const on = (node, ev, fn, opts) => { node.addEventListener(ev, fn, opts); return () => node.removeEventListener(ev, fn, opts); };
export const html = (strings, ...vals) => strings.reduce((a,s,i)=> a + s + (vals[i] ?? ''), '');
export const toast = (msg) => {
  const t = el('div', { className: 'toast', textContent: msg });
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 1800);
};
export const copyText = async (text) => {
  try { await navigator.clipboard.writeText(text); toast('Copié !'); }
  catch { toast('Impossible de copier'); }
};
