import { NextRequest } from 'next/server'

// Store active connections
const connections = new Set<ReadableStreamDefaultController>()

// Broadcast updates to all connected clients
export function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() })
  
  connections.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`))
    } catch (error) {
      // Connection closed, remove it
      connections.delete(controller)
    }
  })
}

// Server-Sent Events endpoint
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Add connection
      connections.add(controller)
      
      // Send initial connection message
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)
      )
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`: heartbeat\n\n`)
          )
        } catch (error) {
          clearInterval(heartbeat)
          connections.delete(controller)
        }
      }, 30000) // Every 30 seconds
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        connections.delete(controller)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  })
}

