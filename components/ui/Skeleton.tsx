import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Shimmer skeleton placeholder matching the app's cream/sand palette.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-sand/60',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        'before:animate-[shimmer_1.8s_ease-in-out_infinite]',
        className
      )}
    />
  );
}

/**
 * Pre-built skeleton for a wardrobe item card (square).
 */
export function WardrobeItemSkeleton() {
  return (
    <div className="relative aspect-square bg-sand/40 rounded-2xl overflow-hidden p-4 flex flex-col gap-2">
      <Skeleton className="flex-1 rounded-xl" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2.5 w-1/2" />
    </div>
  );
}

/**
 * Pre-built skeleton for the daily outfit hero card.
 */
export function HeroCardSkeleton() {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-sand/40 p-6 flex flex-col justify-end min-h-[220px] gap-3">
      <Skeleton className="h-6 w-1/3 rounded-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
  );
}

/**
 * Pre-built skeleton for the analysis result cards.
 */
export function AnalysisCardSkeleton() {
  return (
    <div className="flex gap-4 items-start bg-white rounded-2xl p-4 border border-sand/40">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}
