'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '@/logo.png';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ambassador' as 'admin' | 'ambassador',
    github_username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'An error occurred');
        return;
      }

      // Store token
      localStorage.setItem('campus_connect_token', data.token);
      localStorage.setItem('campus_connect_user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: 'admin' | 'ambassador') => {
    setMode('login');
    setFormData({
      ...formData,
      email: type === 'admin' ? 'admin@campusconnect.com' : 'user@campusconnect.com',
      password: 'password123',
    });
  };

  return (
    <div className="min-h-screen bg-dark-950 mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-cyan-600/8 rounded-full blur-3xl animate-float" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left panel — branding */}
        <div className="hidden lg:flex flex-col justify-center p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Image src={logo} alt="Campus Connect Logo" className="w-12 h-12 object-contain" priority />
            <div>
              <h1 className="text-xl font-display font-bold text-white">Campus Connect</h1>
              <p className="text-xs text-dark-400">Ambassador Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
            Manage Ambassadors
            <br />
            <span className="gradient-text">Intelligently.</span>
          </h2>

          <p className="text-dark-400 text-lg mb-10 leading-relaxed">
            The complete platform for managing campus ambassador programs — from task assignment to GitHub analysis and gamified engagement.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: '🎯', text: 'Task Management & Auto-Verification', color: 'from-blue-500/20 to-indigo-500/20' },
              { icon: '🏆', text: 'Gamified Leaderboards & Badges', color: 'from-amber-500/20 to-orange-500/20' },
              { icon: '📊', text: 'Real-Time Analytics Dashboard', color: 'from-emerald-500/20 to-teal-500/20' },
              { icon: '🔬', text: 'GitHub Profile Analyzer & Insights', color: 'from-violet-500/20 to-purple-500/20' },
            ].map((f, i) => (
              <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r ${f.color} border border-white/5 animate-slide-up`}
                style={{ animationDelay: `${i * 100}ms` }}>
                <span className="text-xl">{f.icon}</span>
                <span className="text-dark-200 font-medium text-sm">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { value: '500+', label: 'Ambassadors' },
              { value: '98%', label: 'Satisfaction' },
              { value: '10K+', label: 'Tasks Done' },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 glass-card">
                <div className="text-xl font-display font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-dark-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — auth form */}
        <div className="flex flex-col justify-center">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Image src={logo} alt="Campus Connect Logo" className="w-10 h-10 object-contain" priority />
            <div>
              <h1 className="text-lg font-display font-bold text-white">Campus Connect</h1>
              <p className="text-xs text-dark-400">Ambassador Platform</p>
            </div>
          </div>

          <div className="glass-card p-8 shadow-glass">
            {/* Tab switcher */}
            <div className="flex bg-dark-800 p-1 rounded-xl mb-8">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="input-label">Role</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'ambassador' })}
                      className="input-field"
                    >
                      <option value="ambassador">Ambassador</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">GitHub Username <span className="text-dark-500">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="octocat"
                      value={formData.github_username}
                      onChange={e => setFormData({ ...formData, github_username: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-6 border-t border-dark-700/50">
              <p className="text-xs text-dark-500 text-center mb-3 font-medium uppercase tracking-wider">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fillDemo('admin')}
                  className="flex items-center gap-2 p-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-primary-500/50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-sm shrink-0">
                    👑
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-dark-200 group-hover:text-white transition-colors">Admin</div>
                    <div className="text-[10px] text-dark-500">Full access</div>
                  </div>
                </button>
                <button
                  onClick={() => fillDemo('ambassador')}
                  className="flex items-center gap-2 p-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-primary-500/50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center text-sm shrink-0">
                    🌟
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-dark-200 group-hover:text-white transition-colors">Ambassador</div>
                    <div className="text-[10px] text-dark-500">Demo account</div>
                  </div>
                </button>
              </div>
              <p className="text-[11px] text-dark-600 text-center mt-2">Password: password123</p>
            </div>
          </div>

          <p className="text-center text-xs text-dark-600 mt-4">
            Campus Connect © 2024 — Intelligent Ambassador Management
          </p>
        </div>
      </div>
    </div>
  );
}
