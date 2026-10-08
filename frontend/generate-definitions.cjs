const fs = require('fs');
const path = require('path');

const defsPath = path.join(__dirname, 'src/features/gl/components/reports/definitions/FinancialStatements');
const graphsPath = path.join(defsPath, 'Graphs');

if (!fs.existsSync(graphsPath)) {
  fs.mkdirSync(graphsPath, { recursive: true });
}

// Data definitions
const reports = [
  // Balance Sheet
  { name: 'BalanceSheetParentScontro', id: 'fs_bs_parent', title: 'Balance Sheet (Parent Scontro)', isBS: true, config: {} },
  { name: 'BalanceSheetMultiPeriod', id: 'fs_bs_multi', title: 'Balance Sheet (Multi Period)', isBS: true, config: { isMultiPeriod: true } },
  { name: 'BalanceSheetCompareMonth', id: 'fs_bs_comp_month', title: 'Balance Sheet (Compare Month)', isBS: true, config: { isCompareMonth: true } },
  { name: 'BalanceSheetBudgetPeriod', id: 'fs_bs_budg_per', title: 'Balance Sheet (Budget Period)', isBS: true, config: { isBudgetPeriod: true } },
  { name: 'BalanceSheetCompareBudget', id: 'fs_bs_comp_budg', title: 'Balance Sheet (Compare Budget)', isBS: true, config: { isCompareBudget: true } },
  { name: 'BalanceSheetCompareBudgetPeriod', id: 'fs_bs_comp_budg_per', title: 'Balance Sheet (Compare Budget Period)', isBS: true, config: { isCompareBudgetPeriod: true } },
  { name: 'BalanceSheetCommonSized', id: 'fs_bs_common', title: 'Balance Sheet (Common Sized)', isBS: true, config: { isCommonSized: true } },
  { name: 'BalanceSheetConsolidation', id: 'fs_bs_consol', title: 'Balance Sheet (Consolidation)', isBS: true, config: { isConsolidation: true } },
  
  // Profit & Loss
  { name: 'ProfitAndLossMultiPeriod', id: 'fs_pl_multi', title: 'Profit & Loss (Multi Period)', isPL: true, config: { isMultiPeriod: true } },
  { name: 'ProfitAndLossComparePeriod', id: 'fs_pl_comp_per', title: 'Profit & Loss (Compare Period)', isPL: true, config: { isCompareMonth: true } },
  { name: 'ProfitAndLossBudgetPeriod', id: 'fs_pl_budg_per', title: 'Profit & Loss (Budget Period)', isPL: true, config: { isBudgetPeriod: true } },
  { name: 'ProfitAndLossCompareBudget', id: 'fs_pl_comp_budg', title: 'Profit & Loss (Compare Budget)', isPL: true, config: { isCompareBudget: true } },
  { name: 'ProfitAndLossCompareBudgetPeriod', id: 'fs_pl_comp_budg_per', title: 'Profit & Loss (Compare Budget Period)', isPL: true, config: { isCompareBudgetPeriod: true } },
  { name: 'ProfitAndLossConsolidation', id: 'fs_pl_consol', title: 'Profit & Loss (Consolidation)', isPL: true, config: { isConsolidation: true } },

  // Special Reports
  { name: 'RetainedEarning', id: 'fs_re_std', title: 'Retained Earning Statement', isRE: true, config: { isRetainedEarning: true } },
  { name: 'FinancialHighlight', id: 'fs_highlight', title: 'Financial Highlight', isFH: true, config: { isFinancialHighlight: true } },
  { name: 'OwnersEquity', id: 'fs_oe_std', title: "Statement of Owner's Equity Changes", isOE: true, config: {} },
  { name: 'CashFlowDetailIndirect', id: 'fs_cf_det_indir', title: 'Statement of Cash Flows Detail (Indirect Method)', isCFDetail: true, config: { isCashFlowDetail: true } },
  { name: 'CashFlowDirect', id: 'fs_cf_dir', title: 'Statement of Cash Flows (Direct Method)', isCFDetail: true, config: { isCashFlowDetail: true } },
  { name: 'MonthlyCashFlowDetail', id: 'fs_cf_det_indir_mo', title: 'Monthly Statement of Cash Flows Detail (Indirect Method)', isCFDetail: true, config: { isCashFlowDetail: true, isMultiPeriod: true } },
  { name: 'MonthlyCashFlowDirect', id: 'fs_cf_dir_mo', title: 'Monthly Statement of Cash Flows (Direct Method)', isCFDetail: true, config: { isCashFlowDetail: true, isMultiPeriod: true } },

  // Graphs
  { name: 'AccountValueComparisonGraph', id: 'fs_acc_val_graph', title: 'Account Value Comparison Graph', isGraph: true, config: {} },
  { name: 'NetWorthGraph', id: 'fs_nw_graph', title: 'Net Worth Graph', isGraph: true, config: {} },
  { name: 'LiquidityRatioGraph', id: 'fs_liq_graph', title: 'Liquidity Ratio Graph', isGraph: true, config: {} },
  { name: 'ReturnOnAssetGraph', id: 'fs_roa_graph', title: 'Return on Asset Graph', isGraph: true, config: {} },
  { name: 'ReturnOnEquityGraph', id: 'fs_roe_graph', title: 'Return On Equity Graph', isGraph: true, config: {} },
];

