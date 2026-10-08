import type { ReportDefinition } from '../types';
import { TRIAL_BALANCE_DATA } from '../../viewer/data';

export const TrialBalance: ReportDefinition = {
  id: 'gl_trial_balance',
  title: 'Trial Balance',
  generateData: () => TRIAL_BALANCE_DATA,
  layoutConfig: {
    isTrialBalanceStandard: true
  },
  behavior: {
    requiresDateRange: false
  }
};
