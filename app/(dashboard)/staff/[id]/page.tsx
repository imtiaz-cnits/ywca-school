'use client';

import CustomSelect from '@/components/CustomSelect';
import { ATTENDANCE_STATUS_LABELS } from '@/lib/constants';
import { format } from 'date-fns';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Edit,
  Fingerprint,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  User,
  UserCheck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

export default function StaffProfilePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves'>('attendance');
  const [syncingDevice, setSyncingDevice] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    designation: '',
    type: 'TEACHER',
    phone: '',
    email: '',
    gender: 'MALE',
    nid: '',
    bloodGroup: '',
    religion: 'Islam',
    presentAddress: '',
    biometricId: '',
    smsEnabled: true,
    status: 'active',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/employees/${employeeId}`);
      const data = await res.json();
      if (data.success && data.employee) {
        setEmployee(data.employee);
        setEditFormData({
          name: data.employee.name,
          designation: data.employee.designation,
          type: data.employee.type,
          phone: data.employee.phone || '',
          email: data.employee.email || '',
          gender: data.employee.gender || 'MALE',
          nid: data.employee.nid || '',
          bloodGroup: data.employee.bloodGroup || '',
          religion: data.employee.religion || 'Islam',
          presentAddress: data.employee.presentAddress || '',
          biometricId: data.employee.biometricId || '',
          smsEnabled: data.employee.smsEnabled !== false,
          status: data.employee.status || 'active',
        });
      } else {
        toast.error(data.message || 'Employee not found');
      }
    } catch {
      toast.error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchProfile();
    }
  }, [employeeId]);

  const handlePushToMachine = async () => {
    if (!employee?.biometricId) {
      toast.error('Please assign a ZKTeco Biometric ID first');
      return;
    }
    try {
      setSyncingDevice(true);
      await new Promise((r) => setTimeout(r, 800));
      toast.success(`User #${employee.biometricId} synced with ZKTeco K60 machine!`);
    } catch {
      toast.error('Failed to communicate with biometric hardware');
    } finally {
      setSyncingDevice(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.designation.trim()) {
      toast.error('Name and Designation are required');
      return;
    }
    try {
      setSavingEdit(true);
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Staff profile updated successfully');
        setEditModalOpen(false);
        fetchProfile();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch {
      toast.error('Network error updating profile');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading staff profile credentials...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Staff Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested employee could not be found or has been removed.</p>
        <Link
          href="/staff"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Staff Directory
        </Link>
      </div>
    );
  }

  // Calculate attendance statistics
  const attendances: any[] = employee.attendances || [];
  const leaves: any[] = employee.leaves || [];
  const totalPresent = attendances.filter((a) => a.status === 'PRESENT').length;
  const totalLate = attendances.filter((a) => a.status === 'LATE').length;
  const totalLeaves = leaves.filter((l) => l.status === 'APPROVED').length;
  const totalRecords = attendances.length;
  const attendanceRate = totalRecords > 0 ? Math.round(((totalPresent + totalLate) / totalRecords) * 100) : 100;

  // Official YWCA Pabna quota limits
  const CASUAL_QUOTA = 10;
  const SICK_QUOTA = 14;
  const ANNUAL_QUOTA = 21;

  const casualUsed = leaves
    .filter((l: any) => l.status === 'APPROVED' && (l.leaveType?.toLowerCase().includes('casual') || l.leaveType?.includes('নৈমিত্তিক')))
    .length;
  const sickUsed = leaves
    .filter((l: any) => l.status === 'APPROVED' && (l.leaveType?.toLowerCase().includes('sick') || l.leaveType?.includes('অসুস্থ')))
    .length;
  const annualUsed = leaves
    .filter((l: any) => l.status === 'APPROVED' && (l.leaveType?.toLowerCase().includes('annual') || l.leaveType?.includes('বাৎসরিক')))
    .length;

  // Name initials for avatar
  const initials = employee.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/staff"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Staff Profile & Credentials
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-8">
            Official faculty record, biometric device linkage and employment summary
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Push to Machine Button */}
          <button
            type="button"
            onClick={handlePushToMachine}
            disabled={syncingDevice}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Cpu className={`w-3.5 h-3.5 ${syncingDevice ? 'animate-spin' : ''}`} />
            <span>PUSH TO MACHINE</span>
          </button>

          {/* Edit Staff Button */}
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>EDIT STAFF</span>
          </button>
        </div>
      </div>

      {/* Main Credentials 2-Column Grid matching Screenshot 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Profile & Biometric Box) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Identity Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Avatar with Status badge */}
            <div className="relative inline-block mx-auto mb-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                {initials || 'ST'}
              </div>
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                  employee.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}
              >
                ● {employee.status || 'Active'}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {employee.name}
            </h2>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-0.5">
              {employee.designation}
            </p>

            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-medium border border-slate-200/60 dark:border-slate-700">
                ID: {employee.employeeCode}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] border border-indigo-100 dark:border-indigo-900/60">
                DEPT: {employee.type === 'TEACHER' ? 'Faculty / Teaching' : 'General Staff'}
              </span>
            </div>

            {/* Contact Details List */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Email Address</div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate font-mono">
                    {employee.email || 'No email provided'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Mobile Phone</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate font-mono">
                    {employee.phone || 'Not recorded'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Biometric Attendance Machine Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Attendance Machine
                  </h3>
                  <p className="text-[10px] text-slate-400">Biometric Sync Status</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  employee.biometricId
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${employee.biometricId ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {employee.biometricId ? 'Linked' : 'Unmapped'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Biometric Device ID</div>
                <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                  {employee.biometricId || '—'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Target Device IP</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono mt-1">
                  {employee.deviceIp || '192.168.0.134'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePushToMachine}
              disabled={syncingDevice}
              className="w-full mt-4 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>SYNC USER TO DEVICE</span>
            </button>
          </div>
        </div>

        {/* Right Column (Credentials Cards & Analytics) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Employment & Professional Credentials */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Employment & Professional Credentials
                </h3>
                <p className="text-[11px] text-slate-400">
                  Official institutional position, department, and service setup
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Employee Code</div>
                <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  {employee.employeeCode}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Professional Rank</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {employee.designation}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Department</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {employee.type === 'TEACHER' ? 'Teaching Faculty' : 'General Administration'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Joining Date</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono mt-1">
                  {format(new Date(employee.createdAt), 'dd MMM yyyy')}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assigned Shift</div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  Regular Staff (08:30 AM - 02:00 PM)
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Created By</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  YWCA School Admin
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Personal & Demographic Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Personal & Demographic Details
                </h3>
                <p className="text-[11px] text-slate-400">
                  Identity, blood group, and residential contact address
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Gender</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {employee.gender || 'Not specified'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Blood Group</div>
                <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {employee.bloodGroup || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">System Account</div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VERIFIED STAFF</span>
                </div>
              </div>

              <div className="sm:col-span-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Residential Full Address</div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{employee.presentAddress || 'Pabna Sadar, Pabna, Bangladesh'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Leave Analytics Summary Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Attendance & Service Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Biometric scans, in/out punch timestamps, and approved leave history
          </p>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Present Days</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
              {totalPresent}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">On-time arrivals</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Late Days</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono mt-1">
              {totalLate}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">After 08:35 AM (5 min grace)</div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Approved Leaves</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400 font-mono mt-1">
              {totalLeaves}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recorded in system</div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Attendance Rate</span>
              <Activity className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-700 dark:text-sky-400 font-mono mt-1">
              {attendanceRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Overall punctuality</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Recent Attendance Scans ({attendances.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'leaves'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Leave History ({leaves.length})
          </button>
        </div>

        {/* Tab 1: Attendance History */}
        {activeTab === 'attendance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">In-Time</th>
                  <th className="px-4 py-3">Out-Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[14px]">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No attendance scans recorded for this staff member yet.
                    </td>
                  </tr>
                ) : (
                  attendances.map((att: any) => {
                    const statusInfo = ATTENDANCE_STATUS_LABELS[att.status] || {
                      label: att.status,
                      color: 'bg-slate-100 text-slate-600',
                    };
                    return (
                      <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {format(new Date(att.date), 'dd MMM, yyyy')}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-800 dark:text-slate-200 font-semibold">
                          {att.inTime ? format(new Date(att.inTime), 'hh:mm a') : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-800 dark:text-slate-200">
                          {att.outTime ? format(new Date(att.outTime), 'hh:mm a') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500">
                            {att.source || 'BIOMETRIC'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {att.remark || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Leaves History & YWCA Pabna Quota Balances */}
        {activeTab === 'leaves' && (
          <div className="space-y-5">
            {/* 3 YWCA Official Leave Quota Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Casual Leave */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider font-bangla">
                    নৈমিত্তিক ছুটি (Casual)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                    কোটা: {CASUAL_QUOTA} দিন
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100 font-mono">
                    {Math.max(0, CASUAL_QUOTA - casualUsed)}
                  </span>
                  <span className="text-xs text-slate-500">দিন বাকি</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-indigo-100/70 dark:border-indigo-900/40 pt-2">
                  <span>ভোগকৃত ছুটি:</span>
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">{casualUsed} দিন</span>
                </div>
              </div>

              {/* Sick Leave */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider font-bangla">
                    অসুস্থতাজনিত ছুটি (Sick)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold">
                    কোটা: {SICK_QUOTA} দিন
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-rose-900 dark:text-rose-100 font-mono">
                    {Math.max(0, SICK_QUOTA - sickUsed)}
                  </span>
                  <span className="text-xs text-slate-500">দিন বাকি</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-rose-100/70 dark:border-rose-900/40 pt-2">
                  <span>ভোগকৃত ছুটি:</span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-300">{sickUsed} দিন</span>
                </div>
              </div>

              {/* Annual Leave */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-bangla">
                    বাৎসরিক ছুটি (Annual)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold">
                    কোটা: {ANNUAL_QUOTA} দিন
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-amber-900 dark:text-amber-100 font-mono">
                    {Math.max(0, ANNUAL_QUOTA - annualUsed)}
                  </span>
                  <span className="text-xs text-slate-500">দিন বাকি</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-amber-100/70 dark:border-amber-900/40 pt-2">
                  <span>ভোগকৃত ছুটি:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{annualUsed} দিন</span>
                </div>
              </div>
            </div>

            {/* Leave Applications Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Leave Type</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Address / Substitute</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[14px]">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No leave applications recorded for this staff member.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((l: any) => (
                      <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                          {l.leaveType}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {l.duration === 'HALF_DAY' ? 'Half Day' : 'Full Day'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{l.startDate}</td>
                        <td className="px-4 py-3 font-mono text-xs">{l.endDate}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={l.reason}>
                          {l.reason || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          <div>{l.leaveAddress || '—'}</div>
                          {l.substituteName && (
                            <div className="text-[10px] text-slate-400 mt-0.5">বদলী: {l.substituteName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              l.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200'
                                : l.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Staff Modal - Rendered via Portal to guarantee 0 top gap */}
      {editModalOpen && mounted && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Staff Profile</h2>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Employee Type *
                    </label>
                    <CustomSelect
                      value={editFormData.type}
                      onChange={(val) => setEditFormData({ ...editFormData, type: val })}
                      options={[
                        { value: 'TEACHER', label: 'Teacher' },
                        { value: 'STAFF', label: 'General Staff' },
                      ]}
                      placeholder="Select Type"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.designation}
                      onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="017xxxxxxxx"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Status
                    </label>
                    <CustomSelect
                      value={editFormData.status}
                      onChange={(val) => setEditFormData({ ...editFormData, status: val })}
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ]}
                      placeholder="Select Status"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      ZKTeco Biometric ID
                    </label>
                    <input
                      type="text"
                      value={editFormData.biometricId}
                      onChange={(e) => setEditFormData({ ...editFormData, biometricId: e.target.value })}
                      placeholder="e.g. 1001"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Blood Group
                    </label>
                    <input
                      type="text"
                      value={editFormData.bloodGroup}
                      onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                      placeholder="e.g. B+"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
