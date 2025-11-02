import { NextRequest, NextResponse } from 'next/server'
import { getContextualKnowledge, churchKnowledgeBase } from '@/lib/knowledge-base'
import { gatherWebsiteContent } from '@/lib/ai-content-gatherer'

// Using Hugging Face Inference API (free tier)
// You can also use Ollama for local deployment
const HUGGINGFACE_API_URL = process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models'
const AI_MODEL = process.env.AI_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2' // Free model
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''

// Simple in-memory cache for website content (refreshes every 5 minutes)
let cachedContent: string | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Gets website content with caching
 */
async function getWebsiteContent(): Promise<string> {
  const now = Date.now()
  
  // Return cached content if still valid
  if (cachedContent && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedContent
  }
  
  try {
    // Fetch fresh content from all pages
    cachedContent = await gatherWebsiteContent()
    cacheTimestamp = now
    return cachedContent
  } catch (error) {
    console.error('Error fetching website content:', error)
    // Return cached content even if expired, or fallback to base knowledge
    return cachedContent || churchKnowledgeBase
  }
}

export async function POST(request: NextRequest) {
  let message = ''
  try {
    const body = await request.json()
    message = body.message || ''
    const { conversationHistory = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    const userMessage = message

    // Get dynamic content from all website pages
    const websiteContent = await getWebsiteContent()
    
    // Get contextual knowledge based on the query
    const contextualKnowledge = getContextualKnowledge(userMessage)
    
    // Build the prompt with context from all pages
    const systemPrompt = `You are a helpful AI assistant for Amazing Grace Baptist Church. Use the following information from our website to answer questions accurately and helpfully.

## Base Church Information
${churchKnowledgeBase}

## Current Website Content (from all pages)
${websiteContent}

## Query-Specific Context
${contextualKnowledge}

Instructions:
- Answer questions based on the comprehensive information provided above from all website pages
- Reference specific sermons, events, organizations, or leadership when relevant
- Be friendly, welcoming, and helpful
- If you don't know something specific, suggest contacting the church office or visiting the relevant page
- Keep responses concise but informative (2-3 sentences when possible, more if needed)
- Use natural, conversational language
- When mentioning events, sermons, or organizations, include relevant details like dates, speakers, or leaders if available`

    // Build conversation history
    const conversationText = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n')

    const fullPrompt = `${systemPrompt}

Conversation history:
${conversationText}

User: ${userMessage}
Assistant:`

    // Try Hugging Face API first
    let responseText = ''
    
    if (HUGGINGFACE_API_KEY) {
      try {
        const hfResponse = await fetch(
          `${HUGGINGFACE_API_URL}/${AI_MODEL}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: fullPrompt,
              parameters: {
                max_new_tokens: 250,
                temperature: 0.7,
                return_full_text: false
              }
            })
          }
        )

        if (hfResponse.ok) {
          const data = await hfResponse.json()
          // Handle different response formats from Hugging Face
          if (Array.isArray(data) && data[0]?.generated_text) {
            responseText = data[0].generated_text.trim()
          } else if (typeof data === 'string') {
            responseText = data.trim()
          } else if (data.generated_text) {
            responseText = data.generated_text.trim()
          } else if (data[0]?.generated_text) {
            responseText = data[0].generated_text.trim()
          }
        } else {
          // Log error for debugging
          const errorData = await hfResponse.text()
          console.error('Hugging Face API error:', hfResponse.status, errorData)
        }
      } catch (error) {
        console.error('Hugging Face API error:', error)
      }
    }

    // Fallback to rule-based responses if API fails or no key
    if (!responseText) {
      responseText = await getFallbackResponse(userMessage)
    }

    // Clean up the response
    responseText = responseText
      .replace(/Assistant:/g, '')
      .replace(/User:/g, '')
      .trim()

    if (!responseText) {
      responseText = "I'm here to help! Could you please rephrase your question? You can also contact the church office at info@amazinggracechurch.org for more information."
    }

    return NextResponse.json({
      response: responseText,
      model: AI_MODEL
    })
  } catch (error: any) {
    console.error('AI chat error:', error)
    
    // Fallback response
    const fallbackResponse = await getFallbackResponse(message || '')
    
    return NextResponse.json({
      response: fallbackResponse || "I apologize, but I'm having trouble processing your request right now. Please contact the church office at info@amazinggracechurch.org for assistance.",
      error: error.message
    })
  }
}

/**
 * Enhanced fallback response that tries to use cached website content
 */
async function getFallbackResponse(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase()
  
  // Try to get website content for better responses
  let websiteContent = ''
  try {
    websiteContent = await getWebsiteContent()
  } catch (error) {
    console.error('Error getting website content for fallback:', error)
  }

  // Service times
  if (lowerQuery.includes('service') && (lowerQuery.includes('time') || lowerQuery.includes('when') || lowerQuery.includes('start'))) {
    if (websiteContent.includes('Service Times')) {
      const serviceMatch = websiteContent.match(/## Service Times\n([\s\S]*?)(?=\n##|$)/)
      if (serviceMatch) {
        return `Our service times are:\n${serviceMatch[1].trim()}`
      }
    }
    return "Our Sunday Service starts at 8AM and ends at 10AM in the Main Sanctuary. We also have Monday Bible Study at 5PM in the Fellowship Hall, and Wednesday Mid-Week Service from 5PM to 6PM in the Main Sanctuary."
  }

  // Organizations/ministries
  if (lowerQuery.includes('organization') || lowerQuery.includes('ministry') || lowerQuery.includes('choir') || (lowerQuery.includes('join') && lowerQuery.includes('band'))) {
    if (websiteContent.includes('Organizations & Ministries')) {
      const orgMatch = websiteContent.match(/## Organizations & Ministries\n\n([\s\S]*?)(?=\n## Recent|$)/)
      if (orgMatch) {
        return `We have several organizations and ministries available:\n\n${orgMatch[1].substring(0, 500)}...\n\nVisit the /organizations page on our website to see all ministries and contact information.`
      }
    }
    return "We have various ministries including the Church Band, Choir, Youth Ministry, Children's Ministry, and more. Visit our organizations page (/organizations) to see all available ministries and contact information."
  }

  // Location
  if (lowerQuery.includes('where') || lowerQuery.includes('location') || lowerQuery.includes('address')) {
    if (websiteContent.includes('Address:')) {
      const addressMatch = websiteContent.match(/Address: ([^\n]+)/)
      const emailMatch = websiteContent.match(/Email: ([^\n]+)/)
      if (addressMatch) {
        return `We are located at ${addressMatch[1]}.${emailMatch ? ` You can contact us at ${emailMatch[1]}` : ''}`
      }
    }
    return "We are located at U/Zawu, Gonin Gora, Kaduna State, Nigeria. You can contact us at info@amazinggracechurch.org or visit us during our service times."
  }

  // Contact
  if (lowerQuery.includes('contact') || lowerQuery.includes('email') || lowerQuery.includes('phone')) {
    if (websiteContent.includes('Email:')) {
      const emailMatch = websiteContent.match(/Email: ([^\n]+)/)
      const phoneMatch = websiteContent.match(/Phone: ([^\n]+)/)
      let response = emailMatch ? `You can contact us via email at ${emailMatch[1]}.` : "You can contact us via email at info@amazinggracechurch.org."
      if (phoneMatch) {
        response += ` Phone: ${phoneMatch[1]}.`
      }
      response += " You can also visit us during our service times or use the contact form on our website."
      return response
    }
    return "You can contact us via email at info@amazinggracechurch.org. You can also visit us during our service times or use the contact form on our website. We'd love to hear from you!"
  }

  // Giving
  if (lowerQuery.includes('give') || lowerQuery.includes('donation') || lowerQuery.includes('tithe') || lowerQuery.includes('offering')) {
    return "You can give online through our giving page (/give). We accept Tithe, Offering, Building Fund contributions, and Missions support. You can use Flutterwave or Paystack for secure payments. A receipt will be automatically sent to your email."
  }

  // Events
  if (lowerQuery.includes('event')) {
    if (websiteContent.includes('Upcoming Events')) {
      const eventsMatch = websiteContent.match(/## Upcoming Events\n\n([\s\S]*?)(?=\n##|$)/)
      if (eventsMatch && eventsMatch[1].trim()) {
        const eventsText = eventsMatch[1].substring(0, 400)
        return `Here are our upcoming events:\n\n${eventsText}${eventsMatch[1].length > 400 ? '...' : ''}\n\nVisit the /events page for full details and to register.`
      }
    }
    return "We have various events throughout the year including conferences, crusades, youth programs, and special services. Check our events page (/events) on the website for upcoming activities, dates, and registration information."
  }

  // Sermons
  if (lowerQuery.includes('sermon') || lowerQuery.includes('preach') || lowerQuery.includes('message')) {
    if (websiteContent.includes('Recent Sermons')) {
      const sermonsMatch = websiteContent.match(/## Recent Sermons\n\n([\s\S]*?)(?=\n##|$)/)
      if (sermonsMatch && sermonsMatch[1].trim()) {
        const sermonsText = sermonsMatch[1].substring(0, 400)
        return `Here are some of our recent sermons:\n\n${sermonsText}${sermonsMatch[1].length > 400 ? '...' : ''}\n\nVisit the /sermons page to watch, listen, or download all available sermons.`
      }
    }
    return "Yes! You can watch, listen to, or download our sermons on the sermons page (/sermons). Many of our messages are available in both audio and video formats. You can filter by category or speaker."
  }

  // Leadership
  if (lowerQuery.includes('pastor') || lowerQuery.includes('leader') || lowerQuery.includes('staff')) {
    if (websiteContent.includes('Leadership Team')) {
      const leadershipMatch = websiteContent.match(/## Leadership Team\n\n([\s\S]*?)(?=\n##|$)/)
      if (leadershipMatch) {
        return `Our leadership team includes:\n${leadershipMatch[1].substring(0, 300)}${leadershipMatch[1].length > 300 ? '...' : ''}\n\nVisit the /about page to learn more about our leadership.`
      }
    }
    return "We have a dedicated leadership team. Visit our about page (/about) to learn more about our pastors and church leaders, or contact the church office for more information."
  }

  // About/History
  if (lowerQuery.includes('about') || lowerQuery.includes('history') || lowerQuery.includes('belief')) {
    if (websiteContent.includes('About the Church') || websiteContent.includes('Core Beliefs')) {
      return "Visit our about page (/about) to learn about our church history, mission, vision, core beliefs, and leadership team. You'll find comprehensive information about who we are and what we believe."
    }
    return "Visit our about page (/about) to learn about our church history, mission, vision, and what we believe. We'd love to share our story with you!"
  }

  // Visiting
  if (lowerQuery.includes('visit') || lowerQuery.includes('first time') || lowerQuery.includes('guest')) {
    return "Absolutely! We welcome visitors. Join us for our Sunday Service - it's a great time to visit. You can expect a warm welcome, uplifting worship, and a relevant message from God's Word. Check our service times on the website."
  }

  // Default
  return "Thank you for your question! I have access to information from all pages of our website including sermons, events, organizations, leadership, and more. For specific information, please visit the relevant page or contact the church office at info@amazinggracechurch.org. Our Sunday Service is at 8AM-10AM, and we'd love to see you there!"
}

