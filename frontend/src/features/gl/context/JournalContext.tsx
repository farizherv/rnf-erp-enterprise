import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { JournalVoucherPayload } from '../types/journal';

interface JournalContextType {
  journals: JournalVoucherPayload[];
  addJournal: (journal: JournalVoucherPayload) => void;
  updateJournal: (journal: JournalVoucherPayload) => void;
  voidJournal: (voucherNo: string) => void;
  deleteJournal: (voucherNo: string) => void;
}

const INITIAL_JOURNALS: JournalVoucherPayload[] = [
  {
    company_id: 'C-01',
    voucher_no: 'JV-202606-0001',
    transaction_date: '2026-06-04',
    description: 'Pembayaran sewa gedung bulan Juni 2026',
    reference_no: 'INV-SEWA-0626',
    currency_code: 'IDR',
    exchange_rate: 1,
    status: 'POSTED',
    total_debit: 25000000,
    total_credit: 25000000,
    lines: [
      { account_id: '6102', description: 'Biaya Sewa Gedung Kantor Pusat', debit: 25000000, credit: 0, department_id: 'DEP-01', project_id: null },
      { account_id: '1102', description: 'Transfer dari BCA', debit: 0, credit: 25000000, department_id: null, project_id: null },
    ]
  },
  {
    company_id: 'C-01',
    voucher_no: 'JV-202606-0002',
    transaction_date: '2026-06-05',
    description: 'Pengisian Kas Kecil',
    reference_no: 'REQ-KAS-01',
    currency_code: 'IDR',
    exchange_rate: 1,
    status: 'DRAFT',
    total_debit: 5000000,
    total_credit: 5000000,
    lines: [
      { account_id: '1101', description: 'Kas Kecil Pusat', debit: 5000000, credit: 0, department_id: null, project_id: null },
      { account_id: '1102', description: 'Penarikan Bank BCA', debit: 0, credit: 5000000, department_id: null, project_id: null },
    ]
  }
];

const generateDummyJournals = (count: number): JournalVoucherPayload[] => {
  const types = ['Bukti', 'Barang Roll Over', 'Akhir Periode', 'Akhir Periode Produksi', 'Depresiasi Aktiva', 'Pembayaran Upah'];
  return Array.from({ length: count }, (_, i) => {
    const isVoid = Math.random() > 0.9;
    const isDraft = Math.random() > 0.8;
    const status = isVoid ? 'VOID' : (isDraft ? 'DRAFT' : 'POSTED');
    const amount = Math.floor(Math.random() * 500000) * 1000 + 1000000;
    const day = Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0');
    
    return {
      company_id: 'C-01',
      voucher_no: `JV-202606-${(i + 3).toString().padStart(4, '0')}`,
      transaction_date: `2026-06-${day}`,
      description: `Transaksi Dummy Skala Besar - Ke ${i + 1}`,
      reference_no: `REF-DUMMY-${i}`,
      currency_code: 'IDR',
      exchange_rate: 1,
      status: status,
      total_debit: amount,
      total_credit: amount,
      journal_type: types[Math.floor(Math.random() * types.length)],
      lines: [
        { account_id: '1101', description: 'Debit Entry', debit: amount, credit: 0, department_id: null, project_id: null },
        { account_id: '1102', description: 'Credit Entry', debit: 0, credit: amount, department_id: null, project_id: null },
      ]
    } as any;
  });
};

const ALL_JOURNALS = [...INITIAL_JOURNALS, ...generateDummyJournals(125)];

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [journals, setJournals] = useState<JournalVoucherPayload[]>(ALL_JOURNALS);

  const addJournal = (journal: JournalVoucherPayload) => {
    setJournals((prev) => [journal, ...prev]);
  };

  const updateJournal = (journal: JournalVoucherPayload) => {
    setJournals((prev) => prev.map(j => j.voucher_no === journal.voucher_no ? journal : j));
  };

  const voidJournal = (voucherNo: string) => {
    setJournals((prev) => prev.map(j => 
      j.voucher_no === voucherNo ? { ...j, status: 'VOID' } : j
    ));
  };

  const deleteJournal = (voucherNo: string) => {
    setJournals((prev) => prev.filter(j => j.voucher_no !== voucherNo));
  };

  return (
    <JournalContext.Provider value={{ journals, addJournal, updateJournal, voidJournal, deleteJournal }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournals = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournals must be used within a JournalProvider');
  }
  return context;
};
