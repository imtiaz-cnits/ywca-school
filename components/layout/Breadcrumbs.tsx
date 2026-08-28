'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

// Route segment friendly labels and parent module mappings
const ROUTE_MAP: Record<string, { label: string; parent?: { label: string; href?: string } }> = {
  '/dashboard': { label: 'Dashboard' },

  // Academic
  '/academic/sessions': { label: 'Academic Sessions', parent: { label: 'Academic Setup', href: '/academic/sessions' } },
  '/academic/classes': { label: 'Classes', parent: { label: 'Academic Setup', href: '/academic/classes' } },
  '/academic/sections': { label: 'Sections', parent: { label: 'Academic Setup', href: '/academic/sections' } },
  '/academic/shifts': { label: 'Shifts', parent: { label: 'Academic Setup', href: '/academic/shifts' } },
  '/academic/groups': { label: 'Groups', parent: { label: 'Academic Setup', href: '/academic/groups' } },

  // Students
  '/students': { label: 'All Students', parent: { label: 'Student Management', href: '/students' } },
  '/students/admission': { label: 'New Admission', parent: { label: 'Student Management', href: '/students' } },
  '/students/re-admission': { label: 'Re-Admission & Promotion', parent: { label: 'Student Management', href: '/students' } },
  '/students/class-wise': { label: 'Class-Wise List & ID Cards', parent: { label: 'Student Management', href: '/students' } },

  // Attendance
  '/attendance/live': { label: 'Live Punch Monitor', parent: { label: 'Attendance (ZKTeco)', href: '/attendance/live' } },
  '/attendance/students': { label: 'Student Attendance Register', parent: { label: 'Attendance (ZKTeco)', href: '/attendance/students' } },
  '/attendance/staff': { label: 'Staff Attendance Register', parent: { label: 'Attendance (ZKTeco)', href: '/attendance/staff' } },
  '/attendance/manual': { label: 'Manual Sheet Entry', parent: { label: 'Attendance (ZKTeco)', href: '/attendance/manual' } },

  // Staff
  '/staff/teachers': { label: 'Teachers Directory', parent: { label: 'Staff & Teachers', href: '/staff/teachers' } },
  '/staff/general': { label: 'General Staff Directory', parent: { label: 'Staff & Teachers', href: '/staff/general' } },

  // SMS
  '/sms/send': { label: 'Send Bulk SMS', parent: { label: 'SMS Management', href: '/sms/send' } },
  '/sms/logs': { label: 'SMS Delivery Logs', parent: { label: 'SMS Management', href: '/sms/logs' } },

  // Settings
  '/settings/biometric': { label: 'Biometric Device & Bridge', parent: { label: 'Settings', href: '/settings/biometric' } },
};

function formatSegment(segment: string) {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  // If directly on dashboard
  if (pathname === '/dashboard' || pathname === '/') {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <Home className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Dashboard</span>
        </span>
      </nav>
    );
  }

  // Exact match
  const mapped = ROUTE_MAP[pathname];
  if (mapped) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {mapped.parent && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            {mapped.parent.href ? (
              <Link
                href={mapped.parent.href}
                className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors whitespace-nowrap"
              >
                {mapped.parent.label}
              </Link>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                {mapped.parent.label}
              </span>
            )}
          </>
        )}

        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
          {mapped.label}
        </span>
      </nav>
    );
  }

  // Handle dynamic routes like /students/[id]
  if (pathname.startsWith('/students/') && pathname.split('/').length === 3) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
        <Link
          href="/students"
          className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
        >
          Student Management
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-white">
          Student Profile
        </span>
      </nav>
    );
  }

  // Fallback parser for any arbitrary nested path
  const segments = pathname.split('/').filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {formatSegment(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                {formatSegment(segment)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
