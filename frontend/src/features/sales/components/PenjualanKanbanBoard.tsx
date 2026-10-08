import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, ShoppingCart, Truck, Receipt, RotateCcw, Banknote, 
  ChevronDown, ArrowUpRight, CheckCircle2, Clock, 
  TrendingUp, AlertCircle, PackageCheck
} from 'lucide-react';
import { KanbanCard } from '../../../shared/components/ui/KanbanCard';
import { OmniSearchBar } from '../../../shared/components/ui/OmniSearchBar';

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
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
// ------------------------------------

export const PenjualanKanbanBoard: React.FC = () => {

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Odoo Style Header: Two-Tier Layout */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
        
        {/* Tier 1: Top App Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 relative z-50">
          <nav className="flex items-center gap-2 flex-wrap">
            <NavDropdown 
              label="Pesanan" 
              items={[
                { label: 'Penawaran (Quotation)', onClick: () => console.log('Quotation') },
                { label: 'Pesanan (Sales Order)', onClick: () => console.log('Sales Order') }
              ]} 
            />
            <NavDropdown 
              label="Pengiriman" 
              items={[
                { label: 'Surat Jalan (Delivery Order)', onClick: () => console.log('Delivery Order') }
              ]} 
            />
            <NavDropdown 
              label="Faktur & Piutang" 
              items={[
                { label: 'Faktur (Invoice)', onClick: () => console.log('Invoice') },
                { label: 'Penerimaan (Receipt)', onClick: () => console.log('Receipt') },
                { label: 'Retur Penjualan', onClick: () => console.log('Return') }
              ]} 
            />
            <NavDropdown 
              label="Laporan" 
              items={[
                { label: 'Laporan Penjualan', onClick: () => console.log('Laporan Penjualan') },
                { label: 'Umur Piutang (AR Aging)', onClick: () => console.log('Umur Piutang') }
              ]} 
            />
          </nav>
        </div>

        {/* Tier 2: Control Panel (Title & Search) */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight shrink-0">Penjualan & Piutang</h2>
          <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
            <OmniSearchBar placeholder="Cari pesanan, pelanggan, atau faktur (Ctrl+K)..." />
          </div>
        </div>
      </div>

      {/* 1. FINANCIAL KPI SCORECARDS (SALES METRICS) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">KPI Penjualan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Penjualan (Bulan Ini)</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">Rp 8.5B</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Piutang Belum Dibayar</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Banknote className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">Rp 3.2B</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Faktur Jatuh Tempo</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">Rp 450M</span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">15 Faktur</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Pesanan Belum Dikirim</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><PackageCheck className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">42 Pesanan</span>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS (ACCURATE 4 SHORTCUTS REBORN) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-4">Siklus Penjualan (Pintasan)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        
        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-slate-200 transition-colors group-hover:-translate-y-1 transform duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">Sales Quotation</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-blue-600 text-[11px] lg:text-xs truncate">Sales Order</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-indigo-600 text-[11px] lg:text-xs truncate">Delivery Order</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all group">
          <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-amber-600 text-[11px] lg:text-xs truncate">Sales Invoice</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-rose-400 hover:shadow-md transition-all group">
          <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-rose-600 text-[11px] lg:text-xs truncate">Sales Return</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all group">
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-emerald-600 text-[11px] lg:text-xs truncate">Sales Receipt</span>
          </div>
        </button>

      </div>

      {/* 3. SALES PIPELINE KANBAN GRID */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-6">Pantauan Pipeline</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Card 1: New Orders */}
        <KanbanCard 
          title="Pesanan Baru (Menunggu DO)"
          description="Pesanan yang masuk minggu ini"
          icon={ShoppingCart}
          colorClass="bg-blue-500"
          metrics={[
            { label: 'Jumlah SO', value: '42 Pesanan' },
            { label: 'Estimasi Nilai', value: 'Rp 540 Juta' }
          ]}
          status="Normal"
          progress={15}
          progressColor="bg-blue-500"
        />

        {/* Card 2: Ready to Ship */}
        <KanbanCard 
          title="Terkirim (Menunggu Faktur)"
          description="Barang di jalan / sudah tiba"
          icon={Truck}
          colorClass="bg-indigo-500"
          metrics={[
            { label: 'Jumlah DO', value: '18 Surat Jalan' },
            { label: 'Potensi Nilai', value: 'Rp 215 Juta' }
          ]}
          status="Warning"
          progress={40}
          progressColor="bg-indigo-500"
        />

        {/* Card 3: Awaiting Payment */}
        <KanbanCard 
          title="Faktur (Menunggu Pembayaran)"
          description="Tagihan yang belum dilunasi"
          icon={Receipt}
          colorClass="bg-amber-500"
          metrics={[
            { label: 'Jumlah Faktur', value: '34 Tagihan' },
            { label: 'Total Piutang', value: 'Rp 3.2 Miliar' }
          ]}
          status="Critical"
          progress={65}
          progressColor="bg-rose-500"
        />

      </div>

      {/* 4. RECENT SALES TRANSACTIONS TABLE */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktivitas Penjualan Terkini</h3>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
            Lihat Semua <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">No. Dokumen</th>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold text-right">Nilai / Tagihan</th>
                <th className="px-4 py-3 font-semibold">Jatuh Tempo</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">03 Jun 2026</td>
                <td className="px-4 py-3 font-mono text-blue-600">INV-2606-088</td>
                <td className="px-4 py-3 font-medium text-slate-700">PT. Megah Sejahtera</td>
                <td className="px-4 py-3 text-right font-medium">Rp 45.000.000</td>
                <td className="px-4 py-3">17 Jun 2026</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-600"><Clock className="w-3 h-3 text-amber-500" /> Belum Lunas</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">02 Jun 2026</td>
                <td className="px-4 py-3 font-mono text-blue-600">RCP-2606-012</td>
                <td className="px-4 py-3 font-medium text-slate-700">Toko Sumber Rejeki</td>
                <td className="px-4 py-3 text-right font-medium">Rp 12.500.000</td>
                <td className="px-4 py-3 text-slate-400">-</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Lunas</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">01 Jun 2026</td>
                <td className="px-4 py-3 font-mono text-blue-600">SO-2606-105</td>
                <td className="px-4 py-3 font-medium text-slate-700">CV. Abadi Sentosa</td>
                <td className="px-4 py-3 text-right font-medium">Rp 120.000.000</td>
                <td className="px-4 py-3 text-slate-400">-</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-600"><Truck className="w-3 h-3 text-indigo-500" /> Dikirim</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">28 Mei 2026</td>
                <td className="px-4 py-3 font-mono text-blue-600">INV-2605-241</td>
                <td className="px-4 py-3 font-medium text-slate-700">PT. Lintas Benua</td>
                <td className="px-4 py-3 text-right font-medium">Rp 85.500.000</td>
                <td className="px-4 py-3 font-bold text-rose-600">01 Jun 2026</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-600"><AlertCircle className="w-3 h-3 text-rose-500" /> Overdue</span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
