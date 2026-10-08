import type { BalanceSheetNode } from '../viewer/types';

export interface ReportDefinition {
  /**
   * Nama internal/identifikasi laporan
   */
  id: string;

  /**
   * Judul laporan yang akan ditampilkan di kertas cetak
   */
  title: string;

  /**
   * Menentukan apakah ini adalah laporan berbasis grafik (Dashboard)
   * Jika true, viewer akan merender <EnterpriseFinancialChart />
   */
  isGraphView?: boolean;

  /**
   * Menentukan apakah laporan menggunakan format lansekap kertas A4
   */
  isLandscape?: boolean;

  /**
   * Fungsi generator untuk mengambil dan menyusun data hirarkis (Table Grid)
   */
  generateData?: (params?: any) => BalanceSheetNode[];

  /**
   * Menentukan konfigurasi layout kolom kustom untuk laporan ini.
   * Properti ini akan dibaca oleh komponen ReportRowItemFlat.
   */
  layoutConfig?: {
    isMultiPeriod?: boolean;
    isCompareMonth?: boolean;
    isBudgetPeriod?: boolean;
    isCompareBudget?: boolean;
    isCompareBudgetPeriod?: boolean;
    isConsolidation?: boolean;
    isCommonSized?: boolean;
    isRetainedEarning?: boolean;
    isFinancialHighlight?: boolean;
    isCashFlowDetail?: boolean;
    isCashFlowSummary?: boolean;
    isTrialBalanceStandard?: boolean;
  };

  /**
   * Tambahan properti spesifik per laporan
   */
  meta?: any;
}
