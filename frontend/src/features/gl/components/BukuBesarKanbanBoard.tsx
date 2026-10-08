import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, RefreshCcw, FileText, List, CreditCard, Building2, ChevronDown, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, FilePlus, RefreshCw, BarChart3, Settings, ArrowUpRight, Shield } from 'lucide-react';
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
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
          isOpen
            ? 'text-blue-700 bg-blue-50' // Tanda dropdown sedang terbuka berubah jadi biru
            : isActive 
              ? 'text-blue-700 bg-blue-50 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
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
// ------------------------------------

export const BukuBesarKanbanBoard: React.FC<{ onOpenTab?: (tabName: string) => void }> = ({ onOpenTab }) => {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Odoo Style Header: Two-Tier Layout */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
        
        {/* Tier 1: Top App Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 relative z-50">
          <nav className="flex items-center gap-2 flex-wrap">
            <NavDropdown 
              label="Pelanggan" 
              items={[
                { label: 'Faktur Penjualan', onClick: () => console.log('Faktur Penjualan') },
                { label: 'Penerimaan', onClick: () => console.log('Penerimaan') },
                { label: 'Pelanggan', onClick: () => console.log('Pelanggan') }
              ]} 
            />
            <NavDropdown 
              label="Pemasok" 
              items={[
                { label: 'Tagihan (Bills)', onClick: () => console.log('Tagihan') },
                { label: 'Pembayaran', onClick: () => console.log('Pembayaran') },
                { label: 'Pemasok', onClick: () => console.log('Pemasok') }
              ]} 
            />
            <NavDropdown 
              label="Akuntansi" 
              items={[
                { label: 'Jurnal Umum', onClick: () => onOpenTab?.('Daftar Jurnal') },
                { label: 'Buku Besar', onClick: () => onOpenTab?.('Laporan Buku Besar') },
                { label: 'Proses Akhir Bulan', onClick: () => console.log('Tutup Buku') }
              ]} 
            />
            <NavDropdown 
              label="Pelaporan" 
              items={[
                { label: 'Laporan Buku Besar', onClick: () => onOpenTab?.('Laporan Buku Besar') },
                { label: 'Laba Rugi', onClick: () => console.log('Laba Rugi') },
                { label: 'Neraca', onClick: () => console.log('Neraca') },
                { label: 'Arus Kas', onClick: () => console.log('Arus Kas') }
              ]} 
            />
            <NavDropdown 
              label="Konfigurasi" 
              items={[
                { label: 'Daftar Akun (COA)', onClick: () => console.log('Daftar Akun') },
                { label: 'Mata Uang', onClick: () => console.log('Mata Uang') },
                { label: 'Info Perusahaan', onClick: () => console.log('Info Perusahaan') }
              ]} 
            />
          </nav>
        </div>

        {/* Tier 2: Control Panel (Title & Search) */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight shrink-0">Ikhtisar Akuntansi</h2>
          <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
            <OmniSearchBar />
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS (ACCURATE 4 SHORTCUTS REBORN) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-2">Aksi Cepat (Pintasan)</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
        
        {/* 1. Journal Voucher */}
        <button 
          onClick={() => onOpenTab?.('Jurnal Baru')}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <FilePlus className="w-6 h-6" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-blue-600 text-[13px] md:text-sm truncate">Journal Voucher</span>
            <span className="text-[10px] text-slate-400">Jurnal Umum</span>
          </div>
        </button>

        {/* 2. Period End */}
        <button 
          onClick={() => onOpenTab?.('Period End')}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-rose-400 hover:shadow-md transition-all group"
        >
          <div className="bg-rose-50 p-3 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-rose-600 text-[13px] md:text-sm truncate">Period End</span>
            <span className="text-[10px] text-slate-400">Tutup Buku Bulan</span>
          </div>
        </button>

        {/* 3. Financial Statement */}
        <button 
          onClick={() => onOpenTab?.('Laporan Keuangan')}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-emerald-600 text-[13px] md:text-sm truncate">Financial Statement</span>
            <span className="text-[10px] text-slate-400">Laporan Keuangan</span>
          </div>
        </button>

        {/* 4. Chart of Account */}
        <button 
          onClick={() => onOpenTab?.('Chart of Account')}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <List className="w-6 h-6" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-indigo-600 text-[13px] md:text-sm truncate">Chart of Account</span>
            <span className="text-[10px] text-slate-400">Daftar Akun COA</span>
          </div>
        </button>

        {/* 5. Currency */}
        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all group">
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors group-hover:-translate-y-1 transform duration-200">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-amber-600 text-[13px] md:text-sm truncate">Currency</span>
            <span className="text-[10px] text-slate-400">Mata Uang Asing</span>
          </div>
        </button>

        {/* 6. Company Info */}
        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-500 hover:shadow-md transition-all group">
          <div className="bg-slate-100 p-3 rounded-xl text-slate-600 group-hover:bg-slate-200 transition-colors group-hover:-translate-y-1 transform duration-200">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="text-center w-full">
            <span className="block font-bold text-slate-700 group-hover:text-slate-800 text-[13px] md:text-sm truncate">Company Info</span>
            <span className="text-[10px] text-slate-400">Profil & Konfigurasi</span>
          </div>
        </button>

      </div>

      {/* 2. KANBAN GRID (Module Actions) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-6">Pantauan Modul Aktif</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Card 1: Jurnal Umum */}
        <KanbanCard 
          title="Jurnal Umum"
          icon={BookOpen}
          iconColorClass="text-slate-600"
          primaryActionLabel="Jurnal Baru"
          onPrimaryAction={() => onOpenTab?.('Jurnal Baru')}
          metrics={[
            { label: 'Jurnal Perlu Divalidasi', value: '12', valueClass: 'text-amber-500' },
            { label: 'Total Jurnal Bulan Ini', value: '143', valueClass: 'text-slate-700' }
          ]}
          footerText="Diperbarui 5 menit lalu"
          dropdownItems={[
            { label: 'Lihat Semua Jurnal', onClick: () => onOpenTab?.('Daftar Jurnal') },
            { label: 'Impor Jurnal', onClick: () => console.log('Impor Jurnal') },
            { label: 'Pengaturan Jurnal', onClick: () => console.log('Pengaturan') }
          ]}
        />

        {/* Card 2: Proses Akhir Bulan */}
        <KanbanCard 
          title="Proses Akhir Bulan"
          icon={RefreshCcw}
          iconColorClass="text-red-500"
          primaryActionLabel="Tutup Buku"
          onPrimaryAction={() => onOpenTab?.('Period End')}
          metrics={[
            { label: 'Status Periode Berjalan', value: 'Terbuka', valueClass: 'text-emerald-500' },
            { label: 'Bulan Aktif', value: 'Juni 2026', valueClass: 'text-slate-700' }
          ]}
          dropdownItems={[
            { label: 'Riwayat Tutup Buku', onClick: () => console.log('Riwayat') },
            { label: 'Konfigurasi Periode', onClick: () => console.log('Periode') }
          ]}
        />

        {/* Card 3: Financial Statement */}
        <KanbanCard 
          title="Financial Statement"
          icon={FileText}
          iconColorClass="text-blue-500"
          primaryActionLabel="Buka Report Explorer"
          onPrimaryAction={() => onOpenTab?.('Laporan Keuangan')}
          metrics={[
            { label: 'Laba/Rugi Tahun Berjalan', value: 'Rp 45.2M', valueClass: 'text-emerald-600' },
            { label: 'Total Aset', value: 'Rp 1.2T', valueClass: 'text-blue-700' }
          ]}
          dropdownItems={[
            { label: 'Laba Rugi', onClick: () => onOpenTab?.('Laporan Keuangan') },
            { label: 'Arus Kas', onClick: () => console.log('Arus Kas') },
            { label: 'Buku Besar', onClick: () => onOpenTab?.('Laporan Buku Besar') }
          ]}
        />

      </div>

      {/* 3. RECENT JOURNALS TABLE (Audit Trail) */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktivitas Jurnal Terkini</h3>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
            Lihat Semua <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Nomor Jurnal</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Kredit</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">03 Jun 2026</td>
                <td className="px-4 py-3 font-medium text-slate-800">JU-2026/06/001</td>
                <td className="px-4 py-3">Pembayaran Gaji Karyawan Bulan Mei</td>
                <td className="px-4 py-3 text-right">Rp 45.000.000</td>
                <td className="px-4 py-3 text-right">Rp 45.000.000</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                    <Clock className="w-3 h-3" /> Draft
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">02 Jun 2026</td>
                <td className="px-4 py-3 font-medium text-slate-800">JU-2026/06/002</td>
                <td className="px-4 py-3">Penyusutan Aset Kendaraan</td>
                <td className="px-4 py-3 text-right">Rp 2.500.000</td>
                <td className="px-4 py-3 text-right">Rp 2.500.000</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Posted
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">02 Jun 2026</td>
                <td className="px-4 py-3 font-medium text-slate-800">JU-2026/06/003</td>
                <td className="px-4 py-3">Pembelian ATK Kantor Pusat</td>
                <td className="px-4 py-3 text-right">Rp 1.250.000</td>
                <td className="px-4 py-3 text-right">Rp 1.250.000</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Posted
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
