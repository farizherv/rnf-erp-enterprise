import React, { useState, useCallback } from 'react';
import { X, Search, Copy, Edit, Trash2, Package, Plus, Download, RefreshCw, Printer, Filter, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { MasterItemFormModal } from './MasterItemFormModal';
import { useInventory } from '../context/InventoryContext';
import type { ItemType, InventoryItem, Customer } from '../context/InventoryContext';

interface MasterItemViewProps {
  onClose?: () => void;
}

export const MasterItemView: React.FC<MasterItemViewProps> = ({ onClose }) => {
  const {
    items, categories, units, customers,
    addItem, updateItem, deleteItem,
    addCategory, updateCategory, deleteCategory,
    addUnit, updateUnit, deleteUnit,
    addCustomer, updateCustomer, deleteCustomer
  } = useInventory();
  
  const [activeTab, setActiveTab] = useState<'BARANG' | 'KATEGORI' | 'SATUAN' | 'CUSTOMER'>('BARANG');
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Edit modal states
  const [editItemData, setEditItemData] = useState<InventoryItem | null>(null);
  const [editCategoryData, setEditCategoryData] = useState<{ id: string; name: string } | null>(null);
  const [editUnitData, setEditUnitData] = useState<{ id: string; name: string } | null>(null);
  const [editCustomerData, setEditCustomerData] = useState<Customer | null>(null);

  // Filters
  const [searchNo, setSearchNo] = useState('');
  const [searchKet, setSearchKet] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [typeFilters, setTypeFilters] = useState<{ [key in ItemType]: boolean }>({
    'INVENTORY': true,
    'CONSUMABLE': true,
    'SERVICE': true
  });
  const [categoryFilters, setCategoryFilters] = useState<{ [key: string]: boolean }>(
    categories.reduce((acc, cat) => ({ ...acc, [cat.name]: true }), {})
  );

  // Actions
  const handleRefresh = () => {
    setIsRefreshing(true);
    setSelectedId(null);
    // Simulate network request delay for enterprise UX feel
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCreate = () => {
    if (activeTab === 'BARANG') setShowItemForm(true);
    else if (activeTab === 'CUSTOMER') setShowCustomerForm(true);
    else if (activeTab === 'KATEGORI') setShowCategoryForm(true);
    else if (activeTab === 'SATUAN') setShowUnitForm(true);
  };

  const handleEdit = () => {
    if (!selectedId) return alert('Silakan pilih data terlebih dahulu.');

    if (activeTab === 'BARANG') {
      const item = items.find(i => i.id === selectedId);
      if (item) setEditItemData({ ...item });
    } else if (activeTab === 'KATEGORI') {
      const cat = categories.find(c => c.id === selectedId);
      if (cat) setEditCategoryData({ ...cat });
    } else if (activeTab === 'SATUAN') {
      const unit = units.find(u => u.id === selectedId);
      if (unit) setEditUnitData({ ...unit });
    } else if (activeTab === 'CUSTOMER') {
      const cust = customers.find(c => c.id === selectedId);
      if (cust) setEditCustomerData({ ...cust });
    }
  };

  const handleDelete = () => {
    if (!selectedId) return alert('Silakan pilih data terlebih dahulu.');
    
    const label = activeTab === 'BARANG' ? 'barang' : activeTab === 'KATEGORI' ? 'kategori' : activeTab === 'CUSTOMER' ? 'customer' : 'satuan';
    if (!confirm(`Yakin ingin menghapus data ${label} ini?`)) return;

    if (activeTab === 'BARANG') deleteItem(selectedId);
    else if (activeTab === 'KATEGORI') deleteCategory(selectedId);
    else if (activeTab === 'SATUAN') deleteUnit(selectedId);
    else if (activeTab === 'CUSTOMER') deleteCustomer(selectedId);

    setSelectedId(null);
  };

  const handleDuplicate = () => {
    if (!selectedId) return alert('Silakan pilih data terlebih dahulu.');

    if (activeTab === 'BARANG') {
      const item = items.find(i => i.id === selectedId);
      if (item) {
        const { id, ...rest } = item;
        addItem({ ...rest, sku: `${rest.sku}-COPY`, name: `${rest.name} (Salinan)` });
      }
    } else if (activeTab === 'KATEGORI') {
      const cat = categories.find(c => c.id === selectedId);
      if (cat) addCategory(`${cat.name} (SALINAN)`);
    } else if (activeTab === 'SATUAN') {
      const unit = units.find(u => u.id === selectedId);
      if (unit) addUnit(`${unit.name} (Salinan)`);
    } else if (activeTab === 'CUSTOMER') {
      const cust = customers.find(c => c.id === selectedId);
      if (cust) addCustomer({ code: `${cust.code}-COPY`, name: `${cust.name} (Salinan)`, contact: cust.contact, phone: cust.phone });
    }
  };

  // --- Print ---
  const handlePrint = useCallback(() => {
    const title = activeTab === 'BARANG' ? 'Data Barang & Jasa' : activeTab === 'KATEGORI' ? 'Data Kategori' : activeTab === 'CUSTOMER' ? 'Data Customer' : 'Data Satuan';
    let tableHTML = '';

    if (activeTab === 'BARANG') {
      tableHTML = `<table><thead><tr><th>No.</th><th>JOB-REG</th><th>Nama Barang</th><th>Customer</th><th>Kategori</th><th>Tipe</th><th>Stok</th><th>Satuan</th></tr></thead><tbody>`;
      filteredItems.forEach((item, idx) => {
        tableHTML += `<tr><td>${idx + 1}</td><td>${item.sku}</td><td>${item.name}</td><td>${item.customerName || '-'}</td><td>${item.category}</td><td>${item.type === 'SERVICE' ? 'Service' : 'Inventory'}</td><td>${item.currentStock}</td><td>${item.unit}</td></tr>`;
      });
      tableHTML += `</tbody></table>`;
    } else if (activeTab === 'KATEGORI') {
      tableHTML = `<table><thead><tr><th>No.</th><th>Kategori</th></tr></thead><tbody>`;
      filteredCategories.forEach((cat, idx) => {
        tableHTML += `<tr><td>${idx + 1}</td><td>${cat.name}</td></tr>`;
      });
      tableHTML += `</tbody></table>`;
    } else if (activeTab === 'CUSTOMER') {
      tableHTML = `<table><thead><tr><th>No.</th><th>Kode</th><th>Nama Customer</th></tr></thead><tbody>`;
      filteredCustomers.forEach((c, idx) => {
        tableHTML += `<tr><td>${idx + 1}</td><td>${c.code}</td><td>${c.name}</td></tr>`;
      });
      tableHTML += `</tbody></table>`;
    } else {
      tableHTML = `<table><thead><tr><th>No.</th><th>Satuan</th></tr></thead><tbody>`;
      filteredUnits.forEach((u, idx) => {
        tableHTML += `<tr><td>${idx + 1}</td><td>${u.name}</td></tr>`;
      });
      tableHTML += `</tbody></table>`;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html><html><head><title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 24px; }
          h1 { font-size: 18px; margin-bottom: 16px; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; }
          td { padding: 6px 12px; border: 1px solid #e2e8f0; color: #334155; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print { body { padding: 0; } }
        </style>
        </head><body>
        <h1>${title}</h1>
        <p style="font-size:12px;color:#94a3b8;margin-bottom:12px;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        ${tableHTML}
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [activeTab, items, categories, units, customers]);

  // --- Export CSV ---
  const handleExport = useCallback(() => {
    let csvContent = '';
    const title = activeTab === 'BARANG' ? 'Data_Barang_Jasa' : activeTab === 'KATEGORI' ? 'Data_Kategori' : activeTab === 'CUSTOMER' ? 'Data_Customer' : 'Data_Satuan';

    if (activeTab === 'BARANG') {
      csvContent = 'No,JOB-REG,Nama Barang,Customer,Kategori,Tipe,Stok,Satuan\n';
      filteredItems.forEach((item, idx) => {
        csvContent += `${idx + 1},"${item.sku}","${item.name}","${item.customerName || '-'}","${item.category}","${item.type === 'SERVICE' ? 'Service' : 'Inventory'}",${item.currentStock},"${item.unit}"\n`;
      });
    } else if (activeTab === 'KATEGORI') {
      csvContent = 'No,Kategori\n';
      filteredCategories.forEach((cat, idx) => {
        csvContent += `${idx + 1},"${cat.name}"\n`;
      });
    } else if (activeTab === 'CUSTOMER') {
      csvContent = 'No,Kode,Nama Customer\n';
      filteredCustomers.forEach((c, idx) => {
        csvContent += `${idx + 1},"${c.code}","${c.name}"\n`;
      });
    } else {
      csvContent = 'No,Satuan\n';
      filteredUnits.forEach((u, idx) => {
        csvContent += `${idx + 1},"${u.name}"\n`;
      });
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [activeTab, items, categories, units, customers]);

  // Derived Data
  const filteredItems = items.filter(i => {
    if (searchNo && !i.sku.toLowerCase().includes(searchNo.toLowerCase())) return false;
    if (searchKet) {
      const matchName = i.name.toLowerCase().includes(searchKet.toLowerCase());
      const matchCust = (i.customerName || '').toLowerCase().includes(searchKet.toLowerCase());
      if (!matchName && !matchCust) return false;
    }
    if (searchCustomer && !(i.customerName || '').toLowerCase().includes(searchCustomer.toLowerCase())) return false;
    if (!typeFilters[i.type]) return false;
    if (categoryFilters[i.category] === false) return false;
    return true;
  });

  const filteredCategories = categories.filter(c => {
    if (searchKet && !c.name.toLowerCase().includes(searchKet.toLowerCase())) return false;
    return true;
  });

  const filteredCustomers = customers?.filter(c => {
    if (searchNo && !c.code.toLowerCase().includes(searchNo.toLowerCase())) return false;
    if (searchKet && !c.name.toLowerCase().includes(searchKet.toLowerCase())) return false;
    if (searchCustomer && !c.name.toLowerCase().includes(searchCustomer.toLowerCase())) return false;
    return true;
  }) || [];

  const filteredUnits = units.filter(u => {
    if (searchKet && !u.name.toLowerCase().includes(searchKet.toLowerCase())) return false;
    return true;
  });

  const renderDataBarang = () => (
    <div className="flex-1 overflow-auto bg-white border-l border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <th className="px-4 py-2 w-12 text-center border-r border-slate-200">No.</th>
            <th className="px-4 py-2 border-r border-slate-200">JOB-REG</th>
            <th className="px-4 py-2 border-r border-slate-200">Nama Barang</th>
            <th className="px-4 py-2 border-r border-slate-200">Customer</th>
            <th className="px-4 py-2 border-r border-slate-200">Kategori</th>
            <th className="px-4 py-2 border-r border-slate-200">Tipe</th>
            <th className="px-4 py-2 text-right border-r border-slate-200">Stok</th>
            <th className="px-4 py-2">Satuan</th>
          </tr>
        </thead>
        <tbody className={`divide-y divide-slate-100 ${isRefreshing ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}>
          {filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item, idx) => (
            <tr 
              key={item.id} 
              onClick={() => setSelectedId(item.id)}
              onDoubleClick={() => { setSelectedId(item.id); setEditItemData({ ...item }); }}
              className={`transition-colors cursor-pointer ${selectedId === item.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
            >
              <td className="px-4 py-2 text-center text-slate-500 border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
              <td className="px-4 py-2 text-slate-600 border-r border-slate-100">{item.sku}</td>
              <td className="px-4 py-2 font-medium text-slate-800 border-r border-slate-100">{item.name}</td>
              <td className="px-4 py-2 font-medium text-blue-600 border-r border-slate-100">{item.customerName || '-'}</td>
              <td className="px-4 py-2 text-slate-600 border-r border-slate-100">{item.category}</td>
              <td className="px-4 py-2 text-slate-600 border-r border-slate-100">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.type === 'SERVICE' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {item.type === 'SERVICE' ? 'Service' : 'Inventory'}
                </span>
              </td>
              <td className="px-4 py-2 text-right border-r border-slate-100">{item.currentStock.toLocaleString('id-ID')}</td>
              <td className="px-4 py-2 text-slate-600">{item.unit}</td>
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada data.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderDataKategori = () => (
    <div className="flex-1 overflow-auto bg-white border-l border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <th className="px-4 py-2 w-12 text-center border-r border-slate-200">No.</th>
            <th className="px-4 py-2">Kategori</th>
          </tr>
        </thead>
        <tbody className={`divide-y divide-slate-100 ${isRefreshing ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}>
          {filteredCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((cat, idx) => (
            <tr 
              key={cat.id} 
              onClick={() => setSelectedId(cat.id)}
              onDoubleClick={() => { setSelectedId(cat.id); setEditCategoryData({ ...cat }); }}
              className={`transition-colors cursor-pointer ${selectedId === cat.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
            >
              <td className="px-4 py-2 text-center text-slate-500 border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
              <td className="px-4 py-2 font-medium text-slate-800">{cat.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDataSatuan = () => (
    <div className="flex-1 overflow-auto bg-white border-l border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <th className="px-4 py-2 w-12 text-center border-r border-slate-200">No.</th>
            <th className="px-4 py-2">Satuan Barang</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredUnits.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((u, idx) => (
            <tr 
              key={u.id} 
              onClick={() => setSelectedId(u.id)}
              onDoubleClick={() => { setSelectedId(u.id); setEditUnitData({ ...u }); }}
              className={`transition-colors cursor-pointer ${selectedId === u.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
            >
              <td className="px-4 py-2 text-center text-slate-500 border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
              <td className="px-4 py-2 font-medium text-slate-800">{u.name}</td>
            </tr>
          ))}
          {filteredUnits.length === 0 && (
            <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-500">Tidak ada data satuan.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderDataCustomer = () => (
    <div className="flex-1 overflow-auto bg-white border-l border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <th className="px-4 py-2 w-12 text-center border-r border-slate-200">No.</th>
            <th className="px-4 py-2 border-r border-slate-200">Kode</th>
            <th className="px-4 py-2">Nama Customer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((c, idx) => (
            <tr 
              key={c.id} 
              onClick={() => setSelectedId(c.id)}
              onDoubleClick={() => { setSelectedId(c.id); setEditCustomerData({ ...c }); }}
              className={`transition-colors cursor-pointer ${selectedId === c.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
            >
              <td className="px-4 py-2 text-center text-slate-500 border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
              <td className="px-4 py-2 text-slate-600 border-r border-slate-100">{c.code}</td>
              <td className="px-4 py-2 font-medium text-slate-800">{c.name}</td>
            </tr>
          ))}
          {filteredCustomers.length === 0 && (
            <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Tidak ada data customer.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      
      {/* 1. Header Title */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-none">
              {activeTab === 'BARANG' ? 'Data Barang & Jasa' : activeTab === 'KATEGORI' ? 'Data Kategori' : activeTab === 'CUSTOMER' ? 'Data Customer' : 'Data Satuan'}
            </h2>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>


      <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
        <button onClick={handleCreate} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-xs">Baru</span>
        </button>
        <button onClick={handleEdit} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <Edit className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs">Ubah</span>
        </button>
        <button onClick={handleDelete} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <Trash2 className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-xs">Hapus</span>
        </button>
        <button onClick={handleDuplicate} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <Copy className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-xs">Salin</span>
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors ${showFilter ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-700'}`}>
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-xs">Filter</span>
        </button>
        <button onClick={handleRefresh} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <RefreshCw className={`w-4 h-4 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-semibold text-xs">Perbarui</span>
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button onClick={handlePrint} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <Printer className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-xs">Print</span>
        </button>
        <button onClick={handleExport} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-xs">Ekspor</span>
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1" />

        <div className="flex bg-slate-200/60 p-0.5 rounded-lg ml-auto">
          <button 
            onClick={() => { setActiveTab('BARANG'); setCurrentPage(1); setSelectedId(null); setSearchNo(''); setSearchKet(''); setSearchCustomer(''); }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'BARANG' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Barang & Jasa
          </button>
          <button 
            onClick={() => { setActiveTab('KATEGORI'); setCurrentPage(1); setSelectedId(null); setSearchNo(''); setSearchKet(''); setSearchCustomer(''); }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'KATEGORI' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Kategori
          </button>
          <button 
            onClick={() => { setActiveTab('CUSTOMER'); setCurrentPage(1); setSelectedId(null); setSearchNo(''); setSearchKet(''); setSearchCustomer(''); }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'CUSTOMER' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Customer
          </button>
          <button 
            onClick={() => { setActiveTab('SATUAN'); setCurrentPage(1); setSelectedId(null); setSearchNo(''); setSearchKet(''); setSearchCustomer(''); }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'SATUAN' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Satuan
          </button>
        </div>
      </div>

      {/* 4. Split Pane Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Pane: Filter */}
        {showFilter && (
          <div className="w-[200px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="flex justify-between items-center px-3 py-2 bg-slate-100 border-b border-slate-200">
              <span className="font-bold text-slate-700 text-xs">Filter</span>
              <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-rose-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-4 text-xs text-slate-700">
              {/* Cari */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Cari:</label>
                  {(searchNo || searchKet || searchCustomer) && (
                    <button 
                      onClick={() => { setSearchNo(''); setSearchKet(''); setSearchCustomer(''); setCurrentPage(1); }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder={activeTab === 'CUSTOMER' ? "< Kode Customer >" : "< JOB-REG >"}
                  value={searchNo}
                  onChange={(e) => { setSearchNo(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                {activeTab !== 'CUSTOMER' && (
                  <input 
                    type="text" 
                    placeholder={activeTab === 'KATEGORI' ? "< Nama Kategori >" : activeTab === 'SATUAN' ? "< Nama Satuan >" : "< Nama Barang >"}
                    value={searchKet}
                    onChange={(e) => { setSearchKet(e.target.value); setCurrentPage(1); }}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                  />
                )}
                {activeTab === 'BARANG' && (
                  <input 
                    type="text" 
                    placeholder="< Customer >"
                    value={searchCustomer}
                    onChange={(e) => { setSearchCustomer(e.target.value); setCurrentPage(1); }}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                  />
                )}
                {activeTab === 'CUSTOMER' && (
                  <input 
                    type="text" 
                    placeholder="< Nama Customer >"
                    value={searchKet}
                    onChange={(e) => { setSearchKet(e.target.value); setCurrentPage(1); }}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                  />
                )}
              </div>

              {activeTab === 'BARANG' && (
                <>
                  {/* Tipe Filter */}
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-slate-800">Tipe :</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={typeFilters['INVENTORY']} onChange={(e) => setTypeFilters({...typeFilters, INVENTORY: e.target.checked})} className="rounded text-blue-600" />
                      Stok Disimpan (Inventory)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={typeFilters['SERVICE']} onChange={(e) => setTypeFilters({...typeFilters, SERVICE: e.target.checked})} className="rounded text-blue-600" />
                      Jasa (Service)
                    </label>
                  </div>

                  {/* Kategori Filter */}
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-slate-800">Kategori :</label>
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={categoryFilters[cat.name] ?? true} 
                          onChange={(e) => setCategoryFilters({...categoryFilters, [cat.name]: e.target.checked})} 
                          className="rounded text-blue-600" 
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Right Pane: Table Area */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          
          {activeTab === 'BARANG' && renderDataBarang()}
          {activeTab === 'KATEGORI' && renderDataKategori()}
          {activeTab === 'SATUAN' && renderDataSatuan()}
          {activeTab === 'CUSTOMER' && renderDataCustomer()}

          {/* Pagination Footer */}
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span>Tampilkan:</span>
                <select 
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-1 py-0.5 border border-slate-300 rounded bg-white outline-none"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="w-px h-3 bg-slate-300"></div>
              {(() => {
                const total = activeTab === 'BARANG' ? filteredItems.length : activeTab === 'KATEGORI' ? filteredCategories.length : activeTab === 'CUSTOMER' ? filteredCustomers.length : filteredUnits.length;
                return (
                  <span>Menampilkan {total === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, total)} dari {total} Baris</span>
                );
              })()}
            </div>
            
            {(() => {
              const total = activeTab === 'BARANG' ? filteredItems.length : activeTab === 'KATEGORI' ? filteredCategories.length : activeTab === 'CUSTOMER' ? filteredCustomers.length : filteredUnits.length;
              const totalPages = Math.max(1, Math.ceil(total / pageSize));
              return (
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })()}
          </div>

        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Create Item */}
      {showItemForm && <MasterItemFormModal onClose={() => setShowItemForm(false)} />}

      {/* Edit Item */}
      {editItemData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Ubah Data Barang</h2>
                <p className="text-xs text-slate-500 mt-0.5">Edit data untuk {editItemData.sku}</p>
              </div>
              <button onClick={() => setEditItemData(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateItem(editItemData.id, {
                sku: editItemData.sku,
                name: editItemData.name,
                customerName: editItemData.customerName,
                category: editItemData.category,
                type: editItemData.type,
                currentStock: editItemData.currentStock,
                minStock: editItemData.minStock,
                unit: editItemData.unit,
              });
              setEditItemData(null);
            }} className="flex-1 overflow-auto p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">JOB-REG *</label>
                  <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono text-sm uppercase"
                    value={editItemData.sku} onChange={e => setEditItemData({...editItemData, sku: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipe Barang *</label>
                  <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                    value={editItemData.type} onChange={e => setEditItemData({...editItemData, type: e.target.value as ItemType})}>
                    <option value="INVENTORY">Inventory (Stok Disimpan)</option>
                    <option value="SERVICE">Service (Jasa)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Barang / Jasa *</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                  value={editItemData.name} onChange={e => setEditItemData({...editItemData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Customer</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                  value={editItemData.customerName || ''} onChange={e => setEditItemData({...editItemData, customerName: e.target.value})}>
                  <option value="">-- Tidak Ada --</option>
                  {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori *</label>
                  <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                    value={editItemData.category} onChange={e => setEditItemData({...editItemData, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Satuan *</label>
                  <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                    value={editItemData.unit} onChange={e => setEditItemData({...editItemData, unit: e.target.value})}>
                    {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className={`grid ${editItemData.type === 'SERVICE' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{editItemData.type === 'SERVICE' ? 'Jumlah Unit Servis' : 'Stok Saat Ini'}</label>
                    <input type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                      value={editItemData.currentStock} onChange={e => setEditItemData({...editItemData, currentStock: Number(e.target.value)})} />
                  </div>
                  {editItemData.type !== 'SERVICE' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Batas Stok Minimum</label>
                      <input type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                        value={editItemData.minStock} onChange={e => setEditItemData({...editItemData, minStock: Number(e.target.value)})} />
                    </div>
                  )}
                </div>
              <div className="mt-4 flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditItemData(null)} className="flex-1 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Create Category */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-5">
            <h3 className="font-bold text-slate-800 mb-4">Entri Kategori Baru</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const val = (e.currentTarget.elements.namedItem('catName') as HTMLInputElement).value;
              if (val) addCategory(val.toUpperCase());
              setShowCategoryForm(false);
            }}>
              <input required name="catName" className="w-full px-3 py-2 border border-slate-300 rounded mb-4 text-sm" placeholder="Nama Kategori..." />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCategoryForm(false)} className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category */}
      {editCategoryData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-5">
            <h3 className="font-bold text-slate-800 mb-4">Ubah Kategori</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateCategory(editCategoryData.id, editCategoryData.name);
              setEditCategoryData(null);
            }}>
              <input required className="w-full px-3 py-2 border border-slate-300 rounded mb-4 text-sm uppercase"
                value={editCategoryData.name} onChange={e => setEditCategoryData({...editCategoryData, name: e.target.value.toUpperCase()})} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditCategoryData(null)} className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Unit */}
      {showUnitForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-5">
            <h3 className="font-bold text-slate-800 mb-4">Entri Satuan Baru</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const val = (e.currentTarget.elements.namedItem('unitName') as HTMLInputElement).value;
              if (val) addUnit(val);
              setShowUnitForm(false);
            }}>
              <input required name="unitName" className="w-full px-3 py-2 border border-slate-300 rounded mb-4 text-sm" placeholder="Misal: Pcs, Set, Box..." />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowUnitForm(false)} className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Unit */}
      {editUnitData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-5">
            <h3 className="font-bold text-slate-800 mb-4">Ubah Satuan</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateUnit(editUnitData.id, editUnitData.name);
              setEditUnitData(null);
            }}>
              <input required className="w-full px-3 py-2 border border-slate-300 rounded mb-4 text-sm"
                value={editUnitData.name} onChange={e => setEditUnitData({...editUnitData, name: e.target.value})} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditUnitData(null)} className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Customer */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-5">
            <h3 className="font-bold text-slate-800 mb-4">Entri Customer Baru</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              addCustomer({
                code: (form.elements.namedItem('code') as HTMLInputElement).value,
                name: (form.elements.namedItem('name') as HTMLInputElement).value,
                contact: '-',
                phone: '-'
              });
              setShowCustomerForm(false);
            }}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Customer *</label>
                <input required name="code" className="w-full px-3 py-2 border border-slate-300 rounded text-sm uppercase" placeholder="Misal: C-003" />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Perusahaan / Customer *</label>
                <input required name="name" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" placeholder="PT Sukses Makmur..." />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCustomerForm(false)} className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer */}
      {editCustomerData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-5">
            <h3 className="font-bold text-slate-800 mb-4">Ubah Data Customer</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateCustomer(editCustomerData.id, {
                code: editCustomerData.code,
                name: editCustomerData.name,
              });
              setEditCustomerData(null);
            }}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Customer *</label>
                <input required className="w-full px-3 py-2 border border-slate-300 rounded text-sm uppercase"
                  value={editCustomerData.code} onChange={e => setEditCustomerData({...editCustomerData, code: e.target.value})} />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Perusahaan / Customer *</label>
                <input required className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  value={editCustomerData.name} onChange={e => setEditCustomerData({...editCustomerData, name: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditCustomerData(null)} className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
