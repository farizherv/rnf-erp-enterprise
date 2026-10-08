import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, CheckCircle2, AlertCircle, ChevronDown, 
  ArrowUpRight, PackageOpen, Settings, Truck, Search, Plus
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
            ? 'text-indigo-700 bg-indigo-50' 
            : isActive 
              ? 'text-indigo-700 bg-indigo-50 font-semibold'
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
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
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

export const RmaKanbanBoard: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Odoo Style Header: Two-Tier Layout */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
        
        {/* Tier 1: Top App Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 relative z-50">
          <nav className="flex items-center gap-2 flex-wrap">
            <NavDropdown 
              label="Otorisasi Servis (RMA)" 
              items={[
                { label: 'RMA Baru', onClick: () => console.log('RMA Baru') },
                { label: 'Daftar RMA Aktif', onClick: () => console.log('Daftar RMA') },
                { label: 'Cek Status Garansi', onClick: () => console.log('Garansi') }
              ]} 
            />
            <NavDropdown 
              label="Tindakan Servis (RMA Action)" 
              items={[
                { label: 'Antrean Teknisi', onClick: () => console.log('Antrean') },
                { label: 'Pemakaian Sparepart', onClick: () => console.log('Sparepart') },
                { label: 'Laporan Pekerjaan (Timesheet)', onClick: () => console.log('Timesheet') }
              ]} 
            />
            <NavDropdown 
              label="Penagihan (Sales Invoice)" 
              items={[
                { label: 'Buat Tagihan Servis', onClick: () => console.log('Invoice') },
                { label: 'Daftar Tagihan Belum Lunas', onClick: () => console.log('Piutang') },
                { label: 'Serah Terima Barang', onClick: () => console.log('Serah Terima') }
              ]} 
            />
          </nav>
        </div>

        {/* Tier 2: Control Panel (Title & Search) */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight shrink-0">
            Layanan Purna Jual & RMA
          </h2>
          <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
            <OmniSearchBar placeholder="Cari No. RMA, Pelanggan, atau Sparepart (Ctrl+K)..." />
          </div>
        </div>
      </div>

      {/* 1. FINANCIAL KPI SCORECARDS (RMA METRICS) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">Sebaran Status Servis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">RMA Terbuka (Barang Masuk)</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><PackageOpen className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">12 Unit</span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">+3 Hari Ini</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Sedang Dikerjakan (Action)</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Settings className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">5 Unit</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Menunggu Sparepart</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">3 Unit</span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Urgent</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Selesai Bulan Ini</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">28 Unit</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Rata-rata 2 Hari</span>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS (ACCURATE 4 SHORTCUTS REBORN) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-4">Direktori & Aksi Cepat</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        
        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-slate-200 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[11px] lg:text-xs truncate">RMA Baru</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all group">
          <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Settings className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-amber-600 text-[11px] lg:text-xs truncate">Tindakan (Action)</span>
          </div>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-indigo-600 text-[11px] lg:text-xs truncate">Tagihan Servis</span>
          </div>
        </button>

      </div>

      {/* 3. PIPELINE KANBAN GRID */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-6">Pantauan Pipeline</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Card 1: Pengecekan */}
        <KanbanCard 
          title="Pengecekan (Diagnosa)"
          description="Barang masuk tahap analisa"
          icon={Search}
          colorClass="bg-slate-500"
          metrics={[
            { label: 'Jumlah Unit', value: '4 Excavator' },
            { label: 'Est. Waktu', value: '1-2 Hari' }
          ]}
          status="Normal"
          progress={25}
          progressColor="bg-slate-500"
        />

        {/* Card 2: Menunggu Sparepart */}
        <KanbanCard 
          title="Menunggu Sparepart"
          description="Suku cadang sedang dipesan"
          icon={AlertCircle}
          colorClass="bg-rose-500"
          metrics={[
            { label: 'Jumlah Unit', value: '3 Kompresor' },
            { label: 'Status PO', value: 'Dikirim Vendor' }
          ]}
          status="Critical"
          progress={50}
          progressColor="bg-rose-500"
        />

        {/* Card 3: Perbaikan */}
        <KanbanCard 
          title="Sedang Perbaikan (Action)"
          description="Eksekusi oleh teknisi"
          icon={Settings}
          colorClass="bg-amber-500"
          metrics={[
            { label: 'Jumlah Unit', value: '5 Genset' },
            { label: 'Progress Rata-rata', value: '80%' }
          ]}
          status="Warning"
          progress={80}
          progressColor="bg-amber-500"
        />

      </div>

      {/* 4. RECENT TRANSACTIONS TABLE */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktivitas Servis Terkini</h3>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
            Lihat Semua <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal Masuk</th>
                <th className="px-4 py-3 font-semibold">No. RMA</th>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold">Barang & Keluhan</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">03 Jun 2026</td>
                <td className="px-4 py-3 font-mono text-indigo-600">RMA-2606-088</td>
                <td className="px-4 py-3 font-medium text-slate-700">PT. Bumi Resources</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">Excavator Pump ZX200</p>
                  <p className="text-xs text-slate-500">Tekanan Hidrolik Lemah</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">Pengecekan</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">02 Jun 2026</td>
                <td className="px-4 py-3 font-mono text-indigo-600">RMA-2606-087</td>
                <td className="px-4 py-3 font-medium text-slate-700">CV. Karya Makmur</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">Genset 100KVA</p>
                  <p className="text-xs text-slate-500">Overheating</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-600"><Settings className="w-3 h-3 text-amber-500" /> Perbaikan</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">02 Jun 2026</td>
                <td className="px-4 py-3 font-mono text-indigo-600">RMA-2606-085</td>
                <td className="px-4 py-3 font-medium text-slate-700">Bpk. Budi Santoso</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">Kompresor Angin 5HP</p>
                  <p className="text-xs text-slate-500">Bocor Tangki (Ganti Valve)</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-600"><AlertCircle className="w-3 h-3 text-rose-500" /> Menunggu Sparepart</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">01 Jun 2026</td>
                <td className="px-4 py-3 font-mono text-indigo-600">RMA-2606-086</td>
                <td className="px-4 py-3 font-medium text-slate-700">PT. Aneka Tambang</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">Traktor Pertanian</p>
                  <p className="text-xs text-slate-500">Mesin Brebet (Warranty)</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Selesai</span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
