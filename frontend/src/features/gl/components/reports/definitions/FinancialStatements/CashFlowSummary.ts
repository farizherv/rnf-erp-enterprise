import type { ReportDefinition } from '../types';
import { generateCashFlowSummaryData } from '../../viewer/data';

export const CashFlowSummary: ReportDefinition = {
  id: 'fs_cf_sum_indir',
  title: 'Statement of Cash Flows Summary (Indirect Method)',
  generateData: () => generateCashFlowSummaryData(),
  layoutConfig: {
    isCashFlowDetail: true // using the same UI layout component
  }
};
