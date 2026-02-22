const Event = require('../models/Event');
const { notifyMany } = require('../services/notificationService');
const { sendBatchEmails } = require('../services/emailService');
const User = require('../models/User'); // Need to fetch emails for batch sending

const CATEGORIES = [
  'Conference',
  'Workshop',
  'Seminar',
  'Party',
  'Concert',
  'Exhibition',
  'Sports',
  'Others',
];

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer only)
const createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      location, 
      category, 
      ticketPrice, 
      ticketQuantity, 
      bannerImage, 
      isFeatured 
    } = req.body;

    // Validate category
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      ticketPrice,
      ticketQuantity,
      bannerImage,
      isFeatured,
      organizer: req.user.id,
      createdBy: req.user.id,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error in createEvent:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private (Admin only)
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('organizer createdBy', 'name email');
    res.json(events);
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get organizer's events
// @route   GET /api/events/my-events
// @access  Private (Organizer only)
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      $or: [{ organizer: req.user.id }, { createdBy: req.user.id }] 
    }).populate('organizer createdBy', 'name email');
    res.json(events);
  } catch (error) {
    console.error('Error in getMyEvents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get public events (all users)
// @route   GET /api/events/public
// @access  Private
const getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('organizer createdBy', 'name');
    res.json(events);
  } catch (error) {
    console.error('Error in getPublicEvents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
const updateEvent = async (req, res) => {
  try {
    const { category } = req.body;

    // Validate category if provided
    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership or admin status
    // Safe check: Admins can update any event. Organizers can update only theirs.
    const organizerId = event.organizer || event.createdBy;
    const isOwner = organizerId && organizerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    res.json(updatedEvent);

    // Notify registered attendees if there are any
    if (updatedEvent.attendees && updatedEvent.attendees.length > 0) {
      const attendees = await User.find({ _id: { $in: updatedEvent.attendees } });
      const attendeeEmails = attendees.map(u => u.email);

      // Send Batch Emails
      await sendBatchEmails(attendeeEmails, {
        subject: `Update: ${updatedEvent.title} has been updated`,
        html: `
          <h1>Event Updated</h1>
          <p>Hi,</p>
          <p>The event <strong>${updatedEvent.title}</strong> has been updated. Please check the new details.</p>
          <a href="${process.env.FRONTEND_URL}/events/${updatedEvent._id}">View Event Details</a>
        `,
        type: 'event_update',
        eventId: updatedEvent._id
      });

      // Send In-App Notifications
      await notifyMany(updatedEvent.attendees, {
        type: 'event_update',
        title: 'Event Update',
        message: `"${updatedEvent.title}" has been updated.`,
        link: `/events/${updatedEvent._id}`,
        event: updatedEvent._id
      });
    }
  } catch (error) {
    console.error('Error in updateEvent:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership or admin status
    // Safe check: Admins can delete any event. Organizers can delete only theirs.
    const organizerId = event.organizer || event.createdBy;
    const isOwner = organizerId && organizerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Notify registered attendees before deletion
    if (event.attendees && event.attendees.length > 0) {
      const attendees = await User.find({ _id: { $in: event.attendees } });
      const attendeeEmails = attendees.map(u => u.email);

      await sendBatchEmails(attendeeEmails, {
        subject: `Cancellation: ${event.title} has been cancelled`,
        html: `
          <h1>Event Cancelled</h1>
          <p>Hi,</p>
          <p>We regret to inform you that the event <strong>${event.title}</strong> has been cancelled by the organizer.</p>
          <p>If you purchased a ticket, a refund will be processed shortly.</p>
        `,
        type: 'event_update',
        eventId: event._id
      });

      await notifyMany(event.attendees, {
        type: 'event_update',
        title: 'Event Cancelled',
        message: `"${event.title}" has been cancelled.`,
        event: event._id
      });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (User only)
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user already registered
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.json({ message: 'Successfully registered' });
  } catch (error) {
    console.error('Error in registerForEvent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error in getEventById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get event categories
// @route   GET /api/events/categories
// @access  Public
const getCategories = (req, res) => {
  res.json(CATEGORIES);
};

const sendAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!event.attendees || event.attendees.length === 0) {
      return res.status(400).json({ message: 'No registered attendees to notify' });
    }

    const attendees = await User.find({ _id: { $in: event.attendees } });
    const attendeeEmails = attendees.map(u => u.email);

    // Send Batch Emails
    await sendBatchEmails(attendeeEmails, {
      subject: `Announcement: ${event.title}`,
      html: `
        <h1>New Announcement</h1>
        <p>Hi,</p>
        <p>The organizer of <strong>${event.title}</strong> has sent a new announcement:</p>
        <div style="padding: 15px; background: #f4f4f4; border-radius: 5px;">
          <h3>${title}</h3>
          <p>${message}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/events/${event._id}">View Event</a>
      `,
      type: 'announcement',
      eventId: event._id
    });

    // Send In-App Notifications
    await notifyMany(event.attendees, {
      type: 'announcement',
      title: `Announcement: ${title}`,
      message,
      link: `/events/${event._id}`,
      event: event._id,
      sender: req.user.id
    });

    res.json({ message: 'Announcement sent to all attendees' });
  } catch (error) {
    console.error('Error in sendAnnouncement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Organizer Dashboard with analytics
// @route   GET /api/organizers/analytics
// @access  Private/Organizer
const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const getOrganizerDashboard = async (req, res) => {
  try {
    const organizerId = new mongoose.Types.ObjectId(req.user.id);

    const [events, monthlySales] = await Promise.all([
      Event.find({ organizer: organizerId }).sort('-date').lean(),

      // Monthly registration trend for this organizer's events (last 6 months)
      require('../models/Booking').aggregate([
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
          $match: {
            'eventDoc.organizer': organizerId,
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            registrations: { $sum: '$quantity' },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ])
    ]);

    const totalRevenue = events.reduce((a, e) => a + ((e.soldTickets || 0) * (e.ticketPrice || 0)), 0);
    const totalSold = events.reduce((a, e) => a + (e.soldTickets || 0), 0);

    res.json({
      stats: {
        totalEvents: events.length,
        totalSold,
        totalRevenue,
        upcomingEvents: events.filter(e => new Date(e.date) >= new Date()).length
      },
      events,
      monthlySales: monthlySales.map(m => ({
        name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
        registrations: m.registrations,
        revenue: m.revenue
      }))
    });
  } catch (error) {
    console.error('Organizer dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get paginated attendees for a specific event
// @route   GET /api/organizers/events/:id/attendees?page=&limit=
// @access  Private/Organizer
const getEventAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, search = '' } = req.query;

    // Ensure organizer owns this event
    const event = await Event.findOne({ _id: id, organizer: req.user.id });
    if (!event) {
      return res.status(403).json({ message: 'Access denied or event not found' });
    }

    const BookingModel = require('../models/Booking');
    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      BookingModel.find({ event: id, paymentStatus: 'paid' })
        .populate('user', 'name email createdAt')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      BookingModel.countDocuments({ event: id, paymentStatus: 'paid' })
    ]);

    const attendees = bookings
      .filter(b => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
          b.user?.name?.toLowerCase().includes(term) ||
          b.user?.email?.toLowerCase().includes(term)
        );
      })
      .map(b => ({
        bookingId: b._id,
        name: b.user?.name || 'Unknown',
        email: b.user?.email || '',
        tickets: b.quantity,
        totalPaid: b.totalAmount,
        bookedAt: b.createdAt
      }));

    res.json({ attendees, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('Attendees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getMyEvents,
  getPublicEvents,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventById,
  getCategories,
  sendAnnouncement,
  getOrganizerDashboard,
  getEventAttendees,
};
