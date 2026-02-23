const express = require('express');
const router = express.Router();
const { 
  createOrganizer, 
  getAdminDashboard, 
  getAllTransactions, 
  broadcastEmergency, 
  cancelEvent,
  adminEditEvent,
  adminDeleteEvent
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-organizer', protect, authorize('admin'), createOrganizer);
router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);
router.get('/transactions', protect, authorize('admin'), getAllTransactions);
router.post('/broadcast', protect, authorize('admin'), broadcastEmergency);
router.put('/events/:id/cancel', protect, authorize('admin'), cancelEvent);
router.patch('/events/:id', protect, authorize('admin'), adminEditEvent);
router.delete('/events/:id', protect, authorize('admin'), adminDeleteEvent);

module.exports = router;
