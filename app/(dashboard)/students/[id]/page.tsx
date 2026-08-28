'use client';

import { APP_CONFIG } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import {
    ArrowLeft,
    Fingerprint,
    GraduationCap,
    History,
    Printer,
    User
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StudentProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/students/${id}`);
        const data = await res.json();
        if (data.success) {
          setStudent(data.student);
        } else {
          toast.error(data.message || 'Student not found');
        }
      } catch {
        toast.error('Failed to load student details');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadStudent();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400 text-xs">
        Loading student profile...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20 text-slate-400 text-xs">
        Student not found.
      </div>
    );
  }

  const currentEnrollment = student.enrollments?.[0];

  return (
    <div className="space-y-6">
      {/* Header (No print) */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/students"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Student Profile & Registration Card
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ID: {student.studentCode} • Admission: {student.admissionNo}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Registration Card
        </button>
      </div>

      {/* Main Profile Card / Printable Registration Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Printable Header */}
        <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="YWCA Logo" className="w-14 h-14 object-contain mb-2" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            {APP_CONFIG.name}
          </h2>
          <p className="text-xs text-slate-500">{APP_CONFIG.address} • Phone: {APP_CONFIG.phone}</p>
          <div className="mt-3 inline-block bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase px-4 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
            Student Admission & Registration Record
          </div>
        </div>

        {/* Basic Header Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-28 h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-indigo-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {student.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.photo} alt={student.nameEn} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-300" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {student.nameEn}
                </h3>
                {student.nameBn && (
                  <p className="text-sm text-slate-500 font-medium">{student.nameBn}</p>
                )}
              </div>
              <span className="self-center sm:self-auto px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                Status: Active
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                ID: {student.studentCode}
              </span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                Admission No: {student.admissionNo}
              </span>
              {student.biometricId && (
                <span className="flex items-center gap-1 font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-lg">
                  <Fingerprint className="w-3.5 h-3.5" /> Bio ID: {student.biometricId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Current Academic Placement
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Session:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentEnrollment?.session?.name || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Class & Section:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentEnrollment?.class?.name} ({currentEnrollment?.section?.name})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Class Roll:</span>
              <span className="font-bold text-indigo-600 text-sm">
                {currentEnrollment?.roll || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Shift:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentEnrollment?.shift?.name || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Personal & Guardian Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Personal Information
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-400">Date of Birth:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(student.dob)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gender:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{student.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Blood Group:</span>
                <span className="font-bold text-rose-600">{student.bloodGroup || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Religion:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{student.religion || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Birth Certificate No:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{student.birthCertificateNo || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admission Date:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(student.admissionDate)}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Guardian & Contact Details
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-400">Father&apos;s Name:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{student.guardian?.fatherName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Father&apos;s Mobile:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{student.guardian?.fatherPhone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mother&apos;s Name:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{student.guardian?.motherName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary SMS Contact:</span>
                <span className="font-bold text-indigo-600">{student.guardian?.guardianPhone || student.guardian?.fatherPhone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[200px]">
                  {student.guardian?.presentAddress || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment History Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-indigo-600" />
            Enrollment & Promotion History
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Session</th>
                  <th className="px-4 py-2.5">Class</th>
                  <th className="px-4 py-2.5">Section</th>
                  <th className="px-4 py-2.5">Shift</th>
                  <th className="px-4 py-2.5">Roll</th>
                  <th className="px-4 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {student.enrollments?.map((e: any) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {e.session?.name}
                    </td>
                    <td className="px-4 py-2.5">{e.class?.name}</td>
                    <td className="px-4 py-2.5">{e.section?.name}</td>
                    <td className="px-4 py-2.5">{e.shift?.name}</td>
                    <td className="px-4 py-2.5 font-bold text-indigo-600">{e.roll}</td>
                    <td className="px-4 py-2.5 text-slate-400">{formatDate(e.enrollmentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures Footer (Visible in Print) */}
        <div className="pt-12 flex justify-between items-end text-xs text-slate-500">
          <div className="text-center">
            <div className="w-36 border-b border-slate-400 mb-1"></div>
            <span>Parent / Guardian Signature</span>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-slate-400 mb-1"></div>
            <span>Head Teacher / Principal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

