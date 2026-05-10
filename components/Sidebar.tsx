'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '@/logo.png';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'ambassador';
  points?: number;
  badge?: string;
  avatar?: string;
  github_score?: number | null;
}

interface SidebarProps {
  user: User;
}

const adminNavItems = [
  { href: '/admin', icon: '🏠', label: 'Dashboard', exact: true },
  { href: '/admin/tasks', icon: '📋', label: 'Task Manager' },
  { href: '/admin/submissions', icon: '📥', label: 'Submissions' },
  { href: '/admin/analytics', icon: '📊', label: 'Analytics' },
  { href: '/admin/ambassadors', icon: '👥', label: 'Ambassadors' },
];

const ambassadorNavItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard', exact: true },
  { href: '/dashboard/tasks', icon: '📋', label: 'My Tasks' },
  { href: '/dashboard/submissions', icon: '📤', label: 'My Submissions' },
  { href: '/dashboard/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { href: '/dashboard/github', icon: '🔬', label: 'GitHub Analyzer' },
];

function BadgePill({ badge }: { badge: string }) {
  const configs: Record<string, { emoji: string; className: string }> = {
    none: { emoji: '🌱', className: 'badge-none' },
    bronze: { emoji: '🥉', className: 'badge-bronze' },
    silver: { emoji: '🥈', className: 'badge-silver' },
    gold: { emoji: '🥇', className: 'badge-gold' },
    platinum: { emoji: '💎', className: 'badge-platinum' },
  };
  const config = configs[badge] || configs.none;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${config.className}`}>
      {config.emoji} {badge}
    </span>
  );
}

export default function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user.role === 'admin' ? adminNavItems : ambassadorNavItems;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('campus_connect_token');
    localStorage.removeItem('campus_connect_user');
    router.push('/');
  };

  const avatarInitials = user.avatar || user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center hover:bg-dark-700 transition-colors"
      >
        <svg className="w-5 h-5 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        bg-dark-900/95 backdrop-blur-md border-r border-dark-700/50
        transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-dark-700/50 min-h-[72px]">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <Image src={logo} alt="Campus Connect Logo" className="w-9 h-9 object-contain shrink-0" priority />
              <div>
                <div className="text-sm font-display font-bold text-white">Campus Connect</div>
                <div className="text-[10px] text-dark-500 capitalize">{user.role} Portal</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto">
              <Image src={logo} alt="Campus Connect Logo" className="w-9 h-9 object-contain" priority />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-dark-800 hover:bg-dark-700 items-center justify-center transition-colors text-dark-400"
          >
            <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-200 cursor-pointer
                ${isActive(item.href, item.exact)
                  ? 'text-primary-300 bg-primary-500/10 border border-primary-500/20'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/80'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-dark-700/50">
          {!collapsed ? (
            <div className="p-3 rounded-xl bg-dark-800/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-dark-100 truncate">{user.name}</div>
                  <div className="text-xs text-dark-500 truncate">{user.email}</div>
                </div>
              </div>
              {user.role === 'ambassador' && (
                <div className="flex items-center justify-between">
                  <BadgePill badge={user.badge || 'none'} />
                  <span className="text-xs font-semibold text-primary-400">{user.points?.toLocaleString()} pts</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main content spacer */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
}
