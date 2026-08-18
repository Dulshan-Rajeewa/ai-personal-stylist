"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Shirt, Camera, Users, User, Sparkles } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-3 px-6 flex items-center justify-between z-50">
      <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-espresso transition-colors">
        <Home size={22} strokeWidth={2} />
        <span className="text-[10px] font-sans">Home</span>
      </Link>
      
      <Link href="/wardrobe" className="flex flex-col items-center gap-1 text-gray-400 hover:text-espresso transition-colors">
        <Shirt size={22} strokeWidth={2} />
        <span className="text-[10px] font-sans">Wardrobe</span>
      </Link>
      
      <div className="relative -top-6">
        <Link href="/analyzer" className="flex items-center justify-center w-14 h-14 bg-espresso text-white rounded-full shadow-lg shadow-espresso/30 hover:scale-105 transition-transform">
          <Sparkles size={24} strokeWidth={1.5} />
        </Link>
      </div>

      <Link href="/community" className="flex flex-col items-center gap-1 text-gray-400 hover:text-espresso transition-colors">
        <Users size={22} strokeWidth={2} />
        <span className="text-[10px] font-sans">Community</span>
      </Link>

      <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-espresso transition-colors">
        <User size={22} strokeWidth={2} />
        <span className="text-[10px] font-sans">Profile</span>
      </Link>
    </div>
  );
}
