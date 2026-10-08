import type { ReportDefinition } from '../../types';

export const NetWorthGraph: ReportDefinition = {
  id: 'fs_nw_graph',
  title: 'Net Worth Graph',
  isGraphView: true,
  isLandscape: true,
  generateData: () => [],
  layoutConfig: {}
};
