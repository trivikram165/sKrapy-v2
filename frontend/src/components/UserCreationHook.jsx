'use client';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

const UserCreationHook = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const createUserInDatabase = async () => {
      if (!isLoaded || !user) {
        console.log('UserCreationHook: Not ready', { isLoaded, hasUser: !!user });
        return;
      }

      console.log('UserCreationHook: Creating user for:', user.id);

      try {
        // Get role from metadata or default to 'user'
        const role = user.publicMetadata?.role || user.unsafeMetadata?.role || 'user';
        console.log('UserCreationHook: Detected role:', role);
        
        // Always try to create/update user to ensure they exist
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://skrapy-backend.onrender.com'}/api/users/clerk-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: user.id,
            username: user.username,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: role
          }),
        });

        const data = await response.json();
        console.log('UserCreationHook: Response:', data);
        
        if (!data.success) {
          console.error('Failed to create user in database:', data.message);
        } else {
          console.log('User created/updated in database successfully');
        }
      } catch (error) {
        console.error('Error creating user in database:', error);
      }
    };

    // Add a small delay to ensure Clerk is fully loaded
    const timer = setTimeout(createUserInDatabase, 1000);
    
    return () => clearTimeout(timer);
  }, [user, isLoaded]);

  return null; // This component doesn't render anything
};

export default UserCreationHook;
