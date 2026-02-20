const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer only)
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      createdBy: req.user.id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private (Admin only)
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('createdBy', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get organizer's events
// @route   GET /api/events/my-events
// @access  Private (Organizer only)
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get public events (all users)
// @route   GET /api/events/public
// @access  Private
const getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('createdBy', 'name');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership or admin status
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedEvent);
  } catch (error) {
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
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
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
};
