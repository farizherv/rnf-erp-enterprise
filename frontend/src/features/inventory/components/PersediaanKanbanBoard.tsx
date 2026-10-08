import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Package, Layers, Sliders, ArrowRightLeft, Tag, ChevronDown, PackageCheck, PackageMinus, AlertTriangle, ArrowUpRight, CheckCircle2, Box, PackagePlus, FileText, ClipboardList, Search, ExternalLink, Wrench, Settings2 } from 'lucide-react';
import { KanbanCard } from '../../../shared/components/ui/KanbanCard';
import { OmniSearchBar } from '../../../shared/components/ui/OmniSearchBar';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { useInventory } from '../context/InventoryContext';

// --- NavDropdown Helper Component ---
interface NavDropdownProps {
  label: string;
  isActive?: boolean;
  items: { label: string; onClick: () => void }[];
}

const NavDropdown: React.FC<NavDropdownProps> = ({ label, isActive, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => items.length > 0 ? setIsOpen(!isOpen) : null}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
          isOpen
            ? 'text-blue-700 bg-blue-50' 
            : isActive 
              ? 'text-blue-700 bg-blue-50 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        {label}
        {items.length > 0 && <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && items.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
interface PersediaanKanbanBoardProps {
  onOpenTab?: (tabId: string) => void;
}

export const PersediaanKanbanBoard: React.FC<PersediaanKanbanBoardProps> = ({ onOpenTab }) => {
  const [showAdjustment, setShowAdjustment] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTokens, setSearchTokens] = useState<string[]>([]);
  const { items, movements } = useInventory();

  // Hitung metrik dinamis
  const totalItems = items.length;
  const criticalItems = items.filter(i => i.currentStock < i.minStock).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const inMovementsThisMonth = movements.filter(m => {
    const d = new Date(m.date);
    return m.type === 'IN' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((acc, curr) => acc + curr.quantity, 0);

  const outMovementsThisMonth = movements.filter(m => {
    const d = new Date(m.date);
    return m.type === 'OUT' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((acc, curr) => acc + curr.quantity, 0);

  // ── Warehouse Configuration (Category → Gudang mapping) ──
  const WAREHOUSE_CONFIG: { category: string; name: string; description: string; icon: React.ElementType; colorClass: string; progressColor: string }[] = [
    { category: 'ENGINE',      name: 'Gudang Engine',      description: 'Komponen & Suku Cadang Mesin',           icon: Wrench,    colorClass: 'bg-blue-500',    progressColor: 'bg-blue-500' },
    { category: 'OSS',         name: 'Gudang OSS',         description: 'Operator Support System & Kabin',        icon: Settings2, colorClass: 'bg-amber-500',   progressColor: 'bg-amber-500' },
    { category: 'FABRICATION', name: 'Gudang Consumables', description: 'Bahan Fabrikasi & Material Habis Pakai', icon: Package,   colorClass: 'bg-emerald-500', progressColor: 'bg-emerald-500' },
  ];

  // Helper: resolve warehouse name from itemId
  const getWarehouseName = (itemId: string): string => {
    const item = items.find(i => i.id === itemId);
    if (!item) return 'Gudang Umum';
    const wh = WAREHOUSE_CONFIG.find(w => w.category === item.category);
    return wh ? wh.name : 'Gudang Umum';
  };

  // ── Warehouse Stats (real-time) ──
  const warehouseStats = useMemo(() => {
    return WAREHOUSE_CONFIG.map(wh => {
      const whItems = items.filter(i => i.category === wh.category && i.type !== 'SERVICE');
      const totalStock = whItems.reduce((acc, i) => acc + i.currentStock, 0);
      const totalMinStock = whItems.reduce((acc, i) => acc + i.minStock, 0);
      const varianCount = whItems.length;
      const criticalCount = whItems.filter(i => i.currentStock < i.minStock).length;

      // Health % = average stock fulfillment across items (capped at 100%)
      let healthPct = 0;
      if (whItems.length > 0 && totalMinStock > 0) {
        healthPct = Math.round((totalStock / totalMinStock) * 100);
      } else if (whItems.length > 0) {
        healthPct = totalStock > 0 ? 100 : 0;
      }
      healthPct = Math.min(healthPct, 100);

      let status: string;
      let progressColor = wh.progressColor;
      if (criticalCount > 0) {
        status = 'Perhatian';
        progressColor = 'bg-rose-500';
      } else if (healthPct < 50) {
        status = 'Warning';
        progressColor = 'bg-amber-500';
      } else {
        status = 'Normal';
      }

      return {
        ...wh,
        totalStock,
        varianCount,
        criticalCount,
        healthPct,
        status,
        resolvedProgressColor: progressColor,
      };
    });
  }, [items]);

  // ── Search Results (cross-module search) ──
  const isSearchActive = searchTokens.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearchActive) return { matchedItems: [], matchedIncoming: [], matchedOutgoing: [] };

    const matchesTokens = (text: string) => {
      return searchTokens.every(token => text.toLowerCase().includes(token.toLowerCase()));
    };

    // Search Master Barang
    const matchedItems = items.filter(item => {
      const searchable = `${item.sku} ${item.name} ${item.category} ${item.customerName || ''} ${item.unit}`;
      return matchesTokens(searchable);
    });

    // Search Barang Masuk movements
    const matchedIncoming = movements.filter(m => {
      if (m.type !== 'IN') return false;
      const item = items.find(i => i.id === m.itemId);
      const searchable = `${m.id} ${m.itemName} ${m.reference} ${item?.sku || ''} ${m.notes || ''}`;
      return matchesTokens(searchable);
    });

    // Search Barang Keluar movements
    const matchedOutgoing = movements.filter(m => {
      if (m.type !== 'OUT') return false;
      const item = items.find(i => i.id === m.itemId);
      const searchable = `${m.id} ${m.itemName} ${m.reference} ${item?.sku || ''} ${m.notes || ''}`;
      return matchesTokens(searchable);
    });

    return { matchedItems, matchedIncoming, matchedOutgoing };
  }, [isSearchActive, searchTokens, items, movements]);

  const totalResults = searchResults.matchedItems.length + searchResults.matchedIncoming.length + searchResults.matchedOutgoing.length;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Odoo Style Header: Two-Tier Layout */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
        
        {/* Tier 1: Top App Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 relative z-50">
          <nav className="flex items-center gap-2 flex-wrap">
            <NavDropdown 
              label="Stok Barang Penjualan" 
              items={[
                { label: 'Kartu Stok', onClick: () => console.log('Kartu Stok') },
                { label: 'Opname (Stock Take)', onClick: () => console.log('Opname') }
              ]} 
            />
            <NavDropdown 
              label="Pergerakan" 
              items={[
                { label: 'Terima Barang (Receipt)', onClick: () => console.log('Terima Barang') },
                { label: 'Kirim Barang (Delivery)', onClick: () => console.log('Kirim Barang') }
              ]} 
            />
            <NavDropdown 
              label="Laporan" 
              items={[
                { label: 'Nilai Persediaan', onClick: () => console.log('Nilai Persediaan') },
                { label: 'Histori Barang', onClick: () => console.log('Histori Barang') }
              ]} 
            />
          </nav>
        </div>

        {/* Tier 2: Control Panel (Title & Search) */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight shrink-0">Persediaan Barang</h2>
          <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
            <OmniSearchBar 
              placeholder="Cari barang, JOB-REG, atau no resi (Ctrl+K)..." 
              onSearch={setSearchTokens}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SEARCH RESULTS PANEL — replaces dashboard when search active  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isSearchActive ? (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">

          {/* Search Summary Bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Search className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-blue-800">
                Hasil Pencarian untuk "{searchTokens.join(', ')}"
              </span>
              <span className="text-xs text-blue-600 ml-2">
                — Ditemukan {totalResults} hasil di seluruh modul Persediaan
              </span>
            </div>
          </div>

          {/* Section 1: Master Barang Matches */}
          {searchResults.matchedItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-500" />
                  Master Barang ({searchResults.matchedItems.length} hasil)
                </h3>
                <button 
                  onClick={() => { if (onOpenTab) onOpenTab('Master Barang & Jasa'); }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                >
                  Buka Master Barang <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold w-12 text-center">No.</th>
                      <th className="px-4 py-2.5 font-semibold">JOB-REG (SKU)</th>
                      <th className="px-4 py-2.5 font-semibold">Nama Barang</th>
                      <th className="px-4 py-2.5 font-semibold">Kategori</th>
                      <th className="px-4 py-2.5 font-semibold">Customer</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Stok</th>
                      <th className="px-4 py-2.5 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searchResults.matchedItems.slice(0, 10).map((item, idx) => {
                      const isCritical = item.currentStock < item.minStock;
                      return (
                        <tr 
                          key={item.id} 
                          className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                          onClick={() => { if (onOpenTab) onOpenTab('Master Barang & Jasa'); }}
                        >
                          <td className="px-4 py-2.5 text-center text-slate-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-2.5 font-mono text-blue-600 font-semibold">{item.sku}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-800">{item.name}</td>
                          <td className="px-4 py-2.5 text-slate-500">{item.category}</td>
                          <td className="px-4 py-2.5 text-slate-500">{item.customerName || '—'}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                              {item.currentStock} {item.unit}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {isCritical ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Kritis</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Aman</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 2: Barang Masuk Matches */}
          {searchResults.matchedIncoming.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 text-emerald-500" />
                  Riwayat Barang Masuk ({searchResults.matchedIncoming.length} transaksi)
                </h3>
                <button 
                  onClick={() => { if (onOpenTab) onOpenTab('Laporan Barang Masuk'); }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                >
                  Buka Laporan Masuk <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold w-12 text-center">No.</th>
                      <th className="px-4 py-2.5 font-semibold">No. Dokumen</th>
                      <th className="px-4 py-2.5 font-semibold">Tanggal</th>
                      <th className="px-4 py-2.5 font-semibold">Barang</th>
                      <th className="px-4 py-2.5 font-semibold">Referensi</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Jumlah Masuk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searchResults.matchedIncoming.slice(0, 10).map((mov, idx) => {
                      const item = items.find(i => i.id === mov.itemId);
                      return (
                        <tr 
                          key={mov.id} 
                          className="hover:bg-emerald-50/50 transition-colors cursor-pointer"
                          onClick={() => { if (onOpenTab) onOpenTab('Barang Masuk'); }}
                        >
                          <td className="px-4 py-2.5 text-center text-slate-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-2.5 font-mono text-blue-600">{mov.id}</td>
                          <td className="px-4 py-2.5 text-slate-600">{new Date(mov.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-800">{mov.itemName}</td>
                          <td className="px-4 py-2.5 text-slate-500">{mov.reference}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-emerald-600">+{mov.quantity.toLocaleString('id-ID')} {item?.unit || 'Unit'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Barang Keluar Matches */}
          {searchResults.matchedOutgoing.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <PackageMinus className="w-4 h-4 text-rose-500" />
                  Riwayat Barang Keluar ({searchResults.matchedOutgoing.length} transaksi)
                </h3>
                <button 
                  onClick={() => { if (onOpenTab) onOpenTab('Laporan Barang Keluar'); }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                >
                  Buka Laporan Keluar <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold w-12 text-center">No.</th>
                      <th className="px-4 py-2.5 font-semibold">No. Dokumen</th>
                      <th className="px-4 py-2.5 font-semibold">Tanggal</th>
                      <th className="px-4 py-2.5 font-semibold">Barang</th>
                      <th className="px-4 py-2.5 font-semibold">Referensi</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Jumlah Keluar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searchResults.matchedOutgoing.slice(0, 10).map((mov, idx) => {
                      const item = items.find(i => i.id === mov.itemId);
                      return (
                        <tr 
                          key={mov.id} 
                          className="hover:bg-rose-50/50 transition-colors cursor-pointer"
                          onClick={() => { if (onOpenTab) onOpenTab('Barang Keluar'); }}
                        >
                          <td className="px-4 py-2.5 text-center text-slate-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-2.5 font-mono text-blue-600">{mov.id}</td>
                          <td className="px-4 py-2.5 text-slate-600">{new Date(mov.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-800">{mov.itemName}</td>
                          <td className="px-4 py-2.5 text-slate-500">{mov.reference}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-rose-600">-{mov.quantity.toLocaleString('id-ID')} {item?.unit || 'Unit'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Results State */}
          {totalResults === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-xl">
              <div className="p-4 bg-slate-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-700 mb-1">Tidak Ada Hasil</h4>
              <p className="text-sm text-slate-500 max-w-md text-center">
                Pencarian "{searchTokens.join(', ')}" tidak menemukan data yang cocok di Master Barang, Barang Masuk, maupun Barang Keluar.
              </p>
              <p className="text-xs text-slate-400 mt-2">Coba gunakan kata kunci lain atau periksa ejaan JOB-REG.</p>
            </div>
          )}
        </div>

      ) : (
      /* ═══════════════════════════════════════════════════════ */
      /* NORMAL DASHBOARD CONTENT — shown when no search active */
      /* ═══════════════════════════════════════════════════════ */
      <>
      {/* 1. FINANCIAL KPI SCORECARDS (INVENTORY METRICS) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">KPI Persediaan</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Varian Barang</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Box className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{totalItems.toLocaleString('id-ID')} SKU</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Barang Masuk (Bulan Ini)</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><PackageCheck className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{inMovementsThisMonth.toLocaleString('id-ID')} Unit</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Barang Keluar (Bulan Ini)</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><PackageMinus className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{outMovementsThisMonth.toLocaleString('id-ID')} Unit</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Peringatan Stok Kritis</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{criticalItems} Item</span>
          </div>
        </div>
      </div>

      {/* 2. AKSI CEPAT - PENJUALAN (SALES & PRODUCTION INVENTORY) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-4">Aksi Cepat (Pintasan) Penjualan</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
        
        <button 
          onClick={() => {
            if (onOpenTab) onOpenTab('Master Barang & Jasa');
          }}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Box className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-blue-600 text-[11px] lg:text-xs truncate">Master Barang</span>
          </div>
        </button>

        <button 
          onClick={() => {
            if (onOpenTab) onOpenTab('Barang Masuk');
          }}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-emerald-600 text-[11px] lg:text-xs truncate">Barang Masuk</span>
          </div>
        </button>

        <button 
          onClick={() => {
            if (onOpenTab) onOpenTab('Barang Keluar');
          }}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-orange-400 hover:shadow-md transition-all group"
        >
          <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600 group-hover:bg-orange-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <PackageMinus className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-orange-600 text-[11px] lg:text-xs truncate">Barang Keluar</span>
          </div>
        </button>

        <button 
          onClick={() => {
            if (onOpenTab) onOpenTab('Laporan Stok');
          }}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-500 hover:shadow-md transition-all group"
        >
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-slate-200 transition-colors group-hover:-translate-y-1 transform duration-200">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">Laporan Stok</span>
          </div>
        </button>

        <button 
          onClick={() => {
            if (onOpenTab) onOpenTab('Laporan Barang Masuk');
          }}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-emerald-600 text-[11px] lg:text-xs truncate">Lap. Masuk</span>
          </div>
        </button>

        <button 
          onClick={() => {
            if (onOpenTab) onOpenTab('Laporan Barang Keluar');
          }}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-rose-400 hover:shadow-md transition-all group"
        >
          <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-rose-600 text-[11px] lg:text-xs truncate">Lap. Keluar</span>
          </div>
        </button>

      </div>

      {/* 3. AKSI CEPAT - CONSUMABLE */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-6">Aksi Cepat (Pintasan) Consumables</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">


        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-red-400 hover:shadow-md transition-all group">
          <div className="bg-red-50 p-2.5 rounded-xl text-red-600 group-hover:bg-red-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-red-600 text-[11px] lg:text-xs truncate">Penyesuaian Stok</span>
          </div>
        </button>



        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-indigo-600 text-[11px] lg:text-xs truncate">Pindah Barang</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all group">
          <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-purple-600 text-[11px] lg:text-xs truncate">Grup Barang</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-green-400 hover:shadow-md transition-all group">
          <div className="bg-green-50 p-2.5 rounded-xl text-green-600 group-hover:bg-green-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Tag className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-green-600 text-[11px] lg:text-xs truncate">Harga Penjualan</span>
          </div>
        </button>

      </div>

      {/* 3. WAREHOUSES KANBAN GRID (Dynamic, Real-time) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-6">Pantauan Gudang</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {warehouseStats.map(wh => (
          <KanbanCard 
            key={wh.category}
            title={wh.name}
            description={wh.description}
            icon={wh.icon}
            colorClass={wh.colorClass}
            metrics={[
              { label: 'Total Stok', value: `${wh.totalStock.toLocaleString('id-ID')} Unit` },
              { label: 'Varian (SKU)', value: `${wh.varianCount} Item` },
              ...(wh.criticalCount > 0 ? [{ label: 'Stok Kritis', value: `${wh.criticalCount} Item`, valueClass: 'text-red-600' }] : []),
            ]}
            status={wh.status}
            progress={wh.healthPct}
            progressColor={wh.resolvedProgressColor}
          />
        ))}
      </div>

      {/* 4. RECENT INVENTORY TRANSACTIONS TABLE (Dynamic, Real-time) */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktivitas Persediaan Terkini</h3>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
              title="Tanggal Awal"
            />
            <span className="text-xs text-slate-400">s/d</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
              title="Tanggal Akhir"
            />
            <button 
              onClick={() => { if (onOpenTab) onOpenTab('Laporan Barang Masuk'); }}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold ml-2"
            >
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">No. Dokumen</th>
                <th className="px-4 py-3 font-semibold">Tipe</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 font-semibold">Gudang</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements
                .filter(m => {
                  if (startDate && m.date < startDate) return false;
                  if (endDate && m.date > endDate) return false;
                  return true;
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((mov) => (
                <tr 
                  key={mov.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => { if (onOpenTab) onOpenTab(mov.type === 'IN' ? 'Barang Masuk' : 'Barang Keluar'); }}
                >
                  <td className="px-4 py-3">{new Date(mov.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3 font-mono text-blue-600">{mov.id}</td>
                  <td className="px-4 py-3">
                    {mov.type === 'IN' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Masuk</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">Keluar</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{mov.reference} — {mov.quantity} {items.find(i=>i.id===mov.itemId)?.unit} {mov.itemName}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{getWarehouseName(mov.itemId)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Selesai
                    </span>
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">Belum ada aktivitas persediaan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* MODALS */}
      {showAdjustment && <StockAdjustmentModal onClose={() => setShowAdjustment(false)} />}
    </div>
  );
};
