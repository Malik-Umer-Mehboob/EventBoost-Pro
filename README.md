# 🎟 EventBoost-Pro

EventBoost-Pro is a **production-ready full-stack event management and ticketing platform** that enables organizers to create events, users to purchase tickets securely, and admins to manage the entire platform efficiently.

Built using **React (Frontend)**, **Node.js/Express (Backend)**, and **MongoDB Atlas**, the platform includes real-time alerts, secure payments, automatic refunds, email reminders, profile management, advanced event lifecycle control, and role-based access control.

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
- Middleware-based role verification
- Organizer ownership validation for event actions

---

## 🧑‍💻 User & Organizer Profile Management

### User Profile
- View and update personal information:
  - Name
  - Email
  - Profile picture
- View purchased tickets and event history
- Receive email reminders for upcoming events
- Manage notification preferences
- View refund status for cancelled events

### Organizer Profile
- Update organizer information:
  - Name
  - Email
  - Profile picture / Logo
- Manage events dashboard:
  - Create / Update / Delete events
  - Upload event banners
  - Set ticket price & quantity
  - Send manual or automated email reminders
  - Track attendee list and ticket sales
  - Cancel own events (with auto refund system)
- View organizer-specific statistics

---

## 🎉 Advanced Event Management System

### Structured Event Lifecycle

The platform now includes a controlled event status workflow:

Event Status Types:
- `draft`
- `pending`
- `active`
- `cancelled`
- `resubmitted`

### Event Flow Logic

- Organizer creates event → `pending`
- Admin approves event → `active`
- Admin cancels event → `cancelled`
- Organizer updates cancelled event → `resubmitted`
- Admin re-approves → `active`

This prevents:
- Direct reactivation of cancelled events
- Duplicate event recreation
- Inconsistent dashboard states
- Unauthorized status manipulation

---

## 🛒 Ticket Purchase (User Side)

- Browse & search events
- View detailed event information
- Secure ticket purchase via Stripe
- Automatic ticket creation after successful payment
- Ticket confirmation email (with PDF attachment)
- View purchased tickets in dashboard
- Download ticket PDF anytime
- Modern digital ticket UI with QR code design

---

## 💳 Payment & Refund System

### Secure Payment Integration
- Stripe Checkout integration
- PaymentIntent stored in database
- Secure payment verification
- Prevent duplicate ticket generation
- Transaction-safe payment confirmation

### Automatic Refund System (Admin & Organizer)

If an event is cancelled:

- Admin or Organizer changes event status to `cancelled`
- System automatically:
  - Finds all purchased tickets
  - Triggers Stripe Refund API
  - Updates booking payment status to `refunded`
  - Prevents double refunds
  - Sends refund confirmation email
  - Sends real-time cancellation notification
- User dashboard shows refund status instantly

---

## 📢 Notifications & Email Reminders

### 📧 Email System

- Automatic reminder before event date (e.g., 24 hours before event)
- Organizer can manually trigger reminder emails
- Refund confirmation emails
- Event cancellation emails
- Event approval notifications
- Includes event details in email:
  - Event name
  - Date & time
  - Location
  - Ticket number

### 🔔 In-App Notifications

Notification created when:
- Ticket purchased
- Event updated
- Event cancelled
- Refund processed
- Event resubmitted
- Admin approves event

Features:
- Notifications stored in database
- Read / Unread tracking
- Role-based notification filtering
- Users can view notification history
- Real-time notification using Socket.io

---

## 🚨 Emergency Broadcast (Real-Time)

Admin can send instant alerts:

- Event cancellation
- Security alerts
- Maintenance announcements

Enhanced Socket.io Architecture:

- Users join event-specific rooms:
  event_<eventId>
- Targeted broadcast to specific event attendees
- Real-time alert banner display
- Toast / modal warning UI
- Prevents unnecessary global broadcasts

---

# 📊 Dashboards

## 🛡 Admin Dashboard
- Manage users & organizers
- Approve / Reject events
- Cancel events
- Trigger automatic refunds
- Send emergency broadcasts
- View revenue statistics
- View ticket sales overview
- Monitor event lifecycle states

## 🎯 Organizer Dashboard
- Manage own events
- Create / Update / Delete events
- Cancel own events (auto refund enabled)
- View ticket sales
- View attendees
- Send event reminders
- Update organizer profile
- Track event status (pending / active / cancelled / resubmitted)

## 👥 User Dashboard
- View purchased tickets
- Download ticket PDF
- View refund status
- View notification history
- Update personal profile
- Track event participation
- Real-time event cancellation alerts

---

# 🗂 Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Shadcn UI
- Three.js
- Lucide Icons
- Axios
- Socket.io Client

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Passport.js (Google OAuth)
- Socket.io (Room-Based Real-Time System)
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
- Organizer ownership validation
- Secure Stripe payment verification
- Automatic refund protection
- Duplicate event prevention
- Protected event status transitions
- Environment variables for sensitive data
- Admin-only critical actions

---

# 🔧 Project Setup

## 1️⃣ Clone Repository

```bash
git clone <your-github-repo-url>
cd eventboost-pro
