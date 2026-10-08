import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Clock, Star } from 'lucide-react';

interface FilterOption {
  category: string;
  options: string[];
}

export interface OmniSearchBarProps {
  placeholder?: string;
  availableFilters?: FilterOption[];
  onSearch?: (tokens: string[]) => void;
}

export const OmniSearchBar: React.FC<OmniSearchBarProps> = ({ 
  placeholder = "Pencarian...",
  availableFilters = [
    { category: 'Filter', options: ['Belum Divalidasi', 'Bulan Ini', 'Tahun Ini', 'Diarsipkan'] },
    { category: 'Group By', options: ['Berdasarkan Tanggal', 'Berdasarkan Status', 'Berdasarkan Akun'] },
    { category: 'Favorit', options: ['Pencarian Tersimpan Saya'] }
  ],
  onSearch
}) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTokens, setActiveTokens] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      const newTokens = [...activeTokens, inputValue.trim()];
      setActiveTokens(newTokens);
      setInputValue('');
      setIsDropdownOpen(false);
      if (onSearch) onSearch(newTokens);
    } else if (e.key === 'Backspace' && inputValue === '' && activeTokens.length > 0) {
      // Remove last token when pressing backspace on empty input
      const newTokens = activeTokens.slice(0, -1);
      setActiveTokens(newTokens);
      if (onSearch) onSearch(newTokens);
    }
  };

  const removeToken = (indexToRemove: number) => {
    const newTokens = activeTokens.filter((_, idx) => idx !== indexToRemove);
    setActiveTokens(newTokens);
    if (onSearch) onSearch(newTokens);
  };

  const addFilterToken = (filterStr: string) => {
    if (!activeTokens.includes(filterStr)) {
      const newTokens = [...activeTokens, filterStr];
      setActiveTokens(newTokens);
      if (onSearch) onSearch(newTokens);
    }
    setInputValue('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative flex-1 max-w-2xl" ref={containerRef}>
      {/* Search Input Container */}
      <div 
        className={`flex items-center min-h-[40px] px-3 bg-white border ${isDropdownOpen ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-300 hover:border-slate-400'} rounded-lg transition-all cursor-text overflow-hidden shadow-sm`}
        onClick={() => {
          document.getElementById('omni-input')?.focus();
          setIsDropdownOpen(true);
        }}
      >
        <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
        
        {/* Active Filter Tokens (Badges) */}
        <div className="flex flex-nowrap gap-1.5 items-center flex-1 py-1.5 overflow-x-auto no-scrollbar scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {activeTokens.map((token, idx) => (
            <span 
              key={idx} 
              className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium px-2 py-1 rounded-md animate-in zoom-in-95 duration-100"
            >
              {token}
              <button 
                onClick={(e) => { e.stopPropagation(); removeToken(idx); }}
                className="hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          <input 
            id="omni-input"
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeTokens.length === 0 ? placeholder : ''}
            className="flex-1 bg-transparent min-w-[120px] outline-none text-sm text-slate-800 placeholder:text-slate-400 shrink-0"
            autoComplete="off"
          />
        </div>

        {/* Dropdown Toggle Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
          className="p-1.5 hover:bg-slate-100 rounded-md transition-colors ml-1 text-slate-400 hover:text-slate-600"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Advanced Filter Dropdown (Odoo Style) */}
      {isDropdownOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden flex">
          
          {/* Quick Search Suggestions based on typing */}
          {inputValue.trim() !== '' && (
            <div className="w-full p-2">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Cari Untuk...</div>
              <button 
                onClick={() => addFilterToken(inputValue)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors flex items-center justify-between group"
              >
                <span>Mengandung: <span className="font-semibold text-blue-600">"{inputValue}"</span></span>
                <span className="text-xs text-slate-400 group-hover:text-blue-500">Tekan Enter ↵</span>
              </button>
            </div>
          )}

          {/* Expanded Filter Categories (Odoo Standard) */}
          {inputValue.trim() === '' && (
            <div className="w-full flex">
              {availableFilters.map((col, idx) => (
                <div key={idx} className="flex-1 border-r border-slate-100 last:border-0 p-2">
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    {col.category === 'Filter' && <Filter className="w-3.5 h-3.5" />}
                    {col.category === 'Group By' && <ChevronDown className="w-3.5 h-3.5" />}
                    {col.category === 'Favorit' && <Star className="w-3.5 h-3.5" />}
                    {col.category}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {col.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => addFilterToken(opt)}
                        className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
