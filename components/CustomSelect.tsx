'use client';

import { Check, ChevronDown, Search, X } from 'lucide-react';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface CustomSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  searchable?: boolean; // If not specified, automatically true if options.length > 5
  searchPlaceholder?: string;
  id?: string;
  name?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  searchable,
  searchPlaceholder = 'Search...',
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const portalId = useId();

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-enable search filter if more than 5 options (per project rule)
  const isSearchable = searchable ?? options.length > 5;

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position on open
  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 260; // Estimated max height
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setCoords({
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 180),
      openUpward,
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setSearchQuery('');
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && isSearchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchable]);

  // Close on outside click or scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = (e: Event) => {
      // Don't close if scrolling inside the dropdown menu itself
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      updateCoords();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Selected Option
  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value)) || null;
  }, [options, value]);

  // Filtered Options
  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, isSearchable, searchQuery]);

  const handleSelect = (val: string | number) => {
    onChange(String(val));
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-[42px] px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-200 dark:border-slate-700'
        } rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${buttonClassName}`}
      >
        <span
          className={`truncate text-left ${
            !selectedOption || selectedOption.value === ''
              ? 'text-slate-400 dark:text-slate-500 font-normal'
              : 'text-slate-800 dark:text-slate-200 font-medium'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Portal Dropdown Menu */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={portalId}
            style={{
              position: 'fixed',
              top: `${coords.openUpward ? coords.top : coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              transform: coords.openUpward ? 'translateY(-100%)' : 'none',
              zIndex: 99999,
            }}
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
          >
            {/* Search Input Filter (Only if > 5 options) */}
            {isSearchable && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto p-1 divide-y-0 text-xs">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
