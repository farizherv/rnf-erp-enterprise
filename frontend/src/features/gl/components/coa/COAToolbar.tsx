import React from 'react';
import { 
  Plus, Edit, Trash2, CheckCircle, Ban, 
  Filter, RefreshCw, Printer, FileSpreadsheet 
} from 'lucide-react';
import type { Account } from '../../types/coa';

interface COAToolbarProps {
  selectedId: string | null;
  accounts: Account[];
  showFilter: boolean;
  setShowFilter: (val: boolean) => void;
  isRefreshing: boolean;
  setIsRefreshing: (val: boolean) => void;
  openNewModal: () => void;
  openEditModal: (id: string) => void;
  handleDeleteAccount: (id: string) => void;
  toggleSuspendStatus: (id: string) => void;
}

export const COAToolbar: React.FC<COAToolbarProps> = ({
  selectedId,
  accounts,
  showFilter,
  setShowFilter,
  isRefreshing,
  setIsRefreshing,
  openNewModal,
  openEditModal,
  handleDeleteAccount,
  toggleSuspendStatus
}) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-white border-b border-slate-200 shrink-0 print:hidden">
      <button 
        onClick={openNewModal}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
      >
        <Plus className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-semibold text-[11px]">Baru</span>
      </button>

      <button 
        onClick={() => selectedId ? openEditModal(selectedId) : null}
        disabled={!selectedId}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors
          ${!selectedId ? 'opacity-50 cursor-not-allowed text-slate-400' : 'hover:bg-slate-100 text-slate-700'}`}
      >
        <Edit className="w-3.5 h-3.5 text-blue-600" />
        <span className="font-semibold text-[11px]">Ubah</span>
      </button>

      <button 
        onClick={() => selectedId ? handleDeleteAccount(selectedId) : null}
        disabled={!selectedId}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors
          ${!selectedId ? 'opacity-50 cursor-not-allowed text-slate-400' : 'hover:bg-rose-50 text-slate-700'}`}
      >
        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
        <span className="font-semibold text-[11px]">Hapus</span>
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <button 
        onClick={() => selectedId ? toggleSuspendStatus(selectedId) : null}
        disabled={!selectedId}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors
          ${!selectedId ? 'opacity-50 cursor-not-allowed text-slate-400' : 'hover:bg-amber-50 text-slate-700'}`}
      >
        {accounts.find(a => a.id === selectedId)?.suspended ? (
           <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /><span className="font-semibold text-[11px]">Aktifkan</span></>
        ) : (
           <><Ban className="w-3.5 h-3.5 text-amber-600" /><span className="font-semibold text-[11px]">Tangguhkan</span></>
        )}
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <button 
        onClick={() => setShowFilter(!showFilter)}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${showFilter ? 'bg-slate-200 text-slate-800 shadow-inner' : 'hover:bg-slate-100 text-slate-700'}`}
      >
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-semibold text-[11px]">Filter</span>
      </button>

      <button 
        onClick={() => {
          setIsRefreshing(true);
          setTimeout(() => setIsRefreshing(false), 500);
        }}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="font-semibold text-[11px]">Perbarui</span>
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <button 
        onClick={() => window.print()}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
      >
        <Printer className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-semibold text-[11px]">Print</span>
      </button>

      <button 
        onClick={() => alert('Fitur Ekspor ke file dalam pengembangan.')}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-semibold text-[11px]">Ekspor</span>
      </button>
    </div>
  );
};
