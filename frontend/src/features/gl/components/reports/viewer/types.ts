export interface EnterpriseReportViewerProps {
  reportName: string;
  onClose?: () => void;
}

export interface BalanceSheetNode {
  id: string;
  description: string;
  balance?: number;
  balances?: number[];
  children?: BalanceSheetNode[];
  isTotal?: boolean;
  isHeader?: boolean;
}

export type FlatNode = {
  node: BalanceSheetNode;
  level: number;
};

export interface ReportRowItemFlatProps {
  flatNode: FlatNode;
  isExpanded: boolean;
  onToggle: () => void;
  isMultiPeriod?: boolean;
  isCompareMonth?: boolean;
  isBudgetPeriod?: boolean;
  isCompareBudget?: boolean;
  isCommonSized?: boolean;
  isConsolidation?: boolean;
  isCompareBudgetPeriod?: boolean;
  isRetainedEarning?: boolean;
  isFinancialHighlight?: boolean;
  isCashFlowDetail?: boolean;
  isTrialBalanceClassic?: boolean;
  isTrialBalanceStandard?: boolean;
  totalAssets?: number;
  isLandscape?: boolean;
}
