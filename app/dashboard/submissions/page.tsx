'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

function apiRequest(endpoint: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campus_connect_token') : '';
  return fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
}

export default function AmbassadorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await apiRequest('/api/submissions');
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const stats = {
    total: submissions.length,
    approved: submissions.filter(s => s.status === 'approved').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">My Submissions</h1>
        <p className="text-dark-400 mt-1">Track all your proof submissions and their review status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-dark-700/50', icon: '📤' },
          { label: 'Approved', value: stats.approved, color: 'from-emerald-600/20', icon: '✅' },
          { label: 'Pending', value: stats.pending, color: 'from-amber-600/20', icon: '⏳' },
          { label: 'Rejected', value: stats.rejected, color: 'from-red-600/20', icon: '❌' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br ${s.color} to-transparent border border-dark-700/50`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-display font-bold text-white">{s.value}</div>
            <div className="text-sm text-dark-400">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-display font-bold text-dark-300 mb-2">No submissions yet</h3>
          <p className="text-dark-500">Complete tasks and submit proof to see your history here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div key={sub.id} className={`glass-card p-5 border-l-4 ${
              sub.status === 'approved' ? 'border-l-emerald-500' :
              sub.status === 'pending' ? 'border-l-amber-500' :
              'border-l-red-500'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display font-bold text-dark-100">{sub.task?.title || 'Deleted Task'}</h3>
                    {sub.auto_verified && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        ⚡ Auto-verified
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                    <span className="text-amber-400 font-semibold">⭐ {sub.task?.points || 0} pts</span>
                    <span className="text-dark-500 text-xs">{format(new Date(sub.submitted_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>

                  {/* Proof */}
                  <div className="flex items-start gap-2">
                    <span className="text-dark-500 text-xs mt-0.5">Proof:</span>
                    {sub.proof_type === 'link' ? (
                      <a href={sub.proof} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary-400 hover:text-primary-300 underline break-all">
                        {sub.proof}
                      </a>
                    ) : (
                      <span className="text-xs text-dark-300 font-mono bg-dark-800 px-2 py-0.5 rounded">📎 {sub.proof}</span>
                    )}
                  </div>

                  {/* Feedback */}
                  {sub.feedback && (
                    <div className={`mt-3 p-3 rounded-xl text-xs ${
                      sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-300' :
                      sub.status === 'rejected' ? 'bg-red-500/10 text-red-300' :
                      'bg-dark-800 text-dark-400'
                    }`}>
                      <span className="font-semibold">Admin feedback: </span>{sub.feedback}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {sub.status === 'pending' && <span className="status-pending">⏳ Pending Review</span>}
                  {sub.status === 'approved' && <span className="status-approved">✅ Approved</span>}
                  {sub.status === 'rejected' && <span className="status-rejected">❌ Rejected</span>}
                  {sub.reviewed_at && (
                    <span className="text-xs text-dark-600">
                      Reviewed {format(new Date(sub.reviewed_at), 'MMM dd')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
