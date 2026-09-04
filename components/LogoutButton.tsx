'use client';

import { useTransition } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { signOut } from '@/lib/actions/auth';

/**
 * Client component wrapper for the logout button.
 * Uses a server action (signOut) via useTransition for loading state.
 */
export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <button
      id="btn-logout"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-rose-50/60 active:bg-rose-50 transition-colors group disabled:opacity-60"
    >
      <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
        {isPending ? (
          <Loader2 size={16} strokeWidth={1.5} className="text-rose-400 animate-spin" />
        ) : (
          <LogOut size={16} strokeWidth={1.5} className="text-rose-400" />
        )}
      </div>
      <span className="font-sans text-sm font-medium text-rose-400 group-hover:text-rose-500 transition-colors">
        {isPending ? 'Signing out...' : 'Log Out'}
      </span>
    </button>
  );
}
