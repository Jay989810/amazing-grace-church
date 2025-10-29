"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { LogOut, User, Plus, Edit, Trash2, Eye, Calendar, Music, Image, Mail, Settings, Save, X, Upload, Globe, Phone, MapPin, Clock, FileText, Heart, BookOpen, Users, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/file-upload"

// Icon mapping for core beliefs
const iconMap: Record<string, any> = {
  Heart,
  Users,
  BookOpen,
  Globe,
  Award,
  User
}

// Types
interface Sermon {
  id: string
  title: string
  speaker: string
  date: string
  category: string
  description: string
  audio_url: string
  video_url: string
  notes_url: string
  thumbnail: string
  duration: string
  created_at: string
  updated_at: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  created_at: string
  updated_at: string
}

interface GalleryImage {
  id: string
  title: string
  description?: string
  image_url: string
  album?: string
  photographer?: string
  date?: string
  created_at: string
  updated_at: string
}

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  date?: string
  status?: 'new' | 'read' | 'replied'
  created_at: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  // Auth state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Data state
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [settings, setSettings] = useState<any>({})
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  
  // About page state
  const [aboutContent, setAboutContent] = useState<any>({
    sections: {},
    coreBeliefs: [],
    leadership: []
  })
  
  // UI state
  const [activeTab, setActiveTab] = useState('sermons')
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [galleryCategory, setGalleryCategory] = useState('Other')
  const [editingBelief, setEditingBelief] = useState<any>(null)
  const [editingLeader, setEditingLeader] = useState<any>(null)
  
  // Form states
  const [sermonForm, setSermonForm] = useState({
    title: '',
    speaker: '',
    date: '',
    category: '',
    description: '',
    audio_url: '',
    video_url: '',
    notes_url: '',
    thumbnail: '',
    duration: ''
  })
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  })

  const [settingsForm, setSettingsForm] = useState({
    churchName: '',
    churchAddress: '',
    churchPhone: '',
    churchEmail: '',
    pastorName: '',
    churchDescription: '',
    heroImage: '',
    aboutImage: '',
    services: {
      sunday: '',
      wednesday: '',
      friday: ''
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: ''
    },
    contactInfo: {
      address: '',
      phone: '',
      email: '',
      hours: ''
    },
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  })

  // About page form states
  const [aboutSectionsForm, setAboutSectionsForm] = useState({
    history: '',
    mission: '',
    vision: '',
    values: '',
    pastors_message: ''
  })

  const [beliefForm, setBeliefForm] = useState({
    title: '',
    description: '',
    icon: 'Heart',
    order: 0
  })

  const [leaderForm, setLeaderForm] = useState({
    name: '',
    role: '',
    image: '',
    bio: '',
    email: '',
    order: 0
  })

  // Load data on component mount
  useEffect(() => {
    if (session) {
      loadAllData()
    }
  }, [session])

  // Memoize the loadAllData function to prevent unnecessary re-renders
  const loadAllData = useCallback(async () => {
    setIsLoadingData(true)
    try {
      const [sermonsRes, eventsRes, galleryRes, messagesRes, settingsRes, filesRes, aboutRes] = await Promise.all([
        fetch('/api/sermons'),
        fetch('/api/events'),
        fetch('/api/gallery'),
        fetch('/api/messages'),
        fetch('/api/settings'),
        fetch('/api/upload'),
        fetch('/api/about')
      ])
      
      if (sermonsRes.ok) setSermons(await sermonsRes.json())
      if (eventsRes.ok) setEvents(await eventsRes.json())
      if (galleryRes.ok) setGalleryImages(await galleryRes.json())
      if (messagesRes.ok) setContactMessages(await messagesRes.json())
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(settingsData)
        setSettingsForm(settingsData)
      }
      if (filesRes.ok) setUploadedFiles(await filesRes.json())
      if (aboutRes.ok) {
        const aboutData = await aboutRes.json()
        const sectionsMap: Record<string, string> = {}
        aboutData.sections.forEach((section: any) => {
          sectionsMap[section.type] = section.content
        })
        setAboutContent({
          sections: sectionsMap,
          coreBeliefs: aboutData.coreBeliefs || [],
          leadership: aboutData.leadership || []
        })
        // Populate form with current content
        setAboutSectionsForm({
          history: sectionsMap.history || '',
          mission: sectionsMap.mission || '',
          vision: sectionsMap.vision || '',
          values: sectionsMap.values || '',
          pastors_message: sectionsMap.pastors_message || ''
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    } finally {
      setIsLoadingData(false)
    }
  }, [toast])


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        setError('Invalid credentials. Please try again.')
      } else if (result?.ok) {
        // The session will be updated automatically by NextAuth
        setError('') // Clear any previous errors
      } else {
        setError('Sign in failed. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
    
    setIsLoading(false)
  }

  const handleSignOut = () => {
    signOut()
  }

  // Sermon CRUD operations
  const handleCreateSermon = async () => {
    try {
      const response = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sermonForm)
      })
      
      if (response.ok) {
        const newSermon = await response.json()
        setSermons([newSermon, ...sermons])
        setSermonForm({
          title: '', speaker: '', date: '', category: '', description: '',
          audio_url: '', video_url: '', notes_url: '', thumbnail: '', duration: ''
        })
        toast({
          title: "Success",
          description: "Sermon created successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sermon",
        variant: "destructive"
      })
    }
  }

  const handleUpdateSermon = async () => {
    try {
      const response = await fetch('/api/sermons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingItem.id, ...sermonForm })
      })
      
      if (response.ok) {
        const updatedSermon = await response.json()
        setSermons(sermons.map(s => s.id === editingItem.id ? updatedSermon : s))
        setIsEditing(false)
        setEditingItem(null)
        toast({
          title: "Success",
          description: "Sermon updated successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sermon",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSermon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sermon?')) return
    
    try {
      const response = await fetch(`/api/sermons?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSermons(sermons.filter(s => s.id !== id))
        toast({
          title: "Success",
          description: "Sermon deleted successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sermon",
        variant: "destructive"
      })
    }
  }

  const startEditSermon = (sermon: Sermon) => {
    setEditingItem(sermon)
    setSermonForm({
      title: sermon.title,
      speaker: sermon.speaker,
      date: sermon.date,
      category: sermon.category,
      description: sermon.description,
      audio_url: sermon.audio_url,
      video_url: sermon.video_url,
      notes_url: sermon.notes_url,
      thumbnail: sermon.thumbnail,
      duration: sermon.duration
    })
    setIsEditing(true)
  }

  // Event CRUD operations
  const handleCreateEvent = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      })
      
      if (response.ok) {
        const newEvent = await response.json()
        setEvents([newEvent, ...events])
        setEventForm({ title: '', description: '', date: '', location: '' })
        toast({
          title: "Success",
          description: "Event created successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      })
    }
  }

  const handleUpdateEvent = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingItem.id, ...eventForm })
      })
      
      if (response.ok) {
        const updatedEvent = await response.json()
        setEvents(events.map(e => e.id === editingItem.id ? updatedEvent : e))
        setIsEditing(false)
        setEditingItem(null)
        toast({
          title: "Success",
          description: "Event updated successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      })
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setEvents(events.filter(e => e.id !== id))
        toast({
          title: "Success",
          description: "Event deleted successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      })
    }
  }

  const startEditEvent = (event: Event) => {
    setEditingItem(event)
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location
    })
    setIsEditing(true)
  }

  // Settings management functions
  const handleUpdateSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings updated successfully"
        })
        await loadAllData() // Reload to get updated settings
        
        // Trigger a refresh of the settings provider on all pages
        // Dispatch a custom event that SettingsProvider can listen to
        window.dispatchEvent(new CustomEvent('settingsUpdated'))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      })
    }
  }

  // About page management functions
  const handleSaveAboutSection = async (sectionType: string, content: string) => {
    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          data: { sectionType, content }
        })
      })
      
      if (response.ok) {
        await loadAllData()
        window.dispatchEvent(new CustomEvent('aboutUpdated'))
        toast({
          title: "Success",
          description: `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} updated successfully`
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive"
      })
    }
  }

  const handleSaveBelief = async () => {
    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'core_belief',
          data: { ...beliefForm, id: editingBelief?.id }
        })
      })
      
      if (response.ok) {
        await loadAllData()
        window.dispatchEvent(new CustomEvent('aboutUpdated'))
        setBeliefForm({ title: '', description: '', icon: 'Heart', order: 0 })
        setEditingBelief(null)
        toast({
          title: "Success",
          description: "Core belief saved successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save core belief",
        variant: "destructive"
      })
    }
  }

  const handleDeleteBelief = async (id: string) => {
    if (!confirm('Are you sure you want to delete this core belief?')) return
    try {
      const response = await fetch(`/api/about?type=core_belief&id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadAllData()
        window.dispatchEvent(new CustomEvent('aboutUpdated'))
        toast({
          title: "Success",
          description: "Core belief deleted successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete core belief",
        variant: "destructive"
      })
    }
  }

  const handleSaveLeader = async () => {
    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'leadership',
          data: { ...leaderForm, id: editingLeader?.id }
        })
      })
      
      if (response.ok) {
        await loadAllData()
        window.dispatchEvent(new CustomEvent('aboutUpdated'))
        setLeaderForm({ name: '', role: '', image: '', bio: '', email: '', order: 0 })
        setEditingLeader(null)
        toast({
          title: "Success",
          description: "Leadership member saved successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save leadership member",
        variant: "destructive"
      })
    }
  }

  const handleDeleteLeader = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leadership member?')) return
    try {
      const response = await fetch(`/api/about?type=leadership&id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadAllData()
        window.dispatchEvent(new CustomEvent('aboutUpdated'))
        toast({
          title: "Success",
          description: "Leadership member deleted successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete leadership member",
        variant: "destructive"
      })
    }
  }

  const startEditBelief = (belief: any) => {
    setEditingBelief(belief)
    setBeliefForm({
      title: belief.title,
      description: belief.description,
      icon: belief.icon || 'Heart',
      order: belief.order || 0
    })
  }

  const startEditLeader = (leader: any) => {
    setEditingLeader(leader)
    setLeaderForm({
      name: leader.name,
      role: leader.role,
      image: leader.image,
      bio: leader.bio,
      email: leader.email,
      order: leader.order || 0
    })
  }

  const handleLeaderPhotoUpload = (file: any) => {
    try {
      if (!file) {
        console.error('handleLeaderPhotoUpload received undefined file')
        toast({
          title: "Upload Error",
          description: "File upload failed - no file data received",
          variant: "destructive"
        })
        return
      }
      if (!file.url) {
        console.error('handleLeaderPhotoUpload received file without URL:', file)
        toast({
          title: "Upload Error",
          description: "File uploaded but URL is missing",
          variant: "destructive"
        })
        return
      }
      setLeaderForm({ ...leaderForm, image: file.url })
      toast({
        title: "Photo Uploaded",
        description: "Photo URL has been set"
      })
    } catch (error) {
      console.error('Error in handleLeaderPhotoUpload:', error)
      toast({
        title: "Upload Processing Error",
        description: error instanceof Error ? error.message : "Failed to process photo upload",
        variant: "destructive"
      })
    }
  }

  const handleFileUploadComplete = (file: any) => {
    try {
      if (!file) {
        console.error('handleFileUploadComplete received undefined file')
        return
      }
      console.log('handleFileUploadComplete received file:', file)
      // Normalize ID field - use id if available, otherwise _id
      const normalizedFile = {
        ...file,
        id: file.id || file._id || file._id?.toString()
      }
      setUploadedFiles(prev => [normalizedFile, ...prev])
    } catch (error) {
      console.error('Error in handleFileUploadComplete:', error)
    }
  }

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!fileId) {
      console.error('handleDeleteFile: fileId is undefined')
      toast({
        title: "Delete Error",
        description: "File ID is missing. Cannot delete file.",
        variant: "destructive"
      })
      return
    }

    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      console.log('Deleting file with ID:', fileId)
      const response = await fetch(`/api/upload/blob?id=${fileId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setUploadedFiles(prev => prev.filter(f => (f.id || f._id) !== fileId))
        // Also remove from gallery images if it's a gallery image
        if (galleryImages.some(img => img.image_url === uploadedFiles.find(f => (f.id || f._id) === fileId)?.url)) {
          setGalleryImages(prev => prev.filter(img => img.image_url !== uploadedFiles.find(f => (f.id || f._id) === fileId)?.url))
        }
        toast({
          title: "Success",
          description: "File deleted successfully"
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive"
      })
    }
  }

  const handleDeleteGalleryImage = async (imageId: string, imageTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${imageTitle}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/gallery/delete?id=${imageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setGalleryImages(prev => prev.filter(img => img.id !== imageId))
        // Also remove from uploaded files if it exists there
        const imageToDelete = galleryImages.find(img => img.id === imageId)
        if (imageToDelete) {
          setUploadedFiles(prev => prev.filter(f => f.url !== imageToDelete.image_url))
        }
        toast({
          title: "Success",
          description: "Gallery image deleted successfully"
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete gallery image')
      }
    } catch (error) {
      console.error('Delete gallery image error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete gallery image",
        variant: "destructive"
      })
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@amazinggracechurch.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Default Credentials:</strong><br />
                Email: admin@amazinggracechurch.org<br />
                Password: grace1234<br />
                <br />
                <em>Note: Run "npm run create-admin" to set up admin user in database</em>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {session.user?.name || 'Admin'}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-muted p-1 rounded-lg">
          {[
            { id: 'sermons', label: 'Sermons', icon: Music },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'gallery', label: 'Gallery', icon: Image },
            { id: 'about', label: 'About Page', icon: FileText },
            { id: 'messages', label: 'Messages', icon: Mail },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "ghost"}
              onClick={() => setActiveTab(id)}
              className="flex-1 min-w-0 sm:min-w-[120px]"
            >
              <Icon className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">{label}</span>
              <span className="xs:hidden">{label.charAt(0)}</span>
            </Button>
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {isLoadingData && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
              </div>
            </div>
          )}
          
          {/* Sermons Tab */}
          {activeTab === 'sermons' && !isLoadingData && (
            <div className="space-y-6">
              {/* Add/Edit Sermon Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Music className="w-5 h-5 mr-2" />
                    {isEditing ? 'Edit Sermon' : 'Add New Sermon'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="sermon-title">Title</Label>
                      <Input
                        id="sermon-title"
                        value={sermonForm.title}
                        onChange={(e) => setSermonForm({...sermonForm, title: e.target.value})}
                        placeholder="Sermon title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sermon-speaker">Speaker</Label>
                      <Input
                        id="sermon-speaker"
                        value={sermonForm.speaker}
                        onChange={(e) => setSermonForm({...sermonForm, speaker: e.target.value})}
                        placeholder="Speaker name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sermon-date">Date</Label>
                      <Input
                        id="sermon-date"
                        type="date"
                        value={sermonForm.date}
                        onChange={(e) => setSermonForm({...sermonForm, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sermon-category">Category</Label>
                      <Select 
                        value={sermonForm.category} 
                        onChange={(e) => setSermonForm({...sermonForm, category: e.target.value})}
                      >
                        <option value="">Select category</option>
                        <option value="Sunday Service">Sunday Service</option>
                        <option value="Bible Study">Bible Study</option>
                        <option value="Prayer Meeting">Prayer Meeting</option>
                        <option value="Special Event">Special Event</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sermon-description">Description</Label>
                    <Textarea
                      id="sermon-description"
                      value={sermonForm.description}
                      onChange={(e) => setSermonForm({...sermonForm, description: e.target.value})}
                      placeholder="Sermon description"
                      rows={3}
                    />
                  </div>
                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Upload Audio/Video Files</h4>
                    <FileUpload
                      type="sermon"
                      accept="audio/*,video/*"
                      maxSize={100}
                      multiple={false}
                      onUploadComplete={async (file) => {
                        try {
                          console.log('onUploadComplete received file:', file)
                          if (!file) {
                            console.error('onUploadComplete received undefined file')
                            return
                          }
                          if (!file.mimeType || !file.url) {
                            console.error('onUploadComplete received invalid file object:', file)
                            console.error('mimeType:', file.mimeType, 'url:', file.url)
                            toast({
                              title: "Upload Warning",
                              description: "File uploaded but missing required data",
                              variant: "destructive"
                            })
                            return
                          }
                          // Auto-create sermon with the uploaded file
                          const sermonData: any = {
                            title: file.originalName.replace(/\.[^/.]+$/, ""), // Remove extension
                            speaker: 'Pastor',
                            date: new Date().toISOString().split('T')[0],
                            category: 'Sunday Service',
                            description: `Sermon uploaded on ${new Date().toLocaleDateString()}`
                          }
                          
                          // Only add URLs for matching file types
                          if (file.mimeType.startsWith('audio/')) {
                            sermonData.audio_url = file.url
                          }
                          if (file.mimeType.startsWith('video/')) {
                            sermonData.video_url = file.url
                          }
                          if (file.mimeType.startsWith('image/')) {
                            sermonData.thumbnail = file.url
                          }
                          
                          console.log('Creating sermon with data:', sermonData)
                          
                          const response = await fetch('/api/sermons', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(sermonData)
                          })
                          
                          if (response.ok) {
                            const newSermon = await response.json()
                            setSermons([newSermon, ...sermons])
                            toast({
                              title: "Sermon Created",
                              description: "Sermon automatically created with uploaded file. You can edit it below.",
                              variant: "success"
                            })
                          } else {
                            setSermonForm({...sermonForm, 
                              audio_url: file.mimeType.startsWith('audio/') ? file.url : sermonForm.audio_url,
                              video_url: file.mimeType.startsWith('video/') ? file.url : sermonForm.video_url
                            })
                            toast({
                              title: "URL Set",
                              description: "File uploaded. Fill in the sermon details below."
                            })
                          }
                        } catch (error) {
                          console.error('Error processing upload completion:', error)
                          toast({
                            title: "Upload Processing Error",
                            description: error instanceof Error ? error.message : "Failed to process upload",
                            variant: "destructive"
                          })
                        }
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sermon-audio">Audio URL</Label>
                      <Input
                        id="sermon-audio"
                        value={sermonForm.audio_url}
                        onChange={(e) => setSermonForm({...sermonForm, audio_url: e.target.value})}
                        placeholder="Audio file URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sermon-video">Video URL</Label>
                      <Input
                        id="sermon-video"
                        value={sermonForm.video_url}
                        onChange={(e) => setSermonForm({...sermonForm, video_url: e.target.value})}
                        placeholder="Video file URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sermon-duration">Duration</Label>
                      <Input
                        id="sermon-duration"
                        value={sermonForm.duration}
                        onChange={(e) => setSermonForm({...sermonForm, duration: e.target.value})}
                        placeholder="e.g., 45:30"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleUpdateSermon}>
                          <Save className="w-4 h-4 mr-2" />
                          Update Sermon
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setIsEditing(false)
                          setEditingItem(null)
                          setSermonForm({
                            title: '', speaker: '', date: '', category: '', description: '',
                            audio_url: '', video_url: '', notes_url: '', thumbnail: '', duration: ''
                          })
                        }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleCreateSermon}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sermon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sermons List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Sermons ({sermons.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sermons.map((sermon) => (
                      <div key={sermon.id} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg break-words">{sermon.title}</h3>
                            <p className="text-muted-foreground">by {sermon.speaker}</p>
                            <p className="text-sm text-muted-foreground mt-1 break-words">{sermon.description}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{new Date(sermon.date).toLocaleDateString()}</span>
                              <span>{sermon.category}</span>
                              {sermon.duration && <span>{sermon.duration}</span>}
                            </div>
                          </div>
                          <div className="flex space-x-2 w-full sm:w-auto">
                            <Button size="sm" variant="outline" onClick={() => startEditSermon(sermon)} className="flex-1 sm:flex-none">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteSermon(sermon.id)} className="flex-1 sm:flex-none">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {sermons.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No sermons found. Add your first sermon above.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && !isLoadingData && (
            <div className="space-y-6">
              {/* Add/Edit Event Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    {isEditing ? 'Edit Event' : 'Add New Event'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-title">Title</Label>
                      <Input
                        id="event-title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                        placeholder="Event title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-date">Date</Label>
                      <Input
                        id="event-date"
                        type="datetime-local"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-location">Location</Label>
                      <Input
                        id="event-location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                        placeholder="Event location"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      placeholder="Event description"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleUpdateEvent}>
                          <Save className="w-4 h-4 mr-2" />
                          Update Event
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setIsEditing(false)
                          setEditingItem(null)
                          setEventForm({ title: '', description: '', date: '', location: '' })
                        }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleCreateEvent}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Events List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Events ({events.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <span>{new Date(event.date).toLocaleString()}</span>
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => startEditEvent(event)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteEvent(event.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {events.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No events found. Add your first event above.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && !isLoadingData && (
            <div className="space-y-6">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Upload Gallery Images
                  </CardTitle>
                  <CardDescription>
                    Drag and drop images or click to browse. Supports JPG, PNG, GIF, WebP formats.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gallery-category">Gallery Category/Tag *</Label>
                    <Select
                      id="gallery-category"
                      value={galleryCategory}
                      onChange={(e) => setGalleryCategory(e.target.value)}
                    >
                      <option value="Bible Study">Bible Study</option>
                      <option value="Church Event">Church Event</option>
                      <option value="Sunday Service">Sunday Service</option>
                      <option value="Youth Program">Youth Program</option>
                      <option value="Community Outreach">Community Outreach</option>
                      <option value="Prayer Meeting">Prayer Meeting</option>
                      <option value="Other">Other</option>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select a category/tag for the images you're uploading. This helps organize and filter gallery images.
                    </p>
                  </div>
                  <FileUpload
                    type="gallery"
                    accept="image/*"
                    maxSize={10}
                    multiple={true}
                    onUploadComplete={(file) => {
                      try {
                        if (!file || !file.mimeType || !file.url) {
                          console.error('onUploadComplete received invalid file object:', file)
                          toast({
                            title: "Upload Warning",
                            description: "File uploaded but missing required data",
                            variant: "destructive"
                          })
                          return
                        }
                        handleFileUploadComplete(file)
                        // Refresh gallery images after upload
                        loadAllData()
                      } catch (error) {
                        console.error('Error processing gallery upload completion:', error)
                        toast({
                          title: "Upload Processing Error",
                          description: error instanceof Error ? error.message : "Failed to process upload",
                          variant: "destructive"
                        })
                      }
                    }}
                    metadata={{ album: galleryCategory, category: galleryCategory }}
                  />
                </CardContent>
              </Card>

              {/* Gallery Images from Database */}
              <Card>
                <CardHeader>
                  <CardTitle>Gallery Images ({galleryImages.length})</CardTitle>
                  <CardDescription>
                    Manage gallery images from the database. These appear on the public gallery page.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryImages.map((image) => (
                      <div key={image.id} className="border rounded-lg p-4 space-y-3">
                        <div className="relative group">
                          <img
                            src={image.image_url}
                            alt={image.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => window.open(image.image_url, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteGalleryImage(image.id, image.title)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {image.title}
                          </h4>
                          {image.album && (
                            <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {image.album}
                            </span>
                          )}
                          {image.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {image.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(image.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {galleryImages.length === 0 && (
                    <div className="text-center py-12">
                      <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No gallery images in database yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload images using the form above to see them here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Uploaded Files */}
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Files ({uploadedFiles.filter(f => f.type === 'gallery').length})</CardTitle>
                  <CardDescription>
                    Manage uploaded files. These are the raw file uploads.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uploadedFiles
                      .filter(file => file.type === 'gallery')
                      .map((file) => (
                        <div key={file.id || file._id} className="border rounded-lg p-4 space-y-3">
                          <div className="relative group">
                            <img
                              src={file.url}
                              alt={file.originalName}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => window.open(file.url, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    console.log('Delete button clicked for file:', file)
                                    const fileId = file.id || file._id || file._id?.toString()
                                    console.log('File ID:', fileId)
                                    handleDeleteFile(fileId, file.originalName)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {file.metadata?.title || file.originalName}
                            </h4>
                            {file.metadata?.album && (
                              <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {file.metadata.album}
                              </span>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                  {uploadedFiles.filter(f => f.type === 'gallery').length === 0 && (
                    <div className="text-center py-12">
                      <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No uploaded files yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload images using the form above to see them here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* About Page Tab */}
          {activeTab === 'about' && !isLoadingData && (
            <div className="space-y-6">
              {/* History Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Church History</CardTitle>
                  <CardDescription>Edit the church history content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="history-content">History Content</Label>
                    <Textarea
                      id="history-content"
                      value={aboutSectionsForm.history}
                      onChange={(e) => setAboutSectionsForm({...aboutSectionsForm, history: e.target.value})}
                      placeholder="Enter church history..."
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground mt-1">You can use multiple paragraphs. Each line break will be preserved.</p>
                  </div>
                  <Button onClick={() => handleSaveAboutSection('history', aboutSectionsForm.history)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save History
                  </Button>
                </CardContent>
              </Card>

              {/* Mission, Vision, Values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mission</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={aboutSectionsForm.mission}
                      onChange={(e) => setAboutSectionsForm({...aboutSectionsForm, mission: e.target.value})}
                      placeholder="Enter mission statement..."
                      rows={4}
                    />
                    <Button size="sm" onClick={() => handleSaveAboutSection('mission', aboutSectionsForm.mission)} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Vision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={aboutSectionsForm.vision}
                      onChange={(e) => setAboutSectionsForm({...aboutSectionsForm, vision: e.target.value})}
                      placeholder="Enter vision statement..."
                      rows={4}
                    />
                    <Button size="sm" onClick={() => handleSaveAboutSection('vision', aboutSectionsForm.vision)} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Values</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={aboutSectionsForm.values}
                      onChange={(e) => setAboutSectionsForm({...aboutSectionsForm, values: e.target.value})}
                      placeholder="Enter values (one per line)..."
                      rows={4}
                    />
                    <Button size="sm" onClick={() => handleSaveAboutSection('values', aboutSectionsForm.values)} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Pastor's Message */}
              <Card>
                <CardHeader>
                  <CardTitle>Pastor's Message</CardTitle>
                  <CardDescription>Edit the pastor's welcome message</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={aboutSectionsForm.pastors_message}
                    onChange={(e) => setAboutSectionsForm({...aboutSectionsForm, pastors_message: e.target.value})}
                    placeholder="Enter pastor's message..."
                    rows={8}
                  />
                  <Button onClick={() => handleSaveAboutSection('pastors_message', aboutSectionsForm.pastors_message)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Pastor's Message
                  </Button>
                </CardContent>
              </Card>

              {/* Core Beliefs */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Beliefs</CardTitle>
                  <CardDescription>Manage the four core beliefs displayed on the about page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">{editingBelief ? 'Edit' : 'Add'} Core Belief</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="belief-title">Title</Label>
                        <Input
                          id="belief-title"
                          value={beliefForm.title}
                          onChange={(e) => setBeliefForm({...beliefForm, title: e.target.value})}
                          placeholder="e.g., Salvation by Grace"
                        />
                      </div>
                      <div>
                        <Label htmlFor="belief-icon">Icon</Label>
                        <Select
                          id="belief-icon"
                          value={beliefForm.icon}
                          onChange={(e) => setBeliefForm({...beliefForm, icon: e.target.value})}
                        >
                          <option value="Heart">Heart</option>
                          <option value="BookOpen">Book Open</option>
                          <option value="Users">Users</option>
                          <option value="Globe">Globe</option>
                          <option value="Award">Award</option>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="belief-description">Description</Label>
                      <Textarea
                        id="belief-description"
                        value={beliefForm.description}
                        onChange={(e) => setBeliefForm({...beliefForm, description: e.target.value})}
                        placeholder="Enter belief description..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveBelief}>
                        <Save className="w-4 h-4 mr-2" />
                        {editingBelief ? 'Update' : 'Add'} Belief
                      </Button>
                      {editingBelief && (
                        <Button variant="outline" onClick={() => {
                          setEditingBelief(null)
                          setBeliefForm({ title: '', description: '', icon: 'Heart', order: 0 })
                        }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Current Core Beliefs ({aboutContent.coreBeliefs.length})</h3>
                    {aboutContent.coreBeliefs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No core beliefs added yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aboutContent.coreBeliefs.map((belief: any) => {
                          const IconComponent = iconMap[belief.icon] || Heart
                          return (
                            <Card key={belief.id}>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <IconComponent className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{belief.title}</CardTitle>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => startEditBelief(belief)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteBelief(belief.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">{belief.description}</p>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Leadership Team */}
              <Card>
                <CardHeader>
                  <CardTitle>Leadership Team</CardTitle>
                  <CardDescription>Add, edit, or remove leadership team members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">{editingLeader ? 'Edit' : 'Add'} Leadership Member</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="leader-name">Name</Label>
                        <Input
                          id="leader-name"
                          value={leaderForm.name}
                          onChange={(e) => setLeaderForm({...leaderForm, name: e.target.value})}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="leader-role">Role</Label>
                        <Input
                          id="leader-role"
                          value={leaderForm.role}
                          onChange={(e) => setLeaderForm({...leaderForm, role: e.target.value})}
                          placeholder="e.g., Senior Pastor"
                        />
                      </div>
                      <div>
                        <Label htmlFor="leader-email">Email</Label>
                        <Input
                          id="leader-email"
                          type="email"
                          value={leaderForm.email}
                          onChange={(e) => setLeaderForm({...leaderForm, email: e.target.value})}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="leader-image">Photo URL</Label>
                        <Input
                          id="leader-image"
                          value={leaderForm.image}
                          onChange={(e) => setLeaderForm({...leaderForm, image: e.target.value})}
                          placeholder="Image URL"
                        />
                        <p className="text-xs text-muted-foreground mt-1 mb-2">Paste image URL or upload image below</p>
                        <FileUpload
                          type="gallery"
                          accept="image/*"
                          maxSize={5}
                          multiple={false}
                          onUploadComplete={handleLeaderPhotoUpload}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="leader-bio">Bio</Label>
                      <Textarea
                        id="leader-bio"
                        value={leaderForm.bio}
                        onChange={(e) => setLeaderForm({...leaderForm, bio: e.target.value})}
                        placeholder="Enter biography..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveLeader}>
                        <Save className="w-4 h-4 mr-2" />
                        {editingLeader ? 'Update' : 'Add'} Member
                      </Button>
                      {editingLeader && (
                        <Button variant="outline" onClick={() => {
                          setEditingLeader(null)
                          setLeaderForm({ name: '', role: '', image: '', bio: '', email: '', order: 0 })
                        }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Current Leadership Team ({aboutContent.leadership.length})</h3>
                    {aboutContent.leadership.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No leadership members added yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aboutContent.leadership.map((leader: any) => (
                          <Card key={leader.id} className="text-center">
                            <CardHeader>
                              <div className="mx-auto w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-primary/20">
                                <img
                                  src={leader.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"}
                                  alt={leader.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <CardTitle className="text-lg">{leader.name}</CardTitle>
                              <CardDescription>{leader.role}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{leader.bio}</p>
                              <div className="flex gap-2 justify-center">
                                <Button size="sm" variant="outline" onClick={() => startEditLeader(leader)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteLeader(leader.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && !isLoadingData && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Messages ({contactMessages.length})
                </CardTitle>
                <CardDescription>
                  View and respond to contact form messages
                </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadAllData}>
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMessages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{message.name}</h3>
                            {message.status === 'new' && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{message.email}</p>
                          {message.phone && (
                            <p className="text-sm text-muted-foreground">{message.phone}</p>
                          )}
                          {message.subject && (
                            <p className="text-sm font-medium mt-2">Subject: {message.subject}</p>
                          )}
                          <p className="mt-2">{message.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(message.created_at || message.date || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/messages', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: message.id, status: 'read' })
                                })
                                if (response.ok) {
                                  await loadAllData()
                                  toast({
                                    title: "Success",
                                    description: "Message marked as read"
                                  })
                                }
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to update message",
                                  variant: "destructive"
                                })
                              }
                            }}
                          >
                            Mark as Read
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this message?')) return
                              try {
                                const response = await fetch(`/api/messages?id=${message.id}`, {
                                  method: 'DELETE'
                                })
                                if (response.ok) {
                                  await loadAllData()
                                  toast({
                                    title: "Success",
                                    description: "Message deleted successfully"
                                  })
                                }
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to delete message",
                                  variant: "destructive"
                                })
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {contactMessages.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No messages found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && !isLoadingData && (
            <div className="space-y-6">
              {/* Basic Church Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Church Information
                  </CardTitle>
                  <CardDescription>
                    Update basic church information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="church-name">Church Name</Label>
                      <Input
                        id="church-name"
                        value={settingsForm.churchName}
                        onChange={(e) => setSettingsForm({...settingsForm, churchName: e.target.value})}
                        placeholder="Amazing Grace Baptist Church"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pastor-name">Pastor Name</Label>
                      <Input
                        id="pastor-name"
                        value={settingsForm.pastorName}
                        onChange={(e) => setSettingsForm({...settingsForm, pastorName: e.target.value})}
                        placeholder="Pastor John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="church-phone">Phone Number</Label>
                      <Input
                        id="church-phone"
                        value={settingsForm.churchPhone}
                        onChange={(e) => setSettingsForm({...settingsForm, churchPhone: e.target.value})}
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="church-email">Email Address</Label>
                      <Input
                        id="church-email"
                        type="email"
                        value={settingsForm.churchEmail}
                        onChange={(e) => setSettingsForm({...settingsForm, churchEmail: e.target.value})}
                        placeholder="info@amazinggracechurch.org"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="church-address">Address</Label>
                    <Textarea
                      id="church-address"
                      value={settingsForm.churchAddress}
                      onChange={(e) => setSettingsForm({...settingsForm, churchAddress: e.target.value})}
                      placeholder="U/Zawu, Gonin Gora, Kaduna State, Nigeria"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="church-description">Church Description</Label>
                    <Textarea
                      id="church-description"
                      value={settingsForm.churchDescription}
                      onChange={(e) => setSettingsForm({...settingsForm, churchDescription: e.target.value})}
                      placeholder="Welcome to Amazing Grace Baptist Church..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Service Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Service Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sunday-service">Sunday Service</Label>
                      <Input
                        id="sunday-service"
                        value={settingsForm.services.sunday}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm, 
                          services: {...settingsForm.services, sunday: e.target.value}
                        })}
                        placeholder="10:00 AM - 12:00 PM"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wednesday-service">Wednesday Service</Label>
                      <Input
                        id="wednesday-service"
                        value={settingsForm.services.wednesday}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm, 
                          services: {...settingsForm.services, wednesday: e.target.value}
                        })}
                        placeholder="6:00 PM - 7:30 PM"
                      />
                    </div>
                    <div>
                      <Label htmlFor="friday-service">Friday Service</Label>
                      <Input
                        id="friday-service"
                        value={settingsForm.services.friday}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm, 
                          services: {...settingsForm.services, friday: e.target.value}
                        })}
                        placeholder="7:00 PM - 8:30 PM"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Social Media Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={settingsForm.socialMedia.facebook}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm, 
                          socialMedia: {...settingsForm.socialMedia, facebook: e.target.value}
                        })}
                        placeholder="https://facebook.com/amazinggracechurch"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={settingsForm.socialMedia.instagram}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm, 
                          socialMedia: {...settingsForm.socialMedia, instagram: e.target.value}
                        })}
                        placeholder="https://instagram.com/amazinggracechurch"
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={settingsForm.socialMedia.youtube}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm, 
                          socialMedia: {...settingsForm.socialMedia, youtube: e.target.value}
                        })}
                        placeholder="https://youtube.com/@amazinggracechurch"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={settingsForm.socialMedia.twitter}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm, 
                          socialMedia: {...settingsForm.socialMedia, twitter: e.target.value}
                        })}
                        placeholder="https://twitter.com/amazinggracechurch"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Uploads for Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Website Images
                  </CardTitle>
                  <CardDescription>
                    Upload and manage images used throughout the website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUpload
                    type="settings"
                    accept="image/*"
                    maxSize={5}
                    multiple={false}
                    onUploadComplete={(file) => {
                      try {
                        if (!file) {
                          console.error('onUploadComplete received undefined file')
                          return
                        }
                        if (!file.url) {
                          console.error('onUploadComplete received file without URL:', file)
                          toast({
                            title: "Upload Warning",
                            description: "File uploaded but URL is missing",
                            variant: "destructive"
                          })
                          return
                        }
                        setSettingsForm({...settingsForm, heroImage: file.url})
                        toast({
                          title: "Hero Image Set",
                          description: "Hero image URL has been automatically set"
                        })
                      } catch (error) {
                        console.error('Error processing settings upload completion:', error)
                        toast({
                          title: "Upload Processing Error",
                          description: error instanceof Error ? error.message : "Failed to process upload",
                          variant: "destructive"
                        })
                      }
                    }}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero-image">Hero Image URL</Label>
                      <Input
                        id="hero-image"
                        value={settingsForm.heroImage}
                        onChange={(e) => setSettingsForm({...settingsForm, heroImage: e.target.value})}
                        placeholder="/uploads/settings/hero-image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="about-image">About Image URL</Label>
                      <Input
                        id="about-image"
                        value={settingsForm.aboutImage}
                        onChange={(e) => setSettingsForm({...settingsForm, aboutImage: e.target.value})}
                        placeholder="/uploads/settings/about-image.jpg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    SEO Settings
                  </CardTitle>
                  <CardDescription>
                    Configure search engine optimization settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seo-title">Page Title</Label>
                    <Input
                      id="seo-title"
                      value={settingsForm.seo.title}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm, 
                        seo: {...settingsForm.seo, title: e.target.value}
                      })}
                      placeholder="Amazing Grace Baptist Church - U/Zawu, Gonin Gora, Kaduna State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seo-description">Meta Description</Label>
                    <Textarea
                      id="seo-description"
                      value={settingsForm.seo.description}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm, 
                        seo: {...settingsForm.seo, description: e.target.value}
                      })}
                      placeholder="Welcome to Amazing Grace Baptist Church..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seo-keywords">Keywords</Label>
                    <Input
                      id="seo-keywords"
                      value={settingsForm.seo.keywords}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm, 
                        seo: {...settingsForm.seo, keywords: e.target.value}
                      })}
                      placeholder="church, baptist, kaduna, nigeria, worship, fellowship"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Settings */}
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={handleUpdateSettings} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save All Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}