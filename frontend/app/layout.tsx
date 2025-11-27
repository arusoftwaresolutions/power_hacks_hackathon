import type { ReactNode } from 'react';
import './globals.css';
import { HeaderNav } from './HeaderNav';

export const metadata = {
  title: 'HerSafeSpace  Safe Digital Spaces for African Women and Girls',
  description:
    'Learn, connect and report abuse in a safe, moderated community built by and for African women and girls.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-bg via-surface/90 to-bg text-white">
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-brand-500/25 via-accent/10 to-transparent blur-3xl" />
          <header className="relative mb-8 flex items-center justify-between gap-4 rounded-full border border-white/5 bg-bg/70 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur md:mb-10">
            <a href="/" className="group flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent text-lg font-black text-white shadow-md transition-transform group-hover:scale-105">
                HS
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100">HerSafeSpace</div>
                <div className="text-[11px] text-brand-300">Safety by Design</div>
              </div>
            </a>
            <HeaderNav />
          </header>
          <main className="flex-1 pb-10 md:pb-12">{children}</main>
          <footer className="mt-auto border-t border-white/5 pt-6 text-[12px] text-brand-400 md:mt-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-semibold text-brand-200">HerSafeSpace · Safety by Design</p>
              <p>Built for the Power Learn Hackathon. Moderated spaces for African women and girls.</p>
              <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-brand-300">
                <a href="/" className="hover:text-brand-100">
                  Home
                </a>
                <a href="/resources" className="hover:text-brand-100">
                  Safety guides
                </a>
                <a href="/forum" className="hover:text-brand-100">
                  Community
                </a>
                <a href="/report" className="hover:text-brand-100">
                  Report abuse
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
