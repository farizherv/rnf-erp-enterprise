import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Calendar, Repeat, PlayCircle, AlertCircle } from 'lucide-react';

interface RecurringJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherNo: string;
  onSaveSchedule: (scheduleDetails: any) => void;
}

export const RecurringJournalModal: React.FC<RecurringJournalModalProps> = ({ isOpen, onClose, voucherNo, onSaveSchedule }) => {
  const [frequency, setFrequency] = useState('MONTHLY');
  const [interval, setInterval] = useState(1);
  const [endDateType, setEndDateType] = useState<'NONE'|'DATE'|'COUNT'>('NONE');
  const [endDate, setEndDate] = useState('');
  const [endCount, setEndCount] = useState(12);
  const [statusAction, setStatusAction] = useState('POSTED');

  const handleSave = () => {
    onSaveSchedule({
      frequency, interval, endDateType, endDate, endCount, statusAction
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Jadwalkan Transaksi Berulang" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-6 p-1">
        {/* Header Alert */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <Repeat className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-blue-900">Automasi Jurnal (Recurring)</h4>
            <p className="text-[13px] text-blue-800/80 mt-1 leading-relaxed">
              Sistem ERP akan secara otomatis menduplikasi dan mengeksekusi Jurnal <span className="font-bold">{voucherNo}</span> sesuai dengan jadwal yang Anda tentukan di bawah ini.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column: Frequency & Interval */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Frekuensi Eksekusi</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm"
              >
                <option value="DAILY">Harian (Daily)</option>
                <option value="WEEKLY">Mingguan (Weekly)</option>
                <option value="MONTHLY">Bulanan (Monthly)</option>
                <option value="YEARLY">Tahunan (Yearly)</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Interval (Setiap)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1"
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  className="w-24 px-3 py-2.5 border border-slate-300 rounded-md text-sm font-bold text-slate-800 text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
                />
                <span className="text-sm text-slate-600">
                  {frequency === 'DAILY' ? 'Hari' : frequency === 'WEEKLY' ? 'Minggu' : frequency === 'MONTHLY' ? 'Bulan' : 'Tahun'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Aksi Saat Dieksekusi</label>
              <select 
                value={statusAction}
                onChange={(e) => setStatusAction(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
              >
                <option value="DRAFT">Hanya Buat Draft (Menunggu Review)</option>
                <option value="POSTED">Langsung Posting (Otomatis)</option>
              </select>
            </div>
          </div>

          {/* Right Column: Stop Condition */}
          <div className="flex flex-col gap-5 border-l border-slate-200 pl-6">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Kondisi Berhenti (End Date)</label>
            
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex items-center h-5">
                  <input type="radio" name="endDateType" checked={endDateType === 'NONE'} onChange={() => setEndDateType('NONE')} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">Terus Menerus</span>
                  <span className="text-[11px] text-slate-500">Tidak akan berhenti sampai dibatalkan manual.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex items-center h-5">
                  <input type="radio" name="endDateType" checked={endDateType === 'DATE'} onChange={() => setEndDateType('DATE')} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors mb-1.5">Hingga Tanggal</span>
                  {endDateType === 'DATE' && (
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm animate-in fade-in zoom-in-95 duration-200" 
                    />
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex items-center h-5">
                  <input type="radio" name="endDateType" checked={endDateType === 'COUNT'} onChange={() => setEndDateType('COUNT')} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors mb-1.5">Setelah Beberapa Kali</span>
                  {endDateType === 'COUNT' && (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                      <input 
                        type="number" 
                        min="1"
                        value={endCount}
                        onChange={(e) => setEndCount(Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-md text-sm font-bold text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm" 
                      />
                      <span className="text-sm text-slate-600">Eksekusi</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-4 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200/50">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[11px] font-medium">Jadwal pertama dimulai besok.</span>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-slate-200">
              Batal
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500/50 hover:shadow-md">
              <PlayCircle className="w-4 h-4" /> Simpan Jadwal
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
