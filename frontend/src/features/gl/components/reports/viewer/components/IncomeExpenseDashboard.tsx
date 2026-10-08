import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, PieChart, Pie, Cell, Label
} from 'recharts';
import { TrendingUp, Activity, AlertCircle, Calendar, Download, PieChart as PieChartIcon, MousePointerClick, Info, BarChart2, Layers, Target, Hash, Sparkles, ChevronDown, Check } from 'lucide-react';
import { yAxisFormatter } from '../utils';
import { generateAdvancedData, type TrendData } from './dashboardMockData';

// --- Custom Components ---
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: unknown[]; label?: string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TrendData;
    const isPred = data.isPredictive;

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
              <span className="text-sm font-medium text-slate-600">Income</span>
            </div>
            <span className="font-bold text-slate-800">
              {yAxisFormatter(isPred ? data.predIncome! : data.actualIncome!)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-[3px] ${isPred ? 'bg-rose-300' : 'bg-rose-500'}`}></div>
              <span className="text-sm font-medium text-slate-600">Expense</span>
            </div>
            <span className="font-bold text-slate-800">
              {yAxisFormatter(isPred ? data.predExpense! : data.actualExpense!)}
            </span>
          </div>

          {!isPred && data.actualExpense! > data.budgetLimit && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-1.5 rounded border border-rose-100 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Over Budget by {yAxisFormatter(data.actualExpense! - data.budgetLimit)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">Net Profit</span>
            <span className={`font-black ${data.netProfit! >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {yAxisFormatter(data.netProfit!)}
            </span>
          </div>
        </div>

        {!isPred && (
          <div className="mt-3 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <MousePointerClick className="w-3 h-3" /> Click column to view drill-down
          </div>
        )}
      </div>
    );
  }
  return null;
};

