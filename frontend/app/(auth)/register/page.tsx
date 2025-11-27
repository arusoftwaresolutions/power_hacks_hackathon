"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    country: '',
    ageRange: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      router.push('/dashboard');
    } catch (err: any) {
      const friendly =
        err?.status && err.status >= 500
          ? 'We could not create your account because of a server problem. Please try again in a moment.'
          : err?.message || 'Could not create account';
      setError(friendly);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl py-10 md:py-16">
      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
        <div className="space-y-4 md:space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Create account</p>
          <h1 className="text-3xl font-semibold text-brand-50 md:text-4xl">Join HerSafeSpace</h1>
          <p className="max-w-md text-sm text-brand-200 md:text-base">
            Create a free account to ask questions, share your journey and learn how to stay safe online. We only ask
            for what we need to keep the community safe.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4 border border-brand-500/20">
          {[
            ['name', 'Full name'],
            ['username', 'Username'],
            ['email', 'Email'],
            ['country', 'Country (optional)'],
            ['ageRange', 'Age range (e.g. 18-24)']
          ].map(([key, label]) => (
            <div key={key} className="space-y-1 text-sm">
              <label className="text-brand-100">{label}</label>
              <input
                className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                required={key === 'name' || key === 'username' || key === 'email'}
              />
            </div>
          ))}
          <div className="space-y-1 text-sm">
            <label className="text-brand-100">Password</label>
            <input
              type="password"
              className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
          <p className="pt-1 text-center text-[11px] text-brand-300">
            Already have an account?{' '}
            <a href="/login" className="underline underline-offset-4">
              Sign in
            </a>
          </p>
          <p className="pt-1 text-center text-[11px] text-brand-300">
            <a href="/" className="underline underline-offset-4">
              ← Back to home
            </a>
          </p>
        </form>
      </div>

      {showErrorModal && error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-bg/95 p-5 shadow-xl shadow-black/60">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300">Registration error</p>
            <h2 className="mt-2 text-base font-semibold text-brand-50">Something went wrong</h2>
            <p className="mt-2 text-sm text-brand-200">{error}</p>
            <button
              type="button"
              className="mt-4 btn-primary w-full text-xs"
              onClick={() => setShowErrorModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
