import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Save, Plus, Trash2, AlertTriangle, CheckCircle2,
  Printer, Repeat, X, ChevronDown, SaveAll,
  ChevronLeft, ChevronRight, Eraser, BookOpen, Monitor, FileOutput,
  Search, FilePlus, Shield
} from 'lucide-react';
import { AuditTrailTimeline } from '../../../shared/components/AuditTrailTimeline';
import { FormDocumentHeader } from '../../../shared/components/ui/FormDocumentHeader';
import { ComboBoxSelect } from '../../../shared/components/ui/ComboBoxSelect';
import { Modal } from '../../../shared/components/ui/Modal';
import { RecurringJournalModal } from './RecurringJournalModal';
import { JournalPrintPreview } from './JournalPrintPreview';
import type { JournalVoucherPayload } from '../types/journal';

interface JournalLine {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
  foreignDebit?: number;
  foreignCredit?: number;
  departmentId?: string;
  projectId?: string;
}

interface JournalVoucherFormProps {
  initialData?: JournalVoucherPayload;
  mode?: 'create' | 'edit' | 'view';
  onBack: () => void;
  onOpenTab?: (tabName: string) => void;
  onSave?: (data: JournalVoucherPayload) => void;
  onPost?: (data: JournalVoucherPayload) => void;
}

// Dummy Accounts for Dropdown
const ACCOUNTS = [
  { id: '1101', name: '1101 - Kas Kecil Pusat' },
  { id: '1102', name: '1102 - Bank BCA IDR' },
  { id: '1201', name: '1201 - Piutang Pelanggan IDR' },
  { id: '1301', name: '1301 - Persediaan Barang Dagang' },
  { id: '4101', name: '4101 - Pendapatan Penjualan' },
  { id: '5101', name: '5101 - Harga Pokok Penjualan' },
  { id: '6101', name: '6101 - Beban Gaji' },
  { id: '6102', name: '6102 - Beban Sewa Gedung' },
];

const DEPARTMENTS = [
  { value: 'DEP-01', label: 'Marketing' },
  { value: 'DEP-02', label: 'Operasional' }
];

const PROJECTS = [
  { value: 'PRJ-01', label: 'Proyek A' },
  { value: 'PRJ-02', label: 'Proyek B' }
];

