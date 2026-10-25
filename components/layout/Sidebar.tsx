'use client';

import { cn } from '@/lib/utils';
import {
    Activity,
    ArrowLeft,
    BookOpen,
    Boxes,
    Calendar,
    ChevronRight,
    ClipboardCheck,
    Cpu,
    Edit3,
    Fingerprint,
    GraduationCap,
    History,
    Layers,
    LayoutDashboard,
    ListOrdered,
    LogOut,
    MessageSquare,
    MoreVertical,
    PanelLeftClose,
    School,
    Send,
    Settings,
    Shield,
    TrendingUp,
    UserCheck,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: any;
}

interface NavChild {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  viewKey: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  children: NavChild[];
}

const navSections: NavSection[] = [
  {
    title: 'Academic Setup',
    viewKey: 'academic',
    icon: School,
    description: 'Sessions, classes & sections',
    children: [
      { title: 'Academic Sessions', href: '/academic/sessions', icon: Calendar },
      { title: 'Classes', href: '/academic/classes', icon: BookOpen },
      { title: 'Sections', href: '/academic/sections', icon: Layers },
      { title: 'Shifts', href: '/academic/shifts', icon: Calendar },
      { title: 'Groups', href: '/academic/groups', icon: Boxes },
    ],
  },
  {
    title: 'Student Management',
    viewKey: 'students',
    icon: GraduationCap,
    description: 'Admissions & student lists',
    children: [
      { title: 'New Admission', href: '/students/admission', icon: UserPlus },
      { title: 'All Students', href: '/students', icon: Users },
      { title: 'Class-Wise List', href: '/students/class-wise', icon: ListOrdered },
      { title: 'Re-Admission / Promotion', href: '/students/re-admission', icon: TrendingUp },
    ],
  },
  {
    title: 'Attendance',
    viewKey: 'attendance',
    icon: Fingerprint,
    description: 'Biometric punches & logs',
    children: [
      { title: 'Live Punch Monitor', href: '/attendance/live', icon: Activity },
      // { title: 'Student Attendance', href: '/attendance/students', icon: UserCheck },
      { title: 'Staff Attendance', href: '/attendance/staff', icon: ClipboardCheck },
      { title: 'Manual Sheet Entry', href: '/attendance/manual', icon: Edit3 },
    ],
  },
  {
    title: 'Staff & Leave',
    viewKey: 'staff',
    icon: Users,
    description: 'Faculty, staff & leave management',
    children: [
      { title: 'Staff & Teachers', href: '/staff', icon: Users },
      { title: 'Leave Management', href: '/staff/leave', icon: Calendar },
    ],
  },
  {
    title: 'SMS Management',
    viewKey: 'sms',
    icon: MessageSquare,
    description: 'Broadcast alerts & notices',
    children: [
      { title: 'Send Bulk SMS', href: '/sms/send', icon: Send },
    ],
  },
  {
    title: 'Settings',
    viewKey: 'settings',
    icon: Settings,
    description: 'Device & system config',
    children: [
      { title: 'Biometric Device & Bridge', href: '/settings/biometric', icon: Cpu },
    ],
  },
];

