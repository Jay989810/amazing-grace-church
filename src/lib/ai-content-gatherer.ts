// Utility to gather content from all public pages for AI knowledge base
// This allows the AI to have up-to-date information from all website pages

interface Sermon {
  id: string
  title: string
  description?: string
  speaker?: string
  date: string
  category?: string
  audioUrl?: string
  videoUrl?: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  time?: string
  venue: string
  category?: string
  registrationLink?: string
}

interface Organization {
  id: string
  name: string
  description: string
  leaderName?: string
  leaderRole?: string
  contactEmail?: string
}

interface AboutContent {
  sections: Array<{ type: string; content: string }>
  coreBeliefs: Array<{ title: string; description: string }>
  leadership: Array<{ name: string; role: string; bio?: string; email?: string }>
}

interface Settings {
  churchName?: string
  churchAddress?: string
  churchEmail?: string
  churchPhone?: string
  pastorName?: string
  churchDescription?: string
  services?: {
    sunday?: string
    monday?: string
    wednesday?: string
    friday?: string
  }
  contactInfo?: {
    address?: string
    phone?: string
    email?: string
    hours?: string
  }
}

/**
 * Fetches content from all public API endpoints
 * Returns formatted knowledge base string for AI
 */
export async function gatherWebsiteContent(): Promise<string> {
  try {
    // Determine the base URL for API calls
    // In production, use the Vercel URL or NEXT_PUBLIC_BASE_URL
    // In development, use localhost
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // If running on Vercel, use the Vercel URL
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    }
    
    // For local development, try to construct from headers if available
    if (baseUrl === 'http://localhost:3000' && typeof window === 'undefined') {
      // Server-side: use localhost
      baseUrl = 'http://localhost:3000'
    }
    
    // Fetch all content from public pages in parallel for better performance
    // Note: Only fetching from public endpoints, not admin pages
    // All these endpoints are publicly accessible GET requests
    const fetchWithTimeout = async (url: string, timeout = 5000, defaultValue: any) => {
      try {
        const response = await Promise.race([
          fetch(url),
          new Promise<Response>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ])
        
        if (response.ok) {
          return await response.json()
        }
        return defaultValue
      } catch (error) {
        console.warn(`Failed to fetch ${url}:`, error)
        return defaultValue
      }
    }
    
    const [sermons, events, organizations, about, settings] = await Promise.allSettled([
      fetchWithTimeout(`${baseUrl}/api/sermons`, 5000, []),
      fetchWithTimeout(`${baseUrl}/api/events`, 5000, []),
      fetchWithTimeout(`${baseUrl}/api/organizations`, 5000, []),
      fetchWithTimeout(`${baseUrl}/api/about`, 5000, { sections: [], coreBeliefs: [], leadership: [] }),
      fetchWithTimeout(`${baseUrl}/api/settings`, 5000, {})
    ])

    // Extract data from settled promises
    const sermonsData: Sermon[] = sermons.status === 'fulfilled' ? (sermons.value || []) : []
    const eventsData: Event[] = events.status === 'fulfilled' ? (events.value || []) : []
    const organizationsData: Organization[] = organizations.status === 'fulfilled' ? (organizations.value || []) : []
    const aboutData: AboutContent = about.status === 'fulfilled' ? (about.value || { sections: [], coreBeliefs: [], leadership: [] }) : { sections: [], coreBeliefs: [], leadership: [] }
    const settingsData: Settings = settings.status === 'fulfilled' ? (settings.value || {}) : {}

    // Build comprehensive knowledge base
    let knowledgeBase = ''

    // 1. Church Settings & Contact Information
    knowledgeBase += '# Church Information\n\n'
    if (settingsData.churchName) {
      knowledgeBase += `Church Name: ${settingsData.churchName}\n`
    }
    if (settingsData.churchAddress || settingsData.contactInfo?.address) {
      knowledgeBase += `Address: ${settingsData.churchAddress || settingsData.contactInfo?.address}\n`
    }
    if (settingsData.churchEmail || settingsData.contactInfo?.email) {
      knowledgeBase += `Email: ${settingsData.churchEmail || settingsData.contactInfo?.email}\n`
    }
    if (settingsData.churchPhone || settingsData.contactInfo?.phone) {
      knowledgeBase += `Phone: ${settingsData.churchPhone || settingsData.contactInfo?.phone}\n`
    }
    if (settingsData.pastorName) {
      knowledgeBase += `Pastor: ${settingsData.pastorName}\n`
    }
    if (settingsData.churchDescription) {
      knowledgeBase += `Description: ${settingsData.churchDescription}\n`
    }
    
    // Service Times from Settings
    if (settingsData.services) {
      knowledgeBase += '\n## Service Times\n'
      if (settingsData.services.sunday) {
        knowledgeBase += `- Sunday Service: ${settingsData.services.sunday}\n`
      }
      if (settingsData.services.monday) {
        knowledgeBase += `- Monday: ${settingsData.services.monday}\n`
      }
      if (settingsData.services.wednesday) {
        knowledgeBase += `- Wednesday: ${settingsData.services.wednesday}\n`
      }
      if (settingsData.services.friday) {
        knowledgeBase += `- Friday: ${settingsData.services.friday}\n`
      }
    }
    
    if (settingsData.contactInfo?.hours) {
      knowledgeBase += `- Office Hours: ${settingsData.contactInfo.hours}\n`
    }

    // 2. About Page Content
    if (aboutData.sections && aboutData.sections.length > 0) {
      knowledgeBase += '\n## About the Church\n\n'
      aboutData.sections.forEach(section => {
        if (section.content) {
          knowledgeBase += `### ${section.type.charAt(0).toUpperCase() + section.type.slice(1).replace(/_/g, ' ')}\n`
          knowledgeBase += `${section.content}\n\n`
        }
      })
    }

    // 3. Core Beliefs
    if (aboutData.coreBeliefs && aboutData.coreBeliefs.length > 0) {
      knowledgeBase += '## Core Beliefs\n\n'
      aboutData.coreBeliefs.forEach((belief, index) => {
        knowledgeBase += `${index + 1}. **${belief.title}**: ${belief.description}\n`
      })
      knowledgeBase += '\n'
    }

    // 4. Leadership Team
    if (aboutData.leadership && aboutData.leadership.length > 0) {
      knowledgeBase += '## Leadership Team\n\n'
      aboutData.leadership.forEach(member => {
        knowledgeBase += `- **${member.name}** - ${member.role}`
        if (member.bio) {
          knowledgeBase += `: ${member.bio}`
        }
        if (member.email) {
          knowledgeBase += ` (Email: ${member.email})`
        }
        knowledgeBase += '\n'
      })
      knowledgeBase += '\n'
    }

    // 5. Organizations & Ministries
    if (organizationsData.length > 0) {
      knowledgeBase += '## Organizations & Ministries\n\n'
      organizationsData.forEach(org => {
        knowledgeBase += `### ${org.name}\n`
        if (org.description) {
          knowledgeBase += `${org.description}\n`
        }
        if (org.leaderName) {
          knowledgeBase += `Leader: ${org.leaderName}`
          if (org.leaderRole) {
            knowledgeBase += ` (${org.leaderRole})`
          }
          knowledgeBase += '\n'
        }
        if (org.contactEmail) {
          knowledgeBase += `Contact: ${org.contactEmail}\n`
        }
        knowledgeBase += '\n'
      })
    }

    // 6. Recent Sermons (limit to last 10 for context length)
    if (sermonsData.length > 0) {
      knowledgeBase += '## Recent Sermons\n\n'
      const recentSermons = sermonsData.slice(0, 10)
      recentSermons.forEach(sermon => {
        knowledgeBase += `### ${sermon.title}\n`
        if (sermon.speaker) {
          knowledgeBase += `Speaker: ${sermon.speaker}\n`
        }
        if (sermon.date) {
          const date = new Date(sermon.date)
          knowledgeBase += `Date: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`
        }
        if (sermon.category) {
          knowledgeBase += `Category: ${sermon.category}\n`
        }
        if (sermon.description) {
          knowledgeBase += `Description: ${sermon.description}\n`
        }
        knowledgeBase += '\n'
      })
      if (sermonsData.length > 10) {
        knowledgeBase += `\n*There are ${sermonsData.length} total sermons available on the website.*\n\n`
      }
    }

    // 7. Upcoming & Recent Events
    if (eventsData.length > 0) {
      const now = new Date()
      const upcomingEvents = eventsData.filter(e => new Date(e.date) >= now).slice(0, 10)
      const pastEvents = eventsData.filter(e => new Date(e.date) < now).slice(0, 5)

      if (upcomingEvents.length > 0) {
        knowledgeBase += '## Upcoming Events\n\n'
        upcomingEvents.forEach(event => {
          knowledgeBase += `### ${event.title}\n`
          if (event.date) {
            const date = new Date(event.date)
            knowledgeBase += `Date: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`
          }
          if (event.time) {
            knowledgeBase += `Time: ${event.time}\n`
          }
          if (event.venue) {
            knowledgeBase += `Venue: ${event.venue}\n`
          }
          if (event.category) {
            knowledgeBase += `Category: ${event.category}\n`
          }
          if (event.description) {
            knowledgeBase += `Description: ${event.description}\n`
          }
          if (event.registrationLink) {
            knowledgeBase += `Registration: Available on the website\n`
          }
          knowledgeBase += '\n'
        })
      }

      if (pastEvents.length > 0) {
        knowledgeBase += '\n## Recent Past Events\n\n'
        pastEvents.forEach(event => {
          knowledgeBase += `- **${event.title}** (${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}) - ${event.venue}\n`
        })
        knowledgeBase += '\n'
      }
    }

    // 8. Page Links Reference
    knowledgeBase += '\n## Website Pages\n\n'
    knowledgeBase += '- **Home**: Main page with latest updates\n'
    knowledgeBase += '- **About** (/about): Church history, mission, vision, beliefs, and leadership\n'
    knowledgeBase += '- **Sermons** (/sermons): Browse, watch, listen, and download sermons\n'
    knowledgeBase += '- **Events** (/events): View upcoming and past events\n'
    knowledgeBase += '- **Organizations** (/organizations): All ministries and organizations\n'
    knowledgeBase += '- **Gallery** (/gallery): Photo albums and church memories\n'
    knowledgeBase += '- **Contact** (/contact): Contact form and church information\n'
    knowledgeBase += '- **Give** (/give): Online giving and donations\n'

    return knowledgeBase
  } catch (error) {
    console.error('Error gathering website content:', error)
    // Return minimal fallback
    return '# Church Information\n\nAmazing Grace Baptist Church\nLocation: U/Zawu, Gonin Gora, Kaduna State, Nigeria\nEmail: info@amazinggracechurch.org'
  }
}

/**
 * Fetches content using internal API calls (for server-side use)
 * This is more efficient as it doesn't require HTTP requests
 */
export async function gatherWebsiteContentInternal(): Promise<string> {
  try {
    // Import API route handlers or database directly
    // For now, we'll use a hybrid approach with fetch to internal endpoints
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    return await gatherWebsiteContent()
  } catch (error) {
    console.error('Error in internal content gathering:', error)
    return await gatherWebsiteContent()
  }
}

