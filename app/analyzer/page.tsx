import { Camera, CheckCircle2, Sparkles, Upload } from 'lucide-react';
import Image from 'next/image';

export default function Analyzer() {
  // Simulating state for visual representation
  const isAnalyzed = true;

  return (
    <div className="px-6 pt-12 pb-28 flex flex-col min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-center text-espresso">Outfit Analyzer</h1>
        <p className="text-center text-espresso/60 font-sans text-sm mt-1">Let AI rate your fit</p>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex flex-col gap-8">
        
        {/* Upload Area / Image Preview */}
        {!isAnalyzed ? (
          <div className="flex-1 max-h-[400px] border-2 border-dashed border-espresso/20 rounded-3xl flex flex-col items-center justify-center gap-4 bg-sand/20 hover:bg-sand/40 transition-colors cursor-pointer">
            <div className="w-16 h-16 bg-espresso/5 rounded-full flex items-center justify-center text-espresso/60">
              <Camera size={32} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="font-sans font-medium text-espresso">Upload or snap a selfie</p>
              <p className="font-sans text-xs text-espresso/50 mt-1">JPEG, PNG up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full aspect-[3/4] max-h-[450px] rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
            <Image 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" 
              alt="Analyzed Outfit" 
              fill 
              className="object-cover"
            />
            {/* Retake Button Overlay */}
            <button className="absolute top-4 right-4 bg-white/70 backdrop-blur-md rounded-full px-4 py-2 text-xs font-sans font-medium flex items-center gap-2 shadow-sm hover:bg-white transition-colors">
              <Upload size={14} />
              Retake
            </button>
          </div>
        )}

        {/* Results Section */}
        {isAnalyzed && (
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-sand/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-gold" size={24} />
                <h2 className="font-serif font-bold text-xl">Style Score</h2>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-gold flex items-center justify-center bg-gold/5 text-espresso">
                <span className="font-sans font-bold text-lg">8.5</span>
                <span className="font-sans text-xs opacity-60 ml-0.5">/10</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-sans font-medium text-sm text-espresso/80 uppercase tracking-wider">AI Feedback</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                  <p className="font-sans text-sm text-espresso leading-relaxed">
                    Great color match for your skin tone. The mustard yellow complements the olive undertones perfectly.
                  </p>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                  <p className="font-sans text-sm text-espresso leading-relaxed">
                    Good proportion balance between the fitted top and loose trousers.
                  </p>
                </li>
                <li className="flex gap-3 items-start">
                  <Sparkles className="text-gold shrink-0 mt-0.5" size={18} />
                  <p className="font-sans text-sm text-espresso leading-relaxed">
                    <span className="font-medium">Style Tip:</span> Try adding a silver watch or a delicate necklace to elevate the look.
                  </p>
                </li>
              </ul>
            </div>
            
            <button className="w-full mt-6 bg-espresso text-white py-3.5 rounded-xl font-sans text-sm font-medium hover:bg-espresso/90 transition-colors shadow-lg shadow-espresso/20">
              Save to Lookbook
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
