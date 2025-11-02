"use client"

export function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4">
      <div className="space-y-3">
        <div className="relative h-48 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg overflow-hidden">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%]"></div>
        </div>
        <div className="space-y-2">
          <div className="relative h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%]"></div>
          </div>
          <div className="relative h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/2 overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%]"></div>
          </div>
          <div className="relative h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-full overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonImage() {
  return (
    <div className="relative w-full h-full bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg overflow-hidden">
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%]"></div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-muted rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

