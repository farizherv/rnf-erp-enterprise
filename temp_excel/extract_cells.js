const fs = require('fs');
const xlsx = require('xlsx');

const workbook = xlsx.readFile('/Users/farizherv/Desktop/Template Dokumen RNF.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const targets = ['Voucher No.', 'Reference', 'Date', 'No', 'Account No', 'Account Name', 'Debit', 'Credit', 'Memo', 'Say:', 'Prepared by', 'Approved by'];

for (const cellAddress in sheet) {
  if (cellAddress[0] === '!') continue;
  const cell = sheet[cellAddress];
  const value = cell.v ? cell.v.toString().trim() : '';
  
  if (targets.some(t => value.includes(t))) {
    console.log(`${cellAddress}: ${value}`);
  }
}
