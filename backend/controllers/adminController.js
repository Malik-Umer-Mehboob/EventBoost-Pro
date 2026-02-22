const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');

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

module.exports = {
  createOrganizer,
  getAdminDashboard,
  getAllTransactions
};
