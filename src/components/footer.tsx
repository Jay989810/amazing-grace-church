"use client"

import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react"
import { ChurchLogo } from "@/components/church-logo"
import { useEffect, useState } from "react"

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2024)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Church Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <ChurchLogo size="sm" />
              <div>
                <h3 className="text-lg font-semibold">Amazing Grace Baptist Church</h3>
                <p className="text-sm text-primary-foreground/80">Saved by Grace, Walking in Light</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80">
              U/Zawu, Gonin Gora<br />
              Kaduna State, Nigeria
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>+234 XXX XXX XXXX</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>info@amazinggracechurch.org</span>
              </div>
            </div>
          </div>

          {/* Service Times */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Schedule</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Sunday Service: 8AM – 10AM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Monday Bible Study: 5PM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Wednesday Mid-Week Service: 5PM – 6PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/about" className="block text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                About Us
              </Link>
              <Link href="/sermons" className="block text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Sermons
              </Link>
              <Link href="/events" className="block text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Events
              </Link>
              <Link href="/gallery" className="block text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Gallery
              </Link>
              <Link href="/contact" className="block text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="text-sm text-primary-foreground/80">
              <p>Stay connected with us on social media for updates, sermons, and community events.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-primary-foreground/80">
              © {currentYear} Amazing Grace Baptist Church. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
