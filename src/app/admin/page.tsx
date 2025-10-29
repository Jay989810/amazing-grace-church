"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { LogOut, User, Plus, Edit, Trash2, Eye, Calendar, Music, Image, Mail, Settings, Save, X, Upload, Globe, Phone, MapPin, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/file-upload"

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
  description: string
  image_url: string
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
  
  // UI state
  const [activeTab, setActiveTab] = useState('sermons')
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [galleryCategory, setGalleryCategory] = useState('Other')
  
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
      const [sermonsRes, eventsRes, galleryRes, messagesRes, settingsRes, filesRes] = await Promise.all([
        fetch('/api/sermons'),
        fetch('/api/events'),
        fetch('/api/gallery'),
        fetch('/api/messages'),
        fetch('/api/settings'),
        fetch('/api/upload')
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

  const handleFileUploadComplete = (file: any) => {
    setUploadedFiles(prev => [file, ...prev])
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/upload?id=${fileId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
        toast({
          title: "Success",
          description: "File deleted successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
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
                      onUploadComplete={(file) => {
                        if (file.mimeType.startsWith('audio/')) {
                          setSermonForm({...sermonForm, audio_url: file.url})
                        } else if (file.mimeType.startsWith('video/')) {
                          setSermonForm({...sermonForm, video_url: file.url})
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
                      handleFileUploadComplete(file)
                      // Refresh gallery images after upload
                      loadAllData()
                    }}
                    metadata={{ album: galleryCategory, category: galleryCategory }}
                  />
                </CardContent>
              </Card>

              {/* Gallery Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Gallery Images ({uploadedFiles.filter(f => f.type === 'gallery').length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedFiles
                      .filter(file => file.type === 'gallery')
                      .map((file) => (
                        <div key={file.id} className="relative group">
                          <img
                            src={file.url}
                            alt={file.originalName}
                            className="w-full h-32 object-cover rounded-lg"
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
                                onClick={() => handleDeleteFile(file.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {file.originalName}
                          </p>
                        </div>
                      ))}
                  </div>
                  {uploadedFiles.filter(f => f.type === 'gallery').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No gallery images uploaded yet.</p>
                  )}
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
                      setSettingsForm({...settingsForm, heroImage: file.url})
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