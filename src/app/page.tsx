"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Calendar, Users, MapPin, Download, Clock, Mail } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { ChurchLogo } from "@/components/church-logo"

export default function Home() {
  const { toast } = useToast()
  const [isSubscribing, setIsSubscribing] = useState(false)

  // Sample data - in a real app, this would come from your backend/database
  const latestSermon = {
    title: "Walking in Faith and Grace",
    speaker: "Pastor John Doe",
    date: "2024-01-21",
    category: "Sunday Service",
    description: "Join us as we explore the journey of faith and the amazing grace that sustains us through life's challenges.",
    audioUrl: "#",
    videoUrl: "#",
    notesUrl: "#"
  }

  const upcomingEvents = [
    {
      title: "Youth Conference 2024",
      date: "2024-02-15",
      time: "9:00 AM",
      venue: "Church Auditorium",
      description: "Annual youth conference focusing on spiritual growth and community building."
    },
    {
      title: "Community Outreach",
      date: "2024-02-20",
      time: "2:00 PM",
      venue: "Local Community Center",
      description: "Join us as we serve our community and share the love of Christ."
    },
    {
      title: "Prayer Meeting",
      date: "2024-02-25",
      time: "6:00 PM",
      venue: "Church Prayer Room",
      description: "Weekly prayer meeting for church members and visitors."
    }
  ]

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

  const handleWatchSermon = () => {
    toast({
      title: "Opening Sermon",
      description: "Redirecting to the latest sermon video...",
    })
  }

  const handleDownloadSermon = () => {
    toast({
      title: "Download Started",
      description: "Your sermon download has begun.",
      variant: "success"
    })
  }

  const galleryImages = [
    { src: "/api/placeholder/300/200", alt: "Sunday Service", title: "Sunday Worship" },
    { src: "/api/placeholder/300/200", alt: "Youth Program", title: "Youth Activities" },
    { src: "/api/placeholder/300/200", alt: "Community Outreach", title: "Community Service" },
    { src: "/api/placeholder/300/200", alt: "Bible Study", title: "Bible Study Session" }
  ]

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
                <p className="text-lg font-semibold text-primary">8:00 AM & 10:00 AM</p>
                <p className="text-muted-foreground">Main Sanctuary</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle>Mid-week Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">Wednesday 6:00 PM</p>
                <p className="text-muted-foreground">Main Sanctuary</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle>Bible Study</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">Friday 6:00 PM</p>
                <p className="text-muted-foreground">Fellowship Hall</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Sermon */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Latest Sermon</h2>
            <p className="text-lg text-muted-foreground">Watch, listen, or download our latest message</p>
          </div>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{latestSermon.title}</CardTitle>
                  <CardDescription className="text-lg">
                    by {latestSermon.speaker} • {latestSermon.date} • {latestSermon.category}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleWatchSermon}>
                    <Play className="h-4 w-4 mr-2" />
                    Watch
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadSermon}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{latestSermon.description}</p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/sermons">View All Sermons</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/sermons">Sermon Notes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Upcoming Events</h2>
            <p className="text-lg text-muted-foreground">Join us for these special occasions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {event.date} at {event.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venue}</span>
                    </div>
                    <p className="text-sm">{event.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Church Life</h2>
            <p className="text-lg text-muted-foreground">See what's happening in our community</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-muted-foreground">{image.title}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{image.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
