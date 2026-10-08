import React, { useState, useEffect, useRef } from 'react';
import * as html2pdfLib from 'html2pdf.js';
import {
  Printer, Save, RefreshCw, Layout, X, Maximize2, Filter, FileSpreadsheet,
  SlidersHorizontal, BarChart2, Download, FolderOpen, Mail, Bookmark, Search, FileEdit, RotateCcw,
  Settings, ChevronDown, Share2, Columns, ChevronUp, ChevronRight, CheckCircle2, TrendingUp, PieChart, Activity, Layers, Hash, Target, MousePointerClick, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart, Cell,
  PieChart as RechartsPieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine
} from 'recharts';
import { AdvancedSelectionModal } from './AdvancedSelectionModal';
import { MemorizeReportModal } from './MemorizeReportModal';
import { LoadPresetModal } from './LoadPresetModal';

import type { EnterpriseReportViewerProps, FlatNode, BalanceSheetNode } from './viewer/types';
import { 
  BALANCE_SHEET_DATA, PROFIT_AND_LOSS_DATA, 
  generateCashFlowDetailData, generateCashFlowSummaryData, generateOwnerEquityData, generateFinancialHighlightData, 
  generateRetainedEarningData, generateMultiPeriodData, generateBudgetData, 
  generateCompareBudgetData, generateConsolidationData, generateCompareBudgetPeriodData 
} from './viewer/data';
import { getInitialExpandedNodes, getVisibleRows, formatCurrency } from './viewer/utils';
import { ReportRowItemFlat } from './viewer/components/ReportRowItemFlat';
import { EnterpriseFinancialChart } from './viewer/components/EnterpriseFinancialChart';
import { IncomeExpenseDashboard } from './viewer/components/IncomeExpenseDashboard';
import { getReportDefinition } from './definitions';

