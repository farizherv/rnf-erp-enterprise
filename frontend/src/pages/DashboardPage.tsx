import React, { useState, useRef } from 'react';
import { Header } from '../shared/components/layout/Header';
import { Sidebar } from '../shared/components/layout/Sidebar';
import { Footer } from '../shared/components/layout/Footer';
import { BukuBesarKanbanBoard } from '../features/gl/components/BukuBesarKanbanBoard';
import { KasBankKanbanBoard } from '../features/cashbank/components/KasBankKanbanBoard';
import { PersediaanKanbanBoard } from '../features/inventory/components/PersediaanKanbanBoard';
import { PenjualanKanbanBoard } from '../features/sales/components/PenjualanKanbanBoard';
import { PembelianKanbanBoard } from '../features/purchasing/components/PembelianKanbanBoard';
import { AsetTetapKanbanBoard } from '../features/fixedasset/components/AsetTetapKanbanBoard';
import { DaftarKanbanBoard } from '../features/masterdata/components/DaftarKanbanBoard';
import { RmaKanbanBoard } from '../features/rma/components/RmaKanbanBoard';
import { DashboardOverview } from '../features/dashboard/components/DashboardOverview';
import { RecurringMaster } from '../features/gl/components/RecurringMaster';
import { ChartOfAccounts } from '../features/gl/components/ChartOfAccounts';
import { JournalManager } from '../features/gl/components/JournalManager';
import { LedgerReport } from '../features/gl/components/LedgerReport';
import { JournalPrintPreview } from '../features/gl/components/JournalPrintPreview';
import { JournalProvider } from '../features/gl/context/JournalContext';
import { SequenceConfiguration } from '../features/settings/components/SequenceConfiguration';
import { PeriodEndClosing } from '../features/gl/components/PeriodEndClosing';
import { FinancialStatement } from '../features/gl/components/FinancialStatement';
import { MasterAuditLog } from '../shared/components/MasterAuditLog';
import { EnterpriseReportViewer } from '../features/gl/components/reports/EnterpriseReportViewer';
import { MasterItemView } from '../features/inventory/components/MasterItemView';
import { IncomingStockView } from '../features/inventory/components/IncomingStockView';
import { UserManagementView } from '../features/settings/components/UserManagementView';
import { OutgoingStockView } from '../features/inventory/components/OutgoingStockView';
import { StockReportView } from '../features/inventory/components/StockReportView';
import { IncomingStockReportView } from '../features/inventory/components/IncomingStockReportView';
import { OutgoingStockReportView } from '../features/inventory/components/OutgoingStockReportView';
import { Home, X, Menu, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
}

