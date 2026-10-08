import type { ReportDefinition } from '../types';
import { generateOwnerEquityData } from '../../viewer/data';

export const OwnersEquity: ReportDefinition = {
  id: 'fs_oe_std',
  title: "Statement of Owner's Equity Changes",
  generateData: (params) => {
    const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
      const f = new Date(params.periodFrom); const t = new Date(params.periodTo);
      let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
      return d < 1 ? 1 : d;
    })() : 3;
    const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : new Date().getFullYear();
    return generateOwnerEquityData(year);
  },
  layoutConfig: {}
};
