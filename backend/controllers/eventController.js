const Event = require('../models/Event');

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
};
