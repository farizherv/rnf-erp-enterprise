const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/features/gl/components/reports/EnterpriseReportViewer.tsx');
const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

const imports = "import { BalanceSheetNode } from './types';\n\n";

// Lines are 0-indexed in JS. We want lines 33 to 649 (1-indexed), so slice(32, 649).
const dataLines = lines.slice(32, 649);

// Add export to all const declarations in dataLines
const exportedDataLines = dataLines.map(line => {
  if (line.startsWith('const ')) {
    return line.replace('const ', 'export const ');
  }
  return line;
});

const outPath = path.join(__dirname, 'src/features/gl/components/reports/viewer/data.ts');
fs.writeFileSync(outPath, imports + exportedDataLines.join('\n'));
console.log('Successfully extracted data.ts');
