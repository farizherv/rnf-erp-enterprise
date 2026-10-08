import React, { useState, useMemo } from 'react';
import {
  ComposedChart, AreaChart, LineChart, BarChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Legend, PieChart, Pie, Cell, Label
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Activity, AlertCircle, Info, Download, Sparkles, PieChart as PieChartIcon, BarChart2, ChevronDown, Layers, Hash, Calendar, MousePointerClick } from 'lucide-react';
import { generateRoaRoeData, type RoaRoeData } from './roaRoeMockData';

// Dynamic formatting based on enterprise measure standards
const getFormatter = (measure: string) => {
  if (measure === 'bps') return (value: number) => `${value.toFixed(0)} bps`;
  if (measure === 'fractional') return (value: number) => `${value.toFixed(3)}x`;
  return (value: number) => `${value.toFixed(1)}%`;
};

const currencyFormatter = (value: number) => `Rp ${(value / 1000).toFixed(1)} T`; 

export const RoaRoeDashboard: React.FC<{ isRoa: boolean }> = ({ isRoa }) => {
  const { trendData, currentMetrics, aiInsights, drillDownData } = useMemo(() => generateRoaRoeData(), []);
  
  // Toolbar State
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'composed'>('composed');
  const [showLabels, setShowLabels] = useState(false);
  const [showRefLine, setShowRefLine] = useState(true);
  const [customTarget, setCustomTarget] = useState<number | ''>('');
  const [targetDisplay, setTargetDisplay] = useState('');
  const [measure, setMeasure] = useState<'nominal' | 'bps' | 'fractional'>('nominal');
  const [dimension, setDimension] = useState<'month' | 'quarter'>('month');

  // Drill-down State
  const [selectedMonth, setSelectedMonth] = useState<string>('Dec');
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);

  // Interactive Legend State
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const toggleSeries = (key: string) => {
    setHiddenSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const metricName = isRoa ? 'Return on Asset (ROA)' : 'Return on Equity (ROE)';
  const currentRatio = isRoa ? currentMetrics.currentRoa : currentMetrics.currentRoe;
  const ratioGrowth = isRoa ? currentMetrics.roaGrowth : currentMetrics.roeGrowth;
  const defaultTargetRatio = isRoa ? currentMetrics.industryRoa : currentMetrics.industryRoe;
  
  const scaleFactor = measure === 'bps' ? 100 : measure === 'fractional' ? 0.01 : 1;
  const scaledDefaultTarget = defaultTargetRatio * scaleFactor;
  const targetRatio = typeof customTarget === 'number' ? customTarget : scaledDefaultTarget;
  
  const percentageFormatter = getFormatter(measure);
  const dataKey = isRoa ? 'roa' : 'roe';
  const backgroundDataKey = isRoa ? 'totalAssets' : 'totalEquity';

  // Process data for quarterly view if needed
  const displayData = useMemo(() => {
    let processed = [...trendData];
    if (dimension === 'quarter') {
      const sumQuarter = (qData: RoaRoeData[], name: string, isPredictive: boolean) => {
        if (qData.length === 0) return null;
        const totalNetIncome = qData.reduce((sum, d) => sum + d.netIncome, 0);
        const avgAssets = qData.reduce((sum, d) => sum + d.totalAssets, 0) / qData.length;
        const avgEquity = qData.reduce((sum, d) => sum + d.totalEquity, 0) / qData.length;
        
        const annualizedRoa = ((totalNetIncome * (12/qData.length)) / avgAssets) * 100;
        const annualizedRoe = ((totalNetIncome * (12/qData.length)) / avgEquity) * 100;

        return {
          name,
          monthIndex: 0,
          isPredictive,
          netIncome: totalNetIncome,
          totalAssets: avgAssets,
          totalEquity: avgEquity,
          roa: Number(annualizedRoa.toFixed(2)),
          roe: Number(annualizedRoe.toFixed(2)),
          roaTarget: qData[0].roaTarget,
          roeTarget: qData[0].roeTarget,
        } as RoaRoeData;
      };

      const q1 = processed.slice(0, 3);
      const q2 = processed.slice(3, 6);
      const q3 = processed.slice(6, 9);
      const q4 = processed.slice(9, 12);
      const q1Est = processed.slice(12, 15);

      processed = [
        sumQuarter(q1, 'Q1', false),
        sumQuarter(q2, 'Q2', false),
        sumQuarter(q3, 'Q3', false),
        sumQuarter(q4, 'Q4', false),
        sumQuarter(q1Est, 'Q1 (Est)', true)
      ].filter(Boolean) as RoaRoeData[];
    }
    
    // Add split data keys for actual vs predictive styling
    let mapped = processed.map(d => {
      const isPred = d.isPredictive;
      const actualRatio = !isPred ? (isRoa ? d.roa : d.roe) : null;
      const predRatio = isPred ? (isRoa ? d.roa : d.roe) : null;
      const actualBackground = !isPred ? (isRoa ? d.totalAssets : d.totalEquity) : null;
      const predBackground = isPred ? (isRoa ? d.totalAssets : d.totalEquity) : null;
      const actualNetIncome = !isPred ? d.netIncome : null;
      const predNetIncome = isPred ? d.netIncome : null;
      return {
        ...d,
        actualRatio: actualRatio ? actualRatio * scaleFactor : null,
        predRatio: predRatio ? predRatio * scaleFactor : null,
        actualBackground,
        predBackground,
        actualNetIncome,
        predNetIncome
      };
    });

    // Bridge the gap for predictive continuity
    const firstPredIndex = mapped.findIndex(d => d.isPredictive);
    if (firstPredIndex > 0) {
      const lastActual = mapped[firstPredIndex - 1];
      mapped = [...mapped];
      mapped[firstPredIndex - 1] = {
        ...lastActual,
        predRatio: isRoa ? (lastActual.roa * scaleFactor) : (lastActual.roe * scaleFactor),
        predBackground: isRoa ? lastActual.totalAssets : lastActual.totalEquity,
        predNetIncome: lastActual.netIncome
      };
    }
    
    return mapped;
  }, [trendData, dimension, isRoa, measure]);


  const handleExportCSV = () => {
    const headers = ['Month', 'Net Income', 'Total Assets', 'Total Equity', 'ROA (%)', 'ROE (%)', 'ROA Target (%)', 'ROE Target (%)'];
    const csvContent = trendData.map(d =>
      `${d.name},${d.netIncome},${d.totalAssets},${d.totalEquity},${d.roa},${d.roe},${d.roaTarget},${d.roeTarget}`
    );
    const csvString = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enterprise_${isRoa ? 'roa' : 'roe'}_data.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentDrillDown = drillDownData[selectedMonth];

  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length) {
      const data = state.activePayload[0].payload as RoaRoeData;
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as RoaRoeData;
      const isPred = data.isPredictive;

      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-xl min-w-[280px]">
          {/* Header */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
            <p className="font-bold text-slate-800 text-sm flex items-center gap-2 whitespace-nowrap">
              <Calendar className="w-4 h-4 text-slate-500" />
              {label}
              {data.insightLabel && data.insightLabel !== 'AI Forecast' && <span className="font-normal text-slate-500 ml-1"> {data.insightLabel}</span>}
              {isPred && (
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
                <span className="text-sm font-medium text-slate-600">Net Income</span>
              </div>
              <span className="font-bold text-slate-800">{currencyFormatter(data.netIncome)}</span>
            </div>
            {isRoa ? (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-[3px] ${isPred ? 'bg-orange-300' : 'bg-orange-500'}`}></div>
                  <span className="text-sm font-medium text-slate-600">Total Assets</span>
                </div>
                <span className="font-bold text-slate-800">{currencyFormatter(data.totalAssets)}</span>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-[3px] ${isPred ? 'bg-orange-300' : 'bg-orange-500'}`}></div>
                  <span className="text-sm font-medium text-slate-600">Total Equity</span>
                </div>
                <span className="font-bold text-slate-800">{currencyFormatter(data.totalEquity)}</span>
              </div>
            )}
            
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-[3px] ${isPred ? 'bg-blue-300' : 'bg-blue-500'}`}></div>
                <span className="text-sm font-bold text-slate-700">{isRoa ? 'ROA' : 'ROE'} Ratio</span>
              </div>
              <span className="font-black text-blue-600">
                {isRoa ? percentageFormatter(data.roa) : percentageFormatter(data.roe)}
              </span>
            </div>
          </div>

          {!isPred && !data.insightLabel && (
            <div className="mt-3 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <MousePointerClick className="w-3 h-3" /> Click column to view composition
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
      {/* Header & Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600" />
            {metricName} Analysis
          </h2>
          <p className="text-slate-500 text-sm mt-1">Enterprise-grade Profitability & Asset Utilization Tracking</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium text-sm">
          <Download className="w-4 h-4 text-slate-500" /> Export Data
        </button>
      </div>

      {/* KPI Cards (Fiori Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Current {isRoa ? 'ROA' : 'ROE'}</p>
          <h3 className="text-3xl font-black text-blue-700 relative z-10">{percentageFormatter(currentRatio)}</h3>
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded ${ratioGrowth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {ratioGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {ratioGrowth > 0 ? '+' : ''}{ratioGrowth.toFixed(2)} YoY
            </span>
            <span className="text-xs text-slate-400 font-medium">vs Last Period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Industry Benchmark</p>
          <h3 className="text-3xl font-black text-slate-800 relative z-10">{percentageFormatter(targetRatio)}</h3>
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded ${currentRatio >= targetRatio ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
              <Target className="w-3 h-3 mr-1" /> {currentRatio >= targetRatio ? 'Above Target' : 'Below Target'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Average Asset Turnover</p>
          <h3 className="text-3xl font-black text-slate-800 relative z-10">{currentMetrics.avgAssetTurnover}x</h3>
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
              <Info className="w-3 h-3 mr-1" /> Efficiency Metric
            </span>
          </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">{metricName} Trending Analysis</h3>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <button onClick={() => toggleSeries('ratio')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['ratio'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-blue-500 rounded-[3px]"></div> {isRoa ? 'ROA' : 'ROE'} Ratio</button>
              <button onClick={() => toggleSeries('netincome')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['netincome'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-emerald-500 rounded-[3px]"></div> Net Income</button>
              <button onClick={() => toggleSeries('background')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['background'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-orange-500 rounded-[3px]"></div> {isRoa ? 'Total Assets' : 'Total Equity'}</button>
              <button onClick={() => toggleSeries('predictive')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['predictive'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 border-2 border-dashed border-slate-400 rounded-[3px]"></div> AI Forecast</button>
            </div>
          </div>

          {/* Top Toolbar Control Center */}
          <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-lg p-2 shadow-sm overflow-x-auto">
            {/* Chart Icons */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-sm h-[32px] items-center shrink-0">
                <button onClick={() => setChartType('line')} title="Line Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'line' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><TrendingUp className="w-[16px] h-[16px]" /></button>
                <button onClick={() => setChartType('bar')} title="Bar Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'bar' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><BarChart2 className="w-[16px] h-[16px]" /></button>
                <button onClick={() => setChartType('area')} title="Area Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'area' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Activity className="w-[16px] h-[16px]" /></button>
                <div className="w-px bg-slate-200 mx-1 h-4"></div>
                <button onClick={() => setChartType('composed')} title="Composed Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'composed' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Layers className="w-[16px] h-[16px]" /></button>
                <div className="w-px bg-slate-200 mx-1 h-4"></div>
                <button onClick={() => setShowLabels(!showLabels)} title="Toggle Data Labels" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showLabels ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Hash className="w-[16px] h-[16px]" /></button>

                <div className="w-1.5"></div>

                <button onClick={() => setShowRefLine(!showRefLine)} title="Toggle Target Line" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showRefLine ? 'bg-rose-100 text-rose-700 shadow-sm' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'}`}>
                  <Target className="w-[16px] h-[16px] stroke-[2.5]" />
                </button>
                {showRefLine && (
                  <div className="flex items-center h-[26px] ml-1 px-1.5 bg-white border border-slate-200 rounded-md shadow-sm focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all duration-200">
                    <input
                      type="text"
                      value={targetDisplay !== '' ? targetDisplay : (customTarget !== '' ? customTarget : scaledDefaultTarget)}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        setTargetDisplay(e.target.value);
                        const parsed = parseFloat(e.target.value.replace(/,/g, ''));
                        if (!isNaN(parsed)) setCustomTarget(parsed);
                      }}
                      className="w-12 h-full text-[13px] font-bold text-rose-700 bg-transparent outline-none text-center cursor-text"
                    />
                    <span className="font-bold text-rose-700 text-[13px] ml-0.5 pointer-events-none select-none">{measure === 'bps' ? 'bps' : measure === 'fractional' ? 'x' : '%'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Analytical Filters - Matches Enterprise Standard */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Measure</span>
                <div className="relative">
                  <select value={measure} onChange={(e) => setMeasure(e.target.value as any)} className="text-[13px] border border-slate-200 rounded-md px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors focus:outline-none text-slate-700 font-bold appearance-none pr-8 h-[34px] cursor-pointer outline-none shadow-sm">
                    <option value="nominal">Nominal (%)</option>
                    <option value="bps">Basis Points (bps)</option>
                    <option value="fractional">Fractional (0.0x)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dimension</span>
                <div className="relative">
                  <select value={dimension} onChange={(e) => setDimension(e.target.value as any)} className="text-[13px] border border-slate-200 rounded-md px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors focus:outline-none text-slate-700 font-bold appearance-none pr-8 h-[34px] cursor-pointer outline-none shadow-sm">
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} onClick={handleChartClick} style={{ cursor: 'pointer' }} barGap={0} barCategoryGap="20%">
              <defs>
                <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <pattern id="diagonalHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="4" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
              </defs>
              
              {!hiddenSeries['predictive'] && <ReferenceArea x1={dimension === 'quarter' ? "Q4" : "Dec"} x2={dimension === 'quarter' ? "Q1 (Est)" : "Mar (Est)"} fill="#f1f5f9" fillOpacity={1} yAxisId="left" />}
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
              
              {/* Dual Y-Axis */}
              <YAxis yAxisId="left" tickFormatter={percentageFormatter} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} domain={['dataMin - 2', 'dataMax + 2']} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v/1000).toFixed(0)}T`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={10} />
              
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              
              {!hiddenSeries['predictive'] && <ReferenceLine x={dimension === 'quarter' ? "Q4" : "Dec"} stroke="#94a3b8" strokeDasharray="3 3" yAxisId="left" label={{ position: 'top', value: 'AI Prediction ➔', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />}
              
              {showRefLine && <ReferenceLine yAxisId="left" y={targetRatio} stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" label={{ position: 'insideBottomLeft', value: 'Target', fill: '#f43f5e', fontSize: 12, fontWeight: 'bold' }} />}

              {/* Background metrics */}
              {!hiddenSeries['background'] && (
                <>
                  <Line yAxisId="right" type="monotone" dataKey="actualBackground" name={isRoa ? 'Total Assets' : 'Total Equity'} stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="predBackground" stroke="#f97316" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                </>
              )}

              {/* Net Income metric */}
              {!hiddenSeries['netincome'] && (
                <>
                  <Line yAxisId="right" type="monotone" dataKey="actualNetIncome" name="Net Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="predNetIncome" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                </>
              )}
              
              {/* Foreground main metric */}
              {!hiddenSeries['ratio'] && (
                <>
                  {chartType === 'bar' ? (
                    <Bar yAxisId="left" dataKey="actualRatio" name={`${isRoa ? 'ROA' : 'ROE'} (%)`} fill="#3b82f6" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#3b82f6', fontSize: 11, fontWeight: 'bold', formatter: percentageFormatter } : false} />
                  ) : chartType === 'area' ? (
                    <Area yAxisId="left" type="monotone" dataKey="actualRatio" name={`${isRoa ? 'ROA' : 'ROE'} (%)`} stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRatio)" activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }} label={showLabels ? { position: 'top', fill: '#3b82f6', fontSize: 11, fontWeight: 'bold', formatter: percentageFormatter } : false} />
                  ) : chartType === 'line' ? (
                    <Line yAxisId="left" type="monotone" dataKey="actualRatio" name={`${isRoa ? 'ROA' : 'ROE'} (%)`} stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }} label={showLabels ? { position: 'top', fill: '#3b82f6', fontSize: 11, fontWeight: 'bold', formatter: percentageFormatter } : false} />
                  ) : (
                    <Area yAxisId="left" type="monotone" dataKey="actualRatio" name={`${isRoa ? 'ROA' : 'ROE'} (%)`} stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRatio)" activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }} label={showLabels ? { position: 'top', fill: '#3b82f6', fontSize: 11, fontWeight: 'bold', formatter: percentageFormatter } : false} />
                  )}
                  
                  {/* Predictive Foreground */}
                  {!hiddenSeries['predictive'] && (
                    chartType === 'bar' ? (
                      <Bar yAxisId="left" dataKey="predRatio" fill="url(#diagonalHatch)" stroke="#3b82f6" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#3b82f6', fontSize: 11, fontWeight: 'bold', formatter: percentageFormatter } : false} />
                    ) : (
                      <Line yAxisId="left" type="monotone" dataKey="predRatio" stroke="#3b82f6" strokeWidth={4} strokeDasharray="5 5" dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }} label={showLabels ? { position: 'top', fill: '#3b82f6', fontSize: 11, fontWeight: 'bold', formatter: percentageFormatter } : false} />
                    )
                  )}
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dynamic Drill Down Section */}
      <div className="mb-6">
        {currentDrillDown && !hiddenSeries['predictive'] && !trendData.find(d => d.name === selectedMonth)?.isPredictive ? (
          (() => {
            const drillDownTotalIncome = currentDrillDown.income.reduce((sum: number, item: any) => sum + item.value, 0);
            const drillDownTotalDenominator = isRoa 
              ? currentDrillDown.assets.reduce((sum: number, item: any) => sum + item.value, 0)
              : currentDrillDown.equity.reduce((sum: number, item: any) => sum + item.value, 0);
            const denominatorData = isRoa ? currentDrillDown.assets : currentDrillDown.equity;
            const denominatorLabel = isRoa ? "Total Assets" : "Total Equity";

            const CustomCenterLabel = ({ total, label }: any) => {
              return (
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                  <tspan x="50%" dy="-12" fontSize="11" fill="#64748b" className="uppercase font-bold tracking-wider">{label}</tspan>
                  <tspan x="50%" dy="24" fontSize="16" fill="#0f172a" fontWeight="900">{currencyFormatter(total)}</tspan>
                </text>
              );
            };

            return (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    Numerator & Denominator Composition:
                    <div className="relative inline-block ml-2">
                      <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-1.5 pr-8 text-sm font-bold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all"
                      >
                        {trendData.filter(d => !d.isPredictive).map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </h3>
                  <div className="text-sm text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                    <Info className="w-4 h-4 text-slate-400" />
                    Click on a month in the chart or use the dropdown
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Income Donut */}
                  <div className="flex flex-col items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Net Income (Numerator)
                    </h4>
                    <div className="h-64 w-full flex justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            key={`income-${selectedMonth}`}
                            data={currentDrillDown.income}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {currentDrillDown.income.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <Label content={<CustomCenterLabel total={drillDownTotalIncome} label="Net Income" />} position="center" />
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number, name: string) => [
                              `${currencyFormatter(value)} (${((value / drillDownTotalIncome) * 100).toFixed(1)}%)`, 
                              name
                            ]} 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 'bold', color: '#334155' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legend */}
                    <div className="w-full max-w-sm mt-8 space-y-2">
                      {currentDrillDown.income.map((entry: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-800">{currencyFormatter(entry.value)}</span>
                            <span className="text-xs font-bold text-slate-400 w-10 text-right">{((entry.value / drillDownTotalIncome) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Denominator Donut */}
                  <div className="flex flex-col items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      {denominatorLabel} (Denominator)
                    </h4>
                    <div className="h-64 w-full flex justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            key={`denom-${selectedMonth}`}
                            data={denominatorData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {denominatorData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <Label content={<CustomCenterLabel total={drillDownTotalDenominator} label={denominatorLabel} />} position="center" />
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number, name: string) => [
                              `${currencyFormatter(value)} (${((value / drillDownTotalDenominator) * 100).toFixed(1)}%)`, 
                              name
                            ]} 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 'bold', color: '#334155' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legend */}
                    <div className="w-full max-w-sm mt-8 space-y-2">
                      {denominatorData.map((entry: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-800">{currencyFormatter(entry.value)}</span>
                            <span className="text-xs font-bold text-slate-400 w-10 text-right">{((entry.value / drillDownTotalDenominator) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
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

      {/* AI Smart Insights */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
          <div className="text-blue-600"><Sparkles className="w-5 h-5" /></div>
          <h4 className="font-extrabold text-[18px] text-slate-800 tracking-tight">AI Diagnostic Insights</h4>
        </div>

        <ul className="text-[14px] text-slate-700 space-y-3 list-none pl-0 leading-relaxed font-medium">
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-blue-600 rounded-[3px]"></div>
            <span>
              <strong>Overall Efficiency:</strong> Status utilitas modal saat ini adalah <strong className={aiInsights.efficiencyStatus === 'Optimal' ? 'text-emerald-600' : 'text-amber-600'}>{aiInsights.efficiencyStatus}</strong>. Perusahaan {aiInsights.efficiencyStatus === 'Optimal' ? 'telah berhasil' : 'perlu meningkatkan upaya'} dalam menghasilkan laba dari setiap rupiah aset yang tertanam.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-emerald-500 rounded-[3px]"></div>
            <span>
              <strong>Peak Performance:</strong> Rasio tertinggi terekam pada bulan <strong className="text-emerald-700">{aiInsights.peakRoaMonth.name}</strong> dengan capaian <strong className="text-emerald-700">{percentageFormatter(isRoa ? aiInsights.peakRoaMonth.roa : aiInsights.peakRoaMonth.roe)}</strong>. {aiInsights.peakRoaMonth.insightLabel ? `Hal ini didorong oleh momen ${aiInsights.peakRoaMonth.insightLabel}.` : ''}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-amber-500 rounded-[3px]"></div>
            <span>
              <strong>Lowest Output:</strong> Penurunan efisiensi terdalam terjadi pada <strong className="text-amber-700">{aiInsights.lowestRoaMonth.name}</strong> ({percentageFormatter(isRoa ? aiInsights.lowestRoaMonth.roa : aiInsights.lowestRoaMonth.roe)}). Disarankan untuk meninjau kembali manajemen biaya atau utilisasi aset menganggur (*idle assets*) pada periode serupa di masa mendatang.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 border-2 border-dashed border-slate-400 rounded-[3px]"></div>
            <span>
              <strong>Forward Trajectory:</strong> Prediksi AI menunjukkan tren <strong className="text-blue-700">{aiInsights.predictiveTrend}</strong> untuk kuartal mendatang. Jaga rasio {isRoa ? 'ROA' : 'ROE'} agar tidak turun di bawah standar industri sebesar <strong className="text-slate-800">{percentageFormatter(targetRatio)}</strong>.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