function getViewForPath(path: string): string {
  if (path.startsWith('/academic')) return 'academic';
  if (path.startsWith('/students')) return 'students';
  if (path.startsWith('/attendance')) return 'attendance';
  if (path.startsWith('/staff')) return 'staff';
  if (path.startsWith('/sms')) return 'sms';
  if (path.startsWith('/settings')) return 'settings';
  return 'main';
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Drilldown view state
  const [currentView, setCurrentView] = useState<string>(() => getViewForPath(pathname));
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  // Sync view when route changes
  useEffect(() => {
    const matchingView = getViewForPath(pathname);
    if (matchingView !== 'main') {
      setCurrentView(matchingView);
    }
  }, [pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (footerRef.current && !footerRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Failed to logout');
    }
  };

  const activeSection = navSections.find((s) => s.viewKey === currentView);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
        />
      )}

      <aside
        id="sidebar"
        className={cn(
          'fixed top-0 left-0 bottom-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-72',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* ================= Header / Logo ================= */}
        <div
          className={cn(
            'h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-all duration-200',
            isCollapsed ? 'px-3 justify-center' : 'px-5'
          )}
        >
          <Link
            href="/dashboard"
            onClick={() => {
              setCurrentView('main');
              if (onClose) onClose();
            }}
            className="flex items-center gap-3 no-underline group/logo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="YWCA School Logo"
              className="w-10 h-10 object-contain rounded-xl shrink-0 group-hover/logo:scale-105 transition-transform"
            />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-tight truncate">
                  YWCA School
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Pabna, Bangladesh
                </p>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ================= Navigation Body (Drilldown) ================= */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin">
          {/* 1. ROOT / MAIN VIEW */}
          {currentView === 'main' ? (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
              {/* Direct Link: Dashboard */}
              <Link
                href="/dashboard"
                onClick={() => onClose && onClose()}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 group/item',
                  pathname === '/dashboard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm shadow-indigo-500/5'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? 'Dashboard' : undefined}
              >
                <LayoutDashboard
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    pathname === '/dashboard'
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 group-hover/item:text-slate-600 dark:group-hover/item:text-slate-300'
                  )}
                />
                {!isCollapsed && <span className="truncate">Dashboard</span>}
              </Link>

              {/* Category Triggers (Drilldown) */}
              {navSections.map((section) => {
                const Icon = section.icon;
                const isSectionActive = section.children.some((c) => pathname === c.href);

                return (
                  <div key={section.viewKey} className="relative group/trigger">
                    <button
                      type="button"
                      onClick={() => setCurrentView(section.viewKey)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 group',
                        isSectionActive
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white',
                        isCollapsed && 'justify-center px-0'
                      )}
                      title={isCollapsed ? section.title : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={cn(
                            'w-5 h-5 shrink-0 transition-colors',
                            isSectionActive
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          )}
                        />
                        {!isCollapsed && (
                          <span className="truncate text-left">{section.title}</span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <span className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 transition-colors shrink-0">
                          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                        </span>
                      )}
                    </button>

                    {/* Collapsed Hover Flyout Submenu */}
                    {isCollapsed && (
                      <div className="sidebar-popup-menu hidden group-hover/trigger:block absolute left-full top-0 ml-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 min-w-[210px] z-[9999] pointer-events-auto">
                        <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {section.title}
                        </div>
                        <div className="py-1">
                          {section.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => onClose && onClose()}
                                className={cn(
                                  'flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors',
                                  isChildActive
                                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                )}
                              >
                                <ChildIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                <span>{child.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* 2. SUB-SECTION DRILLDOWN VIEW */
            <div className="space-y-2 animate-in fade-in slide-in-from-right-3 duration-150">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:-translate-x-0.5 transition-all group',
                  isCollapsed && 'justify-center px-0'
                )}
                title="Back to main menu"
              >
                <ArrowLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-1" />
                {!isCollapsed && (
                  <span className="truncate">{activeSection?.title || 'Main Menu'}</span>
                )}
              </button>

              {/* Sub-links */}
              <div className="space-y-1 pt-1">
                {activeSection?.children.map((child) => {
                  const ChildIcon = child.icon;
                  const isChildActive = pathname === child.href;

                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => onClose && onClose()}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group/sub',
                        isChildActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm shadow-indigo-500/5'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white',
                        isCollapsed && 'justify-center px-0'
                      )}
                      title={isCollapsed ? child.title : undefined}
                    >
                      <ChildIcon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isChildActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 group-hover/sub:text-slate-600 dark:group-hover/sub:text-slate-300'
                        )}
                      />
                      {!isCollapsed && <span className="truncate">{child.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* ================= Footer / User Profile & Menu ================= */}
        <div
          ref={footerRef}
          className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative"
        >
          {/* Floating User Profile Dropdown Popover */}
          {userDropdownOpen && (
            <div
              className={cn(
                'absolute bottom-full mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[1100] animate-in fade-in slide-in-from-bottom-2 duration-150',
                isCollapsed ? 'left-2 w-64' : 'left-3 right-3'
              )}
            >
              {/* Header with info */}
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Super Administrator'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'admin@ywcaschool.edu.bd'}
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <Shield className="w-3 h-3" />
                  {user?.role || 'SUPER_ADMIN'}
                </div>
              </div>

              {/* Menu options */}
              <div className="py-1">
                <Link
                  href="/settings/biometric"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    if (onClose) onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Device & Bridge Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* User Bar */}
          <div
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={cn(
              'flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors select-none',
              isCollapsed && 'justify-center p-1'
            )}
            title={isCollapsed ? (user?.name || 'Administrator') : undefined}
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>

            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {user?.name || 'Super Administrator'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.role || 'Super Admin'}
                  </p>
                </div>

                <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <MoreVertical className="w-4 h-4" />
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

