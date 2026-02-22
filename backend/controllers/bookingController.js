const Booking = require('../models/Booking');
const Event = require('../models/Event');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const qrcode = require('qrcode');
const Ticket = require('../models/Ticket');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const { createNotification } = require('../services/notificationService');

const initiateBooking = async (req, res) => {
  try {
    const { quantity } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Authorization Check
    if (req.user.role === 'admin') {
      return res.status(400).json({ message: 'Admins cannot purchase tickets' });
    }
    
    if (event.organizer.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Organizers cannot purchase tickets for their own events' });
    }

    if (event.soldTickets + quantity > event.ticketQuantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: event.title, description: event.description },
          unit_amount: event.ticketPrice * 100,
        },
        quantity,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/events/${event._id}?canceled=true`,
      customer_email: req.user.email,
      metadata: { eventId: event._id.toString(), userId: req.user.id.toString(), quantity: quantity.toString() },
    });
    await Booking.create({ user: req.user.id, event: event._id, quantity, totalAmount: event.ticketPrice * quantity, stripeSessionId: session.id, paymentStatus: 'pending' });
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error initiating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const Transaction = require('../models/Transaction');

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let stripeEvent;

  console.log('🔔 Stripe Webhook received!');

  try {
    stripeEvent = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook Signature Verified. Event Type:', stripeEvent.type);
  } catch (err) {
    console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    console.log('📦 Processing checkout.session.completed for Session ID:', session.id);
    const { eventId, userId, quantity } = session.metadata;

    try {
      const booking = await Booking.findOne({ stripeSessionId: session.id }).populate('user event');
      
      if (!booking) {
        console.warn('⚠️ Booking not found for Session ID:', session.id);
      } else if (booking.paymentStatus === 'paid') {
        console.log('ℹ️ Booking already marked as paid:', booking._id);
      } else {
        console.log('💰 Updating booking to "paid":', booking._id);
        booking.paymentStatus = 'paid';
        
        // Generate a single QR code for the booking
        booking.qrCode = await qrcode.toDataURL(JSON.stringify({ 
          bookingId: booking._id, 
          eventId, 
          userId 
        }));
        await booking.save();
        console.log('✅ Booking updated and QR generated');

        // Create Transaction record
        await Transaction.create({
          user: userId,
          booking: booking._id,
          event: eventId,
          amount: booking.totalAmount,
          status: 'succeeded',
          type: 'payment',
          stripePaymentIntentId: session.payment_intent,
          stripeSessionId: session.id,
          paymentMethod: session.payment_method_types[0],
          metadata: session.metadata
        });

        // Update event sold count
        const event = await Event.findByIdAndUpdate(eventId, { 
          $inc: { soldTickets: parseInt(quantity) } 
        }, { returnDocument: 'after' });
        console.log(`📈 Event "${event.title}" sold count updated: ${event.soldTickets}/${event.ticketQuantity}`);

        // Create individual tickets
        console.log(`🎟 Creating ${quantity} tickets...`);
        const tickets = [];
        for (let i = 0; i < parseInt(quantity); i++) {
          const ticketNumber = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
          const ticket = await Ticket.create({
            user: userId,
            event: eventId,
            paymentId: session.id,
            amount: booking.totalAmount / quantity,
            ticketNumber,
            qrCode: booking.qrCode
          });
          tickets.push(ticket);
        }
        console.log('✅ Tickets created successfully');

        // Send Email with PDF
        console.log('📧 Sending confirmation email...');
        await sendTicketEmail(booking.user, event, tickets);
        console.log('✅ Email sent');

        // Send In-App Notification
        await createNotification({
          recipient: userId,
          type: 'ticket_confirmation',
          title: 'Ticket Confirmed!',
          message: `Your ticket for "${event.title}" has been confirmed.`,
          link: `/tickets/${booking._id}`,
          event: eventId
        });
      }
    } catch (error) {
      console.error('❌ Error processing webhook success:', error);
    }
  } else if (stripeEvent.type === 'charge.refunded') {
    const charge = stripeEvent.data.object;
    console.log('🔄 Processing charge.refunded for Payment Intent:', charge.payment_intent);

    try {
      // Find and update Transaction
      const transaction = await Transaction.findOneAndUpdate(
        { stripePaymentIntentId: charge.payment_intent },
        { status: 'refunded' },
        { new: true }
      );

      if (transaction) {
        // Update Booking
        const booking = await Booking.findByIdAndUpdate(transaction.booking, { 
          refundStatus: 'completed',
          paymentStatus: 'failed' // Or a new status like 'refunded'
        });

        // Invalidate Tickets
        await Ticket.updateMany(
          { paymentId: transaction.stripeSessionId },
          { isValid: false }
        );

        // Notify user
        await createNotification({
          recipient: transaction.user,
          type: 'event_update',
          title: 'Refund Processed',
          message: `Your refund for the event has been processed successfully.`,
          event: transaction.event
        });

        console.log('✅ Refund processed in database');
      }
    } catch (error) {
      console.error('❌ Error processing refund webhook:', error);
    }
  }

  res.status(200).json({ received: true });
};

const sendTicketEmail = async (user, event, tickets) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', async () => {
        const pdfData = Buffer.concat(buffers);
        
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Ticket Confirmation 🎟 - EventBoost Pro',
            text: `Hi ${user.name},\n\nThank you for your purchase! Attached is your ticket for ${event.title}.\n\nEvent Details:\nDate: ${new Date(event.date).toLocaleString()}\nLocation: ${event.location}\n\nWe look forward to seeing you there!`,
            attachments: [
              {
                filename: `tickets-${event.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
                content: pdfData,
              },
            ],
          });
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      // PDF Content
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
    });
  } catch (error) {
    console.error('Error sending ticket email:', error);
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('event').sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const downloadBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event user');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking record not found' });
    }

    // Check ownership
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: You do not own this booking' });
    }

    // Check payment status
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ 
        message: `Payment is ${booking.paymentStatus}. Tickets are only available after successful payment.` 
      });
    }

    // Fetch all tickets associated with this booking via Stripe Session ID
    // This is the most reliable link between a Booking and its Tickets
    const tickets = await Ticket.find({ 
      paymentId: booking.stripeSessionId
    }).populate('event user');

    if (tickets.length === 0) {
      console.error(`Tickets missing for booking ${booking._id} (Session: ${booking.stripeSessionId})`);
      return res.status(404).json({ 
        message: 'Ticket records not found for this booking. Please contact support if you were charged.' 
      });
    }

    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tickets-${booking.event.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    
    doc.pipe(res);

    // PDF Global Header
    doc.fontSize(24).text('EVENT TICKETS', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(booking.event.title, { align: 'center' });
    doc.fontSize(12).text(`${new Date(booking.event.date).toLocaleString()} | ${booking.event.location}`, { align: 'center' });
    doc.moveDown();
    doc.text('--------------------------------------------------', { align: 'center' });
    doc.moveDown();

    tickets.forEach((ticket, index) => {
      if (index > 0) doc.addPage();
      
      doc.fontSize(24).text('EVENT TICKET', { align: 'center' });
      doc.moveDown();
      doc.fontSize(18).text(booking.event.title, { align: 'center' });
      doc.fontSize(12).text(`${new Date(booking.event.date).toLocaleString()} | ${booking.event.location}`, { align: 'center' });
      doc.moveDown();
      doc.text('--------------------------------------------------', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(16).text(`Ticket ${index + 1} of ${tickets.length}`, { align: 'center' });
      doc.fontSize(12).text(`Ticket Number: ${ticket.ticketNumber}`, { align: 'center' });
      doc.moveDown();
      doc.text(`Attendee: ${booking.user.name}`, { align: 'center' });
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
    console.error('Error in downloadBooking:', error);
    res.status(500).json({ message: 'Server error during PDF generation' });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('event', 'title date location')
      .sort('-createdAt');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const refundBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization: User can request refund for own booking, admin can always
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Only paid bookings can be refunded' });
    }

    if (booking.refundStatus === 'requested' || booking.refundStatus === 'completed') {
      return res.status(400).json({ message: 'Refund already requested or completed' });
    }

    // Find the associated transaction to get the payment intent
    const transaction = await Transaction.findOne({ booking: booking._id, status: 'succeeded' });

    if (!transaction || !transaction.stripePaymentIntentId) {
      return res.status(400).json({ message: 'Stripe transaction not found' });
    }

    // Communicate with Stripe to process refund
    const refund = await stripe.refunds.create({
      payment_intent: transaction.stripePaymentIntentId,
    });

    // Update booking status
    booking.refundStatus = 'requested';
    await booking.save();

    res.json({ message: 'Refund request initiated', refundId: refund.id });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: error.message || 'Server error during refund' });
  }
};

// @desc    Get User Dashboard — upcoming/past split with spend summary
// @route   GET /api/bookings/my-dashboard
// @access  Private
const getMyDashboard = async (req, res) => {
  try {
    const now = new Date();
    const bookings = await Booking.find({ user: req.user.id, paymentStatus: 'paid' })
      .populate('event', 'title date location bannerImage ticketPrice category')
      .sort('-createdAt')
      .lean();

    const upcoming = bookings.filter(b => b.event && new Date(b.event.date) >= now);
    const past = bookings.filter(b => b.event && new Date(b.event.date) < now);
    const totalSpend = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    res.json({ upcoming, past, totalSpend, totalBookings: bookings.length });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { initiateBooking, stripeWebhook, getMyBookings, downloadBooking, getMyTransactions, refundBooking, getMyDashboard };
