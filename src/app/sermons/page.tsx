"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Download, Calendar, User, Filter, Search, Mail } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ChurchLogo } from "@/components/church-logo"

export default function SermonsPage() {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  // Sample sermon data - in a real app, this would come from your backend/database
  const sermons = [
    {
      id: "1",
      title: "Walking in Faith and Grace",
      speaker: "Pastor John Doe",
      date: "2024-01-21",
      category: "Sunday Service",
      description: "Join us as we explore the journey of faith and the amazing grace that sustains us through life's challenges.",
      audioUrl: "#",
      videoUrl: "#",
      notesUrl: "#",
      duration: "45:30",
      thumbnail: "/api/placeholder/400/225"
    },
    {
      id: "2",
      title: "The Power of Prayer",
      speaker: "Elder Mary Johnson",
      date: "2024-01-17",
      category: "Mid-week",
      description: "Discover the transformative power of prayer in our daily lives and how it strengthens our relationship with God.",
      audioUrl: "#",
      videoUrl: "#",
      notesUrl: "#",
      duration: "38:15",
      thumbnail: "/api/placeholder/400/225"
    },
    {
      id: "3",
      title: "Understanding God's Love",
      speaker: "Pastor John Doe",
      date: "2024-01-14",
      category: "Sunday Service",
      description: "A deep dive into the unconditional love of God and how it transforms our understanding of grace.",
      audioUrl: "#",
      videoUrl: "#",
      notesUrl: "#",
      duration: "42:20",
      thumbnail: "/api/placeholder/400/225"
    },
    {
      id: "4",
      title: "Building Strong Relationships",
      speaker: "Deacon James Wilson",
      date: "2024-01-12",
      category: "Bible Study",
      description: "Biblical principles for building and maintaining healthy relationships in our families and communities.",
      audioUrl: "#",
      videoUrl: "#",
      notesUrl: "#",
      duration: "35:45",
      thumbnail: "/api/placeholder/400/225"
    },
    {
      id: "5",
      title: "Hope in Difficult Times",
      speaker: "Pastor John Doe",
      date: "2024-01-07",
      category: "Sunday Service",
      description: "Finding hope and strength in God's promises during life's most challenging moments.",
      audioUrl: "#",
      videoUrl: "#",
      notesUrl: "#",
      duration: "48:10",
      thumbnail: "/api/placeholder/400/225"
    },
    {
      id: "6",
      title: "The Fruit of the Spirit",
      speaker: "Elder Mary Johnson",
      date: "2024-01-03",
      category: "Mid-week",
      description: "Exploring the nine fruits of the Spirit and how they manifest in our daily Christian walk.",
      audioUrl: "#",
      videoUrl: "#",
      notesUrl: "#",
      duration: "40:25",
      thumbnail: "/api/placeholder/400/225"
    }
  ]

  const categories = ["All", "Sunday Service", "Mid-week", "Bible Study"]

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Church Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative bg-primary/10 rounded-full p-6 border-4 border-primary/20 shadow-lg">
                <ChurchLogo size="lg" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-primary">
              Sermons & Messages
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Watch, listen, and download our weekly sermons and Bible study messages
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
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
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-2"
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
                      <User className="h-4 w-4" />
                      {sermon.speaker}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {sermon.description}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 hover:scale-105 transition-transform"
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
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive notifications about new sermons and church updates.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6 hover:scale-105 transition-transform"
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
