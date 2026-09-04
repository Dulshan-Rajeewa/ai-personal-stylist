'use client';

import { useState, useRef, useTransition } from 'react';
import { X, Camera, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadWardrobeItem } from '@/lib/actions/wardrobe';
import type { WardrobeCategory } from '@/lib/types';

const CATEGORIES: { value: WardrobeCategory; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'dress', label: 'Dress' },
  { value: 'other', label: 'Other' },
];

interface WardrobeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WardrobeUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: WardrobeUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<WardrobeCategory>('top');
  const [color, setColor] = useState('');
  const [uploaded, setUploaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    setUploaded(false);
  };

  const handleUpload = () => {
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
      if (color) formData.append('color', color);

      const result = await uploadWardrobeItem(formData);

      if (result.success) {
        setUploaded(true);
        toast.success('Item added to your wardrobe!');
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 1200);
      } else {
        toast.error(result.error ?? 'Upload failed');
      }
    });
  };

  const handleClose = () => {
    setPreview(null);
    setFile(null);
    setColor('');
    setCategory('top');
    setUploaded(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-espresso/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-cream rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 pb-10 sm:pb-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-espresso">Add to Wardrobe</h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-sand flex items-center justify-center text-espresso/50 hover:text-espresso transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Image Zone */}
        {preview ? (
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            {uploaded && (
              <div className="absolute inset-0 bg-espresso/50 flex items-center justify-center">
                <CheckCircle2 size={52} className="text-white" />
              </div>
            )}
            <button
              onClick={() => { setPreview(null); setFile(null); }}
              className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-espresso"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            {/* Gallery picker */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 aspect-square flex flex-col items-center justify-center gap-3 bg-sand/60 border-2 border-dashed border-espresso/15 rounded-2xl hover:bg-sand transition-colors"
            >
              <Upload size={24} className="text-espresso/50" />
              <span className="font-sans text-xs text-espresso/50">Gallery</span>
            </button>

            {/* Camera */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 aspect-square flex flex-col items-center justify-center gap-3 bg-espresso/5 border-2 border-dashed border-espresso/15 rounded-2xl hover:bg-espresso/10 transition-colors"
            >
              <Camera size={24} className="text-espresso/50" />
              <span className="font-sans text-xs text-espresso/50">Camera</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
          </div>
        )}

        {/* Category */}
        <div>
          <label className="font-sans text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-2 block">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                  category === value
                    ? 'bg-espresso text-white'
                    : 'bg-sand text-espresso/70 hover:bg-sand/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Color (optional) */}
        <div>
          <label className="font-sans text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-2 block">
            Color <span className="normal-case tracking-normal text-espresso/30">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Navy Blue, Off-White"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full bg-sand/60 border border-espresso/10 rounded-2xl px-4 py-3 text-sm font-sans text-espresso placeholder:text-espresso/30 outline-none focus:border-espresso/30 transition-all"
          />
        </div>

        {/* Submit */}
        <button
          id="btn-upload-wardrobe"
          onClick={handleUpload}
          disabled={!file || isPending || uploaded}
          className="w-full bg-espresso text-white font-sans text-sm font-medium py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-espresso/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_6px_20px_rgba(42,35,33,0.25)]"
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : uploaded ? (
            <>
              <CheckCircle2 size={18} />
              Added!
            </>
          ) : (
            <>
              <Upload size={18} />
              Add to Wardrobe
            </>
          )}
        </button>
      </div>
    </div>
  );
}
