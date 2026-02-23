const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { updateProfilePicture, getUserProfile, updateProfile } = require('../controllers/userController');

// @desc    Update User Profile (name/email)
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @desc    Get User Profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @desc    Update Profile Picture
// @route   POST /api/users/profile/picture
// @access  Private
router.post('/profile/picture', protect, upload.single('profilePicture'), updateProfilePicture);

// @desc    Get User Dashboard
// @route   GET /api/users/dashboard
// @access  Private/User
router.get('/dashboard', protect, authorize('user'), (req, res) => {
    res.json({ message: 'Welcome to the User Dashboard' });
});

module.exports = router;
