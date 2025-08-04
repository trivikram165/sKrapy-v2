'use client';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const OnboardingForm = () => {
  const { user } = useUser();
  const { isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    fullAddress: '',
    city: '',
    state: '',
    pincode: '',
    businessName: '',
    gstin: ''
  });

  useEffect(() => {
    if (isLoaded && user) {
      // Get user role from URL params, metadata, or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const roleFromUrl = urlParams.get('role');
      
      let role = roleFromUrl || user.publicMetadata?.role || user.unsafeMetadata?.role;
      
      if (!role) {
        // Check localStorage for role preferences
        const selectedRole = localStorage.getItem('selectedRole');
        const storedRole = localStorage.getItem('userRole');
        const lastDashboard = localStorage.getItem('lastDashboard');
        
        console.log('OnboardingForm: Checking localStorage for role:', { selectedRole, storedRole, lastDashboard });
        
        // Priority: selectedRole > storedRole > lastDashboard path analysis
        role = selectedRole || storedRole;
        
        if (!role && lastDashboard) {
          if (lastDashboard.includes('vendor')) {
            role = 'vendor';
          } else {
            role = 'user';
          }
        }
        
        // If still no role, default to user
        if (!role) {
          role = 'user';
        }
      }
      
      console.log('OnboardingForm: Setting role to:', role);
      setUserRole(role);

      // Fetch existing profile data if available
      fetchExistingProfile(role);
    }
  }, [isLoaded, user]);

  const fetchExistingProfile = async (role) => {
    if (!user || !role) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/onboarding/check-profile/${user.id}/${role}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Existing profile data:', data);

        if (data.success && data.user) {
          // Store existing profile info
          setExistingProfile(data.user);
          
          // Pre-populate form with existing data
          setFormData(prev => ({
            ...prev,
            fullAddress: data.user.address?.fullAddress || '',
            city: data.user.address?.city || '',
            state: data.user.address?.state || '',
            pincode: data.user.address?.pincode || '',
            businessName: data.user.businessName || '',
            gstin: data.user.gstin || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching existing profile:', error);
      // Don't show error to user, just continue with empty form
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { fullAddress, city, state, pincode, businessName, gstin } = formData;
    
    if (!fullAddress.trim()) {
      setError('Full address is required');
      return false;
    }
    
    if (!city.trim()) {
      setError('City is required');
      return false;
    }
    
    if (!state.trim()) {
      setError('State is required');
      return false;
    }
    
    if (!pincode.trim()) {
      setError('Pincode is required');
      return false;
    }
    
    if (!/^\d{6}$/.test(pincode)) {
      setError('Pincode must be exactly 6 digits');
      return false;
    }
    
    // Vendor-specific validation
    if (userRole === 'vendor') {
      if (!businessName.trim()) {
        setError('Business name is required for vendors');
        return false;
      }
      
      // GSTIN validation only if provided
      if (gstin.trim() && !/^[0-9A-Z]{15}$/.test(gstin)) {
        setError('GSTIN must be exactly 15 characters (letters and numbers only)');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First, ensure user exists in database
      console.log('Creating/updating user in database...');
      const userCreationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/clerk-signup`, {
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
          role: userRole
        }),
      });

      const userCreationData = await userCreationResponse.json();
      console.log('User creation response:', userCreationData);

      // Now complete the profile
      console.log('Completing profile...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/onboarding/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          role: userRole,
          ...formData
        }),
      });

      const data = await response.json();
      console.log('Profile completion response:', data);

      if (data.success) {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'vendor') {
          router.push('/dashboard/vendor');
        } else {
          router.push('/dashboard/user');
        }
      } else {
        setError(data.message || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-[#FCF9F2] flex items-center justify-center">
        <div className="text-gray-600 font-geist">Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#FCF9F2] py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 font-geist mb-2'>
              {existingProfile && existingProfile.address ? 
                'Update Your Profile' : 
                'Complete Your Profile'
              }
            </h1>
            <p className='text-gray-600 font-geist'>
              Welcome {user.firstName || user.username}! 
              {existingProfile && existingProfile.address ? (
                userRole === 'vendor' ? (
                  ' Please provide your business information to complete your vendor profile.'
                ) : (
                  ' Please update your profile information.'
                )
              ) : (
                ` As a ${userRole}, please provide your location details to get started.`
              )}
            </p>
          </div>

          {/* Role Badge */}
          <div className='flex justify-center mb-8'>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                userRole === "vendor"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {userRole === "vendor" ? "🏪 Vendor" : "👤 User"}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <p className='text-red-600 text-sm font-geist'>{error}</p>
              </div>
            )}

            {/* Business Name - Only for Vendors */}
            {userRole === 'vendor' && (
              <div>
                <label
                  htmlFor='businessName'
                  className='block text-sm font-medium text-gray-700 font-geist mb-2'
                >
                  Business Name *
                </label>
                <input
                  type='text'
                  id='businessName'
                  name='businessName'
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder='Enter your business/company name'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-geist text-black'
                  required
                />
              </div>
            )}

            {/* GSTIN - Only for Vendors */}
            {userRole === 'vendor' && (
              <div>
                <label
                  htmlFor='gstin'
                  className='block text-sm font-medium text-gray-700 font-geist mb-2'
                >
                  GSTIN (Optional)
                </label>
                <input
                  type='text'
                  id='gstin'
                  name='gstin'
                  value={formData.gstin}
                  onChange={handleInputChange}
                  placeholder='Enter your 15-digit GSTIN (e.g., 22AAAAA0000A1Z5)'
                  maxLength={15}
                  pattern='[0-9A-Z]{15}'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-geist text-black uppercase'
                  style={{ textTransform: 'uppercase' }}
                />
                <p className='text-xs text-gray-500 mt-1 font-geist'>
                  15-character alphanumeric code issued by Income Tax Department (Optional for small businesses)
                </p>
              </div>
            )}

            {/* Full Address */}
            <div>
              <label
                htmlFor='fullAddress'
                className='block text-sm font-medium text-gray-700 font-geist mb-2'
              >
                Full Address *
              </label>
              <textarea
                id='fullAddress'
                name='fullAddress'
                rows={3}
                value={formData.fullAddress}
                onChange={handleInputChange}
                placeholder='Enter your complete address including building, street, area...'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-geist resize-none text-black'
                required
              />
            </div>

            {/* City */}
            <div>
              <label
                htmlFor='city'
                className='block text-sm font-medium text-gray-700 font-geist mb-2'
              >
                City *
              </label>
              <input
                type='text'
                id='city'
                name='city'
                value={formData.city}
                onChange={handleInputChange}
                placeholder='Enter your city'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-geist text-black'
                required
              />
            </div>

            {/* State */}
            <div>
              <label
                htmlFor='state'
                className='block text-sm font-medium text-gray-700 font-geist mb-2'
              >
                State *
              </label>
              <input
                type='text'
                id='state'
                name='state'
                value={formData.state}
                onChange={handleInputChange}
                placeholder='Enter your state'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-geist text-black'
                required
              />
            </div>

            {/* Pincode */}
            <div>
              <label
                htmlFor='pincode'
                className='block text-sm font-medium text-gray-700 font-geist mb-2'
              >
                Pincode *
              </label>
              <input
                type='text'
                id='pincode'
                name='pincode'
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder='Enter your 6-digit pincode'
                maxLength={6}
                pattern='\d{6}'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-geist text-black'
                required
              />
            </div>

            {/* Info Box */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-blue-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <p className='text-sm text-blue-700 font-geist'>
                    <strong>Why we need this information:</strong>
                    <br />
                    {userRole === "vendor"
                      ? "Your location helps us connect you with nearby users who need scrap collection services."
                      : "Your location helps us find nearby vendors who can collect your scrap materials."}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-[#8AC349] text-white py-3 px-4 rounded-lg font-medium font-geist hover:bg-[#7DAA3C] focus:ring-2 focus:ring-[#8AC349] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                  Completing Profile...
                </div>
              ) : (
                "Complete Profile & Continue"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
