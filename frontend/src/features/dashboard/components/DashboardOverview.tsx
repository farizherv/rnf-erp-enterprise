import React from 'react';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Wallet, FileText, BarChart3, DollarSign, Users, ArrowUpRight, Shield } from 'lucide-react';

interface DashboardOverviewProps {
  onOpenTab?: (tabName: string) => void;
}

// Mini sparkline SVG component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="ml-auto">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
};

// Mini bar chart SVG component
const MiniBarChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const w = 80;
  const h = 32;
  const barW = w / data.length - 2;
  return (
    <svg width={w} height={h} className="ml-auto">
      {data.map((v, i) => (
        <rect
          key={i}
          x={i * (barW + 2)}
          y={h - (v / max) * h}
          width={barW}
          height={(v / max) * h}
          fill={color}
          rx="1"
          opacity={0.7 + (i / data.length) * 0.3}
        />
      ))}
    </svg>
  );
};

// Larger area chart for Statistics section
const AreaChart: React.FC = () => {
  // Simulated monthly data for Pendapatan (Revenue) and Pengeluaran (Expenses)
  const revenue = [85, 72, 95, 110, 88, 130, 105, 145, 120, 155, 140, 165];
  const expenses = [60, 55, 70, 65, 72, 80, 75, 90, 68, 85, 78, 95];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const max = 180;
  const chartW = 700;
  const chartH = 220;
  const padL = 45;
  const padB = 25;
  
  const toX = (i: number) => padL + (i / (revenue.length - 1)) * (chartW - padL - 10);
  const toY = (v: number) => chartH - padB - ((v / max) * (chartH - padB - 10));
  
  const revenueLine = revenue.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const expensesLine = expenses.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  
  // Area fill paths
  const revenueArea = `M ${toX(0)},${toY(revenue[0])} ${revenue.map((v, i) => `L ${toX(i)},${toY(v)}`).join(' ')} L ${toX(revenue.length - 1)},${chartH - padB} L ${toX(0)},${chartH - padB} Z`;
  const expensesArea = `M ${toX(0)},${toY(expenses[0])} ${expenses.map((v, i) => `L ${toX(i)},${toY(v)}`).join(' ')} L ${toX(expenses.length - 1)},${chartH - padB} L ${toX(0)},${chartH - padB} Z`;
  
  // Y-axis labels
  const yLabels = [0, 50, 100, 150];

  return (
    <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
      {/* Grid lines */}
      {yLabels.map(v => (
        <g key={v}>
          <line x1={padL} y1={toY(v)} x2={chartW - 10} y2={toY(v)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={padL - 8} y={toY(v) + 4} textAnchor="end" fill="#94a3b8" fontSize="10">Rp{v}jt</text>
        </g>
      ))}
      
      {/* Month labels */}
      {months.map((m, i) => (
        <text key={m} x={toX(i)} y={chartH - 5} textAnchor="middle" fill="#94a3b8" fontSize="10">{m}</text>
      ))}
      
      {/* Area fills */}
      <path d={revenueArea} fill="url(#revenueGrad)" opacity="0.3" />
      <path d={expensesArea} fill="url(#expenseGrad)" opacity="0.2" />
      
      {/* Lines */}
      <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" points={revenueLine} strokeLinejoin="round" />
      <polyline fill="none" stroke="#06b6d4" strokeWidth="2.5" points={expensesLine} strokeLinejoin="round" />
      
      {/* Data points */}
      {revenue.map((v, i) => (
        <circle key={`r${i}`} cx={toX(i)} cy={toY(v)} r="3.5" fill="white" stroke="#6366f1" strokeWidth="2" />
      ))}
      {expenses.map((v, i) => (
        <circle key={`e${i}`} cx={toX(i)} cy={toY(v)} r="3.5" fill="white" stroke="#06b6d4" strokeWidth="2" />
      ))}
      
      {/* Gradient defs */}
      <defs>
        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onOpenTab }) => {
  const summaryCards = [
    { 
      title: 'Total Pendapatan', 
      value: 'Rp 246.5 Jt', 
      change: '+12.5%', 
      isUp: true, 
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      chartData: [30, 45, 35, 50, 40, 55, 48, 60],
      chartColor: '#10b981'
    },
    { 
      title: 'Barang Terjual', 
      value: '2,453', 
      change: '+8.2%', 
      isUp: true, 
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      chartData: [20, 35, 25, 40, 30, 45, 50, 42],
      chartColor: '#3b82f6'
    },
    { 
      title: 'Total Pengeluaran', 
      value: 'Rp 89.3 Jt', 
      change: '-3.1%', 
      isUp: false, 
      icon: Wallet,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      chartData: [45, 40, 42, 38, 35, 40, 32, 30],
      chartColor: '#f59e0b'
    },
    { 
      title: 'Jurnal Bulan Ini', 
      value: '384', 
      change: '+15.7%', 
      isUp: true, 
      icon: FileText,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      chartData: [15, 25, 20, 35, 30, 40, 45, 50],
      chartColor: '#8b5cf6'
    },
  ];

  const recentTransactions = [
    { id: 'JU-2026-0384', desc: 'Pembelian Bahan Baku Kayu Meranti', amount: '-Rp 12.500.000', type: 'debit', date: '01 Jun 2026' },
    { id: 'JU-2026-0383', desc: 'Penjualan Mebel Set Ruang Tamu', amount: '+Rp 45.000.000', type: 'kredit', date: '01 Jun 2026' },
    { id: 'JU-2026-0382', desc: 'Pembayaran Gaji Karyawan Mei', amount: '-Rp 38.200.000', type: 'debit', date: '31 Mei 2026' },
    { id: 'JU-2026-0381', desc: 'Penjualan Pintu Ukir Custom', amount: '+Rp 18.750.000', type: 'kredit', date: '31 Mei 2026' },
    { id: 'JU-2026-0380', desc: 'Pembelian Cat & Finishing', amount: '-Rp 4.320.000', type: 'debit', date: '30 Mei 2026' },
  ];

  const inventoryAlerts = [
    { item: 'Kayu Jati Grade A', stock: 12, unit: 'kubik', status: 'low' },
    { item: 'Paku 2 Inch', stock: 245, unit: 'kg', status: 'ok' },
    { item: 'Lem Kayu PVAc', stock: 5, unit: 'galon', status: 'critical' },
    { item: 'Engsel Pintu 4"', stock: 38, unit: 'pcs', status: 'low' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Selamat datang kembali! Berikut ringkasan bisnis Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onOpenTab?.('Master Audit Log')}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold text-sm transition-colors shadow-sm"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden md:inline">Global Audit</span>
          </button>
          <select className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
            <option>Bulan Ini</option>
            <option>3 Bulan Terakhir</option>
            <option>6 Bulan Terakhir</option>
            <option>Tahun Ini</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 text-xs font-semibold ${card.isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  {card.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.change}
                </div>
                <MiniBarChart data={card.chartData} color={card.chartColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Statistik Keuangan</h2>
            <p className="text-xs text-slate-500 mt-0.5">Perbandingan pendapatan vs pengeluaran bulanan</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              Pendapatan
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              Pengeluaran
            </div>
            <select className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-600">
              <option>12 Bulan Terakhir</option>
              <option>6 Bulan Terakhir</option>
            </select>
          </div>
        </div>
        <AreaChart />
      </div>

      {/* Bottom Grid: Recent Transactions + Inventory Alerts */}
      <div className="grid grid-cols-5 gap-4">
        
        {/* Recent Transactions - 3 cols */}
        <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Transaksi Jurnal Terbaru</h2>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-slate-500 uppercase tracking-wide font-semibold py-2 px-2">No. Jurnal</th>
                <th className="text-left text-slate-500 uppercase tracking-wide font-semibold py-2 px-2">Keterangan</th>
                <th className="text-left text-slate-500 uppercase tracking-wide font-semibold py-2 px-2">Tanggal</th>
                <th className="text-right text-slate-500 uppercase tracking-wide font-semibold py-2 px-2">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-2 font-mono text-slate-600">{tx.id}</td>
                  <td className="py-2.5 px-2 text-slate-700 font-medium">{tx.desc}</td>
                  <td className="py-2.5 px-2 text-slate-500">{tx.date}</td>
                  <td className={`py-2.5 px-2 text-right font-bold ${tx.type === 'kredit' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inventory Alerts - 2 cols */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Peringatan Stok</h2>
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Persediaan</span>
            </span>
          </div>
          <div className="space-y-3">
            {inventoryAlerts.map((item) => (
              <div key={item.item} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700">{item.item}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Sisa: {item.stock} {item.unit}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === 'critical' ? 'bg-red-100 text-red-700' :
                  item.status === 'low' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {item.status === 'critical' ? 'KRITIS' : item.status === 'low' ? 'RENDAH' : 'AMAN'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 mx-auto">
              Kelola Persediaan <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
