import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Layers, CheckCircle2, AlertCircle, Hash, History, PlayCircle } from 'lucide-react';

interface SequenceRule {
  id: string;
  documentType: string;
  prefix: string;
  dateFormat: string;
  suffix: string;
  paddingSize: number;
  nextNumber: number;
  resetPeriod: 'NEVER' | 'MONTHLY' | 'YEARLY';
  isActive: boolean;
}

const DEFAULT_SEQUENCES: SequenceRule[] = [
  { id: '1', documentType: 'Jurnal Umum', prefix: 'JV-', dateFormat: '{YYYY}{MM}-', suffix: '', paddingSize: 4, nextNumber: 1, resetPeriod: 'MONTHLY', isActive: true },
  { id: '2', documentType: 'Faktur Penjualan', prefix: 'INV/', dateFormat: '{YYYY}/{MM}/', suffix: '/RNF', paddingSize: 5, nextNumber: 142, resetPeriod: 'YEARLY', isActive: true },
  { id: '3', documentType: 'Penerimaan Kas', prefix: 'CR-', dateFormat: '', suffix: '', paddingSize: 6, nextNumber: 1024, resetPeriod: 'NEVER', isActive: true },
];

export const SequenceConfiguration: React.FC = () => {
  const [sequences, setSequences] = useState<SequenceRule[]>(DEFAULT_SEQUENCES);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_SEQUENCES[0].id);

  const selectedRule = sequences.find(s => s.id === selectedId)!;

  const updateRule = (field: keyof SequenceRule, value: any) => {
    setSequences(prev => prev.map(s => s.id === selectedId ? { ...s, [field]: value } : s));
  };

  const handleSave = () => {
    alert("Konfigurasi Sequence Berhasil Disimpan!\nSistem akan menggunakan format baru ini untuk penomoran dokumen selanjutnya.");
  };

  // Preview Generator
  const generatePreview = (rule: SequenceRule) => {
    const today = new Date();
    const yyyy = today.getFullYear().toString();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    
    let dateStr = rule.dateFormat;
    dateStr = dateStr.replace('{YYYY}', yyyy);
    dateStr = dateStr.replace('{YY}', yyyy.slice(-2));
    dateStr = dateStr.replace('{MM}', mm);
    dateStr = dateStr.replace('{DD}', dd);

    const paddedNumber = rule.nextNumber.toString().padStart(rule.paddingSize, '0');

    return `${rule.prefix}${dateStr}${paddedNumber}${rule.suffix}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      
      {/* Header Panel */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-[100%] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sequences & Identifiers</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Konfigurasi format otomatis penomoran dokumen *Enterprise*</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-blue-500/50"
          >
            <Save className="w-4 h-4" /> Simpan Konfigurasi
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        
        {/* Left List (Master Data Types) */}
        <div className="w-80 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden shrink-0">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Tipe Dokumen</span>
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{sequences.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {sequences.map(seq => (
              <button 
                key={seq.id}
                onClick={() => setSelectedId(seq.id)}
                className={`flex flex-col text-left px-3 py-3 rounded-lg transition-all duration-200 group relative
                  ${selectedId === seq.id 
                    ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                    : 'hover:bg-slate-50 border border-transparent'}`}
              >
                {selectedId === seq.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-md" />
                )}
                <span className={`font-bold text-sm ${selectedId === seq.id ? 'text-blue-800' : 'text-slate-700'}`}>
                  {seq.documentType}
                </span>
                <span className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 opacity-70" /> {generatePreview(seq)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Detail (Config Form) */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{selectedRule.documentType}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedRule.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <CheckCircle2 className="w-3 h-3" /> {selectedRule.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-slate-400 text-xs">|</span>
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Reset: {selectedRule.resetPeriod}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Live Preview Banner */}
            <div className="col-span-2 mb-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Live Preview</label>
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xl shadow-slate-900/10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                <span className="font-mono text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-wider">
                  {generatePreview(selectedRule)}
                </span>
              </div>
            </div>

            {/* Prefix */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                Prefix
                <span className="text-[10px] font-normal text-slate-400 normal-case bg-slate-100 px-1.5 py-0.5 rounded">Teks Awal</span>
              </label>
              <input 
                type="text" 
                value={selectedRule.prefix}
                onChange={(e) => updateRule('prefix', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="Misal: JV-"
              />
            </div>

            {/* Suffix */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                Suffix
                <span className="text-[10px] font-normal text-slate-400 normal-case bg-slate-100 px-1.5 py-0.5 rounded">Teks Akhir</span>
              </label>
              <input 
                type="text" 
                value={selectedRule.suffix}
                onChange={(e) => updateRule('suffix', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="Misal: /RNF"
              />
            </div>

            {/* Date Format */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                Format Tanggal
                <span className="text-[10px] font-normal text-slate-400 normal-case bg-slate-100 px-1.5 py-0.5 rounded">Variabel Dinamis</span>
              </label>
              <input 
                type="text" 
                value={selectedRule.dateFormat}
                onChange={(e) => updateRule('dateFormat', e.target.value)}
                className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-lg text-sm font-mono font-bold text-amber-800 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                placeholder="{YYYY}{MM}-"
              />
              <p className="text-[10px] text-slate-500 mt-1">Variabel: <code className="bg-slate-100 text-slate-700 px-1 rounded">{'{YYYY}'}</code>, <code className="bg-slate-100 text-slate-700 px-1 rounded">{'{MM}'}</code>, <code className="bg-slate-100 text-slate-700 px-1 rounded">{'{DD}'}</code></p>
            </div>

            {/* Padding Size & Next Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Panjang Digit</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  value={selectedRule.paddingSize}
                  onChange={(e) => updateRule('paddingSize', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-center"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nomor Berikutnya</label>
                <input 
                  type="number" 
                  min="1"
                  value={selectedRule.nextNumber}
                  onChange={(e) => updateRule('nextNumber', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-sm font-mono font-bold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-center"
                />
              </div>
            </div>

            <div className="col-span-2 pt-6 border-t border-slate-100 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[13px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Perhatian:</span> Mengubah format Sequence untuk dokumen yang sudah berjalan mungkin akan menyebabkan loncatan nomor urut. Pastikan Anda melakukan ini saat pergantian bulan/tahun fiskal sesuai kebijakan akuntansi <i>Enterprise</i> Anda.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
