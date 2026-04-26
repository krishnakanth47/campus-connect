'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function apiRequest(endpoint: string, method = 'GET', body?: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campus_connect_token') : '';
  return fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

interface Analytics {
  totalAmbassadors: number;
  activeAmbassadors: number;
  totalTasksCompleted: number;
  avgEngagementScore: number;
  totalPointsDistributed: number;
  completionRate: number;
  topPerformers: Array<{
    id: number;
    name: string;
    points: number;
    badge: string;
    avatar: string;
    github_score: number | null;
  }>;
  taskStats: Array<{
    task: { id: number; title: string; points: number };
    submissions: number;
    approved: number;
  }>;
  pendingSubmissions: number;
}

const badgeEmoji: Record<string, string> = {
  none: '🌱', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎'
};

const badgeClass: Record<string, string> = {
  none: 'badge-none', bronze: 'badge-bronze', silver: 'badge-silver',
  gold: 'badge-gold', platinum: 'badge-platinum'
};

function StatCard({ label, value, icon, subtitle, color, trend }: {
  label: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  color: string;
  trend?: string;
}) {
  return (
    <div className="stat-card group hover:border-dark-600/50 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${color}`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color} bg-opacity-20`}
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            {icon}
          </div>
          {trend && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full font-semibold">{trend}</span>
          )}
        </div>
        <div className="text-3xl font-display font-bold text-white mb-1 animate-count-up">{value}</div>
        <div className="text-sm font-semibold text-dark-200">{label}</div>
        {subtitle && <div className="text-xs text-dark-500 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchAnalytics() {
    try {
      const res = await apiRequest('/api/analytics');
      if (!res.ok) throw new Error('Failed to load analytics');
      const data = await res.json();
      setAnalytics(data.analytics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (!analytics) return null;

  // Chart data
  const taskBarData = {
    labels: analytics.taskStats.slice(0, 6).map(t => t.task.title.slice(0, 25) + (t.task.title.length > 25 ? '...' : '')),
    datasets: [
      {
        label: 'Total Submissions',
        data: analytics.taskStats.slice(0, 6).map(t => t.submissions),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Approved',
        data: analytics.taskStats.slice(0, 6).map(t => t.approved),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const submissionDoughnutData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          analytics.totalTasksCompleted,
          analytics.pendingSubmissions,
          Math.max(0, analytics.totalTasksCompleted + analytics.pendingSubmissions - analytics.totalTasksCompleted),
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter' } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Inter' } },
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94a3b8', font: { family: 'Inter' }, padding: 16 },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
          <p className="text-dark-400 mt-1">Overview of your ambassador program performance</p>
        </div>
        <div className="flex gap-3">
          {analytics.pendingSubmissions > 0 && (
            <Link href="/admin/submissions"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-sm font-semibold hover:bg-amber-500/20 transition-colors">
              <span className="w-5 h-5 bg-amber-500 text-dark-900 rounded-full flex items-center justify-center text-xs font-bold">
                {analytics.pendingSubmissions}
              </span>
              Pending Reviews
            </Link>
          )}
          <Link href="/admin/tasks"
            className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Ambassadors"
          value={analytics.totalAmbassadors}
          icon="👥"
          subtitle={`${analytics.activeAmbassadors} active`}
          color="bg-primary-500"
          trend={`${analytics.activeAmbassadors} active`}
        />
        <StatCard
          label="Tasks Completed"
          value={analytics.totalTasksCompleted}
          icon="✅"
          subtitle={`${analytics.completionRate}% completion rate`}
          color="bg-emerald-500"
          trend={`${analytics.completionRate}%`}
        />
        <StatCard
          label="Points Distributed"
          value={analytics.totalPointsDistributed.toLocaleString()}
          icon="⭐"
          subtitle="Total across all ambassadors"
          color="bg-amber-500"
        />
        <StatCard
          label="Avg GitHub Score"
          value={`${analytics.avgEngagementScore}/100`}
          icon="🔬"
          subtitle="Technical readiness index"
          color="bg-violet-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-display font-bold text-white mb-6">Task Performance Overview</h2>
          <div className="chart-container" style={{ height: '260px' }}>
            <Bar data={taskBarData} options={{ ...chartOptions, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Doughnut */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-display font-bold text-white mb-6">Submission Status</h2>
          <div className="chart-container" style={{ height: '260px' }}>
            <Doughnut data={submissionDoughnutData} options={{ ...doughnutOptions, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Top performers + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-bold text-white">🏆 Top Performers</h2>
            <Link href="/admin/ambassadors" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {analytics.topPerformers.map((performer, idx) => (
              <div key={performer.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800/50 transition-colors group">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
                  ${idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                    idx === 1 ? 'bg-gray-500/20 text-gray-300' :
                    idx === 2 ? 'bg-amber-700/20 text-amber-600' :
                    'bg-dark-700 text-dark-400'}`}>
                  {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${idx + 1}`}
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {performer.avatar || performer.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-dark-100 truncate">{performer.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeClass[performer.badge] || 'badge-none'}`}>
                      {badgeEmoji[performer.badge]} {performer.badge}
                    </span>
                    {performer.github_score && (
                      <span className="text-xs text-dark-500">GitHub: {performer.github_score}/100</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-primary-400">{performer.points.toLocaleString()}</div>
                  <div className="text-xs text-dark-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-display font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: '/admin/tasks', icon: '📋', label: 'Create New Task', desc: 'Assign work to ambassadors', color: 'from-primary-600/20 to-primary-700/20 border-primary-500/20 hover:border-primary-500/40' },
              { href: '/admin/submissions', icon: '📥', label: 'Review Submissions', desc: `${analytics.pendingSubmissions} pending`, color: 'from-amber-600/20 to-amber-700/20 border-amber-500/20 hover:border-amber-500/40' },
              { href: '/admin/analytics', icon: '📊', label: 'Full Analytics', desc: 'Detailed insights & reports', color: 'from-emerald-600/20 to-emerald-700/20 border-emerald-500/20 hover:border-emerald-500/40' },
              { href: '/admin/ambassadors', icon: '👥', label: 'Manage Ambassadors', desc: `${analytics.totalAmbassadors} registered`, color: 'from-violet-600/20 to-violet-700/20 border-violet-500/20 hover:border-violet-500/40' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${item.color} border transition-all duration-200 hover:-translate-y-0.5 group`}>
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-dark-200 group-hover:text-white transition-colors">{item.label}</div>
                  <div className="text-xs text-dark-500">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Completion rate */}
          <div className="mt-6 p-4 bg-dark-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-300 font-medium">Overall Completion</span>
              <span className="text-sm font-bold text-primary-400">{analytics.completionRate}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill bg-gradient-to-r from-primary-500 to-accent-500"
                style={{ width: `${analytics.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
