'use client';

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';
import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface FlatpickrCalendarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mode?: 'single' | 'range';
  className?: string;
  disabled?: boolean;
  dateFormat?: string;
  allowClear?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Parse date string (supports both DD-MM-YYYY and YYYY-MM-DD)
function parseAnyDate(str?: string): Date | null {
  if (!str) return null;
  const s = str.trim();
  // 1. Try DD-MM-YYYY or DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    const d = parseInt(dmy[1], 10);
    const m = parseInt(dmy[2], 10) - 1;
    const y = parseInt(dmy[3], 10);
    const dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  // 2. Try YYYY-MM-DD or YYYY/MM/DD
  const ymd = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10) - 1;
    const d = parseInt(ymd[3], 10);
    const dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

// Strict standard format: DD-MM-YYYY (e.g. 24-10-2026)
function formatDMY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

// Convert any input value to display formatted DD-MM-YYYY (or range DD-MM-YYYY to DD-MM-YYYY)
function toDisplayFormat(val?: string): string {
  if (!val) return '';
  if (val.includes(' to ')) {
    const parts = val.split(' to ');
    const s = parseAnyDate(parts[0]);
    const e = parseAnyDate(parts[1]);
    if (s && e) return `${formatDMY(s)} to ${formatDMY(e)}`;
    if (s) return formatDMY(s);
    return val;
  }
  const dt = parseAnyDate(val);
  return dt ? formatDMY(dt) : val;
}

