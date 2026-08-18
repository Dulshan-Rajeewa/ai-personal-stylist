import Image from 'next/image';
import { Camera } from 'lucide-react';

export default function Wardrobe() {
  const categories = ['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
  
  // Dummy items
  const items = [
    { id: 1, type: 'top', img: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=400&auto=format&fit=crop' },
    { id: 2, type: 'top', img: 'https://images.unsplash.com/photo-1594938298596-70f594f742f8?q=80&w=400&auto=format&fit=crop' },
    { id: 3, type: 'bottom', img: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=400&auto=format&fit=crop' },
    { id: 4, type: 'shoes', img: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=400&auto=format&fit=crop' },
    { id: 5, type: 'top', img: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?q=80&w=400&auto=format&fit=crop' },
    { id: 6, type: 'bottom', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop' },
    { id: 7, type: 'top', img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400&auto=format&fit=crop' },
    { id: 8, type: 'shoes', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop' },
    { id: 9, type: 'accessories', img: 'https://images.unsplash.com/photo-1599643477874-5c866f5c09e3?q=80&w=400&auto=format&fit=crop' },
  ];

  return (
    <div className="px-6 pt-12 pb-28 flex flex-col min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-center text-espresso">Digital Wardrobe</h1>
      </header>

      {/* Categories Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {categories.map((category, index) => (
          <button 
            key={category}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
              index === 0 ? 'bg-espresso text-white' : 'bg-sand text-espresso/80 hover:bg-sand/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Wardrobe Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center p-2">
            <div className="relative w-full h-full mix-blend-multiply">
               <Image 
                src={item.img} 
                alt={`Item ${item.id}`} 
                fill 
                className="object-contain" 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button (FAB) */}
      <button className="fixed bottom-28 right-6 w-14 h-14 bg-espresso text-white rounded-full shadow-lg shadow-espresso/30 flex items-center justify-center hover:scale-105 transition-transform z-40">
        <Camera size={24} strokeWidth={1.5} />
      </button>
    </div>
  );
}
