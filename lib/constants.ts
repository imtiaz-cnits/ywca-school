export const APP_CONFIG = {
  name: 'YWCA Nursery School, Pabna',
  shortName: 'YWCA School',
  address: 'Dilalpur, Pabna, Bangladesh',
  phone: '+880 1712-345678',
  email: 'info@ywcaschoolpabna.edu.bd',
  developedBy: 'CodeNext IT',
  developerUrl: 'https://www.codenextit.com',
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const RELIGIONS = ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'];

export const GENDERS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];

export const USER_ROLES = [
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Teacher', value: 'TEACHER' },
  { label: 'Staff', value: 'STAFF' },
  { label: 'Accountant', value: 'ACCOUNTANT' },
];

export const ATTENDANCE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PRESENT: { label: 'Present', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20' },
  LATE: { label: 'Late', color: 'bg-amber-500/15 text-amber-600 border-amber-500/20' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-500/15 text-purple-600 border-purple-500/20' },
  ABSENT: { label: 'Absent', color: 'bg-rose-500/15 text-rose-600 border-rose-500/20' },
  EXCUSED: { label: 'Excused', color: 'bg-sky-500/15 text-sky-600 border-sky-500/20' },
  HOLIDAY: { label: 'Holiday', color: 'bg-purple-500/15 text-purple-600 border-purple-500/20' },
};

export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Academic',
    icon: 'School',
    children: [
      { title: 'Academic Sessions', href: '/academic/sessions' },
      { title: 'Classes', href: '/academic/classes' },
      { title: 'Sections', href: '/academic/sections' },
      { title: 'Shifts', href: '/academic/shifts' },
      { title: 'Groups', href: '/academic/groups' },
    ],
  },
  {
    title: 'Students',
    icon: 'GraduationCap',
    children: [
      { title: 'New Admission', href: '/students/admission' },
      { title: 'All Students', href: '/students' },
      { title: 'Class-Wise List', href: '/students/class-wise' },
      { title: 'Re-Admission / Promotion', href: '/students/re-admission' },
    ],
  },
  {
    title: 'Attendance (ZKTeco)',
    icon: 'Fingerprint',
    children: [
      { title: 'Live Punch Monitor', href: '/attendance/live' },
      // { title: 'Student Attendance', href: '/attendance/students' },
      { title: 'Staff Attendance', href: '/attendance/staff' },
      { title: 'Manual Entry / Sheet', href: '/attendance/manual' },
    ],
  },
  {
    title: 'Staff & Teachers',
    icon: 'Users',
    children: [
      { title: 'Teachers Directory', href: '/staff/teachers' },
      { title: 'Staff Directory', href: '/staff/general' },
    ],
  },
  {
    title: 'SMS Management',
    icon: 'MessageSquare',
    children: [
      { title: 'Send Bulk SMS', href: '/sms/send' },
      { title: 'SMS History & Logs', href: '/sms/logs' },
    ],
  },
  {
    title: 'Settings',
    icon: 'Settings',
    children: [
      { title: 'User Management', href: '/settings/users' },
      { title: 'Biometric Device', href: '/settings/biometric' },
      { title: 'SMS Settings', href: '/settings/sms' },
    ],
  },
];

