# EventBoost-Pro

EventBoost-Pro is a **full-stack event management and marketing platform** designed to help organizers manage, promote, and sell tickets for their events. The project uses **React** for the frontend, **Node.js/Express** for the backend, and **MongoDB Atlas** as the database.  

The platform includes features such as **Google Authentication**, **JWT login**, **forgot password**, **event reminders via email**, and **payment integration** for event tickets.

---

## 🛠 Features

### User Authentication
- Sign up / Login with Email and Password
- Login with Google (OAuth 2.0)
- JWT-based authentication for secure sessions
- Forgot Password functionality with email reset

### Event Management
- Create, Update, and Delete events (Organizer/Admin)
- Event details include: name, date, time, description, and ticket info
- Organizer dashboard to manage events

### Event Marketing
- Share events on social media
- Automated email reminders to registered users

### Payment Integration
- Pay for event tickets via Stripe or PayPal (configurable)

### Real-time Updates
- Backend powered by Node.js and MongoDB ensures fast and reliable data updates

---

## 🗂 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Shadcn UI + Three.js (for 3D/animations)  
- **Backend:** Node.js + Express.js + Passport.js (Google OAuth) + JWT + Nodemon  
- **Database:** MongoDB Atlas  
- **Other Tools:** Dotenv, CORS, Axios, Nodemailer  

---

## 🔧 Project Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-github-repo-url>
cd eventboost-pro

Backend Setup
cd backend
npm install

Start Backend:
npm run dev


Server runs at http://localhost:5000

Nodemon automatically reloads on code changes

3️⃣ Frontend Setup
cd ../frontend
npm install

Start Frontend:
npm run dev


Frontend runs at http://localhost:5173 (Vite default port)

