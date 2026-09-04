'use client';

import { useState, useRef, useCallback, useTransition } from 'react';
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
  Upload,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { OutfitAnalysisResult } from '@/lib/types';
import { AnalysisCardSkeleton } from '@/components/ui/Skeleton';

// ─── Score gauge ──────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 10);

  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} stroke="#F1E9DD" strokeWidth="7" fill="none" />
        <circle
          cx="40" cy="40" r={radius}
          stroke="#C9A876" strokeWidth="7" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif font-bold text-lg text-espresso leading-none">
          {score.toFixed(1)}
        </span>
        <span className="font-sans text-[9px] text-espresso/40 mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

// ─── Feedback icons ───────────────────────────────────────────────────────────

function getScoreLabel(feedback: string): { label: string; color: string; bg: string } {
  // Simple heuristic — AI feedback often starts with positive/negative words
  const lower = feedback.toLowerCase();
  if (
    lower.startsWith('perfect') ||
    lower.startsWith('excellent') ||
    lower.startsWith('outstanding') ||
    lower.startsWith('great')
  ) {
    return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  }
  if (
    lower.startsWith('good') ||
    lower.startsWith('nice') ||
    lower.startsWith('well')
  ) {
    return { label: 'Good', color: 'text-amber-600', bg: 'bg-amber-50' };
  }
  return { label: 'Needs Work', color: 'text-rose-500', bg: 'bg-rose-50' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Analyzer() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<OutfitAnalysisResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysis(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!imageFile) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch('/api/analyze-outfit', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
        toast.error(err.error ?? 'Analysis failed');
        return;
      }

      const result = await res.json() as OutfitAnalysisResult;
      setAnalysis(result);
      toast.success('Analysis complete!');
    });
  }, [imageFile]);

  const handleRetake = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
  }, []);

  const feedbackSections = analysis
    ? [
        {
          icon: Palette,
          category: 'Color Matching',
          body: analysis.colorFeedback,
          ...getScoreLabel(analysis.colorFeedback),
        },
        {
          icon: Scissors,
          category: 'Fit & Silhouette',
          body: analysis.fitFeedback,
          ...getScoreLabel(analysis.fitFeedback),
        },
        {
          icon: Watch,
          category: 'Accessories',
          body: analysis.accessoryFeedback,
          ...getScoreLabel(analysis.accessoryFeedback),
        },
      ]
    : [];

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

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />

        {/* ── 1. Upload / Camera Zone ──────────────────────────────────── */}
        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full aspect-[3/4] max-h-[520px] rounded-[28px] border-2 border-dashed border-espresso/15 bg-sand/20 flex flex-col items-center justify-center gap-5 cursor-pointer hover:bg-sand/40 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-espresso flex items-center justify-center shadow-lg shadow-espresso/30">
              <Camera size={26} strokeWidth={1.5} className="text-white" />
            </div>
            <div className="text-center">
              <p className="font-sans font-medium text-espresso text-sm">Snap a selfie or upload an outfit</p>
              <p className="font-sans text-xs text-espresso/40 mt-1">JPEG · PNG · up to 10 MB</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                className="flex items-center gap-2 px-4 py-2 bg-espresso/5 rounded-full text-xs font-sans text-espresso/60 hover:bg-espresso/10 transition-colors"
              >
                <Camera size={14} />
                Camera
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-espresso/5 rounded-full text-xs font-sans text-espresso/60 hover:bg-espresso/10 transition-colors"
              >
                <Upload size={14} />
                Gallery
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full aspect-[3/4] max-h-[520px] rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(42,35,33,0.12)]">
            <Image
              src={imagePreview}
              alt="Uploaded outfit"
              fill
              priority
              className="object-cover object-top"
            />

            {/* Scan overlay while analyzing */}
            {isPending && (
              <>
                <div className="absolute inset-0 bg-espresso/20" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-6 py-4 flex flex-col items-center gap-3">
                    <Loader2 size={28} className="text-white animate-spin" />
                    <span className="font-sans text-sm font-medium text-white">Analyzing outfit...</span>
                  </div>
                </div>
              </>
            )}

            {/* Analysis badge */}
            {analysis && !isPending && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1.5">
                <Sparkles size={12} className="text-white" />
                <span className="font-sans text-[11px] font-medium text-white tracking-wide">Analysis Complete</span>
              </div>
            )}

            {/* Retake */}
            <button
              onClick={handleRetake}
              className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1.5 text-white text-[11px] font-sans hover:bg-white/30 transition-colors"
            >
              <RotateCcw size={12} />
              Retake
            </button>

            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-espresso/40 to-transparent" />
          </div>
        )}

        {/* ── Analyze Button (when image selected but not yet analyzed) ── */}
        {imagePreview && !analysis && !isPending && (
          <button
            id="btn-analyze"
            onClick={handleAnalyze}
            className="w-full bg-espresso text-white font-sans text-sm font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-espresso/90 active:scale-[0.98] transition-all shadow-[0_6px_20px_rgba(42,35,33,0.25)]"
          >
            <Sparkles size={18} className="text-gold" />
            Analyze This Outfit
          </button>
        )}

        {/* ── Loading Skeletons ─────────────────────────────────────────── */}
        {isPending && (
          <>
            <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-5 shadow-sm border border-sand/60">
              <div className="flex flex-col gap-2">
                <div className="h-3 w-24 bg-sand/60 rounded animate-pulse" />
                <div className="h-10 w-20 bg-sand/60 rounded-xl animate-pulse" />
              </div>
              <div className="w-20 h-20 rounded-full bg-sand/60 animate-pulse" />
            </div>
            {[...Array(3)].map((_, i) => <AnalysisCardSkeleton key={i} />)}
          </>
        )}

        {/* ── 2. Style Score ───────────────────────────────────────────── */}
        {analysis && !isPending && (
          <>
            <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-5 shadow-[0_4px_24px_rgba(42,35,33,0.06)] border border-sand/60">
              <div>
                <p className="font-sans text-[11px] uppercase tracking-widest text-espresso/40 mb-1">
                  Overall Score
                </p>
                <p className="font-serif text-4xl font-bold text-espresso leading-none">
                  {analysis.score.toFixed(1)}
                  <span className="text-xl text-espresso/30 font-normal"> / 10</span>
                </p>
                <p className="font-sans text-xs text-espresso/60 mt-2 max-w-[180px] leading-relaxed">
                  {analysis.score >= 8
                    ? 'Excellent coordination. Barely any tweaks needed.'
                    : analysis.score >= 6
                    ? 'Good outfit. A few tweaks would elevate it.'
                    : 'Room for improvement — check the feedback below.'}
                </p>
              </div>
              <ScoreGauge score={analysis.score} />
            </div>

            {/* ── 3. Feedback Breakdown ───────────────────────────────── */}
            <div>
              <p className="font-sans text-[11px] uppercase tracking-widest text-espresso/40 mb-3 px-1">
                Feedback Breakdown
              </p>
              <div className="flex flex-col gap-3">
                {feedbackSections.map(({ icon: Icon, category, label, color, bg, body }) => (
                  <div
                    key={category}
                    className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(42,35,33,0.05)] border border-sand/40 flex gap-4 items-start"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-sand/50 flex items-center justify-center mt-0.5">
                      <Icon size={18} strokeWidth={1.5} className="text-espresso/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-sans text-[13px] font-semibold text-espresso">{category}</span>
                        <span className={`font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full ${color} ${bg}`}>
                          {label}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-espresso/60 leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 4. AI Suggestion ────────────────────────────────────── */}
            <div className="relative bg-espresso rounded-2xl p-5 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full border border-white/5" />
              <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full border border-white/5" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles size={12} className="text-gold" />
                </div>
                <span className="font-sans text-[11px] uppercase tracking-widest text-white/50">AI Suggestion</span>
              </div>
              <p className="font-serif text-base text-white leading-relaxed mb-5">
                {analysis.suggestion}
              </p>
              <button className="w-full bg-white text-espresso font-sans text-sm font-semibold py-3.5 rounded-xl hover:bg-sand transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/20">
                <Sparkles size={15} className="text-gold" />
                Find Matching Accessories
              </button>
            </div>

            {/* ── Save CTA ────────────────────────────────────────────── */}
            <button className="w-full border-2 border-espresso/10 text-espresso font-sans text-sm font-medium py-3.5 rounded-xl hover:bg-sand/40 transition-colors">
              Save to Lookbook
            </button>
          </>
        )}
      </main>
    </div>
  );
}
