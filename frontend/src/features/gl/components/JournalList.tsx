import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Trash2, RefreshCw, Printer, Filter, ChevronDown, X, FileSpreadsheet, Copy
} from 'lucide-react';
import type { JournalVoucherPayload } from '../types/journal';

interface JournalListProps {
  journals: JournalVoucherPayload[];
  onCreateNew: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onVoid: (id: string) => void;
  onDelete: (id: string) => void;
}

export const JournalList: React.FC<JournalListProps> = ({ 
  journals, onCreateNew, onView, onEdit, onDuplicate, onVoid, onDelete
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter States
  const [searchNo, setSearchNo] = useState('');
  const [searchKet, setSearchKet] = useState('');
  const [useDateFilter, setUseDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [typeFilters, setTypeFilters] = useState({
    'Bukti': true,
    'Barang Roll Over': false,
    'Akhir Periode': false,
    'Akhir Periode Produksi': false,
    'Depresiasi Aktiva': false,
    'Pembayaran Upah': false
  });

  const [statusFilters, setStatusFilters] = useState({
    'POSTED': true,
    'DRAFT': true,
    'VOID': false
  });

  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'}>({
    key: 'transaction_date',
    direction: 'desc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, journalId: string } | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedId(id);
    setContextMenu({ x: e.clientX, y: e.clientY, journalId: id });
  };

  const filteredJournals = useMemo(() => {
    let result = journals.filter(jv => {
      // Cari No & Ket
      if (searchNo && !jv.voucher_no.toLowerCase().includes(searchNo.toLowerCase())) return false;
      if (searchKet && !jv.description.toLowerCase().includes(searchKet.toLowerCase())) return false;
      
      // Tanggal
      if (useDateFilter && dateFrom && dateTo) {
        if (jv.transaction_date < dateFrom || jv.transaction_date > dateTo) return false;
      }
      
      // Tipe (Secara default sistem kita memproduksi tipe 'Bukti')
      const jvType = (jv as any).journal_type || 'Bukti';
      if (!typeFilters[jvType as keyof typeof typeFilters]) return false;
      
      // 4. Status Filter
      const jvStatus = jv.status;
      if (!statusFilters[jvStatus as keyof typeof statusFilters]) return false;
      
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortConfig.key as keyof typeof a];
      let valB: any = b[sortConfig.key as keyof typeof b];

      // Handle specific sorts
      if (sortConfig.key === 'type') {
        valA = (a as any).journal_type || 'Bukti';
        valB = (b as any).journal_type || 'Bukti';
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [journals, searchNo, searchKet, useDateFilter, dateFrom, dateTo, typeFilters, statusFilters, sortConfig]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchNo, searchKet, useDateFilter, dateFrom, dateTo, typeFilters, statusFilters, sortConfig]);

  const totalPages = Math.ceil(filteredJournals.length / itemsPerPage);

  const paginatedJournals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredJournals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredJournals, currentPage, itemsPerPage]);

  const selectedJournal = useMemo(() => 
    journals.find(j => j.voucher_no === selectedId), 
  [journals, selectedId]);

  // Handlers
  const handleEditClick = () => {
    if (!selectedJournal) return;
    if (selectedJournal.status === 'DRAFT') onEdit(selectedJournal.voucher_no);
    else onView(selectedJournal.voucher_no);
  };

  const handleDuplicateClick = () => {
    if (!selectedJournal) return;
    onDuplicate(selectedJournal.voucher_no);
  };

  // Keyboard Shortcuts (Hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onCreateNew();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Enter' && selectedId) {
        e.preventDefault();
        handleEditClick();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, onCreateNew, handleEditClick]);

  const handleDeleteClick = () => {
    if (!selectedJournal) return;
    
    // Logika ERP Standar:
    // DRAFT -> Bisa dihapus permanen dari database
    // POSTED -> Hanya bisa dibatalkan (VOID), tidak bisa dihapus permanen
    if (selectedJournal.status === 'DRAFT') {
      if (window.confirm(`Hapus permanen DRAFT jurnal ${selectedJournal.voucher_no} ?`)) {
        onDelete(selectedJournal.voucher_no);
        setSelectedId(null);
      }
    } else if (selectedJournal.status === 'POSTED') {
      if (window.confirm(`PERINGATAN AUDIT: Jurnal ${selectedJournal.voucher_no} sudah di-POSTING.\nJika dihapus, sistem akan mem-VOID (membatalkan) jurnal ini. Lanjutkan?`)) {
        onVoid(selectedJournal.voucher_no);
      }
    } else {
      alert("Jurnal ini sudah dalam status VOID.");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSelectedId(null);
    // Simulasi jaringan/proses fetch ala Enterprise
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['No. Voucher', 'Tanggal', 'Tipe', 'Total Debit', 'Total Kredit', 'Keterangan', 'Status'];
    const rows = filteredJournals.map(jv => {
      const jvType = (jv as any).journal_type || 'Bukti';
      return [
        jv.voucher_no,
        jv.transaction_date,
        jvType,
        jv.total_debit,
        jv.total_credit,
        `"${jv.description.replace(/"/g, '""')}"`, // escape quotes for CSV
        jv.status
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daftar_Jurnal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return (
      <ChevronDown 
        className={`w-3 h-3 text-blue-500 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} 
      />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('id-ID', { month: 'short' });
    const year = d.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
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

    return (
      <div className="flex items-center gap-1 bg-slate-100/50 rounded-full px-1 py-0.5">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
        
        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => typeof p === 'number' && setCurrentPage(p)}
            disabled={p === '...'}
            className={`min-w-[26px] h-[26px] px-1 flex items-center justify-center text-[11px] font-bold rounded-full transition-all
              ${p === currentPage 
                ? 'bg-blue-600 text-white shadow-sm' 
                : p === '...' 
                  ? 'text-slate-400 cursor-default font-normal' 
                  : 'text-slate-600 hover:bg-slate-200'}`}
          >
            {p}
          </button>
        ))}

        <button 
          onClick={() => setCurrentPage(prev => Math.min(displayTotalPages, prev + 1))}
          disabled={currentPage === displayTotalPages}
          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
        >
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 rounded-lg font-sans text-sm animate-in fade-in duration-200 overflow-hidden shadow-md print:shadow-none print:border-none">
      
      {/* 1. TOP ACTION TOOLBAR (Modern Enterprise Desktop) */}
      <div className="flex items-center gap-1 p-1 bg-white border-b border-slate-200 shrink-0 print:hidden">
        <button 
          onClick={onCreateNew}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-[11px]">Baru</span>
        </button>

        <button 
          onClick={handleEditClick}
          disabled={!selectedId}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors
            ${!selectedId ? 'opacity-50 cursor-not-allowed text-slate-400' : 'hover:bg-slate-100 text-slate-700'}`}
        >
          <Edit className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-[11px]">{selectedJournal && selectedJournal.status !== 'DRAFT' ? 'Lihat' : 'Ubah'}</span>
        </button>

        <button 
          onClick={handleDeleteClick}
          disabled={!selectedId || selectedJournal?.status === 'VOID'}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors
            ${(!selectedId || selectedJournal?.status === 'VOID') ? 'opacity-50 cursor-not-allowed text-slate-400' : 'hover:bg-rose-50 text-slate-700'}`}
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span className="font-semibold text-[11px]">Hapus</span>
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button 
          onClick={handleDuplicateClick}
          disabled={!selectedId}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors
            ${!selectedId ? 'opacity-50 cursor-not-allowed text-slate-400' : 'hover:bg-slate-100 text-slate-700'}`}
        >
          <Copy className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-[11px]">Salin</span>
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${showFilter ? 'bg-slate-200 text-slate-800 shadow-inner' : 'hover:bg-slate-100 text-slate-700'}`}
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-[11px]">Filter</span>
        </button>

        <button 
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-semibold text-[11px]">Perbarui</span>
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button 
          onClick={handlePrint}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-[11px]">Print</span>
        </button>

        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-[11px]">Ekspor</span>
        </button>
      </div>

      {/* 2. SPLIT PANE WORKSPACE */}
      <div className="flex flex-1 overflow-hidden bg-slate-50 print:bg-white">
        
        {/* LEFT PANE: Filter Panel (Accurate 4 Style, Modern UI) */}
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
                placeholder="< No. >"
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow placeholder:text-slate-400"
              />
              <input 
                type="text" 
                placeholder="< Keterangan >"
                value={searchKet}
                onChange={(e) => setSearchKet(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow placeholder:text-slate-400"
              />
            </div>

            {/* Filter Tanggal */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-slate-800">
                <input 
                  type="checkbox" 
                  checked={useDateFilter}
                  onChange={(e) => setUseDateFilter(e.target.checked)}
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
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1 px-1.5 py-0.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-6 text-slate-500">s/d</span>
                  <input 
                    type="date" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1 px-1.5 py-0.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Tipe Checkboxes */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800">Tipe :</label>
              <div className="flex flex-col gap-1.5 ml-1">
                {Object.keys(typeFilters).map(type => (
                  <label key={type} className="flex items-center gap-1.5 hover:text-blue-700 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={typeFilters[type as keyof typeof typeFilters]}
                      onChange={(e) => setTypeFilters({...typeFilters, [type]: e.target.checked})}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-slate-200"></div>

            {/* Status Checkboxes */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800">Status :</label>
              <div className="flex flex-col gap-1.5 ml-1">
                {Object.keys(statusFilters).map(status => (
                  <label key={status} className="flex items-center gap-1.5 hover:text-blue-700 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={statusFilters[status as keyof typeof statusFilters]}
                      onChange={(e) => setStatusFilters({...statusFilters, [status]: e.target.checked})}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                    />
                    <span className={status === 'VOID' ? 'text-rose-600' : ''}>{status}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>
        )}

        {/* RIGHT PANE: Modern Data Grid */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          <div className="flex-1 overflow-auto relative print:overflow-visible">
            <table className="w-full text-left whitespace-nowrap text-[13px] print:text-[10px]">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 shadow-[0_1px_0px_rgba(203,213,225,1)] print:static print:shadow-none print:border-b print:border-slate-800">
              <tr>
                <th className="px-3 py-2 font-semibold w-12 text-center border-r border-slate-200 print:border-slate-400">No.</th>
                
                <th 
                  className="px-3 py-2 font-semibold w-36 border-r border-slate-200 print:border-slate-400 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  onClick={() => handleSort('voucher_no')}
                >
                  <div className="flex items-center justify-between gap-1">
                    No. Voucher {renderSortIcon('voucher_no')}
                  </div>
                </th>
                
                <th 
                  className="px-3 py-2 font-semibold w-28 border-r border-slate-200 print:border-slate-400 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  onClick={() => handleSort('transaction_date')}
                >
                  <div className="flex items-center justify-between gap-1">
                    Tanggal {renderSortIcon('transaction_date')}
                  </div>
                </th>
                
                <th 
                  className="px-3 py-2 font-semibold w-32 border-r border-slate-200 print:border-slate-400 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center justify-between gap-1">
                    Tipe {renderSortIcon('type')}
                  </div>
                </th>
                
                <th 
                  className="px-3 py-2 font-semibold text-right w-36 border-r border-slate-200 print:border-slate-400 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  onClick={() => handleSort('total_debit')}
                >
                  <div className="flex items-center justify-end gap-1">
                    {renderSortIcon('total_debit')} Jumlah
                  </div>
                </th>
                
                <th className="px-3 py-2 font-semibold border-slate-200 print:border-slate-400">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-300">
              {paginatedJournals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    Tidak ada data jurnal yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedJournals.map((jv, index) => {
                  const isSelected = selectedId === jv.voucher_no;
                  const displayType = (jv as any).journal_type || 'Bukti';
                  return (
                    <tr 
                      key={jv.voucher_no} 
                      onClick={() => setSelectedId(jv.voucher_no)}
                      onDoubleClick={handleEditClick}
                      onContextMenu={(e) => handleContextMenu(e, jv.voucher_no)}
                      className={`cursor-default select-none transition-colors
                        ${isSelected ? 'bg-blue-100/80 text-blue-900' : 'hover:bg-slate-50 text-slate-700'}
                        ${jv.status === 'VOID' && !isSelected ? 'text-rose-500 line-through opacity-60' : ''}
                      `}
                    >
                      <td className={`px-3 py-1.5 text-center border-r border-slate-100 print:border-slate-300 ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-500'} print:text-black`}>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-3 py-1.5 font-medium border-r border-slate-100 print:border-slate-300 print:text-black">
                        {jv.voucher_no}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-100 print:border-slate-300 print:text-black">
                        {formatDate(jv.transaction_date)}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-100 print:border-slate-300 print:text-black">
                        {displayType}
                      </td>
                      <td className="px-3 py-1.5 text-right font-medium border-r border-slate-100 print:border-slate-300 print:text-black">
                        {formatCurrency(jv.total_debit)}
                      </td>
                      <td className={`px-3 py-1.5 truncate max-w-sm xl:max-w-xl print:text-black print:whitespace-normal ${isSelected ? 'text-blue-800' : 'text-slate-600'}`}>
                        {jv.description} 
                        {jv.status === 'VOID' && <span className="ml-2 text-[10px] uppercase font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 no-underline inline-block" style={{ textDecoration: 'none' }}>VOID</span>}
                        {jv.status === 'DRAFT' && <span className="ml-2 text-[10px] uppercase font-bold text-amber-500 bg-amber-50 px-1 rounded inline-block">DRAFT</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-3 py-0 text-[10px] text-slate-500 w-full flex items-center justify-between shrink-0 print:hidden h-8">
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-1">
                <span>Tampilkan:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-300 rounded outline-none hover:border-slate-400 focus:border-blue-500 transition-colors text-[10px] py-0.5 px-0.5 cursor-pointer"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <span className="border-l border-slate-300 h-3"></span>
              <span>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredJournals.length)} dari {filteredJournals.length} Baris</span>
              {selectedJournal && (
                <>
                  <span className="border-l border-slate-300 h-3"></span>
                  <span className="font-semibold text-blue-600">Terpilih: {selectedJournal.voucher_no}</span>
                </>
              )}
            </div>
            
            {renderPaginationPills()}
          </div>
        </div>

        {/* 3. CONTEXT MENU */}
        {contextMenu && (
          <div 
            className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-md py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button 
              onClick={handleEditClick}
              className="w-full text-left px-4 py-1.5 text-sm hover:bg-slate-100 text-slate-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4 text-blue-600" />
              {selectedJournal?.status !== 'DRAFT' ? 'Lihat Detail' : 'Ubah Data'}
            </button>
            <button 
              onClick={handleDuplicateClick}
              className="w-full text-left px-4 py-1.5 text-sm hover:bg-slate-100 text-slate-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4 text-indigo-600" /> Salin Transaksi
            </button>
            <div className="w-full h-px bg-slate-100 my-1" />
            <button 
              onClick={handleDeleteClick}
              disabled={selectedJournal?.status === 'VOID'}
              className="w-full text-left px-4 py-1.5 text-sm hover:bg-rose-50 text-slate-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedJournal?.status === 'POSTED' ? (
                <><X className="w-4 h-4 text-rose-600" /> Batalkan (VOID)</>
              ) : (
                <><Trash2 className="w-4 h-4 text-rose-600" /> Hapus</>
              )}
            </button>
            <button 
              onClick={handlePrint}
              className="w-full text-left px-4 py-1.5 text-sm hover:bg-slate-100 text-slate-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-500" /> Cetak Baris Ini
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
