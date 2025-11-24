"use client";

import useSWR from 'swr';
import { apiFetch } from '../../lib/api';

interface ResourcesResponse {
  resources: {
    id: string;
    title: string;
    content: string;
    level: string;
    category: { name: string };
  }[];
}

export default function ResourcesPage() {
  const { data, error } = useSWR<ResourcesResponse>('/api/resources', (url) => apiFetch(url));

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-brand-50">Learning hub</h1>
        <p className="text-sm text-brand-200">
          Short, practical guides to help you navigate social media and digital tools with confidence.
        </p>
      </div>
      {error && <p className="text-xs text-red-400">Could not load resources</p>}
      {!data && !error && <p className="text-xs text-brand-300">Loading guides…</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {data?.resources.map((r) => (
          <article key={r.id} className="card border border-white/5">
            <p className="text-[11px] uppercase tracking-wide text-brand-300">
              {r.category.name} · {r.level}
            </p>
            <h2 className="mt-1 text-sm font-semibold text-brand-50">{r.title}</h2>
            <p className="mt-2 text-xs text-brand-200 line-clamp-4">{r.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
