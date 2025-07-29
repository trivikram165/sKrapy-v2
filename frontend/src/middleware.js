// `middleware.js`: This crucial file (at the root of your project, outside `src`) tells Clerk which pages are public and which require a user to be signed in.

import { NextResponse } from 'next/server';

export function middleware(request) {
  // Placeholder middleware function
  // TODO: Implement Clerk authentication middleware
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};