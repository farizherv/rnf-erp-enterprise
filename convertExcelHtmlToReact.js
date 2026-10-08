const fs = require('fs');

const html = fs.readFileSync('/Users/farizherv/Desktop/Template Dokumen RNF.html', 'utf8');

// Extract the style block
const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
let styleContent = styleMatch ? styleMatch[1] : '';
// Clean up style content for JSX
styleContent = styleContent.replace(/<!--/g, '').replace(/-->/g, '');

// Extract the body content (the table)
const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
let tableContent = tableMatch ? tableMatch[0] : '';

// Basic HTML to JSX conversions
tableContent = tableContent
  .replace(/class=/g, 'className=')
  .replace(/colspan=/g, 'colSpan=')
  .replace(/rowspan=/g, 'rowSpan=')
  .replace(/cellpadding=/g, 'cellPadding=')
  .replace(/cellspacing=/g, 'cellSpacing=')
  .replace(/valign=/g, 'vAlign=')
  .replace(/bgcolor=/g, 'bgColor=')
  .replace(/<col ([^>]+)>/g, '<col $1 />')
  .replace(/<img ([^>]+)>/g, '<img $1 />')
  .replace(/<br>/g, '<br />');

// Convert inline styles to React style objects
tableContent = tableContent.replace(/style='([^']+)'/g, (match, styleString) => {
  const styles = styleString.split(';').filter(s => s.trim() !== '');
  const styleObj = {};
  styles.forEach(s => {
    let [key, value] = s.split(':');
    if (!key || !value) return;
    key = key.trim();
    value = value.trim();
    // camelCase the key
    const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
    styleObj[camelKey] = value;
  });
  return `style={${JSON.stringify(styleObj)}}`;
});

// Remove VML comments and unsupported tags
tableContent = tableContent.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/g, '');
tableContent = tableContent.replace(/<v:shapetype[\s\S]*?<\/v:shapetype>/g, '');
tableContent = tableContent.replace(/<v:shape[\s\S]*?<\/v:shape>/g, '');
tableContent = tableContent.replace(/<o:lock[^>]*\/>/g, '');

const componentCode = `
import React from 'react';

export const ExcelPrintTemplate = () => {
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: \`${styleContent}\` }} />
      ${tableContent}
    </div>
  );
};
`;

fs.writeFileSync('frontend/src/features/gl/components/ExcelPrintTemplate.tsx', componentCode);
console.log('Conversion done!');
