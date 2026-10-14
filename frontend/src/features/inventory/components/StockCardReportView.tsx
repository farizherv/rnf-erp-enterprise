import React, { useState, useMemo, useCallback } from 'react';
import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Package, 
  ExternalLink, 
  Layers, 
  Info, 
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { useInventory, type InventoryItem } from '../context/InventoryContext';

export interface StockCardReportViewProps {
  item?: InventoryItem | null;
  sku?: string;
  onClose?: () => void;
  onNavigateToMutasi?: (jobReg: string) => void;
}

type TabType = 'ALL' | 'IN' | 'OUT' | 'INFO';

export const StockCardReportView: React.FC<StockCardReportViewProps> = ({
  item: propItem,
  sku: propSku,
  onClose,
  onNavigateToMutasi
}) => {
  const { items, movements } = useInventory();

  // Resolve item either from prop or from sku string
  const activeItem = useMemo(() => {
    if (propItem) return propItem;
    if (propSku) {
      return items.find(i => i.sku.toLowerCase() === propSku.toLowerCase()) || null;
    }
    return null;
  }, [propItem, propSku, items]);

  // ── Tab & Filter State ──
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ── Pagination State ──
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const isCritical = activeItem ? activeItem.currentStock < activeItem.minStock : false;

  // ── 1. Movements for this Item ──
  const itemMovements = useMemo(() => {
    if (!activeItem) return [];
    return movements.filter(m => m.itemId === activeItem.id || m.itemName === activeItem.name);
  }, [activeItem, movements]);

  // ── 2. Chronological Running Balance Calculation ──
  const chronologicalMovements = useMemo(() => {
    if (itemMovements.length === 0) return [];

    // Sort ascending by date & ID to compute exact chronological running balance
    const sorted = [...itemMovements].sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (diff !== 0) return diff;
      return (a.id || '').localeCompare(b.id || '');
    });

    let balance = 0;
    return sorted.map((mov) => {
      if (mov.type === 'IN') {
        balance += mov.quantity;
      } else {
        balance -= mov.quantity;
      }
      const priceEach = Number(mov.price_each) || 0;
      const priceTotal = mov.price_total !== undefined && mov.price_total !== null && Number(mov.price_total) > 0
        ? Number(mov.price_total)
        : priceEach * mov.quantity;

      return {
        ...mov,
        runningBalance: balance,
        calculatedPriceTotal: priceTotal
      };
    });
  }, [itemMovements]);

  // ── 3. Summary Aggregates ──
  const stats = useMemo(() => {
    let totalInQty = 0;
    let inCount = 0;
    let totalOutQty = 0;
    let outCount = 0;
    let totalInValue = 0;

    itemMovements.forEach(m => {
      if (m.type === 'IN') {
        totalInQty += m.quantity;
        inCount++;
        const price = Number(m.price_total) || ((Number(m.price_each) || 0) * m.quantity);
        totalInValue += price;
      } else {
        totalOutQty += m.quantity;
        outCount++;
      }
    });

    return {
      totalInQty,
      inCount,
      totalOutQty,
      outCount,
      totalInValue,
      totalTransactions: itemMovements.length
    };
  }, [itemMovements]);

  // ── 4. Filtered & Sorted Display Movements ──
  const displayedMovements = useMemo(() => {
    let list = [...chronologicalMovements];

    if (activeTab === 'IN') {
      list = list.filter(m => m.type === 'IN');
    } else if (activeTab === 'OUT') {
      list = list.filter(m => m.type === 'OUT');
    }

    if (startDate) {
      list = list.filter(m => m.date >= startDate);
    }
    if (endDate) {
      list = list.filter(m => m.date <= endDate);
    }

    if (searchTerm) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(m => 
        (m.itemName || '').toLowerCase().includes(q) ||
        (activeItem.name || '').toLowerCase().includes(q) ||
        (m.reference || '').toLowerCase().includes(q) ||
        (m.po_number || '').toLowerCase().includes(q) ||
        (m.vendor || '').toLowerCase().includes(q) ||
        (m.notes || '').toLowerCase().includes(q)
      );
    }

    // Modern audit view: display newest transactions on top
    return list.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (diff !== 0) return diff;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [chronologicalMovements, activeTab, startDate, endDate, searchTerm]);

  // ── Pagination ──
  const total = displayedMovements.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedMovements = displayedMovements.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── Reset Inner Filters ──
  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasInnerFilters = Boolean(searchTerm || startDate || endDate);

  // ── Print Stock Card Engine ──
  const handlePrint = useCallback(() => {
    if (!activeItem) return;
    const formattedDate = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let tableRows = '';
    const printList = [...displayedMovements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    printList.forEach((m, idx) => {
      const isIn = m.type === 'IN';
      const dateStr = new Date(m.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const inQty = isIn ? m.quantity.toLocaleString('id-ID') : '-';
      const outQty = !isIn ? m.quantity.toLocaleString('id-ID') : '-';
      const priceEachStr = m.price_each ? `Rp ${Number(m.price_each).toLocaleString('id-ID')}` : '-';
      const priceTotalStr = m.calculatedPriceTotal ? `Rp ${m.calculatedPriceTotal.toLocaleString('id-ID')}` : '-';

      tableRows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center;">${dateStr}</td>
          <td style="font-weight:600;">${m.itemName || activeItem.name || '-'}</td>
          <td style="text-align:center;font-weight:bold;color:${isIn ? '#059669' : '#d97706'};">${isIn ? 'MASUK' : 'KELUAR'}</td>
          <td style="text-align:right;color:#059669;font-weight:bold;">${inQty}</td>
          <td style="text-align:right;color:#d97706;font-weight:bold;">${outQty}</td>
          <td style="text-align:right;font-weight:bold;background:#f8fafc;">${m.runningBalance.toLocaleString('id-ID')}</td>
          <td>${m.po_number || '-'}</td>
          <td>${m.vendor || '-'}</td>
          <td style="text-align:right;">${priceEachStr}</td>
          <td style="text-align:right;font-weight:bold;">${priceTotalStr}</td>
          <td>${m.notes || '-'}</td>
        </tr>
      `;
    });

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Kartu Stok Persediaan - ${activeItem.sku} - ${activeItem.name}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #1e293b; font-size: 10px; }
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
            .company-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
            .report-title { font-size: 13px; font-weight: 700; color: #2563eb; margin: 3px 0 0 0; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; margin-bottom: 14px; }
            .meta-item { font-size: 10px; }
            .meta-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .meta-val { font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 1px; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 20px; }
            th { background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 5px 6px; border: 1px solid #cbd5e1; }
            td { padding: 4px 6px; border: 1px solid #e2e8f0; color: #334155; }
            tr:nth-child(even) { background: #f8fafc; }
            .signature-block { display: flex; justify-content: space-between; margin-top: 28px; page-break-inside: avoid; }
            .signature-box { width: 170px; text-align: center; }
            .signature-line { margin-top: 50px; border-bottom: 1px solid #334155; }
            .signature-role { font-size: 9px; font-weight: 700; margin-top: 4px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="company-title">RNF LOGISTIK INDONESIA</h1>
              <div class="report-title">KARTU STOK &amp; BUKU PEMBANTU PERSEDIAAN (STOCK CARD AUDIT)</div>
              <div style="font-size:9px;color:#64748b;margin-top:2px;">Sistem Mutasi Terpadu • Enterprise Inventory Ledger</div>
            </div>
            <div style="text-align:right;font-size:9px;color:#64748b;">
              <div><strong>Waktu Cetak:</strong> ${formattedDate}</div>
              <div><strong>Total Transaksi:</strong> ${printList.length} Mutasi</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">JOB-REG (SKU)</div>
              <div class="meta-val" style="color:#2563eb;">${activeItem.sku}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Nama Barang</div>
              <div class="meta-val">${activeItem.name}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Kategori &amp; Satuan</div>
              <div class="meta-val">${activeItem.category || '-'} (${activeItem.unit || 'UNIT'})</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Posisi Stok Saat Ini</div>
              <div class="meta-val" style="color:${isCritical ? '#dc2626' : '#059669'};">
                ${activeItem.currentStock.toLocaleString('id-ID')} ${activeItem.unit || 'UNIT'} 
                (${isCritical ? 'KRITIS' : 'AMAN'})
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:25px;text-align:center;">No.</th>
                <th style="width:65px;text-align:center;">Tanggal</th>
                <th style="width:110px;">Nama Barang</th>
                <th style="width:50px;text-align:center;">Tipe</th>
                <th style="width:55px;text-align:right;">Masuk</th>
                <th style="width:55px;text-align:right;">Keluar</th>
                <th style="width:60px;text-align:right;">Saldo Stok</th>
                <th style="width:70px;">PO No</th>
                <th style="width:90px;">Vendor / Rekanan</th>
                <th style="width:75px;text-align:right;">Harga Satuan</th>
                <th style="width:80px;text-align:right;">Total Nilai</th>
                <th>Catatan / Keterangan</th>
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
              <div class="signature-role">Admin Gudang</div>
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
      printWin.document.close();
      printWin.focus();
      setTimeout(() => printWin.print(), 250);
    }
  }, [displayedMovements, activeItem, isCritical]);

  // ── Enterprise CSV Export ──
  const handleExportCSV = useCallback(() => {
    if (!activeItem || displayedMovements.length === 0) {
      alert('Tidak ada data mutasi untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'Tanggal',
      'JOB-REG',
      'Nama Barang',
      'Tipe Mutasi',
      'No Bukti / Referensi',
      'Qty Masuk',
      'Qty Keluar',
      'Saldo Stok Berjalan',
      'Satuan',
      'PO No',
      'Vendor',
      'Harga Satuan (IDR)',
      'Total Nilai (IDR)',
      'Catatan'
    ];

    const rows = displayedMovements.map((m, idx) => {
      const isIn = m.type === 'IN';
      return [
        idx + 1,
        `"${m.date}"`,
        `"${activeItem.sku}"`,
        `"${(activeItem.name || '').replace(/"/g, '""')}"`,
        `"${isIn ? 'MASUK' : 'KELUAR'}"`,
        `"${(m.reference || '').replace(/"/g, '""')}"`,
        isIn ? m.quantity : 0,
        !isIn ? m.quantity : 0,
        m.runningBalance,
        `"${activeItem.unit || 'UNIT'}"`,
        `"${(m.po_number || '').replace(/"/g, '""')}"`,
        `"${(m.vendor || '').replace(/"/g, '""')}"`,
        m.price_each || 0,
        m.calculatedPriceTotal || 0,
        `"${(m.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kartu_Stok_${activeItem.sku}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [displayedMovements, activeItem]);

  if (!activeItem) {
    return (
      <div className="flex flex-col h-full bg-[#f8fafc] items-center justify-center p-8">
        <Package className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-base font-bold text-slate-700">Data Material Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1">Material dengan JOB-REG tersebut mungkin telah dihapus atau belum terdaftar.</p>
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
          >
            Kembali
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      
      {/* ── 1. Page Header (Spacious, Clean, High-Readability) ── */}
      <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 shadow-xs">
        <div className="flex items-center gap-3.5">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-2xs"
              title="Kembali ke Laporan Stok"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-800 leading-none">Kartu Stok &amp; Riwayat Mutasi Barang</h2>
              <span className="text-base font-extrabold text-blue-600 font-mono tracking-wide">
                {activeItem.sku}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                • {activeItem.category || '-'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Audit Histori Lengkap Keluar &amp; Masuk
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {onNavigateToMutasi && (
            <button
              onClick={() => onNavigateToMutasi(activeItem.sku)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
              title="Buka dan filter barang ini di menu Mutasi Stok"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Buka di Mutasi Stok</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Cetak Kartu Stok Resmi"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Kartu Stok</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Unduh data dalam format CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor</span>
          </button>

          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
              title="Tutup Halaman"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Sleek Horizontal Executive Metric Strip (Lega & Bebas Kepadatan Visual) ── */}
      <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-6 flex-wrap">
          
          {/* Metric 1: Stok Fisik */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Stok Fisik Saat Ini:</span>
            <span className={`font-extrabold text-sm ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
              {activeItem.currentStock.toLocaleString('id-ID')} {activeItem.unit || 'UNIT'}
            </span>
            <span className={`text-[11px] font-bold ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
              ({isCritical ? 'KRITIS' : 'AMAN'})
            </span>
          </div>

          <div className="w-px h-4 bg-slate-300 hidden md:block" />

          {/* Metric 2: Total Masuk */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Total Masuk:</span>
            <span className="font-bold text-emerald-700 text-sm">
              +{stats.totalInQty.toLocaleString('id-ID')} {activeItem.unit || 'UNIT'}
            </span>
            <span className="text-slate-400 text-[11px]">({stats.inCount} Transaksi)</span>
          </div>

          <div className="w-px h-4 bg-slate-300 hidden md:block" />

          {/* Metric 3: Total Keluar */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Total Keluar:</span>
            <span className="font-bold text-amber-700 text-sm">
              -{stats.totalOutQty.toLocaleString('id-ID')} {activeItem.unit || 'UNIT'}
            </span>
            <span className="text-slate-400 text-[11px]">({stats.outCount} Transaksi)</span>
          </div>

          <div className="w-px h-4 bg-slate-300 hidden md:block" />

          {/* Metric 4: Batas Stok Minimum & Selisih */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Batas Min:</span>
            <span className="font-semibold text-slate-700 text-sm">
              {activeItem.minStock.toLocaleString('id-ID')} {activeItem.unit || 'UNIT'}
            </span>
            <span className="text-slate-400 text-[11px]">
              (Selisih: <strong className={activeItem.currentStock - activeItem.minStock < 0 ? 'text-red-600' : 'text-emerald-700'}>
                {activeItem.currentStock - activeItem.minStock > 0 ? `+${activeItem.currentStock - activeItem.minStock}` : activeItem.currentStock - activeItem.minStock} {activeItem.unit || 'UNIT'}
              </strong>)
            </span>
          </div>

        </div>
      </div>

      {/* ── 3. Navigation Tabs & Quick Filters Bar ── */}
      <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-slate-200 shrink-0">
        
        {/* Navigation Tabs (Underline / Pill Clean Style) */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('ALL'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ALL'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Semua Mutasi ({chronologicalMovements.length})
          </button>
          <button
            onClick={() => { setActiveTab('IN'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'IN'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Barang Masuk ({stats.inCount})
          </button>
          <button
            onClick={() => { setActiveTab('OUT'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'OUT'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Barang Keluar ({stats.outCount})
          </button>
          <button
            onClick={() => { setActiveTab('INFO'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'INFO'
                ? 'bg-slate-100 text-slate-800 border border-slate-200 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Spesifikasi Master
          </button>
        </div>

        {/* Quick Filters */}
        {activeTab !== 'INFO' && (
          <div className="flex items-center gap-2">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Barang, PO, Vendor, Remarks..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-60 bg-white focus:outline-none focus:border-blue-500 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="border-none bg-transparent text-xs text-slate-600 focus:outline-none"
                title="Dari Tanggal"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="border-none bg-transparent text-xs text-slate-600 focus:outline-none"
                title="Sampai Tanggal"
              />
            </div>

            {hasInnerFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                title="Reset Filter Riwayat"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

          </div>
        )}

      </div>

      {/* ── 4. Main Body: Generous Full-Height Table or Master Info ── */}
      <div className="flex-1 overflow-auto bg-white min-w-0">
        
        {activeTab === 'INFO' ? (
          /* Master Item Specification Profile View */
          <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Profil Lengkap Master Material (JOB-REG)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">JOB-REG (SKU)</span>
                  <span className="text-sm font-bold text-blue-600">{activeItem.sku}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Nama Barang</span>
                  <span className="text-sm font-bold text-slate-800">{activeItem.name}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Kategori Material</span>
                  <span className="font-semibold text-slate-700">{activeItem.category || '-'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Tipe Barang</span>
                  <span className="font-semibold text-slate-700">{activeItem.type || 'INVENTORY'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Satuan Ukur (UOM)</span>
                  <span className="font-semibold text-slate-700">{activeItem.unit || 'UNIT'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Customer Asosiasi</span>
                  <span className="font-semibold text-slate-700">{activeItem.customerName || '-'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Batas Stok Minimum</span>
                  <span className="font-semibold text-slate-700">{activeItem.minStock.toLocaleString('id-ID')} {activeItem.unit || 'UNIT'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Status Kesehatan Stok</span>
                  <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isCritical ? 'KRITIS (Di Bawah Minimum)' : 'AMAN (Mencukupi)'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">ID Sistem: <code className="font-mono text-slate-600">{activeItem.id}</code></span>
                {onNavigateToMutasi && (
                  <button
                    onClick={() => onNavigateToMutasi(activeItem.sku)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Buka Rincian di Mutasi Stok <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Historical Movement Table with Running Balance (Lega, Bersih, Presisi) */
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 select-none shadow-2xs">
              <tr className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-3.5 py-3 w-12 text-center border-r border-slate-200">No.</th>
                <th className="px-3.5 py-3 w-28 text-center border-r border-slate-200">Tanggal</th>
                <th className="px-3.5 py-3 border-r border-slate-200">Nama Barang</th>
                <th className="px-3.5 py-3 text-center w-24 border-r border-slate-200">Tipe</th>
                <th className="px-3.5 py-3 text-right w-24 border-r border-slate-200">Masuk</th>
                <th className="px-3.5 py-3 text-right w-24 border-r border-slate-200">Keluar</th>
                <th className="px-4 py-3 text-right w-32 border-r border-slate-200 bg-blue-50/60">
                  <span className="text-blue-900 font-extrabold">Saldo Berjalan</span>
                </th>
                <th className="px-3.5 py-3 border-r border-slate-200">PO No</th>
                <th className="px-3.5 py-3 border-r border-slate-200">Vendor / Rekanan</th>
                <th className="px-3.5 py-3 text-right border-r border-slate-200">Harga Satuan</th>
                <th className="px-3.5 py-3 text-right border-r border-slate-200">Total Nilai</th>
                <th className="px-4 py-3">Catatan / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-slate-600">Belum ada riwayat transaksi mutasi untuk material ini.</span>
                      <p className="text-[11px] text-slate-400">Seluruh transaksi Masuk dan Keluar dari menu Mutasi Stok akan otomatis terdaftar di sini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((m, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const isIn = m.type === 'IN';
                  const dateFormatted = new Date(m.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  });

                  return (
                    <tr key={m.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-2.5 text-center text-slate-400 font-mono border-r border-slate-100">{globalIdx}</td>
                      <td className="px-3.5 py-2.5 text-center text-slate-600 border-r border-slate-100">{dateFormatted}</td>
                      <td className="px-3.5 py-2.5 font-semibold text-slate-800 border-r border-slate-100">{m.itemName || activeItem.name || '-'}</td>
                      
                      <td className="px-3.5 py-2.5 text-center border-r border-slate-100">
                        {isIn ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> MASUK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                            <ArrowUpRight className="w-3.5 h-3.5" /> KELUAR
                          </span>
                        )}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-bold text-emerald-700 border-r border-slate-100">
                        {isIn ? `+${m.quantity.toLocaleString('id-ID')}` : '-'}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-bold text-amber-700 border-r border-slate-100">
                        {!isIn ? `-${m.quantity.toLocaleString('id-ID')}` : '-'}
                      </td>

                      <td className="px-4 py-2.5 text-right font-extrabold text-blue-900 border-r border-slate-100 bg-blue-50/40">
                        {m.runningBalance.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-slate-500">{activeItem.unit || 'UNIT'}</span>
                      </td>

                      <td className="px-3.5 py-2.5 text-slate-600 border-r border-slate-100 font-medium">
                        {m.po_number || '-'}
                      </td>

                      <td className="px-3.5 py-2.5 text-slate-700 border-r border-slate-100">
                        {m.vendor || '-'}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-mono text-slate-600 border-r border-slate-100">
                        {m.price_each ? `Rp ${Number(m.price_each).toLocaleString('id-ID')}` : '-'}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-800 border-r border-slate-100">
                        {m.calculatedPriceTotal ? `Rp ${m.calculatedPriceTotal.toLocaleString('id-ID')}` : '-'}
                      </td>

                      <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate" title={m.notes || ''}>
                        {m.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

      </div>

      {/* ── 5. Page Footer with Navigation & Pagination ── */}
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
          <div className="w-px h-3 bg-slate-300" />
          <span>
            Saldo Akhir: <strong className="text-blue-700 font-bold">{activeItem.currentStock.toLocaleString('id-ID')} {activeItem.unit || 'UNIT'}</strong>
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
  );
};
