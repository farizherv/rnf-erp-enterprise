import React from 'react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { ComboBoxSelect } from '../../../../shared/components/ui/ComboBoxSelect';
import { ACCOUNT_TYPE_OPTIONS, CURRENCY_OPTIONS } from '../../data/coaInitialData';
import type { Account } from '../../types/coa';

interface COAFormModalProps {
  isNewAccountModalOpen: boolean;
  setIsNewAccountModalOpen: (val: boolean) => void;
  editingAccountId: string | null;
  newAccount: any;
  setNewAccount: (val: any) => void;
  accounts: Account[];
  handleSaveAccount: () => void;
}

export const COAFormModal: React.FC<COAFormModalProps> = ({
  isNewAccountModalOpen,
  setIsNewAccountModalOpen,
  editingAccountId,
  newAccount,
  setNewAccount,
  accounts,
  handleSaveAccount
}) => {
  const PARENT_OPTIONS = [
    { value: '', label: '-- Tanpa Induk (Root) --' },
    ...accounts
      .filter(a => a.isHeader)
      .map(a => ({ value: a.id, label: `[${a.code}] ${a.name}` }))
  ];

  return (
    <Modal
      isOpen={isNewAccountModalOpen}
      onClose={() => setIsNewAccountModalOpen(false)}
      title={editingAccountId ? "Ubah Akun" : "Buat Akun Baru"}
      maxWidth="max-w-xl"
      overflowVisible={true}
    >
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">Sifat Akun</h4>
            <p className="text-xs text-slate-500">Tentukan apakah akun ini adalah Grup (Header) atau Akun Transaksi (Detail).</p>
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-md border border-slate-200 shrink-0">
            <button 
              onClick={() => setNewAccount({ ...newAccount, isHeader: false })}
              className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-colors ${!newAccount.isHeader ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Detail
            </button>
            <button 
              onClick={() => setNewAccount({ ...newAccount, isHeader: true })}
              className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-colors ${newAccount.isHeader ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Header
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kode Akun <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={newAccount.code}
              onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Contoh: 1104"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mata Uang</label>
            <ComboBoxSelect
              options={CURRENCY_OPTIONS}
              value={newAccount.currency}
              onChange={(val) => setNewAccount({ ...newAccount, currency: val })}
              placeholder="Pilih Mata Uang..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Akun <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={newAccount.name}
            onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Contoh: Bank BNI USD"
          />
        </div>

        {!newAccount.isHeader && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipe Akun (Sub-Klasifikasi)</label>
            <ComboBoxSelect
              options={ACCOUNT_TYPE_OPTIONS}
              value={newAccount.type}
              onChange={(val) => setNewAccount({ ...newAccount, type: val })}
              placeholder="Pilih Tipe Akun..."
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Induk Akun (Parent) - Opsional</label>
          <ComboBoxSelect
            options={PARENT_OPTIONS}
            value={newAccount.parentId}
            onChange={(val) => setNewAccount({ ...newAccount, parentId: val })}
            placeholder="-- Tanpa Induk (Root) --"
          />
          <p className="text-[10px] text-slate-500 mt-1">Pilih akun Header jika Anda ingin akun ini berada di dalam grup tertentu.</p>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex items-center justify-end gap-2">
        <button 
          onClick={() => setIsNewAccountModalOpen(false)}
          className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-md shadow-sm transition-colors"
        >
          Batal
        </button>
        <button 
          onClick={handleSaveAccount}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors shadow-blue-200/50"
        >
          Simpan Akun
        </button>
      </div>
    </Modal>
  );
};
