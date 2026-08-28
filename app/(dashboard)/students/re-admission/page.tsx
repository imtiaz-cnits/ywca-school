'use client';

import { CheckCircle2, RefreshCw, Save, Search, UserCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ReAdmissionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // New enrollment form state
  const [sessionId, setSessionId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [roll, setRoll] = useState('');
  const [loading, setLoading] = useState(false);

  // Academic Dropdown Data
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
        if (cls.success) setClasses(cls.classes);
        if (sec.success) setSections(sec.sections);
        if (shf.success) {
          setShifts(shf.shifts);
          if (shf.shifts[0]) setShiftId(String(shf.shifts[0].id));
        }
      } catch {
        // ignore
      }
    }
    loadMeta();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a Student ID, Admission No, or phone number');
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(`/api/students/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success && data.students.length > 0) {
        setSelectedStudent(data.students[0]);
        toast.success(`Found student: ${data.students[0].nameEn}`);
      } else {
        toast.error('No student found with this search term.');
        setSelectedStudent(null);
      }
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleReAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !sessionId || !classId || !sectionId || !shiftId || !roll) {
      toast.error('Please fill in all enrollment fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/students/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          sessionId,
          classId,
          sectionId,
          shiftId,
          roll,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Re-admission failed');
        setLoading(false);
        return;
      }

      toast.success('Student re-admitted / promoted successfully!');
      setSelectedStudent(null);
      setSearchQuery('');
      setRoll('');
    } catch (error: any) {
      toast.error(error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = classId
    ? sections.filter((s) => s.classId === Number(classId))
    : sections;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          Student Re-Admission & Promotion
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enroll an existing student into a new academic session, class, or section.
        </p>
      </div>

      {/* Step 1: Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Step 1: Search Existing Student
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3 max-w-xl text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Student ID (e.g. STU-2025-0001) or Admission No..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Find Student
          </button>
        </form>
      </div>

      {/* Step 2: Details & New Enrollment Form */}
      {selectedStudent && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                {selectedStudent.nameEn[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedStudent.nameEn}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {selectedStudent.studentCode} • Admission No: {selectedStudent.admissionNo}
                </p>
                <p className="text-xs text-slate-400">
                  Guardian Phone: {selectedStudent.guardian?.guardianPhone || selectedStudent.guardian?.fatherPhone || '-'}
                </p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Student Verified
            </span>
          </div>

          <form onSubmit={handleReAdmit} className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Step 2: Assign New Academic Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Academic Session <span className="text-rose-500">*</span>
                </label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select Session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.isCurrent ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Class <span className="text-rose-500">*</span>
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select Section</option>
                  {filteredSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Shift <span className="text-rose-500">*</span>
                </label>
                <select
                  value={shiftId}
                  onChange={(e) => setShiftId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select Shift</option>
                  {shifts.map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Roll No <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  placeholder="e.g. 01"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Submit Re-Admission / Promotion
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

