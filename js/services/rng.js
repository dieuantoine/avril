export const randInt = (min, max) => {
const a = Math.ceil(Number(min));
const b = Math.floor(Number(max));
return Math.floor(Math.random() * (b - a + 1)) + a;
};
export const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const sample = (arr, k) => {
const copy = [...arr];
const out = [];
for (let i = 0; i < Math.min(k, copy.length); i++) {
const idx = Math.floor(Math.random() * copy.length);
out.push(copy.splice(idx, 1)[0]);
}
return out;
};