# Frontend Documentation

## Overview
The sKrapy-v2 frontend is a Next.js 15 application with React 19, featuring Clerk authentication, Tailwind CSS styling, and role-based user interfaces for scrap management.

## Quick Start

### Installation
```bash
cd frontend
npm install
```

### Environment Setup
Create `.env.local` file:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/auth/role-selection
```

### Run Development Server
```bash
npm run dev
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── auth/              # Authentication pages
│   │   │   ├── role-selection/ # Role selection after signup
│   │   │   ├── sign-in/       # Sign in page
│   │   │   └── sign-up/       # Sign up page
│   │   ├── dashboard/         # Role-based dashboards
│   │   │   ├── user/          # User dashboard
│   │   │   └── vendor/        # Vendor dashboard
│   │   ├── onboarding/        # Profile completion
│   │   ├── api/               # API route handlers
│   │   │   └── webhooks/      # Webhook endpoints
│   │   ├── layout.js          # Root layout with Clerk provider
│   │   ├── page.js            # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── OnboardingForm.jsx # Profile completion form
│   │   ├── Header.jsx         # Navigation header
│   │   ├── Hero.jsx           # Homepage hero section
│   │   ├── HowWeWork.jsx      # Process explanation
│   │   ├── Prices.jsx         # Pricing information
│   │   ├── WhyUs.jsx          # Value proposition
│   │   └── Footer.jsx         # Site footer
│   └── middleware.js          # Clerk middleware for route protection
├── public/                    # Static assets
│   ├── circuit.jpeg          # Hero images
│   ├── printer.jpeg
│   ├── rim.jpeg
│   └── wires.jpeg
├── package.json              # Dependencies and scripts
├── next.config.mjs           # Next.js configuration
├── tailwind.config.js        # Tailwind CSS config
├── postcss.config.mjs        # PostCSS configuration
└── jsconfig.json            # JavaScript project config
```

## Technology Stack

### Core Technologies
- **Next.js 15**: React framework with App Router
- **React 19**: UI library with latest features
- **Tailwind CSS 4**: Utility-first CSS framework
- **Clerk**: Authentication and user management

### Key Dependencies
```json
{
  "@clerk/nextjs": "^6.27.1",      // Authentication
  "next": "15.4.4",                // React framework
  "react": "19.1.0",               // UI library
  "react-dom": "19.1.0",           // DOM rendering
  "lucide-react": "^0.532.0",      // Icon library
  "tailwindcss": "^4"              // CSS framework
}
```

## Routing Architecture

### App Router Structure
```
/                               # Homepage with hero and features
├── /auth/
│   ├── /sign-in               # User sign in
│   ├── /sign-up               # User registration
│   └── /role-selection        # Choose user or vendor role
├── /onboarding                # Profile completion form
├── /dashboard/
│   ├── /user                  # User dashboard (create orders)
│   └── /vendor                # Vendor dashboard (manage orders)
└── /api/
    └── /webhooks/
        └── /clerk             # Clerk webhook handler
```

### Route Protection
```javascript
// middleware.js
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware((auth, req) => {
  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    auth().protect()
  }
  
  // Protect onboarding
  if (req.nextUrl.pathname.startsWith('/onboarding')) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', 
    '/', 
    '/(api|trpc)(.*)'
  ],
}
```

## Component Architecture

### OnboardingForm Component

**Purpose**: Handles profile completion for both users and vendors with intelligent form pre-population.

**Location**: `src/components/OnboardingForm.jsx`

**Features**:
- Role-based field rendering
- Form validation with real-time feedback
- Pre-population for existing profiles
- GSTIN format validation for vendors
- Contextual messaging based on profile state

#### Component Structure
```javascript
const OnboardingForm = () => {
  // State management
  const [formData, setFormData] = useState({
    fullAddress: '',
    city: '',
    state: '',
    pincode: '',
    businessName: '',  // Vendors only
    gstin: ''          // Vendors only
  });
  
  const [existingProfile, setExistingProfile] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clerk hooks
  const { user } = useUser();
  const { isLoaded } = useAuth();
  const router = useRouter();
```

#### Key Functions
```javascript
// Fetch existing profile data for pre-population
const fetchExistingProfile = async (role) => {
  if (!user || !role) return;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/check-profile/${user.id}/${role}`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
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
  }
};

// Form validation with role-based rules
const validateForm = () => {
  const { fullAddress, city, state, pincode, businessName, gstin } = formData;
  
  // Basic address validation
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
      return false;
    }
  }
  
  return true;
};

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  if (!validateForm()) {
    return;
  }
  
  setLoading(true);
  
  try {
    // Ensure user exists in database
    const userCreationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/clerk-signup`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          username: user.username,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: userRole
        }),
      }
    );

    // Complete the profile
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/complete-profile`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          role: userRole,
          ...formData
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // Redirect to appropriate dashboard
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
```

