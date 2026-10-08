import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';

export interface ComboBoxOption {
  value: string;
  label: string;
}

interface ComboBoxSelectProps {
  options: ComboBoxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ComboBoxSelect: React.FC<ComboBoxSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find the selected option to display its label when not searching
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions =
    query === ''
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase())
        );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isOutsideWrapper = wrapperRef.current && !wrapperRef.current.contains(event.target as Node);
      const isOutsideDropdown = !(event.target as HTMLElement).closest('.combo-dropdown-menu');
      
      if (isOutsideWrapper && isOutsideDropdown) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 240; // max-h-60

      if (spaceBelow < dropdownHeight && rect.top > spaceBelow) {
        // Drop-up
        setDropdownStyle({
          position: 'fixed',
          bottom: window.innerHeight - rect.top + 4,
          left: rect.left,
          width: rect.width,
        });
      } else {
        // Drop-down
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }
  }, [isOpen, query]);

  // Close on scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = (e: Event) => {
      // Don't close if scrolling inside the dropdown itself
      if ((e.target as HTMLElement).closest('.combo-dropdown-menu')) return;
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div
        className={`flex items-center w-full bg-white border ${
          isOpen ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'
        } rounded overflow-hidden transition-colors ${
          disabled ? 'bg-slate-50 cursor-not-allowed opacity-70' : 'cursor-text hover:border-slate-300'
        }`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          className="w-full px-2 py-1.5 text-sm text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400"
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={isOpen ? query : selectedOption ? selectedOption.label : ''}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
        />
        <div className="px-2 text-slate-400 flex items-center justify-center shrink-0 gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setQuery('');
                if (isOpen) setIsOpen(false);
              }}
              className="hover:bg-slate-200 hover:text-slate-600 p-0.5 rounded-full transition-colors"
              title="Hapus pilihan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && createPortal(
        <div 
          className="combo-dropdown-menu z-[9999] bg-white border border-slate-200 rounded-md shadow-xl max-h-60 overflow-y-auto"
          style={dropdownStyle}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 italic text-center">
              Tidak ada data ditemukan
            </div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt.value);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                    opt.value === value ? 'bg-blue-50/50 text-blue-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
