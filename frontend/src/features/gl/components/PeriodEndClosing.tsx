import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle, AlertTriangle, Calculator, Lock, 
  ChevronRight, RefreshCw, FileWarning, ShieldCheck,
  TrendingUp, CalendarCheck, XCircle, ArrowRight, Factory, Unlock, MapPin
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';

type WizardStep = 'VALIDATION' | 'REVALUATION' | 'ALLOCATION' | 'EARNINGS' | 'LOCK';

const STEPS = [
  { id: 'VALIDATION', title: 'Validasi Jurnal', icon: FileWarning },
  { id: 'REVALUATION', title: 'Revaluasi Mata Uang', icon: RefreshCw },
  { id: 'ALLOCATION', title: 'Alokasi Produksi', icon: Factory },
  { id: 'EARNINGS', title: 'Kalkulasi Laba Ditahan', icon: Calculator },
  { id: 'LOCK', title: 'Penguncian Periode', icon: Lock }
];

export const PeriodEndClosing: React.FC = () => {
  const { canLockPeriod, role, branch } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('VALIDATION');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());
  
  // Period Selection State
  const [isPeriodSelected, setIsPeriodSelected] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('06');
  const [selectedYear, setSelectedYear] = useState('2026');
  
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  // Dummy Data for Step 1
  const draftJournals = [
    { no: 'JV-202606-0089', date: '2026-06-28', desc: 'Pembayaran Utang Vendor PT Makmur', amount: 50000000 },
    { no: 'JV-202606-0102', date: '2026-06-29', desc: 'Penyusutan Aset Kendaraan', amount: 12500000 },
  ];

  // Dummy Data for Step 2
  const revaluations = [
    { currency: 'USD', account: '1101 - Bank Mandiri USD', originalRate: 15500, endRate: 16200, balance: 10000, unrealized: 7000000 },
    { currency: 'SGD', account: '1202 - Piutang Usaha SGD', originalRate: 11500, endRate: 11800, balance: 5000, unrealized: 1500000 },
  ];

  // Dummy Data for Step 3
  const [allocations, setAllocations] = useState([
    { id: 1, account: '6300 - Biaya Gaji/Upah Karya', actual: 45000000, percent: 100 },
    { id: 2, account: '6400 - Beban Listrik Pabrik', actual: 12500000, percent: 80 },
  ]);

  const handleUpdatePercent = (id: number, val: string) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setAllocations(prev => prev.map(a => a.id === id ? { ...a, percent: num } : a));
  };

  const handleAutoCalc = () => {
    // Simulasi Auto Calc (misalnya menyelaraskan dengan % penyelesaian SPK)
    setAllocations(prev => prev.map(a => ({ ...a, percent: 100 })));
  };

  const totalAllocated = allocations.reduce((sum, a) => sum + (a.actual * a.percent / 100), 0);

  const handleDownloadAuditReport = () => {
    const dummyContent = `====================================================\nBERITA ACARA TUTUP BUKU (AUDIT SNAPSHOT)\nRNF ERP ENTERPRISE EDITION\n====================================================\n\nPeriode Fiskal: ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}\nLokasi Cabang : ${branch.replace('_', ' ')}\nStatus        : TERKUNCI PERMANEN (HARD-CLOSE)\n\nDieksekusi Oleh : ${role}\nTimestamp       : ${new Date().toLocaleString('id-ID')}\n\n----------------------------------------------------\nRINGKASAN KONSOLIDASI:\n- Validasi Jurnal DRAFT : Tervalidasi\n- Revaluasi Mata Uang   : Tersinkronisasi\n- Alokasi Produksi      : Rp ${totalAllocated.toLocaleString('id-ID')}\n- Laba Bersih Berjalan  : Rp ${(288500000 + totalAllocated).toLocaleString('id-ID')}\n----------------------------------------------------\n\n* Dokumen ini di-generate secara otomatis oleh sistem.\n* Segel Audit (Simulasi): RNF-${Math.random().toString(36).substring(2, 12).toUpperCase()}\n`;
    
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Berita_Acara_${monthNames[parseInt(selectedMonth) - 1]}_${selectedYear}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [batchLogs, setBatchLogs] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);

  // Modal State for Undo Closing
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);

  const handleExecuteUnlock = async () => {
    setIsUnlocking(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 2500));
    setIsUnlocking(false);
    setUnlockSuccess(true);
    // Close modal after showing success
    await new Promise(r => setTimeout(r, 2000));
    setShowUnlockModal(false);
    setUnlockSuccess(false);
    // Reset to June to simulate reopening
    setSelectedMonth('06');
  };

  const simulateBatchLog = async (logs: string[]) => {
    setShowTerminal(true);
    setBatchLogs([]);
    for (const log of logs) {
      await new Promise(r => setTimeout(r, Math.random() * 500 + 300));
      setBatchLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID')}] ${log}`]);
    }
    await new Promise(r => setTimeout(r, 800));
    setShowTerminal(false);
  };

  const handleNext = async () => {
    setIsProcessing(true);
    
    let logs: string[] = [];
    if (currentStep === 'VALIDATION') {
      logs = [
        "Memulai Validasi Jurnal DRAFT...",
        "Memindai 1.240 baris transaksi General Ledger...",
        "Mengubah status DRAFT menjadi POSTED...",
        "Sinkronisasi buku besar pembantu (Subledger)...",
        "Validasi Jurnal Selesai. DB_COMMIT: OK"
      ];
    } else if (currentStep === 'LOCK') {
      logs = [
        "Inisialisasi prosedur Soft-Close...",
        "Menjalankan Jurnal Pembalik otomatis (Reversing Entries)...",
        "Mengkalkulasi ulang Mutasi Saldo Akhir...",
        "Mengunci Modul Operasional (AP, AR, INV)...",
        "Menyegel Periode Finansial. SECURE_LOCK: OK"
      ];
    } else {
      logs = [
        "Mempersiapkan kalkulasi Batch Job...",
        "Mengeksekusi Formula Alokasi Latar Belakang...",
        "Membuat Dokumen Jurnal Otomatis...",
        "Menyimpan ke Database... OK"
      ];
    }

    await simulateBatchLog(logs);
    
    setIsProcessing(false);
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    
    if (currentStep === 'VALIDATION') setCurrentStep('REVALUATION');
    else if (currentStep === 'REVALUATION') setCurrentStep('ALLOCATION');
    else if (currentStep === 'ALLOCATION') setCurrentStep('EARNINGS');
    else if (currentStep === 'EARNINGS') setCurrentStep('LOCK');
  };

  const StepIndicator = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm shrink-0 mb-3">
      <div className="flex items-center justify-between py-6 px-6 md:px-10">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.has(step.id as WizardStep);
          
          return (
            <React.Fragment key={step.id}>
              <div className={`flex flex-col items-center gap-2 ${isActive ? 'opacity-100' : isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive ? 'border-blue-600 bg-white text-blue-600 shadow-md ring-4 ring-blue-50' : 
                    isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 
                    'border-slate-300 bg-slate-50 text-slate-400'}`}
                >
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-700' : isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-slate-200 relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-100/50 font-sans animate-in fade-in duration-300">

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full min-h-0 px-2 pt-2 md:px-3 md:pt-3">
        
        {isPeriodSelected && <StepIndicator />}

        <div className="flex flex-col flex-1 bg-white border-x border-t border-slate-200 rounded-t-xl shadow-sm min-h-0">

          <div className="p-6 flex-1 flex flex-col overflow-y-auto min-h-0">
            {!isPeriodSelected && (
              <div className="flex flex-col gap-10 py-4 px-2 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col md:flex-row gap-8">
                {/* Left side: Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Tutup Buku Akhir Bulan (Period End Closing)</h2>
                  
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed max-w-sm">
                    Silakan tentukan bulan dan tahun fiskal yang ingin Anda tutup, serta perbarui nilai tukar mata uang asing (*Exchange Rate*) akhir bulan untuk keperluan revaluasi.
                  </p>

                  <div className="bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 inline-block w-max mt-2">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tutup Buku Terakhir</span>
                    <p className="text-slate-800 font-bold mt-0.5">Mei 2026</p>
                  </div>
                </div>

                {/* Right side: Form */}
                <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bulan</label>
                      <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full shadow-sm"
                      >
                        {monthNames.map((m, i) => (
                          <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-32 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tahun</label>
                      <input 
                        type="number"
                        min={1990}
                        max={3099}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        onBlur={(e) => {
                          let val = parseInt(e.target.value);
                          if (isNaN(val) || val < 1990) val = 1990;
                          if (val > 3099) val = 3099;
                          setSelectedYear(val.toString());
                        }}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full shadow-sm tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="w-full border border-slate-200 rounded-lg overflow-hidden mb-6 shadow-sm">
                    <table className="w-full text-left text-sm bg-white">
                      <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-semibold tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Mata Uang (Valas)</th>
                          <th className="px-3 py-2 text-right">Kurs Akhir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-700">USD</td>
                          <td className="px-3 py-2 text-right">
                            <input type="text" defaultValue="16.200" className="w-24 text-right px-2 py-1 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-700">SGD</td>
                          <td className="px-3 py-2 text-right">
                            <input type="text" defaultValue="11.800" className="w-24 text-right px-2 py-1 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <button 
                    onClick={() => setIsPeriodSelected(true)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2 text-sm"
                  >
                    Mulai Proses Tutup Buku <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                </div>

                {/* Pre-flight Checklist */}
                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> Prasyarat Sistem (System Pre-Flight Checks)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Item 1 */}
                    <div className={`p-5 rounded-xl border flex flex-col justify-between ${parseInt(selectedMonth) <= 5 ? 'border-slate-200 bg-slate-50 opacity-80' : 'border-amber-200 bg-amber-50'}`}>
                      <div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-4 ${parseInt(selectedMonth) <= 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-amber-500'}`}>
                          {parseInt(selectedMonth) <= 5 ? <CheckCircle className="w-5 h-5" /> : <FileWarning className="w-5 h-5" />}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">Validasi Jurnal Unposted</h4>
                        <p className={`text-xs mt-2 leading-relaxed ${parseInt(selectedMonth) <= 5 ? 'text-slate-500' : 'text-slate-600'}`}>
                          {parseInt(selectedMonth) <= 5 ? 'Semua dokumen jurnal untuk periode ini telah diposting ke Buku Besar.' : 'Terdapat dokumen jurnal berstatus DRAFT yang belum diposting ke Buku Besar.'}
                        </p>
                      </div>
                      <span className={`inline-block mt-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md w-max ${parseInt(selectedMonth) <= 5 ? 'text-emerald-700 bg-emerald-100/60' : 'text-amber-700 bg-amber-100/60'}`}>
                        {parseInt(selectedMonth) <= 5 ? 'Selesai & Tervalidasi' : (parseInt(selectedMonth) === 6 ? 'Tindakan Diperlukan' : 'Menunggu Transaksi')}
                      </span>
                    </div>
                    {/* Item 2 */}
                    <div className={`p-5 rounded-xl border flex flex-col justify-between ${parseInt(selectedMonth) > 6 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 opacity-80'}`}>
                      <div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-4 ${parseInt(selectedMonth) > 6 ? 'bg-white text-amber-500' : 'bg-emerald-100 text-emerald-600'}`}>
                          {parseInt(selectedMonth) > 6 ? <AlertTriangle className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">Penyusutan Aset Tetap</h4>
                        <p className={`text-xs mt-2 leading-relaxed ${parseInt(selectedMonth) > 6 ? 'text-slate-600' : 'text-slate-500'}`}>
                          {parseInt(selectedMonth) > 6 ? 'Kalkulasi penyusutan untuk periode mendatang belum dapat diproses.' : 'Kalkulasi dan jurnal penyusutan aset untuk periode berjalan telah disahkan.'}
                        </p>
                      </div>
                      <span className={`inline-block mt-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md w-max ${parseInt(selectedMonth) > 6 ? 'text-amber-700 bg-amber-100/60' : 'text-emerald-700 bg-emerald-100/60'}`}>
                        {parseInt(selectedMonth) > 6 ? 'Belum Tersedia' : 'Selesai & Tervalidasi'}
                      </span>
                    </div>
                    {/* Item 3 */}
                    <div className={`p-5 rounded-xl border flex flex-col justify-between ${parseInt(selectedMonth) > 6 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 opacity-80'}`}>
                      <div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-4 ${parseInt(selectedMonth) > 6 ? 'bg-white text-amber-500' : 'bg-emerald-100 text-emerald-600'}`}>
                          {parseInt(selectedMonth) > 6 ? <AlertTriangle className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">Rekonsiliasi Bank</h4>
                        <p className={`text-xs mt-2 leading-relaxed ${parseInt(selectedMonth) > 6 ? 'text-slate-600' : 'text-slate-500'}`}>
                          {parseInt(selectedMonth) > 6 ? 'Saldo mutasi rekening koran belum tersedia untuk periode mendatang.' : 'Saldo mutasi rekening koran telah 100% cocok dengan catatan kas & bank.'}
                        </p>
                      </div>
                      <span className={`inline-block mt-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md w-max ${parseInt(selectedMonth) > 6 ? 'text-amber-700 bg-amber-100/60' : 'text-emerald-700 bg-emerald-100/60'}`}>
                        {parseInt(selectedMonth) > 6 ? 'Belum Tersedia' : 'Selesai & Tervalidasi'}
                      </span>
                    </div>
                    {/* Item 4 */}
                    <div className={`p-5 rounded-xl border flex flex-col justify-between ${parseInt(selectedMonth) > 6 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 opacity-80'}`}>
                      <div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-4 ${parseInt(selectedMonth) > 6 ? 'bg-white text-amber-500' : 'bg-emerald-100 text-emerald-600'}`}>
                          {parseInt(selectedMonth) > 6 ? <AlertTriangle className="w-5 h-5" /> : <Factory className="w-5 h-5" />}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">Stok Opname Persediaan</h4>
                        <p className={`text-xs mt-2 leading-relaxed ${parseInt(selectedMonth) > 6 ? 'text-slate-600' : 'text-slate-500'}`}>
                          {parseInt(selectedMonth) > 6 ? 'Kalkulasi harga pokok produksi gudang belum tersedia.' : 'Penyesuaian stok fisik dan kalkulasi harga pokok gudang telah ditutup.'}
                        </p>
                      </div>
                      <span className={`inline-block mt-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md w-max ${parseInt(selectedMonth) > 6 ? 'text-amber-700 bg-amber-100/60' : 'text-emerald-700 bg-emerald-100/60'}`}>
                        {parseInt(selectedMonth) > 6 ? 'Belum Tersedia' : 'Selesai & Tervalidasi'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Batal Tutup Buku (Undo Closing) for Past Periods */}
                {parseInt(selectedMonth) <= 5 && (
                  <div className="border-t border-slate-100 pt-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-5 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-5">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                        <Unlock className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                          Batal Tutup Buku (Undo Period End)
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">Otoritas CFO</span>
                        </h4>
                        <p className="text-sm text-slate-600 mt-1 mb-4 leading-relaxed max-w-3xl">
                          Periode ini telah ditutup. Fitur darurat ini akan menghapus Jurnal Pembalik, membuka kunci Modul Operasional (AP/AR/INV), dan membatalkan pengakuan Laba Ditahan. Semua tindakan pembatalan direkam permanen dalam <strong>Audit Trail</strong>.
                        </p>
                        {role === 'CFO' ? (
                          <button 
                            onClick={() => setShowUnlockModal(true)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded shadow transition-colors text-sm flex items-center gap-2"
                          >
                            <AlertTriangle className="w-4 h-4" /> Eksekusi Buka Kunci Periode
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-rose-700 text-sm rounded border border-rose-200 font-medium shadow-sm">
                            <Lock className="w-4 h-4 text-rose-500" /> Akses Ditolak: Anda tidak memiliki otoritas CFO.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {isPeriodSelected && (
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100 animate-in fade-in duration-300 shrink-0">
                <p className="text-slate-500 text-sm flex items-center gap-2">
                  Periode Fiskal: <strong className="text-slate-700">{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</strong> <span className="text-slate-300">|</span> Cabang: <strong className="text-slate-700 capitalize">{branch.toLowerCase().replace('_', ' ')}</strong>
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Status Proses</span>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border
                    ${completedSteps.has('LOCK') 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'}`}
                  >
                    {completedSteps.has('LOCK') ? (
                      <><ShieldCheck className="w-4 h-4" /> Terkunci</>
                    ) : (
                      <><RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : 'animate-spin-slow'}`} /> {isProcessing ? 'Mengeksekusi' : 'Berjalan'}</>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isPeriodSelected && showTerminal ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 py-4">
                <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 flex flex-col h-72">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
                    <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Enterprise Batch Spool</span>
                    <div className="ml-auto text-xs flex items-center gap-2 font-medium">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> <span className="text-slate-600">Sedang Mengeksekusi...</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-3 bg-slate-50/50">
                    {batchLogs.map((log, i) => (
                      <div key={i} className="animate-in slide-in-from-bottom-2 duration-200 flex gap-3 text-slate-700">
                        <span className="text-slate-400 font-bold shrink-0">&gt;</span> 
                        <span className={log.includes('OK') ? 'text-emerald-600 font-bold' : ''}>{log}</span>
                      </div>
                    ))}
                    <div className="animate-pulse text-blue-600 flex gap-3"><span className="text-slate-400 font-bold shrink-0">&gt;</span> _</div>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-6 flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-5 h-5 text-blue-500" /> Sistem sedang menulis audit trail... Mohon tunggu.
                </p>
              </div>
            ) : (
              <>
            {isPeriodSelected && currentStep === 'VALIDATION' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <FileWarning className="w-5 h-5 text-amber-500" /> Validasi Kelengkapan Jurnal
                </h2>
                <p className="text-slate-600 text-sm mb-6">
                  Sistem mendeteksi adanya dokumen jurnal yang masih berada dalam status <strong className="text-amber-600">DRAFT</strong>. Sesuai standar akuntansi, semua transaksi harus diposting sebelum periode dapat ditutup.
                </p>

                <div className="border border-amber-200 rounded-lg overflow-hidden bg-amber-50/30">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider border-y border-slate-200">
                      <tr>
                        <th className="px-4 py-3">No. Jurnal</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Deskripsi</th>
                        <th className="px-4 py-3 text-right">Nilai (IDR)</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {draftJournals.map(j => (
                        <tr key={j.no} className="hover:bg-amber-50/50 transition-colors text-slate-700 font-medium">
                          <td className="px-4 py-3 text-blue-600 hover:underline cursor-pointer">{j.no}</td>
                          <td className="px-4 py-3">{j.date}</td>
                          <td className="px-4 py-3">{j.desc}</td>
                          <td className="px-4 py-3 text-right">Rp {j.amount.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">DRAFT</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 text-blue-500" />
                  <p><strong>Bypass Mode Aktif:</strong> Untuk simulasi demonstrasi ini, Anda diizinkan untuk mengabaikan peringatan ini dan melanjutkan proses tutup buku.</p>
                </div>
              </div>
            )}

            {currentStep === 'REVALUATION' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-indigo-500" /> Revaluasi Mata Uang Asing
                </h2>
                <p className="text-slate-600 text-sm mb-6">
                  Menyesuaikan saldo akun mata uang asing (Valas) dengan nilai tukar penutup (*Closing Rate*) pada akhir bulan untuk mengakui selisih kurs yang belum terealisasi (*Unrealized Gain/Loss*).
                </p>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Akun Valas</th>
                        <th className="px-4 py-3 text-right">Saldo Valas</th>
                        <th className="px-4 py-3 text-right">Kurs Awal</th>
                        <th className="px-4 py-3 text-right text-indigo-600">Kurs Akhir (Revaluasi)</th>
                        <th className="px-4 py-3 text-right">Unrealized Gain/Loss</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {revaluations.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors text-slate-700">
                          <td className="px-4 py-3 font-semibold text-slate-800">{r.account}</td>
                          <td className="px-4 py-3 text-right font-medium">{r.currency} {r.balance.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right">Rp {r.originalRate.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right font-bold text-indigo-600">Rp {r.endRate.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">+ Rp {r.unrealized.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right">Total Unrealized Gain:</td>
                        <td className="px-4 py-3 text-right text-emerald-600">Rp 8.500.000</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-xs text-slate-500 mt-3 italic">* Jurnal Penyesuaian Selisih Kurs akan dibuat secara otomatis saat periode dikunci.</p>
              </div>
            )}

            {currentStep === 'ALLOCATION' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <Factory className="w-5 h-5 text-purple-600" /> Alokasi Biaya Produksi (Overhead)
                    </h2>
                    <p className="text-slate-600 text-sm max-w-xl">
                      Mendistribusikan beban operasional pabrik (*Factory Overhead*) ke dalam inventaris Barang Dalam Proses (WIP). Sisa biaya yang tidak dialokasikan akan tetap menjadi beban periode berjalan.
                    </p>
                  </div>
                  <button 
                    onClick={handleAutoCalc}
                    className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded text-sm font-bold shadow-sm transition-colors"
                  >
                    Auto Calc (100%)
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm bg-white">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-200">No. & Nama Akun (Account)</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-right">Beban Aktual (Actual)</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-center">% Alloc</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-right text-purple-700">Hasil Alokasi (Allocated)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allocations.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-700">{a.account}</td>
                          <td className="px-4 py-3 text-right font-medium">Rp {a.actual.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input 
                                type="number" 
                                value={a.percent}
                                onChange={(e) => handleUpdatePercent(a.id, e.target.value)}
                                className="w-16 text-center px-2 py-1 border border-slate-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" 
                                min="0" max="100"
                              />
                              <span className="text-slate-500">%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-purple-700">
                            Rp {(a.actual * a.percent / 100).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right">Total Biaya Dialokasikan ke WIP:</td>
                        <td className="px-4 py-3 text-right text-purple-700 text-base">Rp {totalAllocated.toLocaleString('id-ID')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-xs text-slate-500 mt-3 italic">* Jurnal: (Debit) Persediaan WIP pada (Kredit) Akun Beban Pabrikasi.</p>
              </div>
            )}

            {currentStep === 'EARNINGS' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-emerald-500" /> Kalkulasi Laba Ditahan (Retained Earnings)
                </h2>
                <p className="text-slate-600 text-sm mb-6">
                  Sistem akan mengkonsolidasi seluruh akun Pendapatan dan Beban untuk menghasilkan Nilai Laba/Rugi Berjalan yang akan ditransfer ke akun Ekuitas.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                    <h3 className="font-bold text-slate-700 text-sm mb-4 uppercase tracking-wider">Ringkasan Laba/Rugi Periode Ini</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Total Pendapatan (Revenue)</span>
                        <span className="font-semibold text-emerald-600">Rp 1.450.000.000</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Total HPP (COGS)</span>
                        <span className="font-semibold text-rose-600">(Rp 850.000.000)</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Total Beban Operasional</span>
                        <span className="font-semibold text-rose-600">(Rp 320.000.000)</span>
                      </div>
                      <div className="flex justify-between items-center text-purple-700 font-medium">
                        <span>(-) Pengurang Alokasi Pabrik (WIP)</span>
                        <span>+ Rp {totalAllocated.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Lain-lain (Unrealized Gain)</span>
                        <span className="font-semibold text-emerald-600">Rp 8.500.000</span>
                      </div>
                      <div className="pt-3 mt-3 border-t-2 border-slate-200 border-dashed flex justify-between items-center font-bold text-lg">
                        <span className="text-slate-800">Net Profit</span>
                        <span className="text-blue-700">Rp {(288500000 + totalAllocated).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl flex flex-col justify-center items-center text-center">
                    <TrendingUp className="w-12 h-12 text-blue-500 mb-3" />
                    <h3 className="font-bold text-blue-900 mb-1">Transfer ke Laba Ditahan</h3>
                    <p className="text-blue-700 text-sm mb-4">Nilai Laba Bersih akan dibukukan ke akun <br/><strong className="bg-white px-2 py-0.5 rounded border border-blue-100">3200 - Laba Ditahan</strong></p>
                    <div className="bg-white px-4 py-2 rounded-lg border border-blue-200 font-bold text-xl text-blue-800 shadow-sm">
                      Rp {(288500000 + totalAllocated).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'LOCK' && (
              <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col items-center pt-2 md:pt-6 text-center">
                {completedSteps.has('LOCK') ? (
                  <>
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                      <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Periode Berhasil Dikunci!</h2>
                    <p className="text-slate-600 text-sm max-w-lg mb-4">
                      Jurnal pembalik, revaluasi mata uang, dan pemindahan laba ditahan telah berhasil diposting. 
                      Periode <strong>{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</strong> kini bersifat <em>Read-Only</em> dan terkunci secara permanen untuk menjaga integritas audit finansial.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-all flex items-center gap-2"
                      >
                        Kembali ke Dashboard
                      </button>
                      <button 
                        onClick={handleDownloadAuditReport}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2 border border-amber-600"
                      >
                        <ShieldCheck className="w-5 h-5" /> Unduh Berita Acara & Snapshot GL
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                      <Lock className="w-8 h-8 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Penguncian Periode</h2>
                    <p className="text-slate-600 text-sm max-w-lg mb-5">
                      Perhatian: Mengunci periode pembukuan adalah tindakan permanen yang akan mencegah pembuatan, pengubahan, atau penghapusan transaksi finansial apapun di bulan <strong>{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</strong>.
                    </p>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm max-w-md text-left mb-4 shadow-sm">
                      <p className="font-bold flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4"/> Audit Log Peringatan:</p>
                      <ul className="list-disc pl-6 space-y-0.5 text-xs">
                        <li>Pastikan seluruh mutasi bank telah direkonsiliasi.</li>
                        <li>Pastikan seluruh stok opname (Inventory) telah disesuaikan.</li>
                      </ul>
                    </div>
                    {role !== 'CFO' && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs max-w-md text-center shadow-sm flex flex-col items-center gap-1.5">
                        <Lock className="w-4 h-4 text-rose-500" />
                        <p><strong>Akses Ditolak:</strong> Role Anda ({role}) tidak memiliki otoritas (RBAC) untuk melakukan Hard-Close. Silakan hubungi CFO / Direktur.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            </>
            )}
          </div>

          {/* Footer Actions */}
          {isPeriodSelected && !completedSteps.has('LOCK') && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button 
                className={`px-4 py-2 font-semibold text-sm rounded transition-colors ${currentStep === 'VALIDATION' ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'}`}
                disabled={currentStep === 'VALIDATION' || isProcessing}
                onClick={() => {
                  if (currentStep === 'REVALUATION') setCurrentStep('VALIDATION');
                  else if (currentStep === 'ALLOCATION') setCurrentStep('REVALUATION');
                  else if (currentStep === 'EARNINGS') setCurrentStep('ALLOCATION');
                  else if (currentStep === 'LOCK') setCurrentStep('EARNINGS');
                }}
              >
                Kembali
              </button>
              <div className="flex gap-3">
                {currentStep === 'LOCK' ? (
                  <>
                    <button 
                      onClick={handleNext}
                      disabled={isProcessing}
                      className="px-6 py-2 font-bold text-sm rounded shadow-md transition-all flex items-center gap-2 text-slate-800 bg-amber-400 hover:bg-amber-500 disabled:opacity-50"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />} Soft-Close
                    </button>
                    <button 
                      onClick={handleNext}
                      disabled={isProcessing || !canLockPeriod}
                      className={`px-6 py-2 font-bold text-sm rounded shadow-md transition-all flex items-center gap-2 text-white
                        ${(!canLockPeriod || isProcessing) ? 'bg-slate-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'}`}
                      title={!canLockPeriod ? "Membutuhkan akses CFO" : ""}
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Hard-Close (All Users)
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleNext}
                    disabled={isProcessing}
                    className="px-6 py-2 font-bold text-sm rounded shadow-md transition-all flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Memproses...</>
                    ) : (
                      <>Proses Selanjutnya <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Batal Tutup Buku */}
      {showUnlockModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 bg-rose-50/50 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${unlockSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {unlockSuccess ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {unlockSuccess ? 'Periode Berhasil Dibuka' : 'Konfirmasi Batal Tutup Buku'}
                </h3>
                <p className="text-sm text-slate-500">Periode {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</p>
              </div>
            </div>
            
            <div className="p-6">
              {unlockSuccess ? (
                <div className="py-4 text-center">
                  <p className="text-slate-600 text-sm mb-2">Jurnal pembalik berhasil dihapus dan modul operasional telah dibuka kembali.</p>
                  <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Audit Trail Recorded</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                    Anda akan mengeksekusi perintah berisiko tinggi. Tindakan ini akan <strong>menganulir Jurnal Penutup</strong> secara otomatis dan mengembalikan status periode menjadi <strong className="text-emerald-600">Terbuka (Open)</strong>.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-xs font-medium leading-relaxed">
                      Sesuai protokol kepatuhan (SOX Compliance), tindakan darurat ini akan direkam secara permanen dalam <strong>Audit Trail</strong> atas nama otoritas <strong>{role}</strong>.
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setShowUnlockModal(false)}
                      disabled={isUnlocking}
                      className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleExecuteUnlock}
                      disabled={isUnlocking}
                      className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md transition-colors flex items-center gap-2 disabled:bg-rose-400"
                    >
                      {isUnlocking ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Sedang Mengeksekusi...</>
                      ) : (
                        <><Unlock className="w-4 h-4" /> Saya Yakin, Buka Kunci</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
