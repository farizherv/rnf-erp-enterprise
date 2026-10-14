import React, { useState, useCallback, useMemo } from 'react';
import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  RefreshCw, 
  Filter, 
  Building2, 
  Package, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { StockCardReportView } from './StockCardReportView';

interface StockReportViewProps {
  onClose?: () => void;
  onSelectJobReg?: (item: any) => void;
  onNavigateToMutasi?: (jobReg: string) => void;
  onOpenStockCardTab?: (sku: string) => void;
}

type SortField = 'sku' | 'name' | 'category' | 'type' | 'minStock' | 'currentStock' | 'status';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'ALL' | 'CRITICAL' | 'NORMAL';
type TypeFilter = 'ALL' | 'INVENTORY' | 'SERVICE';

export const StockReportView: React.FC<StockReportViewProps> = ({ 
  onClose, 
  onSelectJobReg, 
  onNavigateToMutasi,
  onOpenStockCardTab
}) => {
  const { items, categories, refresh } = useInventory();

  // ── View State ──
  const [showFilter, setShowFilter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // ── Full-Page Stock Card State (Fallback if tab system not used) ──
  const [selectedStockCardSku, setSelectedStockCardSku] = useState<string | null>(null);

  // ── Sorting State ──
  const [sortField, setSortField] = useState<SortField>('currentStock');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ── Filter State ──
  const [searchJobReg, setSearchJobReg] = useState('');
  const [searchItemName, setSearchItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [selectedType, setSelectedType] = useState<TypeFilter>('ALL');

  // ── Filter Items ──
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filter JOB-REG
      if (searchJobReg) {
        const q = searchJobReg.trim().toLowerCase();
        if (!item.sku.toLowerCase().includes(q)) return false;
      }

      // Filter Nama Barang
      if (searchItemName) {
        const q = searchItemName.trim().toLowerCase();
        if (!item.name.toLowerCase().includes(q)) return false;
      }

      // Filter Kategori
      if (selectedCategory !== 'ALL') {
        if ((item.category || '').toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Filter Tipe Barang (Inventory vs Service)
      if (selectedType !== 'ALL') {
        const itemType = (item.type || 'INVENTORY').toUpperCase();
        if (selectedType === 'SERVICE' && itemType !== 'SERVICE') return false;
        if (selectedType === 'INVENTORY' && itemType === 'SERVICE') return false;
      }

      // Filter Status Stok (Kritis vs Aman)
      const isCritical = item.currentStock < item.minStock;
      if (selectedStatus === 'CRITICAL' && !isCritical) return false;
      if (selectedStatus === 'NORMAL' && isCritical) return false;

      return true;
    });
  }, [items, searchJobReg, searchItemName, selectedCategory, selectedStatus, selectedType]);

  // ── Sort Items ──
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    list.sort((a, b) => {
      if (sortField === 'status') {
        const aCrit = a.currentStock < a.minStock ? 1 : 0;
        const bCrit = b.currentStock < b.minStock ? 1 : 0;
        return sortOrder === 'asc' ? aCrit - bCrit : bCrit - aCrit;
      }

      let valA: any = a[sortField as keyof typeof a];
      let valB: any = b[sortField as keyof typeof b];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }, [filteredItems, sortField, sortOrder]);

  // ── Pagination ──
  const total = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginated = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── Sort Toggle Helper ──
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 inline ml-1 opacity-70" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-blue-600 inline ml-1 font-bold" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-blue-600 inline ml-1 font-bold" />
    );
  };

  // ── Reset All Filters ──
  const handleResetFilters = () => {
    setSearchJobReg('');
    setSearchItemName('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedType('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchJobReg || searchItemName || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL');

  // ── Refresh Action ──
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // ── Enterprise Print Engine ──
  const handlePrint = useCallback(() => {
    const formattedDate = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let tableRows = '';
    sortedItems.forEach((item, idx) => {
      const isCritical = item.currentStock <= item.minStock;
      const statusLabel = isCritical ? 'KRITIS' : 'AMAN';
      const statusColor = isCritical ? '#dc2626' : '#16a34a';
      const isService = (item.type || 'INVENTORY') === 'SERVICE';
      const typeLabel = isService ? 'Service' : 'Inventory';
      const typeColor = isService ? '#7e22ce' : '#047857';

      tableRows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="font-weight:600;color:#2563eb;">${item.sku}</td>
          <td style="font-weight:500;">${item.name}</td>
          <td>${item.category || '-'}</td>
          <td style="text-align:center;font-weight:600;color:${typeColor};">${typeLabel}</td>
          <td style="text-align:right;">${item.minStock.toLocaleString('id-ID')} ${item.unit || 'UNIT'}</td>
          <td style="text-align:right;font-weight:bold;color:${isCritical ? '#dc2626' : '#1e293b'};">${item.currentStock.toLocaleString('id-ID')} ${item.unit || 'UNIT'}</td>
          <td style="text-align:center;font-weight:bold;color:${statusColor};">${statusLabel}</td>
        </tr>
      `;
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Stok Barang Penjualan - RNF ERP Enterprise</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #1e293b; font-size: 11px; }
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .company-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
            .report-title { font-size: 14px; font-weight: 700; color: #2563eb; margin: 4px 0 0 0; }
            .meta-info { font-size: 10px; color: #64748b; text-align: right; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 24px; }
            th { background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 6px 8px; border: 1px solid #cbd5e1; }
            td { padding: 6px 8px; border: 1px solid #e2e8f0; color: #334155; }
            tr:nth-child(even) { background: #f8fafc; }
            .signature-block { display: flex; justify-content: space-between; margin-top: 36px; page-break-inside: avoid; }
            .signature-box { width: 180px; text-align: center; }
            .signature-line { margin-top: 55px; border-bottom: 1px solid #334155; }
            .signature-role { font-size: 10px; font-weight: 700; margin-top: 4px; color: #475569; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="company-title">RNF LOGISTIK INDONESIA</h1>
              <div class="report-title">LAPORAN STOK BARANG PENJUALAN</div>
              <div style="font-size:10px;color:#475569;margin-top:2px;">Daftar Kuantitas &amp; Peringatan Stok Minimum</div>
            </div>
            <div class="meta-info">
              <div><strong>Waktu Cetak:</strong> ${formattedDate}</div>
              <div><strong>Total Data:</strong> ${sortedItems.length} Material SKU</div>
              <div><strong>Status Filter:</strong> ${selectedCategory !== 'ALL' ? selectedCategory : 'Semua Kategori'} • ${selectedStatus !== 'ALL' ? (selectedStatus === 'CRITICAL' ? 'Stok Kritis' : 'Stok Aman') : 'Semua Status'}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:35px;text-align:center;">No.</th>
                <th style="width:110px;">JOB-REG</th>
                <th>Nama Barang</th>
                <th style="width:90px;">Kategori</th>
                <th style="width:80px;text-align:center;">Tipe Barang</th>
                <th style="text-align:right;width:100px;">Stok Minimum</th>
                <th style="text-align:right;width:100px;">Stok Saat Ini</th>
                <th style="text-align:center;width:80px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="signature-block">
            <div class="signature-box">
              <div style="color:#64748b;">Disiapkan Oleh:</div>
              <div class="signature-line"></div>
              <div class="signature-role">Admin / Gudang</div>
            </div>
            <div class="signature-box">
              <div style="color:#64748b;">Diperiksa Oleh:</div>
              <div class="signature-line"></div>
              <div class="signature-role">Kepala Gudang</div>
            </div>
            <div class="signature-box">
              <div style="color:#64748b;">Disetujui Oleh:</div>
              <div class="signature-line"></div>
              <div class="signature-role">Manajer / Direktur</div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  }, [sortedItems, selectedCategory, selectedStatus, selectedType]);

  // ── Enterprise CSV Export ──
  const handleExport = useCallback(() => {
    if (sortedItems.length === 0) {
      alert('Tidak ada data stok untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'JOB-REG',
      'Nama Barang',
      'Kategori',
      'Tipe Barang',
      'Satuan (UOM)',
      'Stok Minimum',
      'Stok Saat Ini',
      'Status'
    ];

    const rows = sortedItems.map((item, idx) => {
      const isCritical = item.currentStock < item.minStock;
      const statusLabel = isCritical ? 'KRITIS' : 'AMAN';
      const typeLabel = (item.type || 'INVENTORY') === 'SERVICE' ? 'Service' : 'Inventory';

      return [
        idx + 1,
        `"${item.sku}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        `"${typeLabel}"`,
        `"${item.unit || 'UNIT'}"`,
        item.minStock,
        item.currentStock,
        `"${statusLabel}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Stok_Barang_Penjualan_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sortedItems]);

  // Full-Page View Transition Fallback (if not opened via top tab)
  if (selectedStockCardSku) {
    return (
      <StockCardReportView
        sku={selectedStockCardSku}
        onClose={() => setSelectedStockCardSku(null)}
        onNavigateToMutasi={onNavigateToMutasi}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">

      {/* 1. Header Title */}
      <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-none">Laporan Stok Barang Penjualan</h2>
            <p className="text-xs text-slate-500 mt-1">Daftar Kuantitas &amp; Peringatan Stok Minimum</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Tutup Laporan"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Enterprise Action Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setShowFilter(!showFilter)} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showFilter 
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
          >
            <Filter className={`w-3.5 h-3.5 ${showFilter ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Filter {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600 inline-block ml-0.5" />}</span>
          </button>

          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Perbarui</span>
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1.5" />

          <button 
            onClick={handlePrint} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print</span>
          </button>

          <button 
            onClick={handleExport} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor</span>
          </button>
        </div>

        {/* Live Filter Indicator & Counter */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Menampilkan: <strong className="text-slate-800">{filteredItems.length}</strong> dari {items.length} Barang</span>
          {hasActiveFilters && (
            <button 
              onClick={handleResetFilters}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline ml-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Body: Split Sidebar Filter + Table View */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Pane: Collapsible Enterprise Filter Sidebar */}
        {showFilter && (
          <div className="w-[260px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto shadow-sm">
            
            <div className="flex justify-between items-center px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                Filter Data Stok
              </span>
              <button 
                onClick={() => setShowFilter(false)} 
                className="text-slate-400 hover:text-rose-600 transition-colors"
                title="Tutup Filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4 text-xs text-slate-700">
              
              {/* Filter 1: JOB-REG */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Cari JOB-REG:</label>
                  {searchJobReg && (
                    <button onClick={() => { setSearchJobReg(''); setCurrentPage(1); }} className="text-[10px] text-blue-600 hover:underline">Reset</button>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="< JOB-REG >" 
                  value={searchJobReg}
                  onChange={(e) => { setSearchJobReg(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 text-xs placeholder:text-slate-400"
                />
              </div>

              {/* Filter 2: Nama Barang */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Cari Nama Barang:</label>
                  {searchItemName && (
                    <button onClick={() => { setSearchItemName(''); setCurrentPage(1); }} className="text-[10px] text-blue-600 hover:underline">Reset</button>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="< Nama Barang >" 
                  value={searchItemName}
                  onChange={(e) => { setSearchItemName(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 text-xs placeholder:text-slate-400"
                />
              </div>

              {/* Filter 3: Kategori */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-800">Kategori Barang:</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 font-medium text-xs text-slate-700"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map((c: any) => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter 4: Status Stok */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-800">Status Stok:</label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value as StatusFilter); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 font-medium text-xs text-slate-700"
                >
                  <option value="ALL">Tampilkan Seluruh Stok</option>
                  <option value="CRITICAL">Hanya Stok Kritis</option>
                  <option value="NORMAL">Hanya Stok Aman</option>
                </select>
              </div>

              {/* Filter 5: Tipe Barang */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-800">Tipe Barang:</label>
                <select 
                  value={selectedType}
                  onChange={(e) => { setSelectedType(e.target.value as TypeFilter); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 font-medium text-xs text-slate-700"
                >
                  <option value="ALL">Semua Tipe Barang</option>
                  <option value="INVENTORY">Inventory (Barang Stok)</option>
                  <option value="SERVICE">Service (Jasa / Perbaikan)</option>
                </select>
              </div>

              {/* Reset All Button */}
              {hasActiveFilters && (
                <button 
                  onClick={handleResetFilters}
                  className="mt-2 w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors text-center"
                >
                  Reset Seluruh Filter
                </button>
              )}

            </div>
          </div>
        )}

        {/* Right Pane: Enterprise Data Table Area */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          
          <div className="flex-1 overflow-auto border-l border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 select-none shadow-2xs">
                <tr className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  
                  <th className="px-3.5 py-2.5 w-12 text-center border-r border-slate-200">No.</th>
                  
                  <th 
                    onClick={() => handleSort('sku')} 
                    className="px-3.5 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>JOB-REG</span>
                    {renderSortIndicator('sku')}
                  </th>

                  <th 
                    onClick={() => handleSort('name')} 
                    className="px-3.5 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Nama Barang</span>
                    {renderSortIndicator('name')}
                  </th>

                  <th 
                    onClick={() => handleSort('category')} 
                    className="px-3.5 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Kategori</span>
                    {renderSortIndicator('category')}
                  </th>

                  <th 
                    onClick={() => handleSort('type')} 
                    className="px-3.5 py-2.5 text-center border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Tipe Barang</span>
                    {renderSortIndicator('type')}
                  </th>

                  <th 
                    onClick={() => handleSort('minStock')} 
                    className="px-3.5 py-2.5 text-right border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Stok Minimum</span>
                    {renderSortIndicator('minStock')}
                  </th>

                  <th 
                    onClick={() => handleSort('currentStock')} 
                    className="px-3.5 py-2.5 text-right border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Stok Saat Ini</span>
                    {renderSortIndicator('currentStock')}
                  </th>

                  <th 
                    onClick={() => handleSort('status')} 
                    className="px-3.5 py-2.5 text-center cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Status</span>
                    {renderSortIndicator('status')}
                  </th>

                </tr>
              </thead>

              <tbody className={`divide-y divide-slate-100 ${isRefreshing ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-600">Tidak ada material yang sesuai kriteria filter.</span>
                        <p className="text-[11px] text-slate-400">Silakan ubah kata kunci atau tekan tombol Reset Filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((item, idx) => {
                    const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                    const isSelected = selectedItemId === item.id;
                    const isCritical = item.currentStock < item.minStock;
                    const isService = (item.type || 'INVENTORY') === 'SERVICE';

                    return (
                      <tr 
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50/80' 
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="px-3.5 py-2 text-center text-slate-400 font-mono border-r border-slate-100">{globalIdx}</td>
                        
                        <td className="px-3.5 py-2 border-r border-slate-100">
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItemId(item.id);
                              if (onOpenStockCardTab) {
                                onOpenStockCardTab(item.sku);
                              } else {
                                setSelectedStockCardSku(item.sku);
                              }
                              if (onSelectJobReg) onSelectJobReg(item);
                            }}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors inline-block"
                            title={`Buka Halaman Kartu Stok & Riwayat Mutasi ${item.sku}`}
                          >
                            {item.sku}
                          </span>
                        </td>

                        <td className="px-3.5 py-2 font-semibold text-slate-800 border-r border-slate-100">
                          {item.name}
                        </td>

                        <td className="px-3.5 py-2 text-slate-600 border-r border-slate-100 font-medium">
                          {item.category || '-'}
                        </td>

                        <td className="px-3.5 py-2 text-center border-r border-slate-100">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isService 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isService ? 'Service' : 'Inventory'}
                          </span>
                        </td>

                        <td className="px-3.5 py-2 text-right font-medium text-slate-600 border-r border-slate-100">
                          {item.minStock.toLocaleString('id-ID')} {item.unit || 'UNIT'}
                        </td>

                        <td className="px-3.5 py-2 text-right font-bold border-r border-slate-100">
                          <span className={isCritical ? 'text-red-600 font-bold' : 'text-slate-800 font-bold'}>
                            {item.currentStock.toLocaleString('id-ID')} {item.unit || 'UNIT'}
                          </span>
                        </td>

                        <td className="px-3.5 py-2 text-center">
                          {isCritical ? (
                            <span className="text-red-600 font-bold">KRITIS</span>
                          ) : (
                            <span className="text-emerald-600 font-bold">AMAN</span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Pagination Footer */}
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-600 select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span>Tampilkan:</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} 
                  className="px-1 py-0.5 border border-slate-300 rounded bg-white outline-none focus:border-blue-500 font-semibold"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <span>
                Menampilkan {total === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, total)} dari {total} Baris
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
