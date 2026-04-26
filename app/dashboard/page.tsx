'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Confetti from '@/components/Confetti';
import { BADGES, getBadgeForPoints, getNextBadge, getProgressToNextBadge } from '@/lib/badges';

function apiRequest(endpoint: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campus_connect_token') : '';
  return fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
}

const badgeEmoji: Record<string, string> = { none: '🌱', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };
const badgeClass: Record<string, string> = { none: 'badge-none', bronze: 'badge-bronze', silver: 'badge-silver', gold: 'badge-gold', platinum: 'badge-platinum' };

export default function AmbassadorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevBadge, setPrevBadge] = useState<string>('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [userRes, tasksRes, leaderRes, subsRes] = await Promise.all([
        apiRequest('/api/auth/me'),
        apiRequest('/api/tasks'),
        apiRequest('/api/leaderboard'),
        apiRequest('/api/submissions'),
      ]);

      const [userData, tasksData, leaderData, subsData] = await Promise.all([
        userRes.json(),
        tasksRes.json(),
        leaderRes.json(),
        subsRes.json(),
      ]);

      if (userData.user) {
        const newBadge = getBadgeForPoints(userData.user.points);
        if (prevBadge && prevBadge !== newBadge && prevBadge !== '') {
          setShowConfetti(true);
        }
        setPrevBadge(newBadge);
        setUser(userData.user);
        localStorage.setItem('campus_connect_user', JSON.stringify(userData.user));
      }
      setTasks(tasksData.tasks || []);
      setLeaderboard(leaderData.leaderboard || []);
      setSubmissions(subsData.submissions || []);
    } catch (err) {
      const stored = localStorage.getItem('campus_connect_user');
      if (stored) setUser(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;

  const currentBadge = user ? getBadgeForPoints(user.points) : 'none';
  const nextBadge = user ? getNextBadge(user.points) : null;
  const progress = user ? getProgressToNextBadge(user.points) : 0;
  const myRank = leaderboard.find(l => l.id === user?.id);
  const approvedSubs = submissions.filter(s => s.status === 'approved');
  const pendingSubs = submissions.filter(s => s.status === 'pending');

  return (
    <div className="space-y-8 animate-fade-in">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span> 👋
          </h1>
          <p className="text-dark-400 mt-1">Keep up the great work on your ambassador journey</p>
        </div>
        <Link href="/dashboard/tasks" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Tasks
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Points', value: user?.points?.toLocaleString() || '0', icon: '⭐', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20', textColor: 'text-amber-400' },
          { label: 'Current Rank', value: myRank ? `#${myRank.rank}` : '—', icon: '🏆', color: 'from-primary-500/20 to-primary-600/10 border-primary-500/20', textColor: 'text-primary-400' },
          { label: 'Tasks Completed', value: approvedSubs.length, icon: '✅', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20', textColor: 'text-emerald-400' },
          { label: 'Pending Review', value: pendingSubs.length, icon: '⏳', color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20', textColor: 'text-violet-400' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-display font-bold ${stat.textColor}`}>{stat.value}</div>
            <div className="text-sm text-dark-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Badge card */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/10 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Current badge */}
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl
              border-2 ${currentBadge === 'platinum' ? 'border-violet-500/50 bg-violet-500/10' :
                currentBadge === 'gold' ? 'border-amber-500/50 bg-amber-500/10' :
                currentBadge === 'silver' ? 'border-gray-400/50 bg-gray-400/10' :
                currentBadge === 'bronze' ? 'border-amber-700/50 bg-amber-700/10' :
                'border-slate-600/50 bg-slate-600/10'
              } shadow-glow`}>
              {badgeEmoji[currentBadge]}
            </div>
            <div>
              <div className="text-xs text-dark-500 font-medium uppercase tracking-wider">Current Badge</div>
              <div className="text-xl font-display font-bold text-white capitalize mt-1">
                {BADGES[currentBadge as keyof typeof BADGES]?.name || 'Newcomer'}
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize mt-1 ${badgeClass[currentBadge]}`}>
                {badgeEmoji[currentBadge]} {currentBadge}
              </span>
            </div>
          </div>

          {/* Progress to next */}
          {nextBadge && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">Progress to {nextBadge.badge.name}</span>
                <span className="text-sm font-bold text-primary-400">
                  {nextBadge.pointsNeeded} pts needed
                </span>
              </div>
              <div className="progress-bar h-3">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-primary-500 to-accent-500 h-3"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-dark-600">{user?.points} pts</span>
                <span className="text-xs text-dark-600">{nextBadge.badge.pointsRequired} pts</span>
              </div>
            </div>
          )}

          {!nextBadge && (
            <div className="flex-1 text-center">
              <div className="text-2xl mb-1">🌟</div>
              <div className="text-lg font-display font-bold gradient-text">Maximum Badge Achieved!</div>
              <div className="text-sm text-dark-400">You're a Platinum Ambassador</div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available tasks */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-bold text-white">📋 Available Tasks</h2>
            <Link href="/dashboard/tasks" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 4).map(task => {
              const mySubmission = submissions.find(s => s.task_id === task.id);
              return (
                <div key={task.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors group">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="font-semibold text-dark-100 truncate">{task.title}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-amber-400 font-semibold">⭐ {task.points} pts</span>
                      <span className="text-xs text-dark-500">
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {mySubmission ? (
                    <span className={
                      mySubmission.status === 'approved' ? 'status-approved' :
                      mySubmission.status === 'pending' ? 'status-pending' : 'status-rejected'
                    }>
                      {mySubmission.status === 'approved' ? '✅ Done' : mySubmission.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                    </span>
                  ) : (
                    <Link href="/dashboard/tasks"
                      className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0">
                      Submit
                    </Link>
                  )}
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-dark-500">No tasks available yet</div>
            )}
          </div>
        </div>

        {/* Mini leaderboard */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-bold text-white">🏆 Top Ambassadors</h2>
            <Link href="/dashboard/leaderboard" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
              Full →
            </Link>
          </div>
          <div className="space-y-3">
            {leaderboard.slice(0, 6).map((amb, idx) => (
              <div key={amb.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors
                  ${amb.id === user?.id ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-dark-800/50'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                  ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : idx === 1 ? 'bg-gray-500/20 text-gray-300' : idx === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-dark-700 text-dark-500'}`}>
                  {idx < 3 ? ['🥇','🥈','🥉'][idx] : idx + 1}
                </div>
                <div className="w-7 h-7 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {amb.avatar || amb.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold truncate ${amb.id === user?.id ? 'text-primary-300' : 'text-dark-200'}`}>
                    {amb.name} {amb.id === user?.id && '(You)'}
                  </div>
                </div>
                <div className="text-xs font-bold text-amber-400 shrink-0">{amb.points.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* GitHub score card */}
          {user?.github_score ? (
            <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-400">🔬 GitHub Score</span>
                <span className="text-sm font-bold text-violet-400">{user.github_score}/100</span>
              </div>
              <div className="progress-bar mt-2">
                <div className="progress-bar-fill bg-gradient-to-r from-violet-500 to-purple-500"
                  style={{ width: `${user.github_score}%` }} />
              </div>
            </div>
          ) : (
            <Link href="/dashboard/github"
              className="flex items-center gap-2 mt-4 p-3 bg-dark-800/50 hover:bg-dark-800 border border-dark-700 hover:border-primary-500/30 rounded-xl transition-all text-sm text-dark-400 hover:text-dark-200">
              <span>🔬</span>
              <span>Analyze your GitHub profile</span>
              <span className="ml-auto">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
