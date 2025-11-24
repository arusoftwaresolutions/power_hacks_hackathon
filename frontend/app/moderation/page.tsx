"use client";

import useSWR from 'swr';
import { swrFetcher } from '../../lib/api';

interface ReportsResponse {
  reports: {
    id: string;
    description: string;
    status: string;
    severity: string;
  }[];
}

export default function ModerationPage() {
  const { data, error } = useSWR<ReportsResponse>('/api/reports', swrFetcher<ReportsResponse>);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-brand-50">Moderation console</h1>
        <p className="text-sm text-brand-200">For moderators and admins to review and resolve reports.</p>
      </div>
      {error && <p className="text-xs text-red-400">Could not load reports</p>}
      {!data && !error && <p className="text-xs text-brand-300">Loading reports…</p>}
      <div className="space-y-3">
        {data?.reports.map((r) => (
          <div key={r.id} className="card border border-white/5">
            <p className="text-[11px] uppercase tracking-wide text-brand-300">
              {r.status} · {r.severity}
            </p>
            <p className="mt-1 text-sm text-brand-50">{r.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
