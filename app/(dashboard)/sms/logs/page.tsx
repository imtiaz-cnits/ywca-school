'use client';

import FlatpickrCalendar from '@/components/FlatpickrCalendar';
import CustomSelect from '@/components/CustomSelect';
import { PageSizeOption, TablePagination, TableTopControls } from '@/components/TableControls';
import { format } from 'date-fns';
import {
  AlertCircle,
  BarChart2,
  Calendar,
  CheckCircle2,
  Coins,
  MessageSquare,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SmsLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);

  // Filters
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Summary Metrics
  const [summary, setSummary] = useState<{
    sentToday: number;
    sentMonth: number;
    totalDelivered: number;
    totalFailed: number;
    balance: string;
    takaFormatted?: string;
    provider: string;
  }>({
    sentToday: 0,
    sentMonth: 0,
    totalDelivered: 0,
    totalFailed: 0,
    balance: '...',
    takaFormatted: '...',
    provider: 'SMS',
  });
  const [syncingBalance, setSyncingBalance] = useState(false);

  const fetchLogs = useCallback(
    async (
      p = 1,
      sz: PageSizeOption = pageSize,
      q = search,
      dRange = dateRange,
      st = statusFilter,
      tp = typeFilter
    ) => {
      try {
        setLoading(true);
        const limitVal = sz === 'all' ? 1000 : sz;
        const params = new URLSearchParams();
        params.append('page', String(p));
        params.append('limit', String(limitVal));
        if (q) params.append('search', q);
        if (dRange) params.append('dateRange', dRange);
        if (st && st !== 'ALL') params.append('status', st);
        if (tp && tp !== 'ALL') params.append('type', tp);

        const res = await fetch(`/api/sms/logs?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs);
          setTotal(data.total);
          setTotalPages(data.totalPages);
          setPage(data.page);
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      } catch {
        toast.error('Failed to load SMS logs');
      } finally {
        setLoading(false);
      }
    },
    [pageSize, search, dateRange, statusFilter, typeFilter]
  );

  useEffect(() => {
    fetchLogs(1, pageSize, search, dateRange, statusFilter, typeFilter);
  }, [fetchLogs, pageSize]);

  // Sync Balance Action
  const handleSyncBalance = async () => {
    try {
      setSyncingBalance(true);
      const res = await fetch('/api/sms/balance');
      const data = await res.json();
      if (data.success) {
        setSummary((prev) => ({
          ...prev,
          balance: data.balance || prev.balance,
          provider: data.provider || prev.provider,
        }));
        toast.success(`Balance updated: ${data.balance} SMS (${data.provider || 'Live'})`);
      } else {
        toast.error('Failed to sync SMS balance');
      }
    } catch {
      toast.error('Network error checking balance');
    } finally {
      setSyncingBalance(false);
    }
  };

  const handleSearchClick = () => {
    setPage(1);
    fetchLogs(1, pageSize, search, dateRange, statusFilter, typeFilter);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDateRange('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setPage(1);
    fetchLogs(1, pageSize, '', '', 'ALL', 'ALL');
  };

  const currentLimit = pageSize === 'all' ? (total || 1) : Number(pageSize);

  const monthName = format(new Date(), 'MMMM yyyy');
  const todayDateFormatted = format(new Date(), 'dd MMM');

  return (
    <div className="space-y-6 print:space-y-0 print:m-0 print:p-0 print:w-full">
      {/* Top Header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            SMS Delivery Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor, filter, and review real-time text message delivery logs and balance metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          {/* Sync Balance Button */}
          <button
            type="button"
            onClick={handleSyncBalance}
            disabled={syncingBalance}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingBalance ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Sync Balance</span>
          </button>

          {/* Send SMS Button */}
          <Link
            href="/sms/send"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Send SMS</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards Grid */}
      <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: SENT TODAY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Sent Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono flex items-baseline gap-1">
              <span>{summary.sentToday}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">sms</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Delivered today ({todayDateFormatted})
            </p>
          </div>
        </div>

        {/* Card 2: THIS MONTH */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono flex items-baseline gap-1">
              <span>{summary.sentMonth}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">sms</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Delivered in {monthName}
            </p>
          </div>
        </div>

        {/* Card 3: TOTAL DELIVERED */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Delivered
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono flex items-baseline gap-1">
              <span>{summary.totalDelivered}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">sms</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              All-time successful <span className="text-amber-600 dark:text-amber-400 font-medium">({summary.totalFailed} other)</span>
            </p>
          </div>
        </div>

        {/* Card 4: SMS BALANCE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              SMS Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono flex items-baseline gap-1">
                <span>{summary.balance || '0'}</span>
                <span className="text-xs font-normal text-slate-400 font-sans">sms</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Available to send • Tk. {summary.takaFormatted || '1,076.3'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Card Container */}
      <div className="print:hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end text-xs">
          {/* 1. SEARCH SMS */}
          <div>
            <label className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
              Search SMS
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                placeholder="Student, ID, mobile, message..."
                className="w-full h-[42px] pl-8 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 2. DATE RANGE */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Date Range
            </label>
            <FlatpickrCalendar
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              mode="range"
              placeholder="All Dates"
              allowClear
            />
          </div>

          {/* 3. STATUS */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'SENT', label: 'Delivered / Sent' },
                { value: 'FAILED', label: 'Failed' },
                { value: 'PENDING', label: 'Pending / Attempted' },
              ]}
              placeholder="All Status"
            />
          </div>

          {/* 4. SMS TYPE */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              SMS Type
            </label>
            <CustomSelect
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              options={[
                { value: 'ALL', label: 'All Types' },
                { value: 'NOTICE', label: 'Notice' },
                { value: 'ATTENDANCE_ENTRY', label: 'Attendance Entry' },
                { value: 'ATTENDANCE_EXIT', label: 'Attendance Exit' },
                { value: 'ATTENDANCE_ABSENT', label: 'Attendance Absent' },
                { value: 'ATTENDANCE_LATE', label: 'Attendance Late' },
                { value: 'BULK', label: 'Bulk Campaign' },
                { value: 'SYSTEM', label: 'System Alert' },
              ]}
              placeholder="All Types"
            />
          </div>

          {/* 5. SEARCH & REFRESH BUTTONS */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSearchClick}
              disabled={loading}
              className="flex-1 h-[42px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>SEARCH</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Filters"
              className="w-[42px] h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none print:rounded-none print:p-0 print:m-0 print:bg-transparent">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <TableTopControls
            pageSize={pageSize}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
            searchTerm={search}
            onSearchChange={(s) => {
              setSearch(s);
              setPage(1);
            }}
            totalEntries={total}
            searchPlaceholder="Search phone, message, student..."
          />
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs print:text-[11px] print:w-full print:border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold print:table-header-group">
              {/* Repeating Print Header (Title, School info, Top-Left Page Count) */}
              <tr className="hidden print:table-row border-b-2 border-slate-800">
                <th colSpan={6} className="p-0 pb-3 text-left font-normal">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-300">
                    {/* Top-Left: Page Count (Only Number) */}
                    <div className="text-[11px] font-mono font-bold text-slate-800 print-page-counter">
                      <span className="print-page-num" />
                    </div>
                    {/* Center: Title & School */}
                    <div className="text-center">
                      <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                        SMS Delivery Report
                      </h2>
                      <p className="text-[10px] text-slate-600 font-normal">
                        YWCA Nursery School, Pabna • Management Portal
                      </p>
                    </div>
                    {/* Top-Right: Print Timestamp */}
                    <div className="text-[10px] font-mono text-slate-500 text-right">
                      {format(new Date(), 'dd-MM-yyyy hh:mm a')}
                    </div>
                  </div>
                </th>
              </tr>

              <tr className="print:bg-slate-100 print:text-slate-800 border-b print:border-slate-300">
                <th className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap">Date & Time</th>
                <th className="px-6 py-4 print:px-2 print:py-2">Recipient Info</th>
                <th className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap">Mobile Number</th>
                <th className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap">Type</th>
                <th className="px-6 py-4 print:px-2 print:py-2">Message Content</th>
                <th className="px-6 py-4 print:px-2 print:py-2 text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[14px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin inline mr-2 text-indigo-600" />
                    Loading SMS delivery logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-400">
                    No SMS logs found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                logs.map((item) => {
                  const sentDate = new Date(item.sentAt);
                  const formattedDate = format(sentDate, 'dd MMM, yyyy');
                  const formattedTime = format(sentDate, 'hh:mm:ss a');

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* 1. Date & Time */}
                      <td className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {formattedDate}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {formattedTime}
                        </div>
                      </td>

                      {/* 2. Recipient Info */}
                      <td className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {item.recipientStudentName || item.recipientName || 'Student Guardian'}
                        </div>
                        {item.recipientStudentCode && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {item.recipientStudentCode} {item.recipientClassName ? `| ${item.recipientClassName}` : ''}
                          </div>
                        )}
                      </td>

                      {/* 3. Mobile Number */}
                      <td className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap font-mono font-medium text-slate-700 dark:text-slate-300">
                        {item.recipientPhone}
                      </td>

                      {/* 4. Type Badge */}
                      <td className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                          {item.type}
                        </span>
                      </td>

                      {/* 5. Message Content */}
                      <td className="px-6 py-4 print:px-2 print:py-2 max-w-lg print:max-w-none">
                        <div className="bg-slate-50/80 dark:bg-slate-800/40 print:bg-transparent p-3 print:p-0 rounded-xl border border-slate-200/60 dark:border-slate-700/60 print:border-none text-xs print:text-[11px] font-bangla text-slate-700 dark:text-slate-300 print:text-slate-900 leading-relaxed break-words">
                          {item.message}
                        </div>
                      </td>

                      {/* 6. Status Pill Badge */}
                      <td className="px-6 py-4 print:px-2 print:py-2 text-center whitespace-nowrap">
                        {item.status === 'SENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 print:px-1.5 print:py-0.5 rounded-full text-[11px] print:text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 print:border-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            DELIVERED
                          </span>
                        ) : item.status === 'FAILED' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 print:px-1.5 print:py-0.5 rounded-full text-[11px] print:text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 print:border-rose-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            FAILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 print:px-1.5 print:py-0.5 rounded-full text-[11px] print:text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 print:border-purple-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 print:hidden" />
                            ATTEMPTED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 print:hidden">
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            totalEntries={total}
            startIndex={total === 0 ? 0 : (page - 1) * currentLimit + 1}
            endIndex={pageSize === 'all' ? total : Math.min(page * currentLimit, total)}
            onPageChange={(p) => {
              setPage(p);
              fetchLogs(p, pageSize, search, dateRange, statusFilter, typeFilter);
            }}
          />
        </div>
      </div>
    </div>
  );
}
