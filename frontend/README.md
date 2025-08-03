# sKrapy Frontend

This is the frontend application for sKrapy-v2, a scrap management platform built with [Next.js](https://nextjs.org) 15 and React 19.

## Features

- 🔐 **Clerk Authentication** with role-based access control
- 👥 **Dual User Types**: Users (scrap sellers) and Vendors (scrap collectors)
- 📱 **Responsive Design** with Tailwind CSS
- 🎯 **Role-specific Dashboards** and workflows
- 📝 **Dynamic Forms** with validation
- 🔄 **Real-time Updates** for order status

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running (see `/backend` directory)
- Clerk account for authentication

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

### Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Role-based dashboards
│   ├── onboarding/        # Profile completion
│   └── api/               # API route handlers
├── components/            # Reusable UI components
│   ├── AuthWrapper.jsx    # Authentication wrapper
│   ├── OnboardingForm.jsx # Profile completion form
│   └── UserTypeModal.jsx  # Role selection modal
└── middleware.js          # Clerk route protection
```

## Key Components

- **OnboardingForm.jsx**: Handles user and vendor profile completion
- **UserTypeModal.jsx**: Role selection after signup
- **AuthWrapper.jsx**: Protects authenticated routes
- **Dashboard Layouts**: Role-specific interfaces

## Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

### Environment Variables for Production
Set these in your Vercel dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_API_URL` (your backend URL)

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Documentation

For detailed documentation, see:
- [Frontend Documentation.md](./Frontend%20Documentation.md) - Complete frontend guide
- [../Documentation.md](../Documentation.md) - Full project documentation
- [../Setup Guide.md](../Setup%20Guide.md) - Setup instructions
