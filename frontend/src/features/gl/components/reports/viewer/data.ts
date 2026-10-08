import type { BalanceSheetNode } from './types';

// Dummy Data exactly mimicking Accurate 4 (Photo 1 & 2) and standard Enterprise ERP
export const BALANCE_SHEET_DATA: BalanceSheetNode[] = [
  {
    id: 'assets',
    description: 'ASSETS',
    isHeader: true,
    children: [
      {
        id: 'current_assets',
        description: 'CURRENT ASSETS',
        isHeader: true,
        children: [
          {
            id: 'cash_bank',
            description: 'Cash and Bank',
            isHeader: true,
            children: [
              {
                id: 'kas',
                description: 'Kas',
                children: [
                  { id: 'kas_idr', description: 'Kas IDR', balance: 9430000 },
                  { id: 'kas_usd', description: 'Kas USD', balance: 9300000 },
                  { id: 'kas_sgd', description: 'Kas SGD', balance: 3400000 },
                ],
                balance: 22130000
              },
              {
                id: 'bank',
                description: 'Bank',
                children: [
                  { id: 'mandiri_idr', description: 'Mandiri IDR', balance: 109478296.4 },
                  { id: 'bca_idr', description: 'BCA IDR', balance: 780066563.85 },
                  { id: 'danamon_usd', description: 'Danamon USD', balance: 57660000 },
                  { id: 'panin_sgd', description: 'Panin SGD', balance: 4663712 },
                ],
                balance: 951868572.25
              },
              { id: 'total_cash_bank', description: 'Total Cash and Bank', balance: 973998572.25, isTotal: true }
            ]
          },
          {
            id: 'account_receivable',
            description: 'Account Receivable',
            isHeader: true,
            children: [
              { id: 'total_ar', description: 'Total Account Receivable', balance: 0, isTotal: true }
            ]
          },
          {
            id: 'inventory',
            description: 'Inventory',
            isHeader: true,
            children: [
              {
                id: 'persediaan_barang',
                description: 'Persediaan Barang Dagang',
                children: [
                  { id: 'pers_bahan', description: 'Persediaan Bahan Bangunan', balance: 349866833.75 },
                  { id: 'pers_perkakas', description: 'Persediaan Perkakas', balance: 18722000 },
                  { id: 'pers_elek', description: 'Persediaan Elektronik', balance: 83378000 },
                  { id: 'pers_furn', description: 'Persediaan Furniture', balance: 55580000 },
                  { id: 'pers_manufaktur', description: 'Persediaan Dalam Proses Manufaktur', balance: -7190000 },
                ],
                balance: 507546833.75
              },
              { id: 'total_inventory', description: 'Total Inventory', balance: 500356833.75, isTotal: true }
            ]
          },
          {
            id: 'other_current_assets',
            description: 'Other Current Assets',
            isHeader: true,
            children: [
              {
                id: 'biaya_dimuka',
                description: 'Biaya dibayar dimuka',
                children: [
                  { id: 'sewa', description: 'Sewa dibayar dimuka', balance: 36000000 },
                  { id: 'asuransi', description: 'Asuransi dibayar dimuka', balance: 50000000 },
                ],
                balance: 86000000
              },
              { id: 'ppn_masukan', description: 'PPN Masukan', balance: 96390218.8 },
              { id: 'proyek_proses', description: 'Proyek Dalam Proses', balance: 11321096.5 },
              { id: 'total_other_current', description: 'Total Other Current Assets', balance: 193711315.3, isTotal: true }
            ]
          },
          { id: 'total_current_assets', description: 'Total CURRENT ASSETS', balance: 1668066721.3, isTotal: true }
        ]
      },
      {
        id: 'fixed_assets',
        description: 'FIXED ASSETS',
        isHeader: true,
        children: [
          {
            id: 'historical_value',
            description: 'Historical Value',
            isHeader: true,
            children: [
              {
                id: 'aktiva_tetap',
                description: 'Aktiva Tetap',
                children: [
                  { id: 'tanah', description: 'Tanah', balance: 500000000 },
                  { id: 'bangunan', description: 'Bangunan', balance: 900000000 },
                  { id: 'peralatan_ktr', description: 'Peralatan Kantor', balance: 30500000 },
                  { id: 'peralatan_tk', description: 'Peralatan Toko', balance: 35500000 },
                  { id: 'kendaraan', description: 'Kendaraan', balance: 335000000 },
                ],
                balance: 1801000000
              },
              { id: 'total_historical_value', description: 'Total Historical Value', balance: 1801000000, isTotal: true }
            ]
          },
          {
            id: 'accumulated_depreciation',
            description: 'Accumulated Depreciation',
            isHeader: true,
            children: [
              {
                id: 'akumulasi_penyusutan',
                description: 'Akumulasi Penyusutan',
                children: [
                  { id: 'akum_bangunan', description: 'Akum. Penys. Bangunan', balance: -172500000 },
                  { id: 'akum_peralatan_ktr', description: 'Akum. Penys. Peralatan Kantor', balance: -22900000 },
                  { id: 'akum_peralatan_tk', description: 'Akum. Penys. Peralatan Toko', balance: -26250000 },
                  { id: 'akum_kendaraan', description: 'Akum. Penys. Kendaraan', balance: -243657523.44 },
                ],
                balance: -465307523.44
              },
              { id: 'total_accumulated_depreciation', description: 'Total Accumulated Depreciation', balance: -465307523.44, isTotal: true }
            ]
          },
          { id: 'total_fixed_assets', description: 'Total FIXED ASSETS', balance: 1335692476.56, isTotal: true }
        ]
      },
      {
        id: 'other_assets',
        description: 'OTHER ASSETS',
        isHeader: true,
        children: [
          { id: 'total_other_assets', description: 'Total OTHER ASSETS', balance: 0, isTotal: true }
        ]
      },
      { id: 'total_assets', description: 'Total ASSETS', balance: 3003759197.86, isTotal: true }
    ]
  },
  {
    id: 'liabilities_equities',
    description: 'LIABILITIES and EQUITIES',
    isHeader: true,
    children: [
      {
        id: 'liabilities',
        description: 'LIABILITIES',
        isHeader: true,
        children: [
          {
            id: 'current_liabilities',
            description: 'Current Liabilities',
            isHeader: true,
            children: [
              {
                id: 'account_payables',
                description: 'Account Payables',
                isHeader: true,
                children: [
                  {
                    id: 'hutang_usaha',
                    description: 'Hutang Usaha',
                    children: [
                      { id: 'hutang_usaha_idr', description: 'Hutang Usaha IDR', balance: 236204540 },
                      { id: 'hutang_usaha_usd', description: 'Hutang Usaha USD', balance: 6510000 },
                      { id: 'hutang_usaha_sgd', description: 'Hutang Usaha SGD', balance: 29240000 },
                    ],
                    balance: 271954540
                  },
                  { id: 'total_account_payables', description: 'Total Account Payables', balance: 271954540, isTotal: true }
                ]
              },
              {
                id: 'other_current_liabilities',
                description: 'Other Current Liabilities',
                isHeader: true,
                children: [
                  { id: 'ppn_keluaran', description: 'PPN Keluaran', balance: 795000 },
                  {
                    id: 'hutang_biaya',
                    description: 'Hutang Biaya',
                    children: [
                      { id: 'hutang_bunga', description: 'Hutang Bunga', balance: 50000000 },
                      { id: 'hutang_gaji', description: 'Hutang Gaji', balance: 12500000 },
                      { id: 'hutang_sewa_alat', description: 'Hutang Sewa Alat Proyek', balance: 12332795 },
                      { id: 'hutang_biaya_proyek', description: 'Hutang Biaya Proyek Lain-lain', balance: 19842000 },
                      { id: 'hutang_gaji_proyek', description: 'Hutang Gaji/Upah Karyawan Proyek', balance: 197573290 },
                    ],
                    balance: 292248085
                  },
                  { id: 'total_other_current_liabilities', description: 'Total Other Current Liabilities', balance: 293043085, isTotal: true }
                ]
              },
              { id: 'total_current_liabilities', description: 'Total Current Liabilities', balance: 564997625, isTotal: true }
            ]
          },
          {
            id: 'long_term_liabilities',
            description: 'Long Term Liabilities',
            isHeader: true,
            children: [
              { id: 'hutang_jk_panjang', description: 'Hutang Jangka Panjang', balance: 650000000 },
              { id: 'total_long_term_liabilities', description: 'Total Long Term Liabilities', balance: 650000000, isTotal: true }
            ]
          },
          { id: 'total_liabilities', description: 'Total LIABILITIES', balance: 1214997625, isTotal: true }
        ]
      },
      {
        id: 'equities',
        description: 'EQUITIES',
        isHeader: true,
        children: [
          { id: 'modal', description: 'Modal', balance: 1000000000 },
          { id: 'deviden', description: 'Deviden', balance: 500000000 },
          { id: 'laba_ditahan', description: 'Laba Ditahan', balance: 289361572.86 },
          { id: 'current_earning', description: 'Current Earning of The Year', balance: -600000 },
          { id: 'total_equities', description: 'Total EQUITIES', balance: 1788761572.86, isTotal: true }
        ]
      },
      { id: 'total_liabilities_equities', description: 'Total LIABILITIES and EQUITIES', balance: 3003759197.86, isTotal: true }
    ]
  }
];

