'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Onboarding() {
  const [mounted, setMounted] = useState(false);
  const [girlLoaded, setGirlLoaded] = useState(false);

  useEffect(() => {
    // triggers the text entrance on mount, one frame after initial paint
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream overflow-hidden">
      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 text-center z-10 relative">
        <h2
          className={`
            font-sans text-sm tracking-[0.3em] text-espresso uppercase mb-2
            transition-[opacity,transform] duration-500 ease-out
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          Wear Your
        </h2>

        <h1
          className={`
            font-serif text-5xl sm:text-6xl font-bold text-espresso mb-5
            transition-[opacity,transform] duration-500 ease-out delay-100
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          CONFIDENCE
        </h1>

        <p
          className={`
            font-sans text-sm sm:text-base text-espresso/70 mb-9 max-w-[280px] sm:max-w-[320px] leading-relaxed
            transition-[opacity,transform] duration-500 ease-out delay-200
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          Stay updated with modern fashion curated just for you. Smooth checkout.
        </p>

        <Link
          href="/dashboard"
          className={`
            bg-espresso text-white font-sans text-sm font-medium tracking-wide uppercase px-8 py-3.5 rounded-full
            hover:bg-espresso/90 transition-[opacity,transform] duration-500 ease-out delay-300
            hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(42,35,33,0.3)]
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          Explore Now
        </Link>
      </div>

      {/* Bottom Image Section */}
      <div
        className="
          relative
          w-full
          h-[60vh]
          min-h-[430px]
          mt-auto
          rounded-t-[40px]
          overflow-hidden
          bg-sand/30
          shadow-[0_-10px_40px_rgba(0,0,0,0.05)]
        "
      >
        {/* Background Image - enlarged */}
        <div className="absolute inset-0">
          <Image
            src="/assets/onboarding_bg.jpg"
            alt="Background styling"
            fill
            priority
            className="object-cover object-center scale-125"
          />
        </div>

        {/* Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10" />

        {/* Girl Image - fades + rises in once loaded */}
        <div
          className={`
            absolute
            bottom-0
            left-1/2
            -translate-x-1/2
            w-[105%]
            max-w-[460px]
            h-[102%]
            z-20
            transition-[opacity,transform]
            duration-700
            ease-out
            ${girlLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
        >
          <Image
            src="/assets/onboarding_girl_low.png"
            alt="Fashion Model"
            fill
            priority
            onLoad={() => setGirlLoaded(true)}
            className="object-contain object-bottom drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}