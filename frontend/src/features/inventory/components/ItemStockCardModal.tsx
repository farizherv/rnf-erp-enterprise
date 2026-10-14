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
  Calendar, 
  Info, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useInventory, type InventoryItem } from '../context/InventoryContext';

export interface ItemStockCardModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMutasi?: (jobReg: string) => void;
}

type TabType = 'ALL' | 'IN' | 'OUT' | 'INFO';

export const ItemStockCardModal: React.FC<ItemStockCardModalProps> = ({
  item,
  isOpen,
  onClose,
  onNavigateToMutasi
}) => {
  const { movements } = useInventory();

  // ── Tab & Filter State ──
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen || !item) return null;

  const isCritical = item.currentStock < item.minStock;

  // ── 1. Movements for this Item ──
  const itemMovements = useMemo(() => {
    return movements.filter(m => m.itemId === item.id || m.itemName === item.name);
  }, [item, movements]);

  // ── 2. Chronological Running Balance Calculation ──
  const chronologicalMovements = useMemo(() => {
    if (itemMovements.length === 0) return [];

    // Sort ascending by date and id to compute exact chronological running balance
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

  // ── Reset Inner Filters ──
  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const hasInnerFilters = Boolean(searchTerm || startDate || endDate);

  // ── Print Stock Card Engine ──
  const handlePrint = useCallback(() => {
    const formattedDate = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let tableRows = '';
    // Print chronological from oldest to newest for audit standard
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
          <td style="font-weight:600;">${m.reference || '-'}</td>
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
          <title>Kartu Stok Persediaan - ${item.sku} - ${item.name}</title>
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
              <div class="meta-val" style="color:#2563eb;">${item.sku}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Nama Barang</div>
              <div class="meta-val">${item.name}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Kategori &amp; Satuan</div>
              <div class="meta-val">${item.category || '-'} (${item.unit || 'UNIT'})</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Posisi Stok Saat Ini</div>
              <div class="meta-val" style="color:${isCritical ? '#dc2626' : '#059669'};">
                ${item.currentStock.toLocaleString('id-ID')} ${item.unit || 'UNIT'} 
                (${isCritical ? 'KRITIS' : 'AMAN'})
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:25px;text-align:center;">No.</th>
                <th style="width:65px;text-align:center;">Tanggal</th>
                <th style="width:90px;">No. Bukti / Ref</th>
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
  }, [displayedMovements, item, isCritical]);

  // ── Enterprise CSV Export ──
  const handleExportCSV = useCallback(() => {
    if (displayedMovements.length === 0) {
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
        `"${item.sku}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${isIn ? 'MASUK' : 'KELUAR'}"`,
        `"${(m.reference || '').replace(/"/g, '""')}"`,
        isIn ? m.quantity : 0,
        !isIn ? m.quantity : 0,
        m.runningBalance,
        `"${item.unit || 'UNIT'}"`,
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
    link.download = `Kartu_Stok_${item.sku}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [displayedMovements, item]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-3 duration-300">
        
        {/* ── 1. Modal Header ── */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-lg leading-none">Kartu Stok &amp; Riwayat Mutasi Barang</span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {item.sku}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {item.category || '-'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <strong className="text-slate-800">{item.name}</strong> • Satuan: <strong className="text-slate-700">{item.unit || 'UNIT'}</strong> • Audit Histori Lengkap Keluar &amp; Masuk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Shortcut to Mutasi Stok */}
            {onNavigateToMutasi && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToMutasi(item.sku);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-xs"
                title="Buka dan filter barang ini di menu Mutasi Stok"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Mutasi Stok</span>
              </button>
            )}

            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. Executive Metric KPI Banner ── */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          
          {/* Card 1: Stok Fisik Saat Ini */}
          <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Stok Fisik Saat Ini</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-base font-extrabold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                  {item.currentStock.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-500">{item.unit || 'UNIT'}</span>
                </span>
                <span className={`text-[10px] font-extrabold ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
                  ({isCritical ? 'KRITIS' : 'AMAN'})
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Barang Masuk */}
          <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Masuk (Inbound)</span>
              <span className="block text-base font-extrabold text-emerald-700 leading-tight">
                +{stats.totalInQty.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-500">{item.unit || 'UNIT'}</span>
              </span>
              <span className="text-[10px] text-slate-400">{stats.inCount} Transaksi</span>
            </div>
          </div>

          {/* Card 3: Total Barang Keluar */}
          <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Keluar (Outbound)</span>
              <span className="block text-base font-extrabold text-amber-700 leading-tight">
                -{stats.totalOutQty.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-500">{item.unit || 'UNIT'}</span>
              </span>
              <span className="text-[10px] text-slate-400">{stats.outCount} Transaksi</span>
            </div>
          </div>

          {/* Card 4: Stok Minimum */}
          <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <AlertTriangle className="w-4 h-4 text-slate-600" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Batas Stok Minimum</span>
              <span className="block text-base font-extrabold text-slate-800 leading-tight">
                {item.minStock.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-500">{item.unit || 'UNIT'}</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Selisih: <strong className={item.currentStock - item.minStock < 0 ? 'text-red-600' : 'text-emerald-700'}>
                  {item.currentStock - item.minStock > 0 ? `+${item.currentStock - item.minStock}` : item.currentStock - item.minStock} {item.unit || 'UNIT'}
                </strong>
              </span>
            </div>
          </div>

        </div>

        {/* ── 3. Action Toolbar & Tabs ── */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Mutasi ({chronologicalMovements.length})
            </button>
            <button
              onClick={() => setActiveTab('IN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'IN'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barang Masuk ({stats.inCount})
            </button>
            <button
              onClick={() => setActiveTab('OUT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'OUT'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barang Keluar ({stats.outCount})
            </button>
            <button
              onClick={() => setActiveTab('INFO')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'INFO'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Spesifikasi Master
            </button>
          </div>

          {/* Quick Filters & Actions */}
          {activeTab !== 'INFO' && (
            <div className="flex items-center gap-2">
              
              {/* Search Inside Modal */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Ref, PO, Vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-1 text-xs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-blue-500"
                  title="Dari Tanggal"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-blue-500"
                  title="Sampai Tanggal"
                />
              </div>

              {hasInnerFilters && (
                <button
                  onClick={handleResetFilters}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Reset Filter Riwayat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="w-px h-5 bg-slate-300 mx-1" />

              {/* Print Stock Card */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                title="Cetak Kartu Stok Resmi"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print Kartu Stok</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                title="Unduh data dalam format CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor</span>
              </button>

            </div>
          )}

        </div>

        {/* ── 4. Main Body: Table or Master Info ── */}
        <div className="flex-1 overflow-auto bg-slate-50">
          
          {activeTab === 'INFO' ? (
            /* Master Item Specification Profile View */
            <div className="p-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  Profil Lengkap Master Material (JOB-REG)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">JOB-REG (SKU)</span>
                    <span className="text-sm font-bold text-blue-600">{item.sku}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">Nama Barang</span>
                    <span className="text-sm font-bold text-slate-800">{item.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">Kategori Material</span>
                    <span className="font-semibold text-slate-700">{item.category || '-'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">Tipe Barang</span>
                    <span className="font-semibold text-slate-700">{item.type || 'INVENTORY'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">Satuan Ukur (UOM)</span>
                    <span className="font-semibold text-slate-700">{item.unit || 'UNIT'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">Customer Asosiasi</span>
                    <span className="font-semibold text-slate-700">{item.customerName || '-'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">Batas Stok Minimum</span>
                    <span className="font-semibold text-slate-700">{item.minStock.toLocaleString('id-ID')} {item.unit || 'UNIT'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">Status Kesehatan Stok</span>
                    <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isCritical ? 'KRITIS (Di Bawah Minimum)' : 'AMAN (Mencukupi)'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">ID Sistem: <code className="font-mono text-slate-600">{item.id}</code></span>
                  {onNavigateToMutasi && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToMutasi(item.sku);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Buka Rincian di Mutasi Stok <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Historical Movement Table with Running Balance */
            <table className="w-full text-left text-xs whitespace-nowrap bg-white">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 select-none shadow-2xs">
                <tr className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-3.5 py-2.5 w-12 text-center border-r border-slate-200">No.</th>
                  <th className="px-3.5 py-2.5 w-24 text-center border-r border-slate-200">Tanggal</th>
                  <th className="px-3.5 py-2.5 border-r border-slate-200">No. Bukti / Ref</th>
                  <th className="px-3.5 py-2.5 text-center w-24 border-r border-slate-200">Tipe</th>
                  <th className="px-3.5 py-2.5 text-right w-24 border-r border-slate-200">Masuk</th>
                  <th className="px-3.5 py-2.5 text-right w-24 border-r border-slate-200">Keluar</th>
                  <th className="px-3.5 py-2.5 text-right w-28 border-r border-slate-200 bg-blue-50/50">
                    <span className="text-blue-900 font-extrabold">Saldo Berjalan</span>
                  </th>
                  <th className="px-3.5 py-2.5 border-r border-slate-200">PO No</th>
                  <th className="px-3.5 py-2.5 border-r border-slate-200">Vendor / Rekanan</th>
                  <th className="px-3.5 py-2.5 text-right border-r border-slate-200">Harga Satuan</th>
                  <th className="px-3.5 py-2.5 text-right border-r border-slate-200">Total Nilai</th>
                  <th className="px-3.5 py-2.5">Catatan / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedMovements.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-600">Belum ada riwayat transaksi mutasi untuk material ini.</span>
                        <p className="text-[11px] text-slate-400">Seluruh transaksi Masuk dan Keluar dari menu Mutasi Stok akan otomatis terdaftar di sini.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedMovements.map((m, idx) => {
                    const isIn = m.type === 'IN';
                    const dateFormatted = new Date(m.date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });

                    return (
                      <tr key={m.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3.5 py-2 text-center text-slate-400 font-mono border-r border-slate-100">{idx + 1}</td>
                        <td className="px-3.5 py-2 text-center text-slate-600 border-r border-slate-100">{dateFormatted}</td>
                        <td className="px-3.5 py-2 font-semibold text-slate-800 border-r border-slate-100">{m.reference || '-'}</td>
                        
                        <td className="px-3.5 py-2 text-center border-r border-slate-100">
                          {isIn ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                              <ArrowDownLeft className="w-3 h-3" /> MASUK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                              <ArrowUpRight className="w-3 h-3" /> KELUAR
                            </span>
                          )}
                        </td>

                        <td className="px-3.5 py-2 text-right font-bold text-emerald-700 border-r border-slate-100">
                          {isIn ? `+${m.quantity.toLocaleString('id-ID')}` : '-'}
                        </td>

                        <td className="px-3.5 py-2 text-right font-bold text-amber-700 border-r border-slate-100">
                          {!isIn ? `-${m.quantity.toLocaleString('id-ID')}` : '-'}
                        </td>

                        <td className="px-3.5 py-2 text-right font-extrabold text-blue-900 border-r border-slate-100 bg-blue-50/40">
                          {m.runningBalance.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-slate-500">{item.unit || 'UNIT'}</span>
                        </td>

                        <td className="px-3.5 py-2 text-slate-600 border-r border-slate-100 font-medium">
                          {m.po_number || '-'}
                        </td>

                        <td className="px-3.5 py-2 text-slate-700 border-r border-slate-100">
                          {m.vendor || '-'}
                        </td>

                        <td className="px-3.5 py-2 text-right font-mono text-slate-600 border-r border-slate-100">
                          {m.price_each ? `Rp ${Number(m.price_each).toLocaleString('id-ID')}` : '-'}
                        </td>

                        <td className="px-3.5 py-2 text-right font-mono font-semibold text-slate-800 border-r border-slate-100">
                          {m.calculatedPriceTotal ? `Rp ${m.calculatedPriceTotal.toLocaleString('id-ID')}` : '-'}
                        </td>

                        <td className="px-3.5 py-2 text-slate-500 max-w-xs truncate" title={m.notes || ''}>
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

        {/* ── 5. Modal Footer ── */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Total Transaksi Terdaftar: <strong className="text-slate-800">{displayedMovements.length}</strong> Riwayat</span>
            <span className="text-slate-300">•</span>
            <span>Saldo Akhir Berjalan: <strong className="text-blue-700 font-bold">{item.currentStock.toLocaleString('id-ID')} {item.unit || 'UNIT'}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>

      </div>

    </div>
  );
};
