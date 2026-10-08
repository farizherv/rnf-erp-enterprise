import React, { useState, useRef, useEffect } from 'react';
import { Wallet, Landmark, Banknote, ArrowUpRight, ArrowDownRight, ChevronDown, CheckCircle2, Clock, Filter, ArrowDownToLine, ArrowUpFromLine, CheckSquare, BookMarked } from 'lucide-react';
import { KanbanCard } from '../../../shared/components/ui/KanbanCard';
import { OmniSearchBar } from '../../../shared/components/ui/OmniSearchBar';
import { BankReconciliation } from './BankReconciliation';

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
            ? 'text-blue-700 bg-blue-50' 
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

export const KasBankKanbanBoard: React.FC = () => {
  const [isReconciling, setIsReconciling] = useState(false);

  if (isReconciling) {
    return <BankReconciliation onBack={() => setIsReconciling(false)} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12 relative">
      
      {/* Odoo Style Header: Two-Tier Layout */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
        
        {/* Tier 1: Top App Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 relative z-50">
          <nav className="flex items-center gap-2 flex-wrap">
            <NavDropdown 
              label="Penerimaan" 
              items={[
                { label: 'Terima Kas/Bank', onClick: () => console.log('Terima Kas') },
                { label: 'Deposit Customer', onClick: () => console.log('Deposit Customer') }
              ]} 
            />
            <NavDropdown 
              label="Pembayaran" 
              items={[
                { label: 'Bayar Kas/Bank', onClick: () => console.log('Bayar Kas') },
                { label: 'Transfer Dana', onClick: () => console.log('Transfer') }
              ]} 
            />
            <NavDropdown 
              label="Rekonsiliasi" 
              items={[
                { label: 'Mutasi Bank', onClick: () => console.log('Mutasi Bank') },
                { label: 'Buku Bank', onClick: () => console.log('Buku Bank') }
              ]} 
            />
            <NavDropdown 
              label="Laporan Kas" 
              items={[
                { label: 'Arus Kas (Cashflow)', onClick: () => console.log('Arus Kas') },
                { label: 'Histori Bank', onClick: () => console.log('Histori Bank') }
              ]} 
            />
          </nav>
        </div>

        {/* Tier 2: Control Panel (Title & Search) */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight shrink-0">Kas & Bank</h2>
          <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
            <OmniSearchBar />
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS (ACCURATE 4 SHORTCUTS REBORN) */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-2">Aksi Cepat (Pintasan)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        
        <button className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-green-400 hover:shadow-md transition-all group">
          <div className="bg-green-50 p-2.5 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block font-bold text-slate-700 group-hover:text-green-600">Deposit</span>
            <span className="text-[11px] text-slate-400 leading-tight">Terima Dana (Cash In)</span>
          </div>
        </button>

        <button className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-rose-400 hover:shadow-md transition-all group">
          <div className="bg-rose-50 p-2.5 rounded-lg text-rose-600 group-hover:bg-rose-100 transition-colors">
            <ArrowUpFromLine className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block font-bold text-slate-700 group-hover:text-rose-600">Payment</span>
            <span className="text-[11px] text-slate-400 leading-tight">Keluarkan Dana (Cash Out)</span>
          </div>
        </button>

        <button 
          onClick={() => setIsReconciling(true)}
          className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block font-bold text-slate-700 group-hover:text-blue-600">Bank Reconcile</span>
            <span className="text-[11px] text-slate-400 leading-tight">Rekonsiliasi Saldo Bank</span>
          </div>
        </button>

        <button className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block font-bold text-slate-700 group-hover:text-indigo-600">Bank Book</span>
            <span className="text-[11px] text-slate-400 leading-tight">Laporan Buku Bank</span>
          </div>
        </button>

      </div>

      {/* 2. BANK ACCOUNTS KANBAN GRID */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-[-1rem] mt-6">Daftar Rekening & Kas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Card 1: Bank Mandiri */}
        <KanbanCard 
          title="Bank Mandiri (IDR)"
          icon={Landmark}
          iconColorClass="text-blue-600"
          primaryActionLabel="Mutasi Bank"
          onPrimaryAction={() => console.log("Buka Mutasi")}
          metrics={[
            { label: 'Saldo Saat Ini', value: 'Rp 2.5B', valueClass: 'text-blue-700 font-bold' },
            { label: 'Rekonsiliasi Terakhir', value: '2 Hari Lalu', valueClass: 'text-slate-500' }
          ]}
          footerText="A/C: 112-00-xxxx-xxxx"
          dropdownItems={[
            { label: 'Terima Dana', onClick: () => console.log('Terima') },
            { label: 'Keluarkan Dana', onClick: () => console.log('Keluarkan') },
            { label: 'Pengaturan Bank', onClick: () => console.log('Pengaturan') }
          ]}
        />

        {/* Card 2: Bank BCA */}
        <KanbanCard 
          title="Bank BCA (IDR)"
          icon={Landmark}
          iconColorClass="text-blue-600"
          primaryActionLabel="Mutasi Bank"
          onPrimaryAction={() => console.log("Buka Mutasi")}
          metrics={[
            { label: 'Saldo Saat Ini', value: 'Rp 1.7B', valueClass: 'text-blue-700 font-bold' },
            { label: 'Rekonsiliasi Terakhir', value: 'Hari Ini', valueClass: 'text-emerald-500' }
          ]}
          footerText="A/C: 543-xxxx-xxxx"
          dropdownItems={[
            { label: 'Terima Dana', onClick: () => console.log('Terima') },
            { label: 'Keluarkan Dana', onClick: () => console.log('Keluarkan') }
          ]}
        />

        {/* Card 3: Kas Kecil */}
        <KanbanCard 
          title="Kas Kecil (Petty Cash)"
          icon={Wallet}
          iconColorClass="text-emerald-500"
          primaryActionLabel="Isi Ulang Kas"
          onPrimaryAction={() => console.log("Topup")}
          metrics={[
            { label: 'Saldo Tunai', value: 'Rp 15.000.000', valueClass: 'text-emerald-700 font-bold' },
            { label: 'Pengeluaran Bln Ini', value: 'Rp 5.000.000', valueClass: 'text-rose-500' }
          ]}
          footerText="Pusat Operasional"
          dropdownItems={[
            { label: 'Catat Pengeluaran', onClick: () => console.log('Pengeluaran') },
            { label: 'Histori Kas', onClick: () => console.log('Histori') }
          ]}
        />

      </div>

      {/* 3. RECENT TRANSACTIONS TABLE */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktivitas Mutasi Terkini</h3>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
            Lihat Semua <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">No. Referensi</th>
                <th className="px-4 py-3">Rekening</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 text-right">Cash In</th>
                <th className="px-4 py-3 text-right">Cash Out</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">03 Jun 2026</td>
                <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer hover:underline">CR-202606-001</td>
                <td className="px-4 py-3">Bank Mandiri</td>
                <td className="px-4 py-3">Penerimaan Pelunasan Faktur INV-001</td>
                <td className="px-4 py-3 text-right font-medium text-emerald-600">Rp 250.000.000</td>
                <td className="px-4 py-3 text-right">-</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Cleared
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">03 Jun 2026</td>
                <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer hover:underline">CP-202606-001</td>
                <td className="px-4 py-3">Bank BCA</td>
                <td className="px-4 py-3">Pembayaran Supplier PT. XYZ</td>
                <td className="px-4 py-3 text-right">-</td>
                <td className="px-4 py-3 text-right font-medium text-rose-600">Rp 45.000.000</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Cleared
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">02 Jun 2026</td>
                <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer hover:underline">PC-202606-001</td>
                <td className="px-4 py-3">Kas Kecil</td>
                <td className="px-4 py-3">Beli Konsumsi Rapat Bulanan</td>
                <td className="px-4 py-3 text-right">-</td>
                <td className="px-4 py-3 text-right font-medium text-rose-600">Rp 350.000</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                    <Clock className="w-3 h-3" /> Pending
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
