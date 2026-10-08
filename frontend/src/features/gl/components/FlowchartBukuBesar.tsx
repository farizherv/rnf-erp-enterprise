import React from 'react';
import { List, CreditCard, FileText, Building2, BookOpen, RefreshCcw } from 'lucide-react';

export const FlowchartBukuBesar: React.FC = () => {
  return (
    <div className="relative w-[850px] h-[600px]">
      
      {/* SVG Arrows Container */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#cbd5e1" />
          </marker>
        </defs>
        
        {/* Arrow: Mata Uang -> Info Perusahaan (Miring Kanan Bawah) */}
        <path d="M 204 380 Q 260 380 324 440" fill="none" stroke="#cbd5e1" strokeWidth="4" markerEnd="url(#arrowhead)" />
        
        {/* Arrow: Info Perusahaan -> Mata Uang (Melengkung Kiri Atas dari Bawah) */}
        <path d="M 324 500 Q 260 500 204 400" fill="none" stroke="#cbd5e1" strokeWidth="4" markerEnd="url(#arrowhead)" />
        
        {/* Arrow: Bukti Jurnal Umum -> Laporan Keuangan (Kurva Atas) */}
        <path d="M 624 180 Q 550 10 444 60" fill="none" stroke="#cbd5e1" strokeWidth="4" markerEnd="url(#arrowhead)" />

        {/* Arrow: Laporan Keuangan -> Bukti Jurnal Umum (Kurva Bawah) */}
        <path d="M 444 100 Q 500 220 564 240" fill="none" stroke="#cbd5e1" strokeWidth="4" markerEnd="url(#arrowhead)" />
      </svg>

      {/* --- ICONS --- */}
      
      {/* 1. Laporan Keuangan (Col 2, Top) */}
      <div className="absolute left-[320px] top-[40px] flex flex-col items-center group cursor-pointer z-10 w-32">
        <div className="w-20 h-20 bg-white border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-lg group-hover:border-blue-400 group-hover:-translate-y-1 transition-all">
          <FileText className="w-10 h-10 text-blue-500" />
        </div>
        <span className="mt-3 font-bold text-slate-700 text-sm group-hover:text-blue-600 text-center">Laporan Keuangan</span>
      </div>

      {/* 2. Daftar Akun (Col 1, Mid-Top) */}
      <div className="absolute left-[80px] top-[160px] flex flex-col items-center group cursor-pointer z-10 w-32">
        <div className="w-20 h-20 bg-white border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-lg group-hover:border-green-400 group-hover:-translate-y-1 transition-all">
          <List className="w-10 h-10 text-green-500" />
        </div>
        <span className="mt-3 font-bold text-slate-700 text-sm group-hover:text-green-600 text-center">Daftar Akun</span>
      </div>

      {/* 3. Bukti Jurnal Umum (Col 3, Mid) */}
      <div className="absolute left-[560px] top-[200px] flex flex-col items-center group cursor-pointer z-10 w-32">
        <div className="w-20 h-20 bg-white border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-lg group-hover:border-slate-500 group-hover:-translate-y-1 transition-all">
          <BookOpen className="w-10 h-10 text-slate-600" />
        </div>
        <span className="mt-3 font-bold text-slate-700 text-sm group-hover:text-slate-800 text-center">Bukti Jurnal Umum</span>
      </div>

      {/* 4. Mata Uang (Col 1, Mid-Bottom) */}
      <div className="absolute left-[80px] top-[340px] flex flex-col items-center group cursor-pointer z-10 w-32">
        <div className="w-20 h-20 bg-white border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-lg group-hover:border-amber-400 group-hover:-translate-y-1 transition-all">
          <CreditCard className="w-10 h-10 text-amber-500" />
        </div>
        <span className="mt-3 font-bold text-slate-700 text-sm group-hover:text-amber-600 text-center">Mata Uang</span>
      </div>

      {/* 5. Info Perusahaan (Col 2, Bottom) */}
      <div className="absolute left-[320px] top-[460px] flex flex-col items-center group cursor-pointer z-10 w-32">
        <div className="w-20 h-20 bg-white border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-lg group-hover:border-indigo-400 group-hover:-translate-y-1 transition-all">
          <Building2 className="w-10 h-10 text-indigo-500" />
        </div>
        <span className="mt-3 font-bold text-slate-700 text-sm group-hover:text-indigo-600 text-center">Info Perusahaan</span>
      </div>

      {/* 6. Proses Akhir Bulan (Col 3, Bottom) */}
      <div className="absolute left-[560px] top-[460px] flex flex-col items-center group cursor-pointer z-10 w-32">
        <div className="w-20 h-20 bg-white border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-lg group-hover:border-red-400 group-hover:-translate-y-1 transition-all">
          <RefreshCcw className="w-10 h-10 text-red-500" />
        </div>
        <span className="mt-3 font-bold text-slate-700 text-sm group-hover:text-red-600 text-center">Proses Akhir Bulan</span>
      </div>

    </div>
  );
};
