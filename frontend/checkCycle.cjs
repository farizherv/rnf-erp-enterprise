const fs = require('fs');
const content = fs.readFileSync('src/features/gl/data/coaInitialData.ts', 'utf8');
const lines = content.split('\n');
const accounts = [];
lines.forEach(line => {
  const idMatch = line.match(/id:\s*'([^']+)'/);
  const pidMatch = line.match(/parentId:\s*'([^']+)'/);
  if (idMatch) {
    accounts.push({ id: idMatch[1], parentId: pidMatch ? pidMatch[1] : null });
  }
});
const parentMap = {};
accounts.forEach(a => parentMap[a.id] = a.parentId);
let hasCycle = false;
for (let id in parentMap) {
  let curr = id;
  let visited = new Set();
  while (curr) {
    if (visited.has(curr)) { console.log('Cycle found at:', curr); hasCycle = true; break; }
    visited.add(curr);
    curr = parentMap[curr];
  }
}
if (!hasCycle) console.log('No cycles found.');
