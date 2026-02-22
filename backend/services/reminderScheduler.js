const cron = require('node-cron');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { sendEmail } = require('./emailService');
const { createNotification } = require('./notificationService');

// Run every hour
const startReminderCron = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running reminder check...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setHours(dayAfter.getHours() + 1);

    try {
      // Find events starting in the next 24-25 hours
      const upcomingEvents = await Event.find({
        date: {
          $gte: tomorrow,
          $lt: dayAfter
        }
      });

      for (const event of upcomingEvents) {
        // Find all users who booked this event
        const bookings = await Booking.find({ 
          event: event._id,
          paymentStatus: 'paid' 
        }).populate('user');

        for (const booking of bookings) {
          const user = booking.user;
          if (!user) continue;

          // Send Email Reminder
          await sendEmail({
            to: user.email,
            subject: `Reminder: ${event.title} is Tomorrow!`,
            html: `
              <h1>Event Reminder</h1>
              <p>Hi ${user.name},</p>
              <p>This is a friendly reminder that the event <strong>${event.title}</strong> is happening tomorrow!</p>
              <p>Location: ${event.location}</p>
              <p>Time: ${new Date(event.date).toLocaleString()}</p>
            `,
            type: 'reminder',
            eventId: event._id,
            idempotencyKey: `reminder-email-${event._id}-${user._id}`
          });

          // Send In-App Notification
          await createNotification({
            recipient: user._id,
            type: 'reminder',
            title: 'Event Reminder',
            message: `"${event.title}" is happening tomorrow!`,
            event: event._id,
            idempotencyKey: `reminder-app-${event._id}-${user._id}`
          });
        }
      }
    } catch (error) {
      console.error('Error in reminder cron job:', error);
    }
  });
};

module.exports = { startReminderCron };
