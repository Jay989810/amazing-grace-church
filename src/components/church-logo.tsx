"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

interface Settings {
  heroImage?: string
  churchName?: string
}

export function ChurchLogo({ className = "", size = "md" }: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32",
    xl: "w-40 h-40"
  }

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const settingsData = await response.json()
          setSettings(settingsData)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  // If image fails to load, show the designed logo
  if (imageError || !settings.heroImage) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full border-4 border-yellow-300 shadow-lg">
          <div className="relative w-3/4 h-3/4">
            {/* Cross */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 bg-blue-900 h-3/4 rounded-sm"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 bg-blue-900 h-1 rounded-sm"></div>
            
            {/* Book (Bible) */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-1/4 bg-blue-900 rounded-sm">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-800 rounded-t-sm"></div>
              <div className="absolute top-1/2 left-0 w-full h-1/2 bg-blue-700 rounded-b-sm"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full bg-muted animate-pulse rounded-full"></div>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Image
        src={settings.heroImage || "/church-logo.svg"}
        alt={`${settings.churchName || "Amazing Grace Baptist Church"} Logo`}
        width={160}
        height={160}
        className="w-full h-full object-contain"
        priority
        onError={() => setImageError(true)}
      />
    </div>
  )
}