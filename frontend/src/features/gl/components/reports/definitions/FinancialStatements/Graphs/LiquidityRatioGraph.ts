import type { ReportDefinition } from '../../types';

export const LiquidityRatioGraph: ReportDefinition = {
  id: 'fs_liq_graph',
  title: 'Liquidity Ratio Graph',
  isGraphView: true,
  isLandscape: true,
  generateData: () => [],
  layoutConfig: {}
};
