import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import {
  Download,
  Activity,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieChartIcon,
  BarChart2,
  Layers,
  Hash,
  Target,
  ChevronDown,
  Check
} from 'lucide-react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import type { LiquidityTrendData } from './liquidityMockData';
import { generateLiquidityData } from './liquidityMockData';

const { trendData, drillDownData } = generateLiquidityData();

export const LiquidityDashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Dec');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'composed'>('composed');
  const [showLabels, setShowLabels] = useState(false);
  const [showRefLine, setShowRefLine] = useState(true);
  const [nominalTarget, setNominalTarget] = useState<number | ''>(150000000);
  const [nominalTargetDisplay, setNominalTargetDisplay] = useState('150,000,000');
  const [coverageTarget, setCoverageTarget] = useState<number | ''>(1.5);
  const [measure, setMeasure] = useState('nominal');
  const [dimension, setDimension] = useState('month');
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);

  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const isCoverage = measure === 'coverage';

  const displayData = useMemo(() => {
    let processed = trendData;
    
    // Dimension processing
    if (dimension === 'quarter') {
       // Filter down to quarter ends for Balance Sheet / Liquidity snapshot
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
        if (i === 0) return { ...d, currentAssets: 0, currentLiabilities: 0, currentRatio: 0, quickRatio: 0, cashRatio: 0, predCurrentAssets: 0, predCurrentLiabilities: 0, predCurrentRatio: 0, predQuickRatio: 0, predCashRatio: 0 };
        const prev = arr[i - 1];
        
        const prevCA = prev.currentAssets || prev.predCurrentAssets || 0;
        const currCA = d.currentAssets || d.predCurrentAssets || 0;
        const gAssets = prevCA ? ((currCA - prevCA) / prevCA) * 100 : 0;

        const prevCL = prev.currentLiabilities || prev.predCurrentLiabilities || 0;
        const currCL = d.currentLiabilities || d.predCurrentLiabilities || 0;
        const gLiab = prevCL ? ((currCL - prevCL) / prevCL) * 100 : 0;

        const prevCR = prev.currentRatio || prev.predCurrentRatio || 0;
        const currCR = d.currentRatio || d.predCurrentRatio || 0;
        const gCr = prevCR ? ((currCR - prevCR) / prevCR) * 100 : 0;

        const prevQR = prev.quickRatio || prev.predQuickRatio || 0;
        const currQR = d.quickRatio || d.predQuickRatio || 0;
        const gQr = prevQR ? ((currQR - prevQR) / prevQR) * 100 : 0;

        const prevCashR = prev.cashRatio || prev.predCashRatio || 0;
        const currCashR = d.cashRatio || d.predCashRatio || 0;
        const gCash = prevCashR ? ((currCashR - prevCashR) / prevCashR) * 100 : 0;

        return {
          ...d,
          currentAssets: d.isPredictive ? null : gAssets,
          currentLiabilities: d.isPredictive ? null : gLiab,
          currentRatio: d.isPredictive ? null : gCr,
          quickRatio: d.isPredictive ? null : gQr,
          cashRatio: d.isPredictive ? null : gCash,
          predCurrentAssets: d.isPredictive ? gAssets : null,
          predCurrentLiabilities: d.isPredictive ? gLiab : null,
          predCurrentRatio: d.isPredictive ? gCr : null,
          predQuickRatio: d.isPredictive ? gQr : null,
          predCashRatio: d.isPredictive ? gCash : null,
          barPredCurrentAssets: d.isPredictive ? gAssets : null,
          barPredCurrentLiabilities: d.isPredictive ? gLiab : null,
          barPredCurrentRatio: d.isPredictive ? gCr : null,
          barPredQuickRatio: d.isPredictive ? gQr : null,
          barPredCashRatio: d.isPredictive ? gCash : null,
        }
      });
    }

    // Create discrete bar predictive points (so they don't stack in the bridge point)
    processed = processed.map(d => ({
      ...d,
      barPredCurrentAssets: d.predCurrentAssets,
      barPredCurrentLiabilities: d.predCurrentLiabilities,
      barPredCurrentRatio: d.predCurrentRatio,
      barPredQuickRatio: d.predQuickRatio,
      barPredCashRatio: d.predCashRatio,
    }));

    // Bridge the gap for predictive continuity (Line/Area only)
    const firstPredIndex = processed.findIndex(d => d.isPredictive);
    if (firstPredIndex > 0) {
      const lastActual = processed[firstPredIndex - 1];
      processed = [...processed];
      processed[firstPredIndex - 1] = {
        ...lastActual,
        predCurrentAssets: lastActual.currentAssets,
        predCurrentLiabilities: lastActual.currentLiabilities,
        predCurrentRatio: lastActual.currentRatio,
        predQuickRatio: lastActual.quickRatio,
        predCashRatio: lastActual.cashRatio,
      };
    }
    
    return processed;
  }, [trendData, measure, dimension]);

  const yAxisFormatter = (val: number) => {
    if (measure === 'growth') return `${val.toFixed(1)}%`;
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const ratioFormatter = (val: number) => {
    if (measure === 'growth') return `${val.toFixed(1)}%`;
    return `${val.toFixed(2)}x`;
  };

  const handleExportCSV = () => {
    console.log('Exporting Liquidity Data to CSV...');
    // Real implementation would convert trendData to CSV blob
  };

  // KPI Calculations (Latest Actual Month - Dec)
  const actualsOnly = trendData.filter(d => !d.isPredictive);
  const latestActual = actualsOnly[actualsOnly.length - 1];
  const prevActual = actualsOnly[actualsOnly.length - 2];

  const cr = latestActual.currentRatio || 0;
  const prevCr = prevActual.currentRatio || 0;
  const crGrowth = ((cr - prevCr) / prevCr) * 100;

  const qr = latestActual.quickRatio || 0;
  const prevQr = prevActual.quickRatio || 0;
  const qrGrowth = ((qr - prevQr) / prevQr) * 100;

  const cashR = latestActual.cashRatio || 0;

  const wc = latestActual.workingCapital || 0;
  const prevWc = prevActual.workingCapital || 0;
  const wcGrowth = ((wc - prevWc) / Math.abs(prevWc)) * 100;

  const currentDrillDown = drillDownData[selectedMonth];

  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length) {
      const data = state.activePayload[0].payload as LiquidityTrendData;
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
      const data = payload[0].payload as LiquidityTrendData;
      const isPred = data.isPredictive;

      return (
        <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl min-w-[280px]">
          <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
            {isPred ? (
              <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                {label}
                <span className="flex items-center gap-1 text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1">
                  <div className="w-2.5 h-2.5 border-[1.5px] border-dashed border-slate-500 rounded-sm"></div>
                  AI Forecast
                </span>
              </p>
            ) : (
              <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                {label} 2026
                <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1">Actual</span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-[3px] ${isPred ? 'bg-emerald-300' : 'bg-emerald-500'}`}></div>
                <span className="text-sm font-medium text-slate-600">Current Assets</span>
              </div>
              <span className="font-bold text-slate-800">
                {measure === 'growth' ? `${(isPred ? data.predCurrentAssets! : data.currentAssets!).toFixed(1)}%` : yAxisFormatter(isPred ? data.predCurrentAssets! : data.currentAssets!)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-[3px] ${isPred ? 'bg-rose-300' : 'bg-rose-500'}`}></div>
                <span className="text-sm font-medium text-slate-600">Current Liab.</span>
              </div>
              <span className="font-bold text-slate-800">
                {measure === 'growth' ? `${(isPred ? data.predCurrentLiabilities! : data.currentLiabilities!).toFixed(1)}%` : yAxisFormatter(isPred ? data.predCurrentLiabilities! : data.currentLiabilities!)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-[3px] ${isPred ? 'bg-indigo-300' : 'bg-indigo-600'}`}></div>
                <span className="text-sm font-bold text-slate-700">Current Ratio</span>
              </div>
              <span className={`font-black ${(isPred ? data.predCurrentRatio! : data.currentRatio!) >= 1.5 && measure !== 'growth' ? 'text-emerald-600' : (isPred ? data.predCurrentRatio! : data.currentRatio!) >= 1.0 && measure !== 'growth' ? 'text-amber-600' : measure === 'growth' ? 'text-slate-800' : 'text-rose-600'}`}>
                {measure === 'growth' ? `${(isPred ? data.predCurrentRatio! : data.currentRatio!).toFixed(1)}%` : ratioFormatter(isPred ? data.predCurrentRatio! : data.currentRatio!)}
              </span>
            </div>
          </div>

          {!isPred && (
            <div className="mt-3 text-[10px] text-slate-400 text-center font-medium italic">
              Click column to view {label} composition
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const getHealthColor = (ratio: number, healthy: number, warning: number) => {
    if (ratio >= healthy) return 'text-emerald-600';
    if (ratio >= warning) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getHealthBg = (ratio: number, healthy: number, warning: number) => {
    if (ratio >= healthy) return 'bg-emerald-50 border-emerald-100';
    if (ratio >= warning) return 'bg-amber-50 border-amber-100';
    return 'bg-rose-50 border-rose-100';
  };

  return (
    <div className="w-full bg-slate-50/50 p-6 rounded-2xl border border-slate-200">

      {/* Header & Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600" />
            Liquidity & Solvency Analytics
          </h2>
          <p className="text-slate-500 text-sm mt-1">Enterprise-grade short-term liquidity assessment with AI Forecasting.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium text-sm">
          <Download className="w-4 h-4 text-slate-500" /> Export Data
        </button>
      </div>

      {/* KPI Cards (Fiori Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className={`bg-white rounded-xl border p-4 shadow-sm relative overflow-hidden group cursor-default transition-all ${getHealthBg(cr, 1.5, 1.0)}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Ratio</p>
          <div className="flex justify-between items-end">
            <h3 className={`text-2xl font-black ${getHealthColor(cr, 1.5, 1.0)}`}>{ratioFormatter(cr)}</h3>
            <div className="flex items-center gap-1 mb-1">
              <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${crGrowth >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                {crGrowth >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                {Math.abs(crGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Target: &gt; 1.5x (Safe)</p>
        </div>

        <div className={`bg-white rounded-xl border p-4 shadow-sm relative overflow-hidden group cursor-default transition-all ${getHealthBg(qr, 1.0, 0.8)}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quick Ratio</p>
          <div className="flex justify-between items-end">
            <h3 className={`text-2xl font-black ${getHealthColor(qr, 1.0, 0.8)}`}>{ratioFormatter(qr)}</h3>
            <div className="flex items-center gap-1 mb-1">
              <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${qrGrowth >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                {qrGrowth >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                {Math.abs(qrGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Target: &gt; 1.0x (Liquid)</p>
        </div>

        <div className={`bg-white rounded-xl border p-4 shadow-sm relative overflow-hidden group cursor-default transition-all ${getHealthBg(cashR, 0.5, 0.2)}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cash Ratio</p>
          <div className="flex justify-between items-end">
            <h3 className={`text-2xl font-black ${getHealthColor(cashR, 0.5, 0.2)}`}>{ratioFormatter(cashR)}</h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Target: &gt; 0.5x (Strong)</p>
        </div>

        <div className={`bg-white rounded-xl border p-4 shadow-sm relative overflow-hidden group cursor-default transition-all ${wc >= 0 ? 'border-indigo-100' : 'border-rose-100'}`}>
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Net Working Capital</p>
          <h3 className={`text-xl font-black truncate relative z-10 ${wc >= 0 ? 'text-indigo-600' : 'text-rose-600'}`} title={yAxisFormatter(wc)}>
            {yAxisFormatter(wc)}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 relative z-10">
            <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${wcGrowth >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
              {wcGrowth >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
              {Math.abs(wcGrowth).toFixed(1)}%
            </span>
          </div>
        </div>

      </div>

      <div className="flex flex-col gap-6">
        {/* Main Chart Area */}
        <div className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="flex justify-between items-center mb-6 print:hidden">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              Liquidity Coverage Trajectory
            </h3>

            {/* Custom Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              {isCoverage ? (
                <>
                  <button onClick={() => toggleSeries('currentRatio')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['currentRatio'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-indigo-600 rounded-[3px]"></div> Current Ratio</button>
                  <button onClick={() => toggleSeries('quickRatio')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['quickRatio'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-amber-500 rounded-[3px]"></div> Quick Ratio</button>
                  <button onClick={() => toggleSeries('cashRatio')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['cashRatio'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-emerald-500 rounded-[3px]"></div> Cash Ratio</button>
                  <button onClick={() => toggleSeries('predictive')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['predictive'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 border-2 border-dashed border-slate-400 rounded-[3px]"></div> AI Forecast</button>
                </>
              ) : (
                <>
                  <button onClick={() => toggleSeries('currentAssets')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['currentAssets'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-emerald-500 rounded-[3px]"></div> Current Assets</button>
                  <button onClick={() => toggleSeries('currentLiabilities')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['currentLiabilities'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-rose-500 rounded-[3px]"></div> Current Liabilities</button>
                  <button onClick={() => toggleSeries('currentRatio')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['currentRatio'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-indigo-600 rounded-[3px]"></div> Current Ratio</button>
                  <button onClick={() => toggleSeries('predictive')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['predictive'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 border-2 border-dashed border-slate-400 rounded-[3px]"></div> AI Forecast</button>
                </>
              )}
            </div>
          </div>

          {/* Top Toolbar Control Center */}
          <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-lg p-2 shadow-sm print:hidden mb-6">
            {/* Chart Icons */}
            <div className="flex items-center gap-3">
              <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-sm h-[32px] items-center">
                <button onClick={() => setChartType('line')} title="Line Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'line' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><TrendingUp className="w-[16px] h-[16px]" /></button>
                <button onClick={() => setChartType('bar')} title="Bar Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'bar' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><BarChart2 className="w-[16px] h-[16px]" /></button>
                <button onClick={() => setChartType('area')} title="Area Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'area' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Activity className="w-[16px] h-[16px]" /></button>
                <div className="w-px bg-slate-200 mx-1 h-4"></div>
                <button onClick={() => setChartType('composed')} title="Composed Chart" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType === 'composed' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Layers className="w-[16px] h-[16px]" /></button>
                <div className="w-px bg-slate-200 mx-1 h-4"></div>
                <button onClick={() => setShowLabels(!showLabels)} title="Toggle Data Labels" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showLabels ? 'bg-indigo-100 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Hash className="w-[16px] h-[16px]" /></button>
                
                <div className="flex items-center gap-1 bg-white rounded-md p-0.5 border border-transparent mx-1 h-full">
                  <button onClick={() => setShowRefLine(!showRefLine)} disabled={measure === 'growth'} title={measure === 'growth' ? "Target Line disabled in Growth mode" : "Toggle Target Line"} className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showRefLine && measure !== 'growth' ? 'bg-rose-100 text-rose-700 font-bold shadow-sm' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'} ${measure === 'growth' ? 'opacity-30 cursor-not-allowed' : ''}`}><Target className="w-[16px] h-[16px]" /></button>
                  
                  {showRefLine && measure === 'nominal' && (
                    <input
                      type="text"
                      placeholder="Target..."
                      value={nominalTargetDisplay}
                      onFocus={() => setNominalTargetDisplay(nominalTarget.toString())}
                      onBlur={() => {
                        const parsed = parseInt(nominalTargetDisplay.replace(/,/g, ''), 10);
                        if (!isNaN(parsed)) {
                          setNominalTarget(parsed);
                          setNominalTargetDisplay(new Intl.NumberFormat('en-US').format(parsed));
                        } else {
                          setNominalTarget('');
                          setNominalTargetDisplay('');
                        }
                      }}
                      onChange={e => setNominalTargetDisplay(e.target.value)}
                      className="w-[100px] text-[12px] px-2 h-full border border-slate-200 rounded text-rose-700 placeholder-slate-400 focus:outline-none focus:border-rose-400 bg-white font-bold"
                    />
                  )}
                  {showRefLine && measure === 'coverage' && (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Target (x)"
                      value={coverageTarget}
                      onChange={e => setCoverageTarget(e.target.value ? Number(e.target.value) : '')}
                      className="w-[80px] text-[12px] px-2 h-full border border-slate-200 rounded text-rose-700 placeholder-slate-400 focus:outline-none focus:border-rose-400 bg-white font-bold"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right side of toolbar (Matching OVP style exactly) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Measure</span>
                <div className="relative">
                  <select value={measure} onChange={(e) => setMeasure(e.target.value)} className="text-[12px] border border-slate-200 rounded-md px-3 py-1 bg-white focus:outline-none text-slate-700 font-bold appearance-none pr-8 h-[28px] cursor-pointer outline-none">
                    <option value="nominal">Nominal (IDR)</option>
                    <option value="coverage">Coverage (x)</option>
                    <option value="growth">Growth (%)</option>
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

          <div className="w-full h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={displayData}
                margin={{ top: 30, right: 20, left: 10, bottom: 5 }}
                onClick={handleChartClick}
                className="cursor-pointer"
              >
                <defs>
                  <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                    <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#cbd5e1" strokeWidth="1" opacity={0.5} />
                  </pattern>
                  <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLiabilities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <ReferenceArea x1={dimension === 'quarter' ? "Q4" : "Dec"} x2={dimension === 'quarter' ? "Q1 (Est)" : "Mar (Est)"} yAxisId="left" fill="#f1f5f9" fillOpacity={1} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />

                {/* Left Y-Axis for Absolute Currency Values */}
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(val) => {
                    if (val === 0) return '0';
                    return `${(val / 1000000).toFixed(0)}Jt`;
                  }}
                  dx={-10}
                  width={60}
                />

                {/* Right Y-Axis for Ratios */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4f46e5', fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(val) => `${val.toFixed(1)}x`}
                  dx={10}
                  width={40}
                />

                {/* AI Forecast Vertical Separator */}
                <ReferenceLine
                  x={dimension === 'quarter' ? "Q4" : "Dec"}
                  yAxisId="left"
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  label={{ position: 'top', value: 'AI Prediction ➔', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                />

                {isCoverage ? (
                  <>
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(val) => `${val.toFixed(1)}x`}
                      dx={-10}
                      width={40}
                    />
                    {showRefLine && coverageTarget !== '' && (
                      <ReferenceLine y={Number(coverageTarget)} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Safe Ratio Target', fill: '#ef4444', fontSize: 10, fontWeight: 700 }} />
                    )}

                    {(chartType === 'area' || chartType === 'composed') && (
                      <>
                        <Area hide={!!hiddenSeries['currentRatio']} yAxisId="left" type="monotone" dataKey="currentRatio" stroke="#4f46e5" strokeWidth={3} fillOpacity={0.2} fill="#4f46e5" activeDot={{ r: 6, strokeWidth: 0 }} label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: ratioFormatter } : false} />
                        <Area hide={!!hiddenSeries['quickRatio']} yAxisId="left" type="monotone" dataKey="quickRatio" stroke="#f59e0b" strokeWidth={3} fillOpacity={0.2} fill="#f59e0b" activeDot={{ r: 6, strokeWidth: 0 }} label={showLabels ? { position: 'top', fill: '#f59e0b', fontSize: 10, formatter: ratioFormatter } : false} />
                        <Area hide={!!hiddenSeries['cashRatio']} yAxisId="left" type="monotone" dataKey="cashRatio" stroke="#10b981" strokeWidth={3} fillOpacity={0.2} fill="#10b981" activeDot={{ r: 6, strokeWidth: 0 }} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: ratioFormatter } : false} />
                        
                        <Area hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentRatio']} yAxisId="left" type="monotone" dataKey="predCurrentRatio" stroke="none" fillOpacity={0.2} fill="#4f46e5" activeDot={false} />
                        <Area hide={!!hiddenSeries['predictive'] || !!hiddenSeries['quickRatio']} yAxisId="left" type="monotone" dataKey="predQuickRatio" stroke="none" fillOpacity={0.2} fill="#f59e0b" activeDot={false} />
                        <Area hide={!!hiddenSeries['predictive'] || !!hiddenSeries['cashRatio']} yAxisId="left" type="monotone" dataKey="predCashRatio" stroke="none" fillOpacity={0.2} fill="#10b981" activeDot={false} />
                      </>
                    )}

                    {chartType === 'line' && (
                      <>
                        <Line hide={!!hiddenSeries['currentRatio']} yAxisId="left" type="monotone" dataKey="currentRatio" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: ratioFormatter, fontWeight: 'bold' } : false} />
                        <Line hide={!!hiddenSeries['quickRatio']} yAxisId="left" type="monotone" dataKey="quickRatio" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#f59e0b', fontSize: 10, formatter: ratioFormatter, fontWeight: 'bold' } : false} />
                        <Line hide={!!hiddenSeries['cashRatio']} yAxisId="left" type="monotone" dataKey="cashRatio" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: ratioFormatter, fontWeight: 'bold' } : false} />
                      </>
                    )}

                    {chartType === 'bar' && (
                      <>
                        <Bar hide={!!hiddenSeries['currentRatio']} yAxisId="left" dataKey="currentRatio" fill="#4f46e5" radius={[4, 4, 0, 0]} stackId="cr" label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: ratioFormatter } : false} />
                        <Bar hide={!!hiddenSeries['quickRatio']} yAxisId="left" dataKey="quickRatio" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="qr" label={showLabels ? { position: 'top', fill: '#f59e0b', fontSize: 10, formatter: ratioFormatter } : false} />
                        <Bar hide={!!hiddenSeries['cashRatio']} yAxisId="left" dataKey="cashRatio" fill="#10b981" radius={[4, 4, 0, 0]} stackId="cash" label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: ratioFormatter } : false} />
                        
                        <Bar hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentRatio']} yAxisId="left" dataKey="barPredCurrentRatio" fill="url(#diagonalHatch)" stroke="#4f46e5" radius={[4, 4, 0, 0]} stackId="cr" />
                        <Bar hide={!!hiddenSeries['predictive'] || !!hiddenSeries['quickRatio']} yAxisId="left" dataKey="barPredQuickRatio" fill="url(#diagonalHatch)" stroke="#f59e0b" radius={[4, 4, 0, 0]} stackId="qr" />
                        <Bar hide={!!hiddenSeries['predictive'] || !!hiddenSeries['cashRatio']} yAxisId="left" dataKey="barPredCashRatio" fill="url(#diagonalHatch)" stroke="#10b981" radius={[4, 4, 0, 0]} stackId="cash" />
                      </>
                    )}

                    {(chartType === 'area' || chartType === 'composed' || chartType === 'line') && (
                      <>
                        <Line hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentRatio']} yAxisId="left" type="monotone" dataKey="predCurrentRatio" stroke="#4f46e5" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                        <Line hide={!!hiddenSeries['predictive'] || !!hiddenSeries['quickRatio']} yAxisId="left" type="monotone" dataKey="predQuickRatio" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                        <Line hide={!!hiddenSeries['predictive'] || !!hiddenSeries['cashRatio']} yAxisId="left" type="monotone" dataKey="predCashRatio" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(val) => {
                        if (measure === 'growth') return `${val.toFixed(0)}%`;
                        if (val === 0) return '0';
                        return `${(val / 1000000).toFixed(0)}Jt`;
                      }}
                      dx={-10}
                      width={60}
                    />
                    {measure !== 'growth' && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#4f46e5', fontSize: 11, fontWeight: 700 }}
                        tickFormatter={(val) => `${val.toFixed(1)}x`}
                        dx={10}
                        width={40}
                      />
                    )}
                    {showRefLine && nominalTarget !== '' && measure === 'nominal' && (
                      <ReferenceLine y={Number(nominalTarget)} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Monthly Limit Target', fill: '#ef4444', fontSize: 10, fontWeight: 700 }} />
                    )}

                    {/* Actual Areas or Bars */}
                    {(chartType === 'area' || chartType === 'composed' || chartType === 'line') && (
                      <>
                        <Area hide={!!hiddenSeries['currentAssets']} yAxisId="left" type={chartType === 'line' ? "linear" : "monotone"} dataKey="currentAssets" stroke={chartType === 'line' ? 'none' : '#10b981'} fillOpacity={chartType === 'line' ? 0 : 1} fill="url(#colorAssets)" strokeWidth={2} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: yAxisFormatter } : false} />
                        <Area hide={!!hiddenSeries['currentLiabilities']} yAxisId="left" type={chartType === 'line' ? "linear" : "monotone"} dataKey="currentLiabilities" stroke={chartType === 'line' ? 'none' : '#f43f5e'} fillOpacity={chartType === 'line' ? 0 : 1} fill="url(#colorLiabilities)" strokeWidth={2} label={showLabels ? { position: 'bottom', fill: '#f43f5e', fontSize: 10, formatter: yAxisFormatter } : false} />
                        
                        {/* Predictive Areas (Continuation of Gradient, No Stroke) */}
                        <Area hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentAssets']} yAxisId="left" type={chartType === 'line' ? "linear" : "monotone"} dataKey="predCurrentAssets" stroke="none" fillOpacity={chartType === 'line' ? 0 : 1} fill="url(#colorAssets)" activeDot={false} />
                        <Area hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentLiabilities']} yAxisId="left" type={chartType === 'line' ? "linear" : "monotone"} dataKey="predCurrentLiabilities" stroke="none" fillOpacity={chartType === 'line' ? 0 : 1} fill="url(#colorLiabilities)" activeDot={false} />
                      </>
                    )}

                    {chartType === 'bar' && (
                      <>
                        <Bar hide={!!hiddenSeries['currentAssets']} yAxisId="left" dataKey="currentAssets" fill="#10b981" radius={[4, 4, 0, 0]} stackId="assets" label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: yAxisFormatter } : false} />
                        <Bar hide={!!hiddenSeries['currentLiabilities']} yAxisId="left" dataKey="currentLiabilities" fill="#f43f5e" radius={[4, 4, 0, 0]} stackId="liab" label={showLabels ? { position: 'top', fill: '#f43f5e', fontSize: 10, formatter: yAxisFormatter } : false} />
                        
                        <Bar hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentAssets']} yAxisId="left" dataKey="barPredCurrentAssets" fill="url(#diagonalHatch)" stroke="#34d399" radius={[4, 4, 0, 0]} stackId="assets" />
                        <Bar hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentLiabilities']} yAxisId="left" dataKey="barPredCurrentLiabilities" fill="url(#diagonalHatch)" stroke="#fb7185" radius={[4, 4, 0, 0]} stackId="liab" />
                      </>
                    )}

                    {/* Predictive Lines on top for the dashed border effect */}
                    {(chartType === 'area' || chartType === 'composed' || chartType === 'line') && (
                      <>
                        <Line hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentAssets']} yAxisId="left" type={chartType === 'line' ? "linear" : "monotone"} dataKey="predCurrentAssets" stroke="#34d399" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                        <Line hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentLiabilities']} yAxisId="left" type={chartType === 'line' ? "linear" : "monotone"} dataKey="predCurrentLiabilities" stroke="#fb7185" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                      </>
                    )}

                    {/* If it's pure line chart, render lines for actuals (since Area has stroke="none" in line mode) */}
                    {chartType === 'line' && (
                      <>
                        <Line hide={!!hiddenSeries['currentAssets']} yAxisId="left" type="linear" dataKey="currentAssets" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: yAxisFormatter } : false} />
                        <Line hide={!!hiddenSeries['currentLiabilities']} yAxisId="left" type="linear" dataKey="currentLiabilities" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'bottom', fill: '#f43f5e', fontSize: 10, formatter: yAxisFormatter } : false} />
                      </>
                    )}

                    <Line hide={!!hiddenSeries['currentRatio']} yAxisId={measure === 'growth' ? "left" : "right"} type="monotone" dataKey="currentRatio" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: ratioFormatter, fontWeight: 'bold' } : false} />
                    <Line hide={!!hiddenSeries['predictive'] || !!hiddenSeries['currentRatio']} yAxisId={measure === 'growth' ? "left" : "right"} type="monotone" dataKey="predCurrentRatio" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drill-down Area (Full Width) */}
        <div className="w-full bg-white rounded-xl border border-slate-200 p-6 shadow-sm print:shadow-none print:border-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
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
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2 font-medium shadow-sm">
              <Info className="w-4 h-4 text-slate-400" /> Click on a month in the chart or use the dropdown above
            </div>
          </div>

          {currentDrillDown ? (
            (() => {
              const drillDownTotalAssets = currentDrillDown.currentAssets.reduce((sum, item) => sum + item.value, 0);
              const drillDownTotalLiabilities = currentDrillDown.currentLiabilities.reduce((sum, item) => sum + item.value, 0);

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
                        data={currentDrillDown.currentAssets}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {currentDrillDown.currentAssets.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <Label content={<CustomCenterLabel total={drillDownTotalAssets} label="Total Assets" />} position="center" />
                      </Pie>
                      <Tooltip 
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
                  {currentDrillDown.currentAssets.map((entry, idx) => (
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

              {/* Liability Distribution Donut */}
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
                        data={currentDrillDown.currentLiabilities}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {currentDrillDown.currentLiabilities.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <Label content={<CustomCenterLabel total={drillDownTotalLiabilities} label="Total Liabilities" />} position="center" />
                      </Pie>
                      <Tooltip 
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
                  {currentDrillDown.currentLiabilities.map((entry, idx) => (
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
      </div>

      {/* AI Smart Insights (Enterprise Analytical Summary) */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-3">
          <div className="text-blue-600"><Sparkles className="w-5 h-5" /></div>
          <h4 className="font-extrabold text-[18px] text-slate-800 tracking-tight">Executive Summary & Insights</h4>
        </div>

        <ul className="text-[14px] text-slate-700 space-y-3 list-none pl-0 leading-relaxed font-medium">
          <li className="flex items-start gap-2.5">
            <div className={`mt-1.5 w-3 h-3 flex-shrink-0 rounded-[3px] ${cr >= 1.5 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <span>
              <strong>Current Ratio Dynamics:</strong> Rasio likuiditas berada di level <strong className={getHealthColor(cr, 1.5, 1.0)}>{cr.toFixed(2)}x</strong>. {cr >= 1.5 ? 'Aset lancar perusahaan terbukti sangat memadai untuk menutupi seluruh kewajiban jangka pendek secara instan.' : 'Perhatian khusus diperlukan karena aset lancar mendekati ambang batas minimal untuk menutupi kewajiban.'}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-amber-500 rounded-[3px]"></div>
            <span>
              <strong>Quick & Cash Solvency:</strong> Setelah memotong Inventory, rasio Quick berada di angka <strong className={getHealthColor(qr, 1.0, 0.8)}>{qr.toFixed(2)}x</strong>. Posisi Cash perusahaan juga {cashR > 0.5 ? 'sangat likuid' : 'cukup ketat'} dengan rasio kas sebesar <strong className={getHealthColor(cashR, 0.5, 0.2)}>{cashR.toFixed(2)}x</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-indigo-500 rounded-[3px]"></div>
            <span>
              <strong>Working Capital Health:</strong> *Net Working Capital* (Modal Kerja Bersih) tercatat {wc >= 0 ? 'positif' : 'defisit'} sebesar <strong className={wc >= 0 ? 'text-indigo-600' : 'text-rose-600'}>{yAxisFormatter(Math.abs(wc))}</strong>, memberikan bantalan operasional yang {wc >= 0 ? 'sangat aman' : 'berisiko'} untuk ekspansi jangka pendek.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 border-2 border-dashed border-slate-400 rounded-[3px]"></div>
            <span>
              <strong>AI Forward Prediction:</strong> Algoritma AI mengestimasikan peningkatan rasio likuiditas menjadi <strong className="text-indigo-600">{trendData[14].predCurrentRatio!.toFixed(2)}x</strong> di bulan Maret seiring dengan proyeksi efisiensi kewajiban utang dagang.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
