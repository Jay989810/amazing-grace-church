"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { checkResourcePerformance, sendPerformanceAlert } from "@/lib/performance-monitor"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
}

// Skeleton loader component with shimmer effect
function ImageSkeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-r from-muted via-muted/50 to-muted ${className}`}
      style={style}
    >
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%]"></div>
    </div>
  )
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  sizes,
  objectFit = "cover"
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadStartTime] = useState(Date.now())

  // Monitor performance for non-priority images
  useEffect(() => {
    if (!priority && src && !src.startsWith('data:') && !src.startsWith('blob:')) {
      // Check performance after a delay to not block initial load
      const timer = setTimeout(async () => {
        const alert = await checkResourcePerformance(src, 'image')
        if (alert) {
          sendPerformanceAlert(alert)
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [src, priority])

  if (error || !src || src === '#') {
    return (
      <div 
        className={`bg-muted/50 flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 border-4 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Image unavailable</p>
        </div>
      </div>
    )
  }

  const objectFitClass = {
    'cover': 'object-cover',
    'contain': 'object-contain',
    'fill': 'object-fill',
    'none': 'object-none',
    'scale-down': 'object-scale-down'
  }[objectFit] || 'object-cover'

  return (
    <div className={`relative ${className}`} style={fill ? { width: '100%', height: '100%' } : undefined}>
      {/* Skeleton loader - shows while image is loading */}
      {isLoading && (
        <ImageSkeleton 
          className={`absolute inset-0 z-10 ${fill ? 'w-full h-full' : ''}`}
          style={fill ? undefined : { width, height }}
        />
      )}
      
      {/* Actual image */}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`${objectFitClass} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500 ease-out`}
          priority={priority}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          quality={priority ? 90 : 85}
          onLoad={() => {
            const loadTime = Date.now() - loadStartTime
            
            // Log slow loading for monitoring
            if (loadTime > 2000 && !priority) {
              sendPerformanceAlert({
                type: 'slow_load',
                resourceUrl: src,
                resourceType: 'image',
                message: `Image loaded slowly (${loadTime}ms): ${src}`,
                loadTime,
                timestamp: new Date().toISOString()
              })
            }
            
            // Small delay to ensure smooth transition
            setTimeout(() => setIsLoading(false), 50)
          }}
          onError={() => {
            // Report failed image load
            sendPerformanceAlert({
              type: 'failed_load',
              resourceUrl: src,
              resourceType: 'image',
              message: `Image failed to load: ${src}`,
              loadTime: Date.now() - loadStartTime,
              timestamp: new Date().toISOString()
            })
            
            setError(true)
            setIsLoading(false)
          }}
          loading={priority ? undefined : "lazy"}
          unoptimized={src.startsWith('data:') || src.startsWith('blob:')}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${objectFitClass} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500 ease-out`}
          priority={priority}
          sizes={sizes}
          quality={priority ? 90 : 85}
          onLoad={() => {
            setTimeout(() => setIsLoading(false), 50)
          }}
          onError={() => {
            setError(true)
            setIsLoading(false)
          }}
          loading={priority ? undefined : "lazy"}
          unoptimized={src.startsWith('data:') || src.startsWith('blob:')}
        />
      )}
    </div>
  )
}

