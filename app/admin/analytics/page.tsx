'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler);

function apiRequest(endpoint: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campus_connect_token') : '';
  return fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
}

const badgeEmoji: Record<string, string> = { none: '🌱', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, []);

  async function fetchData() {
    try {
      const res = await apiRequest('/api/analytics');
      const data = await res.json();
      setAnalytics(data.analytics);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;
  if (!analytics) return null;

  const chartDefaults = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } },
  };

  // Badge distribution
  const allAmbassadors = analytics.topPerformers;
  const badgeCounts = { none: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 };
  allAmbassadors.forEach((u: any) => { badgeCounts[u.badge as keyof typeof badgeCounts]++; });

  const badgeData = {
    labels: ['Newcomer', 'Bronze', 'Silver', 'Gold', 'Platinum'],
    datasets: [{
      data: Object.values(badgeCounts),
      backgroundColor: ['rgba(100,116,139,0.6)', 'rgba(180,83,9,0.6)', 'rgba(156,163,175,0.6)', 'rgba(245,158,11,0.6)', 'rgba(139,92,246,0.6)'],
      borderColor: ['#64748b', '#b45309', '#9ca3af', '#f59e0b', '#8b5cf6'],
      borderWidth: 2,
    }],
  };

  const taskCompletionData = {
    labels: analytics.taskStats.slice(0, 5).map((t: any) => t.task.title.slice(0, 20) + '...'),
    datasets: [
      {
        label: 'Submissions',
        data: analytics.taskStats.slice(0, 5).map((t: any) => t.submissions),
        backgroundColor: 'rgba(99,102,241,0.6)',
        borderColor: '#6366f1',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Approved',
        data: analytics.taskStats.slice(0, 5).map((t: any) => t.approved),
        backgroundColor: 'rgba(16,185,129,0.6)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const radarData = {
    labels: ['Active Users', 'Task Completion', 'GitHub Score', 'Engagement', 'Point Distribution', 'Approval Rate'],
    datasets: [{
      label: 'Program Health',
      data: [
        Math.round((analytics.activeAmbassadors / Math.max(analytics.totalAmbassadors, 1)) * 100),
        analytics.completionRate,
        analytics.avgEngagementScore,
        Math.round((analytics.totalTasksCompleted / Math.max(analytics.totalAmbassadors, 1)) * 20),
        Math.min(100, Math.round(analytics.totalPointsDistributed / 100)),
        analytics.completionRate,
      ],
      backgroundColor: 'rgba(99,102,241,0.15)',
      borderColor: '#6366f1',
      pointBackgroundColor: '#6366f1',
      borderWidth: 2,
      pointRadius: 4,
    }],
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Analytics & Insights</h1>
        <p className="text-dark-400 mt-1">Real-time program performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Ambassadors', value: analytics.totalAmbassadors, icon: '👥', color: 'from-primary-600/20 to-primary-700/10', border: 'border-primary-500/20' },
          { label: 'Active Ambassadors', value: analytics.activeAmbassadors, icon: '⚡', color: 'from-emerald-600/20 to-emerald-700/10', border: 'border-emerald-500/20' },
          { label: 'Completion Rate', value: `${analytics.completionRate}%`, icon: '✅', color: 'from-amber-600/20 to-amber-700/10', border: 'border-amber-500/20' },
          { label: 'Points Distributed', value: analytics.totalPointsDistributed.toLocaleString(), icon: '⭐', color: 'from-violet-600/20 to-violet-700/10', border: 'border-violet-500/20' },
        ].map((kpi, i) => (
          <div key={i} className={`p-5 rounded-2xl bg-gradient-to-br ${kpi.color} border ${kpi.border} relative overflow-hidden`}>
            <div className="text-2xl mb-3">{kpi.icon}</div>
            <div className="text-2xl font-display font-bold text-white">{kpi.value}</div>
            <div className="text-sm text-dark-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-display font-bold text-white mb-6">Task Completion Analysis</h2>
          <div style={{ height: '280px' }}>
            <Bar data={taskCompletionData} options={{
              ...chartDefaults,
              scales: {
                x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } },
                y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } },
              },
            }} />
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-display font-bold text-white mb-6">Program Health Radar</h2>
          <div style={{ height: '280px' }}>
            <Radar data={radarData} options={{
              ...chartDefaults,
              scales: {
                r: {
                  ticks: { color: '#64748b', backdropColor: 'transparent' },
                  grid: { color: 'rgba(51,65,85,0.4)' },
                  pointLabels: { color: '#94a3b8', font: { family: 'Inter', size: 10 } },
                  min: 0, max: 100,
                },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-display font-bold text-white mb-6">Badge Distribution</h2>
          <div style={{ height: '220px' }}>
            <Doughnut data={badgeData} options={{ ...chartDefaults, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12 } } } }} />
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-display font-bold text-white mb-6">Top 5 Performers</h2>
          <div className="space-y-4">
            {analytics.topPerformers.slice(0, 5).map((p: any, idx: number) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                  ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : idx === 1 ? 'bg-gray-500/20 text-gray-300' : idx === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-dark-700 text-dark-400'}`}>
                  {['🥇','🥈','🥉','4','5'][idx]}
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {p.avatar || p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-dark-100 text-sm truncate">{p.name}</span>
                    <span className="font-bold text-primary-400 text-sm shrink-0 ml-2">{p.points.toLocaleString()} pts</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-gradient-to-r from-primary-500 to-accent-500"
                      style={{ width: `${(p.points / (analytics.topPerformers[0]?.points || 1)) * 100}%` }} />
                  </div>
                </div>
                <span className="text-lg shrink-0">{badgeEmoji[p.badge]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task table */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-display font-bold text-white mb-6">Task Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Points</th>
                <th>Submissions</th>
                <th>Approved</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {analytics.taskStats.map((ts: any) => (
                <tr key={ts.task.id}>
                  <td className="font-medium text-dark-200">{ts.task.title}</td>
                  <td><span className="text-amber-400 font-bold">⭐ {ts.task.points}</span></td>
                  <td>{ts.submissions}</td>
                  <td><span className="text-emerald-400 font-semibold">{ts.approved}</span></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="progress-bar flex-1" style={{ minWidth: '80px' }}>
                        <div className="progress-bar-fill bg-gradient-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${ts.submissions ? Math.round((ts.approved / ts.submissions) * 100) : 0}%` }} />
                      </div>
                      <span className="text-xs text-dark-400 shrink-0">
                        {ts.submissions ? Math.round((ts.approved / ts.submissions) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
