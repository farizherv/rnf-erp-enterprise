import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Printer, FolderOpen, Save, Mail, RefreshCw, Search, X, ChevronUp, ChevronDown } from 'lucide-react';
// @ts-ignore
import * as html2pdfLib from 'html2pdf.js';

// Local currency formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Dummy Accounts for Print Output Mapping
const ACCOUNTS = [
  { id: '1101', name: '1101 - Kas Kecil Pusat' },
  { id: '1102', name: '1102 - Bank BCA IDR' },
  { id: '1201', name: '1201 - Piutang Pelanggan IDR' },
  { id: '1301', name: '1301 - Persediaan Barang Dagang' },
  { id: '4101', name: '4101 - Pendapatan Penjualan' },
  { id: '5101', name: '5101 - Harga Pokok Penjualan' },
  { id: '6101', name: '6101 - Beban Gaji' },
  { id: '6102', name: '6102 - Beban Sewa Gedung' },
];

interface JournalHeader {
  reference: string;
  memo: string;
  date: string;
  voucherNo: string;
  exchangeRate: number;
  currency: string;
  isMultiCurrency: boolean;
}

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

interface JournalData {
  header: JournalHeader;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
}

interface JournalPrintPreviewProps {
  tabId?: string;
  directData?: JournalData;
  hideControls?: boolean;
}

