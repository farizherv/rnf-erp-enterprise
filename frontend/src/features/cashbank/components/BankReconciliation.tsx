import React, { useState, useEffect } from 'react';
import { 
  Landmark, ArrowLeft, RefreshCw, FileText, 
  CheckCircle2, Search, Filter, HelpCircle, AlertCircle, Maximize2, Zap
} from 'lucide-react';
import type { BankStatementLine, ErpTransaction } from '../data/mockBankData';
import { mockBankStatements, mockErpTransactions } from '../data/mockBankData';

export const BankReconciliation: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [bankLines, setBankLines] = useState<BankStatementLine[]>(mockBankStatements);
  const [erpTrans, setErpTrans] = useState<ErpTransaction[]>(mockErpTransactions);
  
  const [selectedBankLine, setSelectedBankLine] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{bankId: string, erpId: string}[]>([]);

  // Simulation of "Auto-Match" running on mount
  const [isAutoMatching, setIsAutoMatching] = useState(false);

  useEffect(() => {
    runAutoMatch();
  }, []);

  const runAutoMatch = async () => {
    setIsAutoMatching(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate AI computation
    
    // Simple heuristic: match by exact amount and type
    const newMatches: {bankId: string, erpId: string}[] = [];
    const usedErpIds = new Set<string>();

    bankLines.forEach(bank => {
      const match = erpTrans.find(erp => 
        erp.amount === bank.amount && 
        erp.type === bank.type && 
        !usedErpIds.has(erp.id)
      );
      if (match) {
        newMatches.push({ bankId: bank.id, erpId: match.id });
        usedErpIds.add(match.id);
      }
    });

    setMatchedPairs(newMatches);
    setIsAutoMatching(false);
  };

  const handleManualMatch = (erpId: string) => {
    if (!selectedBankLine) return;
    
    // Check if already matched
    if (matchedPairs.find(p => p.bankId === selectedBankLine || p.erpId === erpId)) {
      return;
    }

    setMatchedPairs([...matchedPairs, { bankId: selectedBankLine, erpId }]);
    setSelectedBankLine(null);
  };

  const handleUnmatch = (bankId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMatchedPairs(matchedPairs.filter(p => p.bankId !== bankId));
    if (selectedBankLine === bankId) setSelectedBankLine(null);
  };

  // Derived state
  const unmatchedBankLines = bankLines.filter(b => !matchedPairs.find(p => p.bankId === b.id));
  const unmatchedErpTrans = erpTrans.filter(e => !matchedPairs.find(p => p.erpId === e.id));
  const matchedBankLines = bankLines.filter(b => matchedPairs.find(p => p.bankId === b.id));

  // Calculating Variance
  const bankBalance = 2500000000 + bankLines.reduce((acc, curr) => curr.type === 'IN' ? acc + curr.amount : acc - curr.amount, 0);
  const erpBalance = 2500000000 + erpTrans.reduce((acc, curr) => curr.type === 'IN' ? acc + curr.amount : acc - curr.amount, 0);
  const variance = bankBalance - erpBalance;

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans fixed inset-0" style={{ zIndex: 9999 }}>
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Rekonsiliasi Bank (Smart Match)</h1>
              <p className="text-xs text-slate-500 font-medium">Bank Mandiri (IDR) - 112-00-xxxx-xxxx</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo Rekening Koran</span>
            <span className="text-lg font-bold text-slate-800">Rp {bankBalance.toLocaleString('id-ID')}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo Buku Bank (ERP)</span>
            <span className="text-lg font-bold text-slate-800">Rp {erpBalance.toLocaleString('id-ID')}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Selisih (Variance)</span>
            <span className={`text-lg font-bold ${variance === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              Rp {Math.abs(variance).toLocaleString('id-ID')}
            </span>
          </div>
          <button 
            onClick={runAutoMatch}
            disabled={isAutoMatching}
            className="ml-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isAutoMatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
            Auto-Match
          </button>
        </div>
      </div>

      {/* Split Screen Content */}
      <div className="flex-1 overflow-hidden flex p-6 gap-6">
        
        {/* LEFT PANEL: Bank Statement */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Mutasi Rekening Koran
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-slate-400 hover:bg-white rounded border border-transparent hover:border-slate-200"><Search className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 text-slate-400 hover:bg-white rounded border border-transparent hover:border-slate-200"><Filter className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isAutoMatching && unmatchedBankLines.length > 0 && (
              <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-b-xl">
                <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 text-sm font-bold text-slate-600">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" /> Menjalankan AI Matching...
                </div>
              </div>
            )}
            
            {/* Unmatched Lines */}
            {unmatchedBankLines.map(line => (
              <div 
                key={line.id} 
                onClick={() => setSelectedBankLine(line.id === selectedBankLine ? null : line.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm
                  ${selectedBankLine === line.id 
                    ? 'border-blue-500 bg-blue-50/30' 
                    : 'border-slate-100 hover:border-blue-200 bg-white'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-400">{line.date}</span>
                  <span className={`text-sm font-bold ${line.type === 'IN' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {line.type === 'IN' ? '+' : '-'} Rp {line.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800">{line.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">BUTUH PENCOCOKAN</span>
                </div>
              </div>
            ))}

            {/* Matched Lines (Moved to bottom or visually distinct) */}
            {matchedBankLines.length > 0 && (
              <div className="pt-4 mt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Sudah Dicocokkan (Matched)</h4>
                <div className="space-y-3 opacity-75">
                  {matchedBankLines.map(line => {
                    const matchedErp = erpTrans.find(e => e.id === matchedPairs.find(p => p.bankId === line.id)?.erpId);
                    return (
                      <div key={line.id} className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 relative group">
                        <button 
                          onClick={(e) => handleUnmatch(line.id, e)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-rose-200 rounded-full text-rose-500 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Batalkan Pencocokan"
                        >
                          &times;
                        </button>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-bold text-slate-800">{line.description}</span>
                              <span className="text-sm font-bold text-emerald-600">Rp {line.amount.toLocaleString('id-ID')}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Dicocokkan dengan: <strong>{matchedErp?.documentNo} ({matchedErp?.partner})</strong></p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: ERP Transactions */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-500" /> Transaksi Sistem (ERP)
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-slate-400 hover:bg-white rounded border border-transparent hover:border-slate-200"><Search className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!selectedBankLine && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 mb-4">
                <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Pilih salah satu <strong>Mutasi Rekening</strong> di panel sebelah kiri untuk melihat rekomendasi pencocokan dokumen di sistem.
                </p>
              </div>
            )}

            {unmatchedErpTrans.map(erp => {
              const bankLine = bankLines.find(b => b.id === selectedBankLine);
              const isAmountMatch = bankLine && bankLine.amount === erp.amount && bankLine.type === erp.type;
              
              return (
                <div 
                  key={erp.id} 
                  className={`p-4 rounded-xl border transition-all shadow-sm
                    ${selectedBankLine 
                      ? isAmountMatch 
                        ? 'border-emerald-300 bg-emerald-50/20' 
                        : 'border-slate-200 bg-white opacity-50 hover:opacity-100'
                      : 'border-slate-100 bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {erp.documentNo}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{erp.date}</span>
                    </div>
                    <span className={`text-sm font-bold ${erp.type === 'IN' ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {erp.type === 'IN' ? '+' : '-'} Rp {erp.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{erp.partner}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{erp.description}</p>
                  
                  {selectedBankLine && (
                    <div className="mt-4 pt-3 border-t border-slate-100/50 flex justify-end">
                      <button 
                        onClick={() => handleManualMatch(erp.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5
                          ${isAmountMatch 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> 
                        {isAmountMatch ? 'Cocokkan (Perfect Match)' : 'Cocokkan Paksa'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
