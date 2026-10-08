import React, { useState } from 'react';
import { 
  Building, PlayCircle, Clock, DollarSign, Tags, SlidersHorizontal, X,
  Calendar, FileText, Download, Save, Bookmark, ToggleLeft, ToggleRight,
  Book, LineChart, Briefcase, Check
} from 'lucide-react';
import { useReportParameters } from '../../hooks/useReportParameters';
import type { ReportItem } from '../../data/reportExplorerData';
import type { ReportParameters, OutputType } from '../../types/reportParameters';

interface AdvancedSelectionModalProps {
  report: ReportItem | null;
  onClose: () => void;
  onExecute: (params: ReportParameters, outputType: OutputType) => void;
}

export const AdvancedSelectionModal: React.FC<AdvancedSelectionModalProps> = ({ report, onClose, onExecute }) => {
  const { params, setParams, savedProfiles, loadProfile, saveCurrentAsProfile } = useReportParameters();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  if (!report) return null;

  // METADATA-DRIVEN UI (Enterprise Standard)
  const isYearOnly = report.behavior?.requiresYearOnly === true;
  const isAsOfOnly = isYearOnly || report.behavior?.requiresDateRange === false || (report.group === 'bs' && report.behavior?.requiresDateRange !== true);
  const isGraph = report.group === 'graph';

  const handleSaveVariant = () => {
    if (newProfileName.trim()) {
      saveCurrentAsProfile(newProfileName.trim());
      setShowSaveDialog(false);
      setNewProfileName('');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#EEF2F6] px-8 py-5 flex justify-between items-center shrink-0 border-b border-slate-200 relative">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-slate-600" /> Advanced Selection Screen
            </h3>
            <p className="text-slate-600 text-sm mt-1 truncate max-w-lg">{report.name}</p>
          </div>
          <div className="flex items-center gap-4">
            {savedProfiles && savedProfiles.length > 0 && (
              <select 
                className="text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm max-w-[200px] truncate"
                onChange={(e) => loadProfile(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Load Variant...</option>
                {savedProfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowSaveDialog(!showSaveDialog)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-blue-700 bg-blue-100/50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/50"
            >
              <Bookmark className="w-4 h-4" /> Save Variant
            </button>
            <div className="w-px h-6 bg-slate-300"></div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Save Variant Dialog Popover */}
          {showSaveDialog && (
            <div className="absolute top-full right-8 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in slide-in-from-top-2">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Save Selection Variant</h4>
              <p className="text-xs text-slate-500 mb-3">Save these filters to use them later.</p>
              <input 
                type="text" 
                placeholder="Variant Name (e.g. Q3 IFRS Report)"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowSaveDialog(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
                <button onClick={handleSaveVariant} disabled={!newProfileName.trim()} className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">Save</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 relative">
          
          <div className="grid grid-cols-2 gap-8">
            {/* Dimension 1: Ledger & Scenario (New SAP Standards) */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                  <Book className="w-4 h-4" /> Accounting Principle (Ledger)
                </label>
                <select 
                  value={params.ledger}
                  onChange={(e) => setParams({...params, ledger: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
                >
                  <option value="0L">0L - Leading Ledger (Local GAAP)</option>
                  <option value="2L">2L - Non-Leading Ledger (IFRS)</option>
                  <option value="3L">3L - Tax Ledger</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                  <LineChart className="w-4 h-4" /> Reporting Scenario
                </label>
                <select 
                  value={params.scenario}
                  onChange={(e) => setParams({...params, scenario: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
                >
                  <option value="ACT">Actuals (Posted Transactions)</option>
                  <option value="BUD">Budget (Financial Plan)</option>
                  <option value="FOR">Forecast (Projected)</option>
                </select>
              </div>
            </div>

            {/* Dimension 2: Consolidation / Branch */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                <Building className="w-4 h-4" /> Consolidation Scope (Branch)
              </label>
              <div className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 h-full max-h-[160px] overflow-y-auto custom-scrollbar space-y-1">
                {[
                  { id: 'ALL', label: '[ALL] Corporate Parent', isBold: true },
                  { id: 'JKT', label: '1000 - Cabang Jakarta (HQ)' },
                  { id: 'SBY', label: '2000 - Cabang Surabaya' },
                  { id: 'BDG', label: '3000 - Cabang Bandung' },
                ].map(branch => (
                  <label key={branch.id} className="flex items-center gap-3 p-2.5 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-200 hover:shadow-sm">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      checked={params.branches?.includes(branch.id) || (branch.id === 'ALL' && (!params.branches || params.branches.length === 0))}
                      onChange={(e) => {
                        let newArr = params.branches || [];
                        if (e.target.checked) {
                          if (branch.id === 'ALL') newArr = ['ALL'];
                          else newArr = [...newArr.filter(id => id !== 'ALL'), branch.id];
                        } else {
                          newArr = newArr.filter(id => id !== branch.id);
                        }
                        setParams({...params, branches: newArr});
                      }}
                    />
                    <span className={`text-sm ${branch.isBold ? 'font-bold text-blue-700' : 'font-medium text-slate-700'}`}>
                      {branch.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="grid grid-cols-2 gap-8">
            {/* Dimension 3: Cost Center Multi-Select */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                <Tags className="w-4 h-4" /> Cost Center (Multi-Select)
              </label>
              <div className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 max-h-36 overflow-y-auto custom-scrollbar space-y-1">
                {[
                  { id: 'ALL', label: '[ALL] Entity Wide', isBold: true },
                  { id: 'CC01', label: 'CC01 - Marketing Dept' },
                  { id: 'CC02', label: 'CC02 - IT & Dev Dept' },
                  { id: 'PRJ_A', label: 'PRJ-A - Government Tender' },
                ].map(cc => (
                  <label key={cc.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-200">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      checked={params.costCenters?.includes(cc.id) || (cc.id === 'ALL' && (!params.costCenters || params.costCenters.length === 0))}
                      onChange={(e) => {
                        let newArr = params.costCenters || [];
                        if (e.target.checked) {
                          if (cc.id === 'ALL') newArr = ['ALL'];
                          else newArr = [...newArr.filter(id => id !== 'ALL'), cc.id];
                        } else {
                          newArr = newArr.filter(id => id !== cc.id);
                        }
                        setParams({...params, costCenters: newArr});
                      }}
                    />
                    <span className={`text-sm ${cc.isBold ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                      {cc.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dimension 4: Business Area / Segment */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                <Briefcase className="w-4 h-4" /> Business Area / Segment
              </label>
              <select 
                value={params.businessArea || 'ALL'}
                onChange={(e) => setParams({...params, businessArea: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
              >
                <option value="ALL">[ALL] Entity Wide</option>
                <option value="BA01">BA01 - Retail Operations</option>
                <option value="BA02">BA02 - Manufacturing & Factory</option>
                <option value="BA03">BA03 - Services & Consulting</option>
              </select>
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="grid grid-cols-2 gap-8">
            {/* Dimension 3: Smart Period Range */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                  {isYearOnly ? null : <Calendar className="w-4 h-4" />}
                  {isYearOnly
                    ? (isGraph ? 'Financial Period' : 'As Of Year (Per Tahun)')
                    : isAsOfOnly 
                    ? 'As Of Date (Per Tanggal)' 
                    : report.behavior?.defaultComparison === 'PREV_PERIOD' 
                      ? 'Primary Period' 
                      : isGraph
                        ? 'Evaluation Period (Time Frame)'
                        : 'Reporting Period (Statutory)'}
                </label>
                {!isYearOnly && (
                  <select 
                    className="text-xs font-bold text-blue-600 bg-transparent border-none outline-none cursor-pointer hover:underline"
                    value={params.datePreset}
                    onChange={(e) => setParams({...params, datePreset: e.target.value as any})}
                  >
                    <option value="CUSTOM">Custom Range...</option>
                    <option value="FISCAL_PERIOD">Fiscal Period (Accounting)</option>
                    <option value="TODAY">Today</option>
                    <option value="THIS_WEEK">This Week</option>
                    <option value="THIS_MONTH">This Month</option>
                    <option value="LAST_MONTH">Last Month</option>
                    <option value="THIS_QUARTER">This Quarter</option>
                    <option value="YTD">Year to Date (YTD)</option>
                    <option value="THIS_YEAR">This Year</option>
                  </select>
                )}
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                {isYearOnly ? (
                  <input
                    type="number"
                    value={params.periodTo ? new Date(params.periodTo).getFullYear() : new Date().getFullYear()}
                    onChange={(e) => setParams({...params, periodTo: `${e.target.value}-12-31`, datePreset: 'CUSTOM'})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
                    min="1900"
                    max="2100"
                  />
                ) : params.datePreset === 'FISCAL_PERIOD' ? (
                  <>
                    <input 
                      type="number" 
                      placeholder="Year"
                      value={new Date(params.periodFrom || new Date()).getFullYear()}
                      onChange={(e) => setParams({...params, periodFrom: `${e.target.value}-01-01`, periodTo: `${e.target.value}-12-31`})}
                      className="w-1/3 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400 text-center"
                    />
                    <select
                      className="w-2/3 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
                      onChange={(e) => {
                        const year = new Date(params.periodFrom || new Date()).getFullYear();
                        const month = e.target.value;
                        const lastDay = new Date(year, parseInt(month), 0).getDate();
                        setParams({...params, periodFrom: `${year}-${month.padStart(2, '0')}-01`, periodTo: `${year}-${month.padStart(2, '0')}-${lastDay}`});
                      }}
                      value={String(new Date(params.periodTo || new Date()).getMonth() + 1)}
                    >
                      <option value="1">Period 01 (Jan)</option>
                      <option value="2">Period 02 (Feb)</option>
                      <option value="3">Period 03 (Mar)</option>
                      <option value="4">Period 04 (Apr)</option>
                      <option value="5">Period 05 (May)</option>
                      <option value="6">Period 06 (Jun)</option>
                      <option value="7">Period 07 (Jul)</option>
                      <option value="8">Period 08 (Aug)</option>
                      <option value="9">Period 09 (Sep)</option>
                      <option value="10">Period 10 (Oct)</option>
                      <option value="11">Period 11 (Nov)</option>
                      <option value="12">Period 12 (Dec)</option>
                      <option value="13">Period 13 (Adjustment/Audit)</option>
                    </select>
                  </>
                ) : (
                  <>
                    {!isAsOfOnly && (
                      <>
                        <input 
                          type="date" 
                          value={params.periodFrom}
                          onChange={(e) => setParams({...params, periodFrom: e.target.value, datePreset: 'CUSTOM'})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
                        />
                        <span className="text-slate-400 font-bold px-1">to</span>
                      </>
                    )}
                    <input 
                      type="date" 
                      value={params.periodTo}
                      onChange={(e) => setParams({...params, periodTo: e.target.value, datePreset: 'CUSTOM'})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
                    />
                  </>
                )}
              </div>

              {/* Accurate 4 Enterprise Standard: Dual-Date Range for Compare Reports */}
              {report.behavior?.defaultComparison === 'PREV_PERIOD' && (
                <div className="pt-2 space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                    <Clock className="w-4 h-4" /> Compare To Period
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input 
                      type="date" 
                      value={params.comparePeriodFrom || ''}
                      onChange={(e) => setParams({...params, comparePeriodFrom: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
                    />
                    <span className="text-slate-400 font-bold px-1">to</span>
                    <input 
                      type="date" 
                      value={params.comparePeriodTo || ''}
                      onChange={(e) => setParams({...params, comparePeriodTo: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dimension X: Variance / Comparison (Hidden for Graph Reports) */}
            {!isGraph && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                  <Clock className="w-4 h-4" /> Variance Analysis
                </label>
                <select 
                  value={params.compareTo}
                  onChange={(e) => setParams({...params, compareTo: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
                >
                  <option value="NONE">No Comparison</option>
                  <option value="PREV_PERIOD">Compare to Previous Period</option>
                  <option value="PREV_YEAR">Compare to Previous Year (YoY)</option>
                  <option value="BUDGET">Compare to Budget</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Dimension 5: Currency */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                <DollarSign className="w-4 h-4" /> Display Currency
              </label>
              <select 
                value={params.currency}
                onChange={(e) => setParams({...params, currency: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
              >
                <option value="IDR">IDR - Base Currency</option>
                <option value="USD">USD - Reporting Currency (Rate: Live)</option>
              </select>
            </div>

            {/* Dimension 6: Accounting Toggles */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                <FileText className="w-4 h-4" /> Data Inclusion Settings
              </label>
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                
                {/* Switch 1 */}
                <div 
                  className="flex items-center justify-between cursor-pointer group" 
                  onClick={() => setParams({...params, includeUnposted: !params.includeUnposted})}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">Include Unposted / Draft</span>
                    <span className="text-[11px] text-slate-500">Calculate totals including draft journals.</span>
                  </div>
                  <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${params.includeUnposted ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${params.includeUnposted ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Switch 2 */}
                <div 
                  className="flex items-center justify-between cursor-pointer group" 
                  onClick={() => setParams({...params, hideZeroBalance: !params.hideZeroBalance})}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">Hide Zero-Balance Accounts</span>
                    <span className="text-[11px] text-slate-500">Do not display accounts with 0 balance.</span>
                  </div>
                  <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${params.hideZeroBalance ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${params.hideZeroBalance ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>

              </div>
            </div>

          </div>
          
        </div>

        {/* Modal Footer - Single Action */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button 
            onClick={() => {
              onExecute(params, 'HTML_GRID');
              onClose();
            }}
            className="px-10 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <PlayCircle className="w-5 h-5" /> Execute Report
          </button>
        </div>
      </div>
    </div>
  );
};
