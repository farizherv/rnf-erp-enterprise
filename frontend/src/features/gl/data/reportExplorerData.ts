import { 
  Building2, BookOpen, Landmark, Users, 
  ShoppingCart, PackageCheck, Briefcase, 
  Factory, Boxes, PieChart, FileCheck, Landmark as TaxIcon, Settings, Bookmark, PenTool
} from 'lucide-react';
import React from 'react';

export interface ReportItem {
  id: string;
  name: string;
  description?: string;
  group?: string;
  isCustom?: boolean;
  behavior?: {
    requiresDateRange?: boolean;
    requiresYearOnly?: boolean;
    defaultComparison?: 'NONE' | 'PREV_PERIOD' | 'PREV_YEAR' | 'BUDGET';
  };
}

export interface ReportCategory {
  id: string;
  name: string;
  icon: React.ElementType; // Lucide icon
  reports: ReportItem[];
}

export const reportCategories: ReportCategory[] = [
  {
    id: 'financial_statements',
    name: 'Financial Statements',
    icon: Building2,
    reports: [
      { id: 'fs_bs_std', name: 'Balance Sheet (Standard)', description: 'Laporan Neraca Standar menampilkan posisi keuangan perusahaan (Aset, Kewajiban, dan Ekuitas) pada tanggal tertentu.', group: 'bs', behavior: { requiresDateRange: false } },
      { id: 'fs_bs_scontro', name: 'Balance Sheet (Parent Scontro)', description: 'Laporan Neraca dalam format Skontro (menyamping) yang memisahkan Aset di kiri dan Pasiva di kanan.', group: 'bs', behavior: { requiresDateRange: false } },
      { id: 'fs_bs_multi', name: 'Balance Sheet (Multi Period)', description: 'Laporan Neraca Multi-Periode yang membandingkan saldo antar beberapa bulan berturut-turut.', group: 'bs', behavior: { requiresDateRange: true } },
      { id: 'fs_bs_cmp_month', name: 'Balance Sheet (Compare Month)', description: 'Laporan Neraca yang membandingkan bulan berjalan dengan bulan sebelumnya beserta nilai selisihnya.', group: 'bs', behavior: { requiresDateRange: true, defaultComparison: 'PREV_PERIOD' } },
      { id: 'fs_bs_budget', name: 'Balance Sheet (Budget Period)', description: 'Laporan Neraca yang menampilkan nilai anggaran (budget) yang telah ditetapkan untuk periode tersebut.', group: 'bs', behavior: { requiresDateRange: true } },
      { id: 'fs_bs_cmp_budget', name: 'Balance Sheet (Compare Budget)', description: 'Laporan Neraca yang membandingkan nilai aktual dengan anggaran (budget) untuk mengukur pencapaian As Of Date.', group: 'bs', behavior: { requiresDateRange: false, defaultComparison: 'BUDGET' } },
      { id: 'fs_bs_cmp_budget_period', name: 'Balance Sheet (Compare Budget Period)', description: 'Laporan Neraca komparasi multi-periode yang menjejerkan nilai Aktual melawan Budget secara kronologis.', group: 'bs', behavior: { requiresDateRange: true, defaultComparison: 'BUDGET' } },
      { id: 'fs_bs_common_size', name: 'Balance Sheet (Common Sized)', description: 'Laporan Analisis Vertikal yang menampilkan persentase proporsi setiap akun terhadap Total Aset.', group: 'bs', behavior: { requiresDateRange: false } },
      { id: 'fs_bs_consolidation', name: 'Balance Sheet (Consolidation)', description: 'Laporan Neraca Konsolidasi yang menggabungkan posisi keuangan dari beberapa cabang atau entitas anak.', group: 'bs', behavior: { requiresDateRange: false } },
      
      { id: 'fs_pl_std', name: 'Profit & Loss (Standard)', description: 'Laporan Laba Rugi Standar yang merangkum pendapatan dan beban untuk mengetahui laba/rugi bersih periode berjalan.', group: 'pl', behavior: { requiresDateRange: false } },
      { id: 'fs_pl_multi', name: 'Profit & Loss (Multi Period)', description: 'Laporan Laba Rugi yang menampilkan performa keuangan dari bulan ke bulan dalam satu tahun berjalan.', group: 'pl', behavior: { requiresDateRange: true } },
      { id: 'fs_pl_cmp_period', name: 'Profit & Loss (Compare Period)', description: 'Laporan Laba Rugi komparatif untuk membandingkan performa antara dua periode yang berbeda (MoM atau YoY).', group: 'pl', behavior: { requiresDateRange: true, defaultComparison: 'PREV_PERIOD' } },
      { id: 'fs_pl_budget', name: 'Profit & Loss (Budget Period)', description: 'Laporan Laba Rugi yang berfokus pada target anggaran (budget) pendapatan dan pengeluaran.', group: 'pl', behavior: { requiresDateRange: true } },
      { id: 'fs_pl_cmp_budget', name: 'Profit & Loss (Compare Budget)', description: 'Analisis varians yang membandingkan Laba Rugi aktual terhadap anggaran (Budget) yang ditetapkan.', group: 'pl', behavior: { requiresDateRange: true, defaultComparison: 'BUDGET' } },
      { id: 'fs_pl_cmp_budget_period', name: 'Profit & Loss (Compare Budget Period)', description: 'Laporan Laba Rugi komparasi multi-periode yang menjejerkan nilai Aktual melawan Budget secara kronologis.', group: 'pl', behavior: { requiresDateRange: true, defaultComparison: 'BUDGET' } },
      { id: 'fs_pl_consolidation', name: 'Profit & Loss (Consolidation)', description: 'Laporan Laba Rugi Konsolidasi dari seluruh cabang atau anak perusahaan dalam satu kesatuan.', group: 'pl', behavior: { requiresDateRange: true } },
      
      { id: 'fs_retained_earning', name: 'Retained Earning Statement', description: 'Laporan Perubahan Laba Ditahan yang merinci akumulasi laba perusahaan setelah pembagian dividen.', group: 'eq', behavior: { requiresYearOnly: true } },
      { id: 'fs_highlight', name: 'Financial Highlight', description: 'Ringkasan rasio dan metrik keuangan utama (Financial Highlights) untuk analisis cepat tingkat eksekutif.', group: 'eq', behavior: { requiresYearOnly: true } },
      
      { id: 'fs_cf_detail_ind', name: 'Statement of Cash Flows Detail (Indirect Method)', description: 'Laporan Arus Kas (Metode Tidak Langsung) yang menampilkan detail penyesuaian laba bersih ke arus kas operasional.', group: 'cf', behavior: { requiresDateRange: true } },
      { id: 'fs_cf_sum_ind', name: 'Statement of Cash Flows Summary (Indirect Method)', description: 'Ringkasan Laporan Arus Kas (Metode Tidak Langsung) untuk gambaran cepat likuiditas perusahaan.', group: 'cf', behavior: { requiresDateRange: true } },
      { id: 'fs_cf_direct', name: 'Statement of Cash Flows (Direct Method)', description: 'Laporan Arus Kas (Metode Langsung) yang mencatat penerimaan dan pengeluaran kas aktual secara detail.', group: 'cf' },
      { id: 'fs_cf_monthly_ind', name: 'Monthly Statement of Cash Flows Detail (Indirect Method)', description: 'Laporan Arus Kas bulanan secara mendetail untuk memantau tren likuiditas setiap bulan.', group: 'cf' },
      { id: 'fs_cf_monthly_dir', name: 'Monthly Statement of Cash Flows (Direct Method)', description: 'Tren Arus Kas bulanan menggunakan metode langsung berbasis transaksi aktual.', group: 'cf' },
      { id: 'fs_owner_equity', name: 'Statement of Owner\'s Equity Changes', description: 'Laporan Perubahan Modal/Ekuitas pemilik yang mencatat investasi, penarikan, dan laba yang ditahan.', group: 'cf' },

      { id: 'fs_graph_val_cmp', name: 'Account Value Comparison Graph', description: 'Grafik analitik yang membandingkan nilai saldo akun-akun tertentu secara visual.', group: 'graph', behavior: { requiresYearOnly: true } },
      { id: 'fs_graph_inc_exp', name: 'Income and Expense Graph', description: 'Visualisasi grafik pergerakan Pemasukan (Income) melawan Pengeluaran (Expense) dari waktu ke waktu.', group: 'graph', behavior: { requiresYearOnly: true } },
      { id: 'fs_graph_net_worth', name: 'Net Worth Graph', description: 'Grafik tren Kekayaan Bersih (Net Worth) perusahaan yang membandingkan total aset terhadap kewajiban.', group: 'graph', behavior: { requiresYearOnly: true } },
      { id: 'fs_graph_liquidity', name: 'Liquidity Ratio Graph', description: 'Grafik Rasio Likuiditas (Current Ratio, Quick Ratio) untuk memantau kesehatan finansial jangka pendek.', group: 'graph', behavior: { requiresYearOnly: true } },
      { id: 'fs_graph_roa', name: 'Return on Asset Graph', description: 'Grafik ROA (Return on Asset) yang menunjukkan seberapa efisien perusahaan menggunakan aset untuk mencetak laba.', group: 'graph', behavior: { requiresYearOnly: true } },
      { id: 'fs_graph_roe', name: 'Return On Equity Graph', description: 'Grafik ROE (Return on Equity) yang mengukur tingkat pengembalian investasi bagi para pemegang saham.', group: 'graph', behavior: { requiresYearOnly: true } },
    ]
  },
  {
    id: 'general_ledger',
    name: 'General Ledger',
    icon: BookOpen,
    reports: [
      { id: 'gl_history', name: 'General Ledger History', description: 'Riwayat historis Buku Besar yang merangkum seluruh pergerakan saldo per akun secara berurutan.', group: 'gl' },
      { id: 'gl_all_journals', name: 'All Journals', description: 'Daftar komprehensif seluruh jurnal akuntansi (General, Sales, Purchase, dll) tanpa terkecuali.', group: 'gl' },
      { id: 'gl_summary', name: 'General Ledger Summary', description: 'Ringkasan Buku Besar yang menampilkan rekap mutasi debit/kredit per akun dalam satu baris ringkas.', group: 'gl' },
      { id: 'gl_detail', name: 'General Ledger Detail', description: 'Buku Besar terperinci yang mencatat semua transaksi individual untuk setiap akun perkiraan.', group: 'gl' },
      { id: 'gl_trial_balance', name: 'Trial Balance', description: 'Laporan Neraca Saldo modern untuk memverifikasi keseimbangan total debit dan kredit pada periode tertentu.', group: 'gl', behavior: { requiresDateRange: false } },
      { id: 'gl_trial_balance_classic', name: 'Trial Balance (Classic)', description: 'Neraca Saldo format 4-kolom klasik (Opening, Debit, Credit, Ending) sesuai standar audit konvensional.', group: 'gl', behavior: { requiresDateRange: false } },
      { id: 'gl_realize_gain_loss', name: 'Realize Gain/Loss', description: 'Laporan Laba/Rugi Terealisasi akibat selisih kurs valuta asing dari transaksi yang sudah dilunasi.', group: 'gl' },
      { id: 'gl_unrealize_gain_loss', name: 'Unrealize Gain/Loss', description: 'Laporan Laba/Rugi Belum Terealisasi (Potensial) dari revaluasi saldo akun valuta asing pada akhir bulan.', group: 'gl' },
      { id: 'gl_account_list', name: 'Account List', description: 'Daftar lengkap Bagan Akun (Chart of Accounts) beserta tipe, klasifikasi, dan mata uangnya.', group: 'gl' },
      { id: 'gl_journal_voucher', name: 'General Journal Voucher', description: 'Daftar riwayat seluruh entri Jurnal Umum (Journal Voucher) yang diinput secara manual.', group: 'gl' },
    ]
  },
  {
    id: 'cash_bank',
    name: 'Cash And Bank',
    icon: Landmark,
    reports: [
      { id: 'cb_statement', name: 'Bank Statement / Book', description: 'Buku Bank/Kas yang mencatat seluruh mutasi uang masuk dan keluar pada suatu rekening secara kronologis.' },
      { id: 'cb_reconciliation', name: 'Bank Reconciliation Summary', description: 'Ringkasan Rekonsiliasi Bank yang membandingkan saldo catatan sistem dengan rekening koran dari bank.' },
      { id: 'cb_cash_flow', name: 'Cash Flow Projection', description: 'Proyeksi Arus Kas di masa depan berdasarkan jadwal tagihan piutang dan jatuh tempo hutang.' },
    ]
  },
  {
    id: 'ar_customers',
    name: 'Account Receivables & Customers',
    icon: Users,
    reports: [
      { id: 'ar_out_inv', name: 'Outstanding Invoices', description: 'Daftar faktur penjualan (Invoice) yang masih berstatus belum lunas (Outstanding) oleh pelanggan.' },
      { id: 'ar_aging_sum', name: 'Aging Receivable Summary', description: 'Ringkasan umur piutang (Aging) untuk melihat piutang yang belum jatuh tempo hingga yang menunggak lama.' },
      { id: 'ar_aging_det', name: 'Aging Receivable Detail', description: 'Rincian per faktur dari laporan umur piutang pelanggan untuk analisis kolektibilitas.' },
      { id: 'ar_aging_graph', name: 'AR Aging Graph', description: 'Grafik visual dari umur piutang untuk mempermudah pemantauan tagihan yang menunggak.' },
      { id: 'ar_sub_ledger_sum', name: 'AR Subsidiary Ledger Summary', description: 'Buku Besar Pembantu Piutang (Summary) yang merangkum total piutang per pelanggan.' },
      { id: 'ar_sub_ledger_det', name: 'AR Subsidiary Ledger Detail', description: 'Rincian mutasi Buku Besar Pembantu Piutang yang menampilkan riwayat tagihan dan pembayaran per pelanggan.' },
      { id: 'ar_history', name: 'Account Receivable History', description: 'Riwayat historis saldo piutang perusahaan dari waktu ke waktu.' },
      { id: 'ar_paid_sum', name: 'Invoices Paid Summary', description: 'Daftar ringkasan faktur penjualan yang telah dilunasi oleh pelanggan.' },
      { id: 'ar_paid_det', name: 'Invoices Paid Detail', description: 'Rincian dokumen pembayaran atas faktur penjualan yang telah dilunasi.' },
      { id: 'ar_cust_stmt', name: 'Customer Statement', description: 'Rekening Koran Pelanggan (Statement of Account) yang bisa dikirim sebagai mutasi tagihan bulanan.' },
      { id: 'ar_col_period_graph', name: 'Collection Period Graph', description: 'Grafik yang mengukur rata-rata waktu yang dibutuhkan untuk menagih piutang (Days Sales Outstanding).' },
      { id: 'ar_cust_list', name: 'Customer List', description: 'Daftar lengkap master data pelanggan beserta informasi kontak, batas kredit, dan saldo berjalan.' },
      { id: 'ar_sales_receipts', name: 'Sales Receipts', description: 'Laporan daftar penerimaan pembayaran (Sales Receipt) dari pelanggan.' },
    ]
  },
  {
    id: 'sales_reports',
    name: 'Sales Reports',
    icon: ShoppingCart,
    reports: [
      { id: 'sr_sales_sum', name: 'Sales Summary by Item', description: 'Ringkasan total penjualan yang dikelompokkan berdasarkan barang/jasa yang terjual.' },
      { id: 'sr_sales_det', name: 'Sales Detail by Customer', description: 'Rincian transaksi penjualan yang dipisahkan berdasarkan masing-masing pelanggan.' },
      { id: 'sr_gross_profit', name: 'Gross Profit by Item', description: 'Laporan Laba Kotor (Gross Profit) yang menghitung selisih harga jual dan harga pokok per barang.' },
    ]
  },
  {
    id: 'ap_vendors',
    name: 'Account Payables & Vendors',
    icon: Briefcase,
    reports: [
      { id: 'ap_out_bills', name: 'Outstanding Bills', description: 'Daftar tagihan pembelian (Bill) dari pemasok yang belum dibayar oleh perusahaan.' },
      { id: 'ap_aging_sum', name: 'Aging Payable Summary', description: 'Ringkasan umur hutang (Aging Payable) untuk menjadwalkan arus kas keluar.' },
      { id: 'ap_aging_det', name: 'Aging Payable Detail', description: 'Rincian umur hutang berdasarkan masing-masing faktur pembelian dari vendor.' },
      { id: 'ap_sub_ledger_sum', name: 'AP Subsidiary Ledger Summary', description: 'Buku Besar Pembantu Hutang (Summary) yang merangkum total hutang per pemasok.' },
      { id: 'ap_vendor_stmt', name: 'Vendor Statement', description: 'Rekening Koran Pemasok yang menunjukkan riwayat tagihan dan pembayaran kita kepada mereka.' },
    ]
  },
  {
    id: 'purchase_reports',
    name: 'Purchase Reports',
    icon: PackageCheck,
    reports: [
      { id: 'pr_po_outstanding', name: 'Outstanding Purchase Orders', description: 'Daftar Pesanan Pembelian (PO) yang belum dipenuhi atau belum ditagihkan oleh pemasok.' },
      { id: 'pr_purchase_sum', name: 'Purchase Summary by Item', description: 'Ringkasan total pembelian yang dikelompokkan berdasarkan jenis barang/jasa.' },
    ]
  },
  {
    id: 'job_order_costing',
    name: 'Job Order Costing',
    icon: PieChart,
    reports: [
      { id: 'joc_summary', name: 'Job Costing Summary', description: 'Ringkasan akumulasi biaya (Bahan Baku, Tenaga Kerja, Overhead) untuk setiap pesanan/proyek (Job).' },
      { id: 'joc_wip', name: 'Work In Progress (WIP) Value', description: 'Laporan nilai Barang Dalam Proses (WIP) untuk pesanan pabrikasi yang belum selesai.' },
    ]
  },
  {
    id: 'fixed_assets',
    name: 'Fixed Assets',
    icon: Building2,
    reports: [
      { id: 'fa_list', name: 'Fixed Asset List', description: 'Daftar master Aset Tetap perusahaan beserta tanggal perolehan dan nilai belinya.' },
      { id: 'fa_depreciation', name: 'Depreciation Schedule', description: 'Jadwal dan riwayat penyusutan (Depresiasi) aset tetap per periode akuntansi.' },
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: Boxes,
    reports: [
      { id: 'inv_valuation', name: 'Inventory Valuation Summary', description: 'Ringkasan Valuasi Persediaan yang menampilkan kuantitas barang dikalikan harga pokoknya (COGS).' },
      { id: 'inv_stock_card', name: 'Stock Card (Kartu Stok)', description: 'Kartu Stok yang mencatat mutasi barang masuk dan keluar secara terperinci (In/Out/Balance).' },
      { id: 'inv_slow_moving', name: 'Slow Moving Items', description: 'Daftar barang mati atau jarang terjual (Slow Moving) untuk analisis manajemen gudang.' },
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing Reports',
    icon: Factory,
    reports: [
      { id: 'mfg_bom', name: 'Bill of Materials Listing', description: 'Daftar resep standar (Bill of Materials) yang berisi komposisi bahan baku untuk barang jadi.' },
      { id: 'mfg_variance', name: 'Production Variance Report', description: 'Laporan varians yang membandingkan standar biaya produksi dengan biaya aktual (Material/Tenaga Kerja).' },
    ]
  },
  {
    id: 'tax_support',
    name: 'Tax Support Reports (Indonesian)',
    icon: TaxIcon,
    reports: [
      { id: 'tax_ppn_in', name: 'Faktur Pajak Masukan (PPN In)', description: 'Daftar Pajak Pertambahan Nilai (PPN) Masukan dari pembelian yang dapat dikreditkan.' },
      { id: 'tax_ppn_out', name: 'Faktur Pajak Keluaran (PPN Out)', description: 'Daftar Pajak Pertambahan Nilai (PPN) Keluaran atas penjualan kepada pelanggan.' },
      { id: 'tax_pph_23', name: 'Bukti Potong PPh 23', description: 'Daftar pemotongan Pajak Penghasilan Pasal 23 atas jasa, dividen, atau royalti.' },
    ]
  },
  {
    id: 'audit_reports',
    name: 'Audit Reports',
    icon: FileCheck,
    reports: [
      { id: 'audit_trail', name: 'System Audit Trail', description: 'Jejak audit sistem yang mencatat semua aktivitas pembuatan, perubahan, dan penghapusan data oleh user.' },
      { id: 'audit_void', name: 'Voided Transactions', description: 'Daftar transaksi yang telah dibatalkan (Void) atau dihapus dari sistem beserta alasannya.' },
    ]
  },
  {
    id: 'memorized_reports',
    name: 'Memorized Reports',
    icon: Bookmark,
    reports: [
      { id: 'mem_bs_monthly_custom', name: 'Balance Sheet - Monthly Executive View', description: 'Custom saved layout of the Balance Sheet report optimized for executive monthly review.' },
      { id: 'mem_pl_ytd', name: 'Profit & Loss - YTD Comparison', description: 'Year-to-date comparative income statement layout.' },
    ]
  },
  {
    id: 'custom_reports',
    name: 'Designed Report File',
    icon: PenTool,
    reports: [
      { id: 'cst_01', name: 'Laporan Internal BOD (Custom)', description: 'Format laporan khusus yang didesain menggunakan Report Designer untuk kebutuhan internal Direksi.', isCustom: true },
    ]
  }
];
