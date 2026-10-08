import type { ReportDefinition } from '../types';
import { BALANCE_SHEET_DATA } from '../../viewer/data';

export const BalanceSheetStandard: ReportDefinition = {
  id: 'fs_bs_std',
  title: 'Balance Sheet (Standard)',
  generateData: () => BALANCE_SHEET_DATA,
  layoutConfig: {}
};
