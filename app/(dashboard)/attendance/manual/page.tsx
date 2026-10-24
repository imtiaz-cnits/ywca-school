'use client';

import FlatpickrCalendar from '@/components/FlatpickrCalendar';
import { TablePagination, TableTopControls, useTableControls } from '@/components/TableControls';
import { format } from 'date-fns';
import { CheckCircle, RefreshCw, Save, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ManualAttendancePage() {
  const [date, setDate] = useState(format(new Date(), 'dd-MM-yyyy'));
  const [sessionId, setSessionId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [shiftId, setShiftId] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({});

  const {
    searchTerm,
    setSearchTerm,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    paginatedData: paginatedStudents,
    totalEntries,
    totalPages,
    startIndex,
    endIndex,
  } = useTableControls({
    data: students,
    initialPageSize: 10,
    filterFn: (s, q) =>
      Boolean(
        s.name?.toLowerCase().includes(q) ||
        s.studentCode?.toLowerCase().includes(q) ||
        String(s.roll || '').toLowerCase().includes(q)
      ),
  });

  // Metadata
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

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
        if (cls.success) {
          setClasses(cls.classes);
          if (cls.classes[0]) setClassId(String(cls.classes[0].id));
        }
        if (sec.success) setSections(sec.sections);
        if (shf.success) setShifts(shf.shifts);
      } catch {
        // ignore
      }
    }
    loadMeta();
  }, []);

  const handleFetchSheet = async () => {
    if (!classId) {
      toast.error('Please select a class');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('date', date);
      if (sessionId) params.append('sessionId', sessionId);
      if (classId) params.append('classId', classId);
      if (sectionId) params.append('sectionId', sectionId);
      if (shiftId) params.append('shiftId', shiftId);

      const res = await fetch(`/api/attendance/student?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.report);
        const map: Record<number, string> = {};
        data.report.forEach((item: any) => {
          map[item.enrollmentId] = item.status;
        });
        setAttendanceMap(map);
      }
    } catch {
      toast.error('Failed to load sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (enrollmentId: number, status: string) => {
    setAttendanceMap((prev) => ({ ...prev, [enrollmentId]: status }));
  };

  const handleMarkAll = (status: string) => {
    const updated: Record<number, string> = {};
    students.forEach((s) => {
      updated[s.enrollmentId] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;

    setSaving(true);
    try {
      const items = students.map((s) => ({
        enrollmentId: s.enrollmentId,
        studentId: s.studentId,
        status: attendanceMap[s.enrollmentId] || 'PRESENT',
      }));

      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          type: 'STUDENT',
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Save failed');
        return;
      }

      toast.success('Attendance saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-600" />
            Manual Attendance Entry & Override
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manually take or correct attendance for any class and session.
          </p>
        </div>

        {students.length > 0 && (
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Attendance
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <FlatpickrCalendar
              value={date}
              onChange={(val) => setDate(val)}
              placeholder="Select date..."
            />
          </div>

          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Select Session</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Sections</option>
            {sections
              .filter((sec) => !classId || sec.classId === Number(classId))
              .map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
          </select>

          <select
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Shifts</option>
            {shifts.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleFetchSheet}
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            Load Students
          </button>
        </div>
      </div>

      {/* Bulk Status Buttons */}
      {students.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Quick Actions:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      )}

      {/* Sheet Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
        <TableTopControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalEntries={totalEntries}
          searchPlaceholder="Search student name, roll, code..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Roll</th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5 text-center">Present</th>
                <th className="px-6 py-3.5 text-center">Late</th>
                <th className="px-6 py-3.5 text-center">Absent</th>
                <th className="px-6 py-3.5 text-center">Excused</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[14px]">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Select a class and click &apos;Load Students&apos; to take attendance.
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No matching students found.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => {
                  const currentStatus = attendanceMap[s.enrollmentId] || s.status;
                  return (
                    <tr key={s.enrollmentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {s.roll}
                      </td>
                      <td className="px-6 py-4 font-mono text-indigo-600">
                        {s.studentCode}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {s.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="radio"
                          name={`status-${s.enrollmentId}`}
                          checked={currentStatus === 'PRESENT'}
                          onChange={() => handleStatusChange(s.enrollmentId, 'PRESENT')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="radio"
                          name={`status-${s.enrollmentId}`}
                          checked={currentStatus === 'LATE'}
                          onChange={() => handleStatusChange(s.enrollmentId, 'LATE')}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="radio"
                          name={`status-${s.enrollmentId}`}
                          checked={currentStatus === 'ABSENT'}
                          onChange={() => handleStatusChange(s.enrollmentId, 'ABSENT')}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="radio"
                          name={`status-${s.enrollmentId}`}
                          checked={currentStatus === 'EXCUSED'}
                          onChange={() => handleStatusChange(s.enrollmentId, 'EXCUSED')}
                          className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={totalEntries}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

