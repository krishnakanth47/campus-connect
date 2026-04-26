'use client';

import { useState, useEffect } from 'react';
import Toast, { useToast } from '@/components/Toast';
import { format } from 'date-fns';

function apiRequest(endpoint: string, method = 'GET', body?: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campus_connect_token') : '';
  return fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
}

interface Submission {
  id: number;
  user_id: number;
  task_id: number;
  proof: string;
  proof_type: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  auto_verified: boolean;
  user: { id: number; name: string; email: string; avatar: string; badge: string } | null;
  task: { id: number; title: string; points: number; required_keyword: string | null } | null;
}

const badgeEmoji: Record<string, string> = { none: '🌱', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };
const badgeClass: Record<string, string> = { none: 'badge-none', bronze: 'badge-bronze', silver: 'badge-silver', gold: 'badge-gold', platinum: 'badge-platinum' };

export default function AdminSubmissionsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewModal, setReviewModal] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => { fetchSubmissions(); }, []);

  async function fetchSubmissions() {
    try {
      const res = await apiRequest('/api/submissions');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(action: 'approve' | 'reject') {
    if (!reviewModal) return;
    setReviewing(true);
    try {
      const res = await apiRequest(`/api/submissions/${reviewModal.id}`, 'PATCH', { action, feedback });
      if (!res.ok) throw new Error('Review failed');
      const data = await res.json();
      setSubmissions(prev => prev.map(s => s.id === reviewModal.id ? { ...s, ...data.submission } : s));
      setReviewModal(null);
      setFeedback('');
      addToast({
        type: action === 'approve' ? 'success' : 'warning',
        title: action === 'approve' ? '✅ Submission Approved' : '❌ Submission Rejected',
        message: data.message,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setReviewing(false);
    }
  }

  const filtered = submissions.filter(s => filter === 'all' || s.status === filter);
  const counts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div>
        <h1 className="text-3xl font-display font-bold text-white">Submission Review</h1>
        <p className="text-dark-400 mt-1">Review and approve ambassador submissions</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              filter === f
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700'
            }`}>
            <span className="capitalize">{f}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
              filter === f ? 'bg-white/20' : 'bg-dark-700'
            }`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ambassador</th>
                  <th>Task</th>
                  <th>Proof</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => (
                  <tr key={sub.id} className="transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {sub.user?.avatar || sub.user?.name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-dark-100 text-sm">{sub.user?.name || 'Unknown'}</div>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${badgeClass[sub.user?.badge || 'none']}`}>
                            {badgeEmoji[sub.user?.badge || 'none']} {sub.user?.badge || 'none'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-dark-200 text-sm max-w-48 truncate">{sub.task?.title || 'Deleted Task'}</div>
                        <div className="text-xs text-amber-400 font-semibold">⭐ {sub.task?.points || 0} pts</div>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-48">
                        {sub.proof_type === 'link' ? (
                          <a href={sub.proof} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary-400 hover:text-primary-300 underline truncate block font-mono">
                            {sub.proof.slice(0, 40)}{sub.proof.length > 40 ? '...' : ''}
                          </a>
                        ) : (
                          <span className="text-xs text-dark-300 font-mono bg-dark-800 px-2 py-1 rounded-lg">
                            📎 {sub.proof}
                          </span>
                        )}
                        {sub.auto_verified && (
                          <span className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                            ⚡ Auto-verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-xs text-dark-400">
                        {format(new Date(sub.submitted_at), 'MMM dd, HH:mm')}
                      </div>
                    </td>
                    <td>
                      {sub.status === 'pending' && <span className="status-pending">⏳ Pending</span>}
                      {sub.status === 'approved' && <span className="status-approved">✅ Approved</span>}
                      {sub.status === 'rejected' && <span className="status-rejected">❌ Rejected</span>}
                    </td>
                    <td>
                      {sub.status === 'pending' ? (
                        <button onClick={() => { setReviewModal(sub); setFeedback(''); }}
                          className="btn-primary px-3 py-1.5 text-xs">
                          Review
                        </button>
                      ) : (
                        <button onClick={() => { setReviewModal(sub); setFeedback(sub.feedback || ''); }}
                          className="btn-secondary px-3 py-1.5 text-xs">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-dark-500">
                      <div className="text-4xl mb-2">📭</div>
                      <div>No {filter === 'all' ? '' : filter} submissions</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-8 shadow-glass animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-white">
                {reviewModal.status === 'pending' ? 'Review Submission' : 'Submission Details'}
              </h2>
              <button onClick={() => setReviewModal(null)} className="text-dark-400 hover:text-dark-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Submission info */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-dark-800/50 rounded-xl">
                <div className="text-xs text-dark-500 mb-1">Ambassador</div>
                <div className="font-semibold text-dark-100">{reviewModal.user?.name}</div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl">
                <div className="text-xs text-dark-500 mb-1">Task</div>
                <div className="font-semibold text-dark-100">{reviewModal.task?.title}</div>
                <div className="text-sm text-amber-400 mt-0.5">⭐ {reviewModal.task?.points} points</div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl">
                <div className="text-xs text-dark-500 mb-1">Proof Submitted</div>
                {reviewModal.proof_type === 'link' ? (
                  <a href={reviewModal.proof} target="_blank" rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 text-sm break-all underline">
                    {reviewModal.proof}
                  </a>
                ) : (
                  <span className="text-dark-300 text-sm font-mono">📎 {reviewModal.proof}</span>
                )}
                {reviewModal.task?.required_keyword && (
                  <div className="mt-2 text-xs text-dark-500">
                    Required keyword: <span className="text-primary-400 font-mono">{reviewModal.task.required_keyword}</span>
                    {reviewModal.auto_verified && <span className="ml-2 text-emerald-400">⚡ Auto-detected</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <label className="input-label">Feedback <span className="text-dark-500 font-normal">(optional)</span></label>
              <textarea
                rows={3}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Great work! / Please resubmit with..."
                className="input-field resize-none"
                readOnly={reviewModal.status !== 'pending'}
              />
            </div>

            {reviewModal.status === 'pending' ? (
              <div className="flex gap-3">
                <button onClick={() => handleReview('reject')} disabled={reviewing} className="btn-danger flex-1">
                  ❌ Reject
                </button>
                <button onClick={() => handleReview('approve')} disabled={reviewing} className="btn-success flex-1">
                  {reviewing ? <div className="spinner mx-auto" /> : '✅ Approve & Award Points'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <span className="text-sm text-dark-400">Status</span>
                {reviewModal.status === 'approved' ? <span className="status-approved">✅ Approved</span> : <span className="status-rejected">❌ Rejected</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
