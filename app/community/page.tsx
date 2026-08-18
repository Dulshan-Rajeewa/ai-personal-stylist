'use client';

import Image from 'next/image';
import { Plus, MessageCircle, Send } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const polls = [
  {
    id: 1,
    user: 'Sarah M.',
    handle: '@sarahstyles',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    time: '2 hrs ago',
    context: 'Date Night',
    question: 'Which one should I wear tonight?',
    outfitA: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    outfitB: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop',
    voteA: 65,
    voteB: 35,
    comments: 14,
  },
  {
    id: 2,
    user: 'Mia K.',
    handle: '@miakumar',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop',
    time: '5 hrs ago',
    context: 'Work Presentation',
    question: 'Professional enough? Which fits better?',
    outfitA: 'https://images.unsplash.com/photo-1585240975858-7264fd020798?q=80&w=600&auto=format&fit=crop',
    outfitB: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=600&auto=format&fit=crop',
    voteA: 42,
    voteB: 58,
    comments: 8,
  },
];

// ─── Poll Card ────────────────────────────────────────────────────────────────

function PollCard({ poll }: { poll: (typeof polls)[0] }) {
  const winnerA = poll.voteA >= poll.voteB;

  return (
    <article className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(42,35,33,0.06)] border border-sand/50">
      {/* User info */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-sand">
          <Image src={poll.avatar} alt={poll.user} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm font-semibold text-espresso leading-tight">{poll.user}</p>
          <p className="font-sans text-[11px] text-espresso/40 mt-0.5">
            {poll.time} · {poll.context}
          </p>
        </div>
      </div>

      {/* Question */}
      <p className="font-serif text-base font-semibold text-espresso px-5 pb-4 leading-snug">
        {poll.question}
      </p>

      {/* Outfit images + VS badge */}
      <div className="relative px-4 flex gap-2">
        {/* Outfit A */}
        <div className="flex-1 aspect-[2/3] relative rounded-2xl overflow-hidden">
          <Image src={poll.outfitA} alt="Outfit A" fill className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className="absolute bottom-3 left-3 font-sans text-[11px] font-bold text-white tracking-wider">A</span>
        </div>

        {/* VS Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-cream rounded-full border-2 border-sand flex items-center justify-center shadow-md">
          <span className="font-serif text-[9px] font-black text-espresso">VS</span>
        </div>

        {/* Outfit B */}
        <div className="flex-1 aspect-[2/3] relative rounded-2xl overflow-hidden">
          <Image src={poll.outfitB} alt="Outfit B" fill className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className="absolute bottom-3 right-3 font-sans text-[11px] font-bold text-white tracking-wider">B</span>
        </div>
      </div>

      {/* Voting bars */}
      <div className="px-5 pt-4 pb-1 flex gap-3 items-center">
        {/* A bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-sans text-[11px] font-semibold text-espresso">Outfit A</span>
            <span className={`font-sans text-[11px] font-bold ${winnerA ? 'text-espresso' : 'text-espresso/40'}`}>
              {poll.voteA}%
            </span>
          </div>
          <div className="h-1.5 bg-sand rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${winnerA ? 'bg-espresso' : 'bg-espresso/30'}`}
              style={{ width: `${poll.voteA}%` }}
            />
          </div>
        </div>

        <div className="w-px h-6 bg-sand mx-1" />

        {/* B bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-sans text-[11px] font-semibold text-espresso">Outfit B</span>
            <span className={`font-sans text-[11px] font-bold ${!winnerA ? 'text-espresso' : 'text-espresso/40'}`}>
              {poll.voteB}%
            </span>
          </div>
          <div className="h-1.5 bg-sand rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${!winnerA ? 'bg-espresso' : 'bg-espresso/30'}`}
              style={{ width: `${poll.voteB}%` }}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mt-4 h-px bg-sand/60" />

      {/* Actions */}
      <div className="px-5 py-3.5 flex items-center gap-5">
        <button className="flex items-center gap-2 text-espresso/50 hover:text-espresso transition-colors">
          <MessageCircle size={17} strokeWidth={1.5} />
          <span className="font-sans text-xs">{poll.comments} comments</span>
        </button>
        <button className="flex items-center gap-2 text-espresso/50 hover:text-espresso transition-colors ml-auto">
          <Send size={15} strokeWidth={1.5} />
          <span className="font-sans text-xs">Share</span>
        </button>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Community() {
  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md px-5 pt-10 pb-4 flex items-center justify-between">
        <div className="w-9" /> {/* spacer */}
        <h1 className="font-serif text-xl font-bold text-espresso">Community</h1>
        <button
          aria-label="Create Poll"
          className="w-9 h-9 bg-espresso rounded-full flex items-center justify-center text-white shadow-md shadow-espresso/20 hover:bg-espresso/80 active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </header>

      {/* Feed */}
      <main className="px-5 pt-2 flex flex-col gap-5">
        <p className="font-sans text-[11px] uppercase tracking-widest text-espresso/40 px-1">
          Trending Polls
        </p>
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </main>
    </div>
  );
}