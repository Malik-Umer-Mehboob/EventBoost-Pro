# EventBoost-Pro

**EventBoost-Pro** is a production-ready full-stack event management and ticketing platform that enables organizers to create events, users to purchase tickets securely, and admins to manage the entire platform efficiently.

Built using **React** (Frontend), **Node.js/Express** (Backend), and **MongoDB Atlas**, the platform includes real-time alerts, secure payments, automatic refunds, email reminders, profile management, advanced event lifecycle control, role-based access control, advanced search & filters, event waitlist system, and reviews & ratings.

---

## 🚀 Core Features

---

### 👤 Authentication & Authorization
- Email & Password Registration
- Google OAuth 2.0 Login
- JWT-based secure authentication
- Forgot Password (Email Reset Flow)
- Role-Based Access: **Admin**, **Organizer**, **User**
- Middleware-based role verification
- Organizer ownership validation for event actions

---

### 🧑‍💻 User & Organizer Profile Management

**User Profile**
- View and update personal information (Name, Email, Profile picture)
- View purchased tickets and event history
- Receive email reminders for upcoming events
- Manage notification preferences
- View refund status for cancelled events

**Organizer Profile**
- Update organizer information (Name, Email, Profile picture / Logo)
- Manage events dashboard: Create / Update / Delete events
- Upload event banners
- Set ticket price & quantity
- Send manual or automated email reminders
- Track attendee list and ticket sales
- Cancel own events (with auto refund system)
- View organizer-specific statistics

---

### 🎉 Advanced Event Management System

**Structured Event Lifecycle**

| Status | Description |
|---|---|
| `draft` | Event saved but not submitted |
| `pending` | Submitted, awaiting admin approval |
| `active` | Approved and visible to users |
| `cancelled` | Cancelled by admin or organizer |
| `resubmitted` | Organizer updated a cancelled event |

**Event Flow Logic**
- Organizer creates event → `pending`
- Admin approves event → `active`
- Admin cancels event → `cancelled`
- Organizer updates cancelled event → `resubmitted`
- Admin re-approves → `active`

This prevents direct reactivation of cancelled events, duplicate event recreation, inconsistent dashboard states, and unauthorized status manipulation.

---

### 🔍 Advanced Search & Filter System *(New)*

- **Search** events by name or description (debounced, real-time)
- **Category Filter**: Music, Tech, Food, Sports, Art, Education, Business, Health, Other
- **City Filter**: Filter events by location
- **Price Range**: Min and Max price filter
- **Date Range**: Filter by start and end date
- **Sort Options**: Newest, Oldest, Price Low→High, Price High→Low, Date Soonest
- **Clear All Filters** button to reset
- Results count display: *"24 events found"*
- Mobile responsive — filters collapse on small screens
- URL query param sync for shareable filtered links

---

### 🎟️ Event Waitlist System *(New)*

- Users can join a waitlist when an event is **sold out**
- Waitlist position displayed: *"You are #3 on the waitlist"*
- When a ticket is cancelled or refunded, the **next person on the waitlist is automatically notified**
- Notified user gets **24 hours** to complete the purchase
- If time expires, the next person in queue is notified automatically
- Users can **leave the waitlist** at any time
- Dedicated **Waitlist tab** in User Dashboard

**Waitlist Status Types:** `waiting` → `notified` → `converted` / `expired`

**Email Notifications:**
- Waitlist confirmation with queue position
- Spot available alert with purchase link
- Expiry notification if purchase window missed

---

### ⭐ Reviews & Ratings System *(New)*

- Only **verified ticket holders** can leave a review (after event date)
- **1–5 star rating** with written comment (max 500 characters)
- One review per user per event
- **Rating summary** on event page:
  - Average rating with star display
  - Total reviews count
  - Rating breakdown bars (5★ to 1★ percentages)
- **Verified Attendee** badge on each review
- Event cards show average rating: ⭐ 4.3 (128)
- Organizer profile shows overall average rating across all events
- Users can edit or delete their own reviews
- Admin can delete any review

---

### 🛒 Ticket Purchase (User Side)
- Browse & search events
- View detailed event information
- Secure ticket purchase via Stripe
- Automatic ticket creation after successful payment
- Ticket confirmation email (with PDF attachment)
- View purchased tickets in dashboard
- Download ticket PDF anytime
- Modern digital ticket UI with QR code design

---

### 💳 Payment & Refund System

**Secure Payment Integration**
- Stripe Checkout integration
- PaymentIntent stored in database
- Secure payment verification
- Prevent duplicate ticket generation
- Transaction-safe payment confirmation

**Automatic Refund System (Admin & Organizer)**

If an event is cancelled, the system automatically:
- Finds all purchased tickets
- Triggers Stripe Refund API
- Updates booking payment status to `refunded`
- Prevents double refunds
- Sends refund confirmation email
- Sends real-time cancellation notification
- User dashboard shows refund status instantly

---

### 📢 Notifications & Email Reminders

**Email System**
- Automatic reminder before event date (24 hours before)
- Organizer can manually trigger reminder emails
- Refund confirmation emails
- Event cancellation emails
- Event approval notifications
- Waitlist confirmation, spot available, and expiry emails *(New)*
- Includes event name, date & time, location, and ticket number

**In-App Notifications**

Notifications created when:
- Ticket purchased
- Event updated
- Event cancelled
- Refund processed
- Event resubmitted
- Admin approves event
- Waitlist spot becomes available *(New)*

Features: stored in database, read/unread tracking, role-based filtering, real-time via Socket.io

---

### 🚨 Emergency Broadcast (Real-Time)
- Admin can send instant alerts for event cancellations, security alerts, and maintenance announcements
- Users join event-specific Socket.io rooms
- Targeted broadcast to specific event attendees
- Real-time alert banner and toast/modal UI
- Prevents unnecessary global broadcasts

---

### 📊 Dashboards

**🛡 Admin Dashboard**
- Manage users & organizers
- Approve / Reject events
- Cancel events & trigger automatic refunds
- Send emergency broadcasts
- View revenue statistics and ticket sales overview
- Monitor event lifecycle states

**🎯 Organizer Dashboard**
- Create / Update / Delete / Cancel own events
- View ticket sales and attendees
- Send event reminders
- Update organizer profile
- Track event status (pending / active / cancelled / resubmitted)

**👥 User Dashboard**
- View purchased tickets & download PDF
- View refund status
- View notification history
- Update personal profile
- Track event participation
- Manage waitlist entries *(New)*
- View and manage own reviews *(New)*
- Real-time event cancellation alerts

---

## 🗂 Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Shadcn UI
- Three.js
- Lucide Icons
- Axios
- Socket.io Client

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Passport.js (Google OAuth)
- Socket.io (Room-Based Real-Time)
- Stripe API
- Nodemailer

**Dev Tools**
- Nodemon
- Dotenv
- CORS

---

## 🔐 Security Features
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

## 🔧 Project Setup

### 1️⃣ Clone Repository
```bash
git clone <your-github-repo-url>
cd eventboost-pro
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in `/backend`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/eventboost?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start backend:
```bash
npx nodemon
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open in browser: `http://localhost:5173`

---

## 📁 Project Structure

```
eventboost-pro/
├── backend/
│   ├── config/          # DB, Passport, Socket config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & role middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Email, cron schedulers
│   ├── utils/           # Helper functions
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Helper functions
│   └── index.html
└── README.md
```

---

## 🌐 Live Demo

[https://event-boost-pro.vercel.app](https://event-boost-pro.vercel.app)

---

*Built with ❤️ — EventBoost-Pro © 2025*
