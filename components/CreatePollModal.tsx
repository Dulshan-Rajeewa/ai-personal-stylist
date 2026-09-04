'use client';

import { useState, useRef, useTransition } from 'react';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createPoll } from '@/lib/actions/community';

const OCCASIONS = ['Date Night', 'Work', 'Casual', 'Party', 'Travel', 'Gym', 'Other'];

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface OutfitSlot {
  file: File | null;
  preview: string | null;
}

export default function CreatePollModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState('');
  const [occasion, setOccasion] = useState('');
  const [outfitA, setOutfitA] = useState<OutfitSlot>({ file: null, preview: null });
  const [outfitB, setOutfitB] = useState<OutfitSlot>({ file: null, preview: null });
  const [isPending, startTransition] = useTransition();

  const inputA = useRef<HTMLInputElement>(null);
  const inputB = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (
    file: File,
    setter: React.Dispatch<React.SetStateAction<OutfitSlot>>
  ) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setter({ file, preview: URL.createObjectURL(file) });
  };

  const handleSubmit = () => {
    if (!question.trim()) return toast.error('Please enter a question');
    if (!outfitA.file) return toast.error('Please add Outfit A image');
    if (!outfitB.file) return toast.error('Please add Outfit B image');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('question', question);
      formData.append('imageA', outfitA.file!);
      formData.append('imageB', outfitB.file!);
      if (occasion) formData.append('occasion', occasion);

      const result = await createPoll(formData);
      if (result.success) {
        toast.success('Poll created! The community will vote.');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(result.error ?? 'Failed to create poll');
      }
    });
  };

  const handleClose = () => {
    setQuestion('');
    setOccasion('');
    setOutfitA({ file: null, preview: null });
    setOutfitB({ file: null, preview: null });
    onClose();
  };

  const OutfitPicker = ({
    slot,
    label,
    inputRef,
    onSelect,
  }: {
    slot: OutfitSlot;
    label: string;
    inputRef: React.RefObject<HTMLInputElement>;
    onSelect: (f: File) => void;
  }) => (
    <div className="flex-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border-2 border-dashed border-espresso/15 bg-sand/40 hover:bg-sand/70 transition-colors flex items-center justify-center"
      >
        {slot.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slot.preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-espresso/40">
            <div className="w-10 h-10 rounded-full bg-espresso/10 flex items-center justify-center">
              <Plus size={20} strokeWidth={2} />
            </div>
            <span className="font-sans text-xs font-medium">{label}</span>
          </div>
        )}
        <span className="absolute bottom-2 left-2 font-sans text-[11px] font-bold text-white bg-espresso/60 backdrop-blur-sm rounded-full px-2 py-0.5">
          {label}
        </span>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={handleClose} aria-hidden />

      <div className="relative w-full max-w-md bg-cream rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 pb-10 sm:pb-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-espresso">Create a Poll</h2>
          <button onClick={handleClose} aria-label="Close" className="w-9 h-9 rounded-full bg-sand flex items-center justify-center text-espresso/50 hover:text-espresso transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Outfit pickers */}
        <div>
          <label className="font-sans text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-2 block">
            Upload Outfits
          </label>
          <div className="flex gap-3">
            <OutfitPicker
              slot={outfitA}
              label="A"
              inputRef={inputA}
              onSelect={(f) => handleFileSelect(f, setOutfitA)}
            />
            <div className="flex items-center justify-center w-8">
              <span className="font-serif text-[11px] font-black text-espresso/40">VS</span>
            </div>
            <OutfitPicker
              slot={outfitB}
              label="B"
              inputRef={inputB}
              onSelect={(f) => handleFileSelect(f, setOutfitB)}
            />
          </div>
        </div>

        {/* Question */}
        <div>
          <label className="font-sans text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-2 block">
            Your Question
          </label>
          <input
            type="text"
            placeholder="Which one should I wear tonight?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={120}
            className="w-full bg-sand/60 border border-espresso/10 rounded-2xl px-4 py-3 text-sm font-sans text-espresso placeholder:text-espresso/30 outline-none focus:border-espresso/30 transition-all"
          />
        </div>

        {/* Occasion */}
        <div>
          <label className="font-sans text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-2 block">
            Occasion <span className="normal-case tracking-normal text-espresso/30">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                onClick={() => setOccasion((prev) => (prev === o ? '' : o))}
                className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                  occasion === o ? 'bg-espresso text-white' : 'bg-sand text-espresso/70 hover:bg-sand/70'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          id="btn-create-poll"
          onClick={handleSubmit}
          disabled={isPending || !question || !outfitA.file || !outfitB.file}
          className="w-full bg-espresso text-white font-sans text-sm font-medium py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-espresso/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_6px_20px_rgba(42,35,33,0.25)]"
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Upload size={18} />
              Post Poll
            </>
          )}
        </button>
      </div>
    </div>
  );
}
