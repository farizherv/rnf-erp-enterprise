import type { ReportDefinition } from '../../types';

export const ReturnOnEquityGraph: ReportDefinition = {
  id: 'fs_roe_graph',
  title: 'Return On Equity Graph',
  isGraphView: true,
  isLandscape: true,
  generateData: () => [],
  layoutConfig: {}
};
