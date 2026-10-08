import type { ReportDefinition } from './types';
import { BalanceSheetStandard } from './FinancialStatements/BalanceSheetStandard';
import { ProfitAndLossStandard } from './FinancialStatements/ProfitAndLossStandard';
import { TrialBalance } from './GeneralLedger/TrialBalance';
import { TrialBalanceClassic } from './GeneralLedger/TrialBalanceClassic';
import { CashFlowSummary } from './FinancialStatements/CashFlowSummary';
import { IncomeAndExpenseGraph } from './FinancialStatements/Graphs/IncomeAndExpenseGraph';
import { BalanceSheetParentScontro } from './FinancialStatements/BalanceSheetParentScontro';
import { BalanceSheetMultiPeriod } from './FinancialStatements/BalanceSheetMultiPeriod';
import { BalanceSheetCompareMonth } from './FinancialStatements/BalanceSheetCompareMonth';
import { BalanceSheetBudgetPeriod } from './FinancialStatements/BalanceSheetBudgetPeriod';
import { BalanceSheetCompareBudget } from './FinancialStatements/BalanceSheetCompareBudget';
import { BalanceSheetCompareBudgetPeriod } from './FinancialStatements/BalanceSheetCompareBudgetPeriod';
import { BalanceSheetCommonSized } from './FinancialStatements/BalanceSheetCommonSized';
import { BalanceSheetConsolidation } from './FinancialStatements/BalanceSheetConsolidation';
import { ProfitAndLossMultiPeriod } from './FinancialStatements/ProfitAndLossMultiPeriod';
import { ProfitAndLossComparePeriod } from './FinancialStatements/ProfitAndLossComparePeriod';
import { ProfitAndLossBudgetPeriod } from './FinancialStatements/ProfitAndLossBudgetPeriod';
import { ProfitAndLossCompareBudget } from './FinancialStatements/ProfitAndLossCompareBudget';
import { ProfitAndLossCompareBudgetPeriod } from './FinancialStatements/ProfitAndLossCompareBudgetPeriod';
import { ProfitAndLossConsolidation } from './FinancialStatements/ProfitAndLossConsolidation';
import { RetainedEarning } from './FinancialStatements/RetainedEarning';
import { FinancialHighlight } from './FinancialStatements/FinancialHighlight';
import { OwnersEquity } from './FinancialStatements/OwnersEquity';
import { CashFlowDetailIndirect } from './FinancialStatements/CashFlowDetailIndirect';
import { CashFlowDirect } from './FinancialStatements/CashFlowDirect';
import { MonthlyCashFlowDetail } from './FinancialStatements/MonthlyCashFlowDetail';
import { MonthlyCashFlowDirect } from './FinancialStatements/MonthlyCashFlowDirect';
import { AccountValueComparisonGraph } from './FinancialStatements/Graphs/AccountValueComparisonGraph';
import { NetWorthGraph } from './FinancialStatements/Graphs/NetWorthGraph';
import { LiquidityRatioGraph } from './FinancialStatements/Graphs/LiquidityRatioGraph';
import { ReturnOnAssetGraph } from './FinancialStatements/Graphs/ReturnOnAssetGraph';
import { ReturnOnEquityGraph } from './FinancialStatements/Graphs/ReturnOnEquityGraph';

// Registry of all available report definitions
export const ReportDefinitionsRegistry: Record<string, ReportDefinition> = {
  // We can key them by the exact report name string used in the UI, or by ID.
  // For the POC, we'll map them by the lowercase report name to match existing logic.
  'balance sheet (standard)': BalanceSheetStandard,
  'profit & loss (standard)': ProfitAndLossStandard,
  'profit and loss (standard)': ProfitAndLossStandard, // Alias
  'trial balance': TrialBalance,
  'trial balance (classic)': TrialBalanceClassic,
  'statement of cash flows summary (indirect method)': CashFlowSummary,
  'income and expense graph': IncomeAndExpenseGraph,
  "balance sheet (parent scontro)": BalanceSheetParentScontro,
  "balance sheet (multi period)": BalanceSheetMultiPeriod,
  "balance sheet (compare month)": BalanceSheetCompareMonth,
  "balance sheet (budget period)": BalanceSheetBudgetPeriod,
  "balance sheet (compare budget)": BalanceSheetCompareBudget,
  "balance sheet (compare budget period)": BalanceSheetCompareBudgetPeriod,
  "balance sheet (common sized)": BalanceSheetCommonSized,
  "balance sheet (consolidation)": BalanceSheetConsolidation,
  "profit & loss (multi period)": ProfitAndLossMultiPeriod,
  "profit & loss (compare period)": ProfitAndLossComparePeriod,
  "profit & loss (budget period)": ProfitAndLossBudgetPeriod,
  "profit & loss (compare budget)": ProfitAndLossCompareBudget,
  "profit & loss (compare budget period)": ProfitAndLossCompareBudgetPeriod,
  "profit & loss (consolidation)": ProfitAndLossConsolidation,
  "retained earning statement": RetainedEarning,
  "financial highlight": FinancialHighlight,
  "statement of owner's equity changes": OwnersEquity,
  "statement of cash flows detail (indirect method)": CashFlowDetailIndirect,
  "statement of cash flows (direct method)": CashFlowDirect,
  "monthly statement of cash flows detail (indirect method)": MonthlyCashFlowDetail,
  "monthly statement of cash flows (direct method)": MonthlyCashFlowDirect,
  "account value comparison graph": AccountValueComparisonGraph,
  "net worth graph": NetWorthGraph,
  "liquidity ratio graph": LiquidityRatioGraph,
  "return on asset graph": ReturnOnAssetGraph,
  "return on equity graph": ReturnOnEquityGraph,
};

// Fallback loader
export const getReportDefinition = (reportName: string): ReportDefinition | null => {
  const normalized = reportName.toLowerCase().trim();
  return ReportDefinitionsRegistry[normalized] || null;
};
