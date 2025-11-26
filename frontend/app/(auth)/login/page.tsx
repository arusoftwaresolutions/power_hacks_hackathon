"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password })
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Could not sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl py-10 md:py-16">
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
        <div className="space-y-4 md:space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Sign in</p>
          <h1 className="text-3xl font-semibold text-brand-50 md:text-4xl">
            Welcome back to your safe space
          </h1>
          <p className="max-w-md text-sm text-brand-200 md:text-base">
            Sign in to access your dashboard, community forums and learning hub. Your details are kept private and
            secure.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4 border border-brand-500/20">
          <div className="space-y-1 text-sm">
            <label className="text-brand-100">Email or username</label>
            <input
              className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 text-sm">
            <label className="text-brand-100">Password</label>
            <input
              type="password"
              className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="pt-1 text-center text-[11px] text-brand-300">
            New here?{' '}
            <a href="/register" className="underline underline-offset-4">
              Create an account
            </a>
          </p>
          <p className="pt-1 text-center text-[11px] text-brand-300">
            <a href="/" className="underline underline-offset-4">
              ← Back to home
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}
