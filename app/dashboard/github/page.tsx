'use client';

import { useState, useEffect } from 'react';
import Toast, { useToast } from '@/components/Toast';

function apiRequest(endpoint: string, method = 'GET', body?: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campus_connect_token') : '';
  return fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
}

interface GitHubAnalysis {
  score: number;
  username: string;
  avatar: string;
  name: string;
  stats: {
    totalRepos: number;
    totalStars: number;
    followers: number;
    recentCommits: number;
    avgActivity: number;
  };
  strengths: string[];
  improvements: string[];
  archivalSuggestions: string[];
  breakdown: {
    activityScore: number;
    repoScore: number;
    socialScore: number;
    qualityScore: number;
    consistencyScore: number;
  };
  cached?: boolean;
  cachedAt?: string;
}

const DEMO_USERNAMES = ['torvalds', 'mojombo', 'octocat'];

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out', filter: `drop-shadow(0 0 8px ${color}50)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-white">{score}</span>
        <span className="text-xs text-dark-400">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-dark-400">{label}</span>
        <span className="font-bold text-dark-200">{value}/{max}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-bar-fill ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

export default function GitHubAnalyzerPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [username, setUsername] = useState('');
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load existing GitHub score if available
    const stored = localStorage.getItem('campus_connect_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user.github_username) {
        setUsername(user.github_username);
      }
    }
  }, []);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const res = await apiRequest('/api/github', 'POST', { username: username.trim() });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }
      const data = await res.json();
      setAnalysis(data.analysis);
      addToast({ type: 'success', title: '🔬 Analysis Complete!', message: `GitHub score: ${data.analysis.score}/100` });
    } catch (err: any) {
      setError(err.message);
      addToast({ type: 'error', title: 'Analysis Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  const scoreLabel = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-emerald-400' };
    if (score >= 60) return { text: 'Good', color: 'text-primary-400' };
    if (score >= 40) return { text: 'Average', color: 'text-amber-400' };
    return { text: 'Needs Work', color: 'text-red-400' };
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div>
        <h1 className="text-3xl font-display font-bold text-white">🔬 GitHub Profile Analyzer</h1>
        <p className="text-dark-400 mt-1">
          Get an intelligent analysis of your GitHub profile with actionable recommendations
        </p>
      </div>

      {/* Search form */}
      <div className="glass-card p-6">
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g., octocat)"
              className="input-field pl-12 font-mono"
            />
          </div>
          <button type="submit" disabled={loading || !username.trim()} className="btn-primary flex items-center gap-2 whitespace-nowrap px-8">
            {loading ? <><div className="spinner" /> Analyzing...</> : '🔬 Analyze Profile'}
          </button>
        </form>

        {/* Demo users */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-dark-500">Try demo accounts:</span>
          {DEMO_USERNAMES.map(u => (
            <button key={u} onClick={() => setUsername(u)}
              className="text-xs font-mono text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 px-3 py-1 rounded-full transition-colors">
              @{u}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-card p-12 text-center">
          <div className="spinner mx-auto mb-4" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
          <div className="text-dark-300 font-medium">Analyzing @{username}'s GitHub profile...</div>
          <div className="text-dark-500 text-sm mt-1">Fetching repositories, commits, and activity data</div>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-6 animate-fade-in">
          {/* Profile header */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={analysis.avatar}
                  alt={analysis.username}
                  className="w-20 h-20 rounded-2xl border-2 border-dark-600"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${analysis.name}&background=6366f1&color=fff&size=80`;
                  }}
                />
                {analysis.cached && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center" title="Cached result">
                    <span className="text-[10px]">⚡</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-display font-bold text-white">{analysis.name}</h2>
                <a href={`https://github.com/${analysis.username}`} target="_blank" rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 font-mono text-sm transition-colors">
                  @{analysis.username} →
                </a>
                {analysis.cached && (
                  <div className="text-xs text-amber-500/70 mt-1">⚡ Cached result (demo mode)</div>
                )}
              </div>

              {/* Score ring */}
              <div className="text-center shrink-0">
                <ScoreRing score={analysis.score} />
                <div className={`text-lg font-display font-bold mt-2 ${scoreLabel(analysis.score).color}`}>
                  {scoreLabel(analysis.score).text}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-dark-700/50">
              {[
                { label: 'Repositories', value: analysis.stats.totalRepos, icon: '📁' },
                { label: 'Total Stars', value: analysis.stats.totalStars.toLocaleString(), icon: '⭐' },
                { label: 'Followers', value: analysis.stats.followers.toLocaleString(), icon: '👥' },
                { label: 'Recent Commits', value: `~${analysis.stats.recentCommits}`, icon: '💻' },
                { label: 'Activity Rate', value: `${analysis.stats.avgActivity}%`, icon: '📈' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3 bg-dark-800/50 rounded-xl">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className="font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-dark-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score breakdown + Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score breakdown */}
            <div className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-5">📊 Score Breakdown</h3>
              <div className="space-y-4">
                <ScoreBar label="Activity Score" value={analysis.breakdown.activityScore} max={20}
                  color="bg-gradient-to-r from-emerald-500 to-teal-500" />
                <ScoreBar label="Repository Score" value={analysis.breakdown.repoScore} max={25}
                  color="bg-gradient-to-r from-primary-500 to-blue-500" />
                <ScoreBar label="Social Score" value={analysis.breakdown.socialScore} max={25}
                  color="bg-gradient-to-r from-accent-500 to-pink-500" />
                <ScoreBar label="Quality Score" value={analysis.breakdown.qualityScore} max={20}
                  color="bg-gradient-to-r from-amber-500 to-orange-500" />
                <ScoreBar label="Consistency" value={analysis.breakdown.consistencyScore} max={10}
                  color="bg-gradient-to-r from-violet-500 to-purple-500" />
              </div>
              <div className="mt-4 pt-4 border-t border-dark-700/50 flex items-center justify-between">
                <span className="text-sm text-dark-400 font-medium">Total Score</span>
                <span className="text-2xl font-display font-bold gradient-text">{analysis.score}/100</span>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="lg:col-span-2 space-y-4">
              {/* Strengths */}
              <div className="glass-card p-6 border border-emerald-500/10">
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-emerald-400">✅</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
                      <span className="text-dark-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="glass-card p-6 border border-amber-500/10">
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-amber-400">💡</span> Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {analysis.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-amber-400 mt-0.5 shrink-0">→</span>
                      <span className="text-dark-300">{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Archival suggestions */}
          {analysis.archivalSuggestions.length > 0 && (
            <div className="glass-card p-6 border border-red-500/10">
              <h3 className="font-display font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-red-400">🗄️</span> Archival Suggestions
              </h3>
              <p className="text-sm text-dark-400 mb-4">
                These repositories have low activity and may benefit from archiving to keep your profile clean:
              </p>
              <div className="flex flex-wrap gap-3">
                {analysis.archivalSuggestions.map((repo, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="font-mono text-red-300 text-sm">{repo}</span>
                    <a href={`https://github.com/${analysis.username}/${repo}`} target="_blank" rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-400 text-xs">View →</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.archivalSuggestions.length === 0 && (
            <div className="glass-card p-5 border border-emerald-500/10 flex items-center gap-4">
              <div className="text-3xl">🏆</div>
              <div>
                <div className="font-semibold text-emerald-400">No archival needed!</div>
                <div className="text-sm text-dark-400">Your repositories are well-maintained and active.</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