// --- Main Dashboard Component ---
export const IncomeExpenseDashboard: React.FC = () => {
  const { trendData, drillDownData } = useMemo(() => generateAdvancedData(), []);

  // Default selected month is the last actual month (Dec)
  const [selectedMonth, setSelectedMonth] = useState<string>('Dec');
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const [targetDisplay, setTargetDisplay] = useState('130,000,000');

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const handleExportCSV = () => {
    const headers = ['Month', 'Actual Income', 'Actual Expense', 'Net Profit', 'Pred Income', 'Pred Expense', 'Budget Limit'];
    const csvContent = trendData.map(d =>
      `${d.name},${d.actualIncome || ''},${d.actualExpense || ''},${d.netProfit || ''},${d.predIncome || ''},${d.predExpense || ''},${d.budgetLimit}`
    );
    const csvString = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'forecast_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations (YTD Actuals)
  const ytdActuals = trendData.filter(d => !d.isPredictive);
  const totalIncome = ytdActuals.reduce((sum, d) => sum + (d.actualIncome || 0), 0);
  const totalExpense = ytdActuals.reduce((sum, d) => sum + (d.actualExpense || 0), 0);
  const totalNet = totalIncome - totalExpense;
  const netMargin = (totalNet / totalIncome) * 100;

  // Toolbar States
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'composed'>('composed');
  const [showLabels, setShowLabels] = useState(false);
  const [showRefLine, setShowRefLine] = useState(true);
  const [customTarget, setCustomTarget] = useState<number | ''>(130000000);
  const [measure, setMeasure] = useState('nominal');
  const [dimension, setDimension] = useState('month');

  // Executive Summary Analytics
  const actualsOnly = trendData.filter(d => !d.isPredictive);
  const maxIncomeMonth = actualsOnly.reduce((max, d) => (d.actualIncome || 0) > (max.actualIncome || 0) ? d : max, actualsOnly[0]);
  const maxExpenseMonth = actualsOnly.reduce((max, d) => (d.actualExpense || 0) > (max.actualExpense || 0) ? d : max, actualsOnly[0]);
  const minNetProfitMonth = actualsOnly.reduce((min, d) => (d.netProfit || 0) < (min.netProfit || 0) ? d : min, actualsOnly[0]);
  const avgExpense = totalExpense / actualsOnly.length;

  const isCount = measure === 'count';
  const formatVal = (v: number) => isCount ? `${new Intl.NumberFormat('id-ID').format(Math.floor(v / 1000000))} Trx` : yAxisFormatter(v);

  // Dynamic Data based on measure and dimension
  const displayData = useMemo(() => {
    let processed = trendData;

    if (measure === 'count') {
      processed = processed.map(d => ({
        ...d,
        actualIncome: d.actualIncome ? Math.floor(d.actualIncome / 1000000) : null,
        actualExpense: d.actualExpense ? Math.floor(d.actualExpense / 1000000) : null,
        predIncome: d.predIncome ? Math.floor(d.predIncome / 1000000) : null,
        predExpense: d.predExpense ? Math.floor(d.predExpense / 1000000) : null,
        netProfit: d.netProfit ? Math.floor(d.netProfit / 1000000) : null,
        budgetLimit: Math.floor(d.budgetLimit / 1000000)
      }));
    }

    if (dimension === 'quarter') {
      const q1 = processed.slice(0, 3);
      const q2 = processed.slice(3, 6);
      const q3 = processed.slice(6, 9);
      const q4 = processed.slice(9, 12);
      const q1Est = processed.slice(12, 15);

      const sumQuarter = (qData: typeof processed, name: string, isPredictive: boolean) => {
        return {
          name,
          monthIndex: 0,
          isPredictive,
          actualIncome: isPredictive ? null : qData.reduce((sum, d) => sum + (d.actualIncome || 0), 0),
          actualExpense: isPredictive ? null : qData.reduce((sum, d) => sum + (d.actualExpense || 0), 0),
          predIncome: isPredictive ? qData.reduce((sum, d) => sum + (d.predIncome || 0), 0) : null,
          predExpense: isPredictive ? qData.reduce((sum, d) => sum + (d.predExpense || 0), 0) : null,
          netProfit: qData.reduce((sum, d) => sum + (d.netProfit || 0), 0),
          budgetLimit: qData.reduce((sum, d) => sum + d.budgetLimit, 0)
        };
      };

      processed = [
        sumQuarter(q1, 'Q1', false),
        sumQuarter(q2, 'Q2', false),
        sumQuarter(q3, 'Q3', false),
        sumQuarter(q4, 'Q4', false),
        sumQuarter(q1Est, 'Q1 (Est)', true)
      ];
    }

    return processed;
  }, [trendData, measure, dimension]);

  const currentDrillDown = drillDownData[selectedMonth];

  const handleChartClick = (state: any) => {
    // 1. If clicking directly on an element that provides activePayload
    if (state && state.activePayload && state.activePayload.length) {
      const data = state.activePayload[0].payload as TrendData;
      if (data && !data.isPredictive && drillDownData[data.name]) {
        setSelectedMonth(data.name);
        return;
      }
    }
    // 2. If clicking on the axis tick or background that provides activeLabel
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
            Financial Overview Page (OVP)
          </h2>
          <p className="text-slate-500 text-sm mt-1">Enterprise-grade Income & Expense Analytics with AI Forecasting</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium text-sm">
          <Download className="w-4 h-4 text-slate-500" /> Export Data
        </button>
      </div>

      {/* KPI Cards (Fiori Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Total YTD Income</p>
          <h3 className="text-3xl font-black text-slate-800 relative z-10">{yAxisFormatter(totalIncome)}</h3>
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              <TrendingUp className="w-3 h-3 mr-1" /> +15.4% YoY
            </span>
            <span className="text-xs text-slate-400 font-medium">vs Last Year</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Total YTD Expense</p>
          <h3 className="text-3xl font-black text-slate-800 relative z-10">{yAxisFormatter(totalExpense)}</h3>
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
              <TrendingUp className="w-3 h-3 mr-1" /> +4.2% YoY
            </span>
            <span className="text-xs text-slate-400 font-medium">vs Last Year</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Net Profit Margin</p>
          <h3 className="text-3xl font-black text-indigo-700 relative z-10">{netMargin.toFixed(1)}%</h3>
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              <TrendingUp className="w-3 h-3 mr-1" /> +2.1% Margin
            </span>
            <span className="text-xs text-slate-400 font-medium">vs Target 20%</span>
          </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Predictive Cash Flow Trend</h3>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <button onClick={() => toggleSeries('income')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['income'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-emerald-500 rounded-[3px]"></div> Income</button>
              <button onClick={() => toggleSeries('expense')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['expense'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-rose-500 rounded-[3px]"></div> Expense</button>
              <button onClick={() => toggleSeries('netprofit')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['netprofit'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 bg-indigo-600 rounded-[3px]"></div> Net Profit</button>
              <button onClick={() => toggleSeries('predictive')} className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 outline-none ${hiddenSeries['predictive'] ? 'opacity-40 grayscale' : ''}`}><div className="w-3 h-3 border-2 border-dashed border-slate-400 rounded-[3px]"></div> AI Forecast</button>
            </div>
          </div>

          {/* Top Toolbar Control Center */}
          <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-lg p-2 shadow-sm">
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

                <button onClick={() => setShowRefLine(!showRefLine)} title="Toggle Budget Limit" className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${showRefLine ? 'bg-rose-100 text-rose-700 shadow-sm' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'}`}>
                  <Target className="w-[16px] h-[16px] stroke-[2.5]" />
                </button>
                {showRefLine && (
                  <div className="flex items-center h-[26px] ml-1 px-1.5 bg-white border border-slate-200 rounded-md shadow-sm focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all duration-200">
                    <input
                      type="text"
                      placeholder="Budget..."
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

            {/* Analytical Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Measure</span>
                <div className="relative">
                  <select value={measure} onChange={(e) => setMeasure(e.target.value)} className="text-[12px] border border-slate-200 rounded-md px-3 py-1 bg-white focus:outline-none text-slate-700 font-bold appearance-none pr-8 h-[28px] cursor-pointer outline-none">
                    <option value="nominal">Nominal (IDR)</option>
                    <option value="count">Transaction Count</option>
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
            <ComposedChart data={displayData} onClick={handleChartClick} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} className="cursor-pointer">
              <defs>
                <linearGradient id="colorIncAct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpAct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <ReferenceArea x1={dimension === 'quarter' ? "Q4" : "Dec"} x2={dimension === 'quarter' ? "Q1 (Est)" : "Mar (Est)"} fill="#f1f5f9" fillOpacity={1} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis tickFormatter={(val) => isCount ? `${val}` : yAxisFormatter(val)} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />

              {/* Reference Budget Line */}
              {showRefLine && customTarget !== '' && (
                <ReferenceLine y={isCount ? Math.floor(Number(customTarget) / 1000000) : Number(customTarget)} stroke="#f43f5e" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Monthly Limit Target', fill: '#f43f5e', fontSize: 11, fontWeight: 'bold' }} />
              )}

              <ReferenceLine x={dimension === 'quarter' ? "Q4" : "Dec"} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'AI Prediction ➔', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />

              {/* Dynamic Chart Elements based on chartType */}
              {(chartType === 'area' || chartType === 'composed') && (
                <>
                  <Area hide={!!hiddenSeries['income']} type="monotone" dataKey="actualIncome" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncAct)" activeDot={{ r: 6, strokeWidth: 0 }} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: (v: number) => formatVal(v) } : false} />
                  <Area hide={!!hiddenSeries['expense']} type="monotone" dataKey="actualExpense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpAct)" activeDot={{ r: 6, strokeWidth: 0 }} label={showLabels ? { position: 'bottom', fill: '#f43f5e', fontSize: 10, formatter: (v: number) => formatVal(v) } : false} />

                  {/* Predictive Areas (Continuation of Gradient, No Stroke) */}
                  <Area hide={!!hiddenSeries['predictive']} type="monotone" dataKey="predIncome" stroke="none" fillOpacity={1} fill="url(#colorIncAct)" activeDot={false} />
                  <Area hide={!!hiddenSeries['predictive']} type="monotone" dataKey="predExpense" stroke="none" fillOpacity={1} fill="url(#colorExpAct)" activeDot={false} />
                </>
              )}

              {chartType === 'line' && (
                <>
                  <Line hide={!!hiddenSeries['income']} type="monotone" dataKey="actualIncome" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: (v: number) => formatVal(v) } : false} />
                  <Line hide={!!hiddenSeries['expense']} type="monotone" dataKey="actualExpense" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'bottom', fill: '#f43f5e', fontSize: 10, formatter: (v: number) => formatVal(v) } : false} />
                </>
              )}

              {(chartType === 'line' || chartType === 'composed') && (
                <Line hide={!!hiddenSeries['netprofit']} type="monotone" dataKey="netProfit" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} label={showLabels ? { position: 'top', fill: '#4f46e5', fontSize: 10, formatter: (v: number) => formatVal(v) } : false} />
              )}

              {chartType === 'bar' && (
                <>
                  <Bar hide={!!hiddenSeries['income']} dataKey="actualIncome" fill="#10b981" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#10b981', fontSize: 10, formatter: (v: number) => formatVal(v) } : false} />
                  <Bar hide={!!hiddenSeries['expense']} dataKey="actualExpense" fill="#f43f5e" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#f43f5e', fontSize: 10, formatter: (v: number) => formatVal(v) } : false} />
                </>
              )}

              {/* Predictives */}
              {chartType !== 'bar' && (
                <>
                  <Line hide={!!hiddenSeries['predictive']} type="monotone" dataKey="predIncome" stroke="#34d399" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                  <Line hide={!!hiddenSeries['predictive']} type="monotone" dataKey="predExpense" stroke="#fb7185" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                </>
              )}

              {chartType === 'bar' && (
                <>
                  <Bar hide={!!hiddenSeries['predictive']} dataKey="predIncome" fill="#34d399" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#34d399', fontSize: 10, formatter: (v: number) => formatVal(v) } : false} />
                  <Bar hide={!!hiddenSeries['predictive']} dataKey="predExpense" fill="#fb7185" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fill: '#fb7185', fontSize: 10, formatter: (v: number) => formatVal(v) } : false} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill-down Section (Odoo Style) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            Drill-Down Analysis:
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
              const drillDownTotalIncome = currentDrillDown.income.reduce((sum: number, item: any) => sum + item.value, 0);
              const drillDownTotalExpense = currentDrillDown.expense.reduce((sum: number, item: any) => sum + item.value, 0);

              const CustomCenterLabel = ({ total, label }: any) => {
                return (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                    <tspan x="50%" dy="-12" fontSize="11" fill="#64748b" className="uppercase font-bold tracking-wider">{label}</tspan>
                    <tspan x="50%" dy="24" fontSize="16" fill="#0f172a" fontWeight="900">{formatVal(total)}</tspan>
                  </text>
                );
              };

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Income Donut */}
                  <div className="flex flex-col items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Income Sources
                    </h4>
                    <div className="h-64 w-full flex justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            key={selectedMonth}
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
                            <Label content={<CustomCenterLabel total={drillDownTotalIncome} label="Total Income" />} position="center" />
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number, name: string, props: any) => [
                              `${formatVal(value)} (${((value / drillDownTotalIncome) * 100).toFixed(1)}%)`, 
                              name
                            ]} 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 'bold', color: '#334155' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Enterprise Legend for Income */}
                    <div className="w-full max-w-sm mt-8 space-y-2">
                      {currentDrillDown.income.map((entry: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-800">{formatVal(entry.value)}</span>
                            <span className="text-xs font-bold text-slate-400 w-10 text-right">{((entry.value / drillDownTotalIncome) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expense Donut */}
                  <div className="flex flex-col items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      Expense Categories
                    </h4>
                    <div className="h-64 w-full flex justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            key={selectedMonth}
                            data={currentDrillDown.expense}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {currentDrillDown.expense.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <Label content={<CustomCenterLabel total={drillDownTotalExpense} label="Total Expense" />} position="center" />
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number, name: string, props: any) => [
                              `${formatVal(value)} (${((value / drillDownTotalExpense) * 100).toFixed(1)}%)`, 
                              name
                            ]} 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 'bold', color: '#334155' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Enterprise Legend for Expense */}
                    <div className="w-full max-w-sm mt-8 space-y-2">
                      {currentDrillDown.expense.map((entry: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-800">{formatVal(entry.value)}</span>
                            <span className="text-xs font-bold text-slate-400 w-10 text-right">{((entry.value / drillDownTotalExpense) * 100).toFixed(1)}%</span>
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

      {/* Executive Summary & AI Insights (Odoo/SAP Standard) */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-3">
          <div className="text-blue-600"><Sparkles className="w-5 h-5" /></div>
          <h4 className="font-extrabold text-[18px] text-slate-800 tracking-tight">Executive Summary & Insights</h4>
        </div>


        <ul className="text-[13px] text-slate-700 space-y-3 list-none pl-0 leading-relaxed font-medium">
          <li className="flex items-start gap-2.5">
            <div className="mt-1.5 w-3 h-3 flex-shrink-0 bg-indigo-600 rounded-[3px]"></div>
            <span>
              <strong>Net Profit Margins:</strong> Secara agregat, operasional mencatatkan akumulasi laba bersih sebesar <strong className={totalNet >= 0 ? 'text-indigo-700' : 'text-rose-700'}>{formatVal(totalNet)}</strong>. Rasio profitabilitas ini merepresentasikan fundamental *cash flow* yang {totalNet >= 0 ? 'sangat prima' : 'tertekan'} untuk menopang ketahanan operasional dan rencana ekspansi.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1 w-3 h-3 flex-shrink-0 bg-emerald-500 rounded-[3px]"></div>
            <span>Bulan <strong className="text-emerald-700">{maxIncomeMonth.name}</strong> mencetak rekor pendapatan tertinggi (*Peak Performance*) sebesar <strong className="text-emerald-700">{formatVal(maxIncomeMonth.actualIncome!)}</strong>, sangat signifikan dibandingkan dengan beban pengeluaran yang terjadi di bulan yang sama.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="mt-1 w-3 h-3 flex-shrink-0 bg-rose-500 rounded-[3px]"></div>
            <span>Perlu diwaspadai: Titik pengeluaran tertinggi (*Highest Burn Rate*) tercatat pada bulan <strong className="text-rose-700">{maxExpenseMonth.name}</strong> sebesar <strong className="text-rose-700">{formatVal(maxExpenseMonth.actualExpense!)}</strong>. Tingkat pengeluaran ini melampaui rata-rata bulanan sebesar <strong>{formatVal(maxExpenseMonth.actualExpense! - avgExpense)}</strong>.</span>
          </li>
          {minNetProfitMonth.netProfit! < 0 && (
            <li className="flex items-start gap-2.5">
              <div className="mt-1 w-3 h-3 flex-shrink-0 bg-amber-500 rounded-[3px]"></div>
              <span>Anomali Laba Bersih terdeteksi pada bulan <strong className="text-amber-700">{minNetProfitMonth.name}</strong> di mana terjadi defisit kas sebesar <strong className="text-rose-700">{formatVal(minNetProfitMonth.netProfit!)}</strong>. Evaluasi lebih mendalam disarankan pada rincian akun pengeluaran di bulan tersebut.</span>
            </li>
          )}
          <li className="flex items-start gap-2.5">
            <div className="mt-1 w-3 h-3 flex-shrink-0 border-2 border-dashed border-slate-400 rounded-[3px]"></div>
            <span>Berdasarkan algoritma komparasi masa depan (*AI Forecast*), sistem memproyeksikan lintasan pertumbuhan yang <strong className="text-indigo-700">Relatif Stabil</strong> pada kuartal pertama tahun berikutnya, asalkan *Budget Limit* tetap dijaga di bawah angka <strong>{formatVal(Number(customTarget))}</strong>.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
