import type { ReportDefinition } from '../types';
import { BALANCE_SHEET_DATA, PROFIT_AND_LOSS_DATA, generateMultiPeriodData, generateBudgetData, generateCompareBudgetData, generateConsolidationData, generateCompareBudgetPeriodData } from '../../viewer/data';

export const ProfitAndLossConsolidation: ReportDefinition = {
  id: 'fs_pl_consol',
  title: 'Profit & Loss (Consolidation)',
  generateData: (params) => {
    const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
      const f = new Date(params.periodFrom); const t = new Date(params.periodTo);
      let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
      return d < 1 ? 1 : d;
    })() : 3;
    const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : new Date().getFullYear();
    return generateConsolidationData(PROFIT_AND_LOSS_DATA);
  },
  layoutConfig: {
      "isConsolidation": true
  }
};
