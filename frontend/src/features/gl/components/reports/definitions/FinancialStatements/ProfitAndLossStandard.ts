import type { ReportDefinition } from '../types';
import { PROFIT_AND_LOSS_DATA } from '../../viewer/data';

export const ProfitAndLossStandard: ReportDefinition = {
  id: 'fs_pl_std',
  title: 'Profit & Loss (Standard)',
  generateData: () => PROFIT_AND_LOSS_DATA,
  layoutConfig: {}
};
