const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const PDFDocument = require('pdfkit');

// @desc    Get user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate('event', 'title date location')
      .sort('-createdAt');
    res.json(tickets);
  } catch (error) {
    console.error('Error in getMyTickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download ticket PDF
// @route   GET /api/tickets/:id/download
// @access  Private
const downloadTicket = async (req, res) => {
  try {
    let tickets = [];
    let event = null;
    let user = null;

    // 1. Try to find a single Ticket
    const singleTicket = await Ticket.findById(req.params.id).populate('event user');
    
    if (singleTicket) {
      // Authorization Check
      if (singleTicket.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      tickets = [singleTicket];
      event = singleTicket.event;
      user = singleTicket.user;
    } else {
      // 2. Try to find a Booking
      const booking = await Booking.findById(req.params.id).populate('event user');
      if (!booking) {
        return res.status(404).json({ message: 'Ticket or Booking not found' });
      }

      // Authorization Check
      if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Fetch all tickets associated with this booking
      tickets = await Ticket.find({ 
        user: booking.user._id, 
        event: booking.event._id,
        paymentId: booking.stripeSessionId
      });
      
      event = booking.event;
      user = booking.user;
    }

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found for this booking' });
    }

    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tickets-${event.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    
    doc.pipe(res);

    // PDF Global Header
    doc.fontSize(24).text('EVENT TICKETS', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(event.title, { align: 'center' });
    doc.fontSize(12).text(`${new Date(event.date).toLocaleString()} | ${event.location}`, { align: 'center' });
    doc.moveDown();
    doc.text('--------------------------------------------------', { align: 'center' });
    doc.moveDown();

    tickets.forEach((ticket, index) => {
      if (index > 0) doc.addPage();
      
      doc.fontSize(24).text('EVENT TICKET', { align: 'center' });
      doc.moveDown();
      doc.fontSize(18).text(event.title, { align: 'center' });
      doc.fontSize(12).text(`${new Date(event.date).toLocaleString()} | ${event.location}`, { align: 'center' });
      doc.moveDown();
      doc.text('--------------------------------------------------', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(16).text(`Ticket ${index + 1} of ${tickets.length}`, { align: 'center' });
      doc.fontSize(12).text(`Ticket Number: ${ticket.ticketNumber}`, { align: 'center' });
      doc.moveDown();
      doc.text(`Attendee: ${user.name}`, { align: 'center' });
      doc.moveDown();
      
      if (ticket.qrCode) {
        const base64Data = ticket.qrCode.split(',')[1];
        if (base64Data) {
          doc.image(Buffer.from(base64Data, 'base64'), {
            fit: [150, 150],
            align: 'center'
          });
        }
      }
      
      doc.moveDown();
      doc.text('Present this ticket at the entrance.', { align: 'center' });
    });

    doc.end();
  } catch (error) {
    console.error('Error in downloadTicket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyTickets,
  downloadTicket
};
