import React from 'react';

interface FormDocumentHeaderProps {
  documentNo: string;
  onDocumentNoChange?: (documentNo: string) => void;
  documentNoLabel?: string;
  date: string;
  onDateChange: (date: string) => void;
  isMultiCurrency?: boolean;
  onMultiCurrencyChange?: (isMultiCurrency: boolean) => void;
  showMultiCurrency?: boolean;
  memo: string;
  onMemoChange: (memo: string) => void;
  memoPlaceholder?: string;
  children?: React.ReactNode;
}

export const FormDocumentHeader: React.FC<FormDocumentHeaderProps> = ({
  documentNo,
  onDocumentNoChange,
  documentNoLabel = 'Voucher No.',
  date,
  onDateChange,
  isMultiCurrency = false,
  onMultiCurrencyChange,
  showMultiCurrency = true,
  memo,
  onMemoChange,
  memoPlaceholder = 'Keterangan transaksi...',
  children,
}) => {
  return (
    <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-4 shrink-0">
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 max-w-5xl">
        
        {/* Left Column (No & Date) */}
        <div className="flex flex-col gap-2.5 w-full md:w-96 shrink-0">
          <div className="flex items-center">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider w-28 shrink-0">
              {documentNoLabel}
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={documentNo}
                onChange={e => onDocumentNoChange?.(e.target.value)}
                readOnly={!onDocumentNoChange}
                className={`w-full max-w-[200px] px-2 py-1 border rounded-sm text-xs font-bold text-slate-800 shadow-inner transition-colors ${
                  onDocumentNoChange 
                    ? 'bg-[#FFFBE6] border-amber-200 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-400' 
                    : 'bg-[#FFFBE6] border-slate-300 focus:outline-none cursor-default'
                }`}
                title={onDocumentNoChange ? "Nomor Bukti (Bisa diubah manual)" : "Nomor Bukti (Otomatis)"}
              />
            </div>
          </div>
          <div className="flex items-center">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider w-28 shrink-0">
              Date
            </label>
            <div className="flex items-center gap-3 flex-1">
              <input
                type="date"
                value={date}
                onChange={e => onDateChange(e.target.value)}
                className="w-[130px] px-2 py-1 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-400 transition-colors"
              />
              {showMultiCurrency && onMultiCurrencyChange && (
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMultiCurrency}
                    onChange={e => onMultiCurrencyChange(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded-sm border-slate-300 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-600">Multi Currency</span>
                </label>
              )}
            </div>
          </div>
          {children}
        </div>

        {/* Right Column (Description) */}
        <div className="flex flex-col gap-2.5 flex-1">
          <div className="flex items-start">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider w-28 shrink-0 pt-1">
              Description
            </label>
            <div className="flex-1">
              <textarea
                value={memo}
                onChange={e => onMemoChange(e.target.value)}
                placeholder={memoPlaceholder}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-sm text-xs text-slate-800 focus:outline-none focus:border-blue-400 transition-colors resize-none h-[52px]"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
