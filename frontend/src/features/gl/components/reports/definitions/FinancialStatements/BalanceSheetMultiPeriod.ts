import type { ReportDefinition } from '../types';
import { BALANCE_SHEET_DATA, PROFIT_AND_LOSS_DATA, generateMultiPeriodData, generateBudgetData, generateCompareBudgetData, generateConsolidationData, generateCompareBudgetPeriodData } from '../../viewer/data';

export const BalanceSheetMultiPeriod: ReportDefinition = {
  id: 'fs_bs_multi',
  title: 'Balance Sheet (Multi Period)',
  generateData: (params) => {
    const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
      const f = new Date(params.periodFrom); const t = new Date(params.periodTo);
      let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
      return d < 1 ? 1 : d;
    })() : 3;
    const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : new Date().getFullYear();
    return generateMultiPeriodData(BALANCE_SHEET_DATA, monthDiff, monthDiff > 1);
  },
  layoutConfig: {
      "isMultiPeriod": true
  }
};