export const PROFIT_AND_LOSS_DATA: BalanceSheetNode[] = [
  {
    id: 'operating_revenue',
    description: 'OPERATING REVENUE',
    isHeader: true,
    children: [
      {
        id: 'pendapatan',
        description: 'Pendapatan Utama',
        isHeader: true,
        children: [
          { id: 'pendapatan_jasa_1', description: 'Pendapatan Jasa Konsultasi', balance: 50000000 },
          { id: 'pendapatan_jasa_2', description: 'Pendapatan Jasa Implementasi', balance: 120000000 },
          { id: 'pendapatan_jasa_3', description: 'Pendapatan Jasa Maintenance', balance: 35000000 },
        ]
      },
      {
        id: 'pendapatan_2',
        description: 'Pendapatan Barang',
        isHeader: true,
        children: [
          { id: 'penjualan', description: 'Penjualan Perangkat Keras (Hardware)', balance: 10140000 },
          { id: 'penjualan_2', description: 'Penjualan Lisensi Perangkat Lunak', balance: 45000000 },
          { id: 'penjualan_3', description: 'Penjualan Suku Cadang (Sparepart)', balance: 12500000 },
          { id: 'penjualan_4', description: 'Penjualan Aksesoris', balance: 3200000 },
        ]
      },
      {
        id: 'pengurang_pendapatan',
        description: 'Pengurang Pendapatan',
        isHeader: true,
        children: [
          { id: 'retur_penjualan', description: 'Retur Penjualan', balance: -2000000 },
          { id: 'diskon_grosir', description: 'Diskon Penjualan Grosir', balance: -1500000 },
          { id: 'diskon_promo', description: 'Diskon Promosi Event', balance: -3500000 },
        ]
      },
      { id: 'total_operating_revenue', description: 'Total OPERATING REVENUE', balance: 270340000, isTotal: true }
    ]
  },
  {
    id: 'cogs',
    description: 'Cost of Goods Sold',
    isHeader: true,
    children: [
      {
        id: 'hpp',
        description: 'Harga Pokok Penjualan',
        isHeader: true,
        children: [
          { id: 'hpp_item1', description: 'HPP Perangkat Keras', balance: 6995615.5 },
          { id: 'hpp_item2', description: 'HPP Lisensi Perangkat Lunak', balance: 15000000 },
          { id: 'hpp_item3', description: 'HPP Suku Cadang', balance: 8000000 },
          { id: 'hpp_item4', description: 'Biaya Tenaga Kerja Langsung (Proyek)', balance: 25000000 },
          { id: 'hpp_item5', description: 'Biaya Overhead Pabrikasi', balance: 4500000 },
          { id: 'hpp_item6', description: 'Biaya Ongkos Kirim Pembelian', balance: 1200000 },
          { id: 'hpp_item7', description: 'Biaya Pengemasan (Packaging)', balance: 850000 },
        ]
      },
      { id: 'total_cogs', description: 'Total Cost of Goods Sold', balance: 61545615.5, isTotal: true }
    ]
  },
  {
    id: 'gross_profit',
    description: 'GROSS PROFIT',
    balance: 208794384.5,
    isTotal: true
  },
  {
    id: 'operating_expenses',
    description: 'Operating Expenses',
    isHeader: true,
    children: [
      {
        id: 'biaya_umum_adm',
        description: 'Biaya Umum & Administrasi',
        isHeader: true,
        children: [
          { id: 'biaya_gaji_upah', description: 'Biaya Gaji & Upah', balance: 30000000 },
          {
            id: 'gaji_tunjangan',
            description: 'Gaji & Tunjangan Karyawan',
            isHeader: true,
            children: [
              { id: 'biaya_catering', description: 'Biaya Catering & Makan Karyawan', balance: 200000 },
              { id: 'biaya_transport', description: 'Biaya Transportasi Karyawan', balance: 1500000 },
              { id: 'biaya_kesehatan', description: 'Tunjangan Kesehatan & Medis', balance: 4500000 },
              { id: 'biaya_lembur', description: 'Uang Lembur Karyawan', balance: 3200000 },
              { id: 'biaya_thr', description: 'Tunjangan Hari Raya (THR)', balance: 0 },
              { id: 'biaya_bonus', description: 'Bonus Kinerja Karyawan', balance: 12000000 }
            ]
          },
          {
            id: 'beban_utiliti_adm',
            description: 'Beban Utiliti, Adm, Sewa & Lainnya',
            isHeader: true,
            children: [
              { id: 'biaya_listrik', description: 'Biaya Listrik', balance: 350000 },
              { id: 'biaya_air', description: 'Biaya Air Bersih (PAM)', balance: 120000 },
              { id: 'biaya_internet', description: 'Biaya Internet & Komunikasi', balance: 850000 },
              { id: 'biaya_sewa', description: 'Biaya Sewa Gedung', balance: 15000000 },
              { id: 'biaya_asuransi', description: 'Biaya Asuransi Gedung', balance: 2500000 },
              { id: 'biaya_kebersihan', description: 'Biaya Kebersihan & Keamanan', balance: 1000000 },
              { id: 'biaya_atk', description: 'Biaya Alat Tulis Kantor (ATK)', balance: 1250000 },
              { id: 'biaya_fotocopy', description: 'Biaya Fotocopy & Pencetakan', balance: 450000 },
              { id: 'biaya_pos', description: 'Biaya Kurir & Pos', balance: 800000 }
            ]
          },
          {
            id: 'beban_pemasaran',
            description: 'Beban Pemasaran & Promosi',
            isHeader: true,
            children: [
              { id: 'iklan_digital', description: 'Biaya Iklan Digital (Google/FB)', balance: 12000000 },
              { id: 'iklan_cetak', description: 'Biaya Cetak Brosur/Banner', balance: 3500000 },
              { id: 'biaya_event', description: 'Biaya Pameran & Event', balance: 8000000 },
              { id: 'biaya_entertainment', description: 'Biaya Entertainment Klien', balance: 4200000 },
              { id: 'biaya_sponsor', description: 'Biaya Sponsorship', balance: 5000000 }
            ]
          },
          {
            id: 'beban_penyusutan',
            description: 'Beban Penyusutan',
            isHeader: true,
            children: [
              { id: 'penyusutan_bangunan', description: 'Penyusutan Bangunan', balance: 5000000 },
              { id: 'penyusutan_kendaraan', description: 'Penyusutan Kendaraan', balance: 3500000 },
              { id: 'penyusutan_peralatan', description: 'Penyusutan Peralatan Kantor', balance: 1200000 },
              { id: 'penyusutan_komputer', description: 'Penyusutan Perangkat Komputer', balance: 2800000 }
            ]
          },
          {
            id: 'beban_kendaraan',
            description: 'Beban Operasional Kendaraan',
            isHeader: true,
            children: [
              { id: 'bbm_kendaraan', description: 'Biaya BBM Kendaraan', balance: 4500000 },
              { id: 'service_kendaraan', description: 'Biaya Perawatan & Service', balance: 2500000 },
              { id: 'pajak_kendaraan', description: 'Biaya Pajak & STNK', balance: 1800000 },
              { id: 'tol_parkir', description: 'Biaya Tol & Parkir', balance: 950000 }
            ]
          }
        ]
      },
      { id: 'total_operating_expenses', description: 'Total Operating Expenses', balance: 128670000, isTotal: true }
    ]
  },
  {
    id: 'income_from_operation',
    description: 'INCOME FROM OPERATION',
    balance: 80124384.5,
    isTotal: true
  },
  {
    id: 'other_income_expenses',
    description: 'Other Income and Expenses',
    isHeader: true,
    children: [
      {
        id: 'other_income',
        description: 'Other Income',
        isHeader: true,
        children: [
          { id: 'pendapatan_bunga', description: 'Pendapatan Bunga Bank', balance: 2500000 },
          { id: 'laba_kurs', description: 'Laba Selisih Kurs', balance: 1200000 },
          { id: 'pendapatan_sewa', description: 'Pendapatan Sewa Ruangan', balance: 5000000 }
        ]
      },
      { id: 'total_other_income', description: 'Total Other Income', balance: 8700000, isTotal: true },
      {
        id: 'other_expenses',
        description: 'Other Expenses',
        isHeader: true,
        children: [
          {
            id: 'biaya_lain_lain',
            description: 'Biaya Lain-lain',
            isHeader: true,
            children: [
              { id: 'biaya_adm_bank', description: 'Biaya Administrasi Bank', balance: 150000 },
              { id: 'biaya_buku_cek', description: 'Biaya Buku Cek/Giro', balance: 50000 },
              { id: 'rugi_kurs', description: 'Rugi Selisih Kurs', balance: 850000 },
              { id: 'biaya_pajak_final', description: 'Biaya Pajak Final PPh', balance: 1250000 },
              { id: 'biaya_notaris', description: 'Biaya Legal & Notaris', balance: 5000000 },
              { id: 'biaya_denda', description: 'Biaya Denda Keterlambatan', balance: 350000 },
              { id: 'biaya_csr', description: 'Biaya Sumbangan / CSR', balance: 2000000 }
            ]
          }
        ]
      },
      { id: 'total_other_expenses', description: 'Total Other Expenses', balance: 9650000, isTotal: true },
      { id: 'total_other_income_expenses_net', description: 'Total Other Income and Expenses', balance: -950000, isTotal: true }
    ]
  },
  { id: 'net_profit_before_tax', description: 'NET PROFIT/LOSS (Before Tax)', balance: 79174384.5, isTotal: true },
  { id: 'net_profit_after_tax', description: 'NET PROFIT/LOSS (After Tax)', balance: 79174384.5, isTotal: true }
];

