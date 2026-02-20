const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Create a new Organizer
// @route   POST /api/admin/create-organizer
// @access  Private/Admin
const createOrganizer = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate Yahoo Email
    if (!email.endsWith('@yahoo.com')) {
      return res.status(400).json({ message: 'Organizer email must be a @yahoo.com address' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'organizer',
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
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

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
    try {
        const userCount = await User.countDocuments({ role: 'user' });
        const organizerCount = await User.countDocuments({ role: 'organizer' });
        
        res.status(200).json({
            message: 'Welcome via Admin Dashboard',
            stats: {
                users: userCount,
                organizers: organizerCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
  createOrganizer,
  getAdminDashboard
};
