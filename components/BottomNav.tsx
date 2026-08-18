"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Shirt, Users, User, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/wardrobe', label: 'Wardrobe', icon: Shirt },
];

const navItemsRight = [
  { href: '/community', label: 'Community', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-full shadow-[0_8px_30px_rgba(42,35,33,0.12)] border border-sand/60 py-3 px-6 flex items-center justify-between z-50">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? 'text-espresso' : 'text-espresso/35 hover:text-espresso/70'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span className="text-[10px] font-sans font-medium">{label}</span>
          </Link>
        );
      })}

      <div className="relative -top-6">
        <Link
          href="/analyzer"
          className="flex items-center justify-center w-14 h-14 bg-espresso text-white rounded-full shadow-lg shadow-espresso/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <Sparkles size={24} strokeWidth={1.5} />
        </Link>
      </div>

      {navItemsRight.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? 'text-espresso' : 'text-espresso/35 hover:text-espresso/70'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span className="text-[10px] font-sans font-medium">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}