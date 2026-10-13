'use client';

import { APP_CONFIG } from '@/lib/constants';
import { GraduationCap, IdCard, Printer, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ClassWiseStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [sessionId, setSessionId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [shiftId, setShiftId] = useState('');

  // Dropdown data
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  // Print Mode: 'TABLE' or 'ID_CARDS'
  const [printMode, setPrintMode] = useState<'TABLE' | 'ID_CARDS'>('TABLE');

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

  const handleSearch = async () => {
    if (!classId) {
      toast.error('Please select a class');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('limit', '200');
      if (sessionId) params.append('sessionId', sessionId);
      if (classId) params.append('classId', classId);
      if (sectionId) params.append('sectionId', sectionId);
      if (shiftId) params.append('shiftId', shiftId);

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (mode: 'TABLE' | 'ID_CARDS') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const selectedClassName = classes.find((c) => String(c.id) === classId)?.name || '';
  const selectedSectionName = sections.find((s) => String(s.id) === sectionId)?.name || 'All Sections';
  const selectedSessionName = sessions.find((s) => String(s.id) === sessionId)?.name || '';

  return (
    <div className="space-y-6">
      {/* Top Controls (Hidden on Print) */}
      <div className="no-print space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Class-Wise Students & ID Card Generator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by class and section to print student registers or batch ID cards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrint('TABLE')}
              disabled={students.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              Print Register
            </button>
            <button
              onClick={() => handlePrint('ID_CARDS')}
              disabled={students.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-40"
            >
              <IdCard className="w-3.5 h-3.5" />
              Print ID Cards
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.isCurrent ? '(Current)' : ''}
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
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              Fetch Students
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {printMode === 'TABLE' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
          {/* Printable Header */}
          <div className="hidden print:block text-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="YWCA Logo" className="w-12 h-12 object-contain mb-1.5" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              {APP_CONFIG.name}
            </h2>
            <p className="text-xs text-slate-500">{APP_CONFIG.address}</p>
            <div className="mt-2 inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Session: {selectedSessionName || 'All'}</span>
              <span>•</span>
              <span>Class: {selectedClassName || 'All'}</span>
              <span>•</span>
              <span>Section: {selectedSectionName}</span>
              <span>•</span>
              <span>Total: {students.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 font-bold border-b border-slate-200 dark:border-slate-800 uppercase">
                <tr>
                  <th className="px-3 py-2 border-r">Roll</th>
                  <th className="px-3 py-2 border-r">Student ID</th>
                  <th className="px-3 py-2 border-r">Student Name</th>
                  <th className="px-3 py-2 border-r">বাংলা নাম</th>
                  <th className="px-3 py-2 border-r">Father&apos;s Name</th>
                  <th className="px-3 py-2 border-r">Guardian Phone</th>
                  <th className="px-3 py-2 border-r">Biometric ID</th>
                  <th className="px-3 py-2">Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      Please select a class and click &apos;Fetch Students&apos;.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => {
                    const enr = s.enrollments?.[0];
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-bold text-center border-r">
                          {enr?.roll || '-'}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-indigo-600 border-r">
                          {s.studentCode}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r">
                          {s.nameEn}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 border-r">
                          {s.nameBn || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 border-r">
                          {s.guardian?.fatherName || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 border-r">
                          {s.guardian?.guardianPhone || s.guardian?.fatherPhone || '-'}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-center border-r">
                          {s.biometricId || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-300"></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ID Cards Grid (Print Ready) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {students.map((s) => {
            const enr = s.enrollments?.[0];
            return (
              <div
                key={s.id}
                className="bg-white border-2 border-indigo-600 rounded-2xl p-5 shadow-md flex flex-col items-center text-center relative overflow-hidden page-break"
                style={{ width: '320px', height: '440px', margin: 'auto' }}
              >
                {/* School Banner */}
                <div className="w-full bg-gradient-to-r from-indigo-700 to-indigo-600 text-white py-2 px-3 rounded-xl mb-3 flex items-center justify-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.svg" alt="YWCA Logo" className="w-8 h-8 object-contain bg-white/10 rounded-md p-0.5 shrink-0" />
                  <div className="text-left">
                    <h3 className="font-bold text-xs uppercase leading-tight">{APP_CONFIG.name}</h3>
                    <p className="text-[9px] text-indigo-100">{APP_CONFIG.address}</p>
                  </div>
                </div>

                {/* Photo */}
                <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-indigo-200 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                  {s.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.photo} alt={s.nameEn} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-10 h-10 text-slate-300" />
                  )}
                </div>

                {/* Name & Details */}
                <h4 className="font-bold text-slate-900 text-sm">{s.nameEn}</h4>
                {s.nameBn && <p className="text-xs text-slate-500 font-bangla">{s.nameBn}</p>}

                <div className="w-full mt-3 pt-2 border-t border-slate-100 text-left text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student ID:</span>
                    <span className="font-mono font-bold text-indigo-700">{s.studentCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class & Section:</span>
                    <span className="font-semibold text-slate-800">
                      {enr?.class?.name} ({enr?.section?.name})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Roll:</span>
                    <span className="font-bold text-slate-800">{enr?.roll}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blood Group:</span>
                    <span className="font-semibold text-rose-600">{s.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency:</span>
                    <span className="font-mono font-medium text-slate-800">
                      {s.guardian?.guardianPhone || s.guardian?.fatherPhone || '-'}
                    </span>
                  </div>
                </div>

                {/* Principal Signature line */}
                <div className="w-full mt-auto pt-2 flex justify-between items-end text-[9px] text-slate-400">
                  <span>Session: {enr?.session?.name}</span>
                  <div className="text-center">
                    <div className="w-16 border-b border-slate-400 mb-0.5"></div>
                    <span>Principal</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