#### Form Fields
```javascript
// Vendor-specific business fields
{userRole === 'vendor' && (
  <>
    {/* Business Name */}
    <div>
      <label htmlFor='businessName' className='form-label'>
        Business Name *
      </label>
      <input
        type='text'
        id='businessName'
        name='businessName'
        value={formData.businessName}
        onChange={handleInputChange}
        placeholder='Enter your business/company name'
        className='form-input'
        required
      />
    </div>

    {/* GSTIN */}
    <div>
      <label htmlFor='gstin' className='form-label'>
        GSTIN *
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
        className='form-input uppercase'
        style={{ textTransform: 'uppercase' }}
        required
      />
      <p className='form-help'>
        15-character alphanumeric code issued by Income Tax Department
      </p>
    </div>
  </>
)}

// Common address fields
<div>
  <label htmlFor='fullAddress' className='form-label'>
    Full Address *
  </label>
  <textarea
    id='fullAddress'
    name='fullAddress'
    rows={3}
    value={formData.fullAddress}
    onChange={handleInputChange}
    placeholder='Enter your complete address including building, street, area...'
    className='form-textarea'
    required
  />
</div>
```

### Header Component

**Purpose**: Navigation header with authentication status and role-based navigation.

**Location**: `src/components/Header.jsx`

**Features**:
- Responsive navigation
- User authentication status
- Role-based menu items
- Mobile hamburger menu

### Homepage Components

#### Hero Component
**Purpose**: Landing page hero section with call-to-action buttons.

**Features**:
- Background images
- Role-based sign-up buttons
- Responsive design
- Value proposition

#### HowWeWork Component
**Purpose**: Explains the platform process flow.

**Features**:
- Step-by-step process
- Visual icons
- User and vendor workflows

#### Prices Component
**Purpose**: Displays scrap material pricing information.

**Features**:
- Dynamic pricing display
- Category-based organization
- Price per unit information

#### WhyUs Component
**Purpose**: Highlights platform benefits and value proposition.

**Features**:
- Feature highlights
- Trust indicators
- Social proof elements

## Authentication Flow

### Clerk Integration

#### Initial Setup
```javascript
// app/layout.js
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-geist">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

#### Authentication Flow
1. **Sign Up/Sign In**: Handled by Clerk components
2. **Role Selection**: User chooses "User" or "Vendor" role
3. **Profile Check**: System validates profile completion
4. **Onboarding**: Complete missing profile information
5. **Dashboard Redirect**: Role-based dashboard access

#### Role Determination Logic
```javascript
// Priority order for role determination
useEffect(() => {
  if (isLoaded && user) {
    // 1. URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roleFromUrl = urlParams.get('role');
    
    // 2. User metadata
    let role = roleFromUrl || 
               user.publicMetadata?.role || 
               user.unsafeMetadata?.role;
    
    // 3. localStorage fallback
    if (!role) {
      const lastDashboard = localStorage.getItem('lastDashboard');
      if (lastDashboard?.includes('vendor')) {
        role = 'vendor';
      } else {
        role = 'user';
      }
    }
    
    setUserRole(role);
    fetchExistingProfile(role);
  }
}, [isLoaded, user]);
```

### Protected Routes
```javascript
// middleware.js protects sensitive routes
const protectedRoutes = [
  '/dashboard',
  '/onboarding',
  '/profile'
];

// Automatic redirects based on auth status
const publicRoutes = [
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/role-selection'
];
```

## State Management

### React Hooks Pattern
The application uses React hooks for state management instead of external state management libraries.

#### User State
```javascript
// Clerk provides global user state
const { user, isLoaded, isSignedIn } = useUser();
const { signOut } = useAuth();

// Local component state for forms
const [formData, setFormData] = useState({});
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

