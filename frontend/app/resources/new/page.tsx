"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { apiFetch, swrFetcher } from '../../../lib/api';
import { useRequireAuth } from '../../../lib/useRequireAuth';

interface Category {
  id: string;
  name: string;
}

interface CategoriesResponse {
  categories: Category[];
}

export default function NewResourcePage() {
  const { user, isLoading } = useRequireAuth();
  const { data: categories, error: categoriesError } = useSWR<CategoriesResponse>(
    '/api/resources/categories',
    swrFetcher<CategoriesResponse>
  );

  const [form, setForm] = useState({
    title: '',
    content: '',
    categoryId: '',
    level: 'Beginner',
    tags: '',
    isFeatured: false,
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  if (isLoading || !user) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center text-sm text-brand-200">
        Checking your account…
      </section>
    );
  }

  const isAdminOrModerator = user.role === 'ADMIN' || user.role === 'MODERATOR';

  if (!isAdminOrModerator) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center text-sm text-brand-200">
        You do not have permission to create learning resources.
      </section>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      let attachmentUrl: string | undefined;
      let attachmentMimeType: string | undefined;

      if (attachmentFile) {
        // 1) Ask backend for a signed upload URL
        const { url, publicUrl } = await apiFetch<{
          url: string;
          key: string;
          publicUrl: string;
        }>('/api/uploads/signed-url', {
          method: 'POST',
          body: JSON.stringify({ mimeType: attachmentFile.type || 'application/octet-stream' }),
        });

        // 2) Upload the file directly to object storage
        const uploadRes = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': attachmentFile.type || 'application/octet-stream',
          },
          body: attachmentFile,
        });

        if (!uploadRes.ok) {
          throw new Error('Could not upload attachment. Please try again.');
        }

        attachmentUrl = publicUrl;
        attachmentMimeType = attachmentFile.type || 'application/octet-stream';
      }

      await apiFetch('/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          categoryId: form.categoryId || (categories?.categories[0]?.id ?? ''),
          level: form.level,
          tags,
          isFeatured: form.isFeatured,
          attachmentUrl,
          attachmentMimeType,
        }),
      });

      setSuccess('Your learning guide has been published to the hub.');
      setForm({ ...form, title: '', content: '', tags: '' });
    } catch (err: any) {
      const msg = err?.message || 'Could not publish guide';
      // If the backend reports that uploads are not configured, surface that
      // clearly so the admin understands what to fix.
      const friendly = msg.includes('File uploads are not configured')
        ? 'File uploads are not configured on the server yet. Please add storage credentials (SPACES_* env vars) or publish this guide without an attachment.'
        : msg;
      setError(friendly);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 md:space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-300">HerSafeSpace · Admin</p>
        <h1 className="text-2xl font-semibold text-brand-50 md:text-3xl">Create a new learning guide</h1>
        <p className="max-w-xl text-sm text-brand-200 md:text-base">
          Publish short, practical guides to help girls and women across Africa stay safe and confident online.
        </p>
      </div>

      {categoriesError && <p className="text-xs text-red-400">Could not load categories</p>}
      {!categories && !categoriesError && <p className="text-xs text-brand-300">Loading categories…</p>}

      <form onSubmit={handleSubmit} className="card space-y-4 border border-brand-500/20">
        <div className="space-y-1 text-sm">
          <label className="text-brand-100">Title</label>
          <input
            className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1 text-sm">
          <label className="text-brand-100">Content</label>
          <textarea
            className="min-h-[160px] w-full rounded-2xl border border-white/10 bg-bg/60 p-3 text-sm outline-none focus:border-brand-400"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="Write a clear, supportive guide. Include practical steps and local context where possible."
            required
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <label className="text-brand-100">Category</label>
            <select
              className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              value={form.categoryId || (categories?.categories[0]?.id ?? '')}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              {categories?.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 text-sm">
            <label className="text-brand-100">Level</label>
            <input
              className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
              placeholder="e.g. Beginner, Intermediate, Advanced"
              required
            />
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <label className="text-brand-100">Tags (comma-separated)</label>
          <input
            className="w-full rounded-full border border-white/10 bg-bg/60 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="privacy, online safety, screenshots"
          />
        </div>
        <div className="space-y-1 text-sm">
          <label className="text-brand-100">Attachment (optional)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,application/pdf"
            className="w-full text-xs text-brand-200 file:mr-3 file:rounded-full file:border file:border-white/10 file:bg-bg/60 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-brand-100 hover:file:bg-white/10"
            onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-[11px] text-brand-300">
            Upload supporting materials like PDFs, slides, or worksheets.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-brand-200">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
          />
          Feature this guide in the learning hub
        </label>
        {success && <p className="text-xs text-emerald-300">{success}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? 'Publishing…' : 'Publish guide'}
        </button>
      </form>

      {showErrorModal && error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-bg/95 p-5 shadow-xl shadow-black/60">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300">Publish error</p>
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
