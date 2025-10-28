"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Calendar, User, Filter, Search, Eye, Upload } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ChurchLogo } from "@/components/church-logo"
import { useSettings } from "@/components/settings-provider"

interface GalleryImage {
  id: string
  originalName: string
  filename: string
  type: string
  size: number
  mimeType: string
  url: string
  uploadedAt: string
}

export default function GalleryPage() {
  const { toast } = useToast()
  const { settings } = useSettings()
  const [selectedAlbum, setSelectedAlbum] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch gallery images from API
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch('/api/upload?type=gallery')
        if (response.ok) {
          const data = await response.json()
          setGalleryImages(data)
        } else {
          console.error('Failed to fetch gallery images')
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryImages()
  }, [])

  const handleSubmitPhotos = () => {
    toast({
      title: "Photo Submission",
      description: `Thank you for wanting to share photos! Please email them to ${settings?.churchEmail || 'media@amazinggracechurch.org'} or contact us directly.`,
      variant: "success"
    })
  }

  const filteredImages = galleryImages.filter(image => {
    const matchesAlbum = selectedAlbum === "All" || image.originalName.toLowerCase().includes(selectedAlbum.toLowerCase())
    const matchesSearch = image.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAlbum && matchesSearch
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading gallery...</p>
        </div>
      </div>
    )
  }

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
              Capturing moments of worship, fellowship, and community life at {settings?.churchName || "Amazing Grace Baptist Church"}
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
              <Button
                variant={selectedAlbum === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAlbum("All")}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                All Photos
              </Button>
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
              <p className="text-lg text-muted-foreground">
                {galleryImages.length === 0 
                  ? "No photos uploaded yet. Check back soon for gallery updates!" 
                  : "No photos found matching your criteria."
                }
              </p>
              {galleryImages.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Photos will appear here once uploaded by the admin.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(image)}>
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      Gallery
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{image.originalName}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      Uploaded by admin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(image.uploadedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {formatFileSize(image.size)}
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
            <div className="aspect-video bg-muted relative">
              <img
                src={selectedImage.url}
                alt={selectedImage.originalName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{selectedImage.originalName}</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedImage(null)}>
                  Close
                </Button>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Size: {formatFileSize(selectedImage.size)}</p>
                <p>Uploaded: {formatDate(selectedImage.uploadedAt)}</p>
                <p>Type: {selectedImage.mimeType}</p>
              </div>
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