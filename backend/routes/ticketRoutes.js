const express = require('express');
const router = express.Router();
const { getMyTickets } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-tickets', protect, getMyTickets);

module.exports = router;
