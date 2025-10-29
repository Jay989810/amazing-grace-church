"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Youtube, Twitter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ChurchLogo } from "@/components/church-logo"
import { useSettings } from "@/components/settings-provider"

export default function ContactPage() {
  const { toast } = useToast()
  const { settings } = useSettings()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: "Message Sent Successfully!",
          description: "Thank you for reaching out. We'll get back to you as soon as possible.",
          variant: "success"
        })
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false)
          setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
        }, 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetDirections = () => {
    toast({
      title: "Opening Google Maps",
      description: "Redirecting to Google Maps with our church location...",
    })
    // In a real app, this would open Google Maps with the church coordinates
    window.open("https://maps.google.com/?q=U/Zawu, Gonin Gora, Kaduna State, Nigeria", "_blank")
  }

  const handleCallNow = () => {
    toast({
      title: "Calling Church",
      description: "Opening your phone dialer...",
    })
    // In a real app, this would initiate a phone call
    window.open("tel:+234XXXXXXXXX", "_self")
  }

  const handleSendEmail = () => {
    toast({
      title: "Opening Email",
      description: "Opening your email client...",
    })
    // In a real app, this would open the default email client
    window.open("mailto:info@amazinggracechurch.org", "_self")
  }

  const handleVisitUs = () => {
    toast({
      title: "Service Times",
      description: "Sunday Service: 8AM – 10AM, Monday Bible Study: 5PM, Wednesday Mid-Week Service: 5PM – 6PM",
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      details: "U/Zawu, Gonin Gora\nKaduna State, Nigeria",
      action: "Get Directions"
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+234 XXX XXX XXXX\n+234 XXX XXX XXXX",
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email",
      details: "info@amazinggracechurch.org\npastor@amazinggracechurch.org",
      action: "Send Email"
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM",
      action: "Visit Us"
    }
  ]

  const socialMedia = [
    { name: "Facebook", icon: Facebook, url: "#", color: "hover:text-blue-600" },
    { name: "Instagram", icon: Instagram, url: "#", color: "hover:text-pink-600" },
    { name: "YouTube", icon: Youtube, url: "#", color: "hover:text-red-600" },
    { name: "Twitter", icon: Twitter, url: "#", color: "hover:text-blue-400" }
  ]

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
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              We'd love to hear from you. Get in touch with us for any questions, prayer requests, or to learn more about our church.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <info.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line mb-4">{info.details}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={
                      info.title === "Address" ? handleGetDirections :
                      info.title === "Phone" ? handleCallNow :
                      info.title === "Email" ? handleSendEmail :
                      info.title === "Office Hours" ? handleVisitUs :
                      undefined
                    }
                    className="hover:scale-105 transition-transform"
                  >
                    {info.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-8">Send us a Message</h2>
              {isSubmitted ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <div className="text-green-600 mb-4">
                      <Send className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We'll get back to you as soon as possible.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="What is this about?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Map */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-8">Find Us</h2>
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                      <p className="text-lg font-semibold">Amazing Grace Baptist Church</p>
                      <p className="text-muted-foreground">U/Zawu, Gonin Gora</p>
                      <p className="text-muted-foreground">Kaduna State, Nigeria</p>
                      <Button 
                        className="mt-4 hover:scale-105 transition-transform" 
                        variant="outline"
                        onClick={handleGetDirections}
                      >
                        Open in Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Follow Us</h2>
            <p className="text-lg text-muted-foreground">Stay connected with us on social media</p>
          </div>
          <div className="flex justify-center space-x-6">
            {socialMedia.map((social, index) => (
              <a
                key={index}
                href={social.url}
                className={`p-4 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors ${social.color}`}
                aria-label={social.name}
              >
                <social.icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Visit Us This Sunday</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We welcome you to join us for worship, fellowship, and spiritual growth. 
            Come as you are and experience the love of our church family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6 hover:scale-105 transition-transform"
              onClick={handleVisitUs}
            >
              Service Times
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:scale-105 transition-transform"
              onClick={handleGetDirections}
            >
              Get Directions
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
