'use client';

import { format } from 'date-fns';
import {
    ArrowUpRight,
    ClipboardCheck,
    Clock,
    Fingerprint,
    GraduationCap,
    MessageSquare,
    PlusCircle,
    RefreshCw,
    School,
    Send,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentPunches, setRecentPunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/summary');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentPunches(data.recentPunches || []);
      }
    } catch {
      toast.error('Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // Auto-refresh punch stats every 15 seconds
    const interval = setInterval(fetchSummary, 15000);
    return () => clearInterval(interval);
  }, []);

  const staffTotal = (stats?.totalTeachers || 0) + (stats?.totalStaff || 0);
  const staffPresent = stats?.employeeAttendance?.present || 0;
  const staffLate = stats?.employeeAttendance?.late || 0;
  const staffAttended = staffPresent + staffLate;
  const staffRate = staffTotal > 0 ? Math.round((staffAttended / staffTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-600/15">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium backdrop-blur-sm">
              Session: {stats?.currentSession || '2025'}
            </span>
            <span className="text-xs bg-emerald-400/20 text-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
              Biometric Engine: Active
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            YWCA Nursery School Dashboard
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time biometric attendance, automated SMS alerts, and student record management.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/students/admission"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-semibold shadow-md transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Admission
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Enrolled</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalStudents || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Active registered students
            </p>
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Teaching Staff</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalTeachers || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.totalStaff || 0} General staff members
            </p>
          </div>
        </div>

        {/* Classes & Sections */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Academic Structure</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalClasses || 0} Classes
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Across {stats?.totalSections || 0} Active Sections
            </p>
          </div>
        </div>

        {/* SMS Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">SMS Gateway</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.sms?.balance || 'Active'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Automated SMS Gateway
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Overview & Live Punches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Staff & Teachers Attendance Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                Today's Staff & Teachers Attendance
              </h2>
              <p className="text-xs text-slate-500">
                {format(new Date(), 'EEEE, dd MMMM yyyy')}
              </p>
            </div>
            <Link
              href="/attendance/staff"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Staff Sheet <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-1">
                <UserCheck className="w-4 h-4" /> Present
              </div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {staffPresent}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium mb-1">
                <Clock className="w-4 h-4" /> Late
              </div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {staffLate}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium mb-1">
                <UserX className="w-4 h-4" /> Absent
              </div>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                {stats?.employeeAttendance?.absent || 0}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-1">
                Rate
              </div>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {staffRate}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Attendance Rate</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{staffRate}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${(staffPresent / (staffTotal || 1)) * 100}%` }}
                className="bg-emerald-500 h-full"
                title="Present"
              />
              <div
                style={{ width: `${(staffLate / (staffTotal || 1)) * 100}%` }}
                className="bg-amber-500 h-full"
                title="Late"
              />
              <div
                style={{
                  width: `${(((stats?.employeeAttendance?.absent || 0) / (staffTotal || 1)) * 100)}%`,
                }}
                className="bg-rose-500 h-full"
                title="Absent"
              />
            </div>
          </div>
        </div>

        {/* Live ZKTeco Biometric Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Live K60 Punches
            </h2>
            <Link
              href="/attendance/live"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Monitor <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-72">
            {recentPunches.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No punches recorded yet today.
              </div>
            ) : (
              recentPunches.map((punch) => (
                <div
                  key={punch.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-semibold text-[11px]">
                      ZK
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        User ID: {punch.biometricUserId}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {format(new Date(punch.punchTime), 'hh:mm:ss a')}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 font-medium">
                    Verified
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/students/admission"
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">New Admission</span>
          <span className="text-[10px] text-slate-400">Admit new student</span>
        </Link>

        <Link
          href="/sms/send"
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2">
            <Send className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Send SMS</span>
          <span className="text-[10px] text-slate-400">Notice & Bulk alert</span>
        </Link>

        <Link
          href="/students/class-wise"
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Class Wise List</span>
          <span className="text-[10px] text-slate-400">Print ID & Student lists</span>
        </Link>

        <Link
          href="/settings/biometric"
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2">
            <Fingerprint className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">ZKTeco Bridge</span>
          <span className="text-[10px] text-slate-400">K60 Agent settings</span>
        </Link>
      </div>
    </div>
  );
}

