"use client";

import { useState } from "react";
import { useCurrentUser } from "../lib/useCurrentUser";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/forum", label: "Community" },
  { href: "/resources", label: "Learn" },
  { href: "/report", label: "Report abuse" }
];

export function HeaderNav() {
  const [open, setOpen] = useState(false);
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="relative flex items-center gap-2 md:gap-4">
      {/* Desktop nav */}
      <nav className="hidden flex-wrap items-center gap-2 text-xs font-medium text-brand-100 md:flex md:gap-4 md:text-sm">
        {primaryLinks.map((link) => (
          <a key={link.href} href={link.href} className="nav-link">
            {link.label}
          </a>
        ))}
        {isAdmin && (
          <a
            href="/moderation"
            className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/40 hover:bg-emerald-500/25 hover:text-emerald-50"
          >
            Admin console
          </a>
        )}
        <a href="/login" className="btn-primary text-xs md:text-sm">
          Sign in / Register
        </a>
      </nav>

      {/* Mobile menu button */}
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-bg/70 px-3 py-1.5 text-xs font-medium text-brand-100 shadow-sm shadow-black/30 md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
      >
        <span className="relative block h-[12px] w-4">
          {/* Top bar */}
          <span
            className={`absolute left-0 top-0 h-[1.5px] w-full rounded bg-brand-100 transition-transform ${
              open ? "translate-y-[5px] rotate-45" : ""
            }`}
          />
          {/* Middle bar */}
          <span
            className={`absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 rounded bg-brand-100 transition-opacity ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          {/* Bottom bar */}
          <span
            className={`absolute bottom-0 left-0 h-[1.5px] w-full rounded bg-brand-100 transition-transform ${
              open ? "-translate-y-[5px] -rotate-45" : ""
            }`}
          />
        </span>
        <span>{open ? "Close" : "Menu"}</span>
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-20 mt-3 w-52 rounded-2xl border border-white/10 bg-bg/95 p-4 text-sm text-brand-200 shadow-xl shadow-black/60 md:hidden">
          <div className="flex flex-col gap-2">
            {primaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm hover:bg-white/5 hover:text-brand-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isAdmin && (
              <a
                href="/moderation"
                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
                onClick={() => setOpen(false)}
              >
                Admin console
              </a>
            )}
            <a
              href="/login"
              className="btn-primary w-full justify-center text-xs"
              onClick={() => setOpen(false)}
            >
              Sign in / Register
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
