import React, { useState } from 'react';
import { Calendar as CalendarIcon, FileText, ListChecks, Clock, SaveAll, CheckCircle2 } from 'lucide-react';

export const RecurringMaster: React.FC = () => {
  const [recurringConfig, setRecurringConfig] = useState({ 
    isActive: true,
    reference: '',
    description: '',
    assignInvoiceNo: true,
    frequency: 'Bulanan', 
    interval: 1, 
    nextDate: '2026-07-04' 
  });

  const recurringHistory = [
    { no: 1, date: '2026-06-04', formNo: 'JV-202606-0001', desc: 'Sewa Gedung Bulan Juni 2026', amount: 25000000, isExecuted: true },
    { no: 2, date: '2026-07-04', formNo: '-', desc: 'Sewa Gedung Bulan Juli 2026', amount: 25000000, isExecuted: false },
    { no: 3, date: '2026-08-04', formNo: '-', desc: 'Sewa Gedung Bulan Agustus 2026', amount: 25000000, isExecuted: false },
    { no: 4, date: '2026-09-04', formNo: '-', desc: 'Sewa Gedung Bulan September 2026', amount: 25000000, isExecuted: false },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-slate-100/50 overflow-hidden">
      <div className="flex flex-col flex-1 w-full min-h-0 p-2 pb-4 md:p-3 md:pb-6">
        <div className="flex flex-col flex-1 bg-white border border-slate-200 rounded-xl shadow-sm min-h-0 overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="flex justify-between items-center shrink-0 border-b border-slate-200 px-6 pt-6 pb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-1">
                <span className="text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">Buku Besar</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-700">Pengaturan Jadwal Berulang</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Jadwal Berulang</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors flex items-center gap-2">
                <SaveAll className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          </div>

          {/* BODY SECTION */}
          <div className="flex-1 overflow-hidden p-6 flex flex-col gap-4">
            
            {/* Control & Scheduler Section */}
            <div className="grid grid-cols-3 gap-6 shrink-0">
          {/* Left Column: Admin Controls */}
          <div className="col-span-2 flex flex-col gap-4 bg-slate-50 p-5 rounded-lg border border-slate-200">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" /> Kontrol Administratif
            </h4>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nomor Referensi</label>
                <input 
                  type="text" 
                  value={recurringConfig.reference}
                  onChange={e => setRecurringConfig({...recurringConfig, reference: e.target.value})}
                  placeholder="Contoh: KONTRAK-SEWA-01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow bg-white"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Status & Penomoran</label>
                <div className="flex items-center gap-4 h-full pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ease-in-out ${recurringConfig.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setRecurringConfig({...recurringConfig, isActive: !recurringConfig.isActive})}>
                      <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${recurringConfig.isActive ? 'translate-x-6' : 'translate-x-1'}`}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{recurringConfig.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </label>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4.5 h-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 transition-colors" checked={recurringConfig.assignInvoiceNo} onChange={e => setRecurringConfig({...recurringConfig, assignInvoiceNo: e.target.checked})} />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Auto-Numbering</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Keterangan / Deskripsi</label>
                <input 
                  type="text" 
                  value={recurringConfig.description}
                  onChange={e => setRecurringConfig({...recurringConfig, description: e.target.value})}
                  placeholder="Catatan untuk jadwal berulang ini..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Scheduler */}
          <div className="col-span-1 flex flex-col gap-4 bg-blue-50 p-5 rounded-lg border border-blue-200">
            <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 border-b border-blue-200 pb-2 mb-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" /> Jadwal Eksekusi (Otomatis)
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-blue-800 uppercase tracking-wide">Frekuensi & Interval</label>
                <div className="flex gap-2">
                  <select 
                    value={recurringConfig.frequency}
                    onChange={e => setRecurringConfig({...recurringConfig, frequency: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-shadow"
                  >
                    <option value="Harian">Harian</option>
                    <option value="Mingguan">Mingguan</option>
                    <option value="Bulanan">Bulanan</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                  <input 
                    type="number" 
                    value={recurringConfig.interval}
                    onChange={e => setRecurringConfig({...recurringConfig, interval: parseInt(e.target.value) || 1})}
                    className="w-20 px-3 py-2 border border-blue-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-center transition-shadow"
                    title="Interval"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-xs font-bold text-blue-800 uppercase tracking-wide">Tanggal Eksekusi Berikutnya</label>
                <input 
                  type="date" 
                  value={recurringConfig.nextDate}
                  onChange={e => setRecurringConfig({...recurringConfig, nextDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm font-mono transition-shadow"
                />
              </div>
            </div>
          </div>
        </div>

            {/* BODY SECTION: History Table */}
            <div className="flex flex-col flex-1 min-h-0 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ListChecks className="w-4.5 h-4.5 text-slate-500" /> Histori & Rencana Eksekusi
            </h4>
            <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded shadow-sm">Total: 12 Siklus</span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-slate-500 bg-slate-50 uppercase font-bold tracking-wider sticky top-0 z-10 shadow-[0_1px_0_rgba(203,213,225,1)]">
                <tr>
                  <th className="px-5 py-3 w-16 text-center">No</th>
                  <th className="px-5 py-3 w-32">Tanggal</th>
                  <th className="px-5 py-3 w-48">Form / Invoice No</th>
                  <th className="px-5 py-3">Deskripsi Eksekusi</th>
                  <th className="px-5 py-3 w-40 text-right">Nilai Jurnal</th>
                  <th className="px-5 py-3 w-36 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recurringHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-5 py-3 text-center font-mono text-sm text-slate-400">{row.no}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{row.date}</td>
                    <td className="px-5 py-3">
                      {row.isExecuted ? (
                        <span className="font-mono text-blue-600 font-semibold cursor-pointer hover:underline hover:text-blue-800 transition-colors">{row.formNo}</span>
                      ) : (
                        <span className="text-slate-300 italic">Belum Dibuat</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{row.desc}</td>
                    <td className="px-5 py-3 text-right font-mono font-medium text-slate-800">{formatCurrency(row.amount)}</td>
                    <td className="px-5 py-3 text-center">
                      {row.isExecuted ? (
                        <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 w-full rounded-md text-[11px] font-bold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> EXECUTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 w-full rounded-md text-[11px] font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Dummy future row */}
                <tr className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3 text-center font-mono text-sm text-slate-400">5</td>
                  <td className="px-5 py-3 font-medium text-slate-800">2026-10-04</td>
                  <td className="px-5 py-3"><span className="text-slate-300 italic">Belum Dibuat</span></td>
                  <td className="px-5 py-3 text-slate-600">Sewa Gedung Bulan Oktober 2026</td>
                  <td className="px-5 py-3 text-right font-mono font-medium text-slate-800">{formatCurrency(25000000)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 w-full rounded-md text-[11px] font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                      <Clock className="w-3 h-3" /> PENDING
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
