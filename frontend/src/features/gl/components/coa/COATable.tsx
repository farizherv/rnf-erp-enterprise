import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { Account } from '../../types/coa';

interface COATableProps {
  processedAccounts: Account[];
  expandedNodes: Record<string, boolean>;
  selectedId: string | null;
  toggleNode: (id: string) => void;
  setSelectedId: (id: string | null) => void;
}

export const COATable: React.FC<COATableProps> = ({
  processedAccounts,
  expandedNodes,
  selectedId,
  toggleNode,
  setSelectedId
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0 print:block print:overflow-visible print:h-auto print:px-[12mm] print:pt-[12mm]">
      <div className="flex-1 overflow-auto relative print:overflow-visible print:block print:h-auto print:pb-24">
        
        {/* PRINT ONLY HEADER */}
        <div className="hidden print:flex justify-between items-start mb-6 w-full">
          <div className="flex gap-2 w-1/2">
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/rnflogokop.jpg" alt="Logo RNF" className="w-full h-full object-contain" />
            </div>
            <div className="border p-2 text-xs flex-1 rounded-[4px] border-black">
              <div className="font-bold text-[13px]">PT Rezeki Nadh Fathan</div>
              <div className="leading-tight mt-1">
                Gg. Wali Songo, RT.35/RW.54<br />
                Kelurahan Graha Indah<br />
                Kec. Balikpapan Utara, Kota Balikpapan<br />
                Kalimantan Timur, Indonesia.
              </div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-[28px] leading-none mb-1 text-slate-900">Chart of Accounts</h1>
            <p className="text-sm mt-1 text-slate-600">Per: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <table className="w-full text-left whitespace-nowrap print:whitespace-normal text-sm text-slate-600 border-collapse print:table">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 sticky top-0 z-10 shadow-[0_1px_0px_rgba(203,213,225,1)] print:static print:shadow-none print:border-b print:border-slate-800 print:table-header-group">
            <tr>
              <th className="px-4 py-2 font-semibold w-56 border-r border-slate-200">No. Akun</th>
              <th className="px-4 py-2 font-semibold border-r border-slate-200">Nama Akun</th>
              <th className="px-4 py-2 font-semibold w-48 border-r border-slate-200">Tipe Akun</th>
              <th className="px-4 py-2 font-semibold w-24 text-center border-r border-slate-200">Mata Uang</th>
              <th className="px-4 py-2 font-semibold w-48 text-right border-r border-slate-200">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processedAccounts.map((acc) => {
              const depth = acc.depth || 0;
              
              if (acc.parentId && !expandedNodes[acc.parentId]) return null;

              return (
                <tr 
                  key={acc.id} 
                  onClick={() => setSelectedId(acc.id)}
                  className={`transition-colors group cursor-default select-none print:break-inside-avoid print:bg-transparent
                    ${selectedId === acc.id ? 'bg-blue-100/80' : acc.isHeader ? 'bg-slate-50/50 hover:bg-slate-50' : 'hover:bg-slate-50'} 
                    ${acc.suspended ? 'opacity-60' : ''}`}
                >
                  <td className={`px-4 py-2 border-r border-slate-100 ${selectedId === acc.id ? 'text-blue-900 print:text-slate-600' : ''}`}>
                    <div 
                      className="flex items-center gap-1 cursor-pointer select-none"
                      style={{ paddingLeft: `${depth * 1.5}rem` }}
                      onClick={(e) => { e.stopPropagation(); acc.isHeader && toggleNode(acc.id); }}
                    >
                      {acc.isHeader ? (
                        expandedNodes[acc.id] 
                          ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 shrink-0" />
                      )}
                      <span className={`font-mono ${acc.isHeader ? 'font-bold' : ''} ${acc.suspended ? 'line-through text-slate-400' : ''}`}>
                        {acc.code}
                      </span>
                    </div>
                  </td>
                  <td className={`px-4 py-2 border-r border-slate-100 ${selectedId === acc.id ? 'text-blue-900 print:text-slate-600' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className={`${acc.isHeader ? 'font-bold' : 'font-medium'}`}>
                        {acc.name}
                      </span>
                      {acc.suspended && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider border border-amber-300">
                          Suspended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 border-r border-slate-100">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      acc.isHeader ? 'bg-slate-200 text-slate-700' : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center border-r border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">{acc.currency}</span>
                  </td>
                  <td className={`px-4 py-2 text-right border-r border-slate-100 ${selectedId === acc.id ? 'text-blue-900 print:text-slate-600' : ''}`}>
                    <span className={`${acc.isHeader ? 'font-bold' : 'font-medium'}`}>
                      {formatCurrency(acc.balance, acc.currency)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* PRINT ONLY FOOTER (Fixed Bottom) */}
        <div className="hidden print:flex fixed bottom-[12mm] left-0 w-full justify-between items-center text-[10px] text-slate-500 pt-1 pb-0 bg-white z-50" style={{ paddingLeft: '12mm', paddingRight: '12mm' }}>
          <span>Page 1/1</span>
          <span>Printed by RNF Enterprise</span>
        </div>
      </div>
      
      {/* Footer Status Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-medium shrink-0 print:hidden h-8">
        <div className="flex items-center gap-3">
          <span>Menampilkan {processedAccounts.length} Akun</span>
          {selectedId && (
            <>
              <span className="border-l border-slate-300 h-3"></span>
              <span className="text-blue-600 font-semibold">Terpilih: {processedAccounts.find(a => a.id === selectedId)?.code}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300 border border-slate-400"></div> Header</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400 border border-blue-500"></div> Detail</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400 border border-amber-500"></div> Suspended</span>
        </div>
      </div>
    </div>
  );
};
