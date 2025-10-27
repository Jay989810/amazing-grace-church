"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, BookOpen, Globe, Award, User } from "lucide-react"
import Link from "next/link"
import { ChurchLogo } from "@/components/church-logo"
import Image from "next/image"

export default function AboutPage() {
  const leadership = [
    {
      name: "Pastor John Doe",
      role: "Senior Pastor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Pastor John has been serving Amazing Grace Baptist Church for over 15 years. He holds a Master of Divinity degree and is passionate about community outreach and spiritual growth.",
      email: "pastor@amazinggracechurch.org"
    },
    {
      name: "Elder Mary Johnson",
      role: "Associate Pastor",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      bio: "Elder Mary leads our youth ministry and community programs. She brings over 10 years of experience in pastoral care and discipleship.",
      email: "mary@amazinggracechurch.org"
    },
    {
      name: "Deacon James Wilson",
      role: "Church Administrator",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Deacon James oversees the administrative aspects of our church operations and coordinates our outreach programs.",
      email: "james@amazinggracechurch.org"
    }
  ]

  const coreBeliefs = [
    {
      title: "Salvation by Grace",
      description: "We believe that salvation is a gift from God, received through faith in Jesus Christ alone, not by works or human effort.",
      icon: Heart
    },
    {
      title: "Authority of Scripture",
      description: "The Bible is the inspired, infallible Word of God and our ultimate authority for faith and practice.",
      icon: BookOpen
    },
    {
      title: "Priesthood of Believers",
      description: "Every believer has direct access to God through Jesus Christ and is called to serve in ministry.",
      icon: Users
    },
    {
      title: "Great Commission",
      description: "We are called to make disciples of all nations, sharing the Gospel both locally and globally.",
      icon: Globe
    }
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
              <p className="text-lg text-muted-foreground mb-6">
                Amazing Grace Baptist Church was established in 1985 in U/Zawu, Gonin Gora, Kaduna State, Nigeria. 
                What began as a small gathering of believers has grown into a vibrant community of faith serving 
                hundreds of families in our local area.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our church was founded on the principles of grace, love, and community service. Over the years, 
                we have remained committed to spreading the Gospel of Jesus Christ while addressing the spiritual 
                and physical needs of our community.
              </p>
              <p className="text-lg text-muted-foreground">
                Today, we continue to grow and adapt to serve our community better, offering various ministries 
                including youth programs, community outreach, Bible studies, and worship services that welcome 
                people from all walks of life.
              </p>
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
                <p className="text-muted-foreground">
                  To glorify God by making disciples of Jesus Christ through worship, fellowship, 
                  discipleship, ministry, and evangelism, while serving our community with love and compassion.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-4" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To be a thriving, Christ-centered community that transforms lives through the power 
                  of God's grace, building bridges of hope and healing in our neighborhood and beyond.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-primary mb-4" />
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Grace-centered living</li>
                  <li>• Authentic community</li>
                  <li>• Servant leadership</li>
                  <li>• Biblical truth</li>
                  <li>• Compassionate outreach</li>
                </ul>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreBeliefs.map((belief, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <belief.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">{belief.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{belief.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Leadership Team</h2>
            <p className="text-lg text-muted-foreground">Meet the dedicated leaders who guide our church community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <Card key={index} className="text-center overflow-hidden">
                <CardHeader>
                  <div className="mx-auto w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-primary/20 shadow-lg">
                    <Image 
                      src={leader.image} 
                      alt={leader.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl">{leader.name}</CardTitle>
                  <CardDescription className="text-lg font-medium text-primary">{leader.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{leader.bio}</p>
                  <Button variant="outline" size="sm" asChild className="hover:scale-105 transition-transform">
                    <a href={`mailto:${leader.email}`}>Contact</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <p className="text-lg text-muted-foreground mb-6">
                Welcome to Amazing Grace Baptist Church! It is my joy and privilege to serve as your pastor 
                and to welcome you into our church family.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our church is built on the foundation of God's amazing grace - the unmerited favor that 
                saves us, sustains us, and empowers us to live for His glory. We believe that every person 
                is valuable in God's eyes and has a unique purpose in His kingdom.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Whether you are new to faith, returning to church, or looking for a new church home, 
                we invite you to join us on this journey of discovering God's grace together. 
                You will find a warm, welcoming community where you can grow in your relationship 
                with Christ and serve alongside fellow believers.
              </p>
              <p className="text-lg text-muted-foreground">
                I look forward to meeting you and sharing in the joy of God's amazing grace!
              </p>
              <div className="mt-8 text-right">
                <p className="font-semibold text-primary">Pastor John Doe</p>
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
