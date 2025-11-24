import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'HerSafeSpace – Safe Digital Spaces for African Women and Girls',
  description: 'Learn, connect and report abuse in a safe, moderated community built by and for African women and girls.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-bg via-surface to-bg text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-lg font-black text-white">
                HS
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide text-brand-100">HerSafeSpace</div>
                <div className="text-xs text-brand-300">Safety by Design</div>
              </div>
            </div>
            <nav className="hidden items-center gap-5 text-sm text-brand-100 md:flex">
              <a href="/dashboard">Dashboard</a>
              <a href="/forum">Community</a>
              <a href="/resources">Learn</a>
              <a href="/report">Report Abuse</a>
              <a href="/auth/login" className="btn-primary text-xs">
                Sign in
              </a>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-10 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-brand-400">
            <span>Built for the Power Learn Hackathon · Safety by Design</span>
            <span>Moderated spaces for African women and girls</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
