const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Helper to send email with manual retry logic
 */
const sendWithRetry = async (details, maxRetries = 3) => {
  const { to, subject, html, type, eventId, idempotencyKey } = details;
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      const info = await transporter.sendMail({
        from: `"EventBoostPro" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });

      // Log success
      await EmailLog.findOneAndUpdate(
        { idempotencyKey: idempotencyKey || `${type}-${to}-${Date.now()}` },
        { 
          status: 'sent', 
          lastAttempt: new Date(), 
          retryCount: attempt,
          recipientEmail: to,
          subject,
          type,
          event: eventId
        },
        { upsert: true, new: true }
      );

      return { success: true, messageId: info.messageId };
    } catch (error) {
      attempt++;
      lastError = error;
      console.error(`Email attempt ${attempt} failed for ${to}:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Log final failure
  await EmailLog.findOneAndUpdate(
    { idempotencyKey: idempotencyKey || `${type}-${to}-${Date.now()}` },
    { 
      status: 'failed', 
      error: lastError.message, 
      lastAttempt: new Date(), 
      retryCount: attempt - 1,
      recipientEmail: to,
      subject,
      type,
      event: eventId
    },
    { upsert: true, new: true }
  );

  return { success: false, error: lastError.message };
};

const sendEmail = async (details) => {
  // Fire and forget processing to return response quickly
  sendWithRetry(details).catch(err => console.error('Background send failure:', err));
  return { success: true, message: 'Processing email' };
};

const sendBatchEmails = async (recipients, details) => {
  const results = await Promise.allSettled(
    recipients.map(to => sendWithRetry({ ...details, to }))
  );
  
  const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  return { total: recipients.length, sent };
};

module.exports = {
  sendEmail,
  sendBatchEmails
};
