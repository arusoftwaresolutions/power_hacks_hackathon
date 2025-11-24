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
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold text-brand-50">Welcome back</h1>
      <p className="text-sm text-brand-200">Sign in to access your dashboard, forums, and learning hub.</p>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="space-y-1 text-sm">
          <label className="text-brand-100">Email or username</label>
          <input
            className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2 text-sm outline-none focus:border-brand-400"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1 text-sm">
          <label className="text-brand-100">Password</label>
          <input
            type="password"
            className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2 text-sm outline-none focus:border-brand-400"
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
          <a href="/auth/register" className="underline">
            Create an account
          </a>
        </p>
      </form>
    </section>
  );
}
