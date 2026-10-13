'use client';

import { BLOOD_GROUPS, RELIGIONS } from '@/lib/constants';
import {
    ArrowLeft,
    Fingerprint,
    GraduationCap,
    Loader2,
    Save,
    School,
    User,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdmissionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    admissionNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    nameEn: '',
    nameBn: '',
    dob: '',
    gender: 'MALE',
    bloodGroup: '',
    religion: 'Islam',
    birthCertificateNo: '',
    photo: '',
    biometricId: '',
    smsEnabled: true,
    // Academic
    sessionId: '',
    classId: '',
    sectionId: '',
    shiftId: '',
    groupId: '',
    roll: '',
    // Guardian
    fatherName: '',
    fatherNid: '',
    fatherPhone: '',
    motherName: '',
    motherNid: '',
    motherPhone: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: 'Father',
    presentAddress: '',
    permanentAddress: '',
  });

  useEffect(() => {
    async function loadAcademicMeta() {
      try {
        const [sesRes, clsRes, secRes, shfRes, grpRes] = await Promise.all([
          fetch('/api/academic/sessions'),
          fetch('/api/academic/classes'),
          fetch('/api/academic/sections'),
          fetch('/api/academic/shifts'),
          fetch('/api/academic/groups'),
        ]);

        const [ses, cls, sec, shf, grp] = await Promise.all([
          sesRes.json(),
          clsRes.json(),
          secRes.json(),
          shfRes.json(),
          grpRes.json(),
        ]);

        if (ses.success) {
          setSessions(ses.sessions);
          const current = ses.sessions.find((s: any) => s.isCurrent) || ses.sessions[0];
          if (current) setFormData((p) => ({ ...p, sessionId: String(current.id) }));
        }
        if (cls.success) setClasses(cls.classes);
        if (sec.success) setSections(sec.sections);
        if (shf.success) {
          setShifts(shf.shifts);
          if (shf.shifts[0]) setFormData((p) => ({ ...p, shiftId: String(shf.shifts[0].id) }));
        }
        if (grp.success) setGroups(grp.groups);
      } catch {
        toast.error('Failed to load academic master data');
      }
    }
    loadAcademicMeta();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const filteredSections = formData.classId
    ? sections.filter((s) => s.classId === Number(formData.classId))
    : sections;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEn || !formData.admissionNo || !formData.sessionId || !formData.classId || !formData.sectionId || !formData.shiftId || !formData.roll) {
      toast.error('Please fill in all required fields (Name, Admission No, Session, Class, Section, Shift, Roll)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Admission failed');
        setLoading(false);
        return;
      }

      toast.success('Student admitted successfully!');
      router.push(`/students/${data.student.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              New Student Admission
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in student information, guardian contacts, and biometric ID.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Academic Enrollment Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            1. Academic & Enrollment Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Admission No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="admissionNo"
                value={formData.admissionNo}
                onChange={handleChange}
                placeholder="e.g. ADM-2025-001"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Admission Date
              </label>
              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Academic Session <span className="text-rose-500">*</span>
              </label>
              <select
                name="sessionId"
                value={formData.sessionId}
                onChange={handleChange}
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
                Class <span className="text-rose-500">*</span>
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
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
                Section <span className="text-rose-500">*</span>
              </label>
              <select
                name="sectionId"
                value={formData.sectionId}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select Section</option>
                {filteredSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.class?.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Shift <span className="text-rose-500">*</span>
              </label>
              <select
                name="shiftId"
                value={formData.shiftId}
                onChange={handleChange}
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
                Class Roll No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="roll"
                value={formData.roll}
                onChange={handleChange}
                placeholder="e.g. 1, 01"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Academic Group (Optional)
              </label>
              <select
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">None / General</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
                ZKTeco Biometric User ID
              </label>
              <input
                type="text"
                name="biometricId"
                value={formData.biometricId}
                onChange={handleChange}
                placeholder="User ID registered in K60"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Student Basic Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            2. Student Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Student Name (বাংলা)
              </label>
              <input
                type="text"
                name="nameBn"
                value={formData.nameBn}
                onChange={handleChange}
                placeholder="শিক্ষার্থীর নাম বাংলায়"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="MALE">Male (ছাত্র)</option>
                <option value="FEMALE">Female (ছাত্রী)</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Religion
              </label>
              <select
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {RELIGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Birth Certificate No
              </label>
              <input
                type="text"
                name="birthCertificateNo"
                value={formData.birthCertificateNo}
                onChange={handleChange}
                placeholder="17 Digit Number"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Guardian & Contact Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            3. Guardian & Contact Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Father&apos;s Name
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Father's full name"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Father&apos;s Mobile
              </label>
              <input
                type="text"
                name="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleChange}
                placeholder="017xxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Father&apos;s NID
              </label>
              <input
                type="text"
                name="fatherNid"
                value={formData.fatherNid}
                onChange={handleChange}
                placeholder="National ID"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mother&apos;s Name
              </label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                placeholder="Mother's full name"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mother&apos;s Mobile
              </label>
              <input
                type="text"
                name="motherPhone"
                value={formData.motherPhone}
                onChange={handleChange}
                placeholder="017xxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Primary Guardian Phone (For SMS Alerts) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                placeholder="017xxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Present Address
              </label>
              <textarea
                name="presentAddress"
                rows={2}
                value={formData.presentAddress}
                onChange={handleChange}
                placeholder="House, Road, Area, Pabna"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="smsEnabledCheck"
              name="smsEnabled"
              checked={formData.smsEnabled}
              onChange={handleChange}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="smsEnabledCheck" className="text-slate-700 dark:text-slate-300 font-medium text-xs">
              Enable Automated SMS Notifications (Attendance Entry, Exit & School Notices)
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/students"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Admitting Student...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Complete Admission</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

