import React, { useState } from 'react';
import { X, Search, CheckCircle2, Box, Hammer } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface StockAdjustmentModalProps {
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ onClose }) => {
  const { items, issueStock } = useInventory();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('Job Reg #');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedItem = items.find(i => i.id === selectedItemId);
  const remainingStock = selectedItem ? selectedItem.currentStock - quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0) return;
    
    // Auto-sync real-time dispatch!
    issueStock(selectedItemId, quantity, reference, date);
    setIsSuccess(true);
    
    // Auto close after 1.5s
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-none">Penyesuaian Job Reg (Pemakaian)</h2>
              <p className="text-xs text-slate-500 mt-1">Keluarkan barang untuk operasional / produksi</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Tersinkronisasi!</h3>
            <p className="text-slate-500 text-center">Stok telah terpotong dan mutasi berhasil dicatat.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Tanggal</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Referensi (Job Reg)</label>
                <input 
                  type="text" 
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="Cth: Job Reg #1042"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Pilih Barang</label>
              <select 
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                required
              >
                <option value="">-- Pilih Barang --</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    [{item.sku}] {item.name} - (Sisa: {item.currentStock} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500">Stok Saat Ini</span>
                  <span className="text-lg font-bold text-slate-800">{selectedItem.currentStock} {selectedItem.unit}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500">Jumlah Keluar</span>
                  <input 
                    type="number" 
                    min="1"
                    max={selectedItem.currentStock}
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-2 py-1 mt-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 font-bold text-red-600 outline-none"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500">Sisa Stok</span>
                  <span className={`text-lg font-bold ${remainingStock < selectedItem.minStock ? 'text-red-600' : 'text-emerald-600'}`}>
                    {remainingStock} {selectedItem.unit}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={!selectedItemId || quantity <= 0 || quantity > (selectedItem?.currentStock || 0)}
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keluarkan Barang
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
