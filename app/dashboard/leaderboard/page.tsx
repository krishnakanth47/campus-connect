'use client';

import { useState, useEffect } from 'react';
import Confetti from '@/components/Confetti';
import { BADGES } from '@/lib/badges';

function apiRequest(endpoint: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campus_connect_token') : '';
  return fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
}

const badgeEmoji: Record<string, string> = { none: '🌱', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };
const badgeClass: Record<string, string> = { none: 'badge-none', bronze: 'badge-bronze', silver: 'badge-silver', gold: 'badge-gold', platinum: 'badge-platinum' };
const rankColors = ['text-amber-400', 'text-gray-300', 'text-amber-600'];
const rankBg = ['bg-amber-500/20', 'bg-gray-400/20', 'bg-amber-700/20'];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('campus_connect_user');
    if (stored) setCurrentUser(JSON.parse(stored));

    async function fetchData() {
      const res = await apiRequest('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const myEntry = leaderboard.find(l => l.id === currentUser?.id);

  return (
    <div className="space-y-8 animate-fade-in">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">🏆 Leaderboard</h1>
          <p className="text-dark-400 mt-1">See where you stand among all campus ambassadors</p>
        </div>
        <button onClick={() => setShowConfetti(true)}
          className="btn-secondary text-sm px-4 py-2">
          🎉 Celebrate
        </button>
      </div>

      {/* My position card */}
      {myEntry && (
        <div className="glass-card p-5 border border-primary-500/30 bg-primary-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Your Position</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold
              ${myEntry.rank <= 3 ? `${rankBg[myEntry.rank - 1]} ${rankColors[myEntry.rank - 1]}` : 'bg-dark-700 text-dark-300'}`}>
              {myEntry.rank <= 3 ? ['🥇','🥈','🥉'][myEntry.rank-1] : `#${myEntry.rank}`}
            </div>
            <div>
              <div className="text-xl font-display font-bold text-white">{myEntry.name}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-primary-400">{myEntry.points.toLocaleString()}</span>
                <span className="text-dark-400 text-sm">points</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${badgeClass[myEntry.badge]}`}>
                  {badgeEmoji[myEntry.badge]} {myEntry.badge}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { ...leaderboard[1], podiumHeight: 'h-24', podiumRank: 2 },
            { ...leaderboard[0], podiumHeight: 'h-32', podiumRank: 1 },
            { ...leaderboard[2], podiumHeight: 'h-16', podiumRank: 3 },
          ].map((item, i) => (
            <div key={item.id} className="flex flex-col items-center">
              {/* Avatar */}
              <div className={`w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white mb-2 shadow-glow
                ${item.id === currentUser?.id ? 'ring-2 ring-primary-500' : ''}`}>
                {item.avatar || item.name[0]}
              </div>
              <div className="text-xs font-semibold text-dark-300 mb-1 text-center truncate w-full px-1">{item.name}</div>
              <div className="text-xs text-amber-400 font-bold mb-2">{item.points.toLocaleString()} pts</div>
              {/* Podium block */}
              <div className={`w-full ${item.podiumHeight} rounded-t-xl flex items-center justify-center text-2xl
                ${item.podiumRank === 1 ? 'bg-gradient-to-t from-amber-700/60 to-amber-500/40 border border-amber-500/30' :
                  item.podiumRank === 2 ? 'bg-gradient-to-t from-gray-700/60 to-gray-500/40 border border-gray-500/30' :
                  'bg-gradient-to-t from-amber-900/60 to-amber-700/40 border border-amber-700/30'}`}>
                {['🥇','🥈','🥉'][item.podiumRank - 1]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full leaderboard table */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16">Rank</th>
                <th>Ambassador</th>
                <th>Badge</th>
                <th>Points</th>
                <th>GitHub Score</th>
                <th className="hidden md:table-cell">Progress</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.id}
                  className={entry.id === currentUser?.id ? 'bg-primary-500/5' : ''}>
                  <td>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm
                      ${entry.rank === 1 ? `${rankBg[0]} ${rankColors[0]}` :
                        entry.rank === 2 ? `${rankBg[1]} ${rankColors[1]}` :
                        entry.rank === 3 ? `${rankBg[2]} ${rankColors[2]}` :
                        'bg-dark-800 text-dark-400'}`}>
                      {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : `#${entry.rank}`}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {entry.avatar || entry.name[0]}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${entry.id === currentUser?.id ? 'text-primary-300' : 'text-dark-100'}`}>
                          {entry.name} {entry.id === currentUser?.id && <span className="text-xs text-primary-500">(You)</span>}
                        </div>
                        {entry.github_username && (
                          <a href={`https://github.com/${entry.github_username}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-dark-500 hover:text-primary-400 font-mono">
                            @{entry.github_username}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${badgeClass[entry.badge]}`}>
                      {badgeEmoji[entry.badge]} {entry.badge}
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-primary-400">{entry.points.toLocaleString()}</span>
                  </td>
                  <td>
                    {entry.github_score ? (
                      <span className="text-sm font-semibold text-violet-400">{entry.github_score}/100</span>
                    ) : (
                      <span className="text-xs text-dark-600">—</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="progress-bar flex-1 min-w-[80px]">
                        <div className="progress-bar-fill bg-gradient-to-r from-primary-500 to-accent-500"
                          style={{ width: `${Math.min(100, (entry.points / (leaderboard[0]?.points || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Badge legend */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-display font-bold text-white mb-4">Badge Requirements</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(BADGES).map(badge => (
            <div key={badge.tier} className={`p-3 rounded-xl text-center border ${badgeClass[badge.tier]}`}>
              <div className="text-2xl mb-1">{badgeEmoji[badge.tier]}</div>
              <div className="text-xs font-bold capitalize mb-0.5">{badge.tier}</div>
              <div className="text-xs text-dark-500">
                {badge.pointsRequired === 0 ? 'Starting badge' : `${badge.pointsRequired}+ pts`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
