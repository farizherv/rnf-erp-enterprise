import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Building2, Briefcase, Network, Hammer, Package, 
  ChevronDown, ArrowUpRight, CheckCircle2, ShieldCheck, 
  TrendingUp, Activity, Database
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
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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

export const DaftarKanbanBoard: React.FC = () => {

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Odoo Style Header: Two-Tier Layout */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
        
        {/* Tier 1: Top App Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 relative z-50">
          <nav className="flex items-center gap-2 flex-wrap">
            <NavDropdown 
              label="Akuntansi & Keuangan" 
              items={[
                { label: 'Mata Uang (Currencies)', onClick: () => console.log('Currencies') },
                { label: 'Daftar Akun (Chart of Accounts)', onClick: () => console.log('COA') },
                { label: 'Buku Besar (General Ledger)', onClick: () => console.log('GL') },
                { label: 'Kas & Bank (Cash & Bank)', onClick: () => console.log('CB') },
                { label: 'Aset Tetap (Fixed Assets)', onClick: () => console.log('Fixed Assets') },
                { label: 'Transaksi Berulang (Recurring)', onClick: () => console.log('Recurring') },
                { label: 'Hafalan (Memorize)', onClick: () => console.log('Memorize') }
              ]} 
            />
            <NavDropdown 
              label="Penjualan & Pembelian" 
              items={[
                { label: 'Pelanggan (Customers)', onClick: () => console.log('Customers') },
                { label: 'Penjualan (Sales)', onClick: () => console.log('Sales') },
                { label: 'Pemasok (Vendors)', onClick: () => console.log('Vendors') },
                { label: 'Pembelian (Purchases)', onClick: () => console.log('Purchases') },
                { label: 'RMA', onClick: () => console.log('RMA') }
              ]} 
            />
            <NavDropdown 
              label="Operasional & Proyek" 
              items={[
                { label: 'Departemen (Departments)', onClick: () => console.log('Departments') },
                { label: 'Proyek (Projects)', onClick: () => console.log('Projects') },
                { label: 'Pembiayaan Pesanan (Job Costings)', onClick: () => console.log('Job Costings') },
                { label: 'Pabrikasi (Manufactures)', onClick: () => console.log('Manufactures') },
                { label: 'Lain-lain (Others)', onClick: () => console.log('Others') }
              ]} 
            />
            <NavDropdown 
              label="Persediaan" 
              items={[
                { label: 'Barang & Jasa (Items)', onClick: () => console.log('Items') },
                { label: 'Persediaan (Inventories)', onClick: () => console.log('Inventories') }
              ]} 
            />
          </nav>
        </div>

        {/* Tier 2: Control Panel (Title & Search) */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight shrink-0 flex items-center gap-2">
            <Database className="w-6 h-6 text-slate-400" />
            Pusat Master Data
          </h2>
          <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
            <OmniSearchBar placeholder="Pencarian global entitas, nama, atau kode (Ctrl+K)..." />
          </div>
        </div>
      </div>

      {/* 1. FINANCIAL KPI SCORECARDS (MASTER DATA METRICS) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">Sebaran Entitas Bisnis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Pelanggan Aktif</span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg"><Users className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">1,248</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+12 Bulan Ini</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Pemasok (Vendors)</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Building2 className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">85</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Proyek Berjalan</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Hammer className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">24 Unit</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Aktif</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Departemen & Cabang</span>
            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><Network className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">16</span>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS (ACCURATE 4 SHORTCUTS REBORN) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-4">Direktori Master Data</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        
        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">Customers</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">Vendors</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">Salesmen</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Network className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">Departments</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Hammer className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">Projects</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Package className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">Items (Barang & Jasa)</span>
          </div>
        </button>

      </div>

      {/* 3. MASTER DATA METRICS KANBAN GRID */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-6">Manajemen Relasi</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Card 1: CRM */}
        <KanbanCard 
          title="Relasi Pelanggan (CRM)"
          description="Basis data klien dan pelanggan"
          icon={Users}
          colorClass="bg-sky-500"
          metrics={[
            { label: 'Total Database', value: '1,248 Entitas' },
            { label: 'Level Aktivitas', value: 'Sangat Tinggi' }
          ]}
          status="Normal"
          progress={100}
          progressColor="bg-sky-500"
        />

        {/* Card 2: Supply Chain */}
        <KanbanCard 
          title="Mitra Pemasok (Vendors)"
          description="Basis data rantai pasok"
          icon={Building2}
          colorClass="bg-rose-500"
          metrics={[
            { label: 'Total Database', value: '85 Entitas' },
            { label: 'Verifikasi Aktif', value: '100% Valid' }
          ]}
          status="Normal"
          progress={100}
          progressColor="bg-rose-500"
        />

        {/* Card 3: Internal Organization */}
        <KanbanCard 
          title="Struktur Internal"
          description="Proyek, Departemen & Karyawan"
          icon={Network}
          colorClass="bg-slate-600"
          metrics={[
            { label: 'Total SDM', value: '315 Personel' },
            { label: 'Titik Cost Center', value: '40 Titik' }
          ]}
          status="Normal"
          progress={100}
          progressColor="bg-slate-600"
        />

      </div>

      {/* 4. RECENT MASTER DATA AUDIT TRAIL TABLE */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktivitas Pembaruan Terkini (Audit Trail)</h3>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
            Lihat Semua <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Waktu Pembaruan</th>
                <th className="px-4 py-3 font-semibold">Modul Data</th>
                <th className="px-4 py-3 font-semibold">ID Entitas</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 font-semibold">Diperbarui Oleh</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">Hari ini, 10:45 AM</td>
                <td className="px-4 py-3 font-medium text-slate-700">Customers</td>
                <td className="px-4 py-3 font-mono text-sky-600">CUST-2481</td>
                <td className="px-4 py-3">Penambahan pelanggan baru (PT. Digital Sentosa)</td>
                <td className="px-4 py-3">admin_sales</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Tersimpan</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">Hari ini, 09:12 AM</td>
                <td className="px-4 py-3 font-medium text-slate-700">Projects</td>
                <td className="px-4 py-3 font-mono text-indigo-600">PRJ-26010</td>
                <td className="px-4 py-3">Pembaruan estimasi budget proyek</td>
                <td className="px-4 py-3">manager_ops</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600"><TrendingUp className="w-3 h-3 text-blue-500" /> Diperbarui</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">Kemarin, 16:30 PM</td>
                <td className="px-4 py-3 font-medium text-slate-700">Items</td>
                <td className="px-4 py-3 font-mono text-emerald-600">ITM-4011</td>
                <td className="px-4 py-3">Perubahan harga jual standar (Base Price)</td>
                <td className="px-4 py-3">admin_inv</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600"><TrendingUp className="w-3 h-3 text-blue-500" /> Diperbarui</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">02 Jun 2026</td>
                <td className="px-4 py-3 font-medium text-slate-700">Vendors</td>
                <td className="px-4 py-3 font-mono text-rose-600">VND-088</td>
                <td className="px-4 py-3">Verifikasi rekening bank pemasok</td>
                <td className="px-4 py-3">finance_spv</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified</span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
