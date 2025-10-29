import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Allow the request to proceed - the admin page handles auth UI
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Always allow access to /admin - the page component handles showing login or dashboard
        // This prevents redirect loops since /admin is both the sign-in page and protected route
        if (pathname === '/admin' || pathname.startsWith('/admin')) {
          // If user has token but is not admin, still allow access to show error message
          // The admin page component will handle showing login form vs dashboard
          return true
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}

