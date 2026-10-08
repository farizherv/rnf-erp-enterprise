import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bookmark, Trash2 } from 'lucide-react';

interface LoadPresetModalProps {
  onClose: () => void;
  onLoad: (preset: any) => void;
}

export const LoadPresetModal: React.FC<LoadPresetModalProps> = ({ onClose, onLoad }) => {
  const [presets, setPresets] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('rnf_report_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse presets', e);
      }
    }
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newPresets = presets.filter(p => p.id !== id);
    setPresets(newPresets);
    localStorage.setItem('rnf_report_presets', JSON.stringify(newPresets));
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white border border-slate-200 rounded-xl shadow-2xl w-[600px] flex flex-col overflow-hidden font-sans transform transition-all animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-white px-5 py-3.5 flex justify-between items-center select-none border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="bg-blue-50 p-1.5 rounded-md">
              <Bookmark className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-[15px] font-bold tracking-tight">Muat Format Laporan</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-md transition-colors">
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 bg-slate-50/50 min-h-[300px] max-h-[500px] overflow-y-auto">
          {presets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <Bookmark className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-[14px] font-bold text-slate-500">Belum ada Format tersimpan</p>
              <p className="text-[12px] text-slate-400 max-w-[250px] mt-1">Silakan gunakan fitur "Simpan Format" terlebih dahulu untuk menyimpan konfigurasi laporan.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onLoad(preset.config)}
                  className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col">
                    <h3 className="text-[14px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{preset.name}</h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">{preset.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{preset.config.chartType.toUpperCase()}</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{preset.config.measure}</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{preset.config.dimension}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, preset.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                    title="Hapus Format"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
