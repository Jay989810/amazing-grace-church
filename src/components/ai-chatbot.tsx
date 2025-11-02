"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant for Amazing Grace Baptist Church. I can help answer questions about our services, events, sermons, and more. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      })
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    "When does service start?",
    "How do I join the band?",
    "What are your service times?",
    "How can I give online?",
    "Where are you located?",
    "Do you have youth programs?",
    "How do I become a member?",
    "Can I watch sermons online?"
  ]

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 sm:bottom-4 sm:right-4"
          style={{
            filter: 'drop-shadow(0 10px 40px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))'
          }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group sm:h-14 sm:w-14"
            size="lg"
            style={{
              background: 'linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(221.2, 83.2%, 48%) 100%)',
              color: 'white',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25), 0 0 30px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="relative">
              <Bot className="h-7 w-7 animate-pulse group-hover:animate-none drop-shadow-lg sm:h-6 sm:w-6" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }} />
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white shadow-lg animate-ping sm:h-3 sm:w-3"></div>
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white shadow-lg sm:h-3 sm:w-3"></div>
            </div>
            <span className="sr-only">Open AI Chat Assistant</span>
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col md:w-[380px] md:h-[550px] sm:bottom-0 sm:right-0 sm:w-screen sm:h-screen sm:rounded-none sm:max-w-full sm:max-h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg text-foreground">Church AI Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[90%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted dark:bg-muted/80 border border-border dark:border-border/50'
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap ${
                      message.role === 'user' 
                        ? 'text-primary-foreground' 
                        : 'text-foreground'
                    }`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user'
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted dark:bg-muted/80 border border-border dark:border-border/50 rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 border-t border-border pt-2 bg-background">
                <p className="text-xs font-medium text-foreground mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1 px-2 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        setInput(question)
                        setTimeout(() => handleSend(), 100)
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about the church..."
                  disabled={isLoading}
                  className="flex-1 text-foreground bg-background border-input placeholder:text-muted-foreground"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="text-foreground"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2 text-center">
                Powered by open-source AI • Free to use
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

