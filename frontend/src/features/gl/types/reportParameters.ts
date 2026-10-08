export type DatePreset = 
  | 'CUSTOM' 
  | 'TODAY' 
  | 'THIS_WEEK' 
  | 'THIS_MONTH' 
  | 'LAST_MONTH' 
  | 'THIS_QUARTER' 
  | 'LAST_QUARTER' 
  | 'YTD' 
  | 'THIS_YEAR'
  | 'FISCAL_PERIOD';

export type OutputType = 'HTML_GRID' | 'PDF' | 'EXCEL';

export interface SavedFilterProfile {
  id: string;
  name: string;
  params: ReportParameters;
}

export interface ReportParameters {
  branches: string[];
  periodFrom: string;
  periodTo: string;
  comparePeriodFrom?: string;
  comparePeriodTo?: string;
  datePreset: DatePreset;
  compareTo: string;
  
  // Enterprise Advanced Filters (SAP/Odoo Standard)
  ledger: string;            // '0L' (Local GAAP) | '2L' (IFRS)
  scenario: string;          // 'ACT' (Actuals) | 'BUD' (Budget) | 'FOR' (Forecast)
  costCenters: string[];     // Multi-select Cost Centers
  businessArea: string;      // 'ALL' | 'BA01' | 'BA02'
  
  // Legacy / Single-select fallbacks
  costCenter?: string;
  
  currency: string;
  
  // Accounting Toggles
  includeUnposted: boolean;
  hideZeroBalance: boolean;
}
