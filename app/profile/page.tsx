import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Heart,
  CreditCard,
  Settings,
  ChevronRight,
  PencilLine,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/actions/profile';
import LogoutButton from '@/components/LogoutButton';

// ─── Menu items ───────────────────────────────────────────────────────────────

const menuItems = [
  {
    icon: Sparkles,
    label: 'Style Profile',
    sublabel: 'Update your preferences',
    href: '#',
  },
  {
    icon: Heart,
    label: 'My Saved Outfits',
    sublabel: null,
    href: '#',
  },
  {
    icon: CreditCard,
    label: 'Shopping Budget',
    sublabel: null,
    href: '#',
  },
  {
    icon: Settings,
    label: 'App Settings',
    sublabel: null,
    href: '#',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Profile() {
  const { profile, wardrobeCount } = await getProfile();

  const firstName = profile?.full_name ?? 'Stylist';
  const handle = firstName.toLowerCase().replace(/\s+/g, '') + 'styles';
  const avatarUrl =
    profile?.avatar_url ??
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop';
  const avgScore = profile?.avg_style_score ?? 0;

  const stats = [
    { value: avgScore > 0 ? avgScore.toFixed(1) : '—', label: 'Avg. Style Score' },
    { value: wardrobeCount.toString(), label: 'Wardrobe Items' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-28">

      {/* ── Top decorative band ─────────────────────────────────────────── */}
      <div className="h-36 bg-gradient-to-br from-sand via-gold/20 to-sand w-full" />

      {/* ── Avatar (overlaps the band) ───────────────────────────────────── */}
      <div className="flex flex-col items-center -mt-14 px-5">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-cream shadow-[0_8px_30px_rgba(42,35,33,0.15)]">
          <Image
            src={avatarUrl}
            alt="Profile avatar"
            fill
            className="object-cover"
            priority
          />
        </div>

        <h1 className="font-serif text-2xl font-bold text-espresso mt-4 leading-tight">
          {profile?.full_name ?? 'Your Profile'}
        </h1>
        <p className="font-sans text-xs text-espresso/40 mt-1 tracking-wide">@{handle}</p>

        <button className="mt-4 flex items-center gap-1.5 border border-espresso/15 rounded-full px-5 py-2 text-[12px] font-sans font-medium text-espresso hover:bg-sand/50 transition-colors">
          <PencilLine size={12} strokeWidth={2} />
          Edit Profile
        </button>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <div className="mx-5 mt-6 bg-white rounded-2xl flex shadow-[0_4px_20px_rgba(42,35,33,0.06)] border border-sand/50 overflow-hidden">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex-1 relative">
            {i > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-px bg-sand" />
            )}
            <div className="flex flex-col items-center justify-center py-5 gap-1">
              <span className="font-serif text-3xl font-bold text-espresso leading-none">
                {stat.value}
              </span>
              <span className="font-sans text-[11px] text-espresso/40 text-center">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Menu ────────────────────────────────────────────────────────── */}
      <div className="mx-5 mt-6">
        <p className="font-sans text-[11px] uppercase tracking-widest text-espresso/40 mb-3 px-1">
          Preferences
        </p>

        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(42,35,33,0.06)] border border-sand/50 overflow-hidden">
          {menuItems.map(({ icon: Icon, label, sublabel, href }, i) => (
            <div key={label}>
              <Link
                href={href}
                className="flex items-center gap-4 px-5 py-4 hover:bg-sand/20 active:bg-sand/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-sand/60 flex items-center justify-center shrink-0">
                  <Icon size={16} strokeWidth={1.5} className="text-espresso/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-espresso">{label}</p>
                  {sublabel && (
                    <p className="font-sans text-[11px] text-espresso/40 mt-0.5">{sublabel}</p>
                  )}
                </div>
                <ChevronRight size={16} strokeWidth={1.5} className="text-espresso/25 shrink-0" />
              </Link>
              {i < menuItems.length - 1 && (
                <div className="mx-5 h-px bg-sand/70" />
              )}
            </div>
          ))}
        </div>

        {/* ── Logout ──────────────────────────────────────────────────── */}
        <div className="mt-3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(42,35,33,0.06)] border border-sand/50 overflow-hidden">
          <LogoutButton />
        </div>

        <p className="text-center font-sans text-[10px] text-espresso/25 mt-6">
          AI Personal Stylist · v1.0.0
        </p>
      </div>
    </div>
  );
}
