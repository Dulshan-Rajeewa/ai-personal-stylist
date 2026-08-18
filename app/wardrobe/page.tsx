'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, Heart, Sparkles } from 'lucide-react';

const categories = ['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];

const items = [
  { id: 1, name: 'White Tee', type: 'Tops', img: 'https://images.unsplash.com/photo-1467043237213-65f2da53396f?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'V-Neck Set', type: 'Tops', img: 'https://images.unsplash.com/photo-1548768041-2fceab4c0b85?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Denim Fit', type: 'Bottoms', img: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=400&auto=format&fit=crop' },
  { id: 4, name: 'Everyday Sneaker', type: 'Shoes', img: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=400&auto=format&fit=crop' },
  { id: 5, name: 'Linen Shirt', type: 'Tops', img: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?q=80&w=400&auto=format&fit=crop' },
  { id: 6, name: 'Tailored Trouser', type: 'Bottoms', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop' },
  { id: 7, name: 'Casual Knit', type: 'Tops', img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400&auto=format&fit=crop' },
  { id: 8, name: 'Classic Oxford', type: 'Shoes', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop' },
  { id: 9, name: 'Leather Belt', type: 'Accessories', img: 'https://images.unsplash.com/photo-1603805752838-aa579d77da72?q=80&w=400&auto=format&fit=crop' },
];

export default function Wardrobe() {
  const [active, setActive] = useState('All');
  const [saved, setSaved] = useState<number[]>([]);

  const toggleSave = (id: number) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const visibleItems =
    active === 'All' ? items : items.filter((item) => item.type === active);

  return (
    <div className="px-6 pt-12 pb-28 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <header className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-serif text-2xl font-bold text-espresso">Digital Wardrobe</h1>
          <p className="font-sans text-xs text-espresso/60 mt-0.5">
            {items.length} items curated for you
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center">
          <Sparkles size={18} className="text-espresso/60" strokeWidth={1.5} />
        </div>
      </header>

      {/* Categories Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 -mx-6 px-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActive(category)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
              active === category
                ? 'bg-espresso text-white'
                : 'bg-sand text-espresso/70 hover:bg-sand/70'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Wardrobe Grid */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square bg-sand/40 rounded-2xl overflow-hidden p-4 flex flex-col group"
          >
            <button
              onClick={() => toggleSave(item.id)}
              aria-label={`Save ${item.name}`}
              className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-cream/80 backdrop-blur-sm transition-colors"
            >
              <Heart
                size={14}
                strokeWidth={2}
                className={saved.includes(item.id) ? 'fill-espresso text-espresso' : 'text-espresso/50'}
              />
            </button>

            <div className="relative flex-1 rounded-xl overflow-hidden">
              <Image
                src={item.img}
                alt={item.name}
                fill
                sizes="200px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="mt-2">
              <p className="font-sans text-xs font-semibold text-espresso truncate">
                {item.name}
              </p>
              <p className="font-sans text-[10px] text-espresso/50">{item.type}</p>
            </div>
          </div>
        ))}
      </div>

      {visibleItems.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
          <p className="font-sans text-sm text-espresso/50">No items in this category yet.</p>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        aria-label="Add item"
        className="fixed bottom-28 right-6 w-14 h-14 bg-espresso text-white rounded-full shadow-lg shadow-espresso/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Camera size={22} strokeWidth={1.5} />
      </button>
    </div>
  );
}