export const EnterpriseReportViewer: React.FC<EnterpriseReportViewerProps> = ({ reportName, onClose }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Feature States
  const [showAdvancedSelection, setShowAdvancedSelection] = useState(false);
  const [showMemorizeModal, setShowMemorizeModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string, desc: string }>({ title: '', desc: '' });

  // Advanced Features State
  const [showGraphView, setShowGraphView] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [activeFeatureModal, setActiveFeatureModal] = useState<{ title: string, icon: any } | null>(null);

  // Enterprise Layout Detection & Dynamic Definition Loader
  const definition = React.useMemo(() => getReportDefinition(reportName), [reportName]);
  const layoutConfig = definition?.layoutConfig || {};

  const isBalanceSheet = reportName.toLowerCase().includes('balance sheet');
  const isProfitAndLoss = reportName.toLowerCase().includes('profit & loss') || reportName.toLowerCase().includes('profit and loss');

  const isMultiPeriod = layoutConfig.isMultiPeriod || reportName.toLowerCase().includes('multi period');
  const isCompareMonth = layoutConfig.isCompareMonth || reportName.toLowerCase().includes('compare month') || reportName.toLowerCase().includes('compare period');
  const isBudgetPeriod = layoutConfig.isBudgetPeriod || (reportName.toLowerCase().includes('budget period') && !reportName.toLowerCase().includes('compare'));
  const isCompareBudget = layoutConfig.isCompareBudget || (reportName.toLowerCase().includes('compare budget') && !reportName.toLowerCase().includes('period'));
  const isCompareBudgetPeriod = layoutConfig.isCompareBudgetPeriod || reportName.toLowerCase().includes('compare budget period');
  const isCommonSized = layoutConfig.isCommonSized || reportName.toLowerCase().includes('common sized');
  const isConsolidation = layoutConfig.isConsolidation || reportName.toLowerCase().includes('consolidation');
  const isTrialBalanceClassic = reportName.toLowerCase() === 'trial balance (classic)';
  const isTrialBalanceStandard = layoutConfig.isTrialBalanceStandard || reportName.toLowerCase() === 'trial balance';
  const isParentScontro = reportName.toLowerCase().includes('parent scontro');
  const isRetainedEarning = layoutConfig.isRetainedEarning || reportName.toLowerCase().includes('retained earning');
  const isOwnerEquity = reportName.toLowerCase().includes("owner's equity");
  const isFinancialHighlight = layoutConfig.isFinancialHighlight || reportName.toLowerCase().includes('highlight');
  const isCashFlowDetail = layoutConfig.isCashFlowDetail || reportName.toLowerCase().includes('cash flows detail');
  const isCashFlowSummary = layoutConfig.isCashFlowSummary || reportName.toLowerCase().includes('cash flows summary');
  const isGraphView = definition?.isGraphView || reportName.toLowerCase().includes('graph');

  // Dynamic Parameters from Local Storage
  const [reportParams, setReportParams] = useState<{ periodFrom?: string, periodTo?: string } | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentReportParams');
      if (stored) setReportParams(JSON.parse(stored));
    } catch (e) { }
  }, []);

  const monthDiff = React.useMemo(() => {
    let diff = 3; // Default
    if (reportParams?.periodFrom && reportParams?.periodTo) {
      const from = new Date(reportParams.periodFrom);
      const to = new Date(reportParams.periodTo);
      diff = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1;
      if (diff < 1) diff = 1;
    }
    return diff;
  }, [reportParams]);

  const multiPeriodHeaders = React.useMemo(() => {
    const headers = [];
    if (reportParams?.periodFrom) {
      const from = new Date(reportParams.periodFrom);
      for (let i = 0; i < monthDiff; i++) {
        const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
        headers.push(d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
      }
    } else {
      const currentYear = new Date().getFullYear();
      headers.push(`Apr ${currentYear}`, `May ${currentYear}`, `Jun ${currentYear}`);
    }
    return headers;
  }, [reportParams, monthDiff]);

  // Prepare Data Source
  const reportData = React.useMemo(() => {
    // Dynamic loading from definition file (Strategy Pattern)
    if (definition && definition.generateData) {
      return definition.generateData(reportParams);
    }
    
    // Safety fallback (should never be reached if Registry is complete)
    return [];
  }, [definition, reportParams]);

  // Derive Total Assets for Common Sized Analytics
  const totalAssets = React.useMemo(() => {
    if (!isCommonSized) return 0;
    let total = 0;
    const findTotal = (nodes: BalanceSheetNode[]) => {
      for (const n of nodes) {
        if (n.description.toLowerCase().includes('aset') || n.description.toLowerCase().includes('asset')) {
          if (n.balance !== undefined && n.balance > total) total = n.balance;
        }
        if (n.children) findTotal(n.children);
      }
    };
    findTotal(reportData);
    return total > 0 ? total : 1;
  }, [reportData, isCommonSized]);

  // Tree State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => getInitialExpandedNodes(reportData));

  // Fix: Force recalculation of expanded nodes when report data switches (e.g. BS -> P&L)
  useEffect(() => {
    setExpandedNodes(getInitialExpandedNodes(reportData));
  }, [reportData]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Pagination Engine Logic
  const visibleRows = getVisibleRows(reportData, expandedNodes);
  // Landscape A4 has much shorter height, so we reduce rows per page to prevent physical spillover.
  const isLandscapeMultiPeriod = (isMultiPeriod || isBudgetPeriod) && monthDiff > 4;
  const isLandscapeComparePeriod = isCompareBudgetPeriod && monthDiff > 1; // 2 months = 4 columns + 2 totals = 6 columns
  const isLandscape = isLandscapeMultiPeriod || isLandscapeComparePeriod || isGraphView || isTrialBalanceClassic;
  const ROWS_PER_PAGE = isLandscape ? 13 : 27;
  const pages: FlatNode[][] = [];
  for (let i = 0; i < visibleRows.length; i += ROWS_PER_PAGE) {
    pages.push(visibleRows.slice(i, i + ROWS_PER_PAGE));
  }

  // Search Engine State
  const [showFindDialog, setShowFindDialog] = useState(false);
  const [findKeyword, setFindKeyword] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);

  const getInitialDialogPos = () => ({
    x: typeof window !== 'undefined' ? Math.max(0, (window.innerWidth - 340) / 2) : 300,
    y: typeof window !== 'undefined' ? Math.max(0, (window.innerHeight - 150) / 2) : 200
  });

  const [dialogPos, setDialogPos] = useState(getInitialDialogPos());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      const maxX = window.innerWidth - 320;
      const maxY = window.innerHeight - 150;

      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX > maxX) newX = maxX;
      if (newY > maxY) newY = maxY;

      setDialogPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Listen for Enter key dynamically in document search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setShowFindDialog(true);
      } else if (e.key === 'Escape' && showFindDialog) {
        setShowFindDialog(false);
        if (printAreaRef.current) {
          const marks = printAreaRef.current.querySelectorAll('mark.search-highlight');
          marks.forEach(mark => {
            const parent = mark.parentNode;
            if (parent) {
              parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
              parent.normalize();
            }
          });
          setMatchCount(0);
          setCurrentMatch(0);
        }
        setDialogPos(getInitialDialogPos());
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showFindDialog]);

  const handlePrint = () => {
    // Standard Enterprise Web Print using CSS @media print
    window.print();
  };

  const handleExport = async () => {
    try {
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `Laporan_${reportName.replace(/\s+/g, '_')}_${new Date().getTime()}`,
          types: [
            { description: 'Format PDF (.pdf)', accept: { 'application/pdf': ['.pdf'] } },
            { description: 'Format Excel (.xls)', accept: { 'application/vnd.ms-excel': ['.xls', '.xlsx'] } },
            { description: 'Format JSON Raw Data', accept: { 'application/json': ['.json'] } }
          ]
        });

        const writable = await handle.createWritable();
        const extension = handle.name.split('.').pop()?.toLowerCase();

        try {
          if (extension === 'json') {
            // Provide raw data dump for Data Analysts
            await writable.write(JSON.stringify(BALANCE_SHEET_DATA, null, 2));
          } else if (extension === 'pdf') {
            const printContent = printAreaRef.current;
            if (printContent) {
              const opt = {
                margin: [15, 10, 15, 10], // Elegant margins
                filename: handle.name,
                image: { type: 'jpeg', quality: 0.98 },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                html2canvas: {
                  scale: 2,
                  useCORS: true,
                  logging: false,
                  scrollY: 0,
                  windowWidth: 794,
                  onclone: (clonedDoc: Document) => {
                    // ENTERPRISE FIX for Tailwind v4 oklch() crash in html2canvas
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                      :root { --default-border-color: transparent !important; }
                      body { color: #000 !important; background-color: #fff !important; }
                      * { border-color: #000; }
                    `;
                    clonedDoc.head.appendChild(style);
                    const elements = clonedDoc.querySelectorAll('*');
                    elements.forEach(el => {
                      if (el.className && typeof el.className === 'string') {
                        el.className = el.className.replace(/\b(bg|text|border|from|to|ring|divide)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/g, '');
                        el.className = el.className.replace(/\b(bg|text|border)-(white|black|transparent)\b/g, '');
                      }
                    });
                  }
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
              };

              const html2pdfFn = typeof html2pdfLib === 'function' ? html2pdfLib : (html2pdfLib as any).default;
              if (typeof html2pdfFn !== 'function') {
                throw new Error('Library html2pdf gagal dimuat');
              }

              const worker = html2pdfFn().set(opt).from(printContent);
              const pdfBlob = await worker.output('blob');

              if (!pdfBlob || pdfBlob.size === 0) {
                throw new Error('Render PDF menghasilkan file kosong.');
              }

              await writable.write(pdfBlob);
            }
          } else {
            // Excel Fallback Logic
            const htmlStr = `<html><body><h1>RNF ERP Document</h1><p>Export to .${extension} is fully integrated in Backend Engine.</p></body></html>`;
            await writable.write(htmlStr);
          }
        } finally {
          await writable.close();
        }
      } else {
        alert('Sistem O/S atau Browser Anda tidak mendukung Native File System Access API.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('user aborted')) {
        console.log('Operasi dibatalkan secara elegan oleh pengguna.');
      } else {
        alert('Ekspor Gagal: ' + (err.message || err));
      }
    }
  };

  const handleShare = async () => {
    setIsDropdownOpen(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: reportName,
          text: 'Tinjauan Laporan Keuangan dari RNF ERP Enterprise.',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share dibatalkan pengguna');
      }
    } else {
      const subject = encodeURIComponent(`Laporan: ${reportName}`);
      const body = encodeURIComponent(`Tinjauan Laporan Keuangan dari RNF ERP Enterprise.\n\nLink: ${window.location.href}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  const handleReset = () => {
    setIsDropdownOpen(false);
    setShowGraphView(false);
    setExpandedNodes(getInitialExpandedNodes(BALANCE_SHEET_DATA));
    handleRefresh();
    setToastMessage({
      title: 'Dikembalikan ke Standar',
      desc: 'Parameter, tata letak, dan filter telah kembali ke setelan pabrik.'
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const clearHighlights = () => {
    if (!printAreaRef.current) return;
    const marks = printAreaRef.current.querySelectorAll('mark.search-highlight');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
    setMatchCount(0);
    setCurrentMatch(0);
  };

  const executeFind = (direction: 'next' | 'prev' | 'first' = 'next') => {
    if (!findKeyword.trim()) {
      clearHighlights();
      return;
    }

    clearHighlights(); // Reset before new search
    const printArea = printAreaRef.current;
    if (!printArea) return;

    // Escaping keyword for safe regex
    const escapedKeyword = findKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    let count = 0;

    const walk = document.createTreeWalker(printArea, NodeFilter.SHOW_TEXT, null);
    const nodesToReplace: { node: Node, text: string }[] = [];

    let node;
    while ((node = walk.nextNode())) {
      if (node.nodeValue && regex.test(node.nodeValue)) {
        if (node.parentElement && !['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
          nodesToReplace.push({ node, text: node.nodeValue });
        }
      }
    }

    nodesToReplace.forEach(({ node, text }) => {
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      text.replace(regex, (match, p1, offset) => {
        if (offset > lastIdx) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx, offset)));
        }
        const mark = document.createElement('mark');
        mark.className = 'search-highlight bg-yellow-200 text-slate-900 rounded-[2px] shadow-sm transition-all duration-300';
        mark.dataset.index = String(count++);
        mark.textContent = match;
        frag.appendChild(mark);
        lastIdx = offset + match.length;
        return match;
      });
      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      }
      if (node.parentNode) {
        node.parentNode.replaceChild(frag, node);
      }
    });

    setMatchCount(count);

    if (count > 0) {
      let targetIndex = currentMatch;
      if (direction === 'next') {
        targetIndex = (currentMatch + 1) > count ? 1 : currentMatch + 1;
      } else if (direction === 'prev') {
        targetIndex = (currentMatch - 1) < 1 ? count : currentMatch - 1;
      } else if (direction === 'first') {
        targetIndex = 1;
      } else {
        targetIndex = 1;
      }
      setCurrentMatch(targetIndex);

      const targetMark = printArea.querySelector(`mark[data-index="${targetIndex - 1}"]`);
      if (targetMark) {
        targetMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Pulse effect for current active match
        document.querySelectorAll('mark.search-highlight').forEach(m => {
          m.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-200', 'scale-110');
          m.classList.add('bg-yellow-200');
        });
        targetMark.classList.remove('bg-yellow-200');
        targetMark.classList.add('bg-blue-200', 'ring-2', 'ring-blue-500', 'scale-110', 'z-10', 'relative');
      }
    } else {
      setCurrentMatch(0);
    }
  };

  // Live search functionality (Enterprise standard auto-search)
  useEffect(() => {
    if (showFindDialog) {
      const timer = setTimeout(() => {
        executeFind('first');
      }, 250); // 250ms debounce for smooth typing experience
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findKeyword, showFindDialog]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - dialogPos.x,
      y: e.clientY - dialogPos.y
    });
  };

  const handleFindText = () => {
    if (showFindDialog) {
      clearHighlights();
      setShowFindDialog(false);
      setDialogPos(getInitialDialogPos());
    } else {
      setShowFindDialog(true);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-md animate-in fade-in duration-300 print:shadow-none print:border-none">
      {/* Inject Print Orientation Overrides */}
      <style type="text/css" media="print">
        {`
          @page { size: A4 ${isLandscape ? 'landscape' : 'portrait'} !important; margin: 0 !important; }
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .print-graph-scale {
            transform: scale(0.85);
            transform-origin: top center;
            width: 115% !important;
            margin-left: -7.5% !important;
          }
        `}
      </style>
      {/* Floating Find Dialog (Modern Enterprise Style) */}
      {showFindDialog && (
        <div
          className="fixed bg-white border border-slate-200 shadow-2xl rounded-lg z-[100] flex flex-col font-sans select-none print:hidden overflow-hidden"
          style={{ left: dialogPos.x, top: dialogPos.y, width: 340 }}
        >
          {/* Dialog Header (Draggable) */}
          <div
            className="bg-slate-50 px-3 py-2 flex justify-between items-center cursor-move border-b border-slate-200"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" strokeWidth={2} />
              <span className="text-[12px] font-bold text-slate-700 tracking-wide uppercase">Cari di Dokumen</span>
            </div>
            <button
              onClick={() => {
                setShowFindDialog(false);
                clearHighlights();
                setDialogPos(getInitialDialogPos());
              }}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-colors"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dialog Body */}
          <div className="p-3 flex flex-col gap-3 bg-white">
            <div className="flex items-center relative">
              <input
                type="text"
                autoFocus
                placeholder="Masukkan teks untuk dicari..."
                className="w-full border border-slate-300 pl-3 pr-8 py-1.5 text-[13px] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                value={findKeyword}
                onChange={(e) => {
                  setFindKeyword(e.target.value);
                  if (!e.target.value) clearHighlights();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') executeFind(e.shiftKey ? 'prev' : 'next');
                }}
              />
              {findKeyword && (
                <button
                  onClick={() => { setFindKeyword(''); clearHighlights(); }}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[11.5px] font-medium text-slate-500">
                {matchCount > 0 ? (
                  <span className="text-blue-600 font-semibold">{currentMatch} dari {matchCount} hasil</span>
                ) : (findKeyword && matchCount === 0 ? (
                  <span className="text-red-500">Tidak ada hasil ditemukan</span>
                ) : (
                  <span>Siap untuk mencari</span>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => executeFind('prev')}
                  disabled={!findKeyword || matchCount === 0}
                  className="p-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Hasil sebelumnya (Shift+Enter)"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => executeFind('next')}
                  disabled={!findKeyword}
                  className="p-1.5 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Hasil berikutnya (Enter)"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Toolbar (Sleek Horizontal Style) */}
      <div className="flex items-center justify-between p-1.5 bg-white border-b border-slate-200 shrink-0 print:hidden relative z-10 shadow-sm">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">

            {!(isGraphView || showGraphView) && (
              <>
                <button
                  onClick={() => setShowAdvancedSelection(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" strokeWidth={2} />
                  <span className="font-semibold text-[12px]">Modifikasi</span>
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />
              </>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
            >
              <Printer className="w-4 h-4 text-slate-600" strokeWidth={2} />
              <span className="font-semibold text-[12px]">Cetak</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
            >
              <Save className="w-4 h-4 text-slate-600" strokeWidth={2} />
              <span className="font-semibold text-[12px]">Simpan</span>
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            <button
              onClick={() => setShowMemorizeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
            >
              <Bookmark className="w-4 h-4 text-pink-600" strokeWidth={2} />
              <span className="font-semibold text-[12px]">Simpan Format</span>
            </button>

            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0">
              <RefreshCw className={`w-4 h-4 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
              <span className="font-semibold text-[12px]">Perbarui</span>
            </button>

            {!(isGraphView || showGraphView) && (
              <button onClick={handleFindText} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0">
                <Search className="w-4 h-4 text-slate-500" strokeWidth={2} />
                <span className="font-semibold text-[12px]">Cari Teks</span>
              </button>
            )}
          </div>

          {/* More Actions (Pinned outside overflow container to prevent clipping) */}
          <div className="flex items-center gap-1 pl-1 shrink-0">
            <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* More Actions Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${isDropdownOpen ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                <Settings className="w-4 h-4 text-slate-500" strokeWidth={2} />
                <span className="font-semibold text-[12px]">Aksi Lainnya</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1 flex flex-col">
                      {!isGraphView && (
                        <button
                          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors text-left w-full ${showGraphView ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                          onClick={() => { setIsDropdownOpen(false); setShowGraphView(!showGraphView); }}
                        >
                          <BarChart2 className={`w-4 h-4 shrink-0 ${showGraphView ? 'text-blue-600' : 'text-purple-600'}`} />
                          <span className="font-semibold text-[12px]">{showGraphView ? 'Tampilan Tabel' : 'Tampilan Grafik'}</span>
                        </button>
                      )}
                      <button
                        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition-colors text-left w-full"
                        onClick={() => { setIsDropdownOpen(false); setShowPresetModal(true); }}
                      >
                        <Bookmark className="w-4 h-4 text-pink-600 shrink-0" />
                        <span className="font-semibold text-[12px]">Muat Format</span>
                      </button>
                      <button
                        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition-colors text-left w-full"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="font-semibold text-[12px]">Bagikan Laporan</span>
                      </button>

                      {!(isGraphView || showGraphView) && (
                        <>
                          <div className="h-px w-full bg-slate-100 my-1" />

                          <button
                            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition-colors text-left w-full"
                            onClick={() => { setIsDropdownOpen(false); setActiveFeatureModal({ title: 'Pengaturan Tata Letak', icon: Layout }); }}
                          >
                            <Layout className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="font-semibold text-[12px]">Pengaturan Tata Letak</span>
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition-colors text-left w-full"
                            onClick={() => { setIsDropdownOpen(false); setActiveFeatureModal({ title: 'Manajemen Kolom Kustom', icon: Columns }); }}
                          >
                            <Columns className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="font-semibold text-[12px]">Kelola Kolom</span>
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-rose-50 hover:text-rose-700 text-slate-700 transition-colors text-left w-full"
                            onClick={handleReset}
                          >
                            <RotateCcw className="w-4 h-4 text-rose-500 shrink-0" />
                            <span className="font-semibold text-[12px]">Kembalikan ke Standar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Selection Modal integration for "Modifikasi" */}
      {showAdvancedSelection && (
        <AdvancedSelectionModal
          report={{ 
            id: definition?.id || 'bs_standard', 
            name: reportName, 
            categoryId: 'fin', 
            type: 'STANDARD',
            behavior: definition?.behavior
          }}
          onClose={() => setShowAdvancedSelection(false)}
          onExecute={(params, outputType) => {
            setShowAdvancedSelection(false);
            handleRefresh();
          }}
        />
      )}

      {/* Memorize Report Modal (Accurate 4 Desktop Style) */}
      {showMemorizeModal && (
        <MemorizeReportModal
          currentReportName={reportName}
          onClose={() => setShowMemorizeModal(false)}
          onSave={(name, title) => {
            setShowMemorizeModal(false);

            // Collect the current state configuration
            const currentConfig = {
              chartType,
              measure,
              dimension,
              splitBy,
              compareMode,
              activeCategories
            };

            // Load existing presets from LocalStorage
            let presets = [];
            const saved = localStorage.getItem('rnf_report_presets');
            if (saved) {
              try { presets = JSON.parse(saved); } catch (e) { }
            }

            // Format current date
            const date = new Date();
            const formatDateTime = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

            // Overwrite or append
            const newPreset = {
              id: Date.now().toString(),
              name,
              title,
              lastModified: formatDateTime,
              config: currentConfig
            };

            const existingIndex = presets.findIndex((p: any) => p.name.toLowerCase() === name.toLowerCase());
            if (existingIndex >= 0) {
              newPreset.id = presets[existingIndex].id;
              presets[existingIndex] = newPreset;
            } else {
              presets.push(newPreset);
            }

            // Save to LocalStorage
            localStorage.setItem('rnf_report_presets', JSON.stringify(presets));

            setToastMessage({
              title: 'Format Berhasil Disimpan',
              desc: `Format "${name}" telah diamankan secara lokal di browser Anda.`
            });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
          }}
        />
      )}

      {/* Advanced Feature Gate Modal (For Under Construction Modules) */}
      {activeFeatureModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-[450px] p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-50/80 rounded-2xl flex items-center justify-center mb-5 ring-4 ring-blue-50">
              {React.createElement(activeFeatureModal.icon, { className: "w-8 h-8 text-blue-600 animate-pulse" })}
            </div>
            <h3 className="text-[20px] font-bold text-slate-800 mb-2 tracking-tight">{activeFeatureModal.title}</h3>
            <p className="text-[14px] text-slate-500 mb-8 leading-relaxed max-w-[320px]">
              Modul fungsionalitas kustomisasi tingkat lanjut ini sedang dikembangkan oleh Tim RNF Enterprise untuk pembaruan mayor berikutnya.
            </p>
            <button
              onClick={() => setActiveFeatureModal(null)}
              className="w-full px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-[14px]"
            >
              Kembali ke Laporan
            </button>
          </div>
        </div>
      )}

      {/* Load Preset Modal (Real LocalStorage Implementation) */}
      {showPresetModal && (
        <LoadPresetModal
          onClose={() => setShowPresetModal(false)}
          onLoad={(config) => {
            // Apply all configurations from the preset
            if (config.chartType) setChartType(config.chartType);
            if (config.measure) setMeasure(config.measure);
            if (config.dimension) setDimension(config.dimension);
            if (config.splitBy) setSplitBy(config.splitBy);
            if (config.compareMode) setCompareMode(config.compareMode);
            if (config.activeCategories) setActiveCategories(config.activeCategories);
            
            setShowPresetModal(false);
            setToastMessage({
              title: 'Preset Berhasil Dimuat',
              desc: 'Konfigurasi grafik telah diperbarui berdasarkan preset.'
            });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }}
        />
      )}

      {/* Dynamic Notification Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-white border border-slate-200 px-5 py-4 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-[200] flex items-start gap-3 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" strokeWidth={2.5} />
          <div className="flex flex-col font-sans">
            <span className="text-[14px] font-bold text-slate-800 tracking-tight">{toastMessage.title}</span>
            <span className="text-[12px] text-slate-500 mt-0.5 max-w-[250px] leading-snug">{toastMessage.desc}</span>
          </div>
        </div>
      )}

      {/* Grid Canvas Area (Paper Simulation or Graph View) */}
      <div className={`flex-1 overflow-auto print:bg-white print:overflow-visible print:block flex flex-col items-center print:p-0 print:gap-0 relative custom-scrollbar ${isGraphView ? 'bg-white' : 'bg-slate-100 p-4 pt-3 gap-4'}`}>

        {isGraphView ? (
          <div className="w-full mx-auto animate-in fade-in duration-500 flex flex-col justify-center items-start relative print:h-[210mm] print:max-h-[210mm] print:overflow-hidden">
            {reportName.toLowerCase().includes('income and expense') ? (
              <IncomeExpenseDashboard />
            ) : (
              <EnterpriseFinancialChart reportName={reportName} reportParams={reportParams} />
            )}
            {/* Print-Specific Footer for Graph View */}
            <div className="hidden print:flex justify-between border-t border-black pt-2 pb-1 text-[10px] text-slate-500 fixed bottom-[12mm] left-[12mm] right-[12mm] z-50">
              <span>Page 1/1</span>
              <span>Printed by RNF Enterprise System Report</span>
            </div>
          </div>
        ) : showGraphView ? (
          <div className="w-full max-w-[1000px] mx-auto bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col items-center justify-center animate-in fade-in duration-500 p-12 text-center">
            <div className="relative">
              <BarChart2 className="w-32 h-32 text-slate-100" strokeWidth={1} />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
            </div>
            <h2 className="text-[24px] font-bold text-slate-800 mt-4 tracking-tight">Enterprise Visual Analytics</h2>
            <p className="text-[14px] text-slate-500 mt-2 max-w-[450px] leading-relaxed mb-8">
              Modul Intelijen Bisnis (Business Intelligence) untuk visualisasi grafis laporan keuangan sedang dioptimalkan. Analisis <i>real-time</i> menggunakan pustaka rendering GPU akan segera tersedia.
            </p>
            <button
              onClick={() => setShowGraphView(false)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-[13px] shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Layout className="w-4 h-4" /> Kembali ke Tampilan Kertas
            </button>
          </div>
        ) : (
          pages.map((pageRows, pageIndex) => (
            <div key={`page-${pageIndex}`} ref={pageIndex === 0 ? printAreaRef : null} className={`a4-paper ${isLandscape ? 'w-[297mm] min-h-[210mm] print:w-[297mm] print:min-h-[190mm] print:h-[190mm]' : 'w-[210mm] min-h-[297mm] print:w-[210mm] print:min-h-[275mm] print:h-[275mm]'} print:m-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] print:shadow-none print:border-none rounded-sm border p-[12mm] flex flex-col shrink-0 overflow-visible print:overflow-hidden box-border bg-white border-slate-200 relative ${pageIndex < pages.length - 1 ? 'print:break-after-page' : 'print:break-inside-avoid'}`}>

              {/* Report Header (Accurate 4 Standard with Logo & Period) */}
              <div className="relative mb-8 text-black font-sans shrink-0">
                <div className="absolute top-0 left-0 w-20 h-20 flex items-start justify-start">
                  <img src="/rnflogokop.jpg" alt="Logo RNF" className="w-full h-full object-contain" />
                </div>
                <div className="text-center pt-1">
                  <div className="text-[15px] font-bold">PT. Rezeki Nadh Fathan</div>
                  <div className="text-[22px] font-bold mt-1 leading-tight text-[#e40505]">{reportName}</div>

                  {isProfitAndLoss || isRetainedEarning || isFinancialHighlight || isCashFlowDetail || isCashFlowSummary ? (
                    <>
                      <div className="text-[14px] font-bold mt-1">
                        {isRetainedEarning || isFinancialHighlight ? `Period Year ${reportParams?.periodTo ? new Date(reportParams.periodTo).getFullYear() : new Date().getFullYear()}` :
                          isCompareMonth ? 'Comparative Analysis' :
                            (isCashFlowDetail || isCashFlowSummary) ? `Period ${reportParams?.periodFrom ? new Date(reportParams.periodFrom).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'August 2011'} to ${reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'October 2011'}` :
                              `For the Period Ended ${reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '29 Juni ' + new Date().getFullYear()}`}
                      </div>
                      {isCompareMonth ? (
                        <div className="text-[12px] mt-0.5">
                          [Period 1]: {reportParams?.comparePeriodFrom ? new Date(reportParams.comparePeriodFrom).toLocaleDateString('en-GB') : '01/05/' + new Date().getFullYear()} to {reportParams?.comparePeriodTo ? new Date(reportParams.comparePeriodTo).toLocaleDateString('en-GB') : '31/05/' + new Date().getFullYear()} <br />
                          [Period 2]: {reportParams?.periodFrom ? new Date(reportParams.periodFrom).toLocaleDateString('en-GB') : '01/06/' + new Date().getFullYear()} to {reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString('en-GB') : '30/06/' + new Date().getFullYear()}
                        </div>
                      ) : (
                        !(isRetainedEarning || isFinancialHighlight || isCashFlowDetail || isCashFlowSummary) && reportParams?.periodFrom && <div className="text-[12px] font-bold mt-0.5">Period {new Date(reportParams.periodFrom).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} to {reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '29/06/' + new Date().getFullYear()}</div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-[14px] font-bold mt-1">
                        {isCompareMonth ? 'Comparative Analysis' : `As of ${reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '17 Juni ' + new Date().getFullYear()}`}
                      </div>
                      {isCompareMonth ? (
                        <div className="text-[12px] mt-0.5">
                          [Period 1]: {reportParams?.comparePeriodTo ? new Date(reportParams.comparePeriodTo).toLocaleDateString('en-GB') : '31/05/' + new Date().getFullYear()} <br />
                          [Period 2]: {reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString('en-GB') : '30/06/' + new Date().getFullYear()}
                        </div>
                      ) : (
                        reportParams?.periodFrom && <div className="text-[12px] mt-0.5">Period: {new Date(reportParams.periodFrom).toLocaleDateString('en-GB')} to {reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString('en-GB') : '29/06/' + new Date().getFullYear()}</div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Data Grid Area */}
              <div className="w-full mt-6 flex-1 flex flex-col pb-8">
                {isGraphView ? (
                  reportName.toLowerCase().includes('income and expense') ? (
                    <IncomeExpenseDashboard />
                  ) : (
                    <EnterpriseFinancialChart reportName={reportName} reportParams={reportParams} />
                  )
                ) : (
                  <>
                    {/* Column Headers */}
                    <div className="flex text-[12px] font-bold text-black border-y border-black py-1 mb-2 shrink-0">
                      {isCashFlowDetail ? (
                        <>
                          <div className="w-64 text-center px-1">Account No.</div>
                          <div className="flex-1 text-center px-1">Account No. Name</div>
                        </>
                      ) : isCashFlowSummary ? (
                        <>
                          <div className="w-48 text-center px-1">Status</div>
                          <div className="flex-1 text-center px-1">Account Type</div>
                        </>
                      ) : (
                        <div className={`${isLandscape ? 'w-[220px] shrink-0' : 'flex-1 min-w-[200px]'} text-center`}>Description</div>
                      )}
                      {isCompareBudgetPeriod ? (
                        <>
                          {multiPeriodHeaders.map((header, idx) => (
                            <React.Fragment key={idx}>
                              <div className="flex-1 min-w-[65px] text-center px-1">Act {header}</div>
                              <div className="flex-1 min-w-[65px] text-center px-1">Bud {header}</div>
                            </React.Fragment>
                          ))}
                          {monthDiff > 1 && (
                            <>
                              <div className="flex-1 min-w-[65px] text-center font-extrabold px-1">Total Actual</div>
                              <div className="flex-1 min-w-[65px] text-center font-extrabold px-1">Total Budget</div>
                            </>
                          )}
                        </>
                      ) : isConsolidation ? (
                        <>
                          <div className="w-40 text-center">PT. Rezeki Nadh Fathan</div>
                          <div className="w-40 text-center">Total</div>
                        </>
                      ) : isTrialBalanceClassic ? (
                        <>
                          <div className="flex-1 min-w-[130px] text-center">Opening Balance</div>
                          <div className="flex-1 min-w-[130px] text-center">Debit</div>
                          <div className="flex-1 min-w-[130px] text-center">Credit</div>
                          <div className="flex-1 min-w-[130px] text-center">Ending Balance</div>
                        </>
                      ) : isTrialBalanceStandard ? (
                        <>
                          <div className="w-40 text-center">Debit</div>
                          <div className="w-40 text-center">Credit</div>
                        </>
                      ) : isCommonSized ? (
                        <>
                          <div className="w-32 text-center">Balance</div>
                          <div className="w-24 text-center">% of Asset</div>
                        </>
                      ) : isCompareBudget ? (
                        <>
                          <div className="w-32 text-center">Actual</div>
                          <div className="w-32 text-center">Budget</div>
                          <div className="w-32 text-center">Variance</div>
                          <div className="w-24 text-center">Variance %</div>
                        </>
                      ) : isCompareMonth ? (
                        <>
                          <div className="w-32 text-center">Period 1</div>
                          <div className="w-32 text-center">Period 2</div>
                          <div className="w-32 text-center">Variance</div>
                          <div className="w-24 text-center">Variance %</div>
                        </>
                      ) : isBudgetPeriod ? (
                        <>
                          {multiPeriodHeaders.map((header, idx) => (
                            <div key={idx} className="flex-1 min-w-[70px] text-center px-1">Bud {header}</div>
                          ))}
                          {monthDiff > 1 && <div className="flex-1 min-w-[70px] text-center font-extrabold px-1">Total</div>}
                        </>
                      ) : isMultiPeriod ? (
                        <>
                          {multiPeriodHeaders.map((header, idx) => (
                            <div key={idx} className="flex-1 min-w-[70px] text-center px-1">{header}</div>
                          ))}
                          {monthDiff > 1 && <div className="flex-1 min-w-[70px] text-center font-extrabold px-1">Total</div>}
                        </>
                      ) : isFinancialHighlight ? (
                        <>
                          <div className="w-32 text-center px-1">{reportParams?.periodTo ? new Date(reportParams.periodTo).getFullYear() : new Date().getFullYear()}</div>
                          <div className="w-32 text-center px-1">{(reportParams?.periodTo ? new Date(reportParams.periodTo).getFullYear() : new Date().getFullYear()) - 1}</div>
                          <div className="w-32 text-center px-1">Increase(%)</div>
                        </>
                      ) : isRetainedEarning || isOwnerEquity ? (
                        <>
                          <div className="w-32 text-center px-1">Balance</div>
                          <div className="w-24 text-center px-1">Total Data</div>
                        </>
                      ) : (
                        <div className="w-40 text-center px-1">Balance</div>
                      )}
                    </div>

                    {/* Hierarchical Data Rendering */}
                    <div className="w-full flex flex-col font-sans">
                      {pageRows.map((flat, idx) => (
                        <ReportRowItemFlat
                          key={flat.node.id + '-' + idx}
                          flatNode={flat}
                          isExpanded={expandedNodes.has(flat.node.id)}
                          onToggle={() => toggleNode(flat.node.id)}
                          isMultiPeriod={isMultiPeriod}
                          isCompareMonth={isCompareMonth}
                          isBudgetPeriod={isBudgetPeriod}
                          isCompareBudget={isCompareBudget}
                          isCompareBudgetPeriod={isCompareBudgetPeriod}
                          isConsolidation={isConsolidation}
                          isCommonSized={isCommonSized}
                          isRetainedEarning={isRetainedEarning || isOwnerEquity}
                          isFinancialHighlight={isFinancialHighlight}
                          isCashFlowDetail={isCashFlowDetail}
                          isTrialBalanceClassic={isTrialBalanceClassic}
                          isTrialBalanceStandard={isTrialBalanceStandard}
                          totalAssets={totalAssets}
                          isLandscape={isLandscape}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Pagination Footer */}
              <div className="flex justify-between border-t border-black pt-2 pb-1 mt-auto text-[10px] text-slate-500 shrink-0 w-full">
                <span>Page {pageIndex + 1}/{pages.length}</span>
                <span>Printed by RNF Enterprise System Report</span>
              </div>

            </div>
          )))}

      </div>
    </div>
  );
};
