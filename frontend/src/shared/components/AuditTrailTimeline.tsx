import React from 'react';
import { Clock, User, CheckCircle, Edit, FileText, Shield, X } from 'lucide-react';

interface AuditTrailProps {
  documentId: string;
  onClose: () => void;
}

export const AuditTrailTimeline: React.FC<AuditTrailProps> = ({ documentId, onClose }) => {
  // Simulasi data history (Biasanya ditarik dari API Backend / Shadow Table)
  const history = [
    { id: 1, time: '10:05', date: '28 Jun 2026', action: 'CREATED', user: 'Staf A', role: 'STAFF', detail: 'Membuat draft jurnal (Rp 50.000.000)' },
    { id: 2, time: '10:15', date: '28 Jun 2026', action: 'EDITED', user: 'Staf A', role: 'STAFF', detail: 'Mengubah nominal debit dari Rp 45.000.000 menjadi Rp 50.000.000' },
    { id: 3, time: '11:00', date: '28 Jun 2026', action: 'POSTED', user: 'Spv Budi', role: 'SUPERVISOR', detail: 'Memverifikasi dan memposting jurnal ke Buku Besar' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
        <div className="bg-slate-800 text-white px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold">Immutable Audit Trail</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Dokumen:</span>
          <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{documentId}</span>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
            {history.map((log, idx) => (
              <div key={log.id} className="relative pl-6 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}>
                <div className={`absolute -left-[11px] top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center
                  ${log.action === 'CREATED' ? 'bg-blue-500' : log.action === 'EDITED' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                >
                  {log.action === 'CREATED' && <FileText className="w-3 h-3 text-white" />}
                  {log.action === 'EDITED' && <Edit className="w-3 h-3 text-white" />}
                  {log.action === 'POSTED' && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 shadow-sm relative top-[-6px]">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider
                      ${log.action === 'CREATED' ? 'text-blue-700 bg-blue-100' : log.action === 'EDITED' ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100'}`}
                    >
                      {log.action}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                      <Clock className="w-3 h-3" /> {log.time} &bull; {log.date}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-700 mt-2 mb-2 leading-snug">
                    {log.detail}
                  </p>
                  
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{log.user}</span>
                    <span className="text-[10px] text-slate-400 uppercase">({log.role})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
