import React, { useState } from 'react';
import { X, BookOpen, UploadCloud, Users, Sparkles } from 'lucide-react';

/**
 * OnboardingBanner — shown to first-time users to orient them
 * to the tool's key workflows. Supports teacher adoption with
 * clear, plain-language instructions. Dismissible and stored
 * in localStorage so it doesn't reappear.
 *
 * Covers: Feasibility / Pilot Readiness — adoption plan
 */
const STEPS = [
  {
    icon: Users,
    title: 'Step 1 — Roster Setup',
    desc: 'Go to "Student Roster" to add your class. Each student needs a name, grade, and roll number.',
    color: 'brand',
  },
  {
    icon: UploadCloud,
    title: 'Step 2 — Record Assessment Scores',
    desc: 'After any test, go to "Record Assessment" and enter concept-level scores (0–100) for each student.',
    color: 'emerald',
  },
  {
    icon: BookOpen,
    title: 'Step 3 — Review Learning Gaps',
    desc: 'The Dashboard automatically highlights weak concepts and flags high-risk students for intervention.',
    color: 'amber',
  },
  {
    icon: Sparkles,
    title: 'Step 4 — Use Smart Groups',
    desc: 'Smart Groups clusters struggling students and pairs peer mentors — ready-to-use seating and activity plans.',
    color: 'purple',
  },
];

export default function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('edupulse_onboarding_dismissed') === 'true'
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('edupulse_onboarding_dismissed', 'true');
  };

  return (
    <div
      role="region"
      aria-label="Getting started guide"
      className="max-w-7xl mx-auto px-4 sm:px-6 pt-6"
    >
      <div className="relative rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-950/30 to-slate-900 p-5 sm:p-6">
        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss getting started guide"
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <h3 className="text-base font-extrabold text-brand-300 mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-400 animate-ping" aria-hidden="true" />
          Getting Started with EduPulse AI — Teacher Quick Guide
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className={`rounded-xl p-4 bg-slate-900/60 border border-slate-800 space-y-2`}
            >
              <div className={`h-8 w-8 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-400 border border-${color}-500/20`}>
                <Icon size={16} aria-hidden="true" />
              </div>
              <p className="text-xs font-extrabold text-white">{title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          No internet required after setup · All data stays on your school's device · Works on low-end smartphones and tablets
        </p>
      </div>
    </div>
  );
}
