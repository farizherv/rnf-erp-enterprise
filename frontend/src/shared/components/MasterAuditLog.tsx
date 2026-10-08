import React, { useState } from 'react';
import { Shield, Search, Filter, Download, User, Clock, AlertTriangle, Key, Monitor, RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MasterAuditLog: React.FC = () => {
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Simulasi ribuan baris log dari database shadow
  const logs = [
    { id: 'AL-9001', time: '14:02:11', date: '15 Jun 2026', user: 'Staf A', role: 'STAFF', module: 'Journal Voucher', action: 'CREATE', ip: '192.168.1.44', details: 'Created JV-202606-0004 (Rp 1.500.000)' },
    { id: 'AL-9002', time: '14:05:00', date: '15 Jun 2026', user: 'Spv Budi', role: 'SUPERVISOR', module: 'Period End', action: 'VALIDATE', ip: '192.168.1.102', details: 'Ran journal validation check. Found 2 unposted drafts.' },
    { id: 'AL-9003', time: '14:15:33', date: '15 Jun 2026', user: 'Staf A', role: 'STAFF', module: 'Journal Voucher', action: 'UPDATE', ip: '192.168.1.44', details: 'Updated JV-202606-0004. Changed Debit from Rp 1.500.000 to Rp 1.750.000' },
    { id: 'AL-9004', time: '14:30:12', date: '15 Jun 2026', user: 'Spv Budi', role: 'SUPERVISOR', module: 'Journal Voucher', action: 'POST', ip: '192.168.1.102', details: 'Posted JV-202606-0004 to General Ledger.' },
    { id: 'AL-9005', time: '15:45:00', date: '15 Jun 2026', user: 'Direktur Utama', role: 'CFO', module: 'System', action: 'LOGIN', ip: '202.14.55.12', details: 'Successful login via Biometric Auth.' },
    { id: 'AL-9006', time: '16:00:00', date: '15 Jun 2026', user: 'Staf A', role: 'STAFF', module: 'Period End', action: 'SECURITY_ALERT', ip: '192.168.1.44', details: 'ACCESS DENIED: Attempted to invoke HARD_CLOSE without CFO privileges.' },
    { id: 'AL-9007', time: '16:05:22', date: '15 Jun 2026', user: 'Direktur Utama', role: 'CFO', module: 'Chart of Account', action: 'DELETE', ip: '202.14.55.12', details: 'Deleted Account 6105 - Beban Pemasaran (Balance: 0)' },
    { id: 'AL-9008', time: '16:30:00', date: '15 Jun 2026', user: 'Direktur Utama', role: 'CFO', module: 'Period End', action: 'HARD_CLOSE', ip: '202.14.55.12', details: 'PERMANENT LOCK executed for Fiscal Period: May 2026.' },
  ];

  if (role !== 'CFO') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 animate-in fade-in duration-300">
        <div className="bg-white border border-rose-200 rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-2xl text-center">
          <div className="bg-rose-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-12 h-12 text-rose-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Security Clearance Required</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Akses ke Modul <strong className="text-slate-800">Master System Audit Log</strong> ditolak. Modul ini berisi rekaman aktivitas forensik tingkat tinggi dan hanya dapat diakses oleh <span className="font-bold text-slate-800">CFO atau System Administrator</span>.
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 font-mono text-sm text-amber-700 w-full">
            <span className="font-bold">System Alert:</span> Unauthorized access attempt logged for role [{role}].
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden animate-in fade-in duration-300">
      <div className="bg-white text-slate-800 px-6 py-5 shrink-0 shadow-sm flex justify-between items-center z-10 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
            <Shield className="w-7 h-7 text-rose-500" />
            Master Audit Log <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-widest ml-2 font-bold">God Mode</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Real-time System Forensic Monitoring (SAP/Odoo Standard)
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-colors text-sm font-semibold shadow-sm">
            <Filter className="w-4 h-4" /> Filter Advanced
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-colors text-sm font-semibold shadow-sm">
            <Download className="w-4 h-4" /> Ekspor Log (.CSV)
          </button>
        </div>
      </div>

      <div className="p-6 bg-white border-b border-slate-200 shrink-0 flex items-center gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan ID Transaksi, IP Address, Nama User, atau Modul..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Live Sync Active
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-4 w-40">Timestamp</th>
                <th className="px-4 py-4 w-48">Actor (User/IP)</th>
                <th className="px-4 py-4 w-32">Module</th>
                <th className="px-4 py-4 w-32">Action Type</th>
                <th className="px-4 py-4">Technical Details</th>
                <th className="px-4 py-4 w-16 text-center">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800">{log.time}</span>
                      <span className="text-slate-500">{log.date}</span>
                      <span className="text-slate-400 text-[10px]">{log.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-blue-700 flex items-center gap-1"><User className="w-3 h-3" /> {log.user}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded w-max border border-slate-200">{log.role}</span>
                      <span className="text-slate-400 mt-1">{log.ip}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700 font-sans font-semibold">
                    {log.module}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider border
                      ${log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        log.action === 'UPDATE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        log.action === 'DELETE' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        log.action === 'POST' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        log.action === 'LOGIN' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                        log.action === 'SECURITY_ALERT' ? 'bg-rose-600 text-white border-rose-800 shadow-sm' :
                        log.action === 'HARD_CLOSE' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600 whitespace-normal">
                    {log.details}
                  </td>
                  <td className="px-4 py-3 align-top text-center">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors" title="View Source Document">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
