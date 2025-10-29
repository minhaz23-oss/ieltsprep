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
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const hasSession = !!sessionCookie?.value;

  // Check if user is trying to access auth routes (sign-in, sign-up)
  if (matchesRoute(pathname, authRoutes)) {
    // If user has a session cookie, redirect to dashboard
    // Note: We can't validate the session in edge middleware, so page components must do server-side validation
    if (hasSession) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Allow access to auth pages if no session
    return NextResponse.next();
  }

  // Check if user is trying to access protected routes
  if (matchesRoute(pathname, protectedRoutes)) {
    // If user doesn't have a session cookie, redirect to sign-in
    if (!hasSession) {
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
