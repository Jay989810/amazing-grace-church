"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Download, Calendar, User, Filter, Search, Mail } from "lucide-react"
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
  audio_url: string
  video_url: string
  notes_url: string
  duration: string
  thumbnail: string
}

export default function SermonsPage() {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleWatchSermon = (sermonTitle: string) => {
    toast({
      title: "Opening Sermon",
      description: `Starting video for "${sermonTitle}"...`,
    })
  }

  const handleDownloadSermon = (sermonTitle: string) => {
    toast({
      title: "Download Started",
      description: `Downloading "${sermonTitle}"...`,
      variant: "success"
    })
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
              {filteredSermons.map((sermon) => (
                <Card key={sermon.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="lg" className="rounded-full">
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {sermon.duration}
                    </div>
                  </div>
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
                      <Button 
                        size="sm" 
                        className="flex-1 min-w-[120px] hover:scale-105 transition-transform"
                        onClick={() => handleWatchSermon(sermon.title)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadSermon(sermon.title)}
                        className="hover:scale-105 transition-transform"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
