import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import type { ItemType } from '../context/InventoryContext';

interface MasterItemFormModalProps {
  onClose: () => void;
}

export const MasterItemFormModal: React.FC<MasterItemFormModalProps> = ({ onClose }) => {
  const { categories, units, customers, addItem } = useInventory();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    customerName: customers?.length > 0 ? customers[0].name : '',
    category: categories.length > 0 ? categories[0].name : '',
    type: 'INVENTORY' as ItemType,
    currentStock: 0,
    minStock: 0,
    unit: units.length > 0 ? units[0].name : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Entri Data Barang Baru</h2>
            <p className="text-xs text-slate-500 mt-0.5">Lengkapi formulir master data di bawah ini.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">JOB-REG *</label>
              <input 
                required
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono text-sm uppercase"
                placeholder="Misal: ENG-01"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipe Barang *</label>
              <select 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as ItemType})}
              >
                <option value="INVENTORY">Inventory (Stok Disimpan)</option>
                <option value="SERVICE">Service (Jasa)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Barang / Jasa *</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
              placeholder="Masukkan nama lengkap barang..."
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Customer *</label>
            <select 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm mb-4"
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
            >
              {customers?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori *</label>
              <select 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Satuan *</label>
              <select 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
              >
                {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className={`grid ${formData.type === 'SERVICE' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{formData.type === 'SERVICE' ? 'Jumlah Unit Servis' : 'Stok Awal'}</label>
              <input 
                type="number" 
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                value={formData.currentStock}
                onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})}
              />
            </div>
            {formData.type !== 'SERVICE' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Batas Stok Minimum</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                  value={formData.minStock}
                  onChange={e => setFormData({...formData, minStock: Number(e.target.value)})}
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan Data
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
