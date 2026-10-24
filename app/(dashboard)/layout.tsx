'use client';

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Always reset scroll to top when navigating to any page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  // Monitor scroll position for Scroll-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 160);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const saved = localStorage.getItem('ywca-sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('ywca-sidebar-collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch {
        // ignore
      }
    }
    fetchMe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col print:bg-white print:min-h-0 print:block">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        user={user}
      />
      <div
        className={cn(
          'flex flex-col flex-1 transition-all duration-300 ease-in-out print:pl-0 print:m-0 print:w-full print:block',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <div className="no-print">
          <Navbar
            onOpenSidebar={() => setSidebarOpen(true)}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
            user={user}
          />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full print:p-0 print:m-0 print:w-full print:max-w-none print:block">
          {children}
        </main>
        <footer className="no-print py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          © {new Date().getFullYear()} YWCA Nursery School, Pabna. Developed by{' '}
          <a
            href="https://www.codenextit.com"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 font-medium hover:underline"
          >
            CodeNext IT
          </a>
        </footer>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          title="Scroll to Top"
          className="no-print fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer animate-in fade-in zoom-in-75 duration-200"
          aria-label="Scroll to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

