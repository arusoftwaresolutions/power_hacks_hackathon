"use client";

import useSWR from 'swr';
import { swrFetcher } from '../../lib/api';

interface MeResponse {
  user: {
    name: string;
  };
}

export default function DashboardPage() {
  const { data } = useSWR<MeResponse>('/api/auth/me', swrFetcher<MeResponse>);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-brand-300">Welcome</p>
        <h1 className="text-2xl font-semibold text-brand-50">
          {data ? `Hi, ${data.user.name}` : 'Hi there'} 👋
        </h1>
        <p className="mt-1 text-sm text-brand-200">
          This is your home base. From here you can join safe conversations, learn digital skills, and ask for help.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <a href="/forum" className="card border border-brand-500/10 hover:border-brand-400/40">
          <p className="text-sm font-semibold text-brand-100">Community forums</p>
          <p className="mt-1 text-xs text-brand-300">Share experiences and learn from other girls and women.</p>
        </a>
        <a href="/resources" className="card border border-brand-500/10 hover:border-brand-400/40">
          <p className="text-sm font-semibold text-brand-100">Learning hub</p>
          <p className="mt-1 text-xs text-brand-300">Bite-sized lessons on privacy, reporting and resilience.</p>
        </a>
        <a href="/report" className="card border border-brand-500/10 hover:border-brand-400/40">
          <p className="text-sm font-semibold text-brand-100">Report abuse</p>
          <p className="mt-1 text-xs text-brand-300">Tell moderators what happened and get support.</p>
        </a>
      </div>
    </section>
  );
}
