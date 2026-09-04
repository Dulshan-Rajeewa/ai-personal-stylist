'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type AuthTab = 'signin' | 'signup';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';

  const [tab, setTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  const handleSignIn = () => {
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Welcome back!');
      router.push(redirectTo);
      router.refresh();
    });
  };

  const handleSignUp = () => {
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    startTransition(async () => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Account created! Check your email to confirm, then sign in.');
      setTab('signin');
    });
  };

  const inputBase =
    'w-full bg-sand/60 border border-espresso/10 rounded-2xl px-4 py-3.5 text-sm font-sans text-espresso placeholder:text-espresso/35 outline-none focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 transition-all';

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-cream px-6 py-12">
      {/* Logo mark */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-espresso rounded-[20px] flex items-center justify-center shadow-[0_12px_40px_rgba(42,35,33,0.3)] mb-4">
          <Sparkles size={28} strokeWidth={1.5} className="text-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-espresso">Stylist</h1>
        <p className="font-sans text-xs text-espresso/40 mt-1 tracking-wide">
          Your AI Personal Stylist
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-[28px] shadow-[0_8px_40px_rgba(42,35,33,0.10)] border border-sand/60 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-sand/70">
          {(['signin', 'signup'] as AuthTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 font-sans text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-espresso border-b-2 border-espresso -mb-px'
                  : 'text-espresso/40 hover:text-espresso/60'
              }`}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-3">
          {tab === 'signup' && (
            <div>
              <label className="font-sans text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-1.5 block">
                Full Name
              </label>
              <input
                id="full-name"
                type="text"
                placeholder="Jani Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputBase}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="font-sans text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-1.5 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputBase}
              autoComplete="email"
              onKeyDown={(e) => e.key === 'Enter' && (tab === 'signin' ? handleSignIn() : handleSignUp())}
            />
          </div>

          <div>
            <label className="font-sans text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBase} pr-12`}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                onKeyDown={(e) => e.key === 'Enter' && (tab === 'signin' ? handleSignIn() : handleSignUp())}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-espresso/30 hover:text-espresso/60 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id={tab === 'signin' ? 'btn-signin' : 'btn-signup'}
            onClick={tab === 'signin' ? handleSignIn : handleSignUp}
            disabled={isPending || !email || !password}
            className="mt-2 w-full bg-espresso text-white font-sans text-sm font-medium py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-espresso/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_20px_rgba(42,35,33,0.25)]"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <p className="font-sans text-[10px] text-espresso/25 mt-8">
        AI Personal Stylist · v1.0.0
      </p>
    </div>
  );
}
