"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

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

  if (error || !src || src === '#') {
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={fill ? { width: '100%', height: '100%' } : undefined}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted flex items-center justify-center z-10"
          style={fill ? undefined : { width, height }}
        >
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      )}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          priority={priority}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true)
            setIsLoading(false)
          }}
          loading={priority ? undefined : "lazy"}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          priority={priority}
          sizes={sizes}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true)
            setIsLoading(false)
          }}
          loading={priority ? undefined : "lazy"}
        />
      )}
    </div>
  )
}