let indexImports = [];
let indexMap = [];

reports.forEach(r => {
  const isGraph = !!r.isGraph;
  const fileName = r.name + '.ts';
  const filePath = path.join(isGraph ? graphsPath : defsPath, fileName);
  
  let imports = `import type { ReportDefinition } from '${isGraph ? '../../' : '../'}types';\n`;
  let dataGen = `[]`;

  if (r.isBS || r.isPL) {
    imports += `import { BALANCE_SHEET_DATA, PROFIT_AND_LOSS_DATA, generateMultiPeriodData, generateBudgetData, generateCompareBudgetData, generateConsolidationData, generateCompareBudgetPeriodData } from '${isGraph ? '../../../' : '../../'}viewer/data';\n`;
    
    const baseData = r.isBS ? 'BALANCE_SHEET_DATA' : 'PROFIT_AND_LOSS_DATA';
    
    if (r.config.isCompareBudgetPeriod) dataGen = `generateCompareBudgetPeriodData(${baseData}, monthDiff, monthDiff > 1)`;
    else if (r.config.isConsolidation) dataGen = `generateConsolidationData(${baseData})`;
    else if (r.config.isCompareBudget) dataGen = `generateCompareBudgetData(${baseData})`;
    else if (r.config.isCompareMonth) dataGen = `generateMultiPeriodData(${baseData}, 2)`;
    else if (r.config.isBudgetPeriod) dataGen = `generateBudgetData(${baseData}, monthDiff, monthDiff > 1)`;
    else if (r.config.isMultiPeriod) dataGen = `generateMultiPeriodData(${baseData}, monthDiff, monthDiff > 1)`;
    else dataGen = baseData;
  } else if (r.isRE) {
    imports += `import { generateRetainedEarningData } from '../../viewer/data';\n`;
    dataGen = `generateRetainedEarningData(year)`;
  } else if (r.isFH) {
    imports += `import { generateFinancialHighlightData } from '../../viewer/data';\n`;
    dataGen = `generateFinancialHighlightData(year)`;
  } else if (r.isOE) {
    imports += `import { generateOwnerEquityData } from '../../viewer/data';\n`;
    dataGen = `generateOwnerEquityData(year)`;
  } else if (r.isCFDetail) {
    imports += `import { generateCashFlowDetailData } from '../../viewer/data';\n`;
    dataGen = `generateCashFlowDetailData()`;
  }

  const generateDataFn = isGraph ? `generateData: () => [],` : 
    `generateData: (params) => {
    const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
      const f = new Date(params.periodFrom); const t = new Date(params.periodTo);
      let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
      return d < 1 ? 1 : d;
    })() : 3;
    const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : new Date().getFullYear();
    return ${dataGen};
  },`;

  const content = `${imports}
export const ${r.name}: ReportDefinition = {
  id: '${r.id}',
  title: '${r.title}',
${isGraph ? '  isGraphView: true,\n  isLandscape: true,\n' : ''}  ${generateDataFn}
  layoutConfig: ${JSON.stringify(r.config, null, 4).replace(/\n/g, '\n  ')}
};
`;

  fs.writeFileSync(filePath, content);
  
  const importPath = isGraph ? `./FinancialStatements/Graphs/${r.name}` : `./FinancialStatements/${r.name}`;
  indexImports.push(`import { ${r.name} } from '${importPath}';`);
  indexMap.push(`  "${r.title.toLowerCase()}": ${r.name},`);
});

// Update index.ts
const indexPath = path.join(__dirname, 'src/features/gl/components/reports/definitions/index.ts');
const existingIndex = fs.readFileSync(indexPath, 'utf-8');

const newIndex = existingIndex.replace(
  `import { IncomeAndExpenseGraph } from './FinancialStatements/Graphs/IncomeAndExpenseGraph';`,
  `import { IncomeAndExpenseGraph } from './FinancialStatements/Graphs/IncomeAndExpenseGraph';\n${indexImports.join('\n')}`
).replace(
  `'income and expense graph': IncomeAndExpenseGraph,`,
  `'income and expense graph': IncomeAndExpenseGraph,\n${indexMap.join('\n')}`
);

fs.writeFileSync(indexPath, newIndex);

console.log('Successfully generated ' + reports.length + ' definition files and updated index.ts');
