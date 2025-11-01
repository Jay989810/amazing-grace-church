"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Users, BookOpen, Heart, Shield, Award, Mail, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Organization {
  id: string
  name: string
  description: string
  category: 'Music' | 'Youth' | 'Children' | 'Women' | 'Men' | 'Evangelism' | 'Outreach' | 'Other'
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  meetingTime?: string
  meetingDay?: string
  image?: string
  requirements?: string
  howToJoin?: string
}

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  Music: Music,
  Youth: Users,
  Children: Users,
  Women: Heart,
  Men: Shield,
  Evangelism: BookOpen,
  Outreach: Heart,
  Other: Award
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockOrganizations: Organization[] = [
      {
        id: '1',
        name: 'Church Band',
        description: 'The church band leads worship during services and special events. We play contemporary and traditional Christian music to help the congregation connect with God through worship.',
        category: 'Music',
        contactPerson: 'Brother John Doe',
        contactEmail: 'band@amazinggracechurch.org',
        meetingTime: 'Fridays, 6:00 PM',
        meetingDay: 'Friday',
        requirements: 'Musical ability (instrumental or vocal), commitment to weekly rehearsals, heart for worship',
        howToJoin: 'Contact the band leader or speak with any band member after service. Auditions are held monthly.'
      },
      {
        id: '2',
        name: 'Choir',
        description: 'The choir enhances our worship services with beautiful harmonies and uplifting songs. We prepare special performances for Easter, Christmas, and other special occasions.',
        category: 'Music',
        contactPerson: 'Sister Mary Johnson',
        contactEmail: 'choir@amazinggracechurch.org',
        meetingTime: 'Thursdays, 7:00 PM',
        meetingDay: 'Thursday',
        requirements: 'Love for singing, ability to read music (helpful but not required), regular attendance',
        howToJoin: 'Join us for a practice session any Thursday evening. No audition required, just a heart to serve!'
      },
      {
        id: '3',
        name: 'Youth Ministry',
        description: 'Our youth ministry is dedicated to empowering young people ages 13-25 to grow in their faith, build strong relationships, and serve their community.',
        category: 'Youth',
        contactPerson: 'Pastor James Smith',
        contactEmail: 'youth@amazinggracechurch.org',
        meetingTime: 'Sundays, 3:00 PM',
        meetingDay: 'Sunday',
        requirements: 'Ages 13-25, desire to grow in faith and serve others',
        howToJoin: 'Come to our Sunday afternoon meetings or contact the youth pastor.'
      },
      {
        id: '4',
        name: 'Children\'s Ministry',
        description: 'We nurture and teach children ages 5-12 about God\'s love through fun activities, Bible stories, songs, and crafts. We create a safe and loving environment for kids to learn and grow.',
        category: 'Children',
        contactPerson: 'Sister Sarah Williams',
        contactEmail: 'children@amazinggracechurch.org',
        meetingTime: 'Sundays, 9:00 AM',
        meetingDay: 'Sunday',
        requirements: 'Heart for children, patience, background check required for volunteers',
        howToJoin: 'Contact the children\'s ministry coordinator or visit during Sunday service.'
      },
      {
        id: '5',
        name: 'Women\'s Fellowship',
        description: 'A supportive community where women come together for Bible study, prayer, fellowship, and encouragement. We organize retreats, outreach programs, and community service projects.',
        category: 'Women',
        contactPerson: 'Sister Grace Thompson',
        contactEmail: 'women@amazinggracechurch.org',
        meetingTime: 'First Saturday of each month, 10:00 AM',
        meetingDay: 'Saturday',
        requirements: 'Open to all women',
        howToJoin: 'Join us at our monthly meetings or contact the fellowship coordinator.'
      },
      {
        id: '6',
        name: 'Men\'s Ministry',
        description: 'We encourage men to grow in their faith, build strong relationships, and lead their families well. We meet for Bible study, accountability, and service projects.',
        category: 'Men',
        contactPerson: 'Brother David Brown',
        contactEmail: 'men@amazinggracechurch.org',
        meetingTime: 'Second Saturday of each month, 8:00 AM',
        meetingDay: 'Saturday',
        requirements: 'Open to all men',
        howToJoin: 'Join us for our monthly breakfast meetings or contact the ministry leader.'
      },
      {
        id: '7',
        name: 'Evangelism Team',
        description: 'We reach out to our community with the love of Christ through door-to-door visits, street evangelism, and community events. We share the gospel and invite people to church.',
        category: 'Evangelism',
        contactPerson: 'Pastor Peter Anderson',
        contactEmail: 'evangelism@amazinggracechurch.org',
        meetingTime: 'Last Saturday of each month, 9:00 AM',
        meetingDay: 'Saturday',
        requirements: 'Heart for evangelism, willingness to share your faith, training provided',
        howToJoin: 'Attend our monthly training sessions or speak with the evangelism coordinator.'
      },
      {
        id: '8',
        name: 'Community Outreach',
        description: 'We serve our community through food drives, clothing donations, visits to the sick and elderly, and other acts of service. We demonstrate God\'s love through practical acts of kindness.',
        category: 'Outreach',
        contactPerson: 'Sister Linda Martinez',
        contactEmail: 'outreach@amazinggracechurch.org',
        meetingTime: 'As needed for projects',
        meetingDay: 'Various',
        requirements: 'Heart to serve others, flexibility with time',
        howToJoin: 'Contact the outreach coordinator or join our next project.'
      }
    ]

    setOrganizations(mockOrganizations)
    setLoading(false)
  }, [])

  const categories = ['all', 'Music', 'Youth', 'Children', 'Women', 'Men', 'Evangelism', 'Outreach', 'Other']
  
  const filteredOrganizations = selectedCategory === 'all' 
    ? organizations 
    : organizations.filter(org => org.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Church Organizations & Ministries
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join one of our ministries and use your gifts to serve God and build community. 
            There's a place for everyone to get involved!
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading organizations...</p>
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No organizations found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => {
              const IconComponent = categoryIcons[org.category] || Award
              return (
                <Card key={org.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{org.name}</CardTitle>
                          <span className="text-xs text-muted-foreground capitalize">{org.category}</span>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {org.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {org.meetingTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          <strong>Meets:</strong> {org.meetingTime}
                        </span>
                      </div>
                    )}
                    
                    {org.requirements && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Requirements:</p>
                        <p className="text-sm text-muted-foreground">{org.requirements}</p>
                      </div>
                    )}

                    {org.howToJoin && (
                      <div>
                        <p className="text-sm font-semibold mb-1">How to Join:</p>
                        <p className="text-sm text-muted-foreground">{org.howToJoin}</p>
                      </div>
                    )}

                    {(org.contactEmail || org.contactPerson) && (
                      <div className="pt-4 border-t">
                        {org.contactPerson && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Contact:</strong> {org.contactPerson}
                          </p>
                        )}
                        {org.contactEmail && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={`mailto:${org.contactEmail}`}
                              className="text-primary hover:underline"
                            >
                              {org.contactEmail}
                            </a>
                          </div>
                        )}
                        {org.contactPhone && (
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={`tel:${org.contactPhone}`}
                              className="text-primary hover:underline"
                            >
                              {org.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      asChild
                    >
                      <Link href={`/contact?subject=Join ${org.name}`}>
                        Join {org.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Don't See What You're Looking For?
              </h2>
              <p className="text-muted-foreground mb-6">
                We're always open to starting new ministries. If you have a vision or idea, 
                we'd love to hear from you!
              </p>
              <Button asChild size="lg">
                <Link href="/contact?subject=New Ministry Idea">
                  Start a New Ministry
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

