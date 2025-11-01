import { NextRequest, NextResponse } from 'next/server'
import { getContextualKnowledge, churchKnowledgeBase } from '@/lib/knowledge-base'

// Using Hugging Face Inference API (free tier)
// You can also use Ollama for local deployment
const HUGGINGFACE_API_URL = process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models'
const AI_MODEL = process.env.AI_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2' // Free model
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get contextual knowledge based on the query
    const contextualKnowledge = getContextualKnowledge(message)
    
    // Build the prompt with context
    const systemPrompt = `You are a helpful AI assistant for Amazing Grace Baptist Church. Use the following information to answer questions accurately and helpfully.

${churchKnowledgeBase}

Current context:
${contextualKnowledge}

Instructions:
- Answer questions based on the information provided above
- Be friendly, welcoming, and helpful
- If you don't know something, suggest contacting the church office
- Keep responses concise but informative
- Use natural, conversational language`

    // Build conversation history
    const conversationText = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n')

    const fullPrompt = `${systemPrompt}

Conversation history:
${conversationText}

User: ${message}
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
          responseText = Array.isArray(data) && data[0]?.generated_text 
            ? data[0].generated_text.trim()
            : typeof data === 'string' 
            ? data.trim()
            : data[0]?.generated_text?.trim() || ''
        }
      } catch (error) {
        console.error('Hugging Face API error:', error)
      }
    }

    // Fallback to rule-based responses if API fails or no key
    if (!responseText) {
      responseText = getFallbackResponse(message)
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
    const fallbackResponse = getFallbackResponse(body.message || '')
    
    return NextResponse.json({
      response: fallbackResponse || "I apologize, but I'm having trouble processing your request right now. Please contact the church office at info@amazinggracechurch.org for assistance.",
      error: error.message
    })
  }
}

function getFallbackResponse(query: string): string {
  const lowerQuery = query.toLowerCase()

  // Service times
  if (lowerQuery.includes('service') && (lowerQuery.includes('time') || lowerQuery.includes('when') || lowerQuery.includes('start'))) {
    return "Our Sunday Service starts at 8AM and ends at 10AM in the Main Sanctuary. We also have Monday Bible Study at 5PM in the Fellowship Hall, and Wednesday Mid-Week Service from 5PM to 6PM in the Main Sanctuary."
  }

  // Band/music
  if (lowerQuery.includes('band') || (lowerQuery.includes('join') && lowerQuery.includes('music'))) {
    return "To join the church band or music ministry, please contact the church office or speak with one of our worship leaders after service. You can also email us at info@amazinggracechurch.org. We'd love to have you!"
  }

  // Location
  if (lowerQuery.includes('where') || lowerQuery.includes('location') || lowerQuery.includes('address')) {
    return "We are located at U/Zawu, Gonin Gora, Kaduna State, Nigeria. You can contact us at info@amazinggracechurch.org or visit us during our service times."
  }

  // Contact
  if (lowerQuery.includes('contact') || lowerQuery.includes('email') || lowerQuery.includes('phone')) {
    return "You can contact us via email at info@amazinggracechurch.org. You can also visit us during our service times or use the contact form on our website. We'd love to hear from you!"
  }

  // Giving
  if (lowerQuery.includes('give') || lowerQuery.includes('donation') || lowerQuery.includes('tithe') || lowerQuery.includes('offering')) {
    return "You can give online through our giving page. We accept Tithe, Offering, Building Fund contributions, and Missions support. You can use Flutterwave or Paystack for secure payments. A receipt will be automatically sent to your email."
  }

  // Events
  if (lowerQuery.includes('event')) {
    return "We have various events throughout the year including conferences, crusades, youth programs, and special services. Check our events page on the website for upcoming activities and dates."
  }

  // Sermons
  if (lowerQuery.includes('sermon')) {
    return "Yes! You can watch, listen to, or download our sermons on the sermons page. Many of our messages are available in both audio and video formats."
  }

  // Visiting
  if (lowerQuery.includes('visit') || lowerQuery.includes('first time')) {
    return "Absolutely! We welcome visitors. Join us for our Sunday Service at 8AM - it's a great time to visit. You can expect a warm welcome, uplifting worship, and a relevant message from God's Word."
  }

  // Default
  return "Thank you for your question! For more specific information, please contact the church office at info@amazinggracechurch.org or visit us during our service times. Our Sunday Service is at 8AM-10AM, and we'd love to see you there!"
}

