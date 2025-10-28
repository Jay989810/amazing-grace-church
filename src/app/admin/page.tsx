"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { LogOut, User, Plus, Edit, Trash2, Eye, Calendar, Music, Image, Mail, Settings, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  message: string
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
  
  // UI state
  const [activeTab, setActiveTab] = useState('sermons')
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
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

  // Load data on component mount
  useEffect(() => {
    if (session) {
      loadAllData()
    }
  }, [session])

  const loadAllData = async () => {
    try {
      const [sermonsRes, eventsRes, galleryRes, messagesRes] = await Promise.all([
        fetch('/api/sermons'),
        fetch('/api/events'),
        fetch('/api/gallery'),
        fetch('/api/messages')
      ])
      
      if (sermonsRes.ok) setSermons(await sermonsRes.json())
      if (eventsRes.ok) setEvents(await eventsRes.json())
      if (galleryRes.ok) setGalleryImages(await galleryRes.json())
      if (messagesRes.ok) setContactMessages(await messagesRes.json())
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    }
  }

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
                Password: grace1234
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {session.user?.name || 'Admin'}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
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
              className="flex-1"
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Sermons Tab */}
          {activeTab === 'sermons' && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{sermon.title}</h3>
                            <p className="text-muted-foreground">by {sermon.speaker}</p>
                            <p className="text-sm text-muted-foreground mt-1">{sermon.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <span>{new Date(sermon.date).toLocaleDateString()}</span>
                              <span>{sermon.category}</span>
                              {sermon.duration && <span>{sermon.duration}</span>}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => startEditSermon(sermon)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteSermon(sermon.id)}>
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
          {activeTab === 'events' && (
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
          {activeTab === 'gallery' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="w-5 h-5 mr-2" />
                  Gallery Management
                </CardTitle>
                <CardDescription>
                  Upload and manage church photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Gallery management coming soon. For now, you can manage images through the API.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Messages ({contactMessages.length})
                </CardTitle>
                <CardDescription>
                  View and respond to contact form messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMessages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{message.name}</h3>
                          <p className="text-sm text-muted-foreground">{message.email}</p>
                          <p className="mt-2">{message.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
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
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Church Settings
                </CardTitle>
                <CardDescription>
                  Configure church information and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Settings management coming soon. You can update church information through the API.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}