"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, BookOpen, Globe, Award, User, Clock, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { ChurchLogo } from "@/components/church-logo"
import { OptimizedImage } from "@/components/optimized-image"
import { useSettings } from "@/components/settings-provider"

// Icon mapping
const iconMap: Record<string, any> = {
  Heart,
  Users,
  BookOpen,
  Globe,
  Award,
  User
}

export default function AboutPage() {
  const { settings } = useSettings()
  const [history, setHistory] = useState<string>('')
  const [mission, setMission] = useState<string>('')
  const [vision, setVision] = useState<string>('')
  const [values, setValues] = useState<string>('')
  const [pastorsMessage, setPastorsMessage] = useState<string>('')
  const [coreBeliefs, setCoreBeliefs] = useState<any[]>([])
  const [leadership, setLeadership] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch('/api/about')
        if (response.ok) {
          const data = await response.json()
          
          // Map sections
          const sectionsMap: Record<string, string> = {}
          data.sections.forEach((section: any) => {
            sectionsMap[section.type] = section.content
          })
          
          setHistory(sectionsMap.history || '')
          setMission(sectionsMap.mission || '')
          setVision(sectionsMap.vision || '')
          setValues(sectionsMap.values || '')
          setPastorsMessage(sectionsMap.pastors_message || '')
          setCoreBeliefs(data.coreBeliefs || [])
          setLeadership(data.leadership || [])
        }
      } catch (error) {
        console.error('Error fetching about content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutContent()

    // Listen for updates
    const handleAboutUpdate = () => {
      fetchAboutContent()
    }

    window.addEventListener('aboutUpdated', handleAboutUpdate)
    return () => window.removeEventListener('aboutUpdated', handleAboutUpdate)
  }, [])

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
              About Amazing Grace Baptist Church
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              A community of faith, hope, and love serving God and our neighbors in Kaduna State, Nigeria
            </p>
          </div>
        </div>
      </section>

      {/* Church History */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">Our History</h2>
            <div className="prose prose-lg max-w-none">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : history ? (
                <div className="text-lg text-muted-foreground whitespace-pre-line">
                  {history}
                </div>
              ) : (
                <p className="text-lg text-muted-foreground mb-6">
                  Amazing Grace Baptist Church was established in 2015 in U/Zawu, Gonin Gora, Kaduna State, Nigeria. 
                  What began as a small gathering of believers has grown into a vibrant community of faith serving 
                  hundreds of families in our local area.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-primary mb-4" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse h-20 bg-muted rounded"></div>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-line">
                    {mission || 'To glorify God by making disciples of Jesus Christ through worship, fellowship, discipleship, ministry, and evangelism, while serving our community with love and compassion.'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-4" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse h-20 bg-muted rounded"></div>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-line">
                    {vision || 'To be a thriving, Christ-centered community that transforms lives through the power of God\'s grace, building bridges of hope and healing in our neighborhood and beyond.'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-primary mb-4" />
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse h-20 bg-muted rounded"></div>
                ) : (
                  <div className="text-muted-foreground whitespace-pre-line">
                    {values ? (
                      values.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))
                    ) : (
                      <ul className="space-y-2">
                        <li>• Grace-centered living</li>
                        <li>• Authentic community</li>
                        <li>• Servant leadership</li>
                        <li>• Biblical truth</li>
                        <li>• Compassionate outreach</li>
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Beliefs */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Core Beliefs</h2>
            <p className="text-lg text-muted-foreground">The foundational truths that guide our faith and practice</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <div className="animate-pulse h-6 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse h-4 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : coreBeliefs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreBeliefs.map((belief, index) => {
                const IconComponent = iconMap[belief.icon] || Heart
                return (
                  <Card key={belief.id || index}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <CardTitle className="text-xl">{belief.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{belief.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Heart className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Salvation by Grace</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">We believe that salvation is a gift from God, received through faith in Jesus Christ alone, not by works or human effort.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Authority of Scripture</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">The Bible is the inspired, infallible Word of God and our ultimate authority for faith and practice.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Leadership Team</h2>
            <p className="text-lg text-muted-foreground">Meet the dedicated leaders who guide our church community</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <div className="animate-pulse h-32 w-32 bg-muted rounded-full mx-auto"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : leadership.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {leadership.map((leader, index) => (
                <Card key={leader.id || index} className="text-center overflow-hidden">
                  <CardHeader>
                    <div className="mx-auto w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-primary/20 shadow-lg">
                      <OptimizedImage
                        src={leader.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"}
                        alt={leader.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        priority={index < 3}
                      />
                    </div>
                    <CardTitle className="text-xl">{leader.name}</CardTitle>
                    <CardDescription className="text-lg font-medium text-primary">{leader.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{leader.bio}</p>
                    {leader.email && (
                      <Button variant="outline" size="sm" asChild className="hover:scale-105 transition-transform">
                        <a href={`mailto:${leader.email}`}>Contact</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center overflow-hidden">
                <CardHeader>
                  <div className="mx-auto w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-primary/20 shadow-lg relative">
                    <OptimizedImage 
                      src={settings?.aboutImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"} 
                      alt={settings?.pastorName || "Pastor"}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      priority={true}
                    />
                  </div>
                  <CardTitle className="text-xl">{settings?.pastorName || "Rev. John Joseph Hayab"}</CardTitle>
                  <CardDescription className="text-lg font-medium text-primary">Senior Pastor</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {settings?.pastorName || "Rev. John Joseph Hayab"} has been serving {settings?.churchName || "Amazing Grace Baptist Church"} for many years.
                  </p>
                  <Button variant="outline" size="sm" asChild className="hover:scale-105 transition-transform">
                    <a href={`mailto:${settings?.churchEmail || "pastor@amazinggracechurch.org"}`}>Contact</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Pastor's Message */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-primary">A Message from Our Pastor</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse h-4 bg-muted rounded w-full"></div>
                  <div className="animate-pulse h-4 bg-muted rounded w-5/6"></div>
                  <div className="animate-pulse h-4 bg-muted rounded w-4/6"></div>
                </div>
              ) : pastorsMessage ? (
                <div className="text-lg text-muted-foreground whitespace-pre-line">
                  {pastorsMessage}
                </div>
              ) : (
                <>
                  <p className="text-lg text-muted-foreground mb-6">
                    Welcome to Amazing Grace Baptist Church! It is my joy and privilege to serve as your pastor 
                    and to welcome you into our church family.
                  </p>
                  <p className="text-lg text-muted-foreground mb-6">
                    Our church is built on the foundation of God's amazing grace - the unmerited favor that 
                    saves us, sustains us, and empowers us to live for His glory.
                  </p>
                </>
              )}
              <div className="mt-8 text-right">
                <p className="font-semibold text-primary">{settings?.pastorName || "Rev. John Joseph Hayab"}</p>
                <p className="text-muted-foreground">Senior Pastor</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We would love to welcome you into our church family. Come and experience the love, 
            fellowship, and spiritual growth that awaits you at Amazing Grace Baptist Church.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/contact">Visit Us</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="/sermons">Listen to Sermons</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
