const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/features/gl/components/reports/EnterpriseReportViewer.tsx');
const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

const startData = 16; // interface EnterpriseReportViewerProps {
const endData = lines.findIndex(l => l.includes('export const EnterpriseReportViewer: React.FC'));

const newImports = `
import { EnterpriseReportViewerProps, FlatNode } from './viewer/types';
import { 
  BALANCE_SHEET_DATA, PROFIT_AND_LOSS_DATA, 
  generateCashFlowDetailData, generateOwnerEquityData, generateFinancialHighlightData, 
  generateRetainedEarningData, generateMultiPeriodData, generateBudgetData, 
  generateCompareBudgetData, generateConsolidationData, generateCompareBudgetPeriodData 
} from './viewer/data';
import { getInitialExpandedNodes, getVisibleRows, formatCurrency } from './viewer/utils';
import { ReportRowItemFlat } from './viewer/components/ReportRowItemFlat';
import { EnterpriseFinancialChart } from './viewer/components/EnterpriseFinancialChart';
`;

// Build the final array
const beforeImports = lines.slice(0, 16); // up to interface EnterpriseReportViewerProps
const afterData = lines.slice(endData); // from export const EnterpriseReportViewer to end

const finalCode = beforeImports.join('\n') + newImports + '\n' + afterData.join('\n');
fs.writeFileSync(filePath, finalCode);

console.log('Successfully stripped viewer.');
