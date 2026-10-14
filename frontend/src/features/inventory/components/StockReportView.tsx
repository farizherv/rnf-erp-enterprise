import React, { useState, useCallback, useMemo } from 'react';
import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  RefreshCw, 
  Filter, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  TrendingUp, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  Layers,
  DollarSign,
  ShieldAlert,
  Boxes
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface StockReportViewProps {
  onClose?: () => void;
}

type SortField = 'sku' | 'name' | 'category' | 'type' | 'minStock' | 'currentStock' | 'deviation' | 'unitPrice' | 'valuation' | 'status';
type SortOrder = 'asc' | 'desc';
type HealthStatus = 'ALL' | 'CRITICAL' | 'OUT_OF_STOCK' | 'WARNING' | 'NORMAL';

export const StockReportView: React.FC<StockReportViewProps> = ({ onClose }) => {
  const { items, categories, movements, refresh } = useInventory();

  // ── View State ──
  const [showFilter, setShowFilter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // ── Sorting State ──
  const [sortField, setSortField] = useState<SortField>('currentStock');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ── Filter State (Enterprise Multi-Param) ──
  const [searchJobReg, setSearchJobReg] = useState('');
  const [searchItemName, setSearchItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedHealth, setSelectedHealth] = useState<HealthStatus>('ALL');

  // ── 1. Map of Last Inbound Purchase Price per Item ──
  const itemPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    // Filter inbound movements with valid price
    const inMovements = movements.filter(m => m.type === 'IN' && m.price_each !== undefined && m.price_each !== null && Number(m.price_each) > 0);
    inMovements.forEach(m => {
      // Latest takes priority if list is ordered descending
      if (!map.has(m.itemId)) {
        map.set(m.itemId, Number(m.price_each));
      }
    });
    return map;
  }, [movements]);

  // ── 2. Enriched Items with Health, Valuation, and Deviation ──
  const enrichedItems = useMemo(() => {
    return items.map(item => {
      const unitPrice = itemPriceMap.get(item.id) || 0;
      const totalValuation = item.currentStock * unitPrice;
      const deviation = item.currentStock - item.minStock;
      
      let healthStatus: 'OUT_OF_STOCK' | 'CRITICAL' | 'WARNING' | 'NORMAL' = 'NORMAL';
      if (item.currentStock <= 0) {
        healthStatus = 'OUT_OF_STOCK';
      } else if (item.currentStock < item.minStock) {
        healthStatus = 'CRITICAL';
      } else if (item.currentStock === item.minStock) {
        healthStatus = 'WARNING';
      } else {
        healthStatus = 'NORMAL';
      }

      return {
        ...item,
        unitPrice,
        totalValuation,
        deviation,
        healthStatus
      };
    });
  }, [items, itemPriceMap]);

  // ── 3. Filtered Items ──
  const filteredItems = useMemo(() => {
    return enrichedItems.filter(item => {
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

      // Filter Tipe Barang
      if (selectedType !== 'ALL') {
        if (item.type !== selectedType) return false;
      }

      // Filter Status Kesehatan Stok
      if (selectedHealth !== 'ALL') {
        if (selectedHealth === 'CRITICAL' && (item.healthStatus !== 'CRITICAL' && item.healthStatus !== 'OUT_OF_STOCK')) return false;
        if (selectedHealth === 'OUT_OF_STOCK' && item.healthStatus !== 'OUT_OF_STOCK') return false;
        if (selectedHealth === 'WARNING' && item.healthStatus !== 'WARNING') return false;
        if (selectedHealth === 'NORMAL' && item.healthStatus !== 'NORMAL') return false;
      }

      return true;
    });
  }, [enrichedItems, searchJobReg, searchItemName, selectedCategory, selectedType, selectedHealth]);

  // ── 4. Sorted Items ──
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    list.sort((a, b) => {
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

  // ── 5. Pagination ──
  const total = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginated = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── 6. KPI Aggregate Calculations ──
  const kpiStats = useMemo(() => {
    let totalQty = 0;
    let totalValuation = 0;
    let criticalCount = 0;
    let outOfStockCount = 0;

    filteredItems.forEach(it => {
      totalQty += it.currentStock;
      totalValuation += it.totalValuation;
      if (it.healthStatus === 'OUT_OF_STOCK') {
        outOfStockCount++;
        criticalCount++;
      } else if (it.healthStatus === 'CRITICAL') {
        criticalCount++;
      }
    });

    return {
      totalSKU: filteredItems.length,
      totalQty,
      totalValuation,
      criticalCount,
      outOfStockCount
    };
  }, [filteredItems]);

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
    setSelectedType('ALL');
    setSelectedHealth('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchJobReg || searchItemName || selectedCategory !== 'ALL' || selectedType !== 'ALL' || selectedHealth !== 'ALL';

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
      const isCritical = item.healthStatus === 'CRITICAL' || item.healthStatus === 'OUT_OF_STOCK';
      const statusLabel = 
        item.healthStatus === 'OUT_OF_STOCK' ? 'HABIS (0)' :
        item.healthStatus === 'CRITICAL' ? 'KRITIS' :
        item.healthStatus === 'WARNING' ? 'PERINGATAN' : 'AMAN';
      
      const statusColor = 
        item.healthStatus === 'OUT_OF_STOCK' ? '#0f172a' :
        item.healthStatus === 'CRITICAL' ? '#dc2626' :
        item.healthStatus === 'WARNING' ? '#d97706' : '#059669';

      const deviationText = item.deviation > 0 ? `+${item.deviation}` : `${item.deviation}`;

      tableRows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="font-family:monospace;font-weight:600;">${item.sku}</td>
          <td style="font-weight:500;">${item.name}</td>
          <td>${item.category || '-'}</td>
          <td style="text-align:center;">${item.unit || 'UNIT'}</td>
          <td style="text-align:right;">${item.minStock.toLocaleString('id-ID')}</td>
          <td style="text-align:right;font-weight:bold;color:${isCritical ? '#dc2626' : '#1e293b'};">${item.currentStock.toLocaleString('id-ID')}</td>
          <td style="text-align:center;font-weight:bold;color:${item.deviation < 0 ? '#dc2626' : '#059669'};">${deviationText}</td>
          <td style="text-align:right;">${item.unitPrice > 0 ? 'Rp ' + item.unitPrice.toLocaleString('id-ID') : '-'}</td>
          <td style="text-align:right;font-weight:bold;">${item.totalValuation > 0 ? 'Rp ' + item.totalValuation.toLocaleString('id-ID') : '-'}</td>
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
          <title>Laporan Posisi & Valuasi Stok - RNF ERP Enterprise</title>
          <style>
            @page { size: A4 landscape; margin: 12mm 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #1e293b; font-size: 11px; }
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .company-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
            .report-title { font-size: 14px; font-weight: 700; color: #2563eb; margin: 4px 0 0 0; }
            .meta-info { font-size: 10px; color: #64748b; text-align: right; }
            .kpi-grid { display: flex; gap: 12px; margin-bottom: 16px; }
            .kpi-card { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #f8fafc; }
            .kpi-label { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 2px; }
            .kpi-value { font-size: 14px; font-weight: 800; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 24px; }
            th { background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 6px 8px; border: 1px solid #cbd5e1; }
            td { padding: 5px 8px; border: 1px solid #e2e8f0; color: #334155; }
            tr:nth-child(even) { background: #f8fafc; }
            .signature-block { display: flex; justify-content: space-between; margin-top: 32px; page-break-inside: avoid; }
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
              <div class="report-title">LAPORAN POSISI & VALUASI STOK BARANG PENJUALAN</div>
              <div style="font-size:10px;color:#475569;margin-top:2px;">Sistem Persediaan Terpadu • Enterprise Inventory Valuation</div>
            </div>
            <div class="meta-info">
              <div><strong>Waktu Cetak:</strong> ${formattedDate}</div>
              <div><strong>Total Data:</strong> ${sortedItems.length} Material SKU</div>
              <div><strong>Status Filter:</strong> ${selectedCategory !== 'ALL' ? selectedCategory : 'Semua Kategori'} • ${selectedHealth !== 'ALL' ? selectedHealth : 'Semua Status'}</div>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Total Material (SKU)</div>
              <div class="kpi-value">${kpiStats.totalSKU} Item</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Kuantitas Fisik</div>
              <div class="kpi-value">${kpiStats.totalQty.toLocaleString('id-ID')} Unit</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Peringatan Kritis / Habis</div>
              <div class="kpi-value" style="color:#dc2626;">${kpiStats.criticalCount} Item</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Estimasi Valuasi Aset</div>
              <div class="kpi-value" style="color:#059669;">Rp ${kpiStats.totalValuation.toLocaleString('id-ID')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center;">No.</th>
                <th>JOB-REG</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th style="text-align:center;width:40px;">UOM</th>
                <th style="text-align:right;">Stok Min</th>
                <th style="text-align:right;">Stok Fisik</th>
                <th style="text-align:center;">Selisih</th>
                <th style="text-align:right;">Harga Satuan</th>
                <th style="text-align:right;">Total Valuasi</th>
                <th style="text-align:center;">Status</th>
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
  }, [sortedItems, kpiStats, selectedCategory, selectedHealth]);

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
      'Deviasi (Selisih)',
      'Harga Satuan Terakhir (IDR)',
      'Total Nilai Valuasi (IDR)',
      'Status Stok'
    ];

    const rows = sortedItems.map((item, idx) => {
      const statusLabel = 
        item.healthStatus === 'OUT_OF_STOCK' ? 'Habis (0)' :
        item.healthStatus === 'CRITICAL' ? 'Kritis' :
        item.healthStatus === 'WARNING' ? 'Mendekati Min' : 'Aman';

      return [
        idx + 1,
        `"${item.sku}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        `"${item.type || 'INVENTORY'}"`,
        `"${item.unit || 'UNIT'}"`,
        item.minStock,
        item.currentStock,
        item.deviation,
        item.unitPrice,
        item.totalValuation,
        `"${statusLabel}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Posisi_Valuasi_Stok_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sortedItems]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">

      {/* 1. Header Title */}
      <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 leading-none">Laporan Posisi & Valuasi Stok</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                Enterprise Inventory
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Daftar Kuantitas Fisik, Batas Minimum, Estimasi Valuasi Aset & Peringatan Defisit</p>
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
            <span>Print Laporan</span>
          </button>

          <button 
            onClick={handleExport} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Excel/CSV</span>
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

      {/* 3. Executive KPI Metric Cards Bar */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        
        {/* KPI 1: Total SKU */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Variasi (SKU)</span>
            <span className="block text-base font-extrabold text-slate-800 leading-tight">{kpiStats.totalSKU.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-500">Item</span></span>
          </div>
        </div>

        {/* KPI 2: Total On-Hand Qty */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Fisik Gudang</span>
            <span className="block text-base font-extrabold text-indigo-900 leading-tight">{kpiStats.totalQty.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-500">Unit</span></span>
          </div>
        </div>

        {/* KPI 3: Critical & Out of Stock */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50/60 border border-red-200/80">
          <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-red-500 truncate">Perlu Restock Segera</span>
            <span className="block text-base font-extrabold text-red-700 leading-tight">
              {kpiStats.criticalCount} <span className="text-xs font-medium text-red-600">Item ({kpiStats.outOfStockCount} Habis)</span>
            </span>
          </div>
        </div>

        {/* KPI 4: Total Asset Valuation */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 truncate">Estimasi Valuasi Persediaan</span>
            <span className="block text-base font-extrabold text-emerald-800 leading-tight truncate">
              Rp {kpiStats.totalValuation.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

      </div>

      {/* 4. Main Body: Split Sidebar Filter + Table View */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Pane: Collapsible Enterprise Filter Sidebar */}
        {showFilter && (
          <div className="w-[260px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto shadow-sm">
            
            <div className="flex justify-between items-center px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                Filter Parameter Stok
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
                    <button onClick={() => { setSearchJobReg(''); setCurrentPage(1); }} className="text-[10px] text-blue-600 hover:underline">Clear</button>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="< JOB-REG >" 
                  value={searchJobReg}
                  onChange={(e) => { setSearchJobReg(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 font-mono text-xs placeholder:text-slate-400"
                />
              </div>

              {/* Filter 2: Nama Barang */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Cari Nama Barang:</label>
                  {searchItemName && (
                    <button onClick={() => { setSearchItemName(''); setCurrentPage(1); }} className="text-[10px] text-blue-600 hover:underline">Clear</button>
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
                <label className="font-semibold text-slate-800">Kategori Material:</label>
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

              {/* Filter 4: Status Kesehatan Stok */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-800">Status Kesehatan Stok:</label>
                <select 
                  value={selectedHealth}
                  onChange={(e) => { setSelectedHealth(e.target.value as HealthStatus); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 font-medium text-xs text-slate-700"
                >
                  <option value="ALL">Semua Status (Seluruh Stok)</option>
                  <option value="CRITICAL">🔴 Stok Kritis (Di Bawah Minimum)</option>
                  <option value="OUT_OF_STOCK">⚫ Stok Habis (0 Unit)</option>
                  <option value="WARNING">🟡 Mendekati Minimum (Pas)</option>
                  <option value="NORMAL">🟢 Stok Aman (Optimal)</option>
                </select>
              </div>

              {/* Filter 5: Tipe Barang */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-800">Tipe Material:</label>
                <select 
                  value={selectedType}
                  onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 font-medium text-xs text-slate-700"
                >
                  <option value="ALL">Semua Tipe</option>
                  <option value="INVENTORY">Inventory (Persediaan Jadi)</option>
                  <option value="CONSUMABLE">Consumable (Barang Habis Pakai)</option>
                  <option value="SERVICE">Service (Jasa)</option>
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

                  <th className="px-3 py-2.5 border-r border-slate-200 text-center w-20">UOM</th>

                  <th 
                    onClick={() => handleSort('minStock')} 
                    className="px-3.5 py-2.5 text-right border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Stok Min</span>
                    {renderSortIndicator('minStock')}
                  </th>

                  <th 
                    onClick={() => handleSort('currentStock')} 
                    className="px-3.5 py-2.5 text-right border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Stok Fisik</span>
                    {renderSortIndicator('currentStock')}
                  </th>

                  <th 
                    onClick={() => handleSort('deviation')} 
                    className="px-3.5 py-2.5 text-center border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Selisih</span>
                    {renderSortIndicator('deviation')}
                  </th>

                  <th 
                    onClick={() => handleSort('unitPrice')} 
                    className="px-3.5 py-2.5 text-right border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Harga Satuan (Terakhir)</span>
                    {renderSortIndicator('unitPrice')}
                  </th>

                  <th 
                    onClick={() => handleSort('valuation')} 
                    className="px-3.5 py-2.5 text-right border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Total Valuasi Aset</span>
                    {renderSortIndicator('valuation')}
                  </th>

                  <th 
                    onClick={() => handleSort('status')} 
                    className="px-3.5 py-2.5 text-center cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <span>Status Kesehatan</span>
                    {renderSortIndicator('status')}
                  </th>

                </tr>
              </thead>

              <tbody className={`divide-y divide-slate-100 ${isRefreshing ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-slate-500">
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
                    const isZeroStock = item.currentStock <= 0;
                    const isUnderMin = item.currentStock < item.minStock;

                    return (
                      <tr 
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50/80' 
                            : isZeroStock 
                            ? 'bg-rose-50/20 hover:bg-slate-50' 
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="px-3.5 py-2 text-center text-slate-400 font-mono border-r border-slate-100">{globalIdx}</td>
                        
                        <td className="px-3.5 py-2 font-mono font-semibold text-blue-600 border-r border-slate-100">
                          {item.sku}
                        </td>

                        <td className="px-3.5 py-2 font-semibold text-slate-800 border-r border-slate-100">
                          {item.name}
                        </td>

                        <td className="px-3.5 py-2 text-slate-600 border-r border-slate-100">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.category || '-'}
                          </span>
                        </td>

                        <td className="px-3 py-2 text-center text-slate-600 font-medium border-r border-slate-100">
                          {item.unit || 'UNIT'}
                        </td>

                        <td className="px-3.5 py-2 text-right font-medium text-slate-500 border-r border-slate-100">
                          {item.minStock.toLocaleString('id-ID')}
                        </td>

                        <td className="px-3.5 py-2 text-right font-bold border-r border-slate-100">
                          <span className={`${
                            isZeroStock 
                              ? 'text-slate-900 font-black bg-slate-200 px-1.5 py-0.5 rounded' 
                              : isUnderMin 
                              ? 'text-red-600' 
                              : 'text-slate-800'
                          }`}>
                            {item.currentStock.toLocaleString('id-ID')}
                          </span>
                        </td>

                        <td className="px-3.5 py-2 text-center border-r border-slate-100 font-bold">
                          {item.deviation < 0 ? (
                            <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-[11px]">
                              {item.deviation} Defisit
                            </span>
                          ) : item.deviation === 0 ? (
                            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                              0 Pas
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                              +{item.deviation} Aman
                            </span>
                          )}
                        </td>

                        <td className="px-3.5 py-2 text-right font-mono text-slate-600 border-r border-slate-100">
                          {item.unitPrice > 0 ? `Rp ${item.unitPrice.toLocaleString('id-ID')}` : '-'}
                        </td>

                        <td className="px-3.5 py-2 text-right font-mono font-bold text-emerald-800 border-r border-slate-100">
                          {item.totalValuation > 0 ? `Rp ${item.totalValuation.toLocaleString('id-ID')}` : '-'}
                        </td>

                        <td className="px-3.5 py-2 text-center">
                          {item.healthStatus === 'OUT_OF_STOCK' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-white">
                              Habis (0)
                            </span>
                          ) : item.healthStatus === 'CRITICAL' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700">
                              <AlertTriangle className="w-3 h-3" />
                              Kritis
                            </span>
                          ) : item.healthStatus === 'WARNING' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                              Mendekati Min
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Aman
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Footer */}
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-600 select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span>Tampilkan:</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} 
                  className="px-2 py-0.5 border border-slate-300 rounded-md bg-white outline-none focus:border-blue-500 font-semibold"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="w-px h-3.5 bg-slate-300" />
              <span>
                Menampilkan <strong className="text-slate-800">{total === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> - <strong className="text-slate-800">{Math.min(currentPage * pageSize, total)}</strong> dari <strong className="text-slate-800">{total}</strong> Material
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage <= 1} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                className="px-2 py-1 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
              >
                Sebelumnya
              </button>
              
              <div className="flex items-center gap-1 px-1">
                <span className="font-semibold text-slate-700">Halaman {currentPage} dari {totalPages}</span>
              </div>

              <button 
                disabled={currentPage >= totalPages} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                className="px-2 py-1 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
              >
                Selanjutnya
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
