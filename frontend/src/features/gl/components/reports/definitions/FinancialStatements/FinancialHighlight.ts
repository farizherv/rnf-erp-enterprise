import type { ReportDefinition } from '../types';
import { generateFinancialHighlightData } from '../../viewer/data';

export const FinancialHighlight: ReportDefinition = {
  id: 'fs_highlight',
  title: 'Financial Highlight',
  generateData: (params) => {
    const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
      const f = new Date(params.periodFrom); const t = new Date(params.periodTo);
      let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
      return d < 1 ? 1 : d;
    })() : 3;
    const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : new Date().getFullYear();
    return generateFinancialHighlightData(year);
  },
  layoutConfig: {
      "isFinancialHighlight": true
  }
};
