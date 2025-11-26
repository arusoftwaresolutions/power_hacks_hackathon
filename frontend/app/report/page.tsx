"use client";

import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useRequireAuth } from '../../lib/useRequireAuth';

interface SearchParams {
  searchParams?: {
    targetType?: string;
    targetId?: string;
  };
}

export default function ReportPage({ searchParams }: SearchParams) {
  const { user, isLoading } = useRequireAuth();
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inferredTargetType = searchParams?.targetType ?? 'MANUAL';
  const inferredTargetId = searchParams?.targetId ?? null;

  if (isLoading || !user) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center text-sm text-brand-200">
        Checking your account…
      </section>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);
    try {
      await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ description, targetType: inferredTargetType, targetId: inferredTargetId })
      });
      setStatus('Your report has been submitted. A moderator will review it shortly.');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Could not send report');
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6 md:space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-red-300">Safety</p>
        <h1 className="text-2xl font-semibold text-brand-50 md:text-3xl">Report abuse or unsafe behavior</h1>
        <p className="max-w-xl text-sm text-brand-200 md:text-base">
          This form goes directly to trained moderators. Share only what you feel comfortable sharing.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-3 border border-red-500/20 md:space-y-4">
        <textarea
          className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-bg/60 p-3 text-sm outline-none focus:border-brand-400"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what happened, where it happened and how it made you feel."
          required
        />
        {status && <p className="text-xs text-emerald-300">{status}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" className="btn-primary text-xs">
          Submit report
        </button>
      </form>
    </section>
  );
}