export const generateCashFlowDetailData = (): BalanceSheetNode[] => [
  {
    id: 'Operating Activities',
    description: '',
    isHeader: true,
    children: [
      { id: 'Net Income', description: '(From Profit & Loss Statement)', balance: -74829669.92 },
      {
        id: 'Added',
        description: '',
        isHeader: true,
        children: [
          {
            id: 'Accumulated Depreciation',
            description: '',
            isHeader: true,
            children: [
              { id: '1202-001', description: 'Akum. Penys. Bangunan', balance: 37500000 },
              { id: '1202-002', description: 'Akum. Penys. Peralatan Kantor', balance: 4333333.33 },
              { id: '1202-003', description: 'Akum. Penys. Peralatan Toko', balance: 5916666.67 },
              { id: '1202-004', description: 'Akum. Penys. Kendaraan', balance: 26479669.92 },
              { id: 'Total of Accumulated Depreciation', description: '', balance: 74229669.92, isTotal: true }
            ]
          },
          { id: 'Total of Added', description: '', balance: 74229669.92, isTotal: true }
        ]
      },
      { id: 'Total of Operating Activities', description: '', balance: 74229669.92, isTotal: true }
    ]
  },
  { id: 'Total of Net Cash Provide (Used) in This Period', description: '', balance: -600000 },
  { id: 'Total of Cash & Cash Equivalent at Beginning of Period', description: '', balance: 974598572.25 },
  { id: 'Total of Cash & Cash Equivalent at End of Period', description: '', balance: 973998572.25 }
];
export const generateCashFlowSummaryData = (): BalanceSheetNode[] => [
  { id: 'cfs_op', description: 'Net Cash Flow from Operating Activities', balance: 450000000, isHeader: true, children: [] },
  { id: 'cfs_inv', description: 'Net Cash Flow from Investing Activities', balance: -120000000, isHeader: true, children: [] },
  { id: 'cfs_fin', description: 'Net Cash Flow from Financing Activities', balance: -50000000, isHeader: true, children: [] },
  { id: 'cfs_net', description: 'Net Increase/Decrease in Cash', balance: 280000000, isTotal: true }
];

