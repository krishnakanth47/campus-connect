'use client';

import { useState, useEffect } from 'react';

function apiRequest(endpoint: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campus_connect_token') : '';
  return fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
}

const badgeEmoji: Record<string, string> = { none: '🌱', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };
const badgeClass: Record<string, string> = { none: 'badge-none', bronze: 'badge-bronze', silver: 'badge-silver', gold: 'badge-gold', platinum: 'badge-platinum' };

export default function AdminAmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      const res = await apiRequest('/api/leaderboard');
      const data = await res.json();
      setAmbassadors(data.leaderboard || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = ambassadors.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Ambassador Registry</h1>
        <p className="text-dark-400 mt-1">All registered ambassadors and their performance</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search ambassadors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 glass-card">
          <span className="text-dark-400 text-sm">{filtered.length} ambassadors</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Ambassador</th>
                <th>Badge</th>
                <th>Points</th>
                <th>GitHub Score</th>
                <th>GitHub Username</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className={`font-bold text-lg ${a.rank <= 3 ? 'text-amber-400' : 'text-dark-500'}`}>
                      {a.rank <= 3 ? ['🥇','🥈','🥉'][a.rank-1] : `#${a.rank}`}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {a.avatar || a.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-dark-100">{a.name}</div>
                        <div className="text-xs text-dark-500">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${badgeClass[a.badge]}`}>
                      {badgeEmoji[a.badge]} {a.badge}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div className="font-bold text-primary-400">{a.points.toLocaleString()}</div>
                      <div className="progress-bar mt-1 w-20">
                        <div className="progress-bar-fill bg-gradient-to-r from-primary-500 to-accent-500"
                          style={{ width: `${Math.min(100, (a.points / 1200) * 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    {a.github_score !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-16">
                          <div className="progress-bar-fill bg-gradient-to-r from-violet-500 to-purple-500"
                            style={{ width: `${a.github_score}%` }} />
                        </div>
                        <span className="text-sm font-bold text-violet-400">{a.github_score}/100</span>
                      </div>
                    ) : (
                      <span className="text-xs text-dark-600">Not analyzed</span>
                    )}
                  </td>
                  <td>
                    {a.github_username ? (
                      <a href={`https://github.com/${a.github_username}`} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary-400 hover:text-primary-300 font-mono flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        @{a.github_username}
                      </a>
                    ) : (
                      <span className="text-xs text-dark-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-dark-500">No ambassadors found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
