// Type definitions for the Amazing Grace Baptist Church website

export interface Sermon {
  id: string
  title: string
  speaker: string
  date: string
  category: 'Sunday Service' | 'Bible Study' | 'Mid-week'
  audioUrl?: string
  videoUrl?: string
  notesUrl?: string
  description?: string
  thumbnail?: string
  duration?: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  venue: string
  type: 'Service' | 'Conference' | 'Crusade' | 'Youth Program' | 'Other'
  image?: string
  registrationRequired: boolean
  registrationUrl?: string
}

export interface GalleryImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  album: string
  date: string
  photographer?: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  date: string
  status: 'new' | 'read' | 'replied'
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
  lastLogin?: string
}

export interface ChurchInfo {
  name: string
  address: string
  phone: string
  email: string
  pastor: string
  serviceTimes: {
    sunday: string[]
    midweek: string[]
    bibleStudy: string[]
  }
  socialMedia: {
    facebook?: string
    instagram?: string
    youtube?: string
    twitter?: string
  }
}

export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  priority: 'low' | 'medium' | 'high'
  isActive: boolean
}