export const generateOwnerEquityData = (year: number): BalanceSheetNode[] => [
  { id: 'beginning_capital', description: `Owner's Capital, Jan 1, ${year}`, balance: 500000000.00 },
  {
    id: 'additions', description: 'Additions:', isHeader: true, children: [
      { id: 'net_income', description: 'Net Income for the Year', balance: 155665919.76 },
      { id: 'additional_investments', description: 'Additional Investments', balance: 50000000.00 },
      { id: 'total_additions', description: 'Total Additions', balance: 205665919.76, isTotal: true }
    ]
  },
  { id: 'subtotal_capital', description: 'Subtotal', balance: 705665919.76, isTotal: true },
  {
    id: 'deductions', description: 'Deductions:', isHeader: true, children: [
      { id: 'owner_drawings', description: `Owner's Drawings`, balance: -25000000.00 },
      { id: 'total_deductions', description: 'Total Deductions', balance: -25000000.00, isTotal: true }
    ]
  },
  { id: 'ending_capital', description: `Owner's Capital, Dec 31, ${year}`, balance: 680665919.76, isTotal: true }
];

export const generateFinancialHighlightData = (year: number): BalanceSheetNode[] => [
  { id: 'total_revenues', description: 'Total Revenues', balances: [0, 190727082.26, -100] },
  { id: 'operating_income', description: 'Operating Income', balances: [-200000, 155665919.76, -100.13] },
  { id: 'net_income', description: 'Net Income', balances: [-89581619.14, 52750427.57, -269.82] },
  { id: 'working_capital', description: 'Working Capital', balances: [1103069096.3, 1103669096.3, -0.05] },
  { id: 'current_ratio', description: 'Current Ratio', balances: [2.95, 2.95, -0.04] },
  { id: 'long_term_liability', description: 'Long Term Liability', balances: [0.43, 0.43, 0] },
  { id: 'equity', description: 'Equity', balances: [1520096244, 1520096244, 0] },
];

export const generateRetainedEarningData = (year: number): BalanceSheetNode[] => [
  { id: 'beg_bal', description: `Retained Earning (Beginning - ${year})`, balance: 289361572.86 },
  {
    id: 'net_income_year',
    description: `Net Income Of The Year (Year ${year})`,
    isHeader: true,
    children: [
      { id: 'jan', description: 'January', balance: 0 },
      { id: 'feb', description: 'February', balance: 0 },
      { id: 'mar', description: 'March', balance: 0 },
      { id: 'apr', description: 'April', balance: 0 },
      { id: 'may', description: 'May', balance: 0 },
      { id: 'jun', description: 'June', balance: 0 },
      { id: 'jul', description: 'July', balance: 0 },
      { id: 'aug', description: 'August', balance: 0 },
      { id: 'sep', description: 'September', balance: 0 },
      { id: 'oct', description: 'October', balance: -74829669.92 },
      { id: 'nov', description: 'November', balance: 0 },
      { id: 'dec', description: 'December', balance: -14751949.22 },
      { id: 'total_ni', description: `Total Net Income of The Year (Year ${year})`, balance: -89581619.14, isTotal: true }
    ]
  },
  { id: 'change_txn', description: `Change Transaction Balance of Retained Earning Year ${year}`, balance: 0 },
  { id: 'inc_dec', description: `Increase (Decrease) of the Retained Earning ${year}`, balance: -89581619.14 },
  { id: 'end_bal', description: `Retained Earning (End of Period ${year})`, balance: 199779953.72, isTotal: true }
];

