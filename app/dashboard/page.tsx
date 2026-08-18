import Image from 'next/image';
import { Bell, Sparkles, Mic, Heart } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="px-6 pt-12 pb-28 flex flex-col gap-8 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sand">
            <Image 
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" 
              alt="User Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">Hi, Jani</h1>
            <p className="font-sans text-xs text-espresso/60">Your AI Stylist is ready</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full border border-espresso/10 flex items-center justify-center text-espresso">
          <Bell size={20} strokeWidth={1.5} />
        </button>
      </header>

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
          <span className="font-sans text-xs text-espresso/60 underline decoration-espresso/30 underline-offset-4 cursor-pointer">See all</span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {[
            { name: 'Work', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=200&auto=format&fit=crop' },
            { name: 'Gym', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=200&auto=format&fit=crop' },
            { name: 'Date', img: 'https://images.unsplash.com/photo-1627941433145-3ca08bb930f5?q=80&w=200&auto=format&fit=crop' },
            { name: 'Party', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200&auto=format&fit=crop' },
            { name: 'Travel', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=200&auto=format&fit=crop' },
          ].map((occasion) => (
            <div key={occasion.name} className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-espresso/10">
                <Image src={occasion.img} alt={occasion.name} fill className="object-cover" />
              </div>
              <span className="font-sans text-xs font-medium">{occasion.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Hero Banner */}
      <section>
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-sand to-gold/30 p-6 flex flex-col justify-end min-h-[220px]">
          <Image 
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop"
            alt="Background"
            fill
            className="object-cover opacity-20 mix-blend-overlay"
          />
          <div className="relative z-10 flex flex-col gap-3">
            <span className="inline-block px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-[10px] font-sans font-medium w-fit uppercase tracking-wider">
              Today: 31°C | Business Meeting
            </span>
            <p className="font-serif text-lg leading-snug">
              Wear the light blue shirt with navy chinos. Blue creates a professional appearance while keeping you comfortable.
            </p>
            <button className="mt-2 bg-espresso text-white text-sm font-sans px-5 py-2.5 rounded-full flex items-center w-fit gap-2 hover:bg-espresso/90 transition-colors">
              <Sparkles size={16} />
              View Outfit
            </button>
          </div>
        </div>
      </section>

      {/* Mix & Matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-lg">From Your Wardrobe</h2>
          <span className="font-sans text-xs text-espresso/60 underline decoration-espresso/30 underline-offset-4 cursor-pointer">See all</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { img: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=400&auto=format&fit=crop' },
            { img: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=400&auto=format&fit=crop' },
            { img: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=400&auto=format&fit=crop' },
            { img: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=400&auto=format&fit=crop' },
          ].map((outfit, i) => (
            <div key={i} className="relative aspect-square bg-sand/30 rounded-2xl overflow-hidden p-3 flex flex-col">
              <button className="absolute top-3 right-3 z-10 text-espresso/40 hover:text-red-500 transition-colors bg-white/50 backdrop-blur-sm rounded-full p-1.5">
                <Heart size={16} strokeWidth={2} />
              </button>
              <div className="relative flex-1 rounded-xl overflow-hidden mix-blend-multiply">
                <Image src={outfit.img} alt={`Outfit ${i}`} fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}