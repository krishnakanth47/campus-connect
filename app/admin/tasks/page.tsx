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
  created_at: string;
  is_active: boolean;
}

const proofTypeIcons: Record<string, string> = {
  screenshot: '🖼️', link: '🔗', file: '📁'
};

export default function AdminTasksPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: '',
    deadline: '',
    required_keyword: '',
    proof_type: 'link' as 'screenshot' | 'link' | 'file',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await apiRequest('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingTask(null);
    setFormData({ title: '', description: '', points: '', deadline: '', required_keyword: '', proof_type: 'link' });
    setShowForm(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      points: String(task.points),
      deadline: task.deadline.slice(0, 16),
      required_keyword: task.required_keyword || '',
      proof_type: task.proof_type,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      const res = await apiRequest(endpoint, method, {
        ...formData,
        points: parseInt(formData.points),
        required_keyword: formData.required_keyword || null,
      });
      if (!res.ok) throw new Error('Failed to save task');
      await fetchTasks();
      setShowForm(false);
      addToast({ type: 'success', title: editingTask ? 'Task updated!' : 'Task created!', message: formData.title });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await apiRequest(`/api/tasks/${id}`, 'DELETE');
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(t => t.id !== id));
      setDeleteConfirm(null);
      addToast({ type: 'success', title: 'Task deleted' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Task Manager</h1>
          <p className="text-dark-400 mt-1">Create and manage ambassador tasks</p>
        </div>
        <button onClick={openCreateForm} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </button>
      </div>

      {/* Task form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl p-8 shadow-glass max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-dark-400 hover:text-dark-200 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="input-label">Task Title *</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Share on LinkedIn" className="input-field" />
              </div>

              <div>
                <label className="input-label">Description *</label>
                <textarea required rows={4} value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed instructions for ambassadors..." className="input-field resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Points *</label>
                  <input required type="number" min="1" max="10000" value={formData.points}
                    onChange={e => setFormData({ ...formData, points: e.target.value })}
                    placeholder="100" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Deadline *</label>
                  <input required type="datetime-local" value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              <div>
                <label className="input-label">Proof Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['link', 'screenshot', 'file'] as const).map(type => (
                    <button key={type} type="button"
                      onClick={() => setFormData({ ...formData, proof_type: type })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                        formData.proof_type === type
                          ? 'bg-primary-500/20 border-primary-500 text-primary-300'
                          : 'bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500'
                      }`}>
                      <span className="text-2xl">{proofTypeIcons[type]}</span>
                      <span className="text-xs font-semibold capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">
                  Required Keyword
                  <span className="text-dark-500 font-normal ml-1">(optional — for auto-verification of links)</span>
                </label>
                <input value={formData.required_keyword}
                  onChange={e => setFormData({ ...formData, required_keyword: e.target.value })}
                  placeholder="e.g., CampusConnect" className="input-field" />
                <p className="text-xs text-dark-500 mt-1.5">
                  If set, submissions containing this keyword in the URL will be auto-approved ⚡
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><div className="spinner" /> Saving...</> : (editingTask ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tasks.map(task => (
            <div key={task.id}
              className="glass-card p-5 hover:border-dark-600/50 transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{proofTypeIcons[task.proof_type]}</span>
                  <span className="text-xs font-semibold text-dark-400 capitalize bg-dark-800 px-2 py-0.5 rounded-full">
                    {task.proof_type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditForm(task)}
                    className="p-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteConfirm(task.id)}
                    className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="font-display font-bold text-dark-100 mb-2 leading-tight">{task.title}</h3>
              <p className="text-sm text-dark-400 mb-4 line-clamp-2 flex-1">{task.description}</p>

              <div className="space-y-2 pt-3 border-t border-dark-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-500">Points</span>
                  <span className="font-bold text-amber-400">⭐ {task.points}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-500">Deadline</span>
                  <span className="text-xs text-dark-300 font-medium">
                    {format(new Date(task.deadline), 'MMM dd, yyyy')}
                  </span>
                </div>
                {task.required_keyword && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark-500">Keyword</span>
                    <span className="text-xs bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full font-mono">
                      {task.required_keyword}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {tasks.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-display font-bold text-dark-300 mb-2">No tasks yet</h3>
              <p className="text-dark-500 mb-6">Create your first task to get ambassadors started</p>
              <button onClick={openCreateForm} className="btn-primary">Create First Task</button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-8 max-w-sm w-full text-center shadow-glass animate-slide-up">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Delete Task?</h3>
            <p className="text-dark-400 mb-6 text-sm">This action cannot be undone. All associated submissions will remain.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
