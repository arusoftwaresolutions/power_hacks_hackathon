"use client";

import useSWR from 'swr';
import { useState } from 'react';
import { apiFetch } from '../../lib/api';

interface ThreadsResponse {
  threads: {
    id: string;
    title: string;
    body: string;
    category: { name: string };
  }[];
}

interface CategoriesResponse {
  categories: { id: string; name: string }[];
}

export default function ForumPage() {
  const { data, error, mutate } = useSWR<ThreadsResponse>('/api/forum/threads', (url) => apiFetch(url));
  const { data: categories } = useSWR<CategoriesResponse>('/api/forum/categories', (url) => apiFetch(url));
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !categoryId) return;
    setCreating(true);
    setCreateError(null);
    try {
      await apiFetch('/api/forum/threads', {
        method: 'POST',
        body: JSON.stringify({ title, body, categoryId })
      });
      setTitle('');
      setBody('');
      setCategoryId('');
      mutate();
    } catch (err: any) {
      setCreateError(err.message || 'Could not create thread');
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-50">Community forums</h1>
          <p className="text-sm text-brand-200">
            Join conversations about online safety, mental health, tech careers and more.
          </p>
        </div>
        <a href="#new-thread" className="btn-primary text-xs">
          Start a thread
        </a>
      </div>
      <div className="space-y-3">
        {error && <p className="text-xs text-red-400">Could not load threads</p>}
        {!data && !error && <p className="text-xs text-brand-300">Loading conversations…</p>}
        {data &&
          data.threads.map((t) => (
            <a
              key={t.id}
              href={`/forum/${t.id}`}
              className="card flex flex-col gap-1 border border-white/5 hover:border-brand-400/40"
            >
              <p className="text-xs uppercase tracking-wide text-brand-300">{t.category.name}</p>
              <p className="text-sm font-semibold text-brand-50">{t.title}</p>
              <p className="line-clamp-2 text-xs text-brand-300">{t.body}</p>
            </a>
          ))}
      </div>

      <form id="new-thread" onSubmit={handleCreateThread} className="card space-y-3 border border-brand-500/30">
        <h2 className="text-sm font-semibold text-brand-100">Start a new conversation</h2>
        <div className="grid gap-2 md:grid-cols-[2fr,1fr]">
          <input
            className="rounded-full border border-white/10 bg-bg/60 px-4 py-2 text-sm outline-none focus:border-brand-400"
            placeholder="Thread title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="rounded-full border border-white/10 bg-bg/60 px-3 py-2 text-sm outline-none focus:border-brand-400"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Choose a space</option>
            {categories?.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-bg/60 p-3 text-sm outline-none focus:border-brand-400"
          placeholder="Share your question, experience or advice…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {createError && <p className="text-xs text-red-400">{createError}</p>}
        <button type="submit" className="btn-primary text-xs" disabled={creating}>
          {creating ? 'Posting…' : 'Post thread'}
        </button>
      </form>
    </section>
  );
}
