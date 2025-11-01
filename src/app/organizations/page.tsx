"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Mail, User, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Organization {
  id: string
  name: string
  description: string
  leaderName: string
  leaderRole: string
  contactEmail?: string
  imageUrl?: string
  dateCreated: string
  createdAt: string
  updatedAt: string
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations')
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data)
        } else {
          console.error('Failed to fetch organizations')
        }
      } catch (error) {
        console.error('Error fetching organizations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Church Organizations & Sub-bodies
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join one of our ministries and use your gifts to serve God and build community. 
            There's a place for everyone to get involved!
          </p>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading organizations...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No organizations available at this time.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon or contact the church office for more information.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {org.imageUrl ? (
                  <div className="relative w-full h-48 bg-muted">
                    <Image
                      src={org.imageUrl}
                      alt={org.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl">{org.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {org.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        <strong>Leader:</strong> {org.leaderName}
                      </span>
                    </div>
                    {org.leaderRole && (
                      <p className="text-sm text-muted-foreground ml-6">
                        {org.leaderRole}
                      </p>
                    )}
                  </div>

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
            ))}
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