export const DashboardPage: React.FC = () => {
  // --- Global Navigation State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Tab System State
  const [openTabs, setTabs] = useState<TabItem[]>([
    { id: 'Beranda', label: 'Beranda' },
    { id: 'Buku Besar', label: 'Buku Besar' }
  ]);
  const [activeTabId, setActiveTabId] = useState('Buku Besar');

  // Scrolling Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const handleMenuClick = (menuName: string) => {
    const existingTab = openTabs.find(t => t.id === menuName);
    if (!existingTab) {
      setTabs([...openTabs, { id: menuName, label: menuName }]);
      // Auto-scroll to right when adding a new tab
      setTimeout(() => scrollRight(9999), 100);
    }
    setActiveTabId(menuName);
  };

  const closeTab = (e: React.MouseEvent | null, tabId: string) => {
    if (e) e.stopPropagation();
    if (openTabs.length === 1) return;

    const newTabs = openTabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const closedIdx = openTabs.findIndex(t => t.id === tabId);
      const prevTab = openTabs[closedIdx - 1] || newTabs[0];
      setActiveTabId(prevTab.id);
    }
  };

  // Scroll Helpers
  const scrollLeft = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRight = (amount = 300) => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <JournalProvider>
      <div className="flex flex-col h-screen print:h-auto print:block w-full bg-slate-50 font-sans text-slate-800 overflow-hidden print:overflow-visible">
        <div className="print:hidden">
          <Header activeTab={activeTabId} setActiveTab={setActiveTabId} onMenuClick={handleMenuClick} />
        </div>

      <div className="flex flex-1 overflow-hidden print:overflow-visible print:block">
        
        <div className="print:hidden h-full flex shrink-0">
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen}
            activeMenuId={activeTabId} 
            onMenuClick={handleMenuClick} 
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden print:overflow-visible print:block bg-white shadow-inner print:shadow-none">

          {/* Dynamic Tabs Area (Multi-Document Interface) */}
          <div className="flex items-end px-2 pt-2 gap-1 border-b border-slate-300 bg-slate-200/50 print:hidden">
            
            {/* Sidebar Toggle Button */}
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="mr-2 mb-1 shrink-0 p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-300 rounded-md transition-colors flex items-center justify-center border border-slate-300 bg-slate-100 shadow-sm"
                title="Buka Menu Penjelajah"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Scrollable Tab Container */}
            <div 
              ref={scrollContainerRef}
              className="flex items-end gap-1 flex-1 overflow-x-auto no-scrollbar scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for clean look
            >
              {openTabs.map((tab) => {
                const isActive = activeTabId === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 shrink-0 rounded-t-lg border-x border-t cursor-pointer transition-colors select-none ${
                      isActive 
                        ? 'bg-white border-slate-300 font-bold shadow-[0_-2px_4px_rgba(0,0,0,0.02)] z-10' 
                        : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-700 z-0'
                    }`}
                    style={isActive ? { color: '#1047bd' } : {}}
                  >
                    {tab.id === 'Beranda' && <Home className="w-4 h-4 opacity-70" />}
                    {tab.id !== 'Beranda' && <GripVertical className="w-3 h-3 opacity-30" />}
                    
                    <span className="text-sm whitespace-nowrap">{tab.label}</span>
                    
                    {openTabs.length > 1 && (
                      <div 
                        onClick={(e) => closeTab(e, tab.id)}
                        className={`ml-1 p-0.5 rounded-sm transition-colors ${isActive ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-slate-700'}`}
                      >
                        <X className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Scroll Controls (Accurate 4 Style - Both on the right) */}
            <div className="flex items-center gap-0.5 ml-1 mb-1 shrink-0 bg-slate-100 border border-slate-300 rounded-md p-0.5 shadow-sm">
              <button 
                onClick={scrollLeft}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-300 rounded transition-colors"
                title="Geser Kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-300 mx-0.5" /> {/* Divider */}
              <button 
                onClick={() => scrollRight(300)}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-300 rounded transition-colors"
                title="Geser Kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto print:overflow-visible relative bg-slate-50 print:bg-white print:block">
            
            {/* View Renderers */}
            {openTabs.map(tab => (
              <div 
                key={tab.id} 
                className="h-full w-full"
                style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
              >
                {tab.id === 'Beranda' && <DashboardOverview onOpenTab={handleMenuClick} />}
                {tab.id === 'Buku Besar' && (
                  <div className="p-8 h-full bg-slate-50 overflow-y-auto">
                    <BukuBesarKanbanBoard onOpenTab={handleMenuClick} />
                  </div>
                )}
                {tab.id === 'Kas Bank' && (
                  <div className="p-8 h-full bg-slate-50 overflow-y-auto">
                    <KasBankKanbanBoard />
                  </div>
                )}
                {tab.id === 'Persediaan' && (
                  <div className="p-8 h-full bg-slate-50 overflow-y-auto">
                    <PersediaanKanbanBoard onOpenTab={handleMenuClick} />
                  </div>
                )}
                {tab.id === 'Penjualan' && (
                  <div className="p-8 h-full bg-slate-50 overflow-y-auto">
                    <PenjualanKanbanBoard />
                  </div>
                )}
                {tab.id === 'Pembelian' && (
                  <div className="p-8 h-full bg-slate-50 overflow-y-auto">
                    <PembelianKanbanBoard />
                  </div>
                )}
                {tab.id === 'Aset Tetap' && (
                  <div className="p-8 h-full bg-slate-50 overflow-y-auto">
                    <AsetTetapKanbanBoard />
                  </div>
                )}
                {tab.id === 'Daftar' && (
                  <div className="p-8 h-full bg-slate-50 overflow-y-auto">
                    <DaftarKanbanBoard />
                  </div>
                )}
                {tab.id === 'RMA' && (
                  <div className="p-8 h-full bg-slate-50 overflow-y-auto">
                    <RmaKanbanBoard />
                  </div>
                )}
                {tab.id === 'New Recurring' && (
                  <div className="p-8 h-full bg-slate-100 overflow-y-auto">
                    <RecurringMaster />
                  </div>
                )}
                {tab.id === 'Manajemen User' && (
                  <div className="h-full bg-slate-50 flex flex-col">
                    <UserManagementView />
                  </div>
                )}
                {tab.id === 'Jurnal Baru' && (
                  <div className="p-1 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <JournalManager initialView="form" initialMode="create" onBack={() => closeTab(null, tab.id)} onOpenTab={handleMenuClick} />
                  </div>
                )}
                {tab.id === 'Daftar Jurnal' && (
                  <div className="p-1 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <JournalManager initialView="list" onBack={() => closeTab(null, tab.id)} onOpenTab={handleMenuClick} />
                  </div>
                )}
                {tab.id.startsWith('Daftar Jurnal : ') && (
                  <div className="p-1 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <JournalManager 
                       initialView="form" 
                       initialMode={tab.id.includes('(Ubah)') ? 'edit' : tab.id.includes('(Salin)') ? 'create' : 'view'} 
                       initialId={tab.id.replace('Daftar Jurnal : ', '').split(' ')[0]} 
                       onBack={() => closeTab(null, tab.id)} 
                       onOpenTab={handleMenuClick} 
                    />
                  </div>
                )}
                {tab.id.startsWith('Preview Cetak : ') && (
                  <div className="p-0 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <JournalPrintPreview tabId={tab.id} />
                  </div>
                )}
                {tab.id === 'Master Barang & Jasa' && (
                  <div className="p-0 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <MasterItemView onClose={() => closeTab(null, tab.id)} />
                  </div>
                )}
                {tab.id === 'Barang Masuk' && (
                  <div className="p-0 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <IncomingStockView onClose={() => closeTab(null, tab.id)} />
                  </div>
                )}
                {tab.id === 'Barang Keluar' && (
                  <div className="p-0 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <OutgoingStockView onClose={() => closeTab(null, tab.id)} />
                  </div>
                )}
                {tab.id === 'Laporan Barang Masuk' && (
                  <div className="p-0 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <IncomingStockReportView onClose={() => closeTab(null, tab.id)} />
                  </div>
                )}
                {tab.id === 'Laporan Barang Keluar' && (
                  <div className="p-0 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <OutgoingStockReportView onClose={() => closeTab(null, tab.id)} />
                  </div>
                )}
                {tab.id === 'Laporan Stok' && (
                  <div className="p-0 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <StockReportView onClose={() => closeTab(null, tab.id)} />
                  </div>
                )}
                {tab.id === 'Chart of Account' && (
                  <div className="p-1 h-full bg-slate-50 flex flex-col overflow-hidden print:overflow-visible print:block print:h-auto">
                    <ChartOfAccounts onBack={() => closeTab(null, tab.id)} />
                  </div>
                )}
                
                {tab.id === 'Laporan Buku Besar' && (
                  <div className="p-1 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <LedgerReport />
                  </div>
                )}
                
                {tab.id === 'Konfigurasi Penomoran' && (
                  <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
                    <SequenceConfiguration />
                  </div>
                )}
                
                {tab.id === 'Period End' && (
                  <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
                    <PeriodEndClosing />
                  </div>
                )}
                
                {tab.id === 'Laporan Keuangan' && (
                  <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
                    <FinancialStatement onOpenTab={handleMenuClick} />
                  </div>
                )}
                
                {tab.id === 'Master Audit Log' && (
                  <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
                    <MasterAuditLog />
                  </div>
                )}

                {tab.id.startsWith('ReportViewer : ') && (
                  <div className="p-1 h-full bg-slate-50 flex flex-col overflow-hidden">
                    <EnterpriseReportViewer reportName={tab.id.replace('ReportViewer : ', '')} onClose={() => closeTab(null, tab.id)} />
                  </div>
                )}
                
                {/* Fallback for undeveloped modules */}
                {tab.id !== 'Beranda' && tab.id !== 'Buku Besar' && tab.id !== 'Kas Bank' && tab.id !== 'Persediaan' && tab.id !== 'Penjualan' && tab.id !== 'Pembelian' && tab.id !== 'Aset Tetap' && tab.id !== 'Daftar' && tab.id !== 'RMA' && tab.id !== 'New Recurring' && tab.id !== 'Jurnal Baru' && tab.id !== 'Daftar Jurnal' && tab.id !== 'Chart of Account' && tab.id !== 'Laporan Buku Besar' && tab.id !== 'Konfigurasi Penomoran' && tab.id !== 'Period End' && tab.id !== 'Laporan Keuangan' && tab.id !== 'Master Audit Log' && tab.id !== 'Master Barang & Jasa' && tab.id !== 'Barang Masuk' && tab.id !== 'Barang Keluar' && tab.id !== 'Laporan Barang Masuk' && tab.id !== 'Laporan Barang Keluar' && tab.id !== 'Laporan Stok' && !tab.id.startsWith('Daftar Jurnal : ') && !tab.id.startsWith('Preview Cetak : ') && !tab.id.startsWith('ReportViewer : ') && (
                  <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                    Modul {tab.label} sedang dalam pengembangan...
                  </div>
                )}
              </div>
            ))}

          </div>
        </div>
      </div>
      <div className="print:hidden">
        <Footer />
      </div>
      </div>
    </JournalProvider>
  );
};
