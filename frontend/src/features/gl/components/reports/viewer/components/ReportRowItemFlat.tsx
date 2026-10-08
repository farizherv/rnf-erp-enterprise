import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { FlatNode, ReportRowItemFlatProps } from '../types';
import { formatCurrency } from '../utils';



export const ReportRowItemFlat: React.FC<ReportRowItemFlatProps> = ({ flatNode, isExpanded, onToggle, isMultiPeriod, isCompareMonth, isBudgetPeriod, isCompareBudget, isCommonSized, isConsolidation, isCompareBudgetPeriod, isRetainedEarning, isFinancialHighlight, isCashFlowDetail, isTrialBalanceClassic, isTrialBalanceStandard, totalAssets, isLandscape }) => {
  const { node, level } = flatNode;
  const hasChildren = node.children && node.children.length > 0;

  let rowStyle = "group flex items-center border-b border-transparent hover:bg-blue-50/50 transition-colors cursor-default text-[12px] text-black";

  if (node.isHeader) {
    rowStyle += " font-bold";
  } else if (node.isTotal) {
    rowStyle += " font-bold";
  } else {
    rowStyle += " font-normal";
  }

  const paddingLeft = `${level * 16 + 8}px`;

  return (
    <div className={rowStyle}>
      <div
        className={`${isLandscape ? 'w-[220px] shrink-0' : 'flex-1 min-w-[200px]'} py-1 flex items-center gap-1`}
        style={{ paddingLeft }}
        onClick={() => hasChildren && onToggle()}
      >
        {hasChildren ? (
          <button className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 hover:text-slate-700 print:hidden">
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <div className="w-3.5" />
        )}
        {isCashFlowDetail ? (
          node.description ? (
            <>
              <span className="w-64 shrink-0 pr-2">{node.id}</span>
              <span className="flex-1 line-clamp-2">{node.description}</span>
            </>
          ) : (
            <span className="flex-1 line-clamp-2">{node.id}</span>
          )
        ) : (
          <span className="line-clamp-2">{node.description}</span>
        )}
      </div>

      {isCompareMonth && node.balances ? (
        <>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.balances[0] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[0])}
            </span>
          </div>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.balances[1] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[1])}
            </span>
          </div>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${(node.balances[1] - node.balances[0]) < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[1] - node.balances[0])}
            </span>
          </div>
          <div className={`w-24 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${(node.balances[1] - node.balances[0]) < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {node.balances[0] !== 0 ? ((node.balances[1] - node.balances[0]) / Math.abs(node.balances[0]) * 100).toFixed(2) + '%' : '0.00%'}
            </span>
          </div>
        </>
      ) : isCompareBudget && node.balances ? (
        <>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.balances[0] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[0])}
            </span>
          </div>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.balances[1] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[1])}
            </span>
          </div>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${(node.balances[0] - node.balances[1]) < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[0] - node.balances[1])}
            </span>
          </div>
          <div className={`w-24 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${(node.balances[0] - node.balances[1]) < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {node.balances[1] !== 0 ? ((node.balances[0] - node.balances[1]) / Math.abs(node.balances[1]) * 100).toFixed(2) + '%' : '0.00%'}
            </span>
          </div>
        </>
      ) : isCompareBudgetPeriod && node.balances ? (
        node.balances.map((b, i) => (
          <div key={i} className={`flex-1 min-w-[65px] py-1 px-1 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${b < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(b)}
            </span>
          </div>
        ))
      ) : isConsolidation && node.balances ? (
        <>
          <div className={`w-40 py-1 px-4 text-right flex flex-col justify-center`}><span className={`inline-block w-full ${node.balances[0] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>{formatCurrency(node.balances[0])}</span></div>
          <div className={`w-40 py-1 px-4 text-right flex flex-col justify-center`}><span className={`inline-block w-full ${node.balances[1] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>{formatCurrency(node.balances[1])}</span></div>
          <div className={`w-40 py-1 px-4 text-right flex flex-col justify-center font-bold`}><span className={`inline-block w-full ${node.balances[2] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>{formatCurrency(node.balances[2])}</span></div>
        </>
      ) : isCommonSized && node.balance !== undefined ? (
        <>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}><span className={`inline-block w-full ${node.balance < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>{formatCurrency(node.balance)}</span></div>
          <div className={`w-24 py-1 px-4 text-right flex flex-col justify-center font-bold text-blue-800`}><span className={`inline-block w-full ${node.balance < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>{totalAssets ? ((node.balance / totalAssets) * 100).toFixed(2) + '%' : '0.00%'}</span></div>
        </>
      ) : (isMultiPeriod || isBudgetPeriod) && node.balances ? (
        node.balances.map((b, i) => (
          <div key={i} className={`flex-1 min-w-[70px] py-1 px-1 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${b < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(b)}
            </span>
          </div>
        ))
      ) : isRetainedEarning ? (
        <>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            {node.balance !== undefined ? (
              <span className={`inline-block w-full ${node.balance < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
                {formatCurrency(node.balance)}
              </span>
            ) : null}
          </div>
          <div className={`w-24 py-1 px-4 text-center flex flex-col justify-center text-gray-700`}>
            {node.balance !== undefined || node.isHeader ? <span className={`inline-block w-full ${node.isTotal ? 'border-t border-transparent' : ''}`}>1</span> : null}
          </div>
        </>
      ) : isFinancialHighlight && node.balances ? (
        <>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.balances[0] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[0])}
            </span>
          </div>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.balances[1] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[1])}
            </span>
          </div>
          <div className={`w-32 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.balances[2] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {node.balances[2] === 0 ? '0' : formatCurrency(node.balances[2])}
            </span>
          </div>
        </>
      ) : isTrialBalanceClassic && node.balances ? (
        <>
          <div className={`flex-1 min-w-[130px] py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.balances[0] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(Math.abs(node.balances[0]))} {node.balances[0] < 0 ? '(Cr)' : (node.balances[0] > 0 ? '(Dr)' : '')}
            </span>
          </div>
          <div className={`flex-1 min-w-[130px] py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[1])}
            </span>
          </div>
          <div className={`flex-1 min-w-[130px] py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balances[2])}
            </span>
          </div>
          <div className={`flex-1 min-w-[130px] py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.balances[3] < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(Math.abs(node.balances[3]))} {node.balances[3] < 0 ? '(Cr)' : (node.balances[3] > 0 ? '(Dr)' : '')}
            </span>
          </div>
        </>
      ) : isTrialBalanceStandard && node.balances ? (
        <>
          <div className={`w-40 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.isTotal ? 'border-t border-black' : ''}`}>
              {node.balances[3] >= 0 ? (node.balances[3] === 0 ? '0' : formatCurrency(node.balances[3])) : ''}
            </span>
          </div>
          <div className={`w-40 py-1 px-4 text-right flex flex-col justify-center`}>
            <span className={`inline-block w-full ${node.isTotal ? 'border-t border-black' : ''}`}>
              {node.balances[3] < 0 ? formatCurrency(Math.abs(node.balances[3])) : ''}
            </span>
          </div>
        </>
      ) : !(isMultiPeriod || isCompareMonth || isBudgetPeriod || isCompareBudget || isCompareBudgetPeriod || isConsolidation || isCommonSized || isRetainedEarning || isFinancialHighlight || isTrialBalanceClassic || isTrialBalanceStandard) ? (
        <div className={`w-40 py-1 px-4 text-right flex flex-col justify-center`}>
          {node.balance !== undefined ? (
            <span className={`inline-block w-full ${node.balance < 0 ? 'text-[#e40505]' : ''} ${node.isTotal ? 'border-t border-black' : ''}`}>
              {formatCurrency(node.balance)}
            </span>
          ) : null}
        </div>
      ) : isTrialBalanceClassic ? (
        <>
          <div className="flex-1 min-w-[130px] py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="flex-1 min-w-[130px] py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="flex-1 min-w-[130px] py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="flex-1 min-w-[130px] py-1 px-4 border-l border-transparent print:border-transparent"></div>
        </>
      ) : isTrialBalanceStandard ? (
        <>
          <div className="w-40 py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="w-40 py-1 px-4 border-l border-transparent print:border-transparent"></div>
        </>
      ) : (isCompareMonth || isCompareBudget) ? (
        <>
          <div className="w-32 py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="w-32 py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="w-32 py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="w-24 py-1 px-4 border-l border-transparent print:border-transparent"></div>
        </>
      ) : isCommonSized ? (
        <>
          <div className="w-32 py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="w-24 py-1 px-4 border-l border-transparent print:border-transparent"></div>
        </>
      ) : (
        <>
          <div className="w-32 py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="w-32 py-1 px-4 border-l border-transparent print:border-transparent"></div>
          <div className="w-32 py-1 px-4 border-l border-transparent print:border-transparent"></div>
        </>
      )}
    </div>
  );
};
