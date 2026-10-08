import React, { useState, useRef, useEffect } from 'react';
import { Home, List, ChevronDown, MonitorPlay, Users, Search, HelpCircle, X, ChevronRight, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMenuClick?: (tabName: string) => void;
}

type MenuItem = {
  label?: string;
  divider?: boolean;
  hasSub?: boolean;
  tabId?: string;
  subItems?: MenuItem[];
};

// Data Struktur Menu Asli Accurate 4 (Berdasarkan Referensi Gambar)
const menuData: Record<string, MenuItem[]> = {
  'Berkas': [
    { label: 'New Company' }, { label: 'Open/Login' }, { label: 'Close/LogOff' }, 
    { label: 'Save as alias' }, { divider: true }, { label: 'Back-up' }, 
    { label: 'Restore' }, { label: 'Repair' }, { divider: true }, 
    { label: 'Accountant\'s Review', hasSub: true }, { divider: true }, 
    { label: 'Import Journal' }, { label: 'Undo Import Journal' }, 
    { label: 'Cut Off Company' }, { label: 'Export Import Transaction' }, 
    { label: 'Create New Branch' }, { divider: true }, { label: 'Exit' }
  ],
  'Persiapan': [
    { label: 'Company Info' }, { label: 'Preferences' }, { label: 'User Profile' }, 
    { label: 'Change Password' }, { label: 'Quick Setup' }, { label: 'Form Templates' }
  ],
  'Daftar': [
    { label: 'Currencies' }, { label: 'Chart of Accounts' }, { label: 'Departments' }, 
    { label: 'Projects' }, { label: 'Manufactures', hasSub: true }, 
    { 
      label: 'General Ledger', 
      hasSub: true,
      subItems: [
        { label: 'Journal Voucher', tabId: 'Daftar Jurnal' },
        { label: 'Laporan Buku Besar', tabId: 'Laporan Buku Besar' },
        { label: 'Neraca Saldo' },
        { label: 'Account History' },
        { label: 'Account Balance' },
        { label: 'Account Budget' }
      ]
    }, 
    { label: 'Cash & Bank', hasSub: true }, { label: 'Customers' }, 
    { label: 'Sales', hasSub: true }, { label: 'RMA', hasSub: true }, 
    { label: 'Vendors' }, { label: 'Purchases', hasSub: true }, 
    { label: 'Items' }, { label: 'Job Costings' }, { label: 'Inventories', hasSub: true },
    { label: 'Fixed Assets', hasSub: true }, { label: 'Recurring' }, { label: 'Memorize' },
    { label: 'Others', hasSub: true }
  ],
  'Aktifitas': [
    { label: 'General Ledger', hasSub: true }, { label: 'Cash & Bank', hasSub: true }, 
    { label: 'Sales', hasSub: true }, { label: 'RMA', hasSub: true }, 
    { label: 'Purchase', hasSub: true }, { label: 'Manufacture', hasSub: true }, 
    { label: 'Inventory', hasSub: true }, { label: 'Project', hasSub: true }, 
    { label: 'Job Cost', hasSub: true }, { label: 'New Fixed Asset', hasSub: true }, 
    { label: 'Periodic', hasSub: true }, { label: 'Misc', hasSub: true }
  ],
  'Laporan': [
    { label: 'Index to Reports' }, 
    { label: 'Buku Besar (General Ledger)', tabId: 'Laporan Buku Besar' },
    { label: 'Custom Financial Statement' }, 
    { label: 'SPT Tahunan' }, { label: 'PPN / PPN BM' }, { divider: true }, 
    { label: 'Memorized Report' }, { label: 'Designed Report Files' }, 
    { label: 'Report files (*.fr3)...' }
  ],
  'Bantuan': [
    { label: 'RNF Help' }, { label: 'About RNF' }, { label: 'Register' }
  ],
  'Pengaturan': [
    { label: 'Manajemen User', tabId: 'Manajemen User' }
  ]
};

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onMenuClick }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isSimulatorVisible, setSimulatorVisible, user, logout } = useAuth();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col bg-slate-100 shadow-sm border-b border-slate-300 z-[999] relative">
      {/* Top Menu Bar */}
      <div className="flex px-2 py-1 text-sm text-slate-700 font-medium relative" ref={menuRef}>
        {(Object.keys(menuData) as Array<keyof typeof menuData>).map(menu => (
          <div key={menu} className="relative">
            <button 
              onClick={() => setOpenMenu(openMenu === menu ? null : menu)}
              onMouseEnter={() => { if (openMenu && openMenu !== menu) setOpenMenu(menu) }}
              className={`px-3 py-0.5 rounded cursor-pointer transition-colors ${
                openMenu === menu ? 'bg-slate-200 text-blue-700 font-semibold' : 'hover:bg-slate-200 hover:text-blue-600'
              }`}
            >
              {menu}
            </button>

            {/* Dropdown Panel */}
            {openMenu === menu && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-300 shadow-lg py-1 z-50 rounded-sm">
                {menuData[menu].map((item, idx) => 
                  item.divider ? (
                    <div key={`div-${idx}`} className="h-px bg-slate-200 my-1 mx-2" />
                  ) : (
                    <div key={idx} className="relative group/item">
                      <button
                        onClick={(e) => {
                          if (item.tabId && onMenuClick) {
                            onMenuClick(item.tabId);
                            setOpenMenu(null);
                          }
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-blue-500 hover:text-white flex justify-between items-center"
                      >
                        {item.label}
                        {item.hasSub && <ChevronRight className="w-3 h-3 text-slate-400 group-hover/item:text-white" />}
                      </button>

                      {/* Sub Menu (Level 2) Panel */}
                      {item.hasSub && item.subItems && (
                        <div className="absolute left-full top-0 hidden group-hover/item:block w-48 bg-white border border-slate-300 shadow-lg py-1 z-50 rounded-sm -mt-1 ml-0.5">
                          {item.subItems.map((subItem, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (subItem.tabId && onMenuClick) {
                                  onMenuClick(subItem.tabId);
                                }
                                setOpenMenu(null);
                              }}
                              className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-blue-500 hover:text-white flex justify-between items-center"
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Right Side: Simulator + User Info + Logout */}
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={() => setSimulatorVisible(!isSimulatorVisible)}
            className={`flex items-center gap-1.5 px-3 py-0.5 rounded cursor-pointer transition-colors text-xs font-semibold
              ${isSimulatorVisible ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'}`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            Simulator
          </button>

          {/* Separator */}
          <div className="w-px h-4 bg-slate-300" />

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 px-2 py-0.5">
              <UserCircle className="w-4 h-4 text-slate-500" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-700">{user.name}</span>
                <span className={`inline-flex items-center px-1.5 py-0 rounded text-[9px] font-bold ${
                  user.role === 'CFO' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded cursor-pointer transition-colors text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
            title="Keluar dari sistem"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
