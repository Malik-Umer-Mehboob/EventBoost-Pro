const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { announcementLimiter } = require('../middleware/rateLimiter');
const { getMyEvents, sendAnnouncement, getOrganizerDashboard, getEventAttendees } = require('../controllers/eventController');

// @desc    Get Organizer Analytics Dashboard
// @route   GET /api/organizers/analytics
// @access  Private/Organizer
router.get('/analytics', protect, authorize('organizer'), getOrganizerDashboard);

// @desc    Get Organizer's Events
// @route   GET /api/organizers/events
// @access  Private/Organizer
router.get('/events', protect, authorize('organizer'), getMyEvents);

// @desc    Get attendees for a specific event (paginated)
// @route   GET /api/organizers/events/:id/attendees
// @access  Private/Organizer
router.get('/events/:id/attendees', protect, authorize('organizer'), getEventAttendees);

// @desc    Send Announcement for an Event
// @route   POST /api/organizers/events/:id/announce
// @access  Private/Organizer
router.post('/events/:id/announce', protect, authorize('organizer'), announcementLimiter, sendAnnouncement);

module.exports = router;
