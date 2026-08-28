'use client';

import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Menu, PanelLeftClose, PanelLeftOpen, Search, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: any;
}

export default function Navbar({
  onOpenSidebar,
  isCollapsed = false,
  onToggleCollapse,
  user,
}: NavbarProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-3 sm:px-5 lg:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Desktop collapse toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all items-center justify-center cursor-pointer"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Dynamic Breadcrumbs Navigation */}
        <div className="flex items-center pl-1 sm:pl-2.5 border-l border-slate-200 dark:border-slate-800 h-6">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-500 text-xs w-60">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, roll, phone..."
            className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">{user?.role || 'Super Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

