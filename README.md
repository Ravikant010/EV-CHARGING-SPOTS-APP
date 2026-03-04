# ⚡ EV Charging Station Booking SaaS

A modern, full-featured EV Charging Station Booking application built with Next.js 16, featuring role-based access control, real-time slot booking, and a beautiful responsive UI.

![EV Charge](https://img.shields.io/badge/EV-Charge-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

---

## 🚀 Features

- **🔐 Authentication** - JWT-based authentication with bcrypt password hashing
- **👥 Role-Based Access** - Three user roles (USER, OWNER, ADMIN) with different permissions
- **🔋 Station Management** - Browse, search, and view charging stations
- **📅 Slot Booking** - Real-time slot availability and instant booking
- **📊 Dashboards** - Personalized dashboards based on user role
- **📬 Contact System** - Submit inquiries and manage support requests
- **📱 Responsive Design** - Beautiful UI that works on all devices
- **🎨 Modern UI** - Built with shadcn/ui and Framer Motion animations

---

## 📋 Table of Contents

- [Demo Credentials](#-demo-credentials)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)

---

## 🔑 Demo Credentials

All accounts use the same password: **`demo123`**

| Role | Email | Access Level |
|------|-------|--------------|
| **Admin** | `admin@evbooking.com` | Full system access - manage users, stations, bookings, contacts |
| **Owner** | `owner@evbooking.com` | Manage own stations, view station bookings |
| **User** | `user@evbooking.com` | Book slots, view own bookings, submit contact requests |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Animations** | Framer Motion |
| **State Management** | Zustand (with persist) |
| **Form Handling** | React Hook Form + Zod |
| **Authentication** | JWT + bcrypt |
| **Data Storage** | In-memory static store (no database) |
| **Runtime** | Bun |

---

## 🏁 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine
- Node.js 18+ (if using npm/yarn/pnpm)

### Installation

1. **Extract the project** (if downloaded as ZIP)
   ```bash
   unzip ev-charging-booking-app.zip
   cd ev-charging-booking-app
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
bun run build
bun run start
```

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── stations/                 # Stations pages
│   │   ├── page.tsx              # Stations list
│   │   └── [id]/                 # Station detail
│   │       └── page.tsx          # Station booking page
│   ├── dashboard/                # Dashboard page
│   │   └── page.tsx              # Role-based dashboard
│   └── api/                      # API routes
│       ├── auth/                 # Authentication endpoints
│       │   ├── login/            # Login
│       │   ├── register/         # Registration
│       │   └── me/               # Current user
│       ├── stations/             # Station endpoints
│       │   ├── route.ts          # List/Create stations
│       │   └── [id]/             # Station details
│       │       ├── route.ts      # Get/Update/Delete station
│       │       └── slots/        # Station slots
│       ├── booking/              # Booking endpoints
│       │   ├── route.ts          # Create/List bookings
│       │   └── [id]/             # Booking operations
│       ├── contact/              # Contact endpoints
│       │   ├── route.ts          # Submit/List contacts
│       │   └── [id]/             # Update contact status
│       ├── dashboard/            # Dashboard stats
│       └── seed/                 # Initialize data
├── components/
│   ├── ev/                       # EV-specific components
│   │   ├── AuthModal.tsx         # Login/Register modal
│   │   ├── ContactModal.tsx      # Contact form modal
│   │   ├── StationCard.tsx       # Station card component
│   │   ├── SlotGrid.tsx          # Slot booking grid
│   │   ├── DashboardCards.tsx    # Dashboard statistics
│   │   ├── HeroSection.tsx       # Home hero section
│   │   └── FeaturesSection.tsx   # Features showcase
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── store.ts                  # Static in-memory data store
│   ├── auth.ts                   # JWT & bcrypt utilities
│   ├── validation.ts             # Zod validation schemas
│   ├── rate-limit.ts             # Rate limiting utility
│   └── utils.ts                  # Helper functions
├── services/                     # Business logic layer
│   ├── station.service.ts        # Station operations
│   ├── booking.service.ts        # Booking operations
│   └── contact.service.ts        # Contact operations
├── actions/                      # Server actions
│   ├── auth.ts                   # Auth server actions
│   ├── stations.ts               # Station actions
│   ├── bookings.ts               # Booking actions
│   ├── contacts.ts               # Contact actions
│   └── dashboard.ts              # Dashboard actions
├── store/
│   └── useAuthStore.ts           # Zustand auth store
└── hooks/                        # Custom React hooks
    ├── use-mobile.ts             # Mobile detection
    └── use-toast.ts              # Toast notifications
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login user |
| `POST` | `/api/auth/register` | Register new user |
| `GET` | `/api/auth/me` | Get current user info |

### Stations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stations` | List all stations |
| `POST` | `/api/stations` | Create station (Owner/Admin) |
| `GET` | `/api/stations/[id]` | Get station details |
| `PUT` | `/api/stations/[id]` | Update station (Owner/Admin) |
| `DELETE` | `/api/stations/[id]` | Delete station (Owner/Admin) |
| `GET` | `/api/stations/[id]/slots` | Get station slots |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/booking` | Get user's bookings |
| `POST` | `/api/booking` | Create booking |
| `DELETE` | `/api/booking/[id]` | Cancel booking |

### Contact

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/contact` | List contacts (Admin) |
| `POST` | `/api/contact` | Submit contact request |
| `PUT` | `/api/contact/[id]` | Update contact status (Admin) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Get dashboard statistics |

---

## 👥 User Roles

### USER
- Browse charging stations
- Book available slots
- View own bookings
- Cancel own bookings
- Submit contact requests

### OWNER
- All USER permissions
- Create and manage stations
- View bookings for own stations
- Create slots for stations

### ADMIN
- All OWNER permissions
- View all users
- View all stations
- View all bookings
- Manage contact requests
- Full system access

---

## 📸 Screenshots

### Home Page
- Hero section with call-to-action
- Feature highlights
- Responsive navigation

### Stations Page
- Grid of charging stations
- Search functionality
- Status indicators

### Station Detail
- Station information
- Available slots by date
- Booking functionality

### Dashboard
- Role-specific statistics
- Booking management
- Quick actions

---

## 🔒 Security Features

- **Password Hashing** - bcrypt with 10 salt rounds
- **JWT Tokens** - 7-day expiration
- **HTTP-Only Cookies** - Secure token storage
- **Rate Limiting** - Protection against brute force
- **Input Validation** - Zod schemas on all inputs
- **Role-Based Access** - Protected routes and actions

---

## 🎨 UI Components

Built with **shadcn/ui** - a collection of beautifully designed components:

- Dialogs & Modals
- Forms & Inputs
- Buttons & Badges
- Cards & Tables
- Toast Notifications
- And more...

---

## 📝 License

This project is for demonstration purposes.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Lucide Icons](https://lucide.dev/)

---

**Built with ❤️ for the EV community**
