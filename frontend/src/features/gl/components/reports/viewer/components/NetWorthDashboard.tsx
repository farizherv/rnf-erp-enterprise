import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, PieChart, Pie, Cell, Label
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Calendar, MousePointerClick, Info, BarChart2, Layers, Target, Hash, Sparkles, ChevronDown, Check, Scale, Download } from 'lucide-react';
import { yAxisFormatter } from '../utils';
import { generateNetWorthData, type NetWorthTrendData } from './netWorthMockData';

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label, measure }: { active?: boolean; payload?: unknown[]; label?: string; measure?: string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as NetWorthTrendData;
    const isPred = data.isPredictive;

    const formatVal = (val: number) => {
      if (measure === 'growth' || measure === 'composition') return `${val.toFixed(1)}%`;
      if (measure === 'leverage') return `${val.toFixed(2)}x`;
      return yAxisFormatter(val);
    };

    // Calculate MoM Momentum if not Jan
    let momAssets = 0;
    let momLiab = 0;
    let momNW = 0;

    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-xl min-w-[280px]">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
          <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            {label} {isPred && (
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 ml-1">
                <div className="w-3 h-3 border-2 border-dashed border-slate-400 rounded-[3px]"></div>
                AI Forecast
              </span>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-[3px] ${isPred ? 'bg-emerald-300' : 'bg-emerald-500'}`}></div>
              <span className="text-sm font-medium text-slate-600">{measure === 'leverage' ? 'Eq Multiplier' : 'Assets'}</span>
            </div>
            <span className="font-bold text-slate-800">
              {formatVal(isPred ? data.predAssets! : data.assets!)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-[3px] ${isPred ? 'bg-rose-300' : 'bg-rose-500'}`}></div>
              <span className="text-sm font-medium text-slate-600">{measure === 'leverage' ? 'Debt to Eq (DER)' : 'Liabilities'}</span>
            </div>
            <span className="font-bold text-slate-800">
              {formatVal(isPred ? data.predLiabilities! : data.liabilities!)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">{measure === 'leverage' ? 'Debt to Asset' : 'Net Worth'}</span>
            <span className={`font-black ${data.netWorth! >= 0 || data.predNetWorth! >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {formatVal(isPred ? data.predNetWorth! : data.netWorth!)}
            </span>
          </div>
        </div>

        {!isPred && (
          <div className="mt-3 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <MousePointerClick className="w-3 h-3" /> Click column to view composition
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const NetWorthDashboard: React.FC = () => {
  const { trendData, drillDownData } = useMemo(() => generateNetWorthData(), []);

  const [selectedMonth, setSelectedMonth] = useState<string>('Dec');
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  const [measure, setMeasure] = useState('nominal');
  const [dimension, setDimension] = useState('month');
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const displayData = useMemo(() => {
    let processed = trendData;

    // Dimension processing
    if (dimension === 'quarter') {
       // Filter down to quarter ends for Balance Sheet snapshot
       processed = trendData.filter(d => ['Mar', 'Jun', 'Sep', 'Dec', 'Mar (Est)'].includes(d.name));
       processed = processed.map(d => {
         let newName = d.name;
         if (d.name === 'Mar') newName = 'Q1';
         if (d.name === 'Jun') newName = 'Q2';
         if (d.name === 'Sep') newName = 'Q3';
         if (d.name === 'Dec') newName = 'Q4';
         if (d.name === 'Mar (Est)') newName = 'Q1 (Est)';
         return { ...d, name: newName };
       });
    }

    if (measure === 'growth') {
      processed = processed.map((d, i, arr) => {
        if (i === 0) return { ...d, assets: 0, liabilities: 0, netWorth: 0, predAssets: 0, predLiabilities: 0, predNetWorth: 0 };
        const prev = arr[i - 1];
        const gAssets = prev.assets ? ((d.assets || d.predAssets || 0) - prev.assets) / prev.assets * 100 : 0;
        const gLiab = prev.liabilities ? ((d.liabilities || d.predLiabilities || 0) - prev.liabilities) / prev.liabilities * 100 : 0;
        const gNw = prev.netWorth ? ((d.netWorth || d.predNetWorth || 0) - prev.netWorth) / prev.netWorth * 100 : 0;
        return {
          ...d,
          assets: d.isPredictive ? null : gAssets,
          liabilities: d.isPredictive ? null : gLiab,
          netWorth: d.isPredictive ? null : gNw,
          predAssets: d.isPredictive ? gAssets : null,
          predLiabilities: d.isPredictive ? gLiab : null,
          predNetWorth: d.isPredictive ? gNw : null,
        }
      });
    } else if (measure === 'composition') {
      processed = processed.map(d => ({
        ...d,
        assets: d.isPredictive ? null : 100,
        liabilities: d.isPredictive ? null : (d.liabilities! / d.assets!) * 100,
        netWorth: d.isPredictive ? null : (d.netWorth! / d.assets!) * 100,
        predAssets: d.isPredictive ? 100 : null,
        predLiabilities: d.isPredictive ? (d.predLiabilities! / d.predAssets!) * 100 : null,
        predNetWorth: d.isPredictive ? (d.predNetWorth! / d.predAssets!) * 100 : null,
      }));
    } else if (measure === 'leverage') {
      processed = processed.map(d => ({
        ...d,
        assets: d.isPredictive ? null : (d.assets! / d.netWorth!),
        liabilities: d.isPredictive ? null : (d.liabilities! / d.netWorth!),
        netWorth: d.isPredictive ? null : (d.liabilities! / d.assets!),
        predAssets: d.isPredictive ? (d.predAssets! / d.predNetWorth!) : null,
        predLiabilities: d.isPredictive ? (d.predLiabilities! / d.predNetWorth!) : null,
        predNetWorth: d.isPredictive ? (d.predLiabilities! / d.predAssets!) : null,
      }));
    }

    // Bridge the gap for predictive continuity
    const firstPredIndex = processed.findIndex(d => d.isPredictive);
    if (firstPredIndex > 0) {
      const lastActual = processed[firstPredIndex - 1];
      processed = [...processed];
      processed[firstPredIndex - 1] = {
        ...lastActual,
        predAssets: lastActual.assets,
        predLiabilities: lastActual.liabilities,
        predNetWorth: lastActual.netWorth,
      };
    }

    return processed;
  }, [trendData, dimension, measure]);

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const handleExportCSV = () => {
    const headers = ['Month', 'Assets', 'Liabilities', 'Net Worth', 'Pred Assets', 'Pred Liabilities', 'Pred Net Worth'];
    const csvContent = trendData.map(d =>
      `${d.name},${d.assets || ''},${d.liabilities || ''},${d.netWorth || ''},${d.predAssets || ''},${d.predLiabilities || ''},${d.predNetWorth || ''}`
    );
    const csvString = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'net_worth_forecast.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations (Latest Actual Month - Dec)
  const actualsOnly = trendData.filter(d => !d.isPredictive);
  const latestActual = actualsOnly[actualsOnly.length - 1];
  const prevActual = actualsOnly[actualsOnly.length - 2];

  const currentAssets = latestActual.assets || 0;
  const currentLiab = latestActual.liabilities || 0;
  const currentNW = latestActual.netWorth || 0;

  const der = currentLiab / currentNW;

  // YoY Growth Mock (Comparing Dec to theoretical prev Dec)
  const assetGrowth = ((currentAssets - (currentAssets * 0.92)) / (currentAssets * 0.92)) * 100;
  const liabGrowth = ((currentLiab - (currentLiab * 1.05)) / (currentLiab * 1.05)) * 100;
  const nwGrowth = ((currentNW - (currentNW * 0.85)) / (currentNW * 0.85)) * 100;

  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'composed'>('composed');
  const [showLabels, setShowLabels] = useState(false);
  const [showRefLine, setShowRefLine] = useState(true);
  const [customTarget, setCustomTarget] = useState<number | ''>(130000000);
  const [targetDisplay, setTargetDisplay] = useState('130.000.000');

  const currentDrillDown = drillDownData[selectedMonth];

  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length) {
      const data = state.activePayload[0].payload as NetWorthTrendData;
      if (data && !data.isPredictive && drillDownData[data.name]) {
        setSelectedMonth(data.name);
        return;
      }
    }
    if (state && state.activeLabel) {
      const month = String(state.activeLabel);
      if (drillDownData[month]) {
        setSelectedMonth(month);
      }
    }
  };

  return (
    <div className="w-full bg-slate-50/50 p-6 rounded-2xl border border-slate-200">

      {/* Header & Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600" />
            Net Worth Overview
          </h2>
          <p className="text-slate-500 text-sm mt-1">Holistic view of assets, liabilities, and retained equity valuation.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium text-sm">
          <Download className="w-4 h-4 text-slate-500" /> Export Data
        </button>
      </div>

      {/* KPI Cards (Fiori Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Total Assets</p>
          <h3 className="text-3xl font-black text-slate-800 relative z-10">{yAxisFormatter(currentAssets)}</h3>
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded ${assetGrowth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {assetGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(assetGrowth).toFixed(1)}% YoY
            </span>
            <span className="text-xs text-slate-400 font-medium">vs Last Year</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Total Liabilities</p>
          <h3 className="text-3xl font-black text-slate-800 relative z-10">{yAxisFormatter(currentLiab)}</h3>
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded ${liabGrowth <= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {liabGrowth <= 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
              {Math.abs(liabGrowth).toFixed(1)}% YoY
            </span>
            <span className="text-xs text-slate-400 font-medium">vs Last Year</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Current Net Worth</p>
          <h3 className="text-3xl font-black text-indigo-700 relative z-10">{yAxisFormatter(currentNW)}</h3>
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded ${nwGrowth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {nwGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(nwGrowth).toFixed(1)}% YoY
            </span>
            <span className="text-xs text-slate-400 font-medium">vs Last Year</span>
          </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 print:shadow-none print:border-none print:p-0">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center print:hidden">
            <h3 className="font-bold text-slate-800 text-lg">Assets vs Liabilities Trajectory</h3>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <button onClick={() => toggleSeries('assets')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['assets'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-emerald-500 rounded-[3px]"></div> Assets</button>
              <button onClick={() => toggleSeries('liabilities')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['liabilities'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-rose-500 rounded-[3px]"></div> Liabilities</button>
              <button onClick={() => toggleSeries('networth')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['networth'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-indigo-600 rounded-[3px]"></div> Net Worth</button>
              <button onClick={() => toggleSeries('predictive')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['predictive'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 border-2 border-dashed border-slate-400 rounded-[3px]"></div> AI Forecast</button>
            </div>
          </div>

          {/* Top Toolbar Control Center */}
          <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-lg p-2 shadow-sm print:hidden">
            {/* Chart Icons */}
            <div className="flex items-center gap-3">
              <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-sm h-[32px] items-center shrink-0">
                <button onClick={() => setChartType('line')} title="Line Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'line' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><TrendingUp className="w-[16px] h-[16px]" /></button>
                <button onClick={() => setChartType('bar')} title="Bar Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'bar' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><BarChart2 className="w-[16px] h-[16px]" /></button>
                <button onClick={() => setChartType('area')} title="Area Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'area' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Activity className="w-[16px] h-[16px]" /></button>
                <div className="w-px bg-slate-200 mx-1 h-4"></div>
                <button onClick={() => setChartType('composed')} title="Composed Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'composed' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Layers className="w-[16px] h-[16px]" /></button>
                <div className="w-px bg-slate-200 mx-1 h-4"></div>
                <button onClick={() => setShowLabels(!showLabels)} title="Toggle Data Labels" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showLabels ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Hash className="w-[16px] h-[16px]" /></button>
                
                <div className="w-1.5"></div>

                <button onClick={() => setShowRefLine(!showRefLine)} disabled={measure !== 'nominal'} title={measure === 'nominal' ? "Toggle Target Line" : "Target Line only available in Nominal mode"} className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showRefLine && measure === 'nominal' ? 'bg-rose-100 text-rose-700 shadow-sm' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'} ${measure !== 'nominal' ? 'opacity-30 cursor-not-allowed' : ''}`}>
                  <Target className="w-[16px] h-[16px] stroke-[2.5]" />
                </button>
                {showRefLine && measure === 'nominal' && (
                  <div className="flex items-center h-[26px] ml-1 px-1.5 bg-white border border-slate-200 rounded-md shadow-sm focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all duration-200">
                    <input
                      type="text"
                      placeholder="Target..."
                      value={targetDisplay}
                      onFocus={(e) => {
                        setTargetDisplay(customTarget.toString());
                        e.target.select();
                      }}
                      onBlur={() => {
                        const parsed = parseInt(targetDisplay.replace(/,/g, ''), 10);
                        if (!isNaN(parsed)) {
                          setCustomTarget(parsed);
                          setTargetDisplay(new Intl.NumberFormat('en-US').format(parsed));
                        } else {
                          setCustomTarget('');
                          setTargetDisplay('');
                        }
                      }}
                      onChange={e => setTargetDisplay(e.target.value)}
                      className="w-[100px] text-[13px] h-full outline-none text-rose-700 placeholder-slate-400 bg-transparent font-black text-center"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right side of toolbar (Matching OVP style exactly) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Measure</span>
                <div className="relative">
                  <select value={measure} onChange={(e) => setMeasure(e.target.value)} className="text-[12px] border border-slate-200 rounded-md px-3 py-1 bg-white focus:outline-none text-slate-700 font-bold appearance-none pr-8 h-[28px] cursor-pointer outline-none">
                    <option value="nominal">Nominal (IDR)</option>
                    <option value="growth">Growth (%)</option>
                    <option value="composition">Composition (%)</option>
                    <option value="leverage">Leverage (x)</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dimension</span>
                <div className="relative">
                  <select value={dimension} onChange={(e) => setDimension(e.target.value)} className="text-[12px] border border-slate-200 rounded-md px-3 py-1 bg-white focus:outline-none text-slate-700 font-bold appearance-none pr-8 h-[28px] cursor-pointer outline-none">
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} onClick={handleChartClick} style={{ cursor: 'pointer' }} barGap={0} barCategoryGap="20%">
              <defs>
                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLiab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <pattern id="diagonalHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="4" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
              </defs>
              <ReferenceArea x1={dimension === 'quarter' ? "Q4" : "Dec"} x2={dimension === 'quarter' ? "Q1 (Est)" : "Mar (Est)"} fill="#f1f5f9" fillOpacity={1} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis 
                tickFormatter={(val) => {
                  if (measure === 'growth' || measure === 'composition') return `${val.toFixed(0)}%`;
                  if (measure === 'leverage') return `${val.toFixed(1)}x`;
                  return yAxisFormatter(val);
                }} 
                axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} 
              />
              <RechartsTooltip content={<CustomTooltip measure={measure} />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />

              <ReferenceLine x={dimension === 'quarter' ? "Q4" : "Dec"} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'AI Prediction ➔', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
              {showRefLine && customTarget !== '' && measure === 'nominal' && (
                <ReferenceLine y={Number(customTarget)} stroke="#f43f5e" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Monthly Limit Target', fill: '#f43f5e', fontSize: 11, fontWeight: 'bold' }} />
              )}

              {/* Dynamic Chart Elements based on chartType */}
              {(chartType === 'area' || chartType === 'composed') && (
                <>
                  {measure !== 'composition' && (
                    <Area hide={!!hiddenSeries['assets']} type="monotone" dataKey="assets" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAssets)" activeDot={{ r: 6, strokeWidth: 0 }} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: yAxisFormatter } : false} />
                  )}
                  <Area hide={!!hiddenSeries['liabilities']} stackId={measure === 'composition' ? "1" : undefined} type="monotone" dataKey="liabilities" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorLiab)" activeDot={{ r: 6, strokeWidth: 0 }} label={showLabels ? { position: 'bottom', fill: '#f43f5e', fontSize: 10, formatter: yAxisFormatter } : false} />
                  
                  {/* Predictive Areas (Continuation of Gradient, No Stroke) */}
                  {measure !== 'composition' && (
                    <Area hide={!!hiddenSeries['predictive']} type="monotone" dataKey="predAssets" stroke="none" fillOpacity={1} fill="url(#colorAssets)" activeDot={false} />
                  )}
                  <Area hide={!!hiddenSeries['predictive']} stackId={measure === 'composition' ? "2" : undefined} type="monotone" dataKey="predLiabilities" stroke="none" fillOpacity={1} fill="url(#colorLiab)" activeDot={false} />
                </>
              )}

              {chartType === 'line' && (
                <>
                  {measure !== 'composition' && (
                    <Line hide={!!hiddenSeries['assets']} type="monotone" dataKey="assets" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: yAxisFormatter } : false} />
                  )}
                  <Line hide={!!hiddenSeries['liabilities']} type="monotone" dataKey="liabilities" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'bottom', fill: '#f43f5e', fontSize: 10, formatter: yAxisFormatter } : false} />
                </>
              )}

              {/* In composed mode, Bar for Assets/Liab and Line for NW */}
              {chartType === 'bar' && (
                <>
                  {measure !== 'composition' && (
                    <Bar hide={!!hiddenSeries['assets']} dataKey="assets" fill="#10b981" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: yAxisFormatter } : false} />
                  )}
                  <Bar hide={!!hiddenSeries['liabilities']} stackId={measure === 'composition' ? "1" : undefined} dataKey="liabilities" fill="#f43f5e" radius={measure === 'composition' ? [0, 0, 0, 0] : [4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#f43f5e', fontSize: 10, formatter: yAxisFormatter } : false} />
                </>
              )}

              {/* Net Worth Component */}
              {(chartType === 'line' || chartType === 'composed' || chartType === 'area') && (
                measure === 'composition' ? (
                  <Area hide={!!hiddenSeries['networth']} stackId="1" type="monotone" dataKey="netWorth" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" activeDot={{ r: 6, strokeWidth: 0 }} />
                ) : (
                  <Line hide={!!hiddenSeries['networth']} type="monotone" dataKey="netWorth" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: yAxisFormatter, fontWeight: 'bold' } : false} />
                )
              )}
              {chartType === 'bar' && (
                measure === 'composition' ? (
                  <Bar hide={!!hiddenSeries['networth']} stackId="1" dataKey="netWorth" fill="#4f46e5" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: yAxisFormatter } : false} />
                ) : (
                  <Line hide={!!hiddenSeries['networth']} type="monotone" dataKey="netWorth" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: yAxisFormatter, fontWeight: 'bold' } : false} />
                )
              )}

              {/* Predictive Lines (Dashed) */}
              {chartType !== 'bar' && (
                <>
                  {measure !== 'composition' && (
                    <Line hide={!!hiddenSeries['predictive']} type="monotone" dataKey="predAssets" stroke="#34d399" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                  )}
                  {measure !== 'composition' && (
                    <Line hide={!!hiddenSeries['predictive']} type="monotone" dataKey="predLiabilities" stroke="#fb7185" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                  )}
                  {measure === 'composition' ? (
                    <Area hide={!!hiddenSeries['predictive'] || !!hiddenSeries['networth']} stackId="2" type="monotone" dataKey="predNetWorth" stroke="none" fillOpacity={1} fill="url(#colorNetWorth)" activeDot={false} />
                  ) : (
                    <Line hide={!!hiddenSeries['predictive'] || !!hiddenSeries['networth']} type="monotone" dataKey="predNetWorth" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: yAxisFormatter, fontWeight: 'bold' } : false} />
                  )}
                </>
              )}
              {chartType === 'bar' && (
                <>
                  {measure !== 'composition' && (
                    <Bar hide={!!hiddenSeries['predictive']} dataKey="predAssets" fill="url(#diagonalHatch)" stroke="#34d399" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#34d399', fontSize: 10, formatter: yAxisFormatter } : false} />
                  )}
                  <Bar hide={!!hiddenSeries['predictive']} stackId={measure === 'composition' ? "2" : undefined} dataKey="predLiabilities" fill="url(#diagonalHatch)" stroke="#fb7185" radius={measure === 'composition' ? [0, 0, 0, 0] : [4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#fb7185', fontSize: 10, formatter: yAxisFormatter } : false} />
                  
                  {measure === 'composition' ? (
                    <Bar hide={!!hiddenSeries['predictive'] || !!hiddenSeries['networth']} stackId="2" dataKey="predNetWorth" fill="url(#diagonalHatch)" stroke="#4f46e5" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: yAxisFormatter } : false} />
                  ) : (
                    <Line hide={!!hiddenSeries['predictive'] || !!hiddenSeries['networth']} type="monotone" dataKey="predNetWorth" stroke="#4f46e5" strokeWidth={4} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                  )}
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill-down Section (Odoo Style) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Asset & Liability Composition:
            <div className="relative ml-2">
              <button
                onClick={() => setIsMonthSelectOpen(!isMonthSelectOpen)}
                onBlur={() => setTimeout(() => setIsMonthSelectOpen(false), 200)}
                className="flex items-center justify-between gap-3 border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm min-w-[100px]"
              >
                {selectedMonth} <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {isMonthSelectOpen && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                    {Object.keys(drillDownData).map(m => (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedMonth(m);
                          setIsMonthSelectOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors
                          ${selectedMonth === m ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {m}
                        {selectedMonth === m && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </h3>
          <div className="text-sm text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <Info className="w-4 h-4 text-slate-400" />
            Click on a month in the chart or use the dropdown above
          </div>
        </div>

        {currentDrillDown ? (
            (() => {
              const drillDownTotalAssets = currentDrillDown.assets.reduce((sum: number, item: any) => sum + item.value, 0);
              const drillDownTotalLiabilities = currentDrillDown.liabilities.reduce((sum: number, item: any) => sum + item.value, 0);

              const CustomCenterLabel = ({ total, label }: any) => {
                return (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                    <tspan x="50%" dy="-12" fontSize="11" fill="#64748b" className="uppercase font-bold tracking-wider">{label}</tspan>
                    <tspan x="50%" dy="24" fontSize="16" fill="#0f172a" fontWeight="900">{yAxisFormatter(total)}</tspan>
                  </text>
                );
              };

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Asset Distribution Donut */}
                  <div className="flex flex-col items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Asset Distribution
                    </h4>
                    <div className="h-64 w-full flex justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            key={selectedMonth}
                            data={currentDrillDown.assets}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {currentDrillDown.assets.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <Label content={<CustomCenterLabel total={drillDownTotalAssets} label="Total Assets" />} position="center" />
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number, name: string, props: any) => [
                              `${yAxisFormatter(value)} (${((value / drillDownTotalAssets) * 100).toFixed(1)}%)`, 
                              name
                            ]} 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 'bold', color: '#334155' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Enterprise Legend for Assets */}
                    <div className="w-full max-w-sm mt-8 space-y-2">
                      {currentDrillDown.assets.map((entry: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-800">{yAxisFormatter(entry.value)}</span>
                            <span className="text-xs font-bold text-slate-400 w-10 text-right">{((entry.value / drillDownTotalAssets) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Liabilities Donut */}
                  <div className="flex flex-col items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      Liability Distribution
                    </h4>
                    <div className="h-64 w-full flex justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            key={selectedMonth}
                            data={currentDrillDown.liabilities}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {currentDrillDown.liabilities.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <Label content={<CustomCenterLabel total={drillDownTotalLiabilities} label="Total Liabilities" />} position="center" />
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number, name: string, props: any) => [
                              `${yAxisFormatter(value)} (${((value / drillDownTotalLiabilities) * 100).toFixed(1)}%)`, 
                              name
                            ]} 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 'bold', color: '#334155' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Enterprise Legend for Liabilities */}
                    <div className="w-full max-w-sm mt-8 space-y-2">
                      {currentDrillDown.liabilities.map((entry: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-800">{yAxisFormatter(entry.value)}</span>
                            <span className="text-xs font-bold text-slate-400 w-10 text-right">{((entry.value / drillDownTotalLiabilities) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-slate-400 italic bg-slate-50/50 rounded-xl border border-slate-100 text-sm text-center px-4">
            Composition data not available for forecasted periods.
          </div>
        )}
      </div>

      {/* AI Smart Insights (Enterprise Analytical Summary) */}
      <div className="mt-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-3">
          <div className="text-blue-600"><Sparkles className="w-5 h-5" /></div>
          <h4 className="font-extrabold text-[18px] text-slate-800 tracking-tight">Executive Summary & Insights</h4>
        </div>


        <ul className="text-[14px] text-slate-700 space-y-3 list-none pl-0 leading-relaxed font-medium">
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-indigo-600 rounded-[3px]"></div>
            <span>
              <strong>Net Worth Dynamics:</strong> Kekayaan bersih perusahaan tumbuh sebesar <strong className={nwGrowth > 0 ? 'text-indigo-600' : 'text-rose-600'}>{nwGrowth.toFixed(1)}% YoY</strong>. Valuasi saat ini kokoh di angka <strong className="text-indigo-600">{yAxisFormatter(currentNW)}</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-emerald-500 rounded-[3px]"></div>
            <span>
              <strong>Asset Accumulation:</strong> Total aset mengalami {assetGrowth > 0 ? 'peningkatan' : 'penurunan'} sebesar <strong className={assetGrowth > 0 ? 'text-emerald-600' : 'text-rose-600'}>{Math.abs(assetGrowth).toFixed(1)}% YoY</strong>, dipimpin oleh penguatan pada aset lancar (*Cash & Equivalents*).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-rose-500 rounded-[3px]"></div>
            <span>
              <strong>Liability Management:</strong> Total kewajiban tercatat sebesar <strong className="text-rose-600">{yAxisFormatter(currentLiab)}</strong>. {liabGrowth > 0 ? 'Terjadi peningkatan' : 'Terjadi efisiensi'} beban utang sebesar <strong className={liabGrowth > 0 ? 'text-rose-600' : 'text-emerald-600'}>{Math.abs(liabGrowth).toFixed(1)}% YoY</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-sky-500 rounded-[3px]"></div>
            <span>
              <strong>Solvency Health (DER):</strong> Rasio utang terhadap ekuitas (*Debt-to-Equity*) berada di level yang <strong className={der < 1.5 ? 'text-sky-600' : 'text-rose-600'}>{der < 1.5 ? 'sangat sehat' : 'perlu diwaspadai'} ({der.toFixed(2)}x)</strong>, {der < 1.5 ? 'jauh di bawah ambang batas' : 'mendekati ambang batas'} risiko (*Target &lt; 1.5x*).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 border-2 border-dashed border-slate-400 rounded-[3px]"></div>
            <span>
              <strong>AI Forward Prediction:</strong> Sistem algoritma prediktif mengestimasikan Net Worth akan terus berekspansi di kuartal pertama tahun depan, diproyeksikan menembus <strong className="text-indigo-600">{yAxisFormatter(trendData[14].predNetWorth!)}</strong> pada bulan Maret.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
