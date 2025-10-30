"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Calendar, Users, MapPin, Download, Clock, Mail, Headphones, Video, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { ChurchLogo } from "@/components/church-logo"
import { useSettings } from "@/components/settings-provider"
import { formatDate } from "@/lib/utils"

interface Sermon {
  id: string
  title: string
  speaker: string
  date: string
  category: string
  description: string
  audio_url?: string
  video_url?: string
  notes_url?: string
  // API may also send camelCase
  audioUrl?: string
  videoUrl?: string
  notesUrl?: string
  duration: string
  thumbnail: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  venue: string
  type: string
  image: string
  registration_required: boolean
  registration_url: string
}

interface GalleryImage {
  id: string
  title: string
  description: string
  image_url: string
  uploaded_at: string
}

export default function Home() {
  const { toast } = useToast()
  const { settings } = useSettings()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([])
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [recentGallery, setRecentGallery] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch recent data from APIs
  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        // Fetch recent sermons (limit to 3)
        const sermonsResponse = await fetch('/api/sermons')
        if (sermonsResponse.ok) {
          const sermons = await sermonsResponse.json()
          const validSermons = sermons.filter((s: any) => s.title && s.speaker)
          setRecentSermons(validSermons.slice(0, 3))
        }

        // Fetch recent events (limit to 3)
        const eventsResponse = await fetch('/api/events')
        if (eventsResponse.ok) {
          const events = await eventsResponse.json()
          setRecentEvents(events.slice(0, 3))
        }

        // Fetch recent gallery images (limit to 3)
        const galleryResponse = await fetch('/api/gallery')
        if (galleryResponse.ok) {
          const gallery = await galleryResponse.json()
          const validImages = gallery.filter((g: any) => (g.image_url || g.imageUrl))
          setRecentGallery(validImages.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching recent data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentData()
  }, [])

  const handleSubscribe = async () => {
    setIsSubscribing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubscribing(false)
    toast({
      title: "Successfully Subscribed!",
      description: "You'll receive notifications about new sermons and church updates.",
      variant: "success"
    })
  }

  const [playingSermon, setPlayingSermon] = useState<string | null>(null)

const getAudioUrl = (sermon: Sermon) => {
  const url = sermon.audio_url || sermon.audioUrl
    // Vercel Blob URLs work directly, no conversion needed
    return url && url !== '#' && url.trim() !== '' && url !== 'null' ? url : null
  }
  
const getVideoUrl = (sermon: Sermon) => {
  const url = sermon.video_url || sermon.videoUrl
    // Vercel Blob URLs work directly, no conversion needed
    return url && url !== '#' && url.trim() !== '' && url !== 'null' ? url : null
  }

  const isAudioSermon = (sermon: Sermon) => {
    const audioUrl = getAudioUrl(sermon)
    const videoUrl = getVideoUrl(sermon)
    return !!audioUrl && !videoUrl
  }

  const isVideoSermon = (sermon: Sermon) => {
    const videoUrl = getVideoUrl(sermon)
    return !!videoUrl
  }

  const handlePlayAudio = (sermon: Sermon) => {
    const audioUrl = getAudioUrl(sermon)
    if (audioUrl) {
      setPlayingSermon(sermon.id)
    } else {
      toast({
        title: "Audio Not Available",
        description: "No audio file is available for this sermon.",
        variant: "destructive"
      })
    }
  }

  const handleWatchVideo = (sermon: Sermon) => {
    const videoUrl = getVideoUrl(sermon)
    if (videoUrl) {
      setPlayingSermon(sermon.id)
    } else {
      toast({
        title: "Video Not Available",
        description: "No video file is available for this sermon.",
        variant: "destructive"
      })
    }
  }

  const handleDownloadSermon = async (sermon: Sermon) => {
    const downloadUrl = sermon.audio_url || sermon.audioUrl || sermon.video_url || sermon.videoUrl || sermon.notes_url || sermon.notesUrl

    if (!downloadUrl || downloadUrl === '#' || downloadUrl === 'null') {
      toast({ title: "Download Not Available", description: "No downloadable file is available for this sermon.", variant: "destructive" })
      return
    }

    // Infer extension and file name (used by both paths)
    let extension = downloadUrl.split('.').pop()?.split('?')[0] || ''
    if (!extension || extension.length > 5) {
      if (downloadUrl.includes('.mp3')) extension = 'mp3'
      else if (downloadUrl.includes('.mp4')) extension = 'mp4'
      else if (downloadUrl.includes('.mov')) extension = 'mov'
      else if (downloadUrl.includes('.wav')) extension = 'wav'
      else if (downloadUrl.includes('.pdf')) extension = 'pdf'
      else extension = 'file'
    }
    const fileName = `${sermon.title.replace(/[^a-zA-Z0-9\s]/g, '')} - ${sermon.speaker.replace(/[^a-zA-Z0-9\s]/g, '')}.${extension}`

    try {
      // Always fetch as blob to force download (prevents in-browser preview)
      const response = await fetch(downloadUrl, { mode: 'cors', credentials: 'omit' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
      toast({ title: "Download Started", description: `Downloading "${sermon.title}"...` })
    } catch (error) {
      console.error('Download error:', error)
      toast({ title: "Download Error", description: "Failed to download file.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1920&h=1080&fit=crop&crop=center')`
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/80"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            {/* Church Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-4 border-4 border-white/30 shadow-2xl">
                <ChurchLogo size="lg" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              Amazing Grace Baptist Church
          </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
              "For by grace you have been saved through faith, and this is not your own doing; 
              it is the gift of God." - Ephesians 2:8
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 hover:scale-105 transition-transform bg-white text-primary hover:bg-white/90 shadow-lg">
                <Link href="/contact">Join Us This Sunday</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 hover:scale-105 transition-transform border-white text-white hover:bg-white hover:text-primary shadow-lg">
                <Link href="/sermons">Watch Latest Sermon</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Service Times</h2>
            <p className="text-lg text-muted-foreground">Join us for worship and fellowship</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle>Sunday Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">8AM – 10AM</p>
                <p className="text-muted-foreground">Main Sanctuary</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle>Wednesday Mid-Week Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">5PM – 6PM</p>
                <p className="text-muted-foreground">Main Sanctuary</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle>Monday Bible Study</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">5PM</p>
                <p className="text-muted-foreground">Fellowship Hall</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Sermons */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Recent Sermons</h2>
            <p className="text-lg text-muted-foreground">Watch, listen, or download our latest messages</p>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading sermons...</p>
            </div>
          ) : recentSermons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSermons.map((sermon) => (
                <Card key={sermon.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {sermon.thumbnail && sermon.thumbnail !== '#' ? (
                      <Image
                        src={sermon.thumbnail}
                        alt={sermon.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-12 w-12 text-primary" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {sermon.duration || 'N/A'}
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {sermon.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(sermon.date)}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{sermon.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{sermon.speaker}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {sermon.description}
                    </p>
                    
                    {/* Audio Player (if audio and playing) */}
                    {playingSermon === sermon.id && isAudioSermon(sermon) && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Headphones className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Now Playing</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-6 w-6 p-0"
                            onClick={() => setPlayingSermon(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <audio
                          src={getAudioUrl(sermon)!}
                          controls
                          className="w-full"
                          onEnded={() => setPlayingSermon(null)}
                          onError={(e) => {
                            console.error('Audio playback error:', e)
                            toast({
                              title: "Playback Error",
                              description: "Unable to play audio. Please try downloading instead.",
                              variant: "destructive"
                            })
                            setPlayingSermon(null)
                          }}
                          preload="metadata"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {isAudioSermon(sermon) ? (
                        <>
                          <Button 
                            size="sm" 
                            className="flex-1 hover:scale-105 transition-transform"
                            onClick={() => handlePlayAudio(sermon)}
                            disabled={playingSermon === sermon.id}
                          >
                            <Headphones className="h-4 w-4 mr-2" />
                            {playingSermon === sermon.id ? 'Playing...' : 'Play'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadSermon(sermon)}
                            className="hover:scale-105 transition-transform"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      ) : isVideoSermon(sermon) ? (
                        <>
                          <Button 
                            size="sm" 
                            className="flex-1 hover:scale-105 transition-transform"
                            onClick={() => handleWatchVideo(sermon)}
                            disabled={playingSermon === sermon.id}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            {playingSermon === sermon.id ? 'Playing...' : 'Watch'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadSermon(sermon)}
                            className="hover:scale-105 transition-transform"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadSermon(sermon)}
                          className="w-full hover:scale-105 transition-transform"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sermons available yet.</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/sermons">View All Sermons</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Events */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Recent Events</h2>
            <p className="text-lg text-muted-foreground">Join us for these special occasions</p>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading events...</p>
            </div>
          ) : recentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  {event.image && event.image !== '#' && (
                    <div className="aspect-video bg-muted relative">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </div>
                    <CardDescription>
                      {formatDate(event.date)} at {event.time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                      <p className="text-sm line-clamp-3">{event.description}</p>
                      {event.registration_required && (
                        <div className="pt-2">
                          <Button size="sm" variant="outline" className="w-full">
                            Register Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No events available yet.</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Church Life Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Church Life</h2>
            <p className="text-lg text-muted-foreground">See what's happening in our community</p>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading gallery...</p>
            </div>
          ) : recentGallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recentGallery.map((image) => {
                const rawUrl = (image as any).image_url || (image as any).imageUrl || (image as any).url || ''
                let displayUrl = rawUrl
                try {
                  displayUrl = decodeURIComponent(rawUrl)
                } catch {}
                return (
                <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    <Image
                      src={displayUrl}
                      alt={image.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="sm" variant="secondary">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium line-clamp-2">{image.title}</p>
                    {image.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )})}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No gallery images available yet.</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/gallery">View Full Gallery</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We welcome you to Amazing Grace Baptist Church. Come and experience the love, 
            fellowship, and spiritual growth that awaits you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 hover:scale-105 transition-transform">
              <Link href="/contact">Get in Touch</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:scale-105 transition-transform">
              <Link href="/about">Learn More</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:scale-105 transition-transform"
              onClick={handleSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Subscribing...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe to Updates
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
