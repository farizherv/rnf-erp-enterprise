import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, RefreshCw, Printer, Filter, ChevronDown, X, FileSpreadsheet, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLedgerCalculation, ACCOUNTS_MAP } from '../hooks/useLedgerCalculation';

// Utility for formatting currency
const formatCurrency = (amount: number) => {
  if (amount === 0) return '-';
  const formatted = Math.abs(amount).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount < 0 ? `(${formatted})` : formatted;
};

// Utility for formatting dates
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('id-ID', { month: 'short' });
  const year = d.getFullYear().toString().slice(-2);
  return `${day} ${month} ${year}`;
};

export const LedgerReport: React.FC = () => {
  // UI States
  const [showFilter, setShowFilter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter States
  const [selectedAccountId, setSelectedAccountId] = useState<string>('1102'); // Default to BCA for demo
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [useDateFilter, setUseDateFilter] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Keyboard Shortcuts (Hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowFilter(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch ledger data from the unified hook
  const effectiveDateFrom = useDateFilter ? dateFrom : undefined;
  const effectiveDateTo = useDateFilter ? dateTo : undefined;
  
  const { ledgerData } = useLedgerCalculation(selectedAccountId, effectiveDateFrom, effectiveDateTo, searchQuery);

  // Pagination Logic
  const totalPages = ledgerData ? Math.ceil(ledgerData.transactions.length / itemsPerPage) : 1;
  const paginatedTransactions = useMemo(() => {
    if (!ledgerData) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return ledgerData.transactions.slice(startIndex, startIndex + itemsPerPage);
  }, [ledgerData, currentPage, itemsPerPage]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const renderPaginationPills = () => {
    const displayTotalPages = Math.max(1, totalPages);
    
    let pages: (number | string)[] = [];
    if (displayTotalPages <= 7) {
      pages = Array.from({length: displayTotalPages}, (_, i) => i + 1);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, '...', displayTotalPages];
      } else if (currentPage >= displayTotalPages - 3) {
        pages = [1, '...', displayTotalPages - 4, displayTotalPages - 3, displayTotalPages - 2, displayTotalPages - 1, displayTotalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', displayTotalPages];
      }
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">...</span>;
      }
      return (
        <button
          key={p}
          onClick={() => setCurrentPage(p as number)}
          className={`min-w-[24px] h-6 flex items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
            currentPage === p 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 font-sans text-slate-800">
      
      {/* 1. TOP TOOLBAR (Accurate 4 / SAP Report Style) */}
      <div className="flex items-center px-4 py-1.5 bg-slate-100/80 border-b border-slate-200 shrink-0 gap-1 overflow-x-auto print:hidden shadow-sm z-10 justify-between">
        
        {/* Left Side: Report Title */}
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-[12px] text-slate-700 tracking-wide">LAPORAN BUKU BESAR</span>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 transition-colors ${showFilter ? 'bg-slate-200 text-blue-700 font-bold' : 'text-slate-700'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Filter</span>
          </button>
          
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="font-semibold text-[11px]">Perbarui</span>
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1"></div>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-[11px]">Print</span>
          </button>

          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-[11px]">Ekspor</span>
          </button>
        </div>
      </div>

      {/* 2. SPLIT PANE WORKSPACE */}
      <div className="flex flex-1 overflow-hidden bg-white print:bg-white">
        
        {/* LEFT PANE: Filter Panel (Accurate 4 Style) */}
        {showFilter && (
          <div className="w-[190px] bg-slate-50/80 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-left-2 duration-200 print:hidden">
            
            {/* Header Filter Kiri */}
            <div className="flex justify-between items-center px-2 py-1.5 bg-slate-100/80 border-b border-slate-200">
              <span className="font-bold text-slate-700 text-[11px]">Filter</span>
              <button 
                onClick={() => setShowFilter(false)}
                className="text-slate-400 hover:text-rose-600 transition-colors"
                title="Tutup Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2 flex flex-col gap-3 text-[11px] text-slate-700">
              
              {/* Cari */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-800">Cari:</label>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="< Kata Kunci / No >"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow placeholder:text-slate-400"
                />
              </div>

              {/* Pilih Akun */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-800">Akun Perkiraan:</label>
                <select 
                  value={selectedAccountId}
                  onChange={(e) => { setSelectedAccountId(e.target.value); setCurrentPage(1); }}
                  className="w-full px-1.5 py-1 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow"
                >
                  <option value="" disabled>-- Pilih Akun --</option>
                  {Object.entries(ACCOUNTS_MAP).map(([id, name]) => (
                    <option key={id} value={id}>{id} - {name.split(' - ')[1]}</option>
                  ))}
                </select>
              </div>

              {/* Filter Tanggal */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <input 
                    type="checkbox" 
                    checked={useDateFilter}
                    onChange={(e) => { setUseDateFilter(e.target.checked); setCurrentPage(1); }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                  />
                  Filter Tanggal
                </label>
                
                <div className={`flex flex-col gap-1 ml-4 transition-opacity ${!useDateFilter ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 text-slate-500">Dari</span>
                    <input 
                      type="date" 
                      value={dateFrom}
                      onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                      className="flex-1 px-1.5 py-0.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 text-slate-500">s/d</span>
                    <input 
                      type="date" 
                      value={dateTo}
                      onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                      className="flex-1 px-1.5 py-0.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* RIGHT PANE: Data Grid */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          
          <div className="flex-1 overflow-auto bg-white relative print:overflow-visible">
            <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap">
              <thead className="bg-slate-50 border-y border-slate-200 sticky top-0 z-10 print:static shadow-sm">
                <tr>
                  <th className="py-2 px-3 font-semibold text-slate-700 w-12 text-center border-r border-slate-200">No.</th>
                  <th className="py-2 px-3 font-semibold text-slate-700 w-36 border-r border-slate-200">No. Voucher</th>
                  <th className="py-2 px-3 font-semibold text-slate-700 w-28 border-r border-slate-200">Tanggal</th>
                  <th className="py-2 px-3 font-semibold text-slate-700 border-r border-slate-200 min-w-[200px]">Keterangan</th>
                  <th className="py-2 px-3 font-semibold text-slate-700 w-32 text-right border-r border-slate-200">Debit</th>
                  <th className="py-2 px-3 font-semibold text-slate-700 w-32 text-right border-r border-slate-200">Kredit</th>
                  <th className="py-2 px-3 font-semibold text-slate-700 w-36 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                
                {/* OPENING BALANCE ROW */}
                {ledgerData && (
                  <tr className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 border-r border-slate-100">-</td>
                    <td className="py-2 px-3 text-slate-400 border-r border-slate-100">-</td>
                    <td className="py-2 px-3 text-slate-400 border-r border-slate-100">-</td>
                    <td className="py-2 px-3 text-slate-700 font-bold border-r border-slate-100 italic bg-amber-50/30">Saldo Awal (Opening Balance)</td>
                    <td className="py-2 px-3 text-right text-slate-400 border-r border-slate-100">-</td>
                    <td className="py-2 px-3 text-right text-slate-400 border-r border-slate-100">-</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800 bg-amber-50/30">
                      {formatCurrency(ledgerData.beginningBalance)}
                    </td>
                  </tr>
                )}

                {/* TRANSACTIONS ROWS */}
                {paginatedTransactions.map((trx, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr 
                      key={trx.id} 
                      className="hover:bg-blue-50 transition-colors group cursor-default"
                    >
                      <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-100">{globalIndex}</td>
                      <td className="py-2 px-3 text-slate-700 font-medium border-r border-slate-100 hover:text-blue-600 hover:underline cursor-pointer">{trx.voucherNo}</td>
                      <td className="py-2 px-3 text-slate-600 border-r border-slate-100">{formatDate(trx.date)}</td>
                      <td className="py-2 px-3 text-slate-700 border-r border-slate-100 truncate max-w-sm" title={trx.description}>{trx.description}</td>
                      <td className="py-2 px-3 text-right text-slate-700 border-r border-slate-100 font-mono tracking-tighter">
                        {trx.debit > 0 ? formatCurrency(trx.debit) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 border-r border-slate-100 font-mono tracking-tighter">
                        {trx.credit > 0 ? formatCurrency(trx.credit) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800 font-mono tracking-tighter">
                        {formatCurrency(trx.balance)}
                      </td>
                    </tr>
                  );
                })}

                {/* EMPTY STATE */}
                {(!ledgerData || ledgerData.transactions.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      Tidak ada data mutasi untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
              
              {/* TOTAL FOOTER (Sticky Bottom) */}
              {ledgerData && (
                <tfoot className="sticky bottom-0 bg-slate-100 shadow-[0_-1px_0_rgba(203,213,225,1)] z-10 print:static">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-200">
                      Total Mutasi:
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800 border-r border-slate-200 font-mono tracking-tighter">
                      {formatCurrency(ledgerData.totalDebit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800 border-r border-slate-200 font-mono tracking-tighter">
                      {formatCurrency(ledgerData.totalCredit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 bg-emerald-50/50 font-mono tracking-tighter">
                      {formatCurrency(ledgerData.endingBalance)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* 3. PAGINATION FOOTER */}
          {ledgerData && (
            <div className="flex justify-between items-center px-4 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] shrink-0 print:hidden">
              <div className="flex items-center gap-2 text-slate-500">
                <span>Tampilkan:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-1 py-0.5 bg-white focus:outline-none hover:border-blue-400 cursor-pointer"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
                <div className="w-px h-3 bg-slate-300 mx-1"></div>
                <span>
                  Menampilkan {paginatedTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, ledgerData.transactions.length)} dari {ledgerData.transactions.length} Baris
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-full text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-0.5 mx-1">
                  {renderPaginationPills()}
                </div>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1 rounded-full text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