export const JournalVoucherForm: React.FC<JournalVoucherFormProps> = ({ 
  initialData, mode = 'create', onBack, onOpenTab, onSave, onPost 
}) => {
  const isReadOnly = mode === 'view' || initialData?.status === 'POSTED' || initialData?.status === 'VOID';

  const [header, setHeader] = useState({
    // Pendekatan "Early Assignment": Mengambil nomor urut terakhir + 1 dari database untuk ditampilkan di layar.
    voucherNo: initialData?.voucher_no || `JV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-0004`,
    date: initialData?.transaction_date || '',
    memo: initialData?.description || '',
    reference: initialData?.reference_no || '',
    isMultiCurrency: initialData?.currency_code ? initialData.currency_code !== 'IDR' : false,
    currency: initialData?.currency_code || 'IDR',
    exchangeRate: initialData ? initialData.exchange_rate : ''
  });

  const [isMemorizeOpen, setIsMemorizeOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Modal States for Phase 3.5
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isLoadTemplateModalOpen, setIsLoadTemplateModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);

  // Enterprise Concurrency Collision State (Simulation)
  const [isCollisionModalOpen, setIsCollisionModalOpen] = useState(false);
  const [suggestedVoucherNo, setSuggestedVoucherNo] = useState('');
  const [pendingAction, setPendingAction] = useState<'DRAFT' | 'POSTED' | null>(null);

  const [lines, setLines] = useState<JournalLine[]>(
    initialData?.lines ? 
    initialData.lines.map((l: any, i: number) => ({
      id: String(i),
      accountId: l.account_id,
      description: l.description,
      debit: l.debit,
      credit: l.credit,
      departmentId: l.department_id || '',
      projectId: l.project_id || ''
    })) : [
      { id: '1', accountId: '', description: '', debit: 0, credit: 0, departmentId: '', projectId: '' },
      { id: '2', accountId: '', description: '', debit: 0, credit: 0, departmentId: '', projectId: '' },
    ]
  );

  const totalDebit = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0), [lines]);
  const totalCredit = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0), [lines]);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference === 0 && totalDebit > 0;

  const addLine = () => {
    setLines([...lines, { id: crypto.randomUUID(), accountId: '', description: '', debit: 0, credit: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) return; // Minimum 2 lines for double-entry
    setLines(lines.filter(l => l.id !== id));
  };

  const handleClearForm = () => {
    setLines([
      { id: crypto.randomUUID(), accountId: '', description: '', debit: 0, credit: 0 },
      { id: crypto.randomUUID(), accountId: '', description: '', debit: 0, credit: 0 },
    ]);
    setHeader({ ...header, memo: '', isMultiCurrency: false });
    setIsClearModalOpen(false);
  };

  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        const updated = { ...l, [field]: value };
        
        // Valas Logic (Multi-Currency)
        if (field === 'foreignDebit') {
          const val = Number(value) || 0;
          updated.foreignCredit = 0;
          updated.debit = val * header.exchangeRate;
          updated.credit = 0;
        }
        if (field === 'foreignCredit') {
          const val = Number(value) || 0;
          updated.foreignDebit = 0;
          updated.credit = val * header.exchangeRate;
          updated.debit = 0;
        }

        // Base Logic
        if (field === 'debit') {
          const val = Number(value) || 0;
          updated.credit = 0;
          if (header.isMultiCurrency) {
            updated.foreignCredit = 0;
            if (header.exchangeRate > 0) updated.foreignDebit = val / header.exchangeRate;
          }
        }
        if (field === 'credit') {
          const val = Number(value) || 0;
          updated.debit = 0;
          if (header.isMultiCurrency) {
            updated.foreignDebit = 0;
            if (header.exchangeRate > 0) updated.foreignCredit = val / header.exchangeRate;
          }
        }

        return updated;
      }
      return l;
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatForeignCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const generatePayload = (): JournalVoucherPayload => {
    return {
      company_id: initialData?.company_id || 'C-01',
      voucher_no: header.voucherNo,
      transaction_date: header.date,
      description: header.memo,
      reference_no: header.reference || null,
      currency_code: header.currency,
      exchange_rate: Number(header.exchangeRate) || 1, // Fallback to 1 if empty upon save
      status: initialData?.status || 'DRAFT',
      total_debit: totalDebit,
      total_credit: totalCredit,
      lines: lines
        .filter(l => l.accountId && (l.debit > 0 || l.credit > 0)) // Only valid lines
        .map(l => ({
          account_id: l.accountId,
          department_id: l.departmentId || null,
          project_id: l.projectId || null,
          description: l.description,
          debit: l.debit,
          credit: l.credit
        }))
    };
  };

  const handleSaveDraft = () => {
    if (!header.voucherNo.trim()) {
      alert("SIMPAN DRAFT GAGAL!\nNomor Voucher (Voucher No.) wajib diisi sebagai identitas dokumen.");
      return;
    }
    if (!header.date) {
      alert("SIMPAN DRAFT GAGAL!\nTanggal Transaksi wajib diisi untuk menentukan periode fiskal.");
      return;
    }
    
    // [SIMULASI ENTERPRISE] Memaksa munculnya peringatan tabrakan khusus untuk demonstrasi ke User
    if (header.voucherNo === `JV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-0004`) {
      setSuggestedVoucherNo(`JV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-0005`);
      setPendingAction('DRAFT');
      setIsCollisionModalOpen(true);
      return;
    }

    if (onSave) onSave(generatePayload());
  };

  const handlePostJournal = () => {
    if (!isBalanced) {
      alert("JURNAL TIDAK SEIMBANG!\nTotal Debit harus sama dengan Total Kredit.");
      return;
    }

    // [SIMULASI ENTERPRISE] Memaksa munculnya peringatan tabrakan khusus untuk demonstrasi ke User
    if (header.voucherNo === `JV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-0004`) {
      setSuggestedVoucherNo(`JV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-0005`);
      setPendingAction('POSTED');
      setIsCollisionModalOpen(true);
      return;
    }

    if (onPost) onPost(generatePayload());
  };

  const executePendingSave = () => {
    // Update state to the new voucher number
    setHeader(prev => ({ ...prev, voucherNo: suggestedVoucherNo }));
    setIsCollisionModalOpen(false);
    
    // Provide a small delay to let UI update before triggering save
    setTimeout(() => {
      const payload = generatePayload();
      payload.voucher_no = suggestedVoucherNo;
      
      if (pendingAction === 'DRAFT' && onSave) onSave(payload);
      if (pendingAction === 'POSTED' && onPost) onPost(payload);
      setPendingAction(null);
    }, 100);
  };

  const handleCopyJournal = () => {
    // Generate new mock voucher number and set date to today
    const newVoucherNo = `JV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const today = new Date().toISOString().split('T')[0];
    
    setHeader(prev => ({
      ...prev,
      voucherNo: newVoucherNo,
      date: today,
    }));
    
    alert(`BERHASIL!\nFormulir telah disalin ke dokumen baru.\nNomor Voucher baru Anda: ${newVoucherNo}\nTanggal otomatis diatur ke hari ini.`);
  };

  const handleLoadTemplate = (t: any) => {
    // Simulasi memuat data template ke dalam baris jurnal (Smart Auto-Fill)
    setLines([
      { id: crypto.randomUUID(), accountId: '6101', description: t.name, debit: 1500000, credit: 0, departmentId: 'DEP-01', projectId: '' },
      { id: crypto.randomUUID(), accountId: '1102', description: 'Pembayaran ' + t.name, debit: 0, credit: 1500000, departmentId: 'DEP-01', projectId: '' },
    ]);
    setHeader(prev => ({
      ...prev,
      memo: `[Template] ${t.desc}`
    }));
    setIsLoadTemplateModalOpen(false);
    setTemplateSearchQuery('');
    alert(`BERHASIL DIMUAT!\nData template "${t.name}" telah otomatis mengisi rincian jurnal Anda.`);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert("SIMPAN GAGAL!\nNama Template wajib diisi.");
      return;
    }
    alert(`BERHASIL DISIMPAN!\nJurnal ini telah dihafal dengan nama template: "${templateName}"\nAnda bisa memanggilnya kembali kapan saja.`);
    setIsSaveTemplateModalOpen(false);
    setTemplateName('');
  };

  const numberToEnglishWords = (num: number): string => {
    if (num === 0) return 'zero';
    const a = ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
    const b = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
    const g = ['','thousand','million','billion','trillion'];

    const convert = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      for (let i = 1; i < g.length; i++) {
        const unit = Math.pow(1000, i);
        if (n < unit * 1000) {
          return convert(Math.floor(n / unit)) + ' ' + g[i] + (n % unit !== 0 ? ' ' + convert(n % unit) : '');
        }
      }
      return '';
    };
    return convert(num);
  };

  const handlePrintNewTab = () => {
    // Simpan state saat ini ke local storage agar bisa dibaca oleh komponen tab baru
    const previewData = { header, lines, totalDebit, totalCredit };
    localStorage.setItem(`printPreviewData_${header.voucherNo}`, JSON.stringify(previewData));
    
    if (onOpenTab) {
      onOpenTab(`Preview Cetak : ${header.voucherNo}`);
    } else {
      alert("Fungsi buka tab tidak tersedia");
    }
  };

  const handlePrintDirect = () => {
    // Memanggil native print dialog secara langsung pada halaman ini.
    // CSS print:hidden akan menyembunyikan form, dan print:block akan memunculkan preview.
    window.print();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-slate-100/50 overflow-hidden print:bg-white print:overflow-visible print:block">
      {/* AREA FORM (DISembunyikan SAAT PRINT) */}
      <div className="print:hidden flex flex-col flex-1 w-full min-h-0 px-2 pt-2 md:px-3 md:pt-3">
        <div className="flex flex-col flex-1 bg-white border-x border-t border-slate-200 rounded-t-xl shadow-sm min-h-0 overflow-hidden">
          {/* TOOLBAR */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0 px-6 pt-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-1">
                <button onClick={onBack} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Buku Besar</span>
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-700">Jurnal Umum Baru</span>
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <FilePlus className="w-6 h-6 text-blue-600" />
                  Journal Voucher
                </h2>
              </div>
            </div>

        {/* Odoo / SAP Record Pagination & Secondary Toolbar */}
        <div className="flex items-center gap-4">
          
          {/* Pagination Toolbar (Accurate 4 Style: Small & Compact) */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
            <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-colors" title="Data Sebelumnya">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-500 px-2">1 / 15</span>
            <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-colors" title="Data Selanjutnya">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

          {/* Secondary Actions Toolbar (Accurate 4 Style: Icon + Text Compact) */}
          <div className="hidden md:flex items-center gap-1">
            {!isReadOnly && (
              <button 
                onClick={() => setIsClearModalOpen(true)}
                className="px-2.5 py-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 text-xs font-semibold rounded transition-colors flex items-center gap-1.5"
              >
                <Eraser className="w-3.5 h-3.5" />
                Reset Journal
              </button>
            )}
            <button 
              onClick={() => setIsRecurringModalOpen(true)}
              className="px-2.5 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold rounded transition-colors flex items-center gap-1.5"
            >
              <Repeat className="w-3.5 h-3.5" />
              Transaksi Berulang
            </button>
            <div className="relative group">
              <button 
                onClick={() => setIsMemorizeOpen(!isMemorizeOpen)}
                onBlur={() => setTimeout(() => setIsMemorizeOpen(false), 200)}
                className="px-2.5 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold rounded transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Salin Transaksi
                <ChevronDown className="w-3 h-3 opacity-50 ml-0.5" />
              </button>
              {/* Dropdown Menu */}
              {isMemorizeOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1">
                  <button 
                    onClick={() => { setIsMemorizeOpen(false); handleCopyJournal(); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 border-b border-slate-100"
                  >
                    Duplikasi Jurnal Ini
                  </button>
                  <button 
                    onClick={() => { setIsMemorizeOpen(false); setIsSaveTemplateModalOpen(true); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    Simpan sebagai Template
                  </button>
                  <button 
                    onClick={() => { setIsMemorizeOpen(false); setIsLoadTemplateModalOpen(true); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    Ambil dari Template
                  </button>
                </div>
              )}
            </div>

            {/* Audit Trail Button */}
            <button 
              onClick={() => setIsAuditTrailOpen(true)}
              className="px-2.5 py-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ml-1"
            >
              <Shield className="w-3.5 h-3.5" />
              Audit Trail
            </button>

            {/* Print Feature Dropdown */}
            <div className="relative group">
              <button 
                onClick={() => setIsPrintOpen(!isPrintOpen)}
                onBlur={() => setTimeout(() => setIsPrintOpen(false), 200)}
                className="px-2.5 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ml-1"
              >
                <FileOutput className="w-3.5 h-3.5" />
                Cetak
                <ChevronDown className="w-3 h-3 opacity-50 ml-0.5" />
              </button>
              {/* Dropdown Menu */}
              {isPrintOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1">
                  <button 
                    onClick={() => { setIsPrintOpen(false); handlePrintNewTab(); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5"
                  >
                    <Monitor className="w-4 h-4 text-slate-400" /> Preview (New Tab)
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onClick={() => { setIsPrintOpen(false); handlePrintDirect(); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5"
                  >
                    <Printer className="w-4 h-4 text-slate-400" /> Cetak ke Printer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">

          {/* COMPACT HEADER FORM (Accurate 4 / SAP Fiori Style) */}
          <FormDocumentHeader
            documentNo={header.voucherNo}
            onDocumentNoChange={voucherNo => !isReadOnly && setHeader({ ...header, voucherNo })}
            date={header.date}
            onDateChange={date => !isReadOnly && setHeader({ ...header, date })}
            isMultiCurrency={header.isMultiCurrency}
            onMultiCurrencyChange={isMultiCurrency => !isReadOnly && setHeader({ ...header, isMultiCurrency })}
            memo={header.description}
            onMemoChange={description => !isReadOnly && setHeader({ ...header, description })}
            memoPlaceholder="Contoh: Biaya Operasional / Sewa Kantor"
          >
            {header.isMultiCurrency && (
              <div className="flex flex-col gap-2.5 mt-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-center">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider w-28 shrink-0 pt-1">
                    Mata Uang
                  </label>
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={header.currency}
                      disabled={isReadOnly}
                      onChange={e => setHeader({ ...header, currency: e.target.value })}
                      className="w-[80px] px-2 py-1.5 bg-white border border-slate-300 rounded-sm text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                    >
                      <option value="USD">USD</option>
                      <option value="SGD">SGD</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Kurs</span>
                      <input
                        type="number"
                        disabled={isReadOnly}
                        value={header.exchangeRate || ''}
                        onChange={e => setHeader({ ...header, exchangeRate: Number(e.target.value) })}
                        className="w-[100px] px-2 py-1.5 bg-yellow-50 border border-slate-300 rounded-sm text-xs font-bold text-slate-800 text-right focus:outline-none focus:border-blue-400 transition-colors font-mono shadow-inner"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </FormDocumentHeader>

        {/* DETAIL GRID (Lines) */}
        <div className="bg-white flex flex-col flex-1 min-h-0">
          <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Rincian Jurnal (Double-Entry)</h3>
            {!isReadOnly && (
              <button 
                onClick={addLine}
                className="flex items-center gap-1.5 text-[11px] px-2 py-1.5 font-bold text-blue-700 hover:bg-blue-50 hover:text-blue-800 border border-transparent hover:border-blue-200 rounded transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Tambah Baris
              </button>
            )}
          </div>
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 border-b border-slate-200 text-xs uppercase text-slate-600 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">#</th>
                  <th className="px-4 py-3 font-semibold min-w-[200px]">Akun Perkiraan (COA)</th>
                  {header.isMultiCurrency && <th className="px-4 py-3 font-semibold min-w-[140px] text-right text-blue-700">Debit ({header.currency})</th>}
                  {header.isMultiCurrency && <th className="px-4 py-3 font-semibold min-w-[140px] text-right text-blue-700">Kredit ({header.currency})</th>}
                  <th className="px-4 py-3 font-semibold min-w-[140px] text-right">Debit{header.isMultiCurrency ? ' (IDR)' : ''}</th>
                  <th className="px-4 py-3 font-semibold min-w-[140px] text-right">Kredit{header.isMultiCurrency ? ' (IDR)' : ''}</th>
                  <th className="px-4 py-3 font-semibold min-w-[180px]">Memo / Catatan</th>
                  <th className="px-4 py-3 font-semibold min-w-[120px]">Departemen</th>
                  <th className="px-4 py-3 font-semibold min-w-[120px]">Project</th>
                  <th className="px-4 py-3 font-semibold w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-slate-50/30">
                {lines.map((line, index) => (
                  <tr key={line.id} className="hover:bg-white transition-colors group">
                    <td className="px-4 py-2 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="px-4 py-2">
                      <ComboBoxSelect
                        options={ACCOUNTS.map(acc => ({ value: acc.id, label: acc.name }))}
                        value={line.accountId}
                        disabled={isReadOnly}
                        onChange={val => updateLine(line.id, 'accountId', val)}
                        placeholder="-- Pilih Akun --"
                        className="w-full"
                      />
                    </td>
                    {header.isMultiCurrency && (
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={line.foreignDebit ? formatForeignCurrency(line.foreignDebit, header.currency) : ''}
                          onChange={e => {
                            const raw = e.target.value.replace(/[^\d.]/g, '');
                            updateLine(line.id, 'foreignDebit', raw ? parseFloat(raw) : 0);
                          }}
                          placeholder={`${header.currency} 0.00`}
                          className="w-full px-3 py-1.5 bg-yellow-50 border border-slate-200 rounded text-sm font-mono font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder:text-slate-300 transition-colors shadow-inner"
                        />
                      </td>
                    )}
                    {header.isMultiCurrency && (
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={line.foreignCredit ? formatForeignCurrency(line.foreignCredit, header.currency) : ''}
                          onChange={e => {
                            const raw = e.target.value.replace(/[^\d.]/g, '');
                            updateLine(line.id, 'foreignCredit', raw ? parseFloat(raw) : 0);
                          }}
                          placeholder={`${header.currency} 0.00`}
                          className="w-full px-3 py-1.5 bg-yellow-50 border border-slate-200 rounded text-sm font-mono font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder:text-slate-300 transition-colors shadow-inner"
                        />
                      </td>
                    )}
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={line.debit ? formatCurrency(line.debit) : ''}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '');
                          updateLine(line.id, 'debit', raw ? parseInt(raw, 10) : 0);
                        }}
                        readOnly={isReadOnly || header.isMultiCurrency}
                        placeholder="Rp 0"
                        className={`w-full px-3 py-1.5 border border-slate-200 rounded text-sm font-mono font-medium text-right focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder:text-slate-300 transition-colors ${isReadOnly || header.isMultiCurrency ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-800'}`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={line.credit ? formatCurrency(line.credit) : ''}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '');
                          updateLine(line.id, 'credit', raw ? parseInt(raw, 10) : 0);
                        }}
                        readOnly={isReadOnly || header.isMultiCurrency}
                        placeholder="Rp 0"
                        className={`w-full px-3 py-1.5 border border-slate-200 rounded text-sm font-mono font-medium text-right focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder:text-slate-300 transition-colors ${isReadOnly || header.isMultiCurrency ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-800'}`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={line.description}
                        onChange={e => updateLine(line.id, 'description', e.target.value)}
                        placeholder="Catatan..."
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded text-sm text-slate-800 focus:outline-none transition-colors"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <ComboBoxSelect
                        options={DEPARTMENTS}
                        value={line.departmentId || ''}
                        disabled={isReadOnly}
                        onChange={val => updateLine(line.id, 'departmentId', val)}
                        placeholder="- Dept -"
                        className="w-full min-w-[100px]"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <ComboBoxSelect
                        options={PROJECTS}
                        value={line.projectId || ''}
                        disabled={isReadOnly}
                        onChange={val => updateLine(line.id, 'projectId', val)}
                        placeholder="- Proyek -"
                        className="w-full min-w-[100px]"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      {!isReadOnly && (
                        <button
                          onClick={() => removeLine(line.id)}
                          disabled={lines.length <= 2}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* GRID SUMMARY FOOTER (SAP Fiori / Odoo Premium Style) */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-2.5 flex items-center justify-end gap-8 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Debit</span>
                <span className="text-[13px] font-bold text-slate-800 font-mono">{formatCurrency(totalDebit)}</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Kredit</span>
                <span className="text-[13px] font-bold text-slate-800 font-mono">{formatCurrency(totalCredit)}</span>
              </div>
              
              <div className="w-px h-8 bg-slate-200 mx-2"></div>
              
              <div className="w-40 flex justify-end">
                {!isBalanced ? (
                   <span className="text-rose-600 flex flex-col items-end">
                     <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Out of Balance</span>
                     <span className="text-[13px] font-bold font-mono mt-0.5">{formatCurrency(difference)}</span>
                   </span>
                ) : totalDebit > 0 ? (
                   <span className="text-emerald-600 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-md border border-emerald-200/60 shadow-sm">
                     <CheckCircle2 className="w-4 h-4" /> 
                     <span className="text-xs font-bold uppercase tracking-wide">Balanced</span>
                   </span>
                ) : (
                   <span className="text-slate-400 text-xs font-medium italic">Belum ada jurnal</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* --- MODALS (Phase 3.5) --- */}
      {/* 1. Reset Confirmation Modal (SAP Fiori MessageBox Style) */}
      <Modal 
        isOpen={isClearModalOpen} 
        onClose={() => setIsClearModalOpen(false)} 
        title="Peringatan"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col">
          <div className="flex items-start gap-4 mb-6 mt-2">
            <div className="text-amber-500 shrink-0">
              <AlertTriangle className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              Apakah Anda yakin ingin mengosongkan Journal ini? Semua data yang telah Anda input akan hilang dan Journal akan di-reset ke kondisi awal.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              onClick={handleClearForm}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 outline-none"
            >
              Ya, Reset Journal
            </button>
            <button 
              onClick={() => setIsClearModalOpen(false)}
              className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 outline-none"
            >
              Batal
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Save Template (Memorize) Modal */}
      <Modal isOpen={isSaveTemplateModalOpen} onClose={() => setIsSaveTemplateModalOpen(false)} title="Memorize Detail">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-slate-600">
            Simpan rincian jurnal ini untuk digunakan kembali (Salin Transaksi) di waktu mendatang.
          </p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 col-span-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Memorize No.</label>
                <input 
                  type="number" 
                  placeholder="Misal: 1001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nama</label>
                <input 
                  type="text" 
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="Contoh: Jurnal Sewa Gedung"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Description</label>
              <input 
                type="text" 
                placeholder="Deskripsi singkat transaksi yang dihafal..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
            <button onClick={() => setIsSaveTemplateModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
              Batal
            </button>
            <button onClick={handleSaveTemplate} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              Simpan Memorize
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Load Template Modal */}
      <Modal 
        isOpen={isLoadTemplateModalOpen} 
        onClose={() => setIsLoadTemplateModalOpen(false)} 
        title="Ambil dari Template (Daftar Memorize)"
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col h-[65vh]">
          {/* Header & Search */}
          <div className="flex justify-between items-center shrink-0 mb-4">
            <p className="text-sm text-slate-600">
              Pilih histori jurnal untuk disalin ke form saat ini.
            </p>
            <div className="relative w-72">
              <input 
                type="text" 
                value={templateSearchQuery}
                onChange={e => setTemplateSearchQuery(e.target.value)}
                placeholder="Cari No, Nama, atau Deskripsi..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 min-h-0 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-[11px] text-slate-500 bg-slate-50 uppercase tracking-wider font-bold sticky top-0 z-10 shadow-[0_1px_0_rgba(203,213,225,1)]">
                  <tr className="divide-x divide-slate-200">
                    <th className="px-4 py-3 w-32">Memorize No.</th>
                    <th className="px-4 py-3 w-64">Nama Template</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { no: '1001', name: 'Gaji Karyawan', desc: 'Jurnal payroll bulanan divisi operasional dan marketing yang melibatkan banyak komponen potongan.' },
                    { no: '1002', name: 'Pembayaran PLN & Air', desc: 'Biaya utilitas bulanan kantor pusat' },
                    { no: '1003', name: 'Sewa Gedung Bulanan', desc: 'Biaya sewa gedung ruko blok A' },
                    { no: '1004', name: 'Biaya Internet & Telepon', desc: 'Langganan Telkomsel dan Indihome bulanan' },
                    { no: '1005', name: 'Penyusutan Aset Tetap', desc: 'Jurnal otomatis penyusutan kendaraan dan inventaris kantor' },
                    { no: '1006', name: 'Sewa Kendaraan Direksi', desc: 'Biaya rental mobil direksi ke pihak ketiga' },
                    { no: '1007', name: 'Biaya Konsumsi Rapat', desc: 'Reimburse konsumsi rapat mingguan' },
                    { no: '1008', name: 'Biaya Kurir & Ekspedisi', desc: 'Pengiriman dokumen via JNE/Sicepat' },
                    { no: '1009', name: 'Biaya Keamanan Lingkungan', desc: 'Iuran keamanan dan kebersihan RT/RW kawasan industri' },
                    { no: '1010', name: 'Beban Asuransi Karyawan', desc: 'Pembayaran tagihan BPJS Kesehatan dan Ketenagakerjaan bulanan' }
                  ]
                  .filter(t => t.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) || t.no.includes(templateSearchQuery) || t.desc.toLowerCase().includes(templateSearchQuery.toLowerCase()))
                  .map((t, i) => (
                    <tr 
                      key={i} 
                      className="hover:bg-blue-50/60 transition-colors group divide-x divide-slate-200"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-slate-700">{t.no}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{t.name}</td>
                      <td className="px-4 py-3 text-slate-600 leading-relaxed">{t.desc}</td>
                      <td className="px-4 py-3 text-center align-middle">
                        <button 
                          onClick={() => handleLoadTemplate(t)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 hover:bg-blue-600 text-slate-400 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          title="Pilih Template"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      <div className="w-full px-2 md:px-3 pb-2 md:pb-3 shrink-0 print:hidden">
        <div className="bg-slate-100/80 backdrop-blur-sm border border-slate-200 rounded-b-xl px-6 py-3 flex items-center justify-between shadow-sm relative z-40">
          <button 
            onClick={onBack}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Batal
          </button>
          
          {!isReadOnly ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSaveDraft}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Simpan Draft
              </button>
              <button 
                onClick={handlePostJournal}
                disabled={!isBalanced}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors flex items-center gap-2
                  ${isBalanced ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50' : 'bg-emerald-400 cursor-not-allowed opacity-70'}
                `}
              >
                <SaveAll className="w-4 h-4" /> Posting Jurnal
              </button>
            </div>
          ) : (
            <div className={`text-sm font-bold px-4 py-2 rounded-lg border flex items-center gap-2 shadow-sm ${
              initialData?.status === 'VOID' 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-white/60 text-slate-500 border-slate-200'
            }`}>
              {initialData?.status === 'VOID' ? (
                <><AlertTriangle className="w-4 h-4" /> Dokumen Dibatalkan (VOID)</>
              ) : (
                <>🔒 Dokumen Read-Only (Terkunci)</>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Transaksi Berulang (Recurring Journal) Modal */}
      <RecurringJournalModal 
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        voucherNo={header.voucherNo}
        onSaveSchedule={(schedule) => {
          alert(`Jadwal Transaksi Berulang berhasil disimpan!\nFrekuensi: ${schedule.frequency}\nInterval: ${schedule.interval}\nAksi: ${schedule.statusAction}\nSistem akan mengeksekusi jurnal ini secara otomatis.`);
        }}
      />

      {/* Enterprise Concurrency Collision Modal */}
      <Modal
        isOpen={isCollisionModalOpen}
        onClose={() => setIsCollisionModalOpen(false)}
        title="Peringatan Tabrakan Data"
      >
        <div className="p-4 flex gap-4 bg-amber-50">
          <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
          <div className="text-sm text-slate-700">
            <p className="font-bold mb-2">Nomor Voucher telah digunakan!</p>
            <p className="mb-2">
              Pemberitahuan: <span className="font-bold text-slate-900">{header.voucherNo}</span> baru saja digunakan oleh pengguna lain beberapa saat yang lalu.
            </p>
            <p>
              Sistem telah secara otomatis menyesuaikan nomor dokumen Anda menjadi nomor antrean selanjutnya yaitu <span className="font-bold text-blue-700 px-1.5 py-0.5 bg-blue-100 rounded">{suggestedVoucherNo}</span>.
            </p>
            <p className="mt-4 font-medium">Apakah Anda ingin melanjutkan penyimpanan dengan nomor baru ini?</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
          <button
            onClick={() => setIsCollisionModalOpen(false)}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded transition-colors"
          >
            Batal
          </button>
          <button
            onClick={executePendingSave}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Lanjutkan Simpan
          </button>
        </div>
      </Modal>

      {/* AREA PRINT PREVIEW (HANYA MUNCUL SAAT CETAK KE PRINTER) */}
      <div className="hidden print:block w-full bg-white">
        <JournalPrintPreview 
          directData={{ header, lines, totalDebit, totalCredit }} 
          hideControls={true} 
        />
      </div>

      {isAuditTrailOpen && (
        <AuditTrailTimeline 
          documentId={header.voucherNo} 
          onClose={() => setIsAuditTrailOpen(false)} 
        />
      )}
    </div>
  );
};
