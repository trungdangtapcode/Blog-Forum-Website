import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

// Force dynamic rendering at middleware level
export const dynamic = "force-dynamic";

export async function middleware(request: NextRequest) {
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
    return NextResponse.redirect(`${origin}/auth/login`);
  }
  return authRes;
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