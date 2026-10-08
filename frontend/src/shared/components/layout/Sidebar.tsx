import React, { useState } from 'react';
import { Home, BookMarked, Wallet, Package, ShoppingCart, ShoppingBag, Landmark, List, Hammer, Calendar, ChevronDown, X, GripVertical, HelpCircle, FileText, Globe } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeMenuId: string;
  onMenuClick: (menuName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activeMenuId, onMenuClick }) => {
  const [isPenjelajahOpen, setIsPenjelajahOpen] = useState(true);
  const [isTautanOpen, setIsTautanOpen] = useState(true);
  const [isFormulirOpen, setIsFormulirOpen] = useState(true);

  if (!isOpen) return null; // Fully collapse the sidebar out of the DOM

  const menuItems = [
    { name: 'Beranda', icon: Home, color: 'text-slate-600' },
    { name: 'Buku Besar', icon: BookMarked, color: 'text-blue-500' },
    { name: 'Kas Bank', icon: Wallet, color: 'text-amber-500' },
    { name: 'Persediaan', icon: Package, color: 'text-[#B0916E]' },
    { name: 'Penjualan', icon: ShoppingCart, color: 'text-[#118C4F]' },
    { name: 'Pembelian', icon: ShoppingBag, color: 'text-[#DA321C]' },
    { name: 'Aset Tetap', icon: Landmark, color: 'text-teal-500' },
    { name: 'Daftar', icon: List, color: 'text-slate-400' },
    { name: 'RMA', icon: FileText, color: 'text-pink-500' },
    { name: 'Project', icon: Hammer, color: 'text-indigo-500' },
    { name: 'Fabrikasi', icon: Calendar, color: 'text-[#3B3739]' }
  ];

  return (
    <div className="w-56 bg-slate-200 border-r border-slate-300 flex flex-col z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] relative transition-all duration-300 shrink-0">

      {/* Sidebar Header */}
      <div className="px-3 py-2 bg-slate-300 font-bold text-slate-700 text-sm border-b border-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <GripVertical className="w-3 h-3 text-slate-400" />
          <span>Penjelajah</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="cursor-pointer hover:bg-slate-400 p-0.5 rounded transition-colors"
            onClick={() => setIsPenjelajahOpen(!isPenjelajahOpen)}
            title="Sembunyikan Menu Utama"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-slate-700 transition-transform ${isPenjelajahOpen ? '' : '-rotate-90'}`} />
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-red-400 hover:text-white rounded p-0.5 transition-colors ml-1"
            title="Tutup Penjelajah"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sidebar Menus */}
      {isPenjelajahOpen && (
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenuId === item.name;
            return (
              <div
                key={item.name}
                onClick={() => onMenuClick(item.name)}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded cursor-pointer transition-all ${isActive
                  ? 'bg-white shadow-sm font-bold text-blue-600 border border-slate-300'
                  : 'text-slate-700 hover:bg-slate-300/50 hover:font-medium'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-slate-500'}`} />
                <span className="text-sm">{item.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tautan Section */}
      <div className="bg-slate-300/50 border-t border-slate-300 mt-auto">
        <div
          className="font-bold text-slate-700 px-2 py-1.5 border-b border-slate-300 flex justify-between items-center cursor-pointer hover:bg-slate-300 transition-colors text-xs"
          onClick={() => setIsTautanOpen(!isTautanOpen)}
        >
          <span>Tautan</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-700 transition-transform ${isTautanOpen ? '' : '-rotate-90'}`} />
        </div>
        {isTautanOpen && (
          <div className="p-2 text-xs text-blue-600 space-y-1">
            <div className="py-1 px-2 hover:underline cursor-pointer flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-blue-600" /> User Manual
            </div>
            <div className="py-1 px-2 hover:underline cursor-pointer flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-blue-600" /> Online Tutorial
            </div>
            <div className="py-1 px-2 hover:underline cursor-pointer flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-700 text-white font-bold flex items-center justify-center rounded-sm text-[8px]">f</span> Facebook
            </div>
            <div className="py-1 px-2 hover:underline cursor-pointer flex items-center gap-1">
              <Globe className="w-3 h-3 text-cyan-600" /> Mailing list
            </div>
          </div>
        )}
      </div>

      {/* Formulir Terbuka Section (Legacy representation, now connected to true Multi-Tab logic later) */}
      <div className="bg-slate-300/50 border-t border-slate-300">
        <div
          className="font-bold text-slate-700 px-2 py-1.5 flex justify-between items-center cursor-pointer hover:bg-slate-300 transition-colors text-xs"
          onClick={() => setIsFormulirOpen(!isFormulirOpen)}
        >
          <span>Formulir Terbuka</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-700 transition-transform ${isFormulirOpen ? '' : '-rotate-90'}`} />
        </div>
        {isFormulirOpen && (
          <div className="p-2 pt-0 pb-3 text-xs space-y-1 min-h-[40px]">
            {/* Visual indicator of what is currently open based on activeMenuId */}
            <div className="py-1.5 px-2 bg-blue-50 border border-blue-200 rounded cursor-pointer flex items-center gap-2 text-blue-800 font-medium">
              <FileText className="w-3.5 h-3.5 text-blue-500" /> {activeMenuId}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
