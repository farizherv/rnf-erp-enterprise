import type { ReportDefinition } from '../../types';

export const IncomeAndExpenseGraph: ReportDefinition = {
  id: 'fs_inc_exp_graph',
  title: 'Income and Expense Graph',
  isGraphView: true,
  isLandscape: true, // Graphs usually need wide view
  generateData: () => [], // Graphs get their data directly in the chart component for now
  layoutConfig: {}
};