#### Form State Management
```javascript
// Controlled components pattern
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Form validation state
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

// Field-level validation
const validateField = (name, value) => {
  switch (name) {
    case 'gstin':
      return /^[0-9A-Z]{15}$/.test(value) ? '' : 'Invalid GSTIN format';
    case 'pincode':
      return /^\d{6}$/.test(value) ? '' : 'Pincode must be 6 digits';
    default:
      return value.trim() ? '' : 'This field is required';
  }
};
```

## API Integration

### Fetch Patterns
```javascript
// Standard API call pattern with error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Usage example
const completeProfile = async (profileData) => {
  setLoading(true);
  setError('');

  try {
    const result = await apiCall('/api/onboarding/complete-profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });

    if (result.success) {
      router.push('/dashboard/user');
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Error Handling Strategy
```javascript
// Global error handling pattern
const handleApiError = (error, setError) => {
  if (error.message.includes('fetch')) {
    setError('Network error. Please check your connection.');
  } else if (error.message.includes('401')) {
    setError('Authentication required. Please sign in.');
  } else {
    setError(error.message || 'Something went wrong. Please try again.');
  }
};

// Loading state management
const [loadingStates, setLoadingStates] = useState({
  profile: false,
  orders: false,
  submission: false
});

const setLoading = (key, value) => {
  setLoadingStates(prev => ({
    ...prev,
    [key]: value
  }));
};
```

## Styling Architecture

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8AC349',
        'primary-dark': '#7DAA3C',
        background: '#FCF9F2'
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif']
      }
    },
  },
  plugins: [],
}
```

### Component Styling Patterns
```javascript
// Form input classes
const inputClasses = `
  w-full px-4 py-3 
  border border-gray-300 rounded-lg 
  focus:ring-2 focus:ring-blue-500 focus:border-transparent 
  font-geist text-black
