import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save as SaveIcon, Bookmark, AlertTriangle } from 'lucide-react';

interface MemorizeReportModalProps {
  currentReportName: string;
  onClose: () => void;
  onSave: (reportName: string, reportTitle: string) => void;
}

export const MemorizeReportModal: React.FC<MemorizeReportModalProps> = ({ currentReportName, onClose, onSave }) => {
  const [reportName, setReportName] = useState(currentReportName);
  const [reportTitle, setReportTitle] = useState(currentReportName);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  // Enterprise standard date-time formatting: DD/MM/YYYY HH:MM AM/PM
  const formatDateTimeAMPM = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day}/${month}/${year} ${timeStr}`;
  };

  const [existingReports, setExistingReports] = useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('rnf_report_presets');
    if (saved) {
      try { setExistingReports(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleSaveAttempt = () => {
    const exists = existingReports.some(r => r.name.toLowerCase() === reportName.toLowerCase());
    if (exists) {
      setShowOverwriteConfirm(true);
    } else {
      executeSave();
    }
  };

  const executeSave = () => {
    const newPreset = {
      id: Date.now().toString(),
      name: reportName,
      title: reportTitle,
      lastModified: formatDateTimeAMPM(new Date()),
      // config will be attached by parent
    };
    
    // Check for overwrite
    let updated = [...existingReports];
    const existingIndex = updated.findIndex(r => r.name.toLowerCase() === reportName.toLowerCase());
    if (existingIndex >= 0) {
      newPreset.id = updated[existingIndex].id; // Keep same ID
      updated[existingIndex] = newPreset;
    } else {
      updated.push(newPreset);
    }
    
    onSave(reportName, reportTitle);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white border border-slate-200 rounded-xl shadow-2xl w-[750px] flex flex-col overflow-hidden font-sans transform transition-all">
        
        {/* Overwrite Confirmation Overlay */}
        {showOverwriteConfirm && (
          <div className="absolute inset-0 z-[50] flex items-center justify-center bg-transparent animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-[420px] p-6 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-500" strokeWidth={2.5} />
              </div>
              <h3 className="text-[16px] font-bold text-slate-800 mb-2 tracking-tight">Format Sudah Ada</h3>
              <p className="text-[13px] text-slate-600 mb-6 leading-relaxed">
                Format laporan dengan nama <span className="font-bold text-slate-800">"{reportName}"</span> sudah ada di database. Apakah Anda yakin ingin menimpanya?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowOverwriteConfirm(false)} 
                  className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-md hover:bg-slate-50 transition-colors text-[13px]"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    setShowOverwriteConfirm(false);
                    onSave(reportName, reportTitle);
                  }} 
                  className="flex-1 px-4 py-2 bg-amber-500 text-white font-bold rounded-md hover:bg-amber-600 transition-colors shadow-sm text-[13px]"
                >
                  Ya, Timpa Format
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header - Modern Clean Style */}
        <div className="bg-white px-5 py-3.5 flex justify-between items-center select-none border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="bg-blue-50 p-1.5 rounded-md">
              <Bookmark className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-[15px] font-bold tracking-tight">Simpan Format Laporan</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-md transition-colors">
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5 bg-slate-50/50">
          
          {/* Data Grid Area */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm h-[200px] flex flex-col select-none overflow-hidden">
            {/* Grid Header */}
            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <div className="col-span-5 px-4 py-2.5 text-[12px] font-bold text-slate-600 border-r border-slate-200 flex items-center">Nama Format</div>
              <div className="col-span-4 px-4 py-2.5 text-[12px] font-bold text-slate-600 border-r border-slate-200 flex items-center">Judul Laporan</div>
              <div className="col-span-3 px-4 py-2.5 text-[12px] font-bold text-slate-600 flex items-center justify-center text-center">Terakhir Diubah</div>
            </div>
            
            {/* Grid Rows */}
            <div className="overflow-y-auto flex-1 flex flex-col custom-scrollbar">
              {existingReports.map((row, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedRowIndex(idx)}
                  className={`grid grid-cols-12 cursor-pointer text-[13px] border-b border-slate-100 last:border-b-0 shrink-0 transition-colors
                    ${selectedRowIndex === idx ? 'bg-blue-50/80 text-blue-800' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <div className={`col-span-5 px-4 py-2.5 border-r border-slate-100 flex items-start font-medium leading-snug break-words pr-2`}>{row.name}</div>
                  <div className={`col-span-4 px-4 py-2.5 border-r border-slate-100 flex items-start leading-snug break-words pr-2`}>{row.title}</div>
                  <div className="col-span-3 px-4 py-2.5 text-center flex items-start justify-center text-slate-500 text-[11.5px] pt-3">{row.lastModified}</div>
                </div>
              ))}
              {/* Empty space filler */}
              <div className="flex-1 bg-transparent cursor-default" onClick={() => setSelectedRowIndex(null)}></div>
            </div>
          </div>

          {/* Form and Actions Area */}
          <div className="grid grid-cols-12 gap-5">
            
            {/* Input Fields */}
            <div className="col-span-9 flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-600 flex justify-between items-end">
                  <span>Nama Format</span>
                  <span className="text-[10px] font-normal text-slate-400 font-mono">{reportName.length}/100</span>
                </label>
                <input 
                  type="text" 
                  maxLength={100}
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] font-medium text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-shadow shadow-sm"
                  placeholder="Contoh: Balance Sheet (Direksi)"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-600 flex justify-between items-end">
                  <span>Judul Laporan</span>
                  <span className="text-[10px] font-normal text-slate-400 font-mono">{reportTitle.length}/150</span>
                </label>
                <input 
                  type="text" 
                  maxLength={150}
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] font-medium text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-shadow shadow-sm"
                  placeholder="Judul yang dicetak di kertas"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="col-span-3 flex flex-col justify-end gap-2.5">
              <button 
                onClick={handleSaveAttempt}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[13px] font-bold transition-colors shadow-sm"
              >
                <SaveIcon className="w-4 h-4" />
                Simpan
              </button>
              <button 
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md text-[13px] font-bold transition-colors shadow-sm"
              >
                Batal
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
