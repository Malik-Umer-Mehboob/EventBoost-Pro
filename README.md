# 🎟 EventBoost-Pro

EventBoost-Pro is a **production-ready full-stack event management and ticketing platform** that allows organizers to create events, users to purchase tickets securely, and admins to manage the entire platform.

Built with **React (Frontend)**, **Node.js/Express (Backend)**, and **MongoDB Atlas**, the platform supports real-time notifications, secure payments, automatic refunds, and role-based access control.

---

# 🚀 Core Features

## 👤 Authentication & Authorization

- Email & Password Registration
- Google OAuth 2.0 Login
- JWT-based secure authentication
- Forgot Password (Email Reset Flow)
- Role-Based Access:
  - Admin
  - Organizer
  - User

---

## 🎉 Event Management (Organizer)

- Create / Update / Delete events
- Upload event banner images
- Set ticket price & quantity
- View attendees list
- Send event reminders via email
- Share event via social media

---

## 🛒 Ticket Purchase (User Side)

- Browse & search events
- View event details
- Secure ticket purchase via Stripe
- Automatic ticket generation after payment
- Ticket confirmation email (with PDF)
- View purchased tickets in dashboard
- Download ticket PDF anytime

---

## 💳 Payment Integration

- Stripe Checkout integration
- Secure payment verification
- PaymentIntent stored in database
- Prevent duplicate payments

---

## 💰 Automatic Refund System

If an event is cancelled:

- Admin changes event status to `cancelled`
- System automatically:
  - Finds all purchased tickets
  - Triggers Stripe refund API
  - Updates ticket refund status
  - Sends refund confirmation email to users
- User dashboard shows:
  - Ticket status: Refunded
  - Refund processing notice

---

## 📢 Emergency Broadcast (Real-Time)

Admin can send instant platform-wide alerts:

- Event cancellation notice
- System maintenance warning
- Urgent announcements

Powered by Socket.io for real-time updates.

All connected users receive:
- Instant red alert banner / toast notification

---

## 📊 Dashboards

### 🛡 Admin Dashboard
- Manage users
- Manage organizers
- Cancel events
- View ticket sales
- View revenue statistics
- Send emergency broadcasts

### 🎯 Organizer Dashboard
- Manage own events
- View ticket sales per event
- View attendee list
- Track performance

### 👥 User Dashboard
- View purchased tickets
- Download ticket PDF
- View refund status
- Track event history

---

# 🗂 Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Shadcn UI
- Lucide Icons
- Axios

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Passport.js (Google OAuth)
- Socket.io (Real-Time)
- Stripe API
- Nodemailer

### Dev Tools
- Nodemon
- Dotenv
- CORS

---

# 🔐 Security Features

- Password hashing using bcrypt
- JWT protected routes
- Role-based route protection
- Secure Stripe payment verification
- Environment variable protection
- Admin-only critical actions
- Duplicate refund prevention

---

# 🔧 Project Setup

## 1️⃣ Clone Repository

```bash
git clone <your-github-repo-url>
cd eventboost-pro
