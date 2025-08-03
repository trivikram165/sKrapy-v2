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
  const [profileChecked, setProfileChecked] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

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
      setProfileChecked(false);
      setCheckingProfile(false);
    }
  }, [mounted, isLoaded, isSignedIn]);

    // Check profile completion for authenticated users
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!mounted || !isLoaded || !isSignedIn || !user) {
        console.log('AuthWrapper: Skipping profile check - not ready', { mounted, isLoaded, isSignedIn, hasUser: !!user });
        return;
      }

      console.log('AuthWrapper: Starting profile check for:', user.id, 'on path:', pathname);

      // Skip profile check for onboarding page
      if (pathname === '/onboarding') {
        console.log('AuthWrapper: On onboarding page, skipping check');
        setProfileChecked(true);
        setCheckingProfile(false);
        return;
      }

      // Skip profile check for auth pages only, but check for landing page and dashboard
      if (pathname.startsWith('/sign-') || pathname.startsWith('/auth/')) {
        console.log('AuthWrapper: On auth page, skipping check');
        setProfileChecked(true);
        setCheckingProfile(false);
        return;
      }

      console.log('AuthWrapper: Checking profile completion...');
      setCheckingProfile(true);

      try {
        // Get user role based on current path or metadata
        let userRole = user.publicMetadata?.role || user.unsafeMetadata?.role;
        
        console.log('AuthWrapper: Initial role from metadata:', userRole);
        console.log('AuthWrapper: Current pathname:', pathname);
        
        // If visiting a dashboard directly, use that role regardless of metadata
        if (pathname === '/dashboard/vendor') {
          userRole = 'vendor';
          console.log('AuthWrapper: Override role to vendor because on vendor dashboard');
        } else if (pathname === '/dashboard/user') {
          userRole = 'user';
          console.log('AuthWrapper: Override role to user because on user dashboard');
        } else if (!userRole) {
          // For other pages, check localStorage as fallback
          const lastDashboard = localStorage.getItem('lastDashboard');
          console.log('AuthWrapper: LastDashboard from localStorage:', lastDashboard);
          if (lastDashboard === '/dashboard/vendor') {
            userRole = 'vendor';
          } else {
            userRole = 'user'; // Default to user
          }
        }

        console.log('AuthWrapper: Using role for profile check:', userRole, 'on path:', pathname);

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://skrapy-backend.onrender.com'}/api/onboarding/check-profile/${user.id}/${userRole}`;
        console.log('AuthWrapper: Making API call to:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        console.log('AuthWrapper: Profile check response status:', response.status);
        console.log('AuthWrapper: Response ok:', response.ok);
        
        if (!response.ok) {
          // If user doesn't exist in database or any error, redirect to onboarding
          console.log('User not found in database, redirecting to onboarding with role:', userRole);
          router.push(`/onboarding?role=${userRole}`);
          return;
        }

        const data = await response.json();
        console.log('AuthWrapper: Profile check data:', data);

        if (!data.success || !data.profileCompleted) {
          // Profile not completed, redirect to onboarding
          console.log('Profile not completed, redirecting to onboarding with role:', userRole);
          router.push(`/onboarding?role=${userRole}`);
          return;
        }

        // Profile is completed, allow access
        console.log('AuthWrapper: Profile completed, allowing access');
        setProfileChecked(true);
        setCheckingProfile(false);
        
        // If user is on landing page with completed profile, redirect to dashboard
        if (pathname === '/') {
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
          
          console.log('AuthWrapper: Redirecting to dashboard for role:', userRole);
          if (userRole === 'vendor') {
            router.push('/dashboard/vendor');
          } else {
            router.push('/dashboard/user');
          }
        }
      } catch (error) {
        console.error('Profile check error:', error);
        // On error, redirect to onboarding to be safe - use user as default role
        router.push('/onboarding?role=user');
      }
    };

    checkProfileCompletion();
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

  // Show loading while Clerk is initializing or checking profile
  if (!isLoaded || checkingProfile) {
    return (
      <div className="min-h-screen bg-[#FCF9F2] flex items-center justify-center">
        <div className="text-gray-600 font-geist">Loading...</div>
      </div>
    );
  }

  return children;
};

export default AuthWrapper;
