import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Configuration
 * This runs at the edge before the request reaches your pages
 * Provides fast, server-side route protection
 */

// Define route patterns
const authRoutes = ['/sign-in', '/sign-up'];
const protectedRoutes = ['/dashboard', '/admin', '/exercise/speaking', '/mock-test'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/', '/pricing', '/tips-resources', '/exercise'];

/**
 * Checks if a path matches any of the route patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route === pathname) return true;
    // Check if pathname starts with the route (for nested routes)
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

/**
 * Main middleware function
 * Runs on every request to protected routes
 */
export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get('session');
    const sessionValue = sessionCookie?.value;
    
    // More thorough session check
    const hasValidSession = !!sessionValue && sessionValue.trim() !== '' && sessionValue !== 'null' && sessionValue !== 'undefined';

    // Check if user is trying to access auth routes (sign-in, sign-up)
    if (matchesRoute(pathname, authRoutes)) {
      // If user has a valid session cookie, redirect to dashboard
      // Note: We can't validate the session in edge middleware, so page components must do server-side validation
      if (hasValidSession) {
        console.log(`[Middleware] Redirecting authenticated user to dashboard from ${pathname}`);
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      
      // Allow access to auth pages if no session
      return NextResponse.next();
    }

    // Check if user is trying to access protected routes
    if (matchesRoute(pathname, protectedRoutes)) {
      // If user doesn't have a valid session cookie, redirect to sign-in
      if (!hasValidSession) {
        console.log(`[Middleware] Redirecting unauthenticated user to sign-in from ${pathname}`);
        const signInUrl = new URL('/sign-in', request.url);
        // Add redirect parameter to return to the original page after sign-in
        signInUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Session validation happens in page components via requireAuth()
      // Middleware can only check for cookie existence due to Edge Runtime limitations
      return NextResponse.next();
    }

    // Allow access to public routes
    return NextResponse.next();
    
  } catch (error) {
    console.error(`[Middleware] Error processing request for ${request.nextUrl.pathname}:`, error);
    
    // Log additional context for debugging
    console.error(`[Middleware] Error details:`, {
      pathname: request.nextUrl.pathname,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      cookies: request.cookies.getAll(),
    });
    
    // In case of error, allow the request to proceed to avoid breaking the app
    // The page-level authentication will handle security
    console.log(`[Middleware] Allowing request due to error - page-level auth will handle security`);
    return NextResponse.next();
  }
}

/**
 * Configure which routes this middleware should run on
 * Uses matcher to optimize performance by only running on specific routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
