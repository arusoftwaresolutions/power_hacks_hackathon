"use client";

import { useRequireAuth } from '../../lib/useRequireAuth';

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading || !user) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center text-sm text-brand-200">
        Checking your account…
      </section>
    );
  }

  const isAdminOrModerator = user.role === 'ADMIN' || user.role === 'MODERATOR';

  return (
    <section className="space-y-8 md:space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Welcome</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-50 md:text-4xl">
          {`Hi, ${user.name}`} 👋
        </h1>
        <p className="mt-3 max-w-xl text-sm text-brand-200 md:text-base">
          {isAdminOrModerator
            ? 'You are signed in as a moderator/admin. From here you can support the community, publish learning guides, and respond to safety reports.'
            : 'This is your home base. From here you can join safe conversations, learn digital skills, and ask for help.'}
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <a href="/forum" className="card border border-brand-500/10 hover:border-brand-400/40">
          <p className="text-sm font-semibold text-brand-100 md:text-base">Community forums</p>
          <p className="mt-2 text-xs text-brand-300 md:text-sm">
            Share experiences and learn from other girls and women.
          </p>
        </a>
        <a href="/resources" className="card border border-brand-500/10 hover:border-brand-400/40">
          <p className="text-sm font-semibold text-brand-100 md:text-base">Learning hub</p>
          <p className="mt-2 text-xs text-brand-300 md:text-sm">
            Bite-sized lessons on privacy, reporting and resilience.
          </p>
        </a>
        <a href="/report" className="card border border-brand-500/10 hover:border-brand-400/40">
          <p className="text-sm font-semibold text-brand-100 md:text-base">Report abuse</p>
          <p className="mt-2 text-xs text-brand-300 md:text-sm">
            Tell moderators what happened and get support.
          </p>
        </a>
        {/* User safety reports progress */}
        <a href="/dashboard/reports" className="card border border-emerald-500/20 hover:border-emerald-400/50">
          <p className="text-sm font-semibold text-emerald-100 md:text-base">Your safety reports</p>
          <p className="mt-2 text-xs text-emerald-200 md:text-sm">
            Check the status of reports youve submitted and read moderator responses.
          </p>
        </a>
        {isAdminOrModerator && (
          <>
            <a href="/moderation" className="card border border-red-500/30 hover:border-red-400/60">
              <p className="text-sm font-semibold text-red-100 md:text-base">Moderation console</p>
              <p className="mt-2 text-xs text-red-200 md:text-sm">
                Review new abuse reports, adjust severity and send supportive responses.
              </p>
            </a>
            <a href="/resources/new" className="card border border-brand-500/30 hover:border-brand-400/70">
              <p className="text-sm font-semibold text-brand-100 md:text-base">Create learning guide</p>
              <p className="mt-2 text-xs text-brand-200 md:text-sm">
                Publish new safety guides and digital literacy content for the community.
              </p>
            </a>
          </>
        )}
      </div>
    </section>
  );
}
