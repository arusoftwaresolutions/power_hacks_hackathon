"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { swrFetcher, apiFetch } from '../../lib/api';
import { useRequireAuth } from '../../lib/useRequireAuth';

const STATUS_OPTIONS = ['OPEN', 'IN_REVIEW', 'RESOLVED'] as const;
const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'] as const;

type Status = (typeof STATUS_OPTIONS)[number];
type Severity = (typeof SEVERITY_OPTIONS)[number];

interface Report {
  id: string;
  description: string;
  status: Status;
  severity: Severity;
  responseMessage?: string | null;
}

interface ReportsResponse {
  reports: Report[];
}

export default function ModerationPage() {
  const { user, isLoading } = useRequireAuth();
  const { data, error, mutate } = useSWR<ReportsResponse>('/api/reports', swrFetcher<ReportsResponse>);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, { status: Status; severity: Severity; responseMessage: string }>>({});

  if (isLoading || !user) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center text-sm text-brand-200">
        Checking your account…
      </section>
    );
  }

  async function handleSave(report: Report) {
    const current = formState[report.id] ?? {
      status: report.status,
      severity: report.severity,
      responseMessage: report.responseMessage ?? ''
    };

    try {
      setUpdatingId(report.id);
      await apiFetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        body: JSON.stringify(current)
      });
      await mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-300">HerSafeSpace · Admin</p>
        <h1 className="mt-1 text-2xl font-semibold text-brand-50 md:text-3xl">Safety & moderation dashboard</h1>
        <p className="mt-2 text-sm text-brand-200 md:text-base">
          Review abuse reports from girls and women across Africa, triage severity, and send supportive responses back to
          survivors in this safe, private space.
        </p>
      </div>
      {error && <p className="text-xs text-red-400">Could not load reports</p>}
      {!data && !error && <p className="text-xs text-brand-300">Loading reports…</p>}
      <div className="space-y-3">
        {data?.reports.map((r) => {
          const state = formState[r.id] ?? {
            status: r.status,
            severity: r.severity,
            responseMessage: r.responseMessage ?? ''
          };
          return (
            <div key={r.id} className="card space-y-2 border border-white/5">
              <p className="text-[11px] uppercase tracking-wide text-brand-300">
                {state.status} · {state.severity}
              </p>
              <p className="mt-1 text-sm text-brand-50">{r.description}</p>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-[11px] text-brand-300">
                  Status
                  <select
                    className="rounded-xl border border-white/10 bg-bg/60 px-2 py-1 text-xs text-brand-50"
                    value={state.status}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        [r.id]: { ...state, status: e.target.value as Status }
                      }))
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] text-brand-300">
                  Severity
                  <select
                    className="rounded-xl border border-white/10 bg-bg/60 px-2 py-1 text-xs text-brand-50"
                    value={state.severity}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        [r.id]: { ...state, severity: e.target.value as Severity }
                      }))
                    }
                  >
                    {SEVERITY_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="md:col-span-1" />
              </div>
              <label className="mt-2 flex flex-col gap-1 text-[11px] text-brand-300">
                Response to reporter (optional)
                <textarea
                  className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-bg/60 p-2 text-xs text-brand-50"
                  placeholder="Write a short, supportive message that will be shown to the reporter."
                  value={state.responseMessage}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      [r.id]: { ...state, responseMessage: e.target.value }
                    }))
                  }
                />
              </label>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave(r)}
                  disabled={updatingId === r.id}
                  className="btn-primary px-4 py-1.5 text-xs disabled:opacity-60"
                >
                  {updatingId === r.id ? 'Saving…' : 'Save update'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
