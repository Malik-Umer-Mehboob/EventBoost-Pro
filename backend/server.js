const express = require('express');
const dotenv = require('dotenv');

// Load config first
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const http = require('http');
const { initSocket } = require('./config/socket');
const { startReminderCron } = require('./services/reminderScheduler');

// Passport config
require('./config/passport');

// Connect Database
connectDB();

// Start Cron Jobs
startReminderCron();

// Seed Admin User
const seedAdmin = require('./scripts/seedAdmin');
seedAdmin();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors());

// Dedicated Stripe Webhook Route (MUST be before express.json)
const { stripeWebhook } = require('./controllers/bookingController');
app.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Initialize Passport
app.use(passport.initialize());

// Health Check
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const mongoStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
  
  const status = (mongoStatus === 'up') ? 200 : 503;
  
  res.status(status).json({
    status: status === 200 ? 'healthy' : 'unhealthy',
    timestamp: new Date(),
    services: {
      database: mongoStatus
    }
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/organizers', require('./routes/organizerRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
