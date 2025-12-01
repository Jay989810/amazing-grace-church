'use client';

import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail, Phone, Clock } from "lucide-react"
import { ChurchLogo } from "@/components/church-logo"
import { useEffect, useState } from "react"
import { useTheme } from 'next-themes';

/**
 * Footer Component
 * 
 * Complete footer with church information, links, and developer credit.
 * Supports dark mode via the `darkMode` prop or automatically detects theme.
 * 
 * @param darkMode - Optional boolean prop to enable dark mode styling (overrides auto-detection)
 */
export default function Footer({ darkMode }: { darkMode?: boolean }) {
  const [currentYear, setCurrentYear] = useState(2024)
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
    setMounted(true);
  }, [])

  // Determine if dark mode should be active
  // Use prop if provided, otherwise detect from theme
  const isDarkMode = darkMode !== undefined 
    ? darkMode 
    : mounted && theme === 'dark';

  // WhatsApp API link with custom pre-filled message for developer credit
  const whatsappMessage = encodeURIComponent(
    "hello jayonchain i'm from the amazing grace baptist church website"
  );
  const whatsappLink = `https://api.whatsapp.com/send/?phone=2347089799407&text=${whatsappMessage}&type=phone_number&app_absent=0`;

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

        {/* Developer Credit Section */}
        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-primary-foreground/20'} mt-6 pt-6`}>
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-primary-foreground/80'}`}>
            <span>Developed by</span>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold ${isDarkMode ? 'text-gold hover:text-white' : 'text-gold hover:text-primary-foreground'} transition-colors underline flex items-center gap-1`}
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              JayOnChain
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
