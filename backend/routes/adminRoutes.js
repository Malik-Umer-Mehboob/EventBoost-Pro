const express = require('express');
const router = express.Router();
const { createOrganizer, getAdminDashboard, getAllTransactions } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-organizer', protect, authorize('admin'), createOrganizer);
router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);
router.get('/transactions', protect, authorize('admin'), getAllTransactions);

module.exports = router;
