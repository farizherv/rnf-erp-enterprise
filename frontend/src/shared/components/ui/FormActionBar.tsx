import React from 'react';
import { SaveAll, Save, X } from 'lucide-react';

interface FormActionBarProps {
  onCancel: () => void;
  onSaveAndNew?: () => void;
  onSaveAndClose?: () => void;
  isSaveDisabled?: boolean;
  saveAndNewText?: string;
  saveAndCloseText?: string;
  cancelText?: string;
}

export const FormActionBar: React.FC<FormActionBarProps> = ({
  onCancel,
  onSaveAndNew,
  onSaveAndClose,
  isSaveDisabled = false,
  saveAndNewText = 'Simpan & Baru',
  saveAndCloseText = 'Simpan & Tutup',
  cancelText = 'Batal',
}) => {
  return (
    <div className="w-full px-2 md:px-3 pb-2 md:pb-3 shrink-0">
      <div className="bg-slate-100/80 backdrop-blur-sm border border-slate-200 rounded-b-xl px-6 py-3 flex items-center justify-between shadow-sm relative z-40">
        <div className="flex items-center">
          {/* Ruang untuk indikator status dokumen di masa depan */}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-md text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <X className="w-3.5 h-3.5 text-slate-400" /> {cancelText}
          </button>
          
          {onSaveAndNew && (
            <button
              onClick={onSaveAndNew}
              type="button"
              disabled={isSaveDisabled}
              className={`px-4 py-2 rounded-md text-xs font-bold border flex items-center gap-1.5 transition-all shadow-sm ${
                !isSaveDisabled
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
              }`}
            >
              <SaveAll className="w-3.5 h-3.5 text-slate-500" />
              {saveAndNewText}
            </button>
          )}

          {onSaveAndClose && (
            <button
              onClick={onSaveAndClose}
              type="button"
              disabled={isSaveDisabled}
              className={`px-6 py-2 rounded-md text-xs font-bold border flex items-center gap-1.5 transition-all shadow-sm ${
                !isSaveDisabled
                  ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-blue-200/50'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              {saveAndCloseText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
