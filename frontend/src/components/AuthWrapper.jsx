'use client';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const AuthWrapper = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear localStorage when user signs out
  useEffect(() => {
    if (mounted && isLoaded && !isSignedIn) {
      // User is not signed in, clear all stored role data
      localStorage.removeItem('userRole');
      localStorage.removeItem('selectedRole');
      localStorage.removeItem('lastDashboard');
    }
  }, [mounted, isLoaded, isSignedIn]);

  useEffect(() => {
    if (mounted && isLoaded && isSignedIn && user) {
      // If user is logged in and on landing page, redirect to appropriate dashboard
      if (pathname === '/') {
        // Try to get user role from metadata first
        let userRole = user.publicMetadata?.role || user.unsafeMetadata?.role;
        
        // If no role is found, check localStorage for last visited dashboard
        if (!userRole) {
          const lastDashboard = localStorage.getItem('lastDashboard');
          if (lastDashboard === '/dashboard/vendor') {
            userRole = 'vendor';
          } else {
            userRole = 'user'; // Default to user
          }
        }
        
        // Redirect based on role
        if (userRole === 'vendor') {
          router.push('/dashboard/vendor');
        } else {
          router.push('/dashboard/user');
        }
      }
    }
  }, [mounted, isLoaded, isSignedIn, user, pathname, router]);

  // Store dashboard visits in localStorage for role detection
  useEffect(() => {
    if (pathname.startsWith('/dashboard/')) {
      localStorage.setItem('lastDashboard', pathname);
    }
  }, [pathname]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FCF9F2] flex items-center justify-center">
        <div className="text-gray-600 font-geist">Loading...</div>
      </div>
    );
  }

  return children;
};

export default AuthWrapper;