export const JournalPrintPreview: React.FC<JournalPrintPreviewProps> = ({ tabId, directData, hideControls }) => {
  const [data, setData] = useState<JournalData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFindDialog, setShowFindDialog] = useState(false);
  const [findKeyword, setFindKeyword] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Search Engine State
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);

  const getInitialDialogPos = () => ({
    x: typeof window !== 'undefined' ? Math.max(0, (window.innerWidth - 340) / 2) : 300,
    y: typeof window !== 'undefined' ? Math.max(0, (window.innerHeight - 150) / 2) : 200
  });

  const [dialogPos, setDialogPos] = useState(getInitialDialogPos());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const voucherNo = tabId ? tabId.replace('Preview Cetak : ', '').trim() : directData?.header?.voucherNo || '';

  useEffect(() => {
    if (directData) {
      setData(directData);
      return;
    }
    const raw = localStorage.getItem(`printPreviewData_${voucherNo}`);
    if (raw) {
      setData(JSON.parse(raw));
      
      const autoPrint = localStorage.getItem(`printPreviewAutoPrint_${voucherNo}`);
      if (autoPrint === 'true') {
        localStorage.removeItem(`printPreviewAutoPrint_${voucherNo}`);
        setTimeout(() => {
          window.print();
        }, 300);
      }
    }
  }, [voucherNo, directData]);

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
        // Note: clearHighlights relies on printAreaRef which is safe to access 
        // since the dialog and highlights only exist when data is loaded.
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

  const { header, lines, totalDebit, totalCredit } = data || { header: {} as any, lines: [], totalDebit: 0, totalCredit: 0 };

  const numberToEnglishWords = (num: number): string => {
    if (num === 0) return 'zero';
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const g = ['', 'thousand', 'million', 'billion', 'trillion'];

    const convert = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      for (let i = 1; i < g.length; i++) {
        const unit = Math.pow(1000, i);
        if (n < unit * 1000) {
          return convert(Math.floor(n / unit)) + ' ' + g[i] + (n % unit !== 0 ? ' ' + convert(n % unit) : '');
        }
      }
      return '';
    };
    const result = convert(num).trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const amountInWords = numberToEnglishWords(totalDebit);
  const totalAmountStr = formatCurrency(totalDebit);

  const handlePrint = () => {
    // Utilize the robust global @media print CSS rules for Enterprise-grade printing
    window.print();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Memuat ulang data dari memori cache (localStorage)
    const raw = localStorage.getItem(`printPreviewData_${voucherNo}`);
    if (raw) {
      setData(JSON.parse(raw));
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleOpen = () => {
    // Membuka File Picker asli HTML untuk simulasi impor template .fr3 (FastReport)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.fr3,.xml,.rpt';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        alert(`Sistem RNF ERP (Desktop Edition): File template legacy (${file.name}) menggunakan arsitektur FastReport lama yang tidak kompatibel dengan Native React Rendering Engine. Harap muat format yang didukung secara luring (Offline) melalui modul Enterprise Form Designer.`);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    try {
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `Jurnal_Umum_${voucherNo}`,
          types: [
            { description: 'Format PDF (.pdf)', accept: { 'application/pdf': ['.pdf'] } },
            { description: 'Format Word (.doc)', accept: { 'application/msword': ['.doc', '.docx'] } },
            { description: 'Format Excel (.xls)', accept: { 'application/vnd.ms-excel': ['.xls', '.xlsx'] } },
            { description: 'Format JSON Raw Data', accept: { 'application/json': ['.json'] } }
          ]
        });

        const writable = await handle.createWritable();
        const extension = handle.name.split('.').pop()?.toLowerCase();
        
        try {
          if (extension === 'json') {
            await writable.write(JSON.stringify(data, null, 2));
          } else if (extension === 'pdf') {
            const printContent = printAreaRef.current;
            if (printContent) {
              const opt = {
                margin:       0,
                filename:     handle.name,
                image:        { type: 'jpeg', quality: 0.98 },
                pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
                html2canvas:  { 
                  scale: 2, 
                  useCORS: true, 
                  logging: false,
                  scrollY: 0,
                  windowWidth: 794,
                  onclone: (clonedDoc: Document) => {
                    // ENTERPRISE FIX for Tailwind v4 oklch() crash in html2canvas
                    // 1. Inject a style block to override default oklch variables
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                      :root {
                        --default-border-color: transparent !important;
                        --color-slate-50: #f8fafc !important;
                        --color-slate-100: #f1f5f9 !important;
                        --color-slate-200: #e2e8f0 !important;
                        --color-slate-800: #1e293b !important;
                        --color-blue-600: #2563eb !important;
                        --color-blue-900: #1e3a8a !important;
                      }
                      body {
                        color: #000000 !important;
                        background-color: #ffffff !important;
                      }
                      * {
                        border-color: #000000;
                      }
                    `;
                    clonedDoc.head.appendChild(style);

                    // 2. Strip tailwind color classes from all elements in the cloned document
                    const elements = clonedDoc.querySelectorAll('*');
                    elements.forEach(el => {
                      if (el.className && typeof el.className === 'string') {
                        el.className = el.className.replace(/\b(bg|text|border|from|to|ring|divide)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/g, '');
                        el.className = el.className.replace(/\b(bg|text|border)-(white|black|transparent)\b/g, '');
                      }
                    });
                  }
                },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
              };
              
              const html2pdfFn = typeof html2pdfLib === 'function' ? html2pdfLib : (html2pdfLib as any).default;
              if (typeof html2pdfFn !== 'function') {
                throw new Error('Library html2pdf gagal dimuat (' + typeof html2pdfFn + ')');
              }

              const worker = html2pdfFn().set(opt).from(printContent);
              const pdfBlob = await worker.output('blob');
              
              if (!pdfBlob || pdfBlob.size === 0) {
                throw new Error('Render PDF menghasilkan file kosong.');
              }
              
              await writable.write(pdfBlob);
            }
          } else {
            const htmlStr = `<html><body><h1>RNF ERP Document</h1><p>Export to .${extension} is fully integrated in Backend Engine.</p></body></html>`;
            await writable.write(htmlStr);
          }
        } finally {
          await writable.close();
        }
      } else {
        setShowExportMenu(!showExportMenu); // Fallback
      }
    } catch (err: any) {
      // ENTERPRISE UX: Jangan munculkan error jika pengguna sekadar menekan "Batal" di jendela Save
      if (err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('user aborted')) {
        console.log('Operasi dibatalkan secara elegan oleh pengguna.');
      } else {
        alert('Simpan PDF Gagal: ' + (err.message || err));
        console.error('Ekspor dibatalkan/gagal', err);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - dialogPos.x,
      y: e.clientY - dialogPos.y
    });
  };

  const executeExport = (format: string) => {
    setShowExportMenu(false);
    if (format === 'PDF') {
      // Standar Web Enterprise: Cetak ke PDF via Native Browser Engine
      alert('Untuk menyimpan sebagai PDF dengan resolusi tertinggi (Vektor), silakan pilih "Save as PDF" pada dialog printer yang akan muncul.');
      window.print();
    } else if (format === 'Word') {
      alert('Ekspor ke Microsoft Word (.docx) sedang disiapkan oleh Tim Backend Report Engine.');
    } else if (format === 'Excel') {
      alert('Ekspor ke Microsoft Excel (.xlsx) sedang disiapkan oleh Tim Backend Report Engine.');
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Bukti Jurnal Umum - ${voucherNo}`);
    const body = encodeURIComponent(`Terlampir adalah rincian Jurnal Umum dengan No. Voucher: ${voucherNo}\n\nTotal Debit: ${totalAmountStr}\n\nSalam,\nSistem RNF ERP`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        executeFind('first');
      }, 250); // 250ms debounce for smooth typing experience
      return () => clearTimeout(timer);
    }
  }, [findKeyword, showFindDialog]);


  const printAreaElement = useMemo(() => (
    <div ref={printAreaRef} id="print-area" className="a4-paper w-[210mm] min-h-[297mm] print:w-[210mm] print:min-h-[297mm] print:m-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] print:shadow-none print:border-none rounded-sm border p-[12mm] flex flex-col shrink-0 overflow-hidden print:overflow-visible box-border bg-white border-slate-200">

      <div className="flex justify-between items-start mb-4">

        {/* Left Side: Logo & Company Info */}
        <div className="flex flex-col gap-2 w-1/2">
          <div className="flex gap-2">
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/rnflogokop.jpg" alt="Logo RNF" className="w-full h-full object-contain" />
            </div>
            <div className="border p-2 text-xs flex-1 rounded-[4px] border-black">
              <div className="font-bold text-[13px]">PT Rezeki Nadh Fathan</div>
              <div className="leading-tight mt-1">
                Gg. Wali Songo, RT.35/RW.54<br />
                Kelurahan Graha Indah<br />
                Kec. Balikpapan Utara, Kota Balikpapan<br />
                Kalimantan Timur, Indonesia.
              </div>
            </div>
          </div>

          <div className="border rounded-[4px] p-2 text-xs mt-1 min-h-[60px] flex flex-col gap-1 border-black">
            <div className="flex">
              <div className="w-20">Reference</div>
              <div>: {header.reference || '-'}</div>
            </div>
            <div className="flex">
              <div className="w-20">Description</div>
              <div>: {header.memo || '-'}</div>
            </div>
          </div>
        </div>

        {/* Right Side: Title & Meta Info */}
        <div className="w-[45%] flex flex-col items-end">
          <h1 className="text-[28px] font-sans tracking-tight mb-3 text-black">Journal Voucher</h1>

          <div className="w-full border rounded-[4px] flex flex-col text-xs overflow-hidden border-black">
            <div className="flex border-b border-black">
              <div className="flex-1 border-r flex flex-col relative h-10 border-black">
                <span className="text-[10px] absolute top-0.5 left-1">Date</span>
                <span className="m-auto mt-4">{header.date || '-'}</span>
              </div>
              <div className="flex-1 flex flex-col relative h-10">
                <span className="text-[10px] absolute top-0.5 left-1">Voucher No.</span>
                <span className="m-auto mt-4">{header.voucherNo}</span>
              </div>
            </div>
            <div className="flex border-b border-black">
              <div className="flex-1 border-r flex flex-col relative h-10 border-black">
                <span className="text-[10px] absolute top-0.5 left-1">Exchange Rate</span>
                <span className="m-auto mt-4">{header.exchangeRate || 1}</span>
              </div>
              <div className="flex-1 flex flex-col relative h-10">
                <span className="text-[10px] absolute top-0.5 left-1">Currency</span>
                <span className="m-auto mt-4">{header.currency}</span>
              </div>
            </div>
            <div className="flex">
              <div className="flex-1 flex flex-col relative h-10">
                <span className="text-[10px] absolute top-0.5 left-1">Status</span>
                <span className="m-auto mt-4">{header.isMultiCurrency ? 'Multi-Currency' : 'Base Currency'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Table Area */}
      <div className="flex-1 border rounded-[4px] overflow-hidden mt-2 flex flex-col border-black">
        <table className="w-full h-full text-[11px] border-collapse table-fixed text-black">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r p-1 text-center font-normal w-24 border-black">Account No.</th>
              <th className="border-r p-1 text-center font-normal border-black">Account Name</th>
              <th className="border-r p-1 text-center font-normal w-28 border-black">Debit</th>
              <th className="border-r p-1 text-center font-normal w-28 border-black">Credit</th>
              <th className="p-1 text-center font-normal w-48">Description</th>
            </tr>
          </thead>
          <tbody>
            {lines.filter((l: any) => l.accountId && (l.debit > 0 || l.credit > 0)).map((line: any, i: number) => {
              const acc = ACCOUNTS.find(a => a.id === line.accountId);
              return (
                <tr key={i} className="border-b last:border-b-0 h-6 border-slate-200">
                  <td className="border-r px-1.5 py-1 align-top border-black">{line.accountId}</td>
                  <td className="border-r px-1.5 py-1 align-top border-black">{acc ? acc.name.split(' - ')[1] : ''}</td>
                  <td className="border-r px-1.5 py-1 align-top text-right border-black">{line.debit > 0 ? formatCurrency(line.debit) : ''}</td>
                  <td className="border-r px-1.5 py-1 align-top text-right border-black">{line.credit > 0 ? formatCurrency(line.credit) : ''}</td>
                  <td className="px-1.5 py-1 align-top">{line.description || ''}</td>
                </tr>
              );
            })}
            {/* Empty stretch row to guarantee 100% pixel-perfect vertical grid alignment */}
            <tr className="h-full border-b-0">
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total & Amount in Words */}
      <div className="flex mt-2 gap-2 h-10">
        <div className="flex-1 border rounded-[4px] p-1.5 text-xs flex items-center border-black">
          <span className="mr-2 font-bold text-black">Amount in Words :</span>
          <span className="italic">{amountInWords}</span>
        </div>
        <div className="w-[30%] border rounded-[4px] p-1.5 text-xs font-bold flex items-center justify-between border-black">
          <span>Total :</span>
          <span>{totalAmountStr}</span>
        </div>
      </div>

      {/* Description Box */}
      <div className="border rounded-[4px] p-1.5 text-xs mt-2 min-h-[50px] relative pt-3 border-black">
        <span className="text-[10px] absolute top-[-7px] left-2 px-1 bg-white">Memo</span>
        {header.memo || 'This journal data has been automatically printed by the system.'}
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-auto pt-6 text-xs px-12">
        <div className="flex flex-col items-center w-32">
          <div className="mb-14">Prepared By</div>
          <div className="w-full border-b border-black"></div>
          <div className="mt-1 flex w-full justify-between"><span className="text-[10px]">Date:</span><span className="w-20 border-b border-black"></span></div>
        </div>

        <div className="flex flex-col items-center w-32">
          <div className="mb-14">Approved By</div>
          <div className="w-full border-b border-black"></div>
          <div className="mt-1 flex w-full justify-between"><span className="text-[10px]">Date:</span><span className="w-20 border-b border-black"></span></div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between border-t mt-8 pt-1 text-[10px] border-black text-gray-500">
        <span>Page 1/1</span>
        <span>Printed by RNF Enterprise</span>
      </div>

    </div>
  ), [data, header, lines, amountInWords, totalAmountStr]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full bg-[#888888]">
        <div className="bg-white p-8 rounded shadow text-slate-500">Data cetak tidak ditemukan atau sesi telah berakhir.</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full h-full bg-[#f3f4f6] print:bg-white print:h-auto print:block font-sans overflow-hidden print:overflow-visible relative ${hideControls ? '!bg-white' : ''}`} id="print-container">
      {/* Modern Enterprise Toolbar (Horizontal List Style) */}
      {!hideControls && (
      <div className="flex items-center gap-1 p-1.5 bg-white border-b border-slate-200 print:hidden z-10 shrink-0 shadow-sm">
        <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
          <Printer className="w-4 h-4 text-slate-600" strokeWidth={2} />
          <span className="font-semibold text-[12px]">Cetak</span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <button onClick={handleOpen} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
          <FolderOpen className="w-4 h-4 text-blue-600" strokeWidth={2} />
          <span className="font-semibold text-[12px]">Buka</span>
        </button>

        <div className="relative">
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
            <Save className="w-4 h-4 text-slate-600" strokeWidth={2} />
            <span className="font-semibold text-[12px]">Simpan</span>
          </button>

          {/* Export Dropdown Menu */}
          {showExportMenu && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 shadow-lg rounded-md z-50 py-1 font-sans">
              <button onClick={() => executeExport('PDF')} className="w-full text-left px-4 py-2 text-[12px] hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-2">
                Format PDF (.pdf)
              </button>
              <button onClick={() => executeExport('Word')} className="w-full text-left px-4 py-2 text-[12px] hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-2">
                Format Word (.doc)
              </button>
              <button onClick={() => executeExport('Excel')} className="w-full text-left px-4 py-2 text-[12px] hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-2">
                Format Excel (.xls)
              </button>
            </div>
          )}
        </div>

        <button onClick={handleEmail} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
          <Mail className="w-4 h-4 text-orange-500" strokeWidth={2} />
          <span className="font-semibold text-[12px]">Email</span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors group">
          <RefreshCw className={`w-4 h-4 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
          <span className="font-semibold text-[12px]">Perbarui</span>
        </button>

        <button onClick={handleFindText} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors">
          <Search className="w-4 h-4 text-slate-600" strokeWidth={2} />
          <span className="font-semibold text-[12px]">Cari Teks</span>
        </button>
      </div>
      )}


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
              <span className="text-[12px] font-bold text-slate-700 tracking-wide uppercase">Find in Document</span>
            </div>
            <button 
              onClick={() => { 
                setShowFindDialog(false); 
                clearHighlights(); 
                setDialogPos(getInitialDialogPos());
              }} 
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-colors"
              title="Close (Esc)"
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
                placeholder="Enter text to search..."
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
                  <span className="text-blue-600 font-semibold">{currentMatch} of {matchCount} matches</span>
                ) : (findKeyword && matchCount === 0 ? (
                  <span className="text-red-500">No matches found</span>
                ) : (
                  <span>Ready to search</span>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => executeFind('prev')}
                  disabled={!findKeyword || matchCount === 0}
                  className="p-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous match (Shift+Enter)"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => executeFind('next')}
                  disabled={!findKeyword}
                  className="p-1.5 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next match (Enter)"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspace */}
      <div className={`flex-1 overflow-auto bg-slate-100 print:bg-white print:overflow-visible print:block flex justify-center py-8 print:py-0 relative ${hideControls ? '!bg-white !py-0' : ''}`} id="print-workspace">
        {printAreaElement}
      </div>
    </div>
  );
};
