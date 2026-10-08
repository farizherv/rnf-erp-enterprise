import React, { useState, useCallback, useMemo } from 'react';
import { X, Printer, FileSpreadsheet, RefreshCw, Filter, PackagePlus } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface IncomingStockReportViewProps {
  onClose?: () => void;
}

export const IncomingStockReportView: React.FC<IncomingStockReportViewProps> = ({ onClose }) => {
  const { items, movements } = useInventory();

  // ── View State ──
  const [showFilter, setShowFilter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filter State ──
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  // ── Item Lookup Map ──
  const itemMap = useMemo(() => {
    const map = new Map<string, { sku: string; unit: string }>();
    items.forEach(i => map.set(i.id, { sku: i.sku, unit: i.unit }));
    return map;
  }, [items]);

  // ── Derived Data ──
  const filteredMovements = useMemo(() => {
    let result = movements.filter(m => m.type === 'IN');
    
    // Date Range Filter
    const sDate = new Date(startDate).getTime();
    const eDate = new Date(endDate).getTime() + 86399999;
    
    result = result.filter(m => {
      const mDate = new Date(m.date).getTime();
      return mDate >= sDate && mDate <= eDate;
    });

    // Search Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => {
        const itemInfo = itemMap.get(m.itemId);
        return (
          m.id.toLowerCase().includes(q) ||
          m.itemName.toLowerCase().includes(q) ||
          (itemInfo && itemInfo.sku.toLowerCase().includes(q))
        );
      });
    }
    
    // Sort descending by date
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements, startDate, endDate, search, itemMap]);

  const paginated = filteredMovements.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const total = filteredMovements.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ── Actions ──
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handlePrint = useCallback(() => {
    let tableHTML = `<table><thead><tr><th>No.</th><th>JOB-REG</th><th>Tanggal</th><th>Barang</th><th>Jumlah Masuk</th><th>Satuan</th></tr></thead><tbody>`;
    filteredMovements.forEach((mov, idx) => {
      const itemInfo = itemMap.get(mov.itemId);
      const jobReg = itemInfo?.sku || mov.id;
      const unit = itemInfo?.unit || 'Unit';
      const dateStr = new Date(mov.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
      tableHTML += `<tr><td style="text-align:center;">${idx + 1}</td><td>${jobReg}</td><td>${dateStr}</td><td>${mov.itemName}</td><td style="text-align:right;font-weight:bold;color:#059669;">${mov.quantity.toLocaleString('id-ID')}</td><td>${unit}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html><html><head><title>Laporan Barang Masuk</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 24px; }
          h1 { font-size: 18px; margin-bottom: 8px; color: #1e293b; }
          p { font-size: 13px; color: #64748b; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; }
          td { padding: 6px 12px; border: 1px solid #e2e8f0; color: #334155; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print { body { padding: 0; } }
        </style>
        </head><body>
        <h1>Laporan Barang Masuk</h1>
        <p>Periode: ${new Date(startDate).toLocaleDateString('id-ID')} s.d. ${new Date(endDate).toLocaleDateString('id-ID')}<br/>
        Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        ${tableHTML}
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [filteredMovements, startDate, endDate, itemMap]);

  const handleExport = useCallback(() => {
    let csvContent = 'No,JOB-REG,Tanggal,Barang,Jumlah Masuk,Satuan\n';
    filteredMovements.forEach((mov, idx) => {
      const itemInfo = itemMap.get(mov.itemId);
      const jobReg = itemInfo?.sku || mov.id;
      const unit = itemInfo?.unit || 'Unit';
      const dateStr = new Date(mov.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
      csvContent += `${idx + 1},"${jobReg}","${dateStr}","${mov.itemName}",${mov.quantity},"${unit}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Barang_Masuk_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredMovements, itemMap]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      
      {/* 1. Header Title */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <PackagePlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-none">Laporan Barang Masuk</h2>
            <p className="text-xs text-slate-500 mt-1">Riwayat Penerimaan Barang Berdasarkan Tanggal</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Tutup">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
        <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors ${showFilter ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-700'}`}>
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-xs">Filter</span>
        </button>
        <button onClick={handleRefresh} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <RefreshCw className={`w-4 h-4 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-semibold text-xs">Perbarui</span>
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button onClick={handlePrint} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <Printer className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-xs">Print</span>
        </button>
        <button onClick={handleExport} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-xs">Ekspor</span>
        </button>
      </div>

      {/* 3. Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Filter */}
        {showFilter && (
          <div className="w-[240px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="flex justify-between items-center px-3 py-2 bg-slate-100 border-b border-slate-200">
              <span className="font-bold text-slate-700 text-xs">Filter Laporan</span>
              <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-rose-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 flex flex-col gap-4 text-xs text-slate-700">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Cari Barang:</label>
                  {search && (
                    <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline">Reset</button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="JOB-REG / Nama"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-slate-800">Tanggal Awal:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-slate-800">Tanggal Akhir:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Right Pane: Table */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          <div className="flex-1 overflow-auto bg-white border-l border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="px-4 py-2 w-12 text-center border-r border-slate-200">No.</th>
                  <th className="px-4 py-2 border-r border-slate-200 w-36">JOB-REG</th>
                  <th className="px-4 py-2 border-r border-slate-200 w-32">Tanggal</th>
                  <th className="px-4 py-2 border-r border-slate-200">Barang</th>
                  <th className="px-4 py-2 text-right border-r border-slate-200 w-36">Jumlah Masuk</th>
                  <th className="px-4 py-2 w-28">Satuan</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-100 ${isRefreshing ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}>
                {paginated.map((mov, idx) => {
                  const itemInfo = itemMap.get(mov.itemId);
                  const jobReg = itemInfo?.sku || mov.id;
                  const unit = itemInfo?.unit || '-';
                  const dateStr = new Date(mov.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
                  return (
                    <tr key={mov.id + idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 text-center text-slate-500 border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-4 py-2 font-mono text-slate-600 border-r border-slate-100">{jobReg}</td>
                      <td className="px-4 py-2 text-slate-600 border-r border-slate-100">{dateStr}</td>
                      <td className="px-4 py-2 font-medium text-slate-800 border-r border-slate-100">{mov.itemName}</td>
                      <td className="px-4 py-2 text-right border-r border-slate-100 font-bold text-emerald-600">
                        {mov.quantity.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-2 text-slate-600">{unit}</td>
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data barang masuk yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span>Tampilkan:</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-1 py-0.5 border border-slate-300 rounded bg-white outline-none">
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="w-px h-3 bg-slate-300"></div>
              <span>Menampilkan {total === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, total)} dari {total} Baris</span>
            </div>
            <div className="flex items-center gap-1">
              <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman Sebelumnya">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-600'}`}>{p}</button>
              ))}
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman Selanjutnya">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
