import React, { useState, useCallback, useMemo } from 'react';
import {
  X, Plus, Edit, Trash2, Filter, RefreshCw, Printer,
  FileSpreadsheet, ChevronLeft, ChevronRight, Save,
  ArrowUpFromLine
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import type { StockMovement } from '../context/InventoryContext';

interface OutgoingStockViewProps {
  onClose?: () => void;
}

export const OutgoingStockView: React.FC<OutgoingStockViewProps> = ({ onClose }) => {
  const { items, movements, issueStock, updateMovement, deleteMovement } = useInventory();

  // ── View State ──
  const [view, setView] = useState<'list' | 'form'>('list');

  // ── Table State ──
  const [showFilter, setShowFilter] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Filter State ──
  const [filterJobReg, setFilterJobReg] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterBarang, setFilterBarang] = useState('');

  // ── Form State ──
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    itemId: '',
    quantity: 0,
  });

  // ── Edit Modal State ──
  const [editData, setEditData] = useState<{
    id: string;
    date: string;
    itemId: string;
    quantity: number;
  } | null>(null);

  // ── Derived Data ──
  const outgoingMovements = useMemo(() => {
    return movements.filter(m => {
      if (m.type !== 'OUT') return false;
      const item = items.find(i => i.id === m.itemId);
      const sku = item?.sku || '';

      if (filterJobReg && !sku.toLowerCase().includes(filterJobReg.toLowerCase())) return false;
      if (filterBarang && !m.itemName.toLowerCase().includes(filterBarang.toLowerCase())) return false;
      if (filterDate) {
        const movDate = new Date(m.date).toISOString().split('T')[0];
        if (movDate !== filterDate) return false;
      }

      return true;
    });
  }, [movements, items, filterJobReg, filterBarang, filterDate]);

  const selectedItem = items.find(i => i.id === formData.itemId);
  const editSelectedItem = editData ? items.find(i => i.id === editData.itemId) : null;

  // ── Actions ──
  const handleRefresh = () => {
    setIsRefreshing(true);
    setSelectedId(null);
    // Simulate network delay
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId || formData.quantity <= 0) return;

    const selected = items.find(i => i.id === formData.itemId);
    if (!selected || selected.currentStock < formData.quantity) {
      alert('Stok tidak mencukupi untuk jumlah keluar ini!');
      return;
    }

    issueStock(
      formData.itemId,
      formData.quantity,
      `JOB-REG-${Date.now()}`,
      formData.date
    );
    setView('list');
    setFormData({ date: new Date().toISOString().split('T')[0], itemId: '', quantity: 0 });
  };

  const handleEdit = () => {
    if (!selectedId) return alert('Silakan pilih data terlebih dahulu.');
    const mov = movements.find(m => m.id === selectedId);
    if (!mov) return;
    setEditData({
      id: mov.id,
      date: new Date(mov.date).toISOString().split('T')[0],
      itemId: mov.itemId,
      quantity: mov.quantity,
    });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData || !editData.itemId || editData.quantity <= 0) return;

    updateMovement(editData.id, {
      itemId: editData.itemId,
      quantity: editData.quantity,
      date: editData.date,
    });
    setEditData(null);
    setSelectedId(null);
  };

  const handleDelete = () => {
    if (!selectedId) return alert('Silakan pilih data terlebih dahulu.');
    if (!confirm('Yakin ingin menghapus data barang keluar ini?')) return;
    deleteMovement(selectedId);
    setSelectedId(null);
  };

  // ── Print ──
  const handlePrint = useCallback(() => {
    let tableHTML = `<table><thead><tr><th>No.</th><th>JOB-REG</th><th>Tanggal</th><th>Barang</th><th>Jumlah Keluar</th><th>Satuan</th></tr></thead><tbody>`;
    outgoingMovements.forEach((mov, idx) => {
      const item = items.find(i => i.id === mov.itemId);
      tableHTML += `<tr><td>${idx + 1}</td><td>${item?.sku || '-'}</td><td>${new Date(mov.date).toLocaleDateString('id-ID')}</td><td>${mov.itemName}</td><td>${mov.quantity}</td><td>${item?.unit || '-'}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html><html><head><title>Data Barang Keluar</title>
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
        <h1>Data Barang Keluar</h1>
        <p style="font-size:12px;color:#94a3b8;margin-bottom:12px;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        ${tableHTML}
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [outgoingMovements, items]);

  // ── Export CSV ──
  const handleExport = useCallback(() => {
    let csvContent = 'No,JOB-REG,Tanggal,Barang,Jumlah Keluar,Satuan\n';
    outgoingMovements.forEach((mov, idx) => {
      const item = items.find(i => i.id === mov.itemId);
      csvContent += `${idx + 1},"${item?.sku || '-'}","${new Date(mov.date).toLocaleDateString('id-ID')}","${mov.itemName}",${mov.quantity},"${item?.unit || '-'}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Barang_Keluar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [outgoingMovements, items]);

  // ── Pagination ──
  const total = outgoingMovements.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ── Render: Create Form ──
  const renderForm = () => (
    <div className="flex-1 bg-slate-500/10 p-6 flex justify-center items-start overflow-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Entri Data Barang Keluar</h2>
            <p className="text-xs text-slate-500 mt-0.5">Lengkapi formulir transaksi di bawah ini.</p>
          </div>
          <button onClick={() => setView('list')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-auto p-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">JOB-REG *</label>
              <input type="text" disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" value={selectedItem ? selectedItem.sku : ''} placeholder="Pilih barang..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal *</label>
              <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 my-2"></div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Barang *</label>
              <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm" value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})}>
                <option value="">-- Pilih Barang / Jasa --</option>
                {items.map(i => (<option key={i.id} value={i.id}>{i.sku} - {i.name} {i.type === 'SERVICE' ? '(Jasa)' : ''}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jumlah Keluar *</label>
              <input required type="number" min="1" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm font-semibold" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stok Saat Ini</label>
              <div className="flex">
                <input type="text" disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-l-lg text-sm text-slate-500 font-mono" value={selectedItem ? selectedItem.currentStock : ''} />
                <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-sm text-slate-500">{selectedItem ? selectedItem.unit : '-'}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sisa Stok (Estimasi)</label>
              <input
                type="text"
                disabled
                className={`w-full px-3 py-2 border rounded-lg text-sm font-bold font-mono ${
                  selectedItem && (selectedItem.currentStock - formData.quantity) < 0
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
                value={selectedItem && formData.quantity ? selectedItem.currentStock - formData.quantity : ''}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setView('list')} className="flex-1 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
            <button type="submit" className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── Main Return ──
  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">

      {/* 1. Header Title */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
            <ArrowUpFromLine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-none">
              {view === 'list' ? 'Data Barang Keluar' : 'Entri Data Barang Keluar'}
            </h2>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {view === 'form' ? renderForm() : (
        <>
          {/* 2. Toolbar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
            <button onClick={() => setView('form')} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors">
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
          </div>

          {/* 3. Content Area (Filter + Table) */}
          <div className="flex-1 flex overflow-hidden">

            {/* Left Pane: Filter */}
            {showFilter && (
              <div className="w-[200px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
                <div className="flex justify-between items-center px-3 py-2 bg-slate-100 border-b border-slate-200">
                  <span className="font-bold text-slate-700 text-xs">Filter</span>
                  <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-rose-600 transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-3 flex flex-col gap-4 text-xs text-slate-700">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-800">Cari:</label>
                      {(filterJobReg || filterBarang || filterDate) && (
                        <button onClick={() => { setFilterJobReg(''); setFilterBarang(''); setFilterDate(''); setCurrentPage(1); }} className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline">Reset</button>
                      )}
                    </div>
                    <input type="text" placeholder="< JOB-REG >" value={filterJobReg} onChange={(e) => { setFilterJobReg(e.target.value); setCurrentPage(1); }} className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400" />
                    <input type="text" placeholder="< Nama Barang >" value={filterBarang} onChange={(e) => { setFilterBarang(e.target.value); setCurrentPage(1); }} className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400" />
                    <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 text-slate-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Right Pane: Table */}
            <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
              <div className="flex-1 overflow-auto bg-white border-l border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="px-4 py-2 w-12 text-center border-r border-slate-200">No.</th>
                      <th className="px-4 py-2 border-r border-slate-200">JOB-REG</th>
                      <th className="px-4 py-2 border-r border-slate-200">Tanggal</th>
                      <th className="px-4 py-2 border-r border-slate-200">Barang</th>
                      <th className="px-4 py-2 text-right border-r border-slate-200">Jumlah Keluar</th>
                      <th className="px-4 py-2">Satuan</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-slate-100 ${isRefreshing ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}>
                    {outgoingMovements.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((mov, idx) => {
                      const item = items.find(i => i.id === mov.itemId);
                      return (
                        <tr
                          key={mov.id}
                          onClick={() => setSelectedId(mov.id)}
                          onDoubleClick={() => { setSelectedId(mov.id); handleEdit(); }}
                          className={`transition-colors cursor-pointer ${selectedId === mov.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                        >
                          <td className="px-4 py-2 text-center text-slate-500 border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
                          <td className="px-4 py-2 text-slate-600 border-r border-slate-100">{item?.sku || '-'}</td>
                          <td className="px-4 py-2 text-slate-600 border-r border-slate-100">{new Date(mov.date).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-2 font-medium text-slate-800 border-r border-slate-100">{mov.itemName}</td>
                          <td className="px-4 py-2 text-right text-rose-600 font-semibold border-r border-slate-100">{mov.quantity.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-2 text-slate-600">{item?.unit}</td>
                        </tr>
                      );
                    })}
                    {outgoingMovements.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Tidak ada data transaksi keluar.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span>Tampilkan:</span>
                    <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-1 py-0.5 border border-slate-300 rounded bg-white outline-none">
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="w-px h-3 bg-slate-300"></div>
                  <span>Menampilkan {total === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, total)} dari {total} Baris</span>
                </div>
                <div className="flex items-center gap-1">
                  <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman Sebelumnya"><ChevronLeft className="w-4 h-4" /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-600'}`}>{p}</button>
                  ))}
                  <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman Selanjutnya"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== EDIT MODAL ===== */}
      {editData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Ubah Data Barang Keluar</h2>
                <p className="text-xs text-slate-500 mt-0.5">Perbarui data transaksi barang keluar.</p>
              </div>
              <button onClick={() => setEditData(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">JOB-REG</label>
                  <input type="text" disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" value={editSelectedItem ? editSelectedItem.sku : ''} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal *</label>
                  <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} />
                </div>
              </div>

              <div className="h-px w-full bg-slate-100"></div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Barang *</label>
                  <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm" value={editData.itemId} onChange={e => setEditData({...editData, itemId: e.target.value})}>
                    <option value="">-- Pilih Barang / Jasa --</option>
                    {items.map(i => (<option key={i.id} value={i.id}>{i.sku} - {i.name} {i.type === 'SERVICE' ? '(Jasa)' : ''}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jumlah Keluar *</label>
                  <input required type="number" min="1" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm font-semibold" value={editData.quantity || ''} onChange={e => setEditData({...editData, quantity: Number(e.target.value)})} />
                </div>
              </div>

              <div className="mt-4 flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditData(null)} className="flex-1 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
