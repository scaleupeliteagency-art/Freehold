import { NextResponse } from 'next/server';

export function middleware(request) {
  // TODO: Implement Supabase Auth check here.
  // Example flow:
  // 1. Get user session from Supabase
  // 2. If no session, redirect to /login
  // 3. If session, query systems table for user_id
  // 4. If system exists, and user is on /system/new, redirect to /dashboard
  // 5. If no system exists, and user is NOT on /system/new, redirect to /system/new
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
