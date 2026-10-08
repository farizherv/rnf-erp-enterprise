import type { ReportDefinition } from '../types';
import { TRIAL_BALANCE_DATA } from '../../viewer/data';

export const TrialBalanceClassic: ReportDefinition = {
  id: 'gl_trial_balance_classic',
  title: 'Trial Balance (Classic)',
  generateData: () => TRIAL_BALANCE_DATA,
  layoutConfig: {},
  behavior: {
    requiresDateRange: false
  }
};
