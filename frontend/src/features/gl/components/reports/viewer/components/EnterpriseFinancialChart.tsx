import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart, Cell,
  PieChart as RechartsPieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine
} from 'recharts';
import { Sparkles, TrendingUp, BarChart2, Activity, Layers, PieChart, Hash, Target, MousePointerClick, Maximize2 } from 'lucide-react';
import { yAxisFormatter } from '../utils';
import { IncomeExpenseDashboard } from './IncomeExpenseDashboard';
import { NetWorthDashboard } from './NetWorthDashboard';
import { LiquidityDashboard } from './LiquidityDashboard';
import { RoaRoeDashboard } from './RoaRoeDashboard';

export const EnterpriseCustomTooltip = ({ active, payload, label, measure, compareMode }: any) => {
  if (active && payload && payload.length) {
    const isCompare = compareMode && compareMode !== 'none';
    const mainEntries = payload.filter((p: any) => !p.name.includes('(Prev)'));

    return (
      <div className={`bg-white border border-slate-200 p-4 rounded-xl shadow-xl z-50 custom-scrollbar max-h-[350px] overflow-y-auto overflow-x-hidden ${mainEntries.length > 8 ? 'min-w-[650px] max-w-[800px]' : mainEntries.length > 4 ? 'min-w-[450px] max-w-[600px]' : 'min-w-[250px] max-w-[320px]'}`}>
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 pb-2 mb-4 border-b border-slate-100">
          <p className="font-bold text-slate-800">{label}</p>
        </div>
        <div className={`grid gap-x-6 gap-y-5 pb-2 ${mainEntries.length > 8 ? 'grid-cols-3' : mainEntries.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {mainEntries.map((entry: any, index: number) => {
            const prevEntry = isCompare ? payload.find((p: any) => p.name === `${entry.name} (Prev)`) : null;
            let varianceEl = null;

            if (prevEntry) {
              const diff = entry.value - prevEntry.value;
              const pct = prevEntry.value !== 0 ? (diff / prevEntry.value) * 100 : 0;
              const isPos = diff >= 0;
              varianceEl = (
                <div className={`text-[11px] font-bold mt-1.5 mb-1 ${isPos ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-1 rounded inline-block`}>
                  {isPos ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}% ({measure === 'count' ? `${new Intl.NumberFormat('id-ID').format(diff)} Trx` : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(diff)})
                </div>
              );
            }

            return (
              <div key={index} className="flex flex-col">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 truncate max-w-[180px]" style={{ color: entry.color }} title={entry.name}>
                  {entry.name}
                </p>
                <p className="text-[14px] font-bold text-slate-800 leading-none">
                  {measure === 'count' ? `${new Intl.NumberFormat('id-ID').format(entry.value)} Trx` : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(entry.value)}
                </p>
                {prevEntry && (
                  <p className="text-[10px] font-medium text-slate-400 mt-1 line-through">
                    Prev: {measure === 'count' ? `${new Intl.NumberFormat('id-ID').format(prevEntry.value)} Trx` : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(prevEntry.value)}
                  </p>
                )}
                <div>{varianceEl}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const extractAccountValue = (nodes: BalanceSheetNode[], keywords: string[]): number => {
  let total = 0;
  const search = (nodeList: BalanceSheetNode[]) => {
    for (const node of nodeList) {
      if (keywords.some(k => node.description.toLowerCase().includes(k))) {
        total += (node.balance || 0);
        continue; // Prevent double counting children if parent matches
      }
      if (node.children) search(node.children);
    }
  };
  search(nodes);
  return total;
};

// --- Financial Dashboards (Recharts) ---
export const EnterpriseFinancialChart: React.FC<{ reportName: string; reportParams: any }> = ({ reportName, reportParams }) => {
  const isIncExp = reportName.toLowerCase().includes('income and expense');
  const isNetWorth = reportName.toLowerCase().includes('net worth');
  const isLiquidity = reportName.toLowerCase().includes('liquidity');
  const isRoa = reportName.toLowerCase().includes('roa') || reportName.toLowerCase().includes('return on asset');
  const isRoe = reportName.toLowerCase().includes('roe') || reportName.toLowerCase().includes('return on equity');
  const isValCmp = reportName.toLowerCase().includes('value comparison');

  const evalYearFull = reportParams?.periodTo ? new Date(reportParams.periodTo).getFullYear().toString() : '2026';
  const evalYearShort = evalYearFull.slice(2);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  if (isIncExp) {
    const data = monthNames.map((m, i) => ({
      name: m,
      Income: 120000000 + (Math.random() * 50000000),
      Expense: 80000000 + (Math.random() * 40000000)
    }));
    return (
      <div className="w-full h-[500px] mt-8 bg-white border border-slate-200 rounded p-6 shadow-sm">
        <h3 className="text-center font-bold mb-6 text-lg">Income vs Expense Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e40505" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#e40505" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={yAxisFormatter} />
            <Tooltip content={<EnterpriseCustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="Income" stroke="#2563eb" fillOpacity={1} fill="url(#colorInc)" />
            <Area type="monotone" dataKey="Expense" stroke="#e40505" fillOpacity={1} fill="url(#colorExp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (isNetWorth) {
    return <NetWorthDashboard />;
  }

  if (isLiquidity) {
    return <LiquidityDashboard />;
  }

  if (isRoa || isRoe) {
    return <RoaRoeDashboard isRoa={isRoa} />;
  }

  // Dynamic BI Chart Builder State
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'composed' | 'pie'>('line');
  const [showLabels, setShowLabels] = useState(false);
  const [showBrush, setShowBrush] = useState(false);
  const [showRefLine, setShowRefLine] = useState(false);
  const [customTarget, setCustomTarget] = useState<number | ''>('');
  const [drilldownData, setDrilldownData] = useState<any>(null);
  const [measure, setMeasure] = useState<'balance' | 'debit' | 'credit' | 'count' | 'ytd'>('balance');
  const [dimension, setDimension] = useState<'date' | 'week' | 'month' | 'quarter' | 'semester' | 'year'>('month');
  const [compareMode, setCompareMode] = useState<'none' | 'yoy' | 'pop'>('none');
  const [splitAccounts, setSplitAccounts] = useState<string[]>(['Beban Komisi Penjualan', 'Biaya Gaji & Upah']);
  const [isSplitDropdownOpen, setIsSplitDropdownOpen] = useState(false);

  // Enterprise Feature: Interactive Legend State
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const toggleCategory = (cat: string) => {
    setHiddenCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const AVAILABLE_ACCOUNTS = [
    'Beban Komisi Penjualan',
    'Biaya Gaji & Upah',
    'Aktiva Tetap',
    'Akun Penys. Bangunan',
    'Akun Silang',
    'Asuransi Dibayar Dimuka',
    'BCA IDR',
    'Mandiri IDR',
    'Kas Kecil',
    'Pendapatan Bunga',
    'Piutang Usaha',
    'Hutang Dagang'
  ];

  // Generating mock data
  const komisiBase = [42000000, 5000000, 128000000, 78000000, 39000000, 102000000, 38000000, 103000000, 54000000, 58000000, 150000000, 125000000];
  const gajiBase = [67000000, 64000000, 65000000, 68000000, 67000000, 63000000, 59000000, 59000000, 72000000, 72000000, 72000000, 72000000];
  const countBase = [120, 15, 300, 210, 100, 250, 95, 260, 140, 155, 380, 310];

  // Apply measure variations
  const measureMultiplier = measure === 'debit' ? 1.15 : measure === 'credit' ? 0.85 : 1;
  const isCount = measure === 'count';
  const isYtd = measure === 'ytd';

  const getBaseValue = (idx: number, type: 'komisi' | 'gaji', isPrev = false) => {
    const periodModifier = isPrev ? (compareMode === 'yoy' ? 0.85 : 0.92) : 1;
    const safeIdx = idx % 12;
    if (isCount) return Math.round(countBase[safeIdx] * (type === 'komisi' ? 1 : 0.4) * periodModifier);
    return (type === 'komisi' ? komisiBase[safeIdx] : gajiBase[safeIdx]) * measureMultiplier * periodModifier;
  };

  // Data Aggregation Engine based on Dimension and Split By
  const activeCategories = splitAccounts.length > 0 ? splitAccounts : ['(No Account Selected)'];
  let processedData: any[] = [];

  // Create accumulator objects for ytd logic
  const accum: Record<string, number> = {};
  const accumPrev: Record<string, number> = {};
  activeCategories.forEach(cat => { accum[cat] = 0; accumPrev[cat] = 0; });

  const pushData = (label: string, startIndex: number, numMonths: number, divisor = 1) => {
    const node: any = { name: label };

    activeCategories.forEach((cat, idx) => {
      // Deterministic pseudo-randomness to show varied heights for different lines
      const varianceMod = 1 + (idx * 0.15) - (idx % 2 === 0 ? 0 : 0.05);

      let v = 0; let vPrev = 0;
      for (let i = 0; i < numMonths; i++) {
        v += getBaseValue(startIndex + i, idx % 2 === 0 ? 'komisi' : 'gaji') * varianceMod;
        vPrev += getBaseValue(startIndex + i, idx % 2 === 0 ? 'komisi' : 'gaji', true) * varianceMod;
      }

      v = v / divisor;
      vPrev = vPrev / divisor;

      accum[cat] += v;
      accumPrev[cat] += vPrev;

      node[cat] = isYtd ? accum[cat] : v;
      if (compareMode !== 'none') {
        node[`${cat} (Prev)`] = isYtd ? accumPrev[cat] : vPrev;
      }
    });

    processedData.push(node);
  };

  if (dimension === 'date') {
    for (let i = 1; i <= 31; i++) pushData(`${i} Jan '${evalYearShort}`, Math.floor(i / 3), 1, 10);
  } else if (dimension === 'week') {
    for (let i = 1; i <= 12; i++) pushData(`W${i} '${evalYearShort}`, i, 1, 4);
  } else if (dimension === 'month') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m, i) => pushData(`${m} '${evalYearShort}`, i, 1));
  } else if (dimension === 'quarter') {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    quarters.forEach((q, i) => pushData(`${q} '${evalYearShort}`, i * 3, 3));
  } else if (dimension === 'semester') {
    const semesters = ['H1', 'H2'];
    semesters.forEach((s, i) => pushData(`${s} '${evalYearShort}`, i * 6, 6));
  } else {
    pushData(`FY '${evalYearShort}`, 0, 12);
  }

  // SAP Fiori Horizon Enterprise Qualitative Palette (Highly Distinct & Accessible)
  const ENTERPRISE_COLORS = [
    '#5899DA', '#E8743B', '#19A979', '#ED4A7B', '#945ECF',
    '#13A4B4', '#525DF4', '#BF399E', '#6C8893', '#EE6868',
    '#2F6497', '#CC7B3A', '#2DA549', '#D64639', '#7E4E9E'
  ];

  // Golden Angle Infinite Color Generator
  const getChartColor = (idx: number, type: 'main' | 'prevBar' | 'prevLine' = 'main') => {
    if (idx < ENTERPRISE_COLORS.length) {
      const hex = ENTERPRISE_COLORS[idx];
      if (type === 'prevBar') return hex + '66'; // 40% opacity
      if (type === 'prevLine') return hex + '99'; // 60% opacity
      return hex;
    }
    // Infinite Generation via Golden Ratio (137.508 deg)
    const hue = (idx * 137.508) % 360;
    if (type === 'prevBar') return `hsla(${hue}, 70%, 50%, 0.4)`;
    if (type === 'prevLine') return `hsla(${hue}, 70%, 50%, 0.6)`;
    return `hsl(${hue}, 70%, 50%)`;
  };

  let totalSum = 0;
  let totalCount = 0;
  if (processedData.length > 0 && activeCategories.length > 0) {
    processedData.forEach(curr => {
      activeCategories.forEach(cat => {
        totalSum += (curr[cat] || 0);
        totalCount++;
      });
    });
  }
  const avgValue = totalCount > 0 ? totalSum / totalCount : 0;
  const finalTargetValue = customTarget !== '' ? customTarget : avgValue;

  // Enterprise Feature: AI Smart Insights Generator
  const generateSmartInsights = () => {
    if (processedData.length === 0 || activeCategories.length === 0) return null;

    const visibleCategories = activeCategories.filter(c => !hiddenCategories.includes(c));
    if (visibleCategories.length === 0) return null;

    const catTotals: Record<string, number> = {};
    visibleCategories.forEach(cat => catTotals[cat] = 0);

    let highestPoint = { cat: '', month: '', value: -Infinity };
    let lowestPoint = { cat: '', month: '', value: Infinity };

    let currentTotalSum = 0;
    let currentTotalCount = 0;

    processedData.forEach(d => {
      visibleCategories.forEach(cat => {
        const val = d[cat] || 0;
        catTotals[cat] += val;
        currentTotalSum += val;
        currentTotalCount++;

        if (val > highestPoint.value) highestPoint = { cat, month: d.name, value: val };
        if (val < lowestPoint.value) lowestPoint = { cat, month: d.name, value: val };
      });
    });

    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const topCat = sortedCats[0];
    const formatVal = (v: number) => measure === 'count' ? `${new Intl.NumberFormat('id-ID').format(v)} Trx` : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    const spread = highestPoint.value - lowestPoint.value;
    const currentAvg = currentTotalCount > 0 ? (currentTotalSum / currentTotalCount) : 0;

    let trendText = '';
    if (processedData.length >= 2) {
      const mid = Math.floor(processedData.length / 2);
      const firstHalfSum = processedData.slice(0, mid).reduce((acc, curr) => acc + visibleCategories.reduce((a, c) => a + (curr[c] || 0), 0), 0);
      const secondHalfSum = processedData.slice(mid).reduce((acc, curr) => acc + visibleCategories.reduce((a, c) => a + (curr[c] || 0), 0), 0);
      if (secondHalfSum > firstHalfSum * 1.05) trendText = 'Berdasarkan komparasi antar periode, grafik menunjukkan **Pertumbuhan Positif (Growth Area)** pada separuh akhir masa periode berjalan.';
      else if (secondHalfSum < firstHalfSum * 0.95) trendText = 'Berdasarkan komparasi antar periode, grafik mengindikasikan adanya **Perlambatan Aktivitas (Deceleration)** pada separuh akhir masa periode berjalan.';
      else trendText = 'Secara umum, konsistensi metrik berada pada tingkat yang **Relatif Stabil & Konstan** di sepanjang periode analitis.';
    }

    return (
      <div className="mt-8 mb-4 bg-white border border-slate-200 rounded-lg p-5 shadow-sm max-w-5xl mx-auto break-inside-avoid print:shadow-none">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="text-blue-600"><Sparkles className="w-5 h-5" /></div>
            <h4 className="font-extrabold text-[18px] text-slate-800 tracking-tight">Executive Summary & Insights</h4>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-lg">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Aggregate</p>
            <p className="text-[14px] font-extrabold text-slate-800 mt-1 truncate" title={formatVal(currentTotalSum)}>{formatVal(currentTotalSum)}</p>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-lg">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Period Average</p>
            <p className="text-[14px] font-extrabold text-slate-800 mt-1 truncate" title={formatVal(currentAvg)}>{formatVal(currentAvg)}</p>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-lg">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Peak Value</p>
            <p className="text-[14px] font-extrabold text-slate-800 mt-1 truncate" title={formatVal(highestPoint.value)}>{formatVal(highestPoint.value)}</p>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-lg">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Lowest Value</p>
            <p className="text-[14px] font-extrabold text-slate-800 mt-1 truncate" title={formatVal(lowestPoint.value)}>{formatVal(lowestPoint.value)}</p>
          </div>
        </div>

        <ul className="text-[13px] text-slate-700 space-y-2.5 list-none pl-0 leading-relaxed font-medium">
          <li className="flex items-start gap-2.5">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Akun <strong>{topCat[0]}</strong> adalah pendorong operasional utama (Top Contributor) dengan penguasaan porsi metrik agregat sebesar <strong className="text-blue-700">{formatVal(topCat[1])}</strong>.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span>Kinerja memuncak (*Peak Performance*) tercatat pada akun <strong>{highestPoint.cat}</strong> yang terjadi tepat pada <strong>{highestPoint.month}</strong>. Sebaliknya, titik paling rendah (*Lowest Value*) berasal dari akun <strong>{lowestPoint.cat}</strong> yang terjadi pada <strong>{lowestPoint.month}</strong>. Selisih dari kedua titik tersebut menciptakan rentang volatilitas (*Spread*) sebesar <strong>{formatVal(spread)}</strong>.</span>
          </li>
          {trendText && (
            <li className="flex items-start gap-2.5">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>{trendText.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-indigo-700">{part}</strong> : part)}</span>
            </li>
          )}
          {showRefLine && (
            <li className="flex items-start gap-2.5">
              <span className="text-rose-500 mt-0.5">•</span>
              <span>Garis ambang (*Target/KPI Benchmark*) sedang diproyeksikan pada level ekuilibrium <strong className="text-rose-600">{formatVal(finalTargetValue)}</strong> sebagai acuan evaluasi komprehensif.</span>
            </li>
          )}
        </ul>
      </div>
    );
  };

  const handleDrilldown = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      setDrilldownData({
        label: state.activeLabel,
        payload: state.activePayload,
        account: state.activePayload[0].name,
        entries: [
          { date: '12', no: 'JV-2609-0142', desc: 'Auto-accrual System Entry', debit: state.activePayload[0].value * 0.4, credit: 0 },
          { date: '18', no: 'JV-2609-0291', desc: 'Manual Adjustment (GL-04)', debit: state.activePayload[0].value * 0.2, credit: 0 },
          { date: '25', no: 'JV-2609-0418', desc: 'End of Period Closing', debit: state.activePayload[0].value * 0.4, credit: 0 }
        ]
      });
    }
  };

  const renderChart = () => {
    if (chartType === 'pie') {
      // Aggregate data for Pie Chart dynamically, respecting hidden categories
      const pieData = activeCategories
        .map((cat, idx) => ({
          name: cat,
          value: processedData.reduce((a, b) => a + (b[cat] || 0), 0),
          originalIndex: idx // Preserve index so colors match the legend perfectly
        }))
        .filter(d => !hiddenCategories.includes(d.name));

      return (
        <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <Tooltip formatter={(value: number) => measure === 'count' ? `${new Intl.NumberFormat('id-ID').format(value)} Trx` : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)} />
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getChartColor(entry.originalIndex)} />
            ))}
          </Pie>
        </RechartsPieChart>
      );
    }

    const props: any = { data: processedData, margin: { top: 20, right: 30, left: 20, bottom: 10 }, onClick: handleDrilldown, style: { cursor: 'pointer' } };
    const children = (
      <>
        {/* Enterprise Feature: Smooth Linear Gradients for Area Charts */}
        <defs>
          {activeCategories.map((cat, idx) => {
            if (hiddenCategories.includes(cat)) return null;
            const color = getChartColor(idx, 'main');
            return (
              <linearGradient key={`grad-${idx}`} id={`colorGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            );
          })}
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />
        <XAxis dataKey="name" tickLine={false} axisLine={true} tick={{ fill: '#475569', fontSize: 12 }} />
        <YAxis tickFormatter={yAxisFormatter} tickLine={false} axisLine={true} tick={{ fill: '#475569', fontSize: 12 }} />
        <Tooltip content={<EnterpriseCustomTooltip measure={measure} compareMode={compareMode} />} cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} />

        {showRefLine && (
          <ReferenceLine y={finalTargetValue} stroke="#e40505" strokeDasharray="4 4" strokeWidth={2} label={{ position: 'insideTopLeft', value: customTarget !== '' ? `Target KPI: ${yAxisFormatter(finalTargetValue)}` : `Mean: ${yAxisFormatter(finalTargetValue)}`, fill: '#e40505', fontSize: 11, fontWeight: 'bold' }} />
        )}

        {showBrush && (
          <Brush dataKey="name" height={30} stroke="#cbd5e1" tickFormatter={() => ''} travellerWidth={10} className="print:hidden" />
        )}

        {activeCategories.map((cat, idx) => {
          if (hiddenCategories.includes(cat)) return null; // Enterprise Feature: Hide series

          const color = getChartColor(idx, 'main');
          const prevBarColor = getChartColor(idx, 'prevBar');
          const prevLineColor = getChartColor(idx, 'prevLine');

          // Enterprise Feature: Polished Interactive Dots
          const dotProps = { r: 4, strokeWidth: 2, fill: '#fff', stroke: color };
          const activeDotProps = { r: 7, strokeWidth: 0, fill: color, style: { filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' } };

          return (
            <React.Fragment key={cat}>
              {compareMode !== 'none' && (
                (chartType === 'bar' || (chartType === 'composed' && idx === 0)) ? (
                  <Bar dataKey={`${cat} (Prev)`} fill={prevBarColor} radius={[4, 4, 0, 0]} />
                ) : (
                  <Line type="monotone" dataKey={`${cat} (Prev)`} stroke={prevLineColor} strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={false} />
                )
              )}
              {chartType === 'line' ? (
                <Line type="monotone" dataKey={cat} stroke={color} strokeWidth={3} dot={dotProps} activeDot={activeDotProps} label={showLabels ? { position: 'top', fill: '#64748b', fontSize: 10, formatter: yAxisFormatter } : false} />
              ) : chartType === 'bar' ? (
                <Bar dataKey={cat} fill={color} radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#64748b', fontSize: 10, formatter: yAxisFormatter } : false} />
              ) : chartType === 'composed' ? (
                idx === 0 ? <Bar dataKey={cat} fill={color} radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#64748b', fontSize: 10, formatter: yAxisFormatter } : false} /> : <Line type="monotone" dataKey={cat} stroke={color} strokeWidth={3} dot={dotProps} activeDot={activeDotProps} label={showLabels ? { position: 'top', fill: '#64748b', fontSize: 10, formatter: yAxisFormatter } : false} />
              ) : (
                <Area type="monotone" dataKey={cat} stroke={color} strokeWidth={3} fill={`url(#colorGrad-${idx})`} fillOpacity={1} activeDot={activeDotProps} label={showLabels ? { position: 'top', fill: '#64748b', fontSize: 10, formatter: yAxisFormatter } : false} />
              )}
            </React.Fragment>
          );
        })}
      </>
    );

    if (chartType === 'bar') return <BarChart {...props} barGap={0} barCategoryGap="15%">{children}</BarChart>;
    if (chartType === 'area') return <AreaChart {...props}>{children}</AreaChart>;
    if (chartType === 'composed') return <ComposedChart {...props} barGap={0} barCategoryGap="15%">{children}</ComposedChart>;
    return <LineChart {...props}>{children}</LineChart>;
  };

  return (
    <div className="w-full h-full flex flex-col">

      {/* Unified Enterprise Analytical Area (Flush Layout) */}
      <div className="w-full print-graph-scale print:h-auto break-inside-avoid">

        {/* Enterprise Analytical Toolbar (1-Row Stacked Design) */}
        <div className="py-3 px-6 border-b border-slate-200 print:hidden flex flex-wrap items-end justify-between gap-4 bg-slate-50/30 rounded-t-lg">

          {/* Chart Icons (Now on the Left) */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-lg shadow-sm h-[32px] items-center">
              <button onClick={() => setChartType('line')} title="Line Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'line' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}><TrendingUp className="w-[16px] h-[16px]" /></button>
              <button onClick={() => setChartType('bar')} title="Bar Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'bar' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}><BarChart2 className="w-[16px] h-[16px]" /></button>
              <button onClick={() => setChartType('area')} title="Area Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'area' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}><Activity className="w-[16px] h-[16px]" /></button>
              <div className="w-px bg-slate-200 mx-1 h-4"></div>
              <button onClick={() => setChartType('composed')} title="Composed Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'composed' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}><Layers className="w-[16px] h-[16px]" /></button>
              <button onClick={() => setChartType('pie')} title="Pie Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'pie' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}><PieChart className="w-[16px] h-[16px]" /></button>
              <div className="w-px bg-slate-200 mx-1 h-4"></div>
              <button onClick={() => setShowLabels(!showLabels)} title="Toggle Data Labels" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showLabels ? 'bg-indigo-100 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}><Hash className="w-[16px] h-[16px]" /></button>

              {/* Hybrid Target Input */}
              <div className="flex items-center gap-1 bg-white rounded-md p-0.5 border border-transparent transition-all mx-1 h-full">
                <button onClick={() => setShowRefLine(!showRefLine)} title="Toggle Target Line" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showRefLine ? 'bg-rose-100 text-rose-700 font-bold shadow-sm' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'}`}><Target className="w-[16px] h-[16px]" /></button>
                {showRefLine && (
                  <input
                    type="number"
                    placeholder="Auto Mean..."
                    value={customTarget}
                    onChange={e => setCustomTarget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-[110px] text-[12px] px-2 h-full border border-slate-200 rounded text-rose-700 placeholder-slate-400 focus:outline-none focus:border-rose-400 bg-white font-bold shadow-inner"
                  />
                )}
              </div>

              <button onClick={() => setShowBrush(!showBrush)} title="Toggle Timeline Zoom (Brush)" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showBrush ? 'bg-amber-100 text-amber-600 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}><Maximize2 className="w-[16px] h-[16px]" /></button>
            </div>
          </div>

          {/* Analytical Filters (Now on the Right) */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Measure</span>
              <select value={measure} onChange={(e: any) => setMeasure(e.target.value)} className="text-[12px] border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 font-bold cursor-pointer shadow-sm hover:border-slate-300 transition-colors h-[32px]">
                <option value="balance">Account Amount</option>
                <option value="debit">Debit Amount</option>
                <option value="credit">Credit Amount</option>
                <option value="ytd">YTD Accumulation</option>
                <option value="count">Total Data (Count)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dimension</span>
              <select value={dimension} onChange={(e: any) => setDimension(e.target.value)} className="text-[12px] border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 font-bold cursor-pointer shadow-sm hover:border-slate-300 transition-colors h-[32px]">
                <option value="date">Date (Daily)</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="semester">Semester</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                Split By <span className="text-blue-500" title="Select multiple accounts to compare">*</span>
              </span>

              <div
                className="text-[12px] border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 font-bold cursor-pointer shadow-sm hover:border-slate-300 transition-colors flex items-center justify-between min-w-[160px] h-[32px]"
                onClick={() => setIsSplitDropdownOpen(!isSplitDropdownOpen)}
              >
                <span className="truncate max-w-[110px]">
                  {splitAccounts.length === 0 ? 'Select Accounts...' : `${splitAccounts.length} Account${splitAccounts.length > 1 ? 's' : ''}`}
                </span>
                <span className="text-slate-400 text-[10px]">▼</span>
              </div>

              {isSplitDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSplitDropdownOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 shadow-xl rounded-lg z-50 p-2 max-h-60 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-2 mb-2 border-b border-slate-100 flex justify-between items-center">
                      Select Accounts
                      <button onClick={() => setSplitAccounts([])} className="text-blue-500 hover:text-blue-700 hover:underline">Clear All</button>
                    </div>
                    {AVAILABLE_ACCOUNTS.map(acc => (
                      <label key={acc} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={splitAccounts.includes(acc)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSplitAccounts([...splitAccounts, acc]);
                            } else {
                              setSplitAccounts(splitAccounts.filter(a => a !== acc));
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[12px] font-semibold text-slate-700 truncate">{acc}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                Compare {chartType === 'pie' && <span className="text-rose-500" title="Locked in Pie Chart mode">*</span>}
              </span>
              <select
                value={compareMode}
                onChange={(e: any) => setCompareMode(e.target.value)}
                disabled={chartType === 'pie'}
                className="text-[12px] border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 font-bold cursor-pointer shadow-sm hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 h-[32px]">
                <option value="none">None</option>
                <option value="yoy">Prev. Year (YoY)</option>
                <option value="pop">Prev. Period (PoP)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Chart Canvas Area */}
        <div className="p-8 print:px-0 print:pt-12 print:pb-8">
          <div className="flex flex-col items-center mb-6 print:mb-6">
            <h4 className="text-[16px] font-bold text-slate-500 mb-1">PT. Rezeki Nadh Fathan</h4>
            <h3 className="text-center font-extrabold text-[22px] text-slate-800 tracking-tight">Account Value Comparison Graph</h3>
            <p className="text-[14px] font-semibold text-slate-500 mt-1">
              {dimension === 'month' ? 'Monthly Trend' : dimension === 'quarter' ? 'Quarterly Accumulation' : dimension === 'semester' ? 'Semester Trend' : dimension === 'week' ? 'Weekly Trend' : dimension === 'date' ? 'Daily Trend' : 'Financial Period Total'} (01 Jan - 31 Dec {evalYearFull})
            </p>
          </div>

          <div className="w-full h-[450px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Custom Enterprise HTML Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 px-4">
            {activeCategories.map((cat, idx) => {
              const color = getChartColor(idx, 'main');
              const isHidden = hiddenCategories.includes(cat);
              return (
                <div
                  key={`legend-${cat}`}
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all cursor-pointer select-none shadow-sm hover:shadow-md active:scale-95
                    ${isHidden ? 'bg-white border-slate-200 opacity-60 grayscale' : 'bg-white border-slate-100'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full transition-all ${isHidden ? 'bg-slate-300' : ''}`} style={{ backgroundColor: isHidden ? undefined : color, boxShadow: isHidden ? 'none' : `0 0 8px ${color}66` }}></div>
                    <span className={`text-[12px] font-bold transition-all ${isHidden ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{cat}</span>
                  </div>
                </div>
              );
            })}

            {compareMode !== 'none' && (
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm ml-2">
                <div className="flex items-center opacity-70">
                  <div className="w-3 h-3 rounded-[3px] bg-slate-400"></div>
                </div>
                <span className="text-[11px] font-bold text-slate-600 tracking-wide uppercase">Warna Pudar = Data Sebelumnya</span>
              </div>
            )}
          </div>

          {/* Render the AI Smart Insights */}
          {generateSmartInsights()}

          {/* Enterprise Drilldown Modal */}
          {drilldownData && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center print:hidden">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrilldownData(null)}></div>
              <div className="bg-white w-[600px] max-w-[90vw] rounded-xl shadow-2xl relative z-10 flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><MousePointerClick className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-[16px] leading-tight">Ledger Transactions</h3>
                      <p className="text-[12px] text-slate-500 font-semibold">{drilldownData.account} • {drilldownData.label}</p>
                    </div>
                  </div>
                  <button onClick={() => setDrilldownData(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-[12px] text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 whitespace-nowrap">Date</th>
                          <th className="py-2.5 px-4 whitespace-nowrap">Doc. No</th>
                          <th className="py-2.5 px-4 w-full">Description</th>
                          <th className="py-2.5 px-4 text-right whitespace-nowrap">Amount (IDR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {drilldownData.entries.map((entry: any, i: number) => (
                          <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                            <td className="py-3 px-4 font-medium">{entry.date} {drilldownData.label.replace(/['0-9]/g, '').trim()} '26</td>
                            <td className="py-3 px-4 text-blue-600 font-medium hover:underline cursor-pointer">{entry.no}</td>
                            <td className="py-3 px-4">{entry.desc}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800">{new Intl.NumberFormat('id-ID').format(entry.debit)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-800">
                        <tr>
                          <td colSpan={3} className="py-3 px-4 text-right uppercase text-[11px] tracking-wider text-slate-500">Total Period Amount</td>
                          <td className="py-3 px-4 text-right">{new Intl.NumberFormat('id-ID').format(drilldownData.payload[0].value)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-end">
                  <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Export to Excel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
