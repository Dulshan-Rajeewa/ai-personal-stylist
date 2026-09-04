import { Suspense } from 'react';
import Image from 'next/image';
import { Bell, Sparkles, Mic, MapPin, Thermometer } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getWardrobeItems } from '@/lib/actions/wardrobe';
import { HeroCardSkeleton, WardrobeItemSkeleton } from '@/components/ui/Skeleton';
import type { DailyOutfitResponse, WardrobeItem } from '@/lib/types';

// ─── Daily Outfit Hero (async sub-component) ─────────────────────────────────

async function DailyOutfitHero() {
  let recommendation: DailyOutfitResponse | null = null;

  try {
    // Use server-relative URL for internal API calls in App Router
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : ''}` // handled below
      : '';
    // Call our own route handler — works in server components via absolute URL
    const appUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const res = await fetch(`${appUrl}/api/daily-outfit`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      recommendation = await res.json() as DailyOutfitResponse;
    }
  } catch (err) {
    console.error('DailyOutfitHero error:', err);
  }

  if (!recommendation) {
    return (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-sand to-gold/30 p-6 flex flex-col justify-end min-h-[220px]">
        <div className="relative z-10 flex flex-col gap-3">
          <span className="inline-block px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-[10px] font-sans font-medium w-fit uppercase tracking-wider">
            Today&apos;s Recommendation
          </span>
          <p className="font-serif text-lg leading-snug">
            Add items to your wardrobe to get personalized outfit recommendations.
          </p>
        </div>
      </div>
    );
  }

  const weatherLabel = `${recommendation.temperature}°C · ${recommendation.condition}`;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-sand to-gold/30 p-6 flex flex-col justify-end min-h-[220px]">
      <Image
        src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop"
        alt="Background"
        fill
        className="object-cover opacity-20 mix-blend-overlay"
      />
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-[10px] font-sans font-medium uppercase tracking-wider">
            <Thermometer size={10} />
            {weatherLabel}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-[10px] font-sans uppercase tracking-wider">
            <MapPin size={10} />
            {recommendation.location}
          </span>
        </div>
        <p className="font-serif text-lg leading-snug">{recommendation.rationale}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {recommendation.outfit.map((item, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-white/50 backdrop-blur-sm rounded-full text-[10px] font-sans text-espresso/80"
            >
              {item}
            </span>
          ))}
        </div>
        <button className="mt-1 bg-espresso text-white text-sm font-sans px-5 py-2.5 rounded-full flex items-center w-fit gap-2 hover:bg-espresso/90 transition-colors">
          <Sparkles size={16} />
          View Outfit
        </button>
      </div>
    </div>
  );
}

// ─── Wardrobe Grid (async sub-component) ─────────────────────────────────────

async function RecentWardrobeItems() {
  const { items } = await getWardrobeItems();
  const recent = items.slice(0, 4);

  if (recent.length === 0) {
    return (
      <div className="text-center py-8 bg-sand/20 rounded-2xl">
        <p className="font-sans text-sm text-espresso/50">
          No wardrobe items yet. Add items from the Wardrobe tab.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {recent.map((item: WardrobeItem) => (
        <div
          key={item.id}
          className="relative aspect-square bg-sand/30 rounded-2xl overflow-hidden p-3 flex flex-col"
        >
          <div className="relative flex-1 rounded-xl overflow-hidden">
            <Image
              src={item.image_url}
              alt={item.category}
              fill
              sizes="200px"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="mt-2">
            <p className="font-sans text-xs font-semibold text-espresso truncate capitalize">
              {item.color ? `${item.color} ` : ''}{item.category}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── User Header (async) ──────────────────────────────────────────────────────

async function UserHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user?.id ?? '')
    .single();

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const avatarUrl =
    profile?.avatar_url ??
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop';

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sand">
          <Image
            src={avatarUrl}
            alt="User Avatar"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold">Hi, {firstName}</h1>
          <p className="font-sans text-xs text-espresso/60">Your AI Stylist is ready</p>
        </div>
      </div>
      <button
        aria-label="Notifications"
        className="w-10 h-10 rounded-full border border-espresso/10 flex items-center justify-center text-espresso"
      >
        <Bell size={20} strokeWidth={1.5} />
      </button>
    </header>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const occasions = [
  { name: 'Work', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=200&auto=format&fit=crop' },
  { name: 'Gym', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=200&auto=format&fit=crop' },
  { name: 'Date', img: 'https://images.unsplash.com/photo-1627941433145-3ca08bb930f5?q=80&w=200&auto=format&fit=crop' },
  { name: 'Party', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200&auto=format&fit=crop' },
  { name: 'Travel', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=200&auto=format&fit=crop' },
];

export default function Dashboard() {
  return (
    <div className="px-6 pt-12 pb-28 flex flex-col gap-8 min-h-screen">
      {/* Header */}
      <Suspense
        fallback={
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sand/60 animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="h-6 w-28 bg-sand/60 rounded-lg animate-pulse" />
              <div className="h-3 w-36 bg-sand/40 rounded animate-pulse" />
            </div>
          </div>
        }
      >
        <UserHeader />
      </Suspense>

      {/* Search Bar */}
      <div className="relative flex items-center w-full bg-sand/50 rounded-full px-4 py-3">
        <Sparkles size={20} className="text-espresso/40 mr-2" />
        <input
          type="text"
          placeholder="Ask AI for style advice..."
          className="bg-transparent flex-1 outline-none text-sm font-sans placeholder:text-espresso/40"
        />
        <Mic size={20} className="text-espresso/40 ml-2" />
      </div>

      {/* Occasions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-lg">Style by Occasion</h2>
          <span className="font-sans text-xs text-espresso/60 underline decoration-espresso/30 underline-offset-4 cursor-pointer">
            See all
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {occasions.map((occasion) => (
            <div key={occasion.name} className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-espresso/10">
                <Image src={occasion.img} alt={occasion.name} fill className="object-cover" />
              </div>
              <span className="font-sans text-xs font-medium">{occasion.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Outfit Hero */}
      <section>
        <Suspense fallback={<HeroCardSkeleton />}>
          <DailyOutfitHero />
        </Suspense>
      </section>

      {/* Recent Wardrobe Items */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-lg">From Your Wardrobe</h2>
          <span className="font-sans text-xs text-espresso/60 underline decoration-espresso/30 underline-offset-4 cursor-pointer">
            See all
          </span>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <WardrobeItemSkeleton key={i} />
              ))}
            </div>
          }
        >
          <RecentWardrobeItems />
        </Suspense>
      </section>
    </div>
  );
}