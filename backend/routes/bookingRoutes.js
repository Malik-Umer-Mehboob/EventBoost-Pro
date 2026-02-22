const express = require('express');
const router = express.Router();
const { initiateBooking, getMyBookings, stripeWebhook, downloadBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/checkout/:eventId', protect, initiateBooking);
router.get('/my-tickets', protect, getMyBookings);
router.get('/:id/download', protect, downloadBooking);

module.exports = router;
