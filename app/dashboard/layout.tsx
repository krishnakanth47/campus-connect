'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'ambassador';
  points: number;
  badge: string;
  avatar?: string;
  github_score?: number | null;
  github_username?: string | null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('campus_connect_user');
    const token = localStorage.getItem('campus_connect_token');

    if (!storedUser || !token) {
      router.push('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'ambassador') {
        router.push('/admin');
        return;
      }

      // Refresh user data from API
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('campus_connect_user', JSON.stringify(data.user));
          } else {
            setUser(parsedUser);
          }
        })
        .catch(() => setUser(parsedUser));
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow animate-bounce-subtle">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-dark-950">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
