# sKrapy

**sKrapy** is a full-stack scrap management platform that bridges the gap between users who want to dispose of their waste and vendors who collect and recycle it. With strong role-based access, real-time order tracking, and dynamic vendor workflows, the system is designed for scalability, modularity, and real-world utility.

---

## 🧭 Features

- 👥 Role-based authentication (User / Vendor)
- 🔐 Secure login/signup using Clerk
- 📦 Order lifecycle: Create → Accept → Start → Pay → Complete
- 🛒 Multi-item cart system for scrap orders
- 🧾 Vendor profile validation with GSTIN
- ⚡ Real-time updates on order status
- 📈 Vendor-side productivity analytics
- 🌐 RESTful API backend with robust validations

---

## 🛠️ Tech Stack

| Layer      | Tech                           |
|------------|--------------------------------|
| Frontend   | Next.js 15, React 19, Tailwind CSS |
| Backend    | Node.js, Express.js, MongoDB, Mongoose |
| Auth       | Clerk (with webhooks)         |
| Database   | MongoDB Atlas with indexing   |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 🔧 Local Development Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas or local MongoDB
- Clerk account
- Git

### 1. Clone the Repository

```
git clone https://github.com/your-org/sKrapy.git
cd sKrapy
```

### 2. Backend Setup

```
cd backend
npm install
cp .env.example .env      # Fill in MongoDB URI & Clerk keys
npm run dev               # Runs on port 3001
```

### 3. Frontend Setup

```
cd frontend
npm install
cp .env.local.example .env.local   # Fill in Clerk publishable key & API URL
npm run dev                        # Runs on port 3000
```

---

## 📐 Project Structure

### Backend
```
backend/
├── models/           # Mongoose schemas (User, Order, ScrapItem)
├── routes/           # API route handlers
├── config/           # MongoDB connection
├── server.js         # Express entry point
└── .env              # Env vars
```

### Frontend (Next.js App Router)
```
frontend/
├── app/              # Pages and layouts
├── components/       # Reusable UI components
├── middleware.js     # Route protection via Clerk
├── tailwind.config.js
└── .env.local        # Env vars
```

---

## ⚙️ Environment Variables

### Backend (`.env`)

```
PORT=3001
MONGODB_URI=your-mongodb-uri
FRONTEND_URL=http://localhost:3000

CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXXXX
```

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXX

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/auth/role-selection
```

---

## 🚦Authentication Flow

1. 🔐 User signs up or logs in via Clerk.
2. 🧭 System redirects to role selection.
3. 📝 User completes profile (if not done).
4. 📊 Redirects to role-based dashboard (User / Vendor)

---

## 📦 API Overview

Backend API runs at `http://localhost:3001/api`

| Endpoint                         | Description                    |
|----------------------------------|--------------------------------|
| `POST /users/clerk-signup`      | Create user from Clerk webhook |
| `GET /onboarding/check-profile` | Check profile completion       |
| `POST /onboarding/complete-profile` | Submit onboarding details |
| `POST /orders/create`           | Create new order               |
| `PUT /orders/:id/accept`        | Vendor accepts order           |
| `PUT /orders/:id/start`         | Start pickup                   |
| `PUT /orders/:id/pay`           | Confirm payment                |
| `PUT /orders/:id/complete`      | Mark as completed              |
| `GET /scrap-items`              | List scrap items               |

🔐 Protected with Clerk JWT Auth and route middleware.

---

## 🧾 Validation Rules

- **User Profile**
  - Must include full address, city, state, pincode
- **Vendor Profile**
  - Additional fields: business name, valid 15-character GSTIN
- **Orders**
  - Items array, pickupDate, and address required
  - Cannot skip order workflow stages

---

## 🚀 Deployment

### Frontend (Vercel)

1. Connect repo to Vercel
2. Set env variables via dashboard
3. Deploy

### Backend (Render)

1. Connect repo to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

**Environment Variables for Render:**
```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
FRONTEND_URL=https://skrapy-gamma.vercel.app
CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXXXX
```

---

## 🛠 Troubleshooting

| Issue                            | Fix                                       |
|----------------------------------|--------------------------------------------|
| "CORS error"                     | Check `FRONTEND_URL` in Render dashboard and CORS config |
| "MongoDB connection failed"      | Verify MONGODB_URI and IP whitelist        |
| "Stuck on onboarding"            | Ensure all required fields are submitted   |
| Order workflow not progressing   | Validate correct order status transitions  |
| Render deployment fails          | Check build logs in Render dashboard       |

More details in the [Docs → Troubleshooting](#troubleshooting)

---

## 📊 Monitoring & Metrics

- **Performance**: APM tools like Datadog / New Relic
- **Error Tracking**: Sentry recommended
- **Logging**: Use Render logs or integrate with external logging services
- **Health**:
  - Backend: `GET /api/health`
  - Frontend: Homepage returns status `200`

---

## 📄 License

GNU - GPL 3.0 © 2025 sKrapy Team

---

### 🤝 Contributing

PRs welcome! Please follow the coding guidelines and submit issues for enhancements or bugs. Refer to inline comments and service architecture for guidance.

---

### 📅 Last Updated

**August 3, 2025**

---
