import React, { useState } from 'react';
import {
  FileText, Search, ChevronRight, X, Folder, Calendar,
  Building, Filter, PlayCircle, Clock, Edit, DollarSign, Tags, Map, SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import type { ReportCategory, ReportItem } from '../data/reportExplorerData';
import { reportCategories } from '../data/reportExplorerData';

import { AdvancedSelectionModal } from './reports/AdvancedSelectionModal';
import type { ReportParameters, OutputType } from '../types/reportParameters';

// -------------------------------------------------------------

interface FinancialStatementProps {
  onOpenTab?: (tabName: string) => void;
}

export const FinancialStatement: React.FC<FinancialStatementProps> = ({ onOpenTab }) => {
  const { branch } = useAuth();

  // States for Master-Detail View
  const [activeCategoryId, setActiveCategoryId] = useState<string>('financial_statements');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [parameterModalOpen, setParameterModalOpen] = useState(false);

  // Derived Data
  const activeCategory = reportCategories.find(c => c.id === activeCategoryId);
  const selectedReport = activeCategory?.reports.find(r => r.id === selectedReportId) || reportCategories.flatMap(c => c.reports).find(r => r.id === selectedReportId) || null;

  // Search Filter
  const filteredCategories = reportCategories.filter(cat => {
    if (!searchQuery) return true;
    const matchCat = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchReport = cat.reports.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat || matchReport;
  });

  const searchResults = searchQuery
    ? reportCategories.flatMap(c => c.reports).filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const displayReports = searchResults || activeCategory?.reports || [];

  const handleReportDoubleClick = (reportId: string) => {
    setSelectedReportId(reportId);
    setParameterModalOpen(true);
  };

  const handlePreviewClick = () => {
    if (selectedReportId) {
      setParameterModalOpen(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden animate-in fade-in duration-300">

      {/* Parameter Modal */}
      {parameterModalOpen && (
        <AdvancedSelectionModal
          report={selectedReport}
          onClose={() => setParameterModalOpen(false)}
          onExecute={(params, outputType) => {
            if (outputType === 'HTML_GRID' && onOpenTab) {
              localStorage.setItem('currentReportParams', JSON.stringify(params));
              onOpenTab(`ReportViewer : ${selectedReport?.name}`);
            } else {
              alert(`Fitur Export ${outputType} akan segera diaktifkan. Parameter direkam:\nCabang: ${params.branches.join(', ')}\nPeriode: ${params.periodFrom} to ${params.periodTo}`);
            }
          }}
        />
      )}

      {/* Top Action Bar (Accurate 4 Style Toolbar) */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 shrink-0 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 leading-tight">Index to Reports</h1>
              <p className="text-xs text-slate-500 font-medium">Enterprise Report Center</p>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-300 ml-2"></div>

          {/* Main Action Buttons */}
          <div className="flex gap-1 ml-4">
            <button
              onClick={handlePreviewClick}
              disabled={!selectedReportId}
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-slate-100 disabled:hover:bg-transparent disabled:text-slate-400 disabled:cursor-not-allowed text-slate-800 text-[14px] font-medium rounded transition-colors"
            >
              <FileText className={`w-4 h-4 ${selectedReportId ? 'text-blue-600' : 'text-slate-400'}`} /> Preview
            </button>
            <button
              disabled={!selectedReportId}
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-slate-100 disabled:hover:bg-transparent disabled:text-slate-400 disabled:cursor-not-allowed text-slate-800 text-[14px] font-medium rounded transition-colors"
            >
              <Edit className={`w-4 h-4 ${selectedReportId ? 'text-blue-600' : 'text-slate-400'}`} /> Design
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-[320px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pencarian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[14px] border border-slate-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Dual-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANE: Report Category */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {filteredCategories.map(cat => {
              const isActive = activeCategoryId === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setSelectedReportId(null); // Reset selection when changing category
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2 rounded text-[13px] font-medium transition-all ${isActive
                      ? 'bg-blue-500 text-white shadow-inner'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Report Detail */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-white">
            {displayReports.length > 0 ? (
              <div className="flex flex-col">
                {displayReports.map((report, index, array) => {
                  const isSelected = selectedReportId === report.id;
                  const previousReport = index > 0 ? array[index - 1] : null;
                  const showGroupSpacing = previousReport && previousReport.group !== report.group && report.group !== undefined;

                  return (
                    <React.Fragment key={report.id}>
                      {showGroupSpacing && <div className="h-5" />}
                      <div
                        onClick={() => setSelectedReportId(report.id)}
                        onDoubleClick={() => handleReportDoubleClick(report.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-all ${isSelected
                            ? 'bg-slate-200/70 text-slate-900 ring-1 ring-slate-300'
                            : 'border-transparent hover:bg-slate-100 text-slate-700'
                          }`}
                      >
                        <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <p className={`text-[13px] leading-tight ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                          {report.name}
                        </p>
                        {report.isCustom && (
                          <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                            Custom Template
                          </span>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Search className="w-12 h-12 mb-4 text-slate-200" />
                <p className="text-lg font-bold text-slate-500">No Reports Found</p>
                <p className="text-sm">Try adjusting your search criteria or selecting a different category.</p>
              </div>
            )}
          </div>

          {/* Status Bar (Footer) */}
          <div className="bg-slate-50 px-5 py-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-600 h-9">
            <span className="font-medium text-slate-500 line-clamp-1 max-w-[70%]">
              {selectedReport?.description || ''}
            </span>
            <span className="font-bold shrink-0 text-slate-700">{displayReports.length} Reports in this category</span>
          </div>
        </div>
      </div>
    </div>
  );
};
