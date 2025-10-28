"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Upload, Users, MessageSquare, Calendar, Image, FileText, Settings, LogOut, Plus, Edit, Trash2, Eye, Bell, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Sermon {
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
}

interface Event {
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
}

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  date: string
  status: 'new' | 'read' | 'replied'
  created_at: string
}

interface GalleryImage {
  id: string
  title: string
  description?: string
  image_url: string
  album: string
  date: string
  photographer?: string
  created_at: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [sermonForm, setSermonForm] = useState({
    title: '',
    speaker: '',
    date: '',
    category: 'Sunday Service' as const,
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
    time: '',
    venue: '',
    type: 'Service' as const,
    image: '',
    registration_required: false,
    registration_url: ''
  })

  // Fetch data functions
  const fetchSermons = async () => {
    try {
      const response = await fetch('/api/sermons')
      const data = await response.json()
      setSermons(data)
    } catch (error) {
      console.error('Error fetching sermons:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      const data = await response.json()
      setMessages(data)
      setNewMessageCount(data.filter((msg: ContactMessage) => msg.status === 'new').length)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      setGalleryImages(data)
    } catch (error) {
      console.error('Error fetching gallery images:', error)
    }
  }

  useEffect(() => {
    if (session) {
      fetchSermons()
      fetchEvents()
      fetchMessages()
      fetchGalleryImages()
    }
  }, [session])

  // CRUD operations
  const handleCreateSermon = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sermonForm)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sermon created successfully!",
        })
        setSermonForm({
          title: '',
          speaker: '',
          date: '',
          category: 'Sunday Service',
          description: '',
          audio_url: '',
          video_url: '',
          notes_url: '',
          thumbnail: '',
          duration: ''
        })
        fetchSermons()
      } else {
        throw new Error('Failed to create sermon')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sermon",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Event created successfully!",
        })
        setEventForm({
          title: '',
          description: '',
          date: '',
          time: '',
          venue: '',
          type: 'Service',
          image: '',
          registration_required: false,
          registration_url: ''
        })
        fetchEvents()
      } else {
        throw new Error('Failed to create event')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateMessageStatus = async (messageId: string, status: 'read' | 'replied') => {
    try {
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageId, status })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Message marked as ${status}`,
        })
        fetchMessages()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSermon = async (sermonId: string) => {
    try {
      const response = await fetch(`/api/sermons?id=${sermonId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sermon deleted successfully!",
        })
        fetchSermons()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sermon",
        variant: "destructive"
      })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Event deleted successfully!",
        })
        fetchEvents()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message deleted successfully!",
        })
        fetchMessages()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      })
    }
  }

  // Login form component
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Sign in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="admin@amazinggracechurch.org"
                  defaultValue="admin@amazinggracechurch.org"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  defaultValue="grace1234"
                />
              </div>
              <Button 
                type="button"
                className="w-full"
                onClick={() => signIn('credentials', {
                  email: 'admin@amazinggracechurch.org',
                  password: 'grace1234',
                  callbackUrl: '/admin'
                })}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Admin Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-muted-foreground">Amazing Grace Baptist Church</p>
            </div>
            <div className="flex items-center gap-4">
              {newMessageCount > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-red-500" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {newMessageCount}
                  </span>
                </div>
              )}
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 space-y-2">
            <nav className="space-y-1">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("dashboard")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "sermons" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("sermons")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Sermons
              </Button>
              <Button
                variant={activeTab === "events" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("events")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </Button>
              <Button
                variant={activeTab === "gallery" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("gallery")}
              >
                <Image className="h-4 w-4 mr-2" />
                Gallery
              </Button>
              <Button
                variant={activeTab === "messages" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("messages")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages {newMessageCount > 0 && `(${newMessageCount})`}
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Dashboard Overview</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Sermons</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{sermons.length}</div>
                      <p className="text-xs text-muted-foreground">Live count</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{events.length}</div>
                      <p className="text-xs text-muted-foreground">Live count</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">New Messages</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{newMessageCount}</div>
                      <p className="text-xs text-muted-foreground">Unread</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{galleryImages.length}</div>
                      <p className="text-xs text-muted-foreground">Live count</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Messages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Contact Messages</CardTitle>
                    <CardDescription>Latest messages from the contact form</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {messages.slice(0, 5).map((message) => (
                        <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{message.name}</p>
                            <p className="text-sm text-muted-foreground">{message.subject}</p>
                            <p className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              message.status === 'new' ? 'bg-red-100 text-red-800' :
                              message.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {message.status}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateMessageStatus(message.id, 'read')}
                            >
                              Mark Read
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Sermons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sermons</CardTitle>
                    <CardDescription>Latest uploaded sermons</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sermons.slice(0, 5).map((sermon) => (
                        <div key={sermon.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{sermon.title}</p>
                            <p className="text-sm text-muted-foreground">by {sermon.speaker}</p>
                            <p className="text-xs text-muted-foreground">{new Date(sermon.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteSermon(sermon.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "sermons" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Sermon Management</h2>
                </div>
                
                {/* Sermon Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Sermon</CardTitle>
                    <CardDescription>Add audio, video, or sermon notes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSermon} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Sermon Title</Label>
                          <Input
                            id="title"
                            value={sermonForm.title}
                            onChange={(e) => setSermonForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter sermon title"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="speaker">Speaker</Label>
                          <Input
                            id="speaker"
                            value={sermonForm.speaker}
                            onChange={(e) => setSermonForm(prev => ({ ...prev, speaker: e.target.value }))}
                            placeholder="Speaker name"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={sermonForm.date}
                            onChange={(e) => setSermonForm(prev => ({ ...prev, date: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select
                            id="category"
                            value={sermonForm.category}
                            onChange={(e) => setSermonForm(prev => ({ ...prev, category: e.target.value as any }))}
                          >
                            <option value="Sunday Service">Sunday Service</option>
                            <option value="Mid-week">Mid-week</option>
                            <option value="Bible Study">Bible Study</option>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={sermonForm.description}
                          onChange={(e) => setSermonForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Sermon description"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="audio_url">Audio URL</Label>
                          <Input
                            id="audio_url"
                            value={sermonForm.audio_url}
                            onChange={(e) => setSermonForm(prev => ({ ...prev, audio_url: e.target.value }))}
                            placeholder="Audio file URL"
                          />
                        </div>
                        <div>
                          <Label htmlFor="video_url">Video URL</Label>
                          <Input
                            id="video_url"
                            value={sermonForm.video_url}
                            onChange={(e) => setSermonForm(prev => ({ ...prev, video_url: e.target.value }))}
                            placeholder="Video file URL"
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes_url">Sermon Notes URL</Label>
                          <Input
                            id="notes_url"
                            value={sermonForm.notes_url}
                            onChange={(e) => setSermonForm(prev => ({ ...prev, notes_url: e.target.value }))}
                            placeholder="PDF/DOCX URL"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="thumbnail">Thumbnail URL</Label>
                          <Input
                            id="thumbnail"
                            value={sermonForm.thumbnail}
                            onChange={(e) => setSermonForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                            placeholder="Thumbnail image URL"
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Duration</Label>
                          <Input
                            id="duration"
                            value={sermonForm.duration}
                            onChange={(e) => setSermonForm(prev => ({ ...prev, duration: e.target.value }))}
                            placeholder="e.g., 45:30"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Creating...' : 'Create Sermon'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Sermons List */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Sermons</CardTitle>
                    <CardDescription>Manage existing sermons</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sermons.map((sermon) => (
                        <div key={sermon.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{sermon.title}</h3>
                            <p className="text-sm text-muted-foreground">by {sermon.speaker}</p>
                            <p className="text-xs text-muted-foreground">
                              {sermon.category} • {new Date(sermon.date).toLocaleDateString()}
                            </p>
                            {sermon.description && (
                              <p className="text-sm text-muted-foreground mt-1">{sermon.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteSermon(sermon.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Event Management</h2>
                </div>
                
                {/* Event Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Event</CardTitle>
                    <CardDescription>Add upcoming church events and activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="event_title">Event Title</Label>
                          <Input
                            id="event_title"
                            value={eventForm.title}
                            onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Event title"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event_type">Event Type</Label>
                          <Select
                            id="event_type"
                            value={eventForm.type}
                            onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as any }))}
                          >
                            <option value="Service">Service</option>
                            <option value="Conference">Conference</option>
                            <option value="Crusade">Crusade</option>
                            <option value="Youth Program">Youth Program</option>
                            <option value="Other">Other</option>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="event_date">Date</Label>
                          <Input
                            id="event_date"
                            type="date"
                            value={eventForm.date}
                            onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event_time">Time</Label>
                          <Input
                            id="event_time"
                            type="time"
                            value={eventForm.time}
                            onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="venue">Venue</Label>
                        <Input
                          id="venue"
                          value={eventForm.venue}
                          onChange={(e) => setEventForm(prev => ({ ...prev, venue: e.target.value }))}
                          placeholder="Event venue"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="event_description">Description</Label>
                        <Textarea
                          id="event_description"
                          value={eventForm.description}
                          onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Event description"
                          rows={4}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="event_image">Image URL</Label>
                          <Input
                            id="event_image"
                            value={eventForm.image}
                            onChange={(e) => setEventForm(prev => ({ ...prev, image: e.target.value }))}
                            placeholder="Event image URL"
                          />
                        </div>
                        <div>
                          <Label htmlFor="registration_url">Registration URL</Label>
                          <Input
                            id="registration_url"
                            value={eventForm.registration_url}
                            onChange={(e) => setEventForm(prev => ({ ...prev, registration_url: e.target.value }))}
                            placeholder="Registration link (optional)"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="registration_required"
                          checked={eventForm.registration_required}
                          onChange={(e) => setEventForm(prev => ({ ...prev, registration_required: e.target.checked }))}
                        />
                        <Label htmlFor="registration_required">Requires Registration</Label>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Creating...' : 'Create Event'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Events List */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Events</CardTitle>
                    <CardDescription>Manage existing events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()} at {event.time}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{event.venue}</p>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "messages" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Contact Messages</h2>
                
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{message.subject}</CardTitle>
                            <CardDescription>{message.name} • {message.email}</CardDescription>
                            {message.phone && (
                              <CardDescription>Phone: {message.phone}</CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              message.status === 'new' ? 'bg-red-100 text-red-800' :
                              message.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {message.status}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateMessageStatus(message.id, 'read')}
                            >
                              Mark Read
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateMessageStatus(message.id, 'replied')}
                            >
                              Mark Replied
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{message.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Received: {new Date(message.created_at).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Settings</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Church Information</CardTitle>
                    <CardDescription>Update church details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="church_name">Church Name</Label>
                          <Input
                            id="church_name"
                            defaultValue="Amazing Grace Baptist Church"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pastor_name">Pastor Name</Label>
                          <Input
                            id="pastor_name"
                            defaultValue="Pastor John Doe"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          defaultValue="U/Zawu, Gonin Gora, Kaduna State, Nigeria"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            defaultValue="+234 XXX XXX XXXX"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            defaultValue="info@amazinggracechurch.org"
                          />
                        </div>
                      </div>
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}