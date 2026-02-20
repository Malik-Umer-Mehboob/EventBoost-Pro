const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get Organizer Dashboard
// @route   GET /api/organizers/dashboard
// @access  Private/Organizer
router.get('/dashboard', protect, authorize('organizer'), (req, res) => {
    res.json({ message: 'Welcome to the Organizer Dashboard' });
});

module.exports = router;
