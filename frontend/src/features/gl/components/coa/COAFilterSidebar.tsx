import React from 'react';
import { X } from 'lucide-react';

const ACCOUNT_TYPES = [
  'Kas/Bank', 'Piutang', 'Persediaan', 'Aset Lancar Lainnya', 'Aset Tetap', 
  'Hutang', 'Kewajiban Jangka Panjang', 'Ekuitas', 'Pendapatan', 
  'Harga Pokok Penjualan', 'Beban Operasional', 'Pendapatan Lainnya', 'Beban Lainnya'
];

interface COAFilterSidebarProps {
  setShowFilter: (val: boolean) => void;
  searchNo: string;
  setSearchNo: (val: string) => void;
  searchName: string;
  setSearchName: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  suspendedFilter: 'All' | 'Yes' | 'No';
  setSuspendedFilter: (val: 'All' | 'Yes' | 'No') => void;
}

export const COAFilterSidebar: React.FC<COAFilterSidebarProps> = ({
  setShowFilter,
  searchNo,
  setSearchNo,
  searchName,
  setSearchName,
  typeFilter,
  setTypeFilter,
  suspendedFilter,
  setSuspendedFilter
}) => {
  return (
    <div className="w-[190px] bg-slate-50/80 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-left-2 duration-200 print:hidden">
      
      {/* Header Filter Kiri */}
      <div className="flex justify-between items-center px-2 py-1.5 bg-slate-100/80 border-b border-slate-200">
        <span className="font-bold text-slate-700 text-[11px]">Filter</span>
        <button 
          onClick={() => setShowFilter(false)}
          className="text-slate-400 hover:text-rose-600 transition-colors"
          title="Tutup Filter"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-2 flex flex-col gap-3 text-[11px] text-slate-700">
        
        {/* Find */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-slate-800">Cari (Find):</label>
          <input 
            type="text" 
            placeholder="< Account no. >"
            value={searchNo}
            onChange={(e) => setSearchNo(e.target.value)}
            className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm placeholder:text-slate-400"
          />
          <input 
            type="text" 
            placeholder="< Account name >"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm placeholder:text-slate-400"
          />
        </div>

        <div className="w-full h-px bg-slate-200"></div>

        {/* Type Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-slate-800">Tipe (Type):</label>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer text-slate-700 font-medium"
          >
            <option value="Semua Tipe">Semua Tipe (All)</option>
            {ACCOUNT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="w-full h-px bg-slate-200 mt-1"></div>

        {/* Suspended Radio Buttons */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-slate-800">Ditangguhkan (Suspended):</label>
          <div className="flex flex-col gap-1 ml-1">
            <label className="flex items-center gap-1.5 hover:text-blue-700 cursor-pointer">
              <input 
                type="radio" name="suspended" value="Yes" 
                checked={suspendedFilter === 'Yes'} onChange={(e) => setSuspendedFilter(e.target.value as any)}
                className="text-blue-600 focus:ring-blue-500 w-3 h-3"
              /> Yes
            </label>
            <label className="flex items-center gap-1.5 hover:text-blue-700 cursor-pointer">
              <input 
                type="radio" name="suspended" value="No" 
                checked={suspendedFilter === 'No'} onChange={(e) => setSuspendedFilter(e.target.value as any)}
                className="text-blue-600 focus:ring-blue-500 w-3 h-3"
              /> No
            </label>
            <label className="flex items-center gap-1.5 hover:text-blue-700 cursor-pointer">
              <input 
                type="radio" name="suspended" value="All" 
                checked={suspendedFilter === 'All'} onChange={(e) => setSuspendedFilter(e.target.value as any)}
                className="text-blue-600 focus:ring-blue-500 w-3 h-3"
              /> All
            </label>
          </div>
        </div>

        <button 
          onClick={() => {
            setSearchNo('');
            setSearchName('');
            setTypeFilter('Semua Tipe');
            setSuspendedFilter('All');
          }}
          className="mt-2 w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded border border-slate-300 transition-colors"
        >
          Reset Filter
        </button>

      </div>
    </div>
  );
};
