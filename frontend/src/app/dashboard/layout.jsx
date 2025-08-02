'use client';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import UserTypeModal from '../../components/UserTypeModal';

export default function DashboardLayout({ children }) {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [attemptedRole, setAttemptedRole] = useState('');

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
      setShowModal(true);
    }
  }, [mounted, isLoaded, isSignedIn]);

  // Check for unauthorized role switching
  useEffect(() => {
    if (isSignedIn && user && pathname) {
      const currentRole = pathname.includes('/dashboard/vendor') ? 'vendor' : 'user';
      
      // Get user role from localStorage 
      let userRole = localStorage.getItem('userRole');
      
      // Check if user just selected a role in the modal
      const selectedRole = localStorage.getItem('selectedRole');
      if (selectedRole) {
        userRole = selectedRole;
        // Store the role in localStorage 
        localStorage.setItem('userRole', selectedRole);
        // Clear the selected role from localStorage
        localStorage.removeItem('selectedRole');
      }
      
      // If no stored role at all, this is a fresh sign-in - allow access and set role
      if (!userRole) {
        console.log('Fresh sign-in detected, setting role to:', currentRole);
        localStorage.setItem('userRole', currentRole);
        localStorage.setItem('lastDashboard', pathname);
        return; // Allow access
      }
      
      // If user is trying to access a different role dashboard
      if (userRole !== currentRole) {
        console.log('Role mismatch - stored:', userRole, 'current:', currentRole);
        setAttemptedRole(currentRole);
        setShowWarning(true);
        return;
      }

      // Store current dashboard visit
      localStorage.setItem('lastDashboard', pathname);
      localStorage.setItem('userRole', currentRole);
    }
  }, [isSignedIn, user, pathname]);

  const handleWarningClose = () => {
    setShowWarning(false);
    // Redirect back to their correct dashboard
    const userRole = localStorage.getItem('userRole') || user?.publicMetadata?.role || (localStorage.getItem('lastDashboard')?.includes('vendor') ? 'vendor' : 'user');
    if (userRole === 'vendor') {
      router.push('/dashboard/vendor');
    } else {
      router.push('/dashboard/user');
    }
  };

  const handleSwitchAccount = async () => {
    try {
      // Clear localStorage completely
      localStorage.clear();
      
      // Sign out from Clerk normally
      await signOut({ redirectUrl: '/' });
      
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback: just clear localStorage and redirect
      localStorage.clear();
      window.location.replace('/');
    }
  };

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

  // Show modal if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#FCF9F2] flex items-center justify-center">
        <UserTypeModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      </div>
    );
  }

  // Show warning if trying to access wrong dashboard
  if (showWarning) {
    return (
      <div className="min-h-screen bg-[#FCF9F2] flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-medium text-gray-900 mb-4 font-geist">
                Access Restricted
              </h2>
              <p className="text-gray-600 mb-6 font-geist">
                You're currently logged in as a <strong>{localStorage.getItem('userRole') || user?.publicMetadata?.role || (localStorage.getItem('lastDashboard')?.includes('vendor') ? 'vendor' : 'user')}</strong>. 
                To switch to a <strong>{attemptedRole}</strong> account, you need to log out and sign up again.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={handleSwitchAccount}
                  className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-geist font-medium hover:bg-red-600 transition-all"
                >
                  Log Out & Switch Account
                </button>
                <button 
                  onClick={handleWarningClose}
                  className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-geist font-medium hover:bg-gray-300 transition-all"
                >
                  Stay on Current Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and accessing correct dashboard, show the content
  return <>{children}</>;
}