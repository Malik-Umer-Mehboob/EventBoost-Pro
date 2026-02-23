# 🎟 EventBoost-Pro

EventBoost-Pro is a **production-ready full-stack event management and ticketing platform** that enables organizers to create events, users to purchase tickets securely, and admins to manage the entire platform efficiently.

Built using **React (Frontend)**, **Node.js/Express (Backend)**, and **MongoDB Atlas**, the platform includes real-time alerts, secure payments, automatic refunds, email reminders, and role-based access control.

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
- Send manual email reminders to registered users
- Share event via social media

---

## 🛒 Ticket Purchase (User Side)

- Browse & search events
- View detailed event information
- Secure ticket purchase via Stripe
- Automatic ticket creation after successful payment
- Ticket confirmation email (with PDF attachment)
- View purchased tickets in dashboard
- Download ticket PDF anytime

---

## 💳 Payment & Refund System

### Secure Payment Integration
- Stripe Checkout integration
- PaymentIntent stored in database
- Secure payment verification
- Prevent duplicate ticket generation

### Automatic Refund System
If an event is cancelled:
- Admin changes event status to `cancelled`
- System automatically:
  - Finds all purchased tickets
  - Triggers Stripe refund API
  - Updates ticket refund status
  - Sends refund confirmation email
- User dashboard shows refund status

---

## 📢 Notifications & Email Reminders

### 📧 Email Reminders
- Automatic reminder before event date (e.g., 24 hours before event)
- Organizer can manually trigger reminder emails
- Includes event details in email:
  - Event name
  - Date & time
  - Location
  - Ticket number

### 🔔 In-App Notifications
- Notification created when:
  - Ticket purchased
  - Event updated
  - Event cancelled
  - Refund processed
- Notifications stored in database
- Users can view notification history in dashboard
- Real-time notification using Socket.io

---

## 🚨 Emergency Broadcast (Real-Time)

Admin can send instant platform-wide alerts:

- Event cancellation
- Security alerts
- Maintenance announcements

Powered by Socket.io:
- All connected users receive real-time alert banner
- Red warning toast / modal display

---

# 📊 Dashboards

## 🛡 Admin Dashboard
- Manage users & organizers
- Cancel events
- Trigger refunds
- Send emergency broadcasts
- View revenue statistics
- View ticket sales overview

## 🎯 Organizer Dashboard
- Manage own events
- View ticket sales
- View attendees
- Send event reminders

## 👥 User Dashboard
- View purchased tickets
- Download ticket PDF
- View refund status
- View notification history
- Track event participation

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
- Nodemailer (Email System)

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
- Automatic refund protection
- Environment variables for sensitive data
- Admin-only critical actions


---

# 🔧 Project Setup

## 1️⃣ Clone Repository

```bash
git clone <your-github-repo-url>
cd eventboost-pro
