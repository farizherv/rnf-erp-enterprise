import React, { useState, useCallback, useMemo } from 'react';
import { X, Printer, FileSpreadsheet, RefreshCw, Filter, Building2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface StockReportViewProps {
  onClose?: () => void;
}

export const StockReportView: React.FC<StockReportViewProps> = ({ onClose }) => {
  const { items } = useInventory();

  // ── View State ──
  const [showFilter, setShowFilter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filter State ──
  const [filterType, setFilterType] = useState<'ALL' | 'MINIMUM'>('ALL');
  const [search, setSearch] = useState('');

  // ── Derived Data ──
  const filteredItems = useMemo(() => {
    let result = items;
    if (filterType === 'MINIMUM') {
      result = result.filter(i => i.currentStock < i.minStock);
    }
    if (search) {
      result = result.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.sku.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [items, filterType, search]);

  const paginated = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ── Actions ──
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handlePrint = useCallback(() => {
    let tableHTML = `<table><thead><tr><th>No.</th><th>JOB-REG</th><th>Nama Barang</th><th>Kategori</th><th>Stok Minimum</th><th>Stok Saat Ini</th><th>Status</th></tr></thead><tbody>`;
    filteredItems.forEach((item, idx) => {
      const isCritical = item.currentStock < item.minStock;
      const statusText = isCritical ? 'Kritis' : 'Aman';
      tableHTML += `<tr><td>${idx + 1}</td><td>${item.sku}</td><td>${item.name}</td><td>${item.category}</td><td style="text-align:right;">${item.minStock} ${item.unit}</td><td style="text-align:right;">${item.currentStock} ${item.unit}</td><td style="text-align:center;color:${isCritical ? '#dc2626' : '#059669'};font-weight:bold;">${statusText}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html><html><head><title>Laporan Stok Barang Penjualan</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 24px; }
          h1 { font-size: 18px; margin-bottom: 16px; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; }
          td { padding: 6px 12px; border: 1px solid #e2e8f0; color: #334155; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print { body { padding: 0; } }
        </style>
        </head><body>
        <h1>Laporan Stok Barang Penjualan</h1>
        <p style="font-size:12px;color:#94a3b8;margin-bottom:12px;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        ${tableHTML}
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [filteredItems]);

  const handleExport = useCallback(() => {
    let csvContent = 'No,JOB-REG,Nama Barang,Kategori,Stok Minimum,Stok Saat Ini,Status\n';
    filteredItems.forEach((item, idx) => {
      const isCritical = item.currentStock < item.minStock;
      const statusText = isCritical ? 'Kritis' : 'Aman';
      csvContent += `${idx + 1},"${item.sku}","${item.name}","${item.category}",${item.minStock},${item.currentStock},"${statusText}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Stok_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredItems]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">

      {/* 1. Header Title */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-none">Laporan Stok Barang Penjualan</h2>
            <p className="text-xs text-slate-500 mt-1">Daftar Kuantitas & Peringatan Stok Minimum</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
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
              <span className="font-bold text-slate-700 text-xs">Filter Data Stok</span>
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
                <label className="font-semibold text-slate-800">Status Stok:</label>
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="ALL">Tampilkan Seluruh Stok</option>
                  <option value="MINIMUM">Hanya Stok Minimum / Kritis</option>
                </select>
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
                  <th className="px-4 py-2 border-r border-slate-200 w-32">JOB-REG</th>
                  <th className="px-4 py-2 border-r border-slate-200">Nama Barang</th>
                  <th className="px-4 py-2 border-r border-slate-200">Kategori</th>
                  <th className="px-4 py-2 text-right border-r border-slate-200 w-32">Stok Minimum</th>
                  <th className="px-4 py-2 text-right border-r border-slate-200 w-32">Stok Saat Ini</th>
                  <th className="px-4 py-2 text-center w-28">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-100 ${isRefreshing ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}>
                {paginated.map((item, idx) => {
                  const isCritical = item.currentStock < item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 text-center text-slate-500 border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-4 py-2 font-mono text-slate-600 border-r border-slate-100">{item.sku}</td>
                      <td className="px-4 py-2 font-medium text-slate-800 border-r border-slate-100">{item.name}</td>
                      <td className="px-4 py-2 text-slate-500 border-r border-slate-100">{item.category}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-500 border-r border-slate-100">{item.minStock} {item.unit}</td>
                      <td className="px-4 py-2 text-right border-r border-slate-100">
                        <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                            Kritis
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data yang sesuai dengan filter pencarian.
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
