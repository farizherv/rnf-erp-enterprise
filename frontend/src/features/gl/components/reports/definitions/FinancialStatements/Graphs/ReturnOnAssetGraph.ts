import type { ReportDefinition } from '../../types';

export const ReturnOnAssetGraph: ReportDefinition = {
  id: 'fs_roa_graph',
  title: 'Return on Asset Graph',
  isGraphView: true,
  isLandscape: true,
  generateData: () => [],
  layoutConfig: {}
};
