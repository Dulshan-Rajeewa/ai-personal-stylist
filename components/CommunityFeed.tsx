'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Plus, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { castVote } from '@/lib/actions/community';
import { createClient } from '@/lib/supabase/client';
import CreatePollModal from '@/components/CreatePollModal';
import type { CommunityPoll, PollChoice } from '@/lib/types';

interface PollState {
  votes_a: number;
  votes_b: number;
  userVote: PollChoice | null;
}

// ─── Poll Card ────────────────────────────────────────────────────────────────

function PollCard({
  poll,
  initialUserVote,
}: {
  poll: CommunityPoll;
  initialUserVote: PollChoice | null;
}) {
  const [state, setState] = useState<PollState>({
    votes_a: poll.votes_a,
    votes_b: poll.votes_b,
    userVote: initialUserVote,
  });
  const [isPending, startTransition] = useTransition();

  const total = state.votes_a + state.votes_b;
  const pctA = total > 0 ? Math.round((state.votes_a / total) * 100) : 50;
  const pctB = total > 0 ? Math.round((state.votes_b / total) * 100) : 50;
  const winnerA = state.votes_a >= state.votes_b;

  // Real-time subscription for this poll
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`poll-${poll.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_polls',
          filter: `id=eq.${poll.id}`,
        },
        (payload) => {
          const updated = payload.new as CommunityPoll;
          setState((prev) => ({
            ...prev,
            votes_a: updated.votes_a,
            votes_b: updated.votes_b,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll.id]);

  const handleVote = (choice: PollChoice) => {
    if (state.userVote) {
      toast('You already voted on this poll');
      return;
    }

    // Optimistic update
    setState((prev) => ({
      votes_a: choice === 'A' ? prev.votes_a + 1 : prev.votes_a,
      votes_b: choice === 'B' ? prev.votes_b + 1 : prev.votes_b,
      userVote: choice,
    }));

    startTransition(async () => {
      const result = await castVote(poll.id, choice);
      if (!result.success) {
        // Revert on failure
        setState((prev) => ({
          votes_a: choice === 'A' ? prev.votes_a - 1 : prev.votes_a,
          votes_b: choice === 'B' ? prev.votes_b - 1 : prev.votes_b,
          userVote: null,
        }));
        if (result.alreadyVoted) {
          toast('You already voted on this poll');
        } else {
          toast.error(result.error ?? 'Vote failed');
        }
      }
    });
  };

  const avatarUrl =
    poll.profiles?.avatar_url ??
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(poll.profiles?.full_name ?? 'U')}`;

  return (
    <article className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(42,35,33,0.06)] border border-sand/50">
      {/* User info */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-sand">
          <Image src={avatarUrl} alt={poll.profiles?.full_name ?? 'User'} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm font-semibold text-espresso leading-tight">
            {poll.profiles?.full_name ?? 'Stylist Community'}
          </p>
          <p className="font-sans text-[11px] text-espresso/40 mt-0.5">
            {new Date(poll.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {poll.occasion ? ` · ${poll.occasion}` : ''}
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
        <button
          onClick={() => handleVote('A')}
          disabled={!!state.userVote || isPending}
          className={`flex-1 aspect-[2/3] relative rounded-2xl overflow-hidden transition-all ${
            state.userVote === 'A'
              ? 'ring-4 ring-espresso ring-offset-2'
              : state.userVote
              ? 'opacity-60'
              : 'hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <Image src={poll.image_a_url} alt="Outfit A" fill className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {state.userVote === 'A' && (
            <div className="absolute inset-0 bg-espresso/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-white" />
            </div>
          )}
          <span className="absolute bottom-3 left-3 font-sans text-[11px] font-bold text-white tracking-wider">A</span>
        </button>

        {/* VS Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-cream rounded-full border-2 border-sand flex items-center justify-center shadow-md">
          <span className="font-serif text-[9px] font-black text-espresso">VS</span>
        </div>

        {/* Outfit B */}
        <button
          onClick={() => handleVote('B')}
          disabled={!!state.userVote || isPending}
          className={`flex-1 aspect-[2/3] relative rounded-2xl overflow-hidden transition-all ${
            state.userVote === 'B'
              ? 'ring-4 ring-espresso ring-offset-2'
              : state.userVote
              ? 'opacity-60'
              : 'hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <Image src={poll.image_b_url} alt="Outfit B" fill className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {state.userVote === 'B' && (
            <div className="absolute inset-0 bg-espresso/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-white" />
            </div>
          )}
          <span className="absolute bottom-3 right-3 font-sans text-[11px] font-bold text-white tracking-wider">B</span>
        </button>
      </div>

      {/* Vote bars — shown only after voting */}
      {state.userVote && (
        <div className="px-5 pt-4 pb-1 flex gap-3 items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans text-[11px] font-semibold text-espresso">Outfit A</span>
              <span className={`font-sans text-[11px] font-bold ${winnerA ? 'text-espresso' : 'text-espresso/40'}`}>
                {pctA}%
              </span>
            </div>
            <div className="h-1.5 bg-sand rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${winnerA ? 'bg-espresso' : 'bg-espresso/30'}`}
                style={{ width: `${pctA}%` }}
              />
            </div>
          </div>

          <div className="w-px h-6 bg-sand mx-1" />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans text-[11px] font-semibold text-espresso">Outfit B</span>
              <span className={`font-sans text-[11px] font-bold ${!winnerA ? 'text-espresso' : 'text-espresso/40'}`}>
                {pctB}%
              </span>
            </div>
            <div className="h-1.5 bg-sand rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${!winnerA ? 'bg-espresso' : 'bg-espresso/30'}`}
                style={{ width: `${pctB}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Prompt to vote */}
      {!state.userVote && (
        <p className="font-sans text-[11px] text-espresso/40 text-center pt-4 pb-1">
          Tap an outfit to vote
        </p>
      )}

      {/* Divider */}
      <div className="mx-5 mt-4 h-px bg-sand/60" />

      {/* Actions */}
      <div className="px-5 py-3.5 flex items-center gap-5">
        <button className="flex items-center gap-2 text-espresso/50 hover:text-espresso transition-colors">
          <MessageCircle size={17} strokeWidth={1.5} />
          <span className="font-sans text-xs">Comment</span>
        </button>
        <button className="flex items-center gap-2 text-espresso/50 hover:text-espresso transition-colors ml-auto">
          <Send size={15} strokeWidth={1.5} />
          <span className="font-sans text-xs">Share</span>
        </button>
      </div>
    </article>
  );
}

// ─── Community Feed (Client Component wrapper) ────────────────────────────────

export default function CommunityFeed({
  initialPolls,
  initialUserVotes,
}: {
  initialPolls: CommunityPoll[];
  initialUserVotes: Record<string, PollChoice>;
}) {
  const [polls] = useState<CommunityPoll[]>(initialPolls);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      {/* Floating create poll button */}
      <div className="fixed top-10 right-5 z-40">
        <button
          id="btn-create-poll"
          aria-label="Create Poll"
          onClick={() => setShowCreateModal(true)}
          className="w-9 h-9 bg-espresso rounded-full flex items-center justify-center text-white shadow-md shadow-espresso/20 hover:bg-espresso/80 active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-sans text-sm text-espresso/50">No polls yet.</p>
          <p className="font-sans text-xs text-espresso/40 mt-1">
            Be the first to post an outfit poll!
          </p>
        </div>
      ) : (
        polls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            initialUserVote={initialUserVotes[poll.id] ?? null}
          />
        ))
      )}

      <CreatePollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
