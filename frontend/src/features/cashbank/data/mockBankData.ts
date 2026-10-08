export interface BankStatementLine {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'IN' | 'OUT';
  matchedErpId?: string; // ID of the ERP transaction if matched
}

export interface ErpTransaction {
  id: string;
  date: string;
  documentNo: string;
  partner: string;
  description: string;
  amount: number;
  type: 'IN' | 'OUT';
}

export const mockBankStatements: BankStatementLine[] = [
  { id: 'BS-001', date: '2026-06-01', description: 'TRF MASUK PT SINAR JAYA (INV-2026/001)', amount: 150000000, type: 'IN' },
  { id: 'BS-002', date: '2026-06-02', description: 'BIAYA ADMIN BANK BULANAN', amount: 150000, type: 'OUT' },
  { id: 'BS-003', date: '2026-06-03', description: 'TRF KELUAR PT MAKMUR ABADI (BILL-2026/055)', amount: 45000000, type: 'OUT' },
  { id: 'BS-004', date: '2026-06-05', description: 'SETORAN TUNAI CABANG JAKARTA', amount: 25000000, type: 'IN' },
  { id: 'BS-005', date: '2026-06-06', description: 'PAYROLL BULAN MEI 2026', amount: 120000000, type: 'OUT' },
  { id: 'BS-006', date: '2026-06-08', description: 'TRF MASUK CV JAYA MAKMUR (DP-2026/012)', amount: 10000000, type: 'IN' },
];

export const mockErpTransactions: ErpTransaction[] = [
  { id: 'ERP-001', date: '2026-05-28', documentNo: 'INV-2026/001', partner: 'PT Sinar Jaya', description: 'Faktur Penjualan Barang Jadi', amount: 150000000, type: 'IN' },
  { id: 'ERP-002', date: '2026-06-01', documentNo: 'BILL-2026/055', partner: 'PT Makmur Abadi', description: 'Tagihan Bahan Baku Plastik', amount: 45000000, type: 'OUT' },
  { id: 'ERP-003', date: '2026-06-04', documentNo: 'CD-2026/011', partner: 'Cabang Jakarta', description: 'Penerimaan Kasir Cabang JKT', amount: 25000000, type: 'IN' },
  { id: 'ERP-004', date: '2026-06-05', documentNo: 'PAY-2026/005', partner: 'Karyawan', description: 'Pembayaran Gaji Karyawan', amount: 120000000, type: 'OUT' },
  { id: 'ERP-005', date: '2026-06-07', documentNo: 'DP-2026/012', partner: 'CV Jaya Makmur', description: 'Uang Muka Proyek X', amount: 10000000, type: 'IN' },
  { id: 'ERP-006', date: '2026-06-08', documentNo: 'INV-2026/002', partner: 'PT Angin Ribut', description: 'Faktur Penjualan Sparepart', amount: 5000000, type: 'IN' },
];
