export async function parseTextFiles(fileList) {
const files = Array.from(fileList || []);
const all = [];
for (const f of files) {
const text = await f.text();
const lines = text
.split(/\r?\n/)
.map(s => s.trim())
.filter(s => s.length > 0);
all.push(...lines);
}
return Array.from(new Set(all));
}