"use client";

import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <section className="grid gap-12 md:grid-cols-[1.2fr,0.8fr] md:items-center">
      <div className="space-y-8 md:space-y-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-balance text-4xl font-semibold leading-tight tracking-tight text-brand-50 md:text-5xl"
        >
          A safe digital home for African women and girls.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="max-w-xl text-sm text-brand-200 md:text-base"
        >
          Learn digital safety skills, share your story, and get support from trained moderators. HerSafeSpace combines
          community, education, and Safety-by-Design tools to keep you in control of your online life.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap gap-4"
        >
          <a href="/register" className="btn-primary">
            Join the community
          </a>
          <a
            href="/resources"
            className="inline-flex items-center text-xs font-medium text-brand-200 hover:text-brand-100 md:text-sm"
          >
            Explore safety guides
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 grid gap-4 text-xs text-brand-200 md:grid-cols-3 md:gap-6"
        >
          <div className="card border border-brand-500/10 bg-surface/80">
            <p className="text-sm font-semibold text-brand-100 md:text-base">Moderated forums</p>
            <p className="mt-2 text-xs text-brand-300 md:text-sm">Report abuse in one tap and get human support.</p>
          </div>
          <div className="card border border-brand-500/10 bg-surface/80">
            <p className="text-sm font-semibold text-brand-100 md:text-base">Safety by design</p>
            <p className="mt-2 text-xs text-brand-300 md:text-sm">AI-assisted checks help filter harmful content.</p>
          </div>
          <div className="card border border-brand-500/10 bg-surface/80">
            <p className="text-sm font-semibold text-brand-100 md:text-base">African voices</p>
            <p className="mt-2 text-xs text-brand-300 md:text-sm">Stories and resources created with local context.</p>
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="card relative overflow-hidden border border-brand-500/10"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-400/40 via-accent/40 to-transparent blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">Today&apos;s focus</p>
        <h2 className="mt-2 text-sm font-semibold text-brand-50 md:text-base">Standing up to online harassment</h2>
        <p className="mt-2 text-[11px] text-brand-200 md:text-xs">
          Learn how to document abuse, block accounts, and report safely without putting yourself at further risk.
        </p>
        <ul className="mt-4 space-y-2 text-[11px] text-brand-200 md:text-xs">
          <li>• Quick guide to screenshots & evidence</li>
          <li>• When and how to involve trusted adults or organizations</li>
          <li>• Mental health check-in questions</li>
        </ul>
        <a
          href="/resources"
          className="mt-4 inline-flex text-xs font-medium text-brand-200 hover:text-brand-50 md:text-sm"
        >
          Open learning hub →
        </a>
      </motion.div>
    </section>
  );
}