export default function FlatpickrCalendar({
  value,
  onChange,
  placeholder = 'DD-MM-YYYY',
  mode = 'single',
  className = '',
  disabled = false,
  allowClear = false,
}: FlatpickrCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const portalId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  // Parse initial selected dates from string
  const initialSingle = mode === 'single' ? parseAnyDate(value) : null;
  let initialRangeStart: Date | null = null;
  let initialRangeEnd: Date | null = null;

  if (mode === 'range' && value) {
    if (value.includes(' to ')) {
      const parts = value.split(' to ');
      initialRangeStart = parseAnyDate(parts[0]);
      initialRangeEnd = parseAnyDate(parts[1]);
    } else {
      initialRangeStart = parseAnyDate(value);
    }
  }

  // Active view cursor
  const baseDate = initialSingle || initialRangeStart || new Date();
  const [currentYear, setCurrentYear] = useState(baseDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(baseDate.getMonth());
  const [yearBase, setYearBase] = useState(baseDate.getFullYear());

  // Range in-progress state
  const [rangeStart, setRangeStart] = useState<Date | null>(initialRangeStart);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(initialRangeEnd);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Position coordinates for portal
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal view when value changes externally
  useEffect(() => {
    if (mode === 'single') {
      const parsed = parseAnyDate(value);
      if (parsed) {
        setCurrentYear(parsed.getFullYear());
        setCurrentMonth(parsed.getMonth());
        setYearBase(parsed.getFullYear());
      }
    } else if (mode === 'range') {
      if (value.includes(' to ')) {
        const parts = value.split(' to ');
        const s = parseAnyDate(parts[0]);
        const e = parseAnyDate(parts[1]);
        setRangeStart(s);
        setRangeEnd(e);
        if (s) {
          setCurrentYear(s.getFullYear());
          setCurrentMonth(s.getMonth());
          setYearBase(s.getFullYear());
        }
      } else {
        const s = parseAnyDate(value);
        setRangeStart(s);
        setRangeEnd(null);
        if (s) {
          setCurrentYear(s.getFullYear());
          setCurrentMonth(s.getMonth());
          setYearBase(s.getFullYear());
        }
      }
    }
  }, [value, mode]);

  // Update popup coordinates
  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const calendarWidth = 320;
    const padding = 12;

    let left = rect.left;
    // Prevent right overflow by aligning with the right edge of input or viewport
    if (left + calendarWidth > window.innerWidth - padding) {
      left = Math.max(padding, rect.right - calendarWidth);
    }

    let top = rect.bottom + 6;
    // If not enough vertical space below, flip above
    if (top + 370 > window.innerHeight && rect.top > 380) {
      top = Math.max(padding, rect.top - 370);
    }

    setCoords({ top, left });
  };

  const handleOpen = () => {
    if (disabled) return;
    updatePosition();
    setViewMode('days');
    setYearBase(currentYear);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setViewMode('days');
    setHoverDate(null);
  };

  // Close on outside click or window resize/scroll
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        calendarRef.current?.contains(target)
      ) {
        return;
      }
      handleClose();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }

    function handleScrollOrResize() {
      updatePosition();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Navigate Header (< and >)
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'days') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
        setYearBase((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else if (viewMode === 'months') {
      setCurrentYear((y) => y - 1);
      setYearBase((y) => y - 1);
    } else if (viewMode === 'years') {
      setYearBase((y) => y - 10);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'days') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
        setYearBase((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    } else if (viewMode === 'months') {
      setCurrentYear((y) => y + 1);
      setYearBase((y) => y + 1);
    } else if (viewMode === 'years') {
      setYearBase((y) => y + 10);
    }
  };

  // Day click handler -> Outputs DD-MM-YYYY
  const handleDayClick = (dayDate: Date) => {
    if (mode === 'single') {
      const formatted = formatDMY(dayDate);
      onChange(formatted);
      handleClose();
    } else if (mode === 'range') {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start a new range
        setRangeStart(dayDate);
        setRangeEnd(null);
        onChange(formatDMY(dayDate));
      } else {
        // Finish range
        let start = rangeStart;
        let end = dayDate;
        if (end < start) {
          const temp = start;
          start = end;
          end = temp;
        }
        setRangeStart(start);
        setRangeEnd(end);
        onChange(`${formatDMY(start)} to ${formatDMY(end)}`);
        handleClose();
      }
    }
  };

  // Month select handler (when clicking a month in the month-view)
  const handleSelectMonth = (monthIdx: number) => {
    setCurrentMonth(monthIdx);
    setViewMode('days');
  };

  // Year select handler (when clicking a year in the year-view)
  const handleSelectYear = (selectedYear: number) => {
    setCurrentYear(selectedYear);
    setYearBase(selectedYear);
    setViewMode('days');
  };

  // Set today
  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setYearBase(today.getFullYear());
    if (mode === 'single') {
      onChange(formatDMY(today));
      handleClose();
    } else {
      setRangeStart(today);
      setRangeEnd(today);
      onChange(`${formatDMY(today)} to ${formatDMY(today)}`);
      handleClose();
    }
  };

  // Clear value
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRangeStart(null);
    setRangeEnd(null);
    onChange('');
    handleClose();
  };

  // Calculate 42 days grid for currentMonth
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
    calendarDays.push({ date: d, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i);
    calendarDays.push({ date: d, isCurrentMonth: true });
  }

  // Next month leading days (fill up to 42 cells)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(currentYear, currentMonth + 1, i);
    calendarDays.push({ date: d, isCurrentMonth: false });
  }

  const todayDMY = formatDMY(new Date());
  const selectedDMY = mode === 'single' ? toDisplayFormat(value) : '';

  // Generate Year Range (prev 5 - next 5 years: total 12 years in 3x4 grid)
  const yearRangeStart = yearBase - 5;
  const yearList: number[] = [];
  for (let y = yearRangeStart; y <= yearRangeStart + 11; y++) {
    yearList.push(y);
  }

  const displayVal = toDisplayFormat(value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field - Matches other form input styles & height perfectly */}
      <div
        onClick={handleOpen}
        className={`w-full h-[42px] px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-200 dark:border-slate-700'
        } rounded-xl text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center justify-between gap-2 cursor-pointer shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className={`truncate ${!displayVal ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-mono text-[13px]'}`}>
            {displayVal || placeholder}
          </span>
        </div>

        {allowClear && value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Portal-rendered Calendar Popup */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={calendarRef}
            id={portalId}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="w-[320px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Header: Month / Year Buttons / Navigation */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {/* Month Button - Clicking toggles Month-Picker Grid */}
                <button
                  type="button"
                  onClick={() => setViewMode((v) => (v === 'months' ? 'days' : 'months'))}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'months'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Click to view and choose months"
                >
                  <span>{MONTH_NAMES[currentMonth]}</span>
                </button>

                {/* Year Button - Clicking toggles Year-Picker Grid (prev 5 - next 5 years) */}
                <button
                  type="button"
                  onClick={() => {
                    setYearBase(currentYear);
                    setViewMode((v) => (v === 'years' ? 'days' : 'years'));
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'years'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Click to view and choose years"
                >
                  <span>{viewMode === 'years' ? `${yearRangeStart} - ${yearRangeStart + 11}` : currentYear}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* VIEW 1: YEAR SELECTION GRID (Shown when Year is clicked) */}
            {viewMode === 'years' ? (
              <div className="py-2">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">
                  Select Year ({yearRangeStart} - {yearRangeStart + 11})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {yearList.map((y) => {
                    const isSelected = y === currentYear;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => handleSelectYear(y)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600'
                        }`}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : viewMode === 'months' ? (
              /* VIEW 2: MONTH SELECTION GRID (Shown when Month is clicked) */
              <div className="py-2">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">
                  Select Month ({currentYear})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {MONTH_SHORT.map((mName, idx) => {
                    const isSelected = idx === currentMonth;
                    return (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => handleSelectMonth(idx)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600'
                        }`}
                      >
                        {MONTH_NAMES[idx]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* VIEW 3: DAYS MATRIX GRID (Standard view) */
              <div>
                {/* Weekday Names Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {DAY_NAMES.map((day) => (
                    <div
                      key={day}
                      className="h-7 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid - 7 Columns x 6 Rows */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(({ date, isCurrentMonth }, i) => {
                    const dDMY = formatDMY(date);
                    const isToday = dDMY === todayDMY;

                    // Selection checks
                    let isSelected = false;
                    let isInRange = false;
                    let isRangeStart = false;
                    let isRangeEnd = false;

                    if (mode === 'single') {
                      isSelected = dDMY === selectedDMY;
                    } else if (mode === 'range') {
                      const curTime = date.getTime();
                      const sTime = rangeStart ? rangeStart.getTime() : null;
                      const eTime = rangeEnd ? rangeEnd.getTime() : null;
                      const hTime = hoverDate ? hoverDate.getTime() : null;

                      isRangeStart = Boolean(sTime && dDMY === formatDMY(rangeStart!));
                      isRangeEnd = Boolean(eTime && dDMY === formatDMY(rangeEnd!));

                      if (sTime && eTime) {
                        const min = Math.min(sTime, eTime);
                        const max = Math.max(sTime, eTime);
                        isInRange = curTime >= min && curTime <= max;
                        isSelected = isRangeStart || isRangeEnd;
                      } else if (sTime && hTime && !eTime) {
                        const min = Math.min(sTime, hTime);
                        const max = Math.max(sTime, hTime);
                        isInRange = curTime >= min && curTime <= max;
                        isSelected = isRangeStart || dDMY === formatDMY(hoverDate!);
                      } else if (sTime) {
                        isSelected = isRangeStart;
                      }
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleDayClick(date)}
                        onMouseEnter={() => {
                          if (mode === 'range' && rangeStart && !rangeEnd) {
                            setHoverDate(date);
                          }
                        }}
                        className={`h-9 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold z-10'
                            : isInRange
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-none'
                            : !isCurrentMonth
                            ? 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600'
                        } ${isToday && !isSelected ? 'ring-1 ring-indigo-500 font-bold text-indigo-600 dark:text-indigo-400' : ''}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={handleSetToday}
                className="flex items-center gap-1 px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Today</span>
              </button>

              <div className="flex items-center gap-1">
                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2.5 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
