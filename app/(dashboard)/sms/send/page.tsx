'use client';

import CustomSelect from '@/components/CustomSelect';
import FlatpickrCalendar from '@/components/FlatpickrCalendar';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Edit3,
  Eye,
  FileText,
  Info,
  Loader2,
  MessageSquare,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

function formatDateTimeToCustomPicker(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hr = d.getHours();
  const ampm = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12;
  if (hr === 0) hr = 12;
  const hrStr = String(hr).padStart(2, '0');
  const minStr = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hrStr}:${minStr} ${ampm}`;
}

function formatScheduleOffset(minutesFromNow: number): string {
  const d = new Date(Date.now() + minutesFromNow * 60 * 1000);
  return formatDateTimeToCustomPicker(d);
}

function formatDefaultScheduleTime(): string {
  return formatScheduleOffset(10);
}

function parseScheduleToISO(val: string): string {
  if (!val) return new Date().toISOString();
  if (val.includes('T')) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const match = val.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM)?)?$/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    let hour = match[4] ? parseInt(match[4], 10) : 12;
    const minute = match[5] ? parseInt(match[5], 10) : 0;
    const ampm = match[6] ? match[6].toUpperCase() : null;

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    const d = new Date(year, month, day, hour, minute, 0);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const fallback = new Date(val);
  return isNaN(fallback.getTime()) ? new Date().toISOString() : fallback.toISOString();
}

export default function SendBulkSmsPage() {
  // Navigation Tabs: 'COMPOSE' | 'SCHEDULES'
  const [activeTab, setActiveTab] = useState<'COMPOSE' | 'SCHEDULES'>('COMPOSE');

  // Recipient Source
  const [recipientSource, setRecipientSource] = useState<'FILTERED_STUDENTS' | 'CUSTOM_NUMBERS' | 'BOTH'>(
    'FILTERED_STUDENTS'
  );

  // Recipient Filters
  const [sessionId, setSessionId] = useState('');
  const [recipientGroup, setRecipientGroup] = useState('ALL'); // 'ALL' | shiftId
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [gender, setGender] = useState('ALL');
  const [recipientSelection, setRecipientSelection] = useState('ALL'); // 'ALL' | 'GUARDIAN' | 'FATHER' | 'MOTHER'
  const [customNumbers, setCustomNumbers] = useState('');

  // Dropdown Metadata
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  // Recipient Live Calculations
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [recipientStats, setRecipientStats] = useState<{
    matchingStudents: number;
    validNumbersCount: number;
    missingNumbersCount: number;
    validPhones: string[];
    students: any[];
  }>({
    matchingStudents: 0,
    validNumbersCount: 0,
    missingNumbersCount: 0,
    validPhones: [],
    students: [],
  });

  // Message & Encoding
  const [message, setMessage] = useState('');
  const [manualEncoding, setManualEncoding] = useState<'AUTO' | 'GSM' | 'UNICODE'>('AUTO');

  // Delivery Options: 'NOW' | 'SCHEDULE'
  const [deliveryOption, setDeliveryOption] = useState<'NOW' | 'SCHEDULE'>('NOW');
  const [scheduledDateTime, setScheduledDateTime] = useState(() => formatDefaultScheduleTime());

  // Balance
  const [balanceInfo, setBalanceInfo] = useState<any>({
    smsCount: '...',
    takaFormatted: '...',
    balance: '...',
  });
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewSearch, setPreviewSearch] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Scheduled Broadcasts Tab State
  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleSummary, setScheduleSummary] = useState({
    all: 0,
    pending: 0,
    completed: 0,
    partial: 0,
    failed: 0,
    cancelled: 0,
  });
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('ALL');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState<any>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Reschedule Modal State
  const [rescheduleModalItem, setRescheduleModalItem] = useState<any>(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Fetch Balance (Requirement 2 & 3: 0.33 Taka calculation without company name)
  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const res = await fetch('/api/sms/balance');
      const data = await res.json();
      if (data.success) {
        setBalanceInfo(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingBalance(false);
    }
  };

  // Fetch Dropdown Metadata
  useEffect(() => {
    async function loadMeta() {
      try {
        const [sesRes, clsRes, secRes, shfRes] = await Promise.all([
          fetch('/api/academic/sessions'),
          fetch('/api/academic/classes'),
          fetch('/api/academic/sections'),
          fetch('/api/academic/shifts'),
        ]);

        const [ses, cls, sec, shf] = await Promise.all([
          sesRes.json(),
          clsRes.json(),
          secRes.json(),
          shfRes.json(),
        ]);

        if (ses.success) {
          setSessions(ses.sessions);
          const curr = ses.sessions.find((s: any) => s.isCurrent) || ses.sessions[0];
          if (curr) setSessionId(String(curr.id));
        }
        if (cls.success) setClasses(cls.classes);
        if (sec.success) setSections(sec.sections);
        if (shf.success) setShifts(shf.shifts);
      } catch {
        // ignore
      }
    }
    loadMeta();
    fetchBalance();

    // Default scheduled date time: 1 hour from now
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const defaultLocalTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setScheduledDateTime(defaultLocalTime);
  }, []);

  // Filter sections by selected class
  const filteredSections = useMemo(() => {
    if (!classId) return sections;
    return sections.filter((s) => s.classId === Number(classId));
  }, [classId, sections]);

  // Dynamic Recipient Counts & Data Fetching
  const fetchRecipients = useCallback(async () => {
    try {
      setLoadingRecipients(true);
      const res = await fetch('/api/sms/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientSource,
          sessionId,
          classId,
          sectionId,
          shiftId: recipientGroup !== 'ALL' ? recipientGroup : undefined,
          gender,
          recipientSelection,
          customNumbers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecipientStats({
          matchingStudents: data.matchingStudents,
          validNumbersCount: data.validNumbersCount,
          missingNumbersCount: data.missingNumbersCount,
          validPhones: data.validPhones,
          students: data.students || [],
        });
      }
    } catch {
      // ignore
    } finally {
      setLoadingRecipients(false);
    }
  }, [recipientSource, sessionId, classId, sectionId, recipientGroup, gender, recipientSelection, customNumbers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipients();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchRecipients]);

  // Fetch Schedules (for Scheduled Broadcasts tab)
  const fetchSchedules = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoadingSchedules(true);
      const params = new URLSearchParams();
      if (scheduleStatusFilter !== 'ALL') params.set('status', scheduleStatusFilter);
      if (scheduleSearch) params.set('search', scheduleSearch);

      const res = await fetch(`/api/sms/schedules?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules);
        if (data.summary) setScheduleSummary(data.summary);
      }
    } catch {
      // ignore
    } finally {
      if (!isSilent) setLoadingSchedules(false);
    }
  }, [scheduleStatusFilter, scheduleSearch]);

  useEffect(() => {
    if (activeTab !== 'SCHEDULES') return;
    fetchSchedules(false);
    const timer = setInterval(() => {
      fetchSchedules(true);
    }, 10000); // Auto-refresh schedules silently every 10 seconds to detect due broadcasts
    return () => clearInterval(timer);
  }, [activeTab, fetchSchedules]);

  // Open Reschedule Modal
  const handleOpenReschedule = (item: any) => {
    setRescheduleModalItem(item);
    const dt = new Date(item.scheduledAt);
    setRescheduleDateTime(formatDateTimeToCustomPicker(isNaN(dt.getTime()) ? new Date() : dt));
  };

  // Save Reschedule Handler
  const handleSaveReschedule = async () => {
    if (!rescheduleModalItem) return;
    try {
      setRescheduling(true);
      const newISO = parseScheduleToISO(rescheduleDateTime);
      const res = await fetch('/api/sms/schedules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rescheduleModalItem.id,
          action: 'RESCHEDULE',
          scheduledAt: newISO,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to update schedule');
        return;
      }
      toast.success(data.message || 'Schedule updated successfully');
      if (selectedScheduleDetail?.id === rescheduleModalItem.id) {
        setSelectedScheduleDetail((prev: any) => ({ ...prev, scheduledAt: newISO }));
      }
      setRescheduleModalItem(null);
      fetchSchedules(true);
    } catch (err: any) {
      toast.error(err.message || 'Error updating schedule');
    } finally {
      setRescheduling(false);
    }
  };

  // Trigger Send Immediately for Pending Schedule
  const handleTriggerScheduleSend = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await fetch('/api/sms/schedules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'SEND_NOW' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to dispatch broadcast');
        return;
      }
      toast.success(data.message || 'Broadcast dispatched immediately!');
      if (selectedScheduleDetail?.id === id) {
        setSelectedScheduleDetail((prev: any) => ({ ...prev, status: 'COMPLETED' }));
      }
      fetchSchedules();
      fetchBalance();
    } catch (err: any) {
      toast.error(err.message || 'Error executing broadcast');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel Pending Schedule Handler
  const handleCancelSchedule = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled broadcast? No SMS balance will be deducted.')) {
      return;
    }

    try {
      setActionLoadingId(id);
      const res = await fetch('/api/sms/schedules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'CANCEL' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to cancel schedule');
        return;
      }
      toast.success(data.message || 'Scheduled broadcast cancelled successfully. Zero SMS deducted.');
      if (selectedScheduleDetail?.id === id) {
        setSelectedScheduleDetail((prev: any) => ({ ...prev, status: 'CANCELLED' }));
      }
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message || 'Error cancelling schedule');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Encoding & Segment Calculations
  const hasBanglaOrSpecial = useMemo(() => {
    return /[\u0980-\u09FF\u0080-\uFFFF]/.test(message);
  }, [message]);

  const effectiveEncoding = useMemo(() => {
    if (manualEncoding === 'UNICODE') return 'UNICODE';
    if (manualEncoding === 'GSM') return 'GSM';
    return hasBanglaOrSpecial ? 'UNICODE' : 'GSM';
  }, [manualEncoding, hasBanglaOrSpecial]);

  const { charCount, smsSegments } = useMemo(() => {
    const len = message.length;
    if (len === 0) return { charCount: 0, smsSegments: 0 };

    if (effectiveEncoding === 'UNICODE') {
      // Unicode: 70 chars for 1st, 67 for concatenated
      const segs = len <= 70 ? 1 : Math.ceil(len / 67);
      return { charCount: len, smsSegments: segs };
    } else {
      // GSM: 160 chars for 1st, 153 for concatenated
      const segs = len <= 160 ? 1 : Math.ceil(len / 153);
      return { charCount: len, smsSegments: segs };
    }
  }, [message, effectiveEncoding]);

  // Reset Filters
  const handleResetFilters = () => {
    setClassId('');
    setSectionId('');
    setRecipientGroup('ALL');
    setGender('ALL');
    setRecipientSelection('ALL');
    setCustomNumbers('');
    toast.success('Filters reset to default');
  };

  // Submit Broadcast Handler (Immediate or Scheduled)
  const handleExecuteSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter notice message text');
      return;
    }

    if (recipientStats.validNumbersCount === 0) {
      toast.error('No valid recipient phone numbers found for the selected criteria');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryOption,
          scheduledAt: deliveryOption === 'SCHEDULE' ? parseScheduleToISO(scheduledDateTime) : undefined,
          recipients: recipientStats.validPhones,
          message: message.trim(),
          encoding: effectiveEncoding === 'UNICODE' ? 'Unicode' : 'GSM',
          segments: smsSegments,
          recipientType:
            recipientSource === 'FILTERED_STUDENTS'
              ? 'STUDENTS'
              : recipientSource === 'CUSTOM_NUMBERS'
                ? 'CUSTOM'
                : 'BOTH',
          title: `Notice Broadcast - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to dispatch broadcast');
        return;
      }

      toast.success(data.message || 'SMS broadcast dispatched successfully!');
      setConfirmModalOpen(false);
      setMessage('');
      fetchBalance();

      if (deliveryOption === 'SCHEDULE') {
        setActiveTab('SCHEDULES');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Preview Students
  const filteredPreviewStudents = useMemo(() => {
    if (!previewSearch) return recipientStats.students;
    const q = previewSearch.toLowerCase();
    return recipientStats.students.filter(
      (s) =>
        s.nameEn.toLowerCase().includes(q) ||
        (s.nameBn && s.nameBn.includes(q)) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.guardianPhone.includes(q)
    );
  }, [recipientStats.students, previewSearch]);

  return (
    <div className="space-y-6">
      {/* Top Header & Balance Controls (Image 1 & 4) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </span>
            <span>General Notice Broadcast</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <p className="text-xs text-slate-500">
              Filter students and send SMS to eligible guardian contacts.
            </p>
            {balanceInfo.mode === 'mock' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                MOCK MODE (Simulation • 0 Cost)
              </span>
            ) : balanceInfo.mode === 'test' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                TEST MODE (Redirecting to {balanceInfo.testNumber || '01326530330'})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                LIVE PRODUCTION MODE
              </span>
            )}
          </div>
        </div>

        {/* Top Right: Report Button (Req 1) + SMS Balance Box (Req 2 & 3) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Requirement 1: Report Button linking to SMS History & Logs */}
          <Link
            href="/sms/logs"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>SMS History & Logs</span>
          </Link>

          {/* Requirement 2 & 3: SMS Balance Box (Without company name, calculated with 0.33 rate) */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">
                SMS Balance
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                  {loadingBalance ? '...' : balanceInfo.smsCount || '3,261'}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">SMS</span>
                <span className="text-[10px] text-slate-400 font-mono ml-1">
                  (Tk. {balanceInfo.takaFormatted || '1,076.3'})
                </span>
              </div>
            </div>
            <button
              onClick={fetchBalance}
              title="Refresh Balance"
              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors ml-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Tabs (Image 4 & 5) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('COMPOSE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'COMPOSE'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
            }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>COMPOSE NOTICE</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SCHEDULES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'SCHEDULES'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
            }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>SCHEDULED BROADCASTS</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMPOSE NOTICE (Exact options from Image 4) */}
      {/* ========================================================================= */}
      {activeTab === 'COMPOSE' && (
        <div className="space-y-6">
          {/* Section 1: RECIPIENT SOURCE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              RECIPIENT SOURCE *
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRecipientSource('FILTERED_STUDENTS')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${recipientSource === 'FILTERED_STUDENTS'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>FILTERED STUDENTS</span>
              </button>

              <button
                type="button"
                onClick={() => setRecipientSource('CUSTOM_NUMBERS')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${recipientSource === 'CUSTOM_NUMBERS'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>CUSTOM MOBILE NUMBERS</span>
              </button>

              <button
                type="button"
                onClick={() => setRecipientSource('BOTH')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${recipientSource === 'BOTH'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>BOTH (STUDENTS & CUSTOM NUMBERS)</span>
              </button>
            </div>
          </div>

          {/* Section 2: RECIPIENT FILTERS (AND LOGIC APPLIED) */}
          {(recipientSource === 'FILTERED_STUDENTS' || recipientSource === 'BOTH') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-600" />
                  RECIPIENT FILTERS (AND LOGIC APPLIED)
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET FILTERS</span>
                </button>
              </div>

              {/* 6 Custom Dropdowns in 3-column Grid (Image 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Academic Session */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Academic Session *
                  </label>
                  <CustomSelect
                    value={sessionId}
                    onChange={(val) => setSessionId(val)}
                    placeholder="Select Session"
                    options={sessions.map((s) => ({
                      value: String(s.id),
                      label: `${s.name}${s.isCurrent ? ' (Current)' : ''}`,
                    }))}
                  />
                </div>

                {/* 2. Recipient Group (Shift) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Recipient Group
                  </label>
                  <CustomSelect
                    value={recipientGroup}
                    onChange={(val) => setRecipientGroup(val)}
                    placeholder="All active students"
                    options={[
                      { value: 'ALL', label: 'All active students' },
                      ...shifts.map((sh) => ({ value: String(sh.id), label: `${sh.name} Shift` })),
                    ]}
                  />
                </div>

                {/* 3. Class */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Class
                  </label>
                  <CustomSelect
                    value={classId}
                    onChange={(val) => {
                      setClassId(val);
                      setSectionId('');
                    }}
                    placeholder="All classes"
                    options={[
                      { value: '', label: 'All classes' },
                      ...classes.map((c) => ({ value: String(c.id), label: c.name })),
                    ]}
                  />
                </div>

                {/* 4. Section */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Section
                  </label>
                  <CustomSelect
                    value={sectionId}
                    onChange={(val) => setSectionId(val)}
                    placeholder="All sections"
                    options={[
                      { value: '', label: 'All sections' },
                      ...filteredSections.map((sec) => ({ value: String(sec.id), label: sec.name })),
                    ]}
                  />
                </div>

                {/* 5. Gender */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Gender
                  </label>
                  <CustomSelect
                    value={gender}
                    onChange={(val) => setGender(val)}
                    placeholder="All genders"
                    options={[
                      { value: 'ALL', label: 'All genders' },
                      { value: 'FEMALE', label: 'Female Only' },
                      { value: 'MALE', label: 'Male Only' },
                    ]}
                  />
                </div>

                {/* 6. Recipient Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Recipient Selection
                  </label>
                  <CustomSelect
                    value={recipientSelection}
                    onChange={(val) => setRecipientSelection(val)}
                    placeholder="All matching students"
                    options={[
                      { value: 'ALL', label: 'All matching students' },
                      { value: 'GUARDIAN', label: 'Primary Guardian Contact' },
                      { value: 'FATHER', label: 'Father Only' },
                      { value: 'MOTHER', label: 'Mother Only' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Custom Mobile Numbers Input (When CUSTOM_NUMBERS or BOTH is chosen) */}
          {(recipientSource === 'CUSTOM_NUMBERS' || recipientSource === 'BOTH') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                CUSTOM MOBILE NUMBERS *
              </label>
              <textarea
                rows={3}
                value={customNumbers}
                onChange={(e) => setCustomNumbers(e.target.value)}
                placeholder="Enter Bangladeshi phone numbers (e.g. 01712345678, 01812345678, separated by commas or line breaks)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Supports 11-digit local format (01XXXXXXXXX) or international 13-digit format (8801XXXXXXXXX).
              </p>
            </div>
          )}

          {/* Section 3: RECIPIENT SUMMARY (Image 4: 4 Stat Cards) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                RECIPIENT SUMMARY
              </span>
              <p className="text-[11px] text-slate-500">
                Counts update automatically when filters, custom numbers, or message content change.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: MATCHING STUDENTS */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    MATCHING STUDENTS
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {loadingRecipients ? '...' : recipientStats.matchingStudents}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Active enrolled students</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              {/* Card 2: VALID NUMBERS */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      VALID NUMBERS
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      100% REACH
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                    {loadingRecipients ? '...' : recipientStats.validNumbersCount}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {recipientStats.validNumbersCount} unique numbers (via BD)
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
              </div>

              {/* Card 3: MISSING / INVALID */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    MISSING / INVALID
                  </span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
                    {loadingRecipients ? '...' : recipientStats.missingNumbersCount}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Skipped safely before dispatch</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>

              {/* Card 4: SMS ESTIMATE */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    SMS ESTIMATE
                  </span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">
                    {smsSegments * recipientStats.validNumbersCount} segments
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    {recipientStats.validNumbersCount} contacts × {smsSegments} seg
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: MESSAGE CONTENT & ENCODING (Image 4) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                MESSAGE CONTENT *
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Quick Template:</span>
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      'সম্মানিত অভিভাবক, আগামী কাল বিশেষ কারণে স্কুলের পাঠদান স্থগিত থাকবে। - ওয়াইডব্লিউসিএ নার্সারি স্কুল'
                    )
                  }
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  ছুটির নোটিশ
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      'সম্মানিত অভিভাবক, আপনার সন্তানের চলতি মাসের বকেয়া বেতন পরিশোধ করার জন্য বিনীত অনুরোধ করা হচ্ছে। - YWCA School'
                    )
                  }
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  বেতন/ফি নোটিশ
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your notice here..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans leading-relaxed"
            />

            {/* Encoding Mode Selector & Character Counter (Image 4) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase">ENCODING MODE:</span>
                <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setManualEncoding('GSM')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${effectiveEncoding === 'GSM'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                  >
                    GSM (STANDARD ENGLISH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualEncoding('UNICODE')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${effectiveEncoding === 'UNICODE'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                  >
                    UNICODE (BANGLA/SPECIAL)
                  </button>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Characters: <span className="text-indigo-600 dark:text-indigo-400">{charCount}</span> • SMS Segments:{' '}
                <span className="text-indigo-600 dark:text-indigo-400">{smsSegments}</span>
              </div>
            </div>

            {/* Encoding explanation helper */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {effectiveEncoding === 'GSM'
                ? 'GSM Encoding: 160 characters for 1st SMS, and 153 characters per segment for multipart concatenated SMS.'
                : 'Unicode Encoding: 70 characters for 1st SMS, and 67 characters per segment for multipart concatenated SMS.'}
            </p>
          </div>

          {/* Section 5: SMS DELIVERY OPTIONS (Image 4) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              SMS DELIVERY OPTIONS *
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: SEND NOW */}
              <div
                onClick={() => setDeliveryOption('NOW')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${deliveryOption === 'NOW'
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
              >
                <input
                  type="radio"
                  name="deliveryOption"
                  checked={deliveryOption === 'NOW'}
                  onChange={() => setDeliveryOption('NOW')}
                  className="mt-1 w-4 h-4 text-blue-600 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">SEND</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      IMMEDIATE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Dispatch broadcast immediately upon confirmation</p>
                </div>
              </div>

              {/* Option 2: SCHEDULE FOR LATER */}
              <div
                onClick={() => {
                  setDeliveryOption('SCHEDULE');
                  if (!scheduledDateTime) setScheduledDateTime(formatDefaultScheduleTime());
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${deliveryOption === 'SCHEDULE'
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
              >
                <input
                  type="radio"
                  name="deliveryOption"
                  checked={deliveryOption === 'SCHEDULE'}
                  onChange={() => {
                    setDeliveryOption('SCHEDULE');
                    if (!scheduledDateTime) setScheduledDateTime(formatDefaultScheduleTime());
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 cursor-pointer"
                />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">SCHEDULE FOR LATER</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      AUTOMATED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Specify target date & time in Bangladesh Standard Time (Asia/Dhaka)
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Date-time picker for scheduled option */}
            {deliveryOption === 'SCHEDULE' && (
              <div className="pt-2 max-w-sm">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Select Target Date & Time (Dhaka Time)</span>
                </label>
                <FlatpickrCalendar
                  value={scheduledDateTime}
                  onChange={(val) => setScheduledDateTime(val)}
                  placeholder="Select Date & Time (DD-MM-YYYY hh:mm AM/PM)"
                  showTime={true}
                  allowClear={false}
                />
              </div>
            )}
          </div>

          {/* Section 6: Bottom Action Buttons (Image 4) */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>PREVIEW RECIPIENTS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!message.trim()) {
                  toast.error('Please enter notice message text');
                  return;
                }
                if (recipientStats.validNumbersCount === 0) {
                  toast.error('No valid recipient phone numbers found for the selected criteria');
                  return;
                }
                setConfirmModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>REVIEW & SEND</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCHEDULED BROADCASTS (Exact table & filters from Image 5) */}
      {/* ========================================================================= */}
      {activeTab === 'SCHEDULES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Top Controls: Status Pills & Search (Image 5) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: 'ALL', count: scheduleSummary.all },
                { id: 'PENDING', label: 'PENDING', count: scheduleSummary.pending },
                { id: 'COMPLETED', label: 'COMPLETED', count: scheduleSummary.completed },
                { id: 'PARTIAL', label: 'PARTIAL', count: scheduleSummary.partial },
                { id: 'FAILED', label: 'FAILED', count: scheduleSummary.failed },
                { id: 'CANCELLED', label: 'CANCELLED', count: scheduleSummary.cancelled },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setScheduleStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${scheduleStatusFilter === pill.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${scheduleStatusFilter === pill.id
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Right: Search and Refresh */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <div className="relative w-56 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  placeholder="Search schedules..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => fetchSchedules(false)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSchedules ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table Container (Image 5) */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">SCHEDULE DETAILS</th>
                  <th className="py-3 px-4">RECIPIENTS</th>
                  <th className="py-3 px-4 min-w-[280px]">MESSAGE PREVIEW</th>
                  <th className="py-3 px-4">SCHEDULED AT (DHAKA)</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {loadingSchedules ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-600" />
                      Loading scheduled broadcasts...
                    </td>
                  </tr>
                ) : schedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No scheduled broadcasts found.
                    </td>
                  </tr>
                ) : (
                  schedules.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Schedule Details */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{row.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{row.id}</span>
                      </td>

                      {/* Recipients */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {row.recipientCount} recipients
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block mt-0.5">
                          {row.recipientType}
                        </span>
                      </td>

                      {/* Message Preview (Full text visible) */}
                      <td className="py-3.5 px-4 min-w-[280px] max-w-lg">
                        <p className="font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed text-xs">
                          {row.message}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">
                          {row.segments} seg ({row.encoding})
                        </span>
                      </td>

                      {/* Scheduled At */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {new Date(row.scheduledAt).toLocaleString('en-US', {
                            timeZone: 'Asia/Dhaka',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Asia/Dhaka</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${row.status === 'COMPLETED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : row.status === 'PENDING'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : row.status === 'CANCELLED'
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${row.status === 'COMPLETED'
                                ? 'bg-emerald-500'
                                : row.status === 'PENDING'
                                  ? 'bg-amber-500 animate-pulse'
                                  : row.status === 'CANCELLED'
                                    ? 'bg-rose-500'
                                    : 'bg-slate-400'
                              }`}
                          />
                          <span>{row.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedScheduleDetail(row)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {row.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReschedule(row)}
                                disabled={actionLoadingId === row.id}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                title="Change Date & Time"
                              >
                                <Clock className="w-3 h-3" />
                                <span>Reschedule</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleTriggerScheduleSend(row.id)}
                                disabled={actionLoadingId === row.id}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                title="Send Immediately Now"
                              >
                                {actionLoadingId === row.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                <span>Send Now</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelSchedule(row.id)}
                                disabled={actionLoadingId === row.id}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                title="Cancel Scheduled Broadcast"
                              >
                                {actionLoadingId === row.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Ban className="w-3 h-3" />
                                )}
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PREVIEW RECIPIENTS MODAL */}
      {/* ========================================================================= */}
      {previewModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Recipient Preview List ({recipientStats.validNumbersCount} Valid Contacts)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review matching student guardians and custom contacts before dispatching.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    placeholder="Search by student name, roll, class, or phone..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-y-auto flex-1 p-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">STUDENT</th>
                      <th className="py-2.5 px-3">CLASS & SECTION</th>
                      <th className="py-2.5 px-3">GUARDIAN</th>
                      <th className="py-2.5 px-3">PHONE NUMBER</th>
                      <th className="py-2.5 px-3 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredPreviewStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No matching students found in preview.
                        </td>
                      </tr>
                    ) : (
                      filteredPreviewStudents.map((st, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">{st.nameEn}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Roll: {st.roll || '-'} • ID: {st.studentCode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold block">{st.className}</span>
                            <span className="text-[10px] text-slate-400 block">Sec: {st.sectionName}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium">{st.guardianName}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {st.guardianPhone}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {st.isValid ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                                Valid
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200">
                                Missing
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Showing {filteredPreviewStudents.length} of {recipientStats.students.length} students
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================================================= */}
      {/* MODAL 2: REVIEW & CONFIRM SEND MODAL */}
      {/* ========================================================================= */}
      {confirmModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Confirm Broadcast Dispatch</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Recipients</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {recipientStats.validNumbersCount} Contacts
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Segments</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {smsSegments * recipientStats.validNumbersCount} Segments
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Timing</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {deliveryOption === 'NOW' ? 'Send Immediately' : 'Scheduled Broadcast'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Encoding</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {effectiveEncoding} ({smsSegments} seg/contact)
                  </span>
                </div>
              </div>

              {/* Message preview box */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Message Text:</span>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {message}
                </div>
              </div>

              {/* Mode Notice Banner */}
              {balanceInfo.mode === 'test' ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Safe Test Mode Active</span>
                    <span>To protect students & balance, this entire broadcast is intercepted and will only dispatch 1 test SMS to <strong className="font-mono">{balanceInfo.testNumber || '01326530330'}</strong>.</span>
                  </div>
                </div>
              ) : balanceInfo.mode === 'mock' ? (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Mock Mode Simulation</span>
                    <span>Zero balance will be deducted. All actions will be safely simulated in database logs for full testing.</span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Please double-check the recipient count and content. This broadcast will be dispatched to real recipient contacts.
                </p>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSend}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Send Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW SCHEDULED BROADCAST DETAILS */}
      {/* ========================================================================= */}
      {selectedScheduleDetail &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedScheduleDetail.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {selectedScheduleDetail.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedScheduleDetail(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <span
                    className={`font-bold ${selectedScheduleDetail.status === 'COMPLETED'
                        ? 'text-emerald-600'
                        : selectedScheduleDetail.status === 'PENDING'
                          ? 'text-amber-600'
                          : selectedScheduleDetail.status === 'CANCELLED'
                            ? 'text-rose-600'
                            : 'text-slate-600'
                      }`}
                  >
                    {selectedScheduleDetail.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Recipients</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {selectedScheduleDetail.recipientCount} contacts
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled At (Dhaka)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(selectedScheduleDetail.scheduledAt).toLocaleString('en-US', {
                      timeZone: 'Asia/Dhaka',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Encoding</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedScheduleDetail.encoding} ({selectedScheduleDetail.segments} seg)
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Message Content:</span>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {selectedScheduleDetail.message}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedScheduleDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                {selectedScheduleDetail.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCancelSchedule(selectedScheduleDetail.id)}
                      disabled={actionLoadingId === selectedScheduleDetail.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {actionLoadingId === selectedScheduleDetail.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Ban className="w-3.5 h-3.5" />
                      )}
                      <span>Cancel Broadcast</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleOpenReschedule(selectedScheduleDetail);
                        setSelectedScheduleDetail(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:text-amber-400 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-xs font-bold cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Change Date & Time</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerScheduleSend(selectedScheduleDetail.id)}
                      disabled={actionLoadingId === selectedScheduleDetail.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50"
                    >
                      {actionLoadingId === selectedScheduleDetail.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Send Broadcast Now</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================================================= */}
      {/* MODAL 4: RESCHEDULE BROADCAST DATE & TIME */}
      {/* ========================================================================= */}
      {rescheduleModalItem &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Reschedule Broadcast
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {rescheduleModalItem.id}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRescheduleModalItem(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message Brief */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">{rescheduleModalItem.title}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{rescheduleModalItem.recipientCount} Contacts</span>
                </div>
                <p className="text-slate-500 line-clamp-2 text-[11px] font-sans">
                  {rescheduleModalItem.message}
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: '+1 Min', offset: 1 },
                    { label: '+2 Mins', offset: 2 },
                    { label: '+5 Mins', offset: 5 },
                    { label: '+10 Mins', offset: 10 },
                    { label: '+30 Mins', offset: 30 },
                    { label: '+1 Hour', offset: 60 },
                  ].map((preset) => (
                    <button
                      key={preset.offset}
                      type="button"
                      onClick={() => setRescheduleDateTime(formatScheduleOffset(preset.offset))}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Date & Time Calendar Field */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Select Target Date & Time (Dhaka Time)</span>
                </label>
                <FlatpickrCalendar
                  value={rescheduleDateTime}
                  onChange={(val) => setRescheduleDateTime(val)}
                  placeholder="Select Date & Time (DD-MM-YYYY hh:mm AM/PM)"
                  showTime={true}
                  allowClear={false}
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleModalItem(null)}
                  disabled={rescheduling}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReschedule}
                  disabled={rescheduling}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {rescheduling ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Update Schedule</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
