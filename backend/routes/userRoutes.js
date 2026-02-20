const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get User Dashboard
// @route   GET /api/users/dashboard
// @access  Private/User
router.get('/dashboard', protect, authorize('user'), (req, res) => {
    res.json({ message: 'Welcome to the User Dashboard' });
});

module.exports = router;
