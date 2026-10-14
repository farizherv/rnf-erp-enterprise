import React, { useState, useMemo, useCallback } from 'react';
import { 
  X, Copy, Edit, Trash2, Plus, RefreshCw, Printer, 
  Filter, FileSpreadsheet, ChevronLeft, ChevronRight, Package, Save 
} from 'lucide-react';
import { useInventory, type StockMovement } from '../context/InventoryContext';

interface UnifiedInventoryViewProps {
  onClose?: () => void;
  initialSearchJobReg?: string;
}

export const UnifiedInventoryView: React.FC<UnifiedInventoryViewProps> = ({ onClose, initialSearchJobReg }) => {
  const { 
    items, 
    movements, 
    categories, 
    vendors, 
    itemGroups, 
    issueStock, 
    receiveStock, 
    updateMovement, 
    deleteMovement, 
    refresh 
  } = useInventory();
  
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<StockMovement | null>(null);
  const [showFilter, setShowFilter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchJobReg, setSearchJobReg] = useState(initialSearchJobReg || '');
  const [searchItemName, setSearchItemName] = useState('');
  const [searchPoNo, setSearchPoNo] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchVendor, setSearchVendor] = useState('');
  const [searchItemType, setSearchItemType] = useState('ALL');

  React.useEffect(() => {
    if (initialSearchJobReg !== undefined) {
      setSearchJobReg(initialSearchJobReg);
    }
  }, [initialSearchJobReg]);
  const [typeFilters, setTypeFilters] = useState<{ [key: string]: boolean }>({
    'IN': true,
    'OUT': true
  });

  // Derived Data
  const filteredData = useMemo(() => {
    return movements.filter(m => {
      const itemData = items.find(i => i.id === m.itemId);
      const category = m.item_group || itemData?.itemGroup || itemData?.category || '';

      // Tipe Barang filter
      if (searchItemType !== 'ALL') {
        const itemType = (itemData?.type || 'INVENTORY').toUpperCase();
        if (searchItemType === 'SERVICE' && itemType !== 'SERVICE') return false;
        if (searchItemType === 'INVENTORY' && itemType === 'SERVICE') return false;
      }

      // JOB-REG filter
      if (searchJobReg) {
        const query = searchJobReg.trim().toLowerCase();
        const ref = (m.reference || '').toLowerCase();
        const sku = (itemData?.sku || '').toLowerCase();
        if (!ref.includes(query) && !sku.includes(query)) return false;
      }

      // Nama Barang filter
      if (searchItemName) {
        const query = searchItemName.trim().toLowerCase();
        const name = (m.itemName || itemData?.name || '').toLowerCase();
        if (!name.includes(query)) return false;
      }
      
      // PO Number filter
      if (searchPoNo) {
        const query = searchPoNo.trim().toLowerCase();
        const po = (m.po_number || (m as any).poNumber || (m as any).po_no || '').toLowerCase();
        if (!po.includes(query)) return false;
      }

      // Kategori filter
      if (searchCategory) {
        const query = searchCategory.trim().toLowerCase();
        const cat = (category || '').toLowerCase();
        if (!cat.includes(query)) return false;
      }

      // Vendor filter
      if (searchVendor) {
        const query = searchVendor.trim().toLowerCase();
        const v = (m.vendor || (m as any).vendorName || '').toLowerCase();
        if (!v.includes(query)) return false;
      }
      
      // Date Range Filter
      if (startDate && m.date < startDate) return false;
      if (endDate && m.date > endDate) return false;
      
      // Type filters
      if (!typeFilters[m.type]) return false;
      
      return true;
    });
  }, [movements, items, startDate, endDate, searchJobReg, searchItemName, searchPoNo, searchCategory, searchVendor, searchItemType, typeFilters]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSelectedId(null);
    try {
      if (refresh) await refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleEdit = () => {
    if (!selectedId) return alert('Silakan pilih data terlebih dahulu.');
    const movement = movements.find(m => m.id === selectedId);
    if (movement) {
      setEditData(movement);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return alert('Silakan pilih data terlebih dahulu.');
    if (confirm('Yakin ingin menghapus data mutasi stok ini? Stok barang akan disesuaikan kembali secara otomatis.')) {
      try {
        if (deleteMovement) {
          await deleteMovement(selectedId);
        }
        setSelectedId(null);
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus mutasi stok.');
      }
    }
  };

  const handleDuplicate = () => {
    if (!selectedId) return alert('Silakan pilih data terlebih dahulu.');
    const movement = movements.find(m => m.id === selectedId);
    if (movement) {
      // Open form pre-filled with duplicate data
      setEditData({ ...movement, id: '' }); 
    }
  };

  const handleExportCSV = useCallback(() => {
    if (filteredData.length === 0) {
      alert('Tidak ada data mutasi untuk diekspor.');
      return;
    }
    const headers = ['No', 'Date', 'JOB REG', 'Mutasi', 'Nama Barang', 'Qty', 'UOM', 'PO No', 'Kategori', 'Tipe Barang', 'Price Each', 'Price Total', 'Tax', 'Vendor', 'Remarks'];
    const rows = filteredData.map((mov, idx) => {
      const itemData = items.find(i => i.id === mov.itemId);
      const priceEach = Number(mov.price_each) || 0;
      const calculatedPriceTotal = mov.price_total !== undefined && mov.price_total !== null && Number(mov.price_total) > 0
        ? Number(mov.price_total)
        : priceEach * mov.quantity;
      const categoryName = mov.item_group || itemData?.itemGroup || itemData?.category || '-';
      const typeLabel = (itemData?.type || 'INVENTORY') === 'SERVICE' ? 'Service' : 'Inventory';
      const dateStr = new Date(mov.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return [
        idx + 1,
        `"${dateStr}"`,
        `"${itemData?.sku || mov.reference || '-'}"`,
        `"${mov.type === 'IN' ? 'Masuk' : 'Keluar'}"`,
        `"${(mov.itemName || '').replace(/"/g, '""')}"`,
        mov.quantity,
        `"${itemData?.unit || ''}"`,
        `"${mov.po_number || '-'}"`,
        `"${categoryName.replace(/"/g, '""')}"`,
        `"${typeLabel}"`,
        priceEach,
        calculatedPriceTotal,
        `"${mov.tax_type || '-'}"`,
        `"${(mov.vendor || '-').replace(/"/g, '""')}"`,
        `"${(mov.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Mutasi_Stok_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredData, items]);

  const handlePrint = useCallback(() => {
    let tableHTML = `<table><thead><tr><th>No.</th><th>Date</th><th>JOB REG</th><th>Mutasi</th><th>Nama Barang</th><th>Qty</th><th>UOM</th><th>PO No</th><th>Kategori</th><th>Price Each</th><th>Price Total</th><th>Tax</th><th>Vendor</th><th>Remarks</th></tr></thead><tbody>`;
    filteredData.forEach((mov, idx) => {
      const itemData = items.find(i => i.id === mov.itemId);
      const priceEach = Number(mov.price_each) || 0;
      const calculatedPriceTotal = mov.price_total !== undefined && mov.price_total !== null && Number(mov.price_total) > 0
        ? Number(mov.price_total)
        : priceEach * mov.quantity;
      const categoryName = mov.item_group || itemData?.itemGroup || itemData?.category || '-';
      const dateStr = new Date(mov.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      tableHTML += `<tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${dateStr}</td>
        <td>${itemData?.sku || mov.reference || '-'}</td>
        <td>${mov.type === 'IN' ? 'Masuk' : 'Keluar'}</td>
        <td>${mov.itemName}</td>
        <td style="text-align:right;font-weight:bold;">${mov.quantity.toLocaleString('id-ID')}</td>
        <td>${itemData?.unit || '-'}</td>
        <td>${mov.po_number || '-'}</td>
        <td>${categoryName}</td>
        <td style="text-align:right;">${priceEach > 0 ? 'Rp ' + priceEach.toLocaleString('id-ID') : '-'}</td>
        <td style="text-align:right;font-weight:bold;">${calculatedPriceTotal > 0 ? 'Rp ' + calculatedPriceTotal.toLocaleString('id-ID') : '-'}</td>
        <td>${mov.tax_type === 'PPN' ? 'PPN (11%)' : 'Non-PPN'}</td>
        <td>${mov.vendor || '-'}</td>
        <td>${mov.notes || '-'}</td>
      </tr>`;
    });
    tableHTML += `</tbody></table>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html><html><head><title>Data Mutasi Stok</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 24px; }
          h1 { font-size: 18px; margin-bottom: 16px; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 6px 8px; border: 1px solid #e2e8f0; }
          td { padding: 5px 8px; border: 1px solid #e2e8f0; color: #334155; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print { body { padding: 0; } }
        </style>
        </head><body>
        <h1>Data Mutasi Stok</h1>
        ${tableHTML}
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [filteredData, items]);

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
              Data Mutasi Stok
            </h2>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Toolbar - Seragam dengan Master Data Barang */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
        <button 
          onClick={() => { setEditData(null); setShowForm(true); }} 
          className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-xs">Baru</span>
        </button>
        <button 
          onClick={handleEdit} 
          className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <Edit className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs">Ubah</span>
        </button>
        <button 
          onClick={handleDelete} 
          className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-xs">Hapus</span>
        </button>
        <button 
          onClick={handleDuplicate} 
          className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <Copy className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-xs">Salin</span>
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors ${showFilter ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-700'}`}
        >
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-xs">Filter</span>
        </button>
        <button 
          onClick={handleRefresh} 
          className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-semibold text-xs">Perbarui</span>
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button 
          onClick={handlePrint} 
          className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-xs">Print</span>
        </button>
        <button 
          onClick={handleExportCSV} 
          className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-xs">Ekspor</span>
        </button>

        <div className="flex bg-slate-200/60 p-0.5 rounded-lg ml-auto">
          <button 
            onClick={() => { setTypeFilters({ 'IN': true, 'OUT': true }); setCurrentPage(1); setSelectedId(null); }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${typeFilters['IN'] && typeFilters['OUT'] ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Semua Mutasi
          </button>
          <button 
            onClick={() => { setTypeFilters({ 'IN': true, 'OUT': false }); setCurrentPage(1); setSelectedId(null); }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${typeFilters['IN'] && !typeFilters['OUT'] ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Penerimaan (IN)
          </button>
          <button 
            onClick={() => { setTypeFilters({ 'IN': false, 'OUT': true }); setCurrentPage(1); setSelectedId(null); }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!typeFilters['IN'] && typeFilters['OUT'] ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pengeluaran (OUT)
          </button>
        </div>
      </div>

      {/* 3. Split Pane Workspace */}
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Cari:</label>
                  {(searchJobReg || searchItemName || searchItemType !== 'ALL' || searchPoNo || searchCategory || searchVendor || startDate || endDate) && (
                    <button
                      onClick={() => {
                        setSearchJobReg('');
                        setSearchItemName('');
                        setSearchItemType('ALL');
                        setSearchPoNo('');
                        setSearchCategory('');
                        setSearchVendor('');
                        setStartDate('');
                        setEndDate('');
                        setCurrentPage(1);
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="< JOB-REG >" 
                  value={searchJobReg}
                  onChange={(e) => { setSearchJobReg(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <input 
                  type="text" 
                  placeholder="< Nama Barang >" 
                  value={searchItemName}
                  onChange={(e) => { setSearchItemName(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <select
                  value={searchItemType}
                  onChange={(e) => { setSearchItemType(e.target.value as any); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 text-slate-700 font-medium"
                >
                  <option value="ALL">&lt; Semua Tipe Barang &gt;</option>
                  <option value="INVENTORY">Inventory</option>
                  <option value="SERVICE">Service</option>
                </select>
                <input 
                  type="text" 
                  placeholder="< PO No >" 
                  value={searchPoNo}
                  onChange={(e) => { setSearchPoNo(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <input 
                  type="text" 
                  placeholder="< Kategori >" 
                  value={searchCategory}
                  onChange={(e) => { setSearchCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <input 
                  type="text" 
                  placeholder="< Vendor >" 
                  value={searchVendor}
                  onChange={(e) => { setSearchVendor(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-slate-800">Tanggal Awal:</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-slate-800">Tanggal Akhir:</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Right Pane: Table Area */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          <div className="flex-1 overflow-auto bg-white border-l border-slate-200">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="px-4 py-2 w-12 text-center border-r border-slate-200">No.</th>
                  <th className="px-4 py-2 border-r border-slate-200">Date</th>
                  <th className="px-4 py-2 border-r border-slate-200">JOB-REG</th>
                  <th className="px-4 py-2 border-r border-slate-200">Mutasi</th>
                  <th className="px-4 py-2 border-r border-slate-200">Nama Barang</th>
                  <th className="px-4 py-2 text-center border-r border-slate-200">Tipe</th>
                  <th className="px-4 py-2 text-right border-r border-slate-200">Qty</th>
                  <th className="px-4 py-2 border-r border-slate-200">UOM</th>
                  <th className="px-4 py-2 border-r border-slate-200">PO No</th>
                  <th className="px-4 py-2 border-r border-slate-200">Kategori</th>
                  <th className="px-4 py-2 text-right border-r border-slate-200">Price Each</th>
                  <th className="px-4 py-2 text-right border-r border-slate-200">Price Total</th>
                  <th className="px-4 py-2 text-center border-r border-slate-200">Tax</th>
                  <th className="px-4 py-2 border-r border-slate-200">Vendor</th>
                  <th className="px-4 py-2">Remarks</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-100 ${isRefreshing ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data mutasi yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((mov, index) => {
                    const globalIndex = (currentPage - 1) * pageSize + index + 1;
                    const itemData = items.find(i => i.id === mov.itemId);
                    const isService = itemData?.type === 'SERVICE';
                    
                    const priceEach = Number(mov.price_each) || 0;
                    const calculatedPriceTotal = mov.price_total !== undefined && mov.price_total !== null && Number(mov.price_total) > 0
                      ? Number(mov.price_total)
                      : priceEach * mov.quantity;
                    const resolvedCategory = mov.item_group || itemData?.itemGroup || itemData?.category || '-';

                    return (
                      <tr 
                        key={mov.id} 
                        onClick={() => setSelectedId(mov.id)}
                        onDoubleClick={() => { setSelectedId(mov.id); setEditData(mov); }}
                        className={`transition-colors cursor-pointer ${selectedId === mov.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-2 text-center text-slate-500 border-r border-slate-100">{globalIndex}</td>
                        <td className="px-4 py-2 text-slate-600 border-r border-slate-100">
                          {new Date(mov.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-2 text-slate-700 font-mono border-r border-slate-100">
                          {itemData?.sku || mov.reference || '-'}
                        </td>
                        <td className="px-4 py-2 border-r border-slate-100">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${mov.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {mov.type === 'IN' ? 'Masuk' : 'Keluar'}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-800 border-r border-slate-100">{mov.itemName}</td>
                        <td className="px-4 py-2 text-center border-r border-slate-100">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isService 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isService ? 'Service' : 'Inventory'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right border-r border-slate-100 font-bold text-slate-800">{mov.quantity.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-2 text-slate-600 border-r border-slate-100">{itemData?.unit || '-'}</td>
                        <td className="px-4 py-2 font-mono font-medium text-blue-600 border-r border-slate-100">{mov.po_number || '-'}</td>
                        <td className="px-4 py-2 text-slate-600 border-r border-slate-100">{resolvedCategory}</td>
                        <td className="px-4 py-2 text-right border-r border-slate-100">
                          {priceEach > 0 ? `Rp ${priceEach.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-right border-r border-slate-100 font-bold text-emerald-700">
                          {calculatedPriceTotal > 0 ? `Rp ${calculatedPriceTotal.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-center border-r border-slate-100">
                          {mov.tax_type === 'PPN' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              PPN (11%)
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Non-PPN</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-slate-700 border-r border-slate-100">{mov.vendor || '-'}</td>
                        <td className="px-4 py-2 text-slate-600 max-w-[200px] truncate" title={mov.notes || ''}>
                          {mov.notes || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer - Seragam dengan Master Data Barang */}
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
              <span>Menampilkan {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length} Baris</span>
            </div>

            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">Halaman {currentPage} dari {totalPages}</span>
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FORM MODAL - Desain seragam dengan MasterItemFormModal */}
      {(showForm || editData) && (
        <CreateMovementModal 
          key={editData ? (editData.id || 'duplicate') : 'new'}
          onClose={() => { setShowForm(false); setEditData(null); }} 
          items={items}
          categories={categories}
          vendors={vendors}
          itemGroups={itemGroups}
          issueStock={issueStock}
          receiveStock={receiveStock}
          updateMovement={updateMovement}
          initialData={editData}
        />
      )}
    </div>
  );
};

// --- Subcomponent: CreateMovementModal ---
// Mengadopsi desain elegan, rapi, dan seragam 100% dengan MasterItemFormModal

interface CreateMovementModalProps {
  onClose: () => void;
  items: any[];
  categories: any[];
  vendors: any[];
  itemGroups: any[];
  issueStock: (itemId: string, qty: number, ref: string, date: string, extra?: any) => Promise<any>;
  receiveStock: (itemId: string, qty: number, ref: string, date: string, extra?: any) => Promise<any>;
  updateMovement: (movId: string, data: any) => Promise<any>;
  initialData?: StockMovement | null;
}

const CreateMovementModal: React.FC<CreateMovementModalProps> = ({ 
  onClose, 
  items, 
  categories, 
  vendors, 
  itemGroups, 
  issueStock, 
  receiveStock, 
  updateMovement, 
  initialData 
}) => {
  const isEditing = Boolean(initialData && initialData.id);
  const isDuplicate = Boolean(initialData && !initialData.id);
  const [activeTab, setActiveTab] = useState<'MUTASI' | 'FINANCIAL'>('MUTASI');
  const [type, setType] = useState<'IN'|'OUT'>(initialData?.type || 'IN');
  
  const firstItem = items && items.length > 0 ? items[0] : null;
  const initialItemId = initialData?.itemId || (firstItem ? firstItem.id : '');
  const initialSelectedItem = items.find((i: any) => i.id === initialItemId);

  const [formData, setFormData] = useState({
    date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
    itemId: initialItemId,
    quantity: initialData?.quantity ?? 1,
    reference: initialData?.reference || initialSelectedItem?.sku || '',
    part_number: initialData?.part_number || '',
    item_group: initialData?.item_group || initialSelectedItem?.itemGroup || initialSelectedItem?.category || '',
    po_number: initialData?.po_number || '',
    vendor: initialData?.vendor || '',
    price_each: initialData?.price_each !== undefined && initialData?.price_each !== null ? String(initialData.price_each) : '',
    tax_type: initialData?.tax_type || 'NON_PPN',
    notes: initialData?.notes || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItemData = items.find((i: any) => i.id === formData.itemId) || initialSelectedItem;
  
  const priceEachNum = parseFloat(formData.price_each) || 0;
  const qtyNum = parseInt(formData.quantity.toString(), 10) || 0;
  const subtotal = priceEachNum * qtyNum;
  const taxAmount = formData.tax_type === 'PPN' ? subtotal * 0.11 : 0;
  const grandTotal = subtotal + taxAmount;

  // Category suggestions from master categories
  const categorySuggestions = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c: any) => { if (c.name) set.add(c.name); });
    items.forEach((it: any) => { if (it.category) set.add(it.category); });
    return Array.from(set);
  }, [categories, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemId) {
      alert('Silakan pilih barang terlebih dahulu di tab Data Mutasi.');
      setActiveTab('MUTASI');
      return;
    }
    if (qtyNum <= 0) {
      alert('Kuantitas harus lebih dari 0.');
      setActiveTab('FINANCIAL');
      return;
    }
    
    const availableStock = isEditing && type === 'OUT' && initialData?.itemId === formData.itemId
      ? (selectedItemData ? selectedItemData.currentStock + initialData.quantity : 0)
      : (selectedItemData ? selectedItemData.currentStock : 0);

    if (type === 'OUT' && selectedItemData && qtyNum > availableStock) {
      alert(`Stok tidak mencukupi! Sisa stok tersedia: ${availableStock} ${selectedItemData.unit || 'Unit'}`);
      setActiveTab('FINANCIAL');
      return;
    }

    const priceEachVal = formData.price_each !== '' && !isNaN(Number(formData.price_each))
      ? Number(formData.price_each)
      : null;
    const priceTotalVal = priceEachVal !== null ? (priceEachVal * qtyNum) : null;

    const extraData = {
      part_number: formData.part_number ? String(formData.part_number).trim() : null,
      item_group: formData.item_group ? String(formData.item_group).trim() : (selectedItemData?.itemGroup || selectedItemData?.category || null),
      po_number: formData.po_number ? String(formData.po_number).trim() : null,
      vendor: formData.vendor ? String(formData.vendor).trim() : null,
      price_each: priceEachVal,
      tax_type: formData.tax_type || 'NON_PPN',
      price_total: priceTotalVal,
      notes: formData.notes ? String(formData.notes).trim() : null
    };

    const finalReference = selectedItemData?.sku || (formData.reference ? String(formData.reference).trim() : '');

    setIsSubmitting(true);
    try {
      if (isEditing && initialData?.id) {
        await updateMovement(initialData.id, {
          itemId: formData.itemId,
          quantity: qtyNum,
          reference: finalReference,
          date: formData.date,
          ...extraData
        });
      } else {
        if (type === 'IN') {
          await receiveStock(formData.itemId, qtyNum, finalReference, formData.date, extraData);
        } else {
          await issueStock(formData.itemId, qtyNum, finalReference, formData.date, extraData);
        }
      }
      onClose();
    } catch (err: any) {
      console.error("Gagal menyimpan mutasi:", err);
      alert(err?.message || "Gagal menyimpan data mutasi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh]">
        
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditing ? 'Ubah Data Mutasi Stok' : isDuplicate ? 'Salin Mutasi Stok' : 'Entri Data Mutasi Stok Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lengkapi formulir mutasi stok di bawah ini.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Menu Tombol Tabs (Data Mutasi & Finansial) */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/70 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('MUTASI')}
            className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'MUTASI'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Data Mutasi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FINANCIAL')}
            className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'FINANCIAL'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Finansial</span>
            {Boolean(formData.vendor || formData.price_each || formData.notes) && (
              <span className="w-2 h-2 rounded-full bg-blue-600" title="Data Finansial Terisi" />
            )}
          </button>
        </div>

        {/* 3. Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto px-6 py-5 flex flex-col">
          
          {/* ════════════ TAB 1: DATA MUTASI ════════════ */}
          {activeTab === 'MUTASI' && (
            <div className="flex flex-col gap-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipe Mutasi *</label>
                  <select
                    required
                    disabled={isEditing}
                    value={type}
                    onChange={e => setType(e.target.value as 'IN' | 'OUT')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm bg-white font-medium"
                  >
                    <option value="IN">Penerimaan (IN / Masuk)</option>
                    <option value="OUT">Pengeluaran (OUT / Keluar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal *</label>
                  <input 
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pilih Barang *</label>
                <select
                  required
                  value={formData.itemId}
                  onChange={e => {
                    const sel = items.find((i: any) => i.id === e.target.value);
                    setFormData({
                      ...formData,
                      itemId: e.target.value,
                      reference: sel?.sku || '',
                      item_group: sel?.itemGroup || sel?.category || formData.item_group || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm font-medium"
                >
                  <option value="">-- Pilih Barang --</option>
                  {items.map((i: any) => (
                    <option key={i.id} value={i.id}>
                      {i.sku ? `[${i.sku}] ` : ''}{i.name} (Stok: {i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">JOB-REG</label>
                  <input 
                    type="text"
                    readOnly
                    value={selectedItemData?.sku || formData.reference || '-'}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-700 rounded-lg font-mono text-sm cursor-not-allowed select-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori</label>
                  <input 
                    type="text"
                    list="category-options"
                    value={formData.item_group}
                    onChange={e => setFormData({ ...formData, item_group: e.target.value })}
                    placeholder="Pilih atau ketik kategori..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                  <datalist id="category-options">
                    {categorySuggestions.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor PO (PO No)</label>
                  <input 
                    type="text"
                    placeholder="Contoh: PO-2026-001"
                    value={formData.po_number}
                    onChange={e => setFormData({ ...formData, po_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Satuan (UOM)</label>
                  <input 
                    type="text"
                    readOnly
                    value={selectedItemData?.unit || '-'}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-700 rounded-lg text-sm cursor-not-allowed select-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════════ TAB 2: FINANSIAL ════════════ */}
          {activeTab === 'FINANCIAL' && (
            <div className="flex flex-col gap-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vendor</label>
                  <input 
                    type="text"
                    placeholder="Nama vendor..."
                    value={formData.vendor}
                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Jumlah {type === 'IN' ? 'Masuk' : 'Keluar'} * {selectedItemData?.unit ? `(${selectedItemData.unit})` : ''}
                  </label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Harga Satuan (Price Each)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">Rp</span>
                    <input 
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={formData.price_each}
                      onChange={e => setFormData({ ...formData, price_each: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pajak (Tax)</label>
                  <select
                    value={formData.tax_type}
                    onChange={e => setFormData({ ...formData, tax_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="NON_PPN">Non-PPN (0%)</option>
                    <option value="PPN">PPN (11%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Remarks (Catatan)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                />
              </div>

              {/* Rincian Perhitungan Langsung */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                {/* 1. Kuantitas */}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 text-xs">
                  <span className="text-slate-600 font-medium">Kuantitas:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {qtyNum.toLocaleString('id-ID')} {selectedItemData?.unit || 'Unit'}
                  </span>
                </div>

                {/* 2. Harga Satuan */}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 text-xs">
                  <span className="text-slate-600 font-medium">Harga Satuan (Price Each):</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {priceEachNum > 0 ? `Rp ${priceEachNum.toLocaleString('id-ID')}` : 'Rp 0'}
                  </span>
                </div>

                {/* 3. Price Total */}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 text-xs">
                  <span className="text-slate-600 font-medium">Price Total (Subtotal):</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {subtotal > 0 ? `Rp ${subtotal.toLocaleString('id-ID')}` : 'Rp 0'}
                  </span>
                </div>

                {/* 4. Pajak */}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 text-xs">
                  <span className="text-slate-600 font-medium">Pajak ({formData.tax_type === 'PPN' ? 'PPN 11%' : 'Non-PPN'}):</span>
                  <span className="font-semibold text-slate-700 text-sm">
                    {formData.tax_type === 'PPN' ? `Rp ${taxAmount.toLocaleString('id-ID')}` : 'Rp 0'}
                  </span>
                </div>

                {/* 5. Grand Total Akhir */}
                <div className="flex items-center justify-between pt-1.5 text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider">Grand Total Akhir:</span>
                  <span className="text-base font-bold text-emerald-700">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Footer Actions */}
          <div className="mt-4 flex items-center justify-between pt-3.5 border-t border-slate-100">
            {/* Navigasi Antar Tab */}
            <div>
              {activeTab === 'MUTASI' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('FINANCIAL')}
                  className="py-2 px-4 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Lanjut ke Finansial →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('MUTASI')}
                  className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ← Kembali ke Data Mutasi
                </button>
              )}
            </div>

            {/* Tombol Batal & Simpan */}
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isSubmitting}
                className="py-2.5 px-5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={!formData.itemId || qtyNum <= 0 || isSubmitting}
                className="py-2.5 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
