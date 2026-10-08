import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface KanbanCardProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  iconColorClass?: string;
  colorClass?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  metrics?: { label: string; value: string | number; valueClass?: string }[];
  footerText?: string;
  status?: string;
  progress?: number;
  progressColor?: string;
  dropdownItems?: { label: string; onClick: () => void }[];
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColorClass = 'text-blue-500',
  colorClass,
  primaryActionLabel,
  onPrimaryAction,
  metrics,
  footerText,
  status,
  progress,
  progressColor = 'bg-blue-500',
  dropdownItems
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-visible flex flex-col group h-full">
      {/* Header */}
      <div className="p-5 flex justify-between items-start border-b border-slate-100 bg-slate-50/50 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
            <Icon className={`w-5 h-5 ${iconColorClass}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg leading-tight">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        
        {/* Dropdown Menu (3-dots) */}
        {dropdownItems && dropdownItems.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-md transition-colors ${isDropdownOpen ? 'bg-slate-200 text-slate-700' : ''}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50">
                {dropdownItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.onClick();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body: Metrics */}
      <div className="p-5 flex-grow">
        {metrics && metrics.length > 0 ? (
          <div className="space-y-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="flex justify-between items-end border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-slate-500">{metric.label}</span>
                <span className={`text-lg font-bold ${metric.valueClass || 'text-slate-800'}`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-400 italic">
            Belum ada aktivitas
          </div>
        )}

        {/* Progress Bar & Status (Optional) */}
        {progress !== undefined && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Kapasitas / Progres</span>
              {status && <span className="font-bold text-slate-700">{status} ({progress}%)</span>}
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 mt-auto flex items-center justify-between">
        {primaryActionLabel && onPrimaryAction ? (
          <button 
            onClick={onPrimaryAction}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> {primaryActionLabel}
          </button>
        ) : (
          <div /> // Spacer
        )}
        
        {footerText && (
          <span className="text-xs font-medium text-slate-400">{footerText}</span>
        )}
      </div>
    </div>
  );
};
