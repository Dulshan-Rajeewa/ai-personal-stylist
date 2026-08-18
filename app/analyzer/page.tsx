'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  Camera,
  Sparkles,
  Palette,
  Scissors,
  Watch,
  RotateCcw,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const feedbackItems = [
  {
    icon: Palette,
    category: 'Color Matching',
    score: 'Excellent',
    scoreColor: 'text-emerald-600',
    scoreBg: 'bg-emerald-50',
    body: `Perfect harmony. The navy tones complement your skin's undertones beautifully.`,
  },
  {
    icon: Scissors,
    category: 'Fit & Silhouette',
    score: 'Good',
    scoreColor: 'text-amber-600',
    scoreBg: 'bg-amber-50',
    body: 'The structured blazer elevates the look, but consider a slight taper on the trousers.',
  },
  {
    icon: Watch,
    category: 'Accessories',
    score: 'Needs Work',
    scoreColor: 'text-rose-500',
    scoreBg: 'bg-rose-50',
    body: 'Missing a focal point. A single statement accessory would complete the ensemble.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Analyzer() {
  const [hasImage] = useState(true); // set true to always show mock result

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-28 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md px-5 pt-10 pb-4 flex items-center">
        <Link
          href="/dashboard"
          className="p-1.5 -ml-1.5 text-espresso/50 hover:text-espresso transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={26} strokeWidth={1.5} />
        </Link>
        <h1 className="font-serif text-xl font-bold text-espresso flex-1 text-center pr-7">
          Outfit Analyzer
        </h1>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <main className="flex-1 px-5 pt-2 flex flex-col gap-6">

        {/* ── 1. Upload / Camera Zone ──────────────────────────────────── */}
        {!hasImage ? (
          /* Empty state */
          <div className="relative w-full aspect-[3/4] max-h-[520px] rounded-[28px] border-2 border-dashed border-espresso/15 bg-sand/20 flex flex-col items-center justify-center gap-5 cursor-pointer hover:bg-sand/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-espresso flex items-center justify-center shadow-lg shadow-espresso/30">
              <Camera size={26} strokeWidth={1.5} className="text-white" />
            </div>
            <div className="text-center">
              <p className="font-sans font-medium text-espresso text-sm">Snap a selfie or upload an outfit</p>
              <p className="font-sans text-xs text-espresso/40 mt-1">JPEG · PNG · up to 10 MB</p>
            </div>
          </div>
        ) : (
          /* Filled state — mock uploaded image */
          <div className="relative w-full aspect-[3/4] max-h-[520px] rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(42,35,33,0.12)]">
            <Image
              src="/assets/ai_outfit.webp"
              alt="Uploaded outfit"
              fill
              priority
              className="object-cover object-top"
            />

            {/* Scan line decoration */}
            <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent animate-pulse" />

            {/* Analysis badge — top left */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1.5">
              <Sparkles size={12} className="text-white" />
              <span className="font-sans text-[11px] font-medium text-white tracking-wide">Analysis Complete</span>
            </div>

            {/* Retake button — top right */}
            <button className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1.5 text-white text-[11px] font-sans hover:bg-white/30 transition-colors">
              <RotateCcw size={12} />
              Retake
            </button>

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-espresso/40 to-transparent" />
          </div>
        )}

        {/* ── 2. Style Score ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-5 shadow-[0_4px_24px_rgba(42,35,33,0.06)] border border-sand/60">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-widest text-espresso/40 mb-1">Overall Score</p>
            <p className="font-serif text-4xl font-bold text-espresso leading-none">
              8.5<span className="text-xl text-espresso/30 font-normal"> / 10</span>
            </p>
            <p className="font-sans text-xs text-espresso/60 mt-2 max-w-[180px] leading-relaxed">
              Excellent coordination. Just a few tweaks needed.
            </p>
          </div>

          {/* Circular gauge */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" stroke="#F1E9DD" strokeWidth="7" fill="none" />
              <circle
                cx="40" cy="40" r="34"
                stroke="#C9A876" strokeWidth="7" fill="none"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - 8.5 / 10)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif font-bold text-lg text-espresso leading-none">8.5</span>
              <span className="font-sans text-[9px] text-espresso/40 mt-0.5">/ 10</span>
            </div>
          </div>
        </div>

        {/* ── 3. Feedback Breakdown ────────────────────────────────────── */}
        <div>
          <p className="font-sans text-[11px] uppercase tracking-widest text-espresso/40 mb-3 px-1">
            Feedback Breakdown
          </p>
          <div className="flex flex-col gap-3">
            {feedbackItems.map(({ icon: Icon, category, score, scoreColor, scoreBg, body }) => (
              <div
                key={category}
                className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(42,35,33,0.05)] border border-sand/40 flex gap-4 items-start"
              >
                {/* Icon pill */}
                <div className="shrink-0 w-10 h-10 rounded-xl bg-sand/50 flex items-center justify-center mt-0.5">
                  <Icon size={18} strokeWidth={1.5} className="text-espresso/70" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-sans text-[13px] font-semibold text-espresso">{category}</span>
                    <span className={`font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full ${scoreColor} ${scoreBg}`}>
                      {score}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-espresso/60 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. AI Recommendation ─────────────────────────────────────── */}
        <div className="relative bg-espresso rounded-2xl p-5 overflow-hidden">
          {/* Decorative ring */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full border border-white/5" />
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full border border-white/5" />

          {/* Title */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles size={12} className="text-gold" />
            </div>
            <span className="font-sans text-[11px] uppercase tracking-widest text-white/50">AI Suggestion</span>
          </div>

          <p className="font-serif text-base text-white leading-relaxed mb-5">
            Add a minimalist silver watch and swap the white sneakers for leather loafers to transition this look for a business-casual meeting.
          </p>

          <button className="w-full bg-white text-espresso font-sans text-sm font-semibold py-3.5 rounded-xl hover:bg-sand transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/20">
            <Sparkles size={15} className="text-gold" />
            Find Matching Accessories
          </button>
        </div>

        {/* ── Save CTA ─────────────────────────────────────────────────── */}
        <button className="w-full border-2 border-espresso/10 text-espresso font-sans text-sm font-medium py-3.5 rounded-xl hover:bg-sand/40 transition-colors">
          Save to Lookbook
        </button>

      </main>
    </div>
  );
}
