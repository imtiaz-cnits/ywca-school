'use client';

import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export type PageSizeOption = 10 | 20 | 50 | 100 | 'all';

interface TableTopControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  pageSize: PageSizeOption;
  onPageSizeChange: (size: PageSizeOption) => void;
  totalEntries?: number;
  searchPlaceholder?: string;
  className?: string;
}

export function TableTopControls({
  searchTerm,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  totalEntries,
  searchPlaceholder = 'Search in table...',
  className = '',
}: TableTopControlsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageSizeOptions: PageSizeOption[] = [10, 20, 50, 100, 'all'];

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 ${className}`}
    >
      {/* Searchbar Filter (Left side) */}
      <div className="relative w-full sm:w-64 md:w-72">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Custom Designed Entries Dropdown (Right side) */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto">
        <span className="font-medium">Show</span>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
          >
            <span>{pageSize === 'all' ? 'All' : pageSize}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Entries per page
              </div>
              {pageSizeOptions.map((opt) => {
                const isSelected = pageSize === opt;
                return (
                  <button
                    key={String(opt)}
                    type="button"
                    onClick={() => {
                      onPageSizeChange(opt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                    }`}
                  >
                    <span>{opt === 'all' ? 'All' : opt}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <span className="font-medium">entries</span>
        {typeof totalEntries === 'number' && (
          <span className="text-[11px] text-slate-400 font-normal ml-0.5">
            ({totalEntries} total)
          </span>
        )}
      </div>
    </div>
  );
}

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalEntries,
  startIndex,
  endIndex,
  onPageChange,
  className = '',
}: TablePaginationProps) {
  // Generate smart pagination page numbers
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);
    if (currentPage > 3) {
      pages.push('...');
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div
      className={`px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 select-none ${className}`}
    >
      <div>
        {totalEntries === 0 ? (
          <span>No records found</span>
        ) : (
          <span>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{startIndex}</span> to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{endIndex}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalEntries}</span> entries
          </span>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1 self-center sm:self-auto">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300 font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page numbers */}
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400">
                  ...
                </span>
              );
            }
            const pageNum = p as number;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300 font-medium"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Client-side hook for tables that have search, entry size, and pagination.
 */
export function useTableControls<T>({
  data,
  filterFn,
  initialPageSize = 10,
}: {
  data: T[];
  filterFn?: (item: T, query: string) => boolean;
  initialPageSize?: PageSizeOption;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<PageSizeOption>(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || !filterFn) return data;
    const q = searchTerm.trim().toLowerCase();
    return data.filter((item) => filterFn(item, q));
  }, [data, searchTerm, filterFn]);

  // Reset to page 1 whenever search or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const totalEntries = filteredData.length;
  const totalPages =
    pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalEntries / (pageSize as number)));

  // Ensure current page does not exceed totalPages
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  // Paginated slice
  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return filteredData;
    const start = (validPage - 1) * (pageSize as number);
    return filteredData.slice(start, start + (pageSize as number));
  }, [filteredData, validPage, pageSize]);

  const startIndex =
    totalEntries === 0
      ? 0
      : pageSize === 'all'
        ? 1
        : (validPage - 1) * (pageSize as number) + 1;

  const endIndex =
    pageSize === 'all'
      ? totalEntries
      : Math.min(validPage * (pageSize as number), totalEntries);

  return {
    searchTerm,
    setSearchTerm,
    pageSize,
    setPageSize,
    currentPage: validPage,
    setCurrentPage,
    paginatedData,
    filteredData,
    totalEntries,
    totalPages,
    startIndex,
    endIndex,
  };
}
