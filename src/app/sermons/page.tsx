"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Download, Calendar, User, Filter, Search, Mail, Headphones, Video, X } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ChurchLogo } from "@/components/church-logo"

interface Sermon {
  id: string
  title: string
  speaker: string
  date: string
  category: string
  description: string
  audioUrl?: string
  videoUrl?: string
  notesUrl?: string
  duration?: string
  thumbnail?: string
  // Support both naming conventions
  audio_url?: string
  video_url?: string
  notes_url?: string
}

export default function SermonsPage() {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [playingSermon, setPlayingSermon] = useState<string | null>(null)

  // Fetch sermons from API
  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const response = await fetch('/api/sermons')
        if (response.ok) {
          const data = await response.json()
          setSermons(data)
        } else {
          console.error('Failed to fetch sermons')
        }
      } catch (error) {
        console.error('Error fetching sermons:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSermons()
  }, [])

  const categories = ["All", "Sunday Service", "Mid-week", "Bible Study", "Prayer Meeting", "Special Event"]

  const getAudioUrl = (sermon: Sermon) => {
    const url = sermon.audioUrl || sermon.audio_url
    if (url && url !== '#' && url.trim() !== '' && url !== 'null') {
      // Convert S3 URL to proxy URL if needed
      if (url.includes('amazing-grace-church.s3.eu-north-1.amazonaws.com')) {
        const s3Path = url.split('amazing-grace-church.s3.eu-north-1.amazonaws.com/')[1]
        return `/api/media/${s3Path}`
      }
      return url
    }
    return null
  }
  
  const getVideoUrl = (sermon: Sermon) => {
    const url = sermon.videoUrl || sermon.video_url
    if (url && url !== '#' && url.trim() !== '' && url !== 'null') {
      // Convert S3 URL to proxy URL if needed
      if (url.includes('amazing-grace-church.s3.eu-north-1.amazonaws.com')) {
        const s3Path = url.split('amazing-grace-church.s3.eu-north-1.amazonaws.com/')[1]
        return `/api/media/${s3Path}`
      }
      return url
    }
    return null
  }
  
  const getNotesUrl = (sermon: Sermon) => {
    const url = sermon.notesUrl || sermon.notes_url
    return url && url !== '#' && url.trim() !== '' && url !== 'null' ? url : null
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
    // Try audio first, then video, then notes
    const downloadUrl = getAudioUrl(sermon) || getVideoUrl(sermon) || getNotesUrl(sermon)
    
    if (downloadUrl) {
      try {
        // Convert S3 URL to proxy URL if needed
        let proxyUrl = downloadUrl
        if (downloadUrl.includes('amazing-grace-church.s3.eu-north-1.amazonaws.com')) {
          const s3Path = downloadUrl.split('amazing-grace-church.s3.eu-north-1.amazonaws.com/')[1]
          proxyUrl = `/api/media/${s3Path}`
        }
        
        // Check if the URL is accessible
        const response = await fetch(proxyUrl, { method: 'HEAD' })
        if (!response.ok) {
          throw new Error(`File not accessible: ${response.status}`)
        }
        
        // Get file extension from URL or content type
        const urlExtension = downloadUrl.split('.').pop()?.split('?')[0] || ''
        const contentType = response.headers.get('content-type') || ''
        let extension = urlExtension
        
        // Determine extension from content type if URL doesn't have one
        if (!extension) {
          if (contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) {
            extension = 'mp3'
          } else if (contentType.includes('audio/wav')) {
            extension = 'wav'
          } else if (contentType.includes('video/mp4')) {
            extension = 'mp4'
          } else if (contentType.includes('video/quicktime')) {
            extension = 'mov'
          } else if (contentType.includes('application/pdf')) {
            extension = 'pdf'
          } else {
            extension = 'file'
          }
        }
        
        // Create download link
        const link = document.createElement('a')
        link.href = proxyUrl
        link.download = `${sermon.title.replace(/[^a-zA-Z0-9\s]/g, '')} - ${sermon.speaker.replace(/[^a-zA-Z0-9\s]/g, '')}.${extension}`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: "Download Started",
          description: `Downloading "${sermon.title}"...`,
        })
      } catch (error) {
        console.error('Download error:', error)
        toast({
          title: "Download Error",
          description: error instanceof Error ? error.message : "Failed to download file. Please try again.",
          variant: "destructive"
        })
      }
    } else {
      toast({
        title: "Download Not Available",
        description: "No downloadable file is available for this sermon.",
        variant: "destructive"
      })
    }
  }

  const isAudioSermon = (sermon: Sermon) => {
    const audioUrl = getAudioUrl(sermon)
    const videoUrl = getVideoUrl(sermon)
    // Audio sermon: has audio but no video
    return !!audioUrl && !videoUrl
  }

  const isVideoSermon = (sermon: Sermon) => {
    const videoUrl = getVideoUrl(sermon)
    // Video sermon: has video (regardless of audio)
    return !!videoUrl
  }

  const handleSubscribeToSermons = () => {
    toast({
      title: "Successfully Subscribed!",
      description: "You'll receive notifications about new sermons and church updates.",
      variant: "success"
    })
  }

  const filteredSermons = sermons.filter(sermon => {
    const matchesCategory = selectedCategory === "All" || sermon.category === selectedCategory
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading sermons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 md:space-y-8">
            {/* Church Logo */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="relative bg-primary/10 rounded-full p-4 md:p-6 border-4 border-primary/20 shadow-lg">
                <ChurchLogo size="lg" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary px-4">
              Sermons & Messages
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4">
              Watch, listen, and download our weekly sermons and Bible study messages
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sermons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Filter className="h-4 w-4" />
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sermons Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredSermons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No sermons found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSermons.map((sermon) => {
                const isAudio = isAudioSermon(sermon)
                const isVideo = isVideoSermon(sermon)
                const isPlaying = playingSermon === sermon.id
                
                return (
                  <Card key={sermon.id} className="overflow-hidden">
                    {/* Thumbnail or Video Player */}
                    <div className="aspect-video bg-muted relative">
                      {isPlaying && isVideo ? (
                        <>
                          <video
                            src={getVideoUrl(sermon)!}
                            controls
                            className="w-full h-full object-cover"
                            onEnded={() => setPlayingSermon(null)}
                            onError={(e) => {
                              console.error('Video playback error:', e)
                              toast({
                                title: "Playback Error",
                                description: "Unable to play video. Please try downloading instead.",
                                variant: "destructive"
                              })
                              setPlayingSermon(null)
                            }}
                            preload="metadata"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/90"
                            onClick={() => setPlayingSermon(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : sermon.thumbnail && sermon.thumbnail !== '#' ? (
                        <img
                          src={sermon.thumbnail}
                          alt={sermon.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          {isAudio ? (
                            <Headphones className="h-12 w-12 text-primary" />
                          ) : isVideo ? (
                            <Video className="h-12 w-12 text-primary" />
                          ) : (
                            <Play className="h-12 w-12 text-primary" />
                          )}
                        </div>
                      )}
                      {sermon.duration && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {sermon.duration}
                        </div>
                      )}
                    </div>
                    
                    {/* Audio Player (if audio and playing) */}
                    {isPlaying && isAudio && (
                      <div className="p-4 bg-muted border-b">
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
                    
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {sermon.category}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(sermon.date)}
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 mt-2">{sermon.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{sermon.speaker}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {sermon.description}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {isAudio ? (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1 min-w-[120px] hover:scale-105 transition-transform"
                              onClick={() => handlePlayAudio(sermon)}
                              disabled={isPlaying}
                            >
                              <Headphones className="h-4 w-4 mr-2" />
                              {isPlaying ? 'Playing...' : 'Play'}
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
                        ) : isVideo ? (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1 min-w-[120px] hover:scale-105 transition-transform"
                              onClick={() => handleWatchVideo(sermon)}
                              disabled={isPlaying}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              {isPlaying ? 'Playing...' : 'Watch'}
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
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadSermon(sermon)}
                              className="flex-1 hover:scale-105 transition-transform"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            {sermon.notes_url && getNotesUrl(sermon) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  const notesUrl = getNotesUrl(sermon)
                                  if (notesUrl) {
                                    window.open(notesUrl, '_blank')
                                  }
                                }}
                                className="hover:scale-105 transition-transform"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Notes
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Subscribe to our newsletter to receive notifications about new sermons and church updates.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 hover:scale-105 transition-transform"
            onClick={handleSubscribeToSermons}
          >
            <Mail className="h-4 w-4 mr-2" />
            Subscribe to Updates
          </Button>
        </div>
      </section>
    </div>
  )
}