// Utility to recursively generate multi-period mock data based on single balances
export const generateMultiPeriodData = (nodes: BalanceSheetNode[], count: number, includeTotal: boolean = false): BalanceSheetNode[] => {
  return nodes.map(node => {
    const newNode = { ...node };
    if (newNode.balance !== undefined) {
      const periods = Array.from({ length: count }).map((_, i) => newNode.balance! * (0.8 + (0.1 * i)));
      if (includeTotal) {
        const total = periods.reduce((sum, val) => sum + val, 0);
        newNode.balances = [...periods, total];
      } else {
        newNode.balances = periods;
      }
    }
    if (newNode.children) {
      newNode.children = generateMultiPeriodData(newNode.children, count, includeTotal);
    }
    return newNode;
  });
};

// Utility to recursively generate budget projection data
export const generateBudgetData = (nodes: BalanceSheetNode[], count: number, includeTotal: boolean = false): BalanceSheetNode[] => {
  return nodes.map(node => {
    const newNode = { ...node };
    if (newNode.balance !== undefined) {
      // Budget is projected as 115% to 125% of actuals to simulate targets
      const periods = Array.from({ length: count }).map((_, i) => newNode.balance! * (1.15 + (0.05 * i)));
      if (includeTotal) {
        newNode.balances = [...periods, periods.reduce((sum, val) => sum + val, 0)];
      } else {
        newNode.balances = periods;
      }
    }
    if (newNode.children) {
      newNode.children = generateBudgetData(newNode.children, count, includeTotal);
    }
    return newNode;
  });
};

// Utility to recursively generate compare budget data (Actual vs Budget)
export const generateCompareBudgetData = (nodes: BalanceSheetNode[]): BalanceSheetNode[] => {
  return nodes.map(node => {
    const newNode = { ...node };
    if (newNode.balance !== undefined) {
      // balances[0] = Actual, balances[1] = Budget (115% of actual)
      newNode.balances = [newNode.balance, newNode.balance * 1.15];
    }
    if (newNode.children) {
      newNode.children = generateCompareBudgetData(newNode.children);
    }
    return newNode;
  });
};

// Utility to recursively generate consolidation data
export const generateConsolidationData = (nodes: BalanceSheetNode[]): BalanceSheetNode[] => {
  return nodes.map(node => {
    const newNode = { ...node };
    if (newNode.balance !== undefined) {
      // User specific: PT Rezeki Nadh Fathan (Head Office), Branch A, and Total Consolidated
      newNode.balances = [newNode.balance, newNode.balance * 0.45, newNode.balance * 1.45];
    }
    if (newNode.children) newNode.children = generateConsolidationData(newNode.children);
    return newNode;
  });
};

// Utility to recursively generate compare budget period data (e.g. 3 periods Actual vs Budget)
export const generateCompareBudgetPeriodData = (nodes: BalanceSheetNode[], count: number, includeTotal: boolean = false): BalanceSheetNode[] => {
  return nodes.map(node => {
    const newNode = { ...node };
    if (newNode.balance !== undefined) {
      const periods: number[] = [];
      let totalAct = 0;
      let totalBud = 0;
      for (let i = 0; i < count; i++) {
        const act = newNode.balance! * (0.8 + (0.1 * i));
        const bud = act * 1.15;
        periods.push(act, bud);
        totalAct += act;
        totalBud += bud;
      }
      if (includeTotal) {
        newNode.balances = [...periods, totalAct, totalBud];
      } else {
        newNode.balances = periods;
      }
    }
    if (newNode.children) newNode.children = generateCompareBudgetPeriodData(newNode.children, count, includeTotal);
    return newNode;
  });
};

// --- Trial Balance Classic Mock Data ---
export const TRIAL_BALANCE_DATA: BalanceSheetNode[] = [
  {
    id: '1000',
    description: '1000 - ASSETS',
    isHeader: true,
    children: [
      { id: '1101', description: '1101 - Kas IDR', balances: [9000000, 2000000, 1500000, 9500000] },
      { id: '1102', description: '1102 - Bank Mandiri IDR', balances: [100000000, 60021703.6, 40521703.6, 119500000] },
      { id: '1201', description: '1201 - Account Receivable', balances: [45000000, 15000000, 10000000, 50000000] },
      { id: '1301', description: '1301 - Inventory', balances: [25000000, 30000000, 25000000, 30000000] },
      { id: 'total_1000', description: 'Total ASSETS', balances: [179000000, 107021703.6, 77021703.6, 209000000], isTotal: true }
    ]
  },
  {
    id: '2000',
    description: '2000 - LIABILITIES',
    isHeader: true,
    children: [
      { id: '2101', description: '2101 - Account Payable', balances: [-35000000, 25000000, 30000000, -40000000] },
      { id: '2201', description: '2201 - Bank Loan', balances: [-100000000, 5000000, 0, -95000000] },
      { id: 'total_2000', description: 'Total LIABILITIES', balances: [-135000000, 30000000, 30000000, -135000000], isTotal: true }
    ]
  },
  {
    id: '3000',
    description: '3000 - EQUITY',
    isHeader: true,
    children: [
      { id: '3101', description: '3101 - Paid-in Capital', balances: [-200000000, 0, 0, -200000000] },
      { id: '3201', description: '3201 - Retained Earnings', balances: [156000000, 0, 0, 156000000] }, 
      { id: 'total_3000', description: 'Total EQUITY', balances: [-44000000, 0, 0, -44000000], isTotal: true }
    ]
  },
  {
    id: '4000',
    description: '4000 - REVENUE',
    isHeader: true,
    children: [
      { id: '4101', description: '4101 - Sales Revenue', balances: [0, 0, 150000000, -150000000] },
      { id: '4102', description: '4102 - Service Revenue', balances: [0, 0, 25000000, -25000000] },
      { id: 'total_4000', description: 'Total REVENUE', balances: [0, 0, 175000000, -175000000], isTotal: true }
    ]
  },
  {
    id: '5000',
    description: '5000 - COST OF GOODS SOLD',
    isHeader: true,
    children: [
      { id: '5101', description: '5101 - COGS', balances: [0, 95000000, 0, 95000000] },
      { id: 'total_5000', description: 'Total COGS', balances: [0, 95000000, 0, 95000000], isTotal: true }
    ]
  },
  {
    id: '6000',
    description: '6000 - EXPENSES',
    isHeader: true,
    children: [
      { id: '6101', description: '6101 - Salary Expense', balances: [0, 30000000, 0, 30000000] },
      { id: '6102', description: '6102 - Rent Expense', balances: [0, 15000000, 0, 15000000] },
      { id: '6103', description: '6103 - Utilities Expense', balances: [0, 5000000, 0, 5000000] },
      { id: 'total_6000', description: 'Total EXPENSES', balances: [0, 50000000, 0, 50000000], isTotal: true }
    ]
  },
  {
    id: 'total_tb',
    description: 'TOTAL',
    balances: [0, 282021703.6, 282021703.6, 0], 
    isTotal: true
  }
];