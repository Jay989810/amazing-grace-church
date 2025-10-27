"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Filter, Search, Mail } from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ChurchLogo } from "@/components/church-logo"

export default function EventsPage() {
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  // Sample events data - in a real app, this would come from your backend/database
  const events = [
    {
      id: "1",
      title: "Youth Conference 2024",
      description: "Annual youth conference focusing on spiritual growth and community building. Join us for worship, workshops, and fellowship.",
      date: "2024-02-15",
      time: "09:00",
      venue: "Church Auditorium",
      type: "Conference",
      image: "/api/placeholder/400/225",
      registrationRequired: true,
      registrationUrl: "#",
      maxAttendees: 200,
      currentAttendees: 150
    },
    {
      id: "2",
      title: "Community Outreach",
      description: "Join us as we serve our community and share the love of Christ through various outreach activities.",
      date: "2024-02-20",
      time: "14:00",
      venue: "Local Community Center",
      type: "Community Service",
      image: "/api/placeholder/400/225",
      registrationRequired: false,
      maxAttendees: 100,
      currentAttendees: 75
    },
    {
      id: "3",
      title: "Prayer Meeting",
      description: "Weekly prayer meeting for church members and visitors. Come and join us in prayer and fellowship.",
      date: "2024-02-25",
      time: "18:00",
      venue: "Church Prayer Room",
      type: "Service",
      image: "/api/placeholder/400/225",
      registrationRequired: false,
      maxAttendees: 50,
      currentAttendees: 30
    },
    {
      id: "4",
      title: "Marriage Enrichment Workshop",
      description: "A special workshop for married couples to strengthen their relationship and grow together in faith.",
      date: "2024-03-02",
      time: "10:00",
      venue: "Fellowship Hall",
      type: "Workshop",
      image: "/api/placeholder/400/225",
      registrationRequired: true,
      registrationUrl: "#",
      maxAttendees: 30,
      currentAttendees: 25
    },
    {
      id: "5",
      title: "Children's Bible Camp",
      description: "A fun-filled day of Bible stories, games, and activities for children ages 5-12.",
      date: "2024-03-10",
      time: "09:00",
      venue: "Church Grounds",
      type: "Youth Program",
      image: "/api/placeholder/400/225",
      registrationRequired: true,
      registrationUrl: "#",
      maxAttendees: 60,
      currentAttendees: 45
    },
    {
      id: "6",
      title: "Easter Celebration",
      description: "Join us for our special Easter service celebrating the resurrection of our Lord and Savior Jesus Christ.",
      date: "2024-03-31",
      time: "08:00",
      venue: "Main Sanctuary",
      type: "Service",
      image: "/api/placeholder/400/225",
      registrationRequired: false,
      maxAttendees: 500,
      currentAttendees: 300
    }
  ]

  const eventTypes = ["All", "Service", "Conference", "Workshop", "Community Service", "Youth Program"]

  const filteredEvents = events.filter(event => {
    const matchesType = selectedType === "All" || event.type === selectedType
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // Separate upcoming and past events
  const today = new Date().toISOString().split('T')[0]
  const upcomingEvents = filteredEvents.filter(event => event.date >= today)
  const pastEvents = filteredEvents.filter(event => event.date < today)

  const handleSubscribeToEvents = () => {
    toast({
      title: "Successfully Subscribed!",
      description: "You'll receive notifications about upcoming events and church activities.",
      variant: "success"
    })
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
              Church Events
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Join us for worship, fellowship, and community events throughout the year
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
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              {eventTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-8">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No upcoming events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      {event.type}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(event.time)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.currentAttendees}/{event.maxAttendees} registered</span>
                      </div>
                      <div className="flex gap-2">
                        {event.registrationRequired ? (
                          <Button size="sm" className="flex-1">
                            Register Now
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="flex-1">
                            Learn More
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-primary mb-8">Past Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden opacity-75">
                  <div className="aspect-video bg-muted relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="absolute top-2 left-2 bg-muted-foreground text-background px-2 py-1 rounded text-xs font-medium">
                      Past Event
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(event.time)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.currentAttendees} attended</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive notifications about upcoming events and church activities.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6 hover:scale-105 transition-transform"
            onClick={handleSubscribeToEvents}
          >
            <Mail className="h-4 w-4 mr-2" />
            Subscribe to Events
          </Button>
        </div>
      </section>
    </div>
  )
}
