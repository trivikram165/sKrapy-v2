// middleware.js
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard/user(.*)", // Protects the /dashboard/user route
  "/dashboard/vendor(.*)", // Protects the /dashboard/vendor route
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    try {
      const { userId } = await auth();
      if (!userId) {
        // Redirect to sign-in if not authenticated
        const signInUrl = new URL('/sign-in', req.url);
        return Response.redirect(signInUrl);
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      const signInUrl = new URL('/sign-in', req.url);
      return Response.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
