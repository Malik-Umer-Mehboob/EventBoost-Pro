const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Ticket = require('../models/Ticket');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const { broadcastEmergencyAlert, broadcastEventUpdate } = require('../config/socket');
const { notifyMany, createNotification } = require('../services/notificationService');

// @desc    Create a new Organizer
// @route   POST /api/admin/create-organizer
// @access  Private/Admin
const createOrganizer = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!email.endsWith('@yahoo.com')) {
      return res.status(400).json({ message: 'Organizer email must be a @yahoo.com address' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: 'organizer' });

    if (user) {
      res.status(201).json({ _id: user.id, name: user.name, email: user.email, role: user.role });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Admin Dashboard with analytics
// @route   GET /api/admin/dashboard?from=&to=
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = from && to
      ? { createdAt: { $gte: new Date(from), $lte: new Date(to) } }
      : {};

    const [
      userCount,
      organizerCount,
      eventCount,
      revenueResult,
      ticketsSoldResult,
      recentBookings,
      monthlySales,
      categoryBreakdown
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'organizer' }),
      Event.countDocuments(),

      // Total platform revenue from succeeded transactions
      Transaction.aggregate([
        { $match: { status: 'succeeded', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Total tickets sold from paid bookings
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]),

      // Recent activity feed — latest 10 paid bookings
      Booking.find({ paymentStatus: 'paid', ...dateFilter })
        .sort('-createdAt')
        .limit(10)
        .populate('user', 'name email')
        .populate('event', 'title date')
        .lean(),

      // Monthly revenue trend for last 6 months
      Transaction.aggregate([
        { $match: { status: 'succeeded' } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ]),

      // Tickets sold by event category
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
          $lookup: {
            from: 'events',
            localField: 'event',
            foreignField: '_id',
            as: 'eventDoc'
          }
        },
        { $unwind: '$eventDoc' },
        {
          $group: {
            _id: '$eventDoc.category',
            tickets: { $sum: '$quantity' },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { revenue: -1 } }
      ])
    ]);

    res.status(200).json({
      stats: {
        users: userCount,
        organizers: organizerCount,
        events: eventCount,
        revenue: revenueResult[0]?.total || 0,
        ticketsSold: ticketsSoldResult[0]?.total || 0
      },
      recentBookings,
      monthlySales: monthlySales.map(m => ({
        name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
        revenue: m.revenue,
        bookings: m.count
      })),
      categoryBreakdown
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get All Transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('user', 'name email')
      .populate('event', 'title')
      .sort('-createdAt');
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Emergency / platform broadcast
// @route   POST /api/admin/broadcast
// @access  Private/Admin
const broadcastEmergency = async (req, res) => {
  try {
    const { title, message, eventId, targetRole } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'title and message are required' });
    }

    // Determine target socket rooms
    const rooms = [];
    if (eventId) rooms.push(`event_${eventId}`);
    if (targetRole) rooms.push(`role_${targetRole}`);

    // Broadcast via WebSocket (rooms=[] means platform-wide)
    broadcastEmergencyAlert({ title, message, eventId: eventId || null }, rooms);

    // Also persist as notifications for offline users
    if (eventId) {
      const bookings = await Booking.find({ event: eventId, paymentStatus: 'paid' }).select('user').lean();
      const recipientIds = bookings.map(b => b.user);
      if (recipientIds.length > 0) {
        await notifyMany(recipientIds, {
          type: 'announcement',
          title,
          message,
          event: eventId,
          idempotencyKeyBase: `emergency-${eventId}-${Date.now()}`
        });
      }
    }

    res.json({ message: 'Emergency alert broadcast successfully' });
  } catch (error) {
    console.error('Broadcast emergency error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel an event and refund all tickets
// @route   PUT /api/admin/events/:id/cancel
// @access  Private/Admin
const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'Event is already cancelled' });
    }

    // Update event status
    event.status = 'cancelled';
    await event.save();

    // Find all tickets for this event
    const tickets = await Ticket.find({ event: event._id }).populate('user');

    const refundResults = {
      total: tickets.length,
      refunded: 0,
      failed: 0,
      skipped: 0
    };

    // Group tickets by user to send batch notifications/emails
    const userTicketsMap = new Map();

    for (const ticket of tickets) {
      if (ticket.refundStatus === 'refunded') {
        refundResults.skipped++;
        continue;
      }

      let paymentIntentId = ticket.paymentIntentId;

      // Fallback for older tickets: find payment intent from Transaction
      if (!paymentIntentId) {
        const transaction = await Transaction.findOne({ 
          event: event._id, 
          user: ticket.user._id,
          status: 'succeeded' 
        });
        if (transaction) {
          paymentIntentId = transaction.stripePaymentIntentId;
        }
      }

      if (paymentIntentId) {
        try {
          await stripe.refunds.create({ payment_intent: paymentIntentId });
          
          ticket.refundStatus = 'refunded';
          ticket.isValid = false;
          await ticket.save();
          
          refundResults.refunded++;

          // Track users for notification
          if (!userTicketsMap.has(ticket.user._id.toString())) {
            userTicketsMap.set(ticket.user._id.toString(), {
              user: ticket.user,
              tickets: []
            });
          }
          userTicketsMap.get(ticket.user._id.toString()).tickets.push(ticket);

        } catch (stripeError) {
          console.error(`Refund failed for ticket ${ticket._id}:`, stripeError.message);
          refundResults.failed++;
        }
      } else {
        console.warn(`No payment intent found for ticket ${ticket._id}`);
        refundResults.failed++;
      }
    }

    // Send notifications and emails
    const recipientIds = Array.from(userTicketsMap.keys());
    if (recipientIds.length > 0) {
      await notifyMany(recipientIds, {
        type: 'event_update',
        title: 'Event Cancelled & Refunded',
        message: `The event "${event.title}" has been cancelled. Your refund has been processed.`,
        event: event._id
      });

      // Send emails
      for (const userData of userTicketsMap.values()) {
        try {
          await sendRefundEmail(userData.user, event);
        } catch (emailError) {
          console.error(`Email failed for user ${userData.user.email}:`, emailError.message);
        }
      }
    }

    // Broadcast via socket
    broadcastEventUpdate({ ...event.toObject(), action: 'cancelled' });

    res.json({ 
      message: 'Event cancelled and refunds processed', 
      results: refundResults 
    });

  } catch (error) {
    console.error('Cancel event error:', error);
    res.status(500).json({ message: 'Server error during event cancellation' });
  }
};