`;

// Button classes
const buttonClasses = `
  w-full bg-[#8AC349] text-white py-3 px-4 rounded-lg 
  font-medium font-geist 
  hover:bg-[#7DAA3C] 
  focus:ring-2 focus:ring-[#8AC349] focus:ring-offset-2 
  disabled:opacity-50 disabled:cursor-not-allowed 
  transition-colors
`;

// Card classes
const cardClasses = `
  bg-white rounded-2xl shadow-xl p-8
`;
```

### Responsive Design
```javascript
// Mobile-first responsive classes
const responsiveClasses = `
  // Mobile (default)
  px-4 py-8 text-sm
  
  // Tablet
  sm:px-6 sm:py-12 sm:text-base
  
  // Desktop
  lg:px-8 lg:py-16 lg:text-lg
  
  // Large screens
  xl:px-12 xl:py-20 xl:text-xl
`;
```

## Form Validation

### Client-Side Validation
```javascript
// Real-time validation with instant feedback
const validateField = (name, value) => {
  const validations = {
    fullAddress: (v) => v.trim().length >= 10 ? '' : 'Address must be at least 10 characters',
    city: (v) => v.trim().length >= 2 ? '' : 'City name is required',
    state: (v) => v.trim().length >= 2 ? '' : 'State name is required',
    pincode: (v) => /^\d{6}$/.test(v) ? '' : 'Pincode must be exactly 6 digits',
    businessName: (v) => v.trim().length >= 2 ? '' : 'Business name is required',
    gstin: (v) => /^[0-9A-Z]{15}$/.test(v) ? '' : 'GSTIN must be exactly 15 alphanumeric characters'
  };

  return validations[name] ? validations[name](value) : '';
};

// Form submission validation
const validateForm = () => {
  const newErrors = {};
  
  Object.keys(formData).forEach(field => {
    const error = validateField(field, formData[field]);
    if (error) {
      newErrors[field] = error;
    }
  });

  // Role-specific validation
  if (userRole === 'vendor') {
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required for vendors';
    }
    // GSTIN validation only if provided
    if (formData.gstin.trim() && !/^[0-9A-Z]{15}$/.test(formData.gstin)) {
      newErrors.gstin = 'GSTIN must be exactly 15 characters (letters and numbers only)';
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Server-Side Validation
The frontend relies on backend validation as the source of truth, displaying server-side validation errors to users.

```javascript
// Handle server validation errors
const handleServerErrors = (responseData) => {
  if (responseData.field) {
    // Field-specific error
    setErrors(prev => ({
      ...prev,
      [responseData.field]: responseData.message
    }));
  } else {
    // General error
    setError(responseData.message);
  }
};
```

## Performance Optimization

### Code Splitting
```javascript
// Dynamic imports for heavy components
const DashboardComponent = dynamic(() => import('./Dashboard'), {
  loading: () => <div>Loading dashboard...</div>,
  ssr: false
});

// Route-based code splitting with Next.js App Router
// Automatic with app/ directory structure
```

### Image Optimization
```javascript
// Next.js Image component for optimized loading
import Image from 'next/image';

const Hero = () => (
  <div className="relative">
    <Image
      src="/hero-background.jpg"
      alt="Hero background"
      width={1920}
      height={1080}
      priority
      className="object-cover"
    />
  </div>
);
```

### Bundle Optimization
```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};
```

## Development Guidelines

### Component Structure
```javascript
// Standard component structure
const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState(initialValue);
  
  // 2. Event handlers
  const handleEvent = (e) => {
    // Event handling logic
  };
  
  // 3. Effect hooks
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 4. Render logic
  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;
  
  // 5. JSX return
  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

### File Naming Conventions
- **Pages**: kebab-case (e.g., `role-selection`)
- **Components**: PascalCase (e.g., `OnboardingForm.jsx`)
- **Utilities**: camelCase (e.g., `apiHelpers.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

### Code Organization
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── constants/           # Application constants
└── types/               # TypeScript type definitions (if using TS)
```

## Testing Strategy

### Component Testing
```javascript
// Example test with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import OnboardingForm from '../OnboardingForm';

const MockClerkProvider = ({ children }) => (
  <ClerkProvider publishableKey="pk_test_mock">
    {children}
  </ClerkProvider>
);

describe('OnboardingForm', () => {
  test('renders form fields for vendor role', () => {
    render(
      <MockClerkProvider>
        <OnboardingForm />
      </MockClerkProvider>
    );
    
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gstin/i)).toBeInTheDocument();
  });

  test('validates GSTIN format', () => {
    render(
      <MockClerkProvider>
        <OnboardingForm />
      </MockClerkProvider>
    );
    
    const gstinInput = screen.getByLabelText(/gstin/i);
    fireEvent.change(gstinInput, { target: { value: 'invalid' } });
    fireEvent.blur(gstinInput);
    
    expect(screen.getByText(/gstin must be exactly 15/i)).toBeInTheDocument();
  });
});
```

### E2E Testing
```javascript
// Example Cypress test
describe('User Onboarding Flow', () => {
  it('completes vendor profile successfully', () => {
    cy.visit('/onboarding?role=vendor');
    
    cy.get('[data-testid="business-name"]').type('Test Business');
    cy.get('[data-testid="gstin"]').type('27AAAAA0000A1Z5');
    cy.get('[data-testid="address"]').type('123 Test Street');
    cy.get('[data-testid="city"]').type('Mumbai');
    cy.get('[data-testid="state"]').type('Maharashtra');
    cy.get('[data-testid="pincode"]').type('400001');
    
    cy.get('[data-testid="submit-button"]').click();
    
    cy.url().should('include', '/dashboard/vendor');
  });
});
```

## Deployment

### Build Configuration
```javascript
// next.config.mjs
const nextConfig = {
  output: 'standalone',
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# or use CLI
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_API_URL
```

### Build Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "e2e": "cypress run",
    "e2e:open": "cypress open"
  }
}
```

## Troubleshooting

### Common Issues

#### Hydration Errors
```javascript
// Solution: Use dynamic imports for client-only components
const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
);
```

#### Authentication Issues
```javascript
// Check Clerk configuration
console.log('Clerk Publishable Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
console.log('User:', user);
console.log('Is Loaded:', isLoaded);
console.log('Is Signed In:', isSignedIn);
```

#### Form State Issues
```javascript
// Debug form state
useEffect(() => {
  console.log('Form Data:', formData);
  console.log('User Role:', userRole);
  console.log('Existing Profile:', existingProfile);
}, [formData, userRole, existingProfile]);
```

#### API Integration Issues
```javascript
// Debug API calls
const debugApiCall = async (endpoint, options) => {
  console.log('API Call:', endpoint, options);
  
  try {
    const response = await fetch(endpoint, options);
    console.log('Response Status:', response.status);
    
    const data = await response.json();
    console.log('Response Data:', data);
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

---

*Frontend Documentation Version: 1.0.0*  
*Last Updated: August 3, 2025*
