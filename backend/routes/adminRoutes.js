const express = require('express');
const router = express.Router();
const { createOrganizer, getAdminDashboard } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-organizer', protect, authorize('admin'), createOrganizer);
router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
