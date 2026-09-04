import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { getPolls } from '@/lib/actions/community';
import CommunityFeed from '@/components/CommunityFeed';
import type { CommunityPoll, PollChoice } from '@/lib/types';

async function PollsLoader() {
  const { polls, userVotes, error } = await getPolls();

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="font-sans text-sm text-espresso/50">Failed to load polls. Please try again.</p>
      </div>
    );
  }

  return (
    <CommunityFeed
      initialPolls={polls as CommunityPoll[]}
      initialUserVotes={userVotes as Record<string, PollChoice>}
    />
  );
}

export default function Community() {
  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md px-5 pt-10 pb-4 flex items-center justify-between">
        <div className="w-9" />
        <h1 className="font-serif text-xl font-bold text-espresso">Community</h1>
        {/* Create poll button — handled by client feed component */}
        <div id="create-poll-portal" className="w-9" />
      </header>

      {/* Feed */}
      <main className="px-5 pt-2 flex flex-col gap-5">
        <p className="font-sans text-[11px] uppercase tracking-widest text-espresso/40 px-1">
          Trending Polls
        </p>
        <Suspense
          fallback={
            <div className="flex flex-col gap-5">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] overflow-hidden border border-sand/50 animate-pulse">
                  <div className="h-16 bg-sand/30" />
                  <div className="h-72 bg-sand/20" />
                  <div className="h-16 bg-sand/10" />
                </div>
              ))}
            </div>
          }
        >
          <PollsLoader />
        </Suspense>
      </main>
    </div>
  );
}