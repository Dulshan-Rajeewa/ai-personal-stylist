'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Heart, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getWardrobeItems, deleteWardrobeItem } from '@/lib/actions/wardrobe';
import WardrobeUploadModal from '@/components/WardrobeUploadModal';
import { WardrobeItemSkeleton } from '@/components/ui/Skeleton';
import type { WardrobeItem, WardrobeCategory } from '@/lib/types';

const CATEGORIES = ['All', 'top', 'bottom', 'shoes', 'accessory', 'outerwear', 'dress', 'other'] as const;
type CategoryFilter = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<string, string> = {
  All: 'All',
  top: 'Tops',
  bottom: 'Bottoms',
  shoes: 'Shoes',
  accessory: 'Accessories',
  outerwear: 'Outerwear',
  dress: 'Dresses',
  other: 'Other',
};

export default function Wardrobe() {
  const [active, setActive] = useState<CategoryFilter>('All');
  const [saved, setSaved] = useState<string[]>([]);
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const category = active === 'All' ? 'all' : active as WardrobeCategory;
    const result = await getWardrobeItems(category);
    setItems(result.items);
    setLoading(false);
  }, [active]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleSave = (id: string) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this item from your wardrobe?')) return;
    setDeletingId(id);
    const result = await deleteWardrobeItem(id);
    setDeletingId(null);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Item removed from wardrobe');
    } else {
      toast.error(result.error ?? 'Failed to delete item');
    }
  };

  return (
    <div className="px-6 pt-12 pb-28 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <header className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-serif text-2xl font-bold text-espresso">Digital Wardrobe</h1>
          <p className="font-sans text-xs text-espresso/60 mt-0.5">
            {loading ? '...' : `${items.length} items curated for you`}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center">
          <Sparkles size={18} className="text-espresso/60" strokeWidth={1.5} />
        </div>
      </header>

      {/* Categories Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 -mx-6 px-6">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActive(category)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
              active === category
                ? 'bg-espresso text-white'
                : 'bg-sand text-espresso/70 hover:bg-sand/70'
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Wardrobe Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[...Array(6)].map((_, i) => <WardrobeItemSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mb-4">
            <Sparkles size={24} className="text-espresso/30" strokeWidth={1.5} />
          </div>
          <p className="font-serif text-base text-espresso/50">No items here yet.</p>
          <p className="font-sans text-xs text-espresso/40 mt-1">
            Tap the camera button to add your first item.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square bg-sand/40 rounded-2xl overflow-hidden p-4 flex flex-col group"
            >
              {/* Save button */}
              <button
                onClick={() => toggleSave(item.id)}
                aria-label={`Save item`}
                className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-cream/80 backdrop-blur-sm transition-colors"
              >
                <Heart
                  size={14}
                  strokeWidth={2}
                  className={saved.includes(item.id) ? 'fill-espresso text-espresso' : 'text-espresso/50'}
                />
              </button>

              {/* Delete button (on hover) */}
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                aria-label="Delete item"
                className="absolute top-3 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-cream/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {deletingId === item.id ? (
                  <Loader2 size={12} className="animate-spin text-espresso/50" />
                ) : (
                  <Trash2 size={12} className="text-rose-400" />
                )}
              </button>

              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={item.image_url}
                  alt={item.category}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-2">
                <p className="font-sans text-xs font-semibold text-espresso truncate capitalize">
                  {item.color ? `${item.color} ` : ''}{item.category}
                </p>
                {item.tags && item.tags.length > 0 && (
                  <p className="font-sans text-[10px] text-espresso/50 truncate">
                    {item.tags.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <WardrobeUploadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchItems}
      />

      {/* Floating Action Button */}
      <button
        id="fab-add-wardrobe"
        aria-label="Add item to wardrobe"
        onClick={() => setShowModal(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-espresso text-white rounded-full shadow-lg shadow-espresso/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Camera size={22} strokeWidth={1.5} />
      </button>
    </div>
  );
}