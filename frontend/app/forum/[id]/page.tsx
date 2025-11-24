"use client";

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useState } from 'react';
import { apiFetch } from '../../../lib/api';

interface ThreadResponse {
  thread: {
    id: string;
    title: string;
    body: string;
    category: { name: string };
    posts: { id: string; body: string; author: { name: string } }[];
  };
}

export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const { data, mutate } = useSWR<ThreadResponse>(`/api/forum/threads/${params.id}`, (url) => apiFetch(url));
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await apiFetch(`/api/forum/threads/${params.id}/posts`, {
        method: 'POST',
        body: JSON.stringify({ body })
      });
      setBody('');
      mutate();
    } catch (err: any) {
      setError(err.message || 'Could not post reply');
    }
  }

  if (!data) return <p className="text-xs text-brand-300">Loading thread…</p>;

  const { thread } = data;

  return (
    <section className="space-y-5">
      <div className="card space-y-2 border border-white/5">
        <p className="text-xs uppercase tracking-wide text-brand-300">{thread.category.name}</p>
        <h1 className="text-lg font-semibold text-brand-50">{thread.title}</h1>
        <p className="text-sm text-brand-100">{thread.body}</p>
        <a
          href={`/report?targetType=FORUM_THREAD&targetId=${thread.id}`}
          className="mt-2 inline-flex text-[11px] font-medium text-brand-300 hover:text-brand-100"
        >
          Report this thread
        </a>
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-brand-100">Replies</h2>
        {thread.posts.length === 0 && <p className="text-xs text-brand-300">No replies yet. Be the first to share.</p>}
        {thread.posts.map((p) => (
          <div key={p.id} className="card space-y-1 border border-white/5">
            <p className="text-xs font-semibold text-brand-200">{p.author.name}</p>
            <p className="mt-1 text-sm text-brand-50">{p.body}</p>
            <a
              href={`/report?targetType=FORUM_POST&targetId=${p.id}`}
              className="inline-flex text-[11px] font-medium text-brand-300 hover:text-brand-100"
            >
              Report this reply
            </a>
          </div>
        ))}
      </div>
      <form onSubmit={handleReply} className="card space-y-3 border border-brand-500/20">
        <h3 className="text-sm font-semibold text-brand-100">Add your reply</h3>
        <textarea
          className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-bg/60 p-3 text-sm outline-none focus:border-brand-400"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts, questions or support…"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" className="btn-primary text-xs">
          Post reply
        </button>
      </form>
    </section>
  );
}
