const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc    Update user profile picture
// @route   POST /api/users/profile/picture
// @access  Private
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const user = await User.findById(req.user.id);
    
    // Delete old image from Cloudinary if it exists
    if (user.profilePicture && user.profilePicture.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }

    // Multer-storage-cloudinary automatically uploads and provides the path/filename
    user.profilePicture = {
      url: req.file.path,
      public_id: req.file.filename
    };

    await user.save();

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile (extended info)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
  updateProfilePicture,
  getUserProfile
};
