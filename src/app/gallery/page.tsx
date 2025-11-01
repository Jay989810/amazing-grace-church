"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Calendar, User, Filter, Search, Eye, Upload } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ChurchLogo } from "@/components/church-logo"
import { useSettings } from "@/components/settings-provider"
import { useRealtimeData } from "@/hooks/use-realtime-data"

interface GalleryImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  album?: string
  photographer?: string
  date?: string
  // Support upload API format too
  originalName?: string
  url?: string
  uploadedAt?: string
}

export default function GalleryPage() {
  const { toast } = useToast()
  const { settings } = useSettings()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  // Real-time data fetching with automatic refresh
  const { data: galleryImagesData, loading } = useRealtimeData<GalleryImage[]>({
    fetchFn: async () => {
      const response = await fetch('/api/gallery')
      if (!response.ok) throw new Error('Failed to fetch gallery images')
      return await response.json()
    },
    interval: 30000, // Refresh every 30 seconds
    enabled: true
  })

  const galleryImages = galleryImagesData || []

  const handleSubmitPhotos = () => {
    toast({
      title: "Photo Submission",
      description: `Thank you for wanting to share photos! Please email them to ${settings?.churchEmail || 'media@amazinggracechurch.org'} or contact us directly.`,
      variant: "success"
    })
  }

  // Get unique categories from gallery images
  const categories = ["All", "Bible Study", "Church Event", "Sunday Service", "Youth Program", "Community Outreach", "Prayer Meeting", "Other"]
  
  // Extract unique albums from images
  const uniqueAlbums = Array.from(new Set(
    galleryImages
      .map(img => img.album)
      .filter(Boolean)
      .map(album => album as string)
  ))

  // Combine predefined categories with unique albums from database
  const allCategories = [...categories, ...uniqueAlbums.filter(album => !categories.includes(album))]

  const filteredImages = galleryImages.filter(image => {
    const imageTitle = image.title || image.originalName || ''
    const imageAlbum = image.album || ''
    const imageDescription = image.description || ''
    
    const matchesCategory = selectedCategory === "All" || 
      imageAlbum.toLowerCase() === selectedCategory.toLowerCase() ||
      imageTitle.toLowerCase().includes(selectedCategory.toLowerCase())
    
    const matchesSearch = imageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imageDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imageAlbum.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const getImageUrl = (image: GalleryImage) => image.imageUrl || image.url || ''
  const getImageTitle = (image: GalleryImage) => {
    // Use title if available, otherwise clean up the original name
    if (image.title && image.title !== 'Untitled') {
      return image.title
    }
    if (image.originalName) {
      // Remove file extension and clean up the name
      return image.originalName
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .replace(/[_-]/g, ' ') // Replace underscores and dashes with spaces
        .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    }
    return 'Untitled'
  }
  const getImageDate = (image: GalleryImage) => image.date || image.uploadedAt || ''


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

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              {allCategories.slice(0, 8).map((category) => (
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
              {allCategories.length > 8 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  +{allCategories.length - 8} more
                </Button>
              )}
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
              {filteredImages.map((image) => {
                const imageUrl = getImageUrl(image)
                const imageTitle = getImageTitle(image)
                const imageDate = getImageDate(image)
                
                return (
                  <Card key={image.id} className="overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(image)}>
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <OptimizedImage
                        src={imageUrl}
                        alt={imageTitle}
                        fill
                        objectFit="cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {image.album && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                          {image.album}
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{imageTitle}</CardTitle>
                      {image.description && (
                        <CardDescription className="line-clamp-2">
                          {image.description}
                        </CardDescription>
                      )}
                      {image.photographer && (
                        <CardDescription className="line-clamp-1 mt-1">
                          Photo by {image.photographer}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {imageDate && (
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(imageDate)}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
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
                src={getImageUrl(selectedImage)}
                alt={getImageTitle(selectedImage)}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{getImageTitle(selectedImage)}</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedImage(null)}>
                  Close
                </Button>
              </div>
              {selectedImage.description && (
                <p className="text-muted-foreground mb-4">{selectedImage.description}</p>
              )}
              <div className="space-y-2 text-sm text-muted-foreground">
                {selectedImage.album && <p>Category: <span className="font-medium">{selectedImage.album}</span></p>}
                {selectedImage.photographer && <p>Photographer: <span className="font-medium">{selectedImage.photographer}</span></p>}
                {getImageDate(selectedImage) && <p>Date: {formatDate(getImageDate(selectedImage))}</p>}
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