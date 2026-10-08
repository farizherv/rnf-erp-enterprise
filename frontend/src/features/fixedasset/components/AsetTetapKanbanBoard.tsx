import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, Scale, List, Tags, Calculator, Archive, 
  ChevronDown, ArrowUpRight, CheckCircle2, Clock, 
  TrendingDown, AlertCircle, Landmark
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

export const AsetTetapKanbanBoard: React.FC = () => {

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Odoo Style Header: Two-Tier Layout */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
        
        {/* Tier 1: Top App Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 relative z-50">
          <nav className="flex items-center gap-2 flex-wrap">
            <NavDropdown 
              label="Pencatatan & Master" 
              items={[
                { label: 'Aset Tetap Baru', onClick: () => console.log('New Asset') },
                { label: 'Daftar Aset Tetap', onClick: () => console.log('Asset List') }
              ]} 
            />
            <NavDropdown 
              label="Penyusutan" 
              items={[
                { label: 'Proses Penyusutan Bulanan', onClick: () => console.log('Depreciate') },
                { label: 'Histori Penyusutan', onClick: () => console.log('History') }
              ]} 
            />
            <NavDropdown 
              label="Disposisi" 
              items={[
                { label: 'Penghentian / Penjualan Aset', onClick: () => console.log('Disposal') }
              ]} 
            />
            <NavDropdown 
              label="Pengaturan" 
              items={[
                { label: 'Tipe Aset Tetap Pajak', onClick: () => console.log('Fiscal Type') },
                { label: 'Tipe Aset Tetap', onClick: () => console.log('Asset Type') }
              ]} 
            />
          </nav>
        </div>

        {/* Tier 2: Control Panel (Title & Search) */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight shrink-0">Aset Tetap & Penyusutan</h2>
          <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
            <OmniSearchBar placeholder="Cari kode aset, nama aset, atau tipe (Ctrl+K)..." />
          </div>
        </div>
      </div>

      {/* 1. FINANCIAL KPI SCORECARDS (FIXED ASSET METRICS) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">KPI Aset Tetap</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Nilai Perolehan</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Landmark className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">Rp 12.5B</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">145 Aset</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Akumulasi Penyusutan</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><TrendingDown className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">Rp 4.2B</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Nilai Buku</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Scale className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">Rp 8.3B</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Aset Baru (Bulan Ini)</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><PlusCircle className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">2 Unit</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Rp 150M</span>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS (ACCURATE 4 SHORTCUTS REBORN) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-4">Siklus Aset Tetap (Pintasan)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        
        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-slate-200 transition-colors group-hover:-translate-y-1 transform duration-200">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">New Fixed Asset</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <List className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-blue-600 text-[11px] lg:text-xs truncate">Fixed Asset List</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Tags className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-indigo-600 text-[11px] lg:text-xs truncate">Fixed Asset Type</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all group">
          <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Scale className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-amber-600 text-[11px] lg:text-xs truncate">Fiscal FA Type</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all group">
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-emerald-600 text-[11px] lg:text-xs truncate">Proses Penyusutan</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-rose-400 hover:shadow-md transition-all group">
          <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Archive className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-rose-600 text-[11px] lg:text-xs truncate">Disposisi Aset</span>
          </div>
        </button>

      </div>

      {/* 3. ASSET PIPELINE KANBAN GRID */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-6">Status Operasional Aset</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Card 1: Active Assets */}
        <KanbanCard 
          title="Aset Aktif (Penyusutan Berjalan)"
          description="Aset dalam operasional perusahaan"
          icon={Landmark}
          colorClass="bg-indigo-500"
          metrics={[
            { label: 'Jumlah Aset', value: '138 Aset' },
            { label: 'Nilai Buku', value: 'Rp 8.3 Miliar' }
          ]}
          status="Normal"
          progress={100}
          progressColor="bg-indigo-500"
        />

        {/* Card 2: New / Not Depreciated */}
        <KanbanCard 
          title="Aset Baru (Belum Disusutkan)"
          description="Aset perolehan bulan ini"
          icon={PlusCircle}
          colorClass="bg-emerald-500"
          metrics={[
            { label: 'Jumlah Aset', value: '2 Aset' },
            { label: 'Nilai Perolehan', value: 'Rp 150 Juta' }
          ]}
          status="Warning"
          progress={20}
          progressColor="bg-emerald-500"
        />

        {/* Card 3: Disposed */}
        <KanbanCard 
          title="Dihentikan / Disposisi"
          description="Aset yang dijual atau rusak"
          icon={Archive}
          colorClass="bg-slate-500"
          metrics={[
            { label: 'Jumlah Aset', value: '5 Aset' },
            { label: 'Nilai Realisasi', value: 'Rp 35 Juta' }
          ]}
          status="Critical"
          progress={100}
          progressColor="bg-slate-500"
        />

      </div>

      {/* 4. RECENT ASSET TRANSACTIONS TABLE */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktivitas Aset Terkini</h3>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
            Lihat Semua <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Kode Aset</th>
                <th className="px-4 py-3 font-semibold">Deskripsi Aset</th>
                <th className="px-4 py-3 font-semibold text-right">Nilai / Nominal</th>
                <th className="px-4 py-3 font-semibold">Tipe Aktivitas</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">04 Jun 2026</td>
                <td className="px-4 py-3 font-mono text-indigo-600">FA-2606-002</td>
                <td className="px-4 py-3 font-medium text-slate-700">Mesin Fotokopi Canon IR-5000</td>
                <td className="px-4 py-3 text-right font-medium">Rp 45.000.000</td>
                <td className="px-4 py-3">Perolehan Aset Baru</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-600"><CheckCircle2 className="w-3 h-3 text-indigo-500" /> Aktif</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">02 Jun 2026</td>
                <td className="px-4 py-3 font-mono text-indigo-600">FA-2606-001</td>
                <td className="px-4 py-3 font-medium text-slate-700">Laptop Dell XPS 15 (Finance)</td>
                <td className="px-4 py-3 text-right font-medium">Rp 35.000.000</td>
                <td className="px-4 py-3">Perolehan Aset Baru</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-600"><CheckCircle2 className="w-3 h-3 text-indigo-500" /> Aktif</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">31 Mei 2026</td>
                <td className="px-4 py-3 font-mono text-indigo-600">-</td>
                <td className="px-4 py-3 font-medium text-slate-700">Penyusutan Bulanan (Mei 2026)</td>
                <td className="px-4 py-3 text-right font-medium text-rose-600">Rp 125.000.000</td>
                <td className="px-4 py-3">Beban Penyusutan</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Selesai</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">15 Mei 2026</td>
                <td className="px-4 py-3 font-mono text-indigo-600">FA-2021-045</td>
                <td className="px-4 py-3 font-medium text-slate-700">Mobil Box Engkel Mitsubishi</td>
                <td className="px-4 py-3 text-right font-medium text-amber-600">Rp 65.000.000</td>
                <td className="px-4 py-3">Penjualan Aset</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600"><Archive className="w-3 h-3 text-slate-500" /> Disposed</span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
