import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

// Force dynamic rendering at middleware level
export const dynamic = "force-dynamic";

export async function middleware(request: NextRequest) {
  try {
    const authRes = await auth0.middleware(request);

    console.log('Youre in middleware')

    // Authentication routes — let the Auth0 middleware handle it.
    if (request.nextUrl.pathname.startsWith('/auth')) {
      return authRes;
    }
    if (request.nextUrl.pathname.startsWith('/landing')) {
      return authRes;
    }
    if (request.nextUrl.pathname==='/') {
      return authRes;
    }  // Allow direct API requests and static pages to go through without auth check
    if (request.nextUrl.pathname.includes('/api/') || 
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/landing') ||
        request.nextUrl.pathname.startsWith('/public')) {
      return NextResponse.next();
    }

    const { origin } = new URL(request.url);
    const session = await auth0.getSession();

    // console.log('current session (middleware):', session)

    // User does not have a session — redirect to login.
    if (!session) {
      // console.log('(middleware) not logged in')
      
      // Store the original URL to redirect back after login
      const returnTo = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(`${origin}/auth/login?returnTo=${returnTo}`);
    }
    
    return authRes;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Handle token expiration in middleware
    // Use type assertion for error since we don't know its exact structure
    const err = error as { code?: string; message?: string };
    const errorCode = err?.code || '';
    const errorMessage = err?.message || '';
    
    if (errorCode === 'ERR_JWT_EXPIRED' || 
        errorMessage.includes('jwt expired') || 
        errorMessage.includes('exp claim')) {
      
      const { origin } = new URL(request.url);
      const returnTo = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
      
      console.log('Token expired in middleware, redirecting to login');
      return NextResponse.redirect(`${origin}/auth/login?returnTo=${returnTo}`);
    }
    
    // For other errors, just continue the request
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - API routes that should be accessible without authentication
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/).*)",
  ],
};