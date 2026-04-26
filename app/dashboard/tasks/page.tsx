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

interface Task {
  id: number;
  title: string;
  description: string;
  points: number;
  deadline: string;
  required_keyword: string | null;
  proof_type: 'screenshot' | 'link' | 'file';
  submission_status: string | null;
  submission_id: number | null;
}

const proofTypeConfig = {
  link: { icon: '🔗', label: 'Link Submission', placeholder: 'https://linkedin.com/posts/your-post' },
  screenshot: { icon: '🖼️', label: 'Screenshot Upload', placeholder: 'Enter filename or image URL' },
  file: { icon: '📁', label: 'File Upload', placeholder: 'Enter filename or document URL' },
};

export default function AmbassadorTasksPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState<Task | null>(null);
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'available'>('all');

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    try {
      const res = await apiRequest('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submitModal || !proof.trim()) return;
    setSubmitting(true);

    try {
      const res = await apiRequest('/api/submissions', 'POST', {
        task_id: submitModal.id,
        proof: proof.trim(),
        proof_type: submitModal.proof_type,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit');
      }

      const data = await res.json();
      await fetchTasks();
      setSubmitModal(null);
      setProof('');

      addToast({
        type: data.autoVerified ? 'success' : 'info',
        title: data.autoVerified ? '⚡ Auto-Verified!' : '📤 Submission Received',
        message: data.message,
        duration: 6000,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Submission Failed', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const isDeadlinePast = (deadline: string) => new Date(deadline) < new Date();
  const deadlineSoon = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  };

  const filtered = tasks.filter(t => {
    if (filter === 'available') return !t.submission_status;
    if (filter === 'pending') return t.submission_status === 'pending';
    if (filter === 'completed') return t.submission_status === 'approved';
    return true;
  });

  const counts = {
    all: tasks.length,
    available: tasks.filter(t => !t.submission_status).length,
    pending: tasks.filter(t => t.submission_status === 'pending').length,
    completed: tasks.filter(t => t.submission_status === 'approved').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div>
        <h1 className="text-3xl font-display font-bold text-white">My Tasks</h1>
        <p className="text-dark-400 mt-1">Complete tasks to earn points and climb the leaderboard</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'available', 'pending', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700'
            }`}>
            <span className="capitalize">{f}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${filter === f ? 'bg-white/20' : 'bg-dark-700'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(task => {
            const past = isDeadlinePast(task.deadline);
            const soon = deadlineSoon(task.deadline);
            const canSubmit = !task.submission_status && !past;

            return (
              <div key={task.id}
                className={`glass-card p-5 flex flex-col transition-all duration-300 hover:-translate-y-1
                  ${task.submission_status === 'approved' ? 'border-emerald-500/20' :
                    task.submission_status === 'pending' ? 'border-amber-500/20' : ''}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{proofTypeConfig[task.proof_type].icon}</span>
                    {task.required_keyword && (
                      <span className="text-xs bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full font-mono">
                        ⚡ auto-verify
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-400">⭐ {task.points}</div>
                    <div className="text-xs text-dark-500">points</div>
                  </div>
                </div>

                <h3 className="font-display font-bold text-dark-100 mb-2 leading-tight">{task.title}</h3>
                <p className="text-sm text-dark-400 mb-4 line-clamp-3 flex-1">{task.description}</p>

                {/* Deadline */}
                <div className={`flex items-center gap-2 text-xs mb-4 ${
                  past ? 'text-red-400' : soon ? 'text-amber-400' : 'text-dark-500'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {past ? 'Deadline passed' : soon ? `Due soon: ${format(new Date(task.deadline), 'MMM dd')}` : `Due: ${format(new Date(task.deadline), 'MMM dd, yyyy')}`}
                </div>

                {/* Action */}
                {task.submission_status === 'approved' ? (
                  <span className="status-approved justify-center py-2 text-sm">✅ Completed — Points Awarded</span>
                ) : task.submission_status === 'pending' ? (
                  <span className="status-pending justify-center py-2 text-sm">⏳ Awaiting Review</span>
                ) : task.submission_status === 'rejected' ? (
                  <button onClick={() => { setSubmitModal(task); setProof(''); }}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-semibold">
                    ❌ Rejected — Resubmit
                  </button>
                ) : canSubmit ? (
                  <button onClick={() => { setSubmitModal(task); setProof(''); }}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Submit Proof
                  </button>
                ) : (
                  <span className="text-center text-xs text-dark-600 py-2">Deadline passed</span>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-5xl mb-4">
                {filter === 'completed' ? '🎉' : filter === 'pending' ? '⏳' : '📋'}
              </div>
              <h3 className="text-xl font-display font-bold text-dark-300 mb-2">
                {filter === 'completed' ? 'No completed tasks yet' :
                  filter === 'pending' ? 'No pending submissions' :
                  'No tasks available'}
              </h3>
              <p className="text-dark-500">
                {filter === 'available' ? 'All tasks have been submitted!' : 'Check back later for new tasks'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submit modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-8 shadow-glass animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-white">Submit Proof</h2>
              <button onClick={() => setSubmitModal(null)} className="text-dark-400 hover:text-dark-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Task info */}
            <div className="p-4 bg-dark-800/50 rounded-xl mb-5">
              <div className="font-semibold text-dark-100">{submitModal.title}</div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-amber-400 text-sm font-bold">⭐ {submitModal.points} points</span>
                <span className="text-dark-500 text-xs">•</span>
                <span className="text-dark-500 text-xs">Proof: {proofTypeConfig[submitModal.proof_type].label}</span>
              </div>
              {submitModal.required_keyword && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-emerald-400">⚡ Auto-verification enabled</span>
                  <span className="text-dark-500">— include keyword:</span>
                  <span className="font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded">
                    {submitModal.required_keyword}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="input-label">
                  {proofTypeConfig[submitModal.proof_type].icon} {proofTypeConfig[submitModal.proof_type].label}
                </label>
                <input
                  required
                  type={submitModal.proof_type === 'link' ? 'url' : 'text'}
                  value={proof}
                  onChange={e => setProof(e.target.value)}
                  placeholder={proofTypeConfig[submitModal.proof_type].placeholder}
                  className="input-field"
                />
                {submitModal.proof_type === 'link' && submitModal.required_keyword && (
                  <div className={`mt-2 text-xs flex items-center gap-1.5 ${
                    proof.toLowerCase().includes(submitModal.required_keyword.toLowerCase())
                      ? 'text-emerald-400' : 'text-dark-500'
                  }`}>
                    {proof.toLowerCase().includes(submitModal.required_keyword.toLowerCase()) ? (
                      <>✅ Keyword detected — will be auto-approved!</>
                    ) : (
                      <>Include "{submitModal.required_keyword}" in your URL for instant approval</>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setSubmitModal(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !proof.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? <><div className="spinner" /> Submitting...</> : 'Submit Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
