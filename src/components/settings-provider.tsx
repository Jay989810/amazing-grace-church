"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Settings {
  churchName: string
  churchAddress: string
  churchPhone: string
  churchEmail: string
  pastorName: string
  churchDescription: string
  heroImage: string
  aboutImage: string
  services: {
    sunday: string
    wednesday: string
    friday: string
  }
  socialMedia: {
    facebook: string
    instagram: string
    youtube: string
    twitter: string
  }
  contactInfo: {
    address: string
    phone: string
    email: string
    hours: string
  }
  seo: {
    title: string
    description: string
    keywords: string
  }
}

interface SettingsContextType {
  settings: Settings | null
  loading: boolean
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const defaultSettings: Settings = {
  churchName: "Amazing Grace Baptist Church",
  churchAddress: "U/Zawu, Gonin Gora, Kaduna State, Nigeria",
  churchPhone: "+234 XXX XXX XXXX",
  churchEmail: "info@amazinggracechurch.org",
  pastorName: "Pastor John Doe",
  churchDescription: "Welcome to Amazing Grace Baptist Church. Join us for worship, fellowship, and spiritual growth.",
  heroImage: "/church-logo.png",
  aboutImage: "/church-logo.png",
  services: {
    sunday: "10:00 AM - 12:00 PM",
    wednesday: "6:00 PM - 7:30 PM",
    friday: "7:00 PM - 8:30 PM"
  },
  socialMedia: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: ""
  },
  contactInfo: {
    address: "U/Zawu, Gonin Gora, Kaduna State, Nigeria",
    phone: "+234 XXX XXX XXXX",
    email: "info@amazinggracechurch.org",
    hours: "Monday - Friday: 9:00 AM - 5:00 PM"
  },
  seo: {
    title: "Amazing Grace Baptist Church - U/Zawu, Gonin Gora, Kaduna State",
    description: "Welcome to Amazing Grace Baptist Church. Join us for worship, fellowship, and spiritual growth.",
    keywords: "church, baptist, kaduna, nigeria, worship, fellowship, sermons, amazing grace"
  }
}

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const settingsData = await response.json()
        setSettings(settingsData)
      } else {
        // Use default settings if API fails
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
