import type { ReportDefinition } from '../types';
import { generateCashFlowDetailData } from '../../viewer/data';

export const CashFlowDirect: ReportDefinition = {
  id: 'fs_cf_dir',
  title: 'Statement of Cash Flows (Direct Method)',
  generateData: (params) => {
    const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
      const f = new Date(params.periodFrom); const t = new Date(params.periodTo);
      let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
      return d < 1 ? 1 : d;
    })() : 3;
    const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : new Date().getFullYear();
    return generateCashFlowDetailData();
  },
  layoutConfig: {
      "isCashFlowDetail": true
  }
};