// @desc    Edit any event
// @route   PATCH /api/admin/events/:id
// @access  Private/Admin
const adminEditEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Prevent sensitivity issues
    delete updates.createdBy;
    delete updates.organizer;

    const event = await Event.findByIdAndUpdate(id, updates, { 
      returnDocument: 'after', 
      runValidators: true 
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    broadcastEventUpdate({ ...event.toObject(), action: 'updated' });
    res.json(event);
  } catch (error) {
    console.error('Admin edit event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete any event
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
const adminDeleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete banner from Cloudinary if exists
    if (event.bannerImage && event.bannerImage.public_id) {
      try {
        await require('../config/cloudinary').uploader.destroy(event.bannerImage.public_id);
      } catch (e) {
        console.warn('Cloudinary image deletion failed:', e.message);
      }
    }

    await Event.findByIdAndDelete(id);
    broadcastEventUpdate({ _id: id, action: 'deleted' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Admin delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendRefundEmail = async (user, event) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Refund Processed: ${event.title} has been cancelled`,
      text: `Hi ${user.name},\n\nWe're sorry to inform you that the event "${event.title}" has been cancelled.\n\nA full refund for your tickets has been processed via Stripe. Please allow 5-10 business days for the funds to appear in your account.\n\nEvent Details:\nDate: ${new Date(event.date).toLocaleString()}\nLocation: ${event.location}\n\nWe apologize for any inconvenience.\n\nBest regards,\nThe EventBoost Pro Team`,
    });
  } catch (error) {
    console.error('Error sending refund email:', error);
  }
};

module.exports = {
  createOrganizer,
  getAdminDashboard,
  getAllTransactions,
  broadcastEmergency,
  cancelEvent,
  adminEditEvent,
  adminDeleteEvent,
};
