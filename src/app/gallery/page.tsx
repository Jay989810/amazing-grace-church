"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Calendar, User, Filter, Search, Eye, Upload } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ChurchLogo } from "@/components/church-logo"

export default function GalleryPage() {
  const { toast } = useToast()
  const [selectedAlbum, setSelectedAlbum] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Sample gallery data - in a real app, this would come from your backend/database
  const galleryImages = [
    {
      id: "1",
      title: "Sunday Worship Service",
      description: "Our congregation gathered for Sunday morning worship",
      imageUrl: "/api/placeholder/400/300",
      album: "Worship Services",
      date: "2024-01-21",
      photographer: "Church Media Team"
    },
    {
      id: "2",
      title: "Youth Conference 2024",
      description: "Young people from across the region gathered for our annual youth conference",
      imageUrl: "/api/placeholder/400/300",
      album: "Youth Programs",
      date: "2024-01-15",
      photographer: "John Smith"
    },
    {
      id: "3",
      title: "Community Outreach",
      description: "Serving our local community with love and compassion",
      imageUrl: "/api/placeholder/400/300",
      album: "Community Service",
      date: "2024-01-10",
      photographer: "Mary Johnson"
    },
    {
      id: "4",
      title: "Bible Study Session",
      description: "Deepening our understanding of God's Word together",
      imageUrl: "/api/placeholder/400/300",
      album: "Bible Studies",
      date: "2024-01-08",
      photographer: "Church Media Team"
    },
    {
      id: "5",
      title: "Children's Ministry",
      description: "Our youngest members learning about Jesus through fun activities",
      imageUrl: "/api/placeholder/400/300",
      album: "Children's Ministry",
      date: "2024-01-05",
      photographer: "Sarah Wilson"
    },
    {
      id: "6",
      title: "Prayer Meeting",
      description: "Coming together in prayer and fellowship",
      imageUrl: "/api/placeholder/400/300",
      album: "Prayer Meetings",
      date: "2024-01-03",
      photographer: "Church Media Team"
    },
    {
      id: "7",
      title: "Christmas Celebration",
      description: "Celebrating the birth of our Savior with joy and thanksgiving",
      imageUrl: "/api/placeholder/400/300",
      album: "Special Events",
      date: "2023-12-25",
      photographer: "Church Media Team"
    },
    {
      id: "8",
      title: "Church Building",
      description: "Our beautiful church building and grounds",
      imageUrl: "/api/placeholder/400/300",
      album: "Church Facilities",
      date: "2024-01-01",
      photographer: "Church Media Team"
    },
    {
      id: "9",
      title: "Fellowship Dinner",
      description: "Sharing meals and building relationships",
      imageUrl: "/api/placeholder/400/300",
      album: "Fellowship",
      date: "2023-12-20",
      photographer: "Church Media Team"
    }
  ]

  const albums = ["All", "Worship Services", "Youth Programs", "Community Service", "Bible Studies", "Children's Ministry", "Prayer Meetings", "Special Events", "Church Facilities", "Fellowship"]

  const handleSubmitPhotos = () => {
    toast({
      title: "Photo Submission",
      description: "Thank you for wanting to share photos! Please email them to media@amazinggracechurch.org or contact us directly.",
      variant: "success"
    })
  }

  const filteredImages = galleryImages.filter(image => {
    const matchesAlbum = selectedAlbum === "All" || image.album === selectedAlbum
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.album.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAlbum && matchesSearch
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
              Media Gallery
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Capturing moments of worship, fellowship, and community life at Amazing Grace Baptist Church
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
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            {/* Album Filter */}
            <div className="flex gap-2 flex-wrap">
              {albums.map((album) => (
                <Button
                  key={album}
                  variant={selectedAlbum === album ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAlbum(album)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {album}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No photos found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(image.imageUrl)}>
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      {image.album}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{image.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{image.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(image.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {image.photographer}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-full bg-background rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-muted flex items-center justify-center">
              <ImageIcon className="h-24 w-24 text-muted-foreground" />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Image Title</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedImage(null)}>
                  Close
                </Button>
              </div>
              <p className="text-muted-foreground">Image description and details would go here.</p>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Share Your Photos</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have photos from church events? We'd love to include them in our gallery. 
            Contact us to share your memories with the church family.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6 hover:scale-105 transition-transform"
            onClick={handleSubmitPhotos}
          >
            <Upload className="h-4 w-4 mr-2" />
            Submit Photos
          </Button>
        </div>
      </section>
    </div>
  )
}
