import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema types
export interface Database {
  public: {
    Tables: {
      sermons: {
        Row: {
          id: string
          title: string
          speaker: string
          date: string
          category: 'Sunday Service' | 'Bible Study' | 'Mid-week'
          audio_url?: string
          video_url?: string
          notes_url?: string
          description?: string
          thumbnail?: string
          duration?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          speaker: string
          date: string
          category: 'Sunday Service' | 'Bible Study' | 'Mid-week'
          audio_url?: string
          video_url?: string
          notes_url?: string
          description?: string
          thumbnail?: string
          duration?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          speaker?: string
          date?: string
          category?: 'Sunday Service' | 'Bible Study' | 'Mid-week'
          audio_url?: string
          video_url?: string
          notes_url?: string
          description?: string
          thumbnail?: string
          duration?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          time: string
          venue: string
          type: 'Service' | 'Conference' | 'Crusade' | 'Youth Program' | 'Other'
          image?: string
          registration_required: boolean
          registration_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          time: string
          venue: string
          type: 'Service' | 'Conference' | 'Crusade' | 'Youth Program' | 'Other'
          image?: string
          registration_required?: boolean
          registration_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          time?: string
          venue?: string
          type?: 'Service' | 'Conference' | 'Crusade' | 'Youth Program' | 'Other'
          image?: string
          registration_required?: boolean
          registration_url?: string
          updated_at?: string
        }
      }
      gallery_images: {
        Row: {
          id: string
          title: string
          description?: string
          image_url: string
          album: string
          date: string
          photographer?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          image_url: string
          album: string
          date: string
          photographer?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          album?: string
          date?: string
          photographer?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone?: string
          subject: string
          message: string
          date: string
          status: 'new' | 'read' | 'replied'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string
          subject: string
          message: string
          date: string
          status?: 'new' | 'read' | 'replied'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          subject?: string
          message?: string
          date?: string
          status?: 'new' | 'read' | 'replied'
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          created_at: string
          last_login?: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'user'
          created_at?: string
          last_login?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          last_login?: string
        }
      }
      church_settings: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          email: string
          pastor: string
          service_times: any
          social_media: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          email: string
          pastor: string
          service_times: any
          social_media: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          pastor?: string
          service_times?: any
          social_media?: any
          updated_at?: string
        }
      }
    }
  }
}
