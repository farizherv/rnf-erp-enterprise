import { useMemo } from 'react';
import { useJournals } from '../context/JournalContext';

export interface LedgerTransaction {
  id: string; // voucher_no + line index
  date: string;
  voucherNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number; // Running balance
}

export interface LedgerAccountResult {
  accountId: string;
  accountName: string;
  beginningBalance: number;
  totalDebit: number;
  totalCredit: number;
  endingBalance: number;
  transactions: LedgerTransaction[];
}

export const ACCOUNTS_MAP: Record<string, string> = {
  '1101': '1101 - Kas Kecil Pusat',
  '1102': '1102 - Bank BCA IDR',
  '1201': '1201 - Piutang Pelanggan IDR',
  '1301': '1301 - Persediaan Barang Dagang',
  '2101': '2101 - Hutang Usaha IDR',
  '3101': '3101 - Modal Saham',
  '4101': '4101 - Pendapatan Penjualan',
  '5101': '5101 - Harga Pokok Penjualan',
  '6101': '6101 - Beban Gaji',
  '6102': '6102 - Beban Sewa Gedung',
};

export const useLedgerCalculation = (
  accountId: string, 
  dateFrom?: string, 
  dateTo?: string, 
  searchQuery?: string
) => {
  const { journals } = useJournals();

  const ledgerData = useMemo(() => {
    if (!accountId) return null;

    // 1. Filter only POSTED journals
    const postedJournals = journals.filter(j => j.status === 'POSTED');

    const result: LedgerAccountResult = {
      accountId: accountId,
      accountName: ACCOUNTS_MAP[accountId] || `${accountId} - Unknown Account`,
      beginningBalance: 0,
      totalDebit: 0,
      totalCredit: 0,
      endingBalance: 0,
      transactions: []
    };

    // Determine normal balance based on first digit (1, 5, 6 = Debit; 2, 3, 4 = Credit)
    const isDebitNormal = ['1', '5', '6'].includes(accountId.charAt(0));

    // 2. Calculate Opening Balance (all transactions BEFORE dateFrom)
    let openingBalance = 0;
    if (dateFrom) {
      postedJournals.forEach(journal => {
        if (journal.transaction_date < dateFrom) {
          journal.lines.forEach(line => {
            if (line.account_id === accountId) {
              if (isDebitNormal) {
                openingBalance += line.debit - line.credit;
              } else {
                openingBalance += line.credit - line.debit;
              }
            }
          });
        }
      });
    }
    
    result.beginningBalance = openingBalance;

    // 3. Process transactions WITHIN the date range
    postedJournals.forEach(journal => {
      // Check date bounds
      if (dateFrom && journal.transaction_date < dateFrom) return;
      if (dateTo && journal.transaction_date > dateTo) return;

      journal.lines.forEach((line, index) => {
        if (line.account_id === accountId) {
          
          // Apply search filter if any
          const desc = line.description || journal.description;
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchVoucher = journal.voucher_no.toLowerCase().includes(query);
            const matchDesc = desc.toLowerCase().includes(query);
            
            // Format date to match UI ("DD MMM YY") for intuitive searching
            const d = new Date(journal.transaction_date);
            const day = d.getDate().toString().padStart(2, '0');
            const month = d.toLocaleString('id-ID', { month: 'short' });
            const year = d.getFullYear().toString().slice(-2);
            const formattedDate = `${day} ${month} ${year}`.toLowerCase();
            
            const matchDate = formattedDate.includes(query) || journal.transaction_date.includes(query);

            if (!matchVoucher && !matchDesc && !matchDate) return;
          }

          result.transactions.push({
            id: `${journal.voucher_no}-${index}`,
            date: journal.transaction_date,
            voucherNo: journal.voucher_no,
            description: desc,
            debit: line.debit,
            credit: line.credit,
            balance: 0 // Will calculate in next step
          });

          result.totalDebit += line.debit;
          result.totalCredit += line.credit;
        }
      });
    });

    // 4. Sort transactions by date and calculate running balance
    result.transactions.sort((a, b) => a.date.localeCompare(b.date));

    let runningBalance = result.beginningBalance;

    result.transactions.forEach(trx => {
      if (isDebitNormal) {
        runningBalance += trx.debit - trx.credit;
      } else {
        runningBalance += trx.credit - trx.debit;
      }
      trx.balance = runningBalance;
    });

    result.endingBalance = runningBalance;

    return result;
  }, [journals, accountId, dateFrom, dateTo, searchQuery]);

  return { ledgerData };
};
