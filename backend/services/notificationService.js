const Notification = require('../models/Notification');
const { sendSocketNotification } = require('../config/socket');

/**
 * Create a notification and send it via WebSockets
 * @param {Object} data - { recipient, sender, type, title, message, link, event }
 */
const createNotification = async (data) => {
  try {
    const { idempotencyKey } = data;
    
    // Check if notification with this idempotency key already exists
    if (idempotencyKey) {
      const existing = await Notification.findOne({ idempotencyKey });
      if (existing) return existing;
    }

    const notification = await Notification.create(data);
    
    // Send real-time update
    sendSocketNotification(data.recipient, notification);
    
    return notification;
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return Notification.findOne({ idempotencyKey: data.idempotencyKey });
    }
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Send notification to multiple recipients
 * @param {Array} recipientIds
 * @param {Object} data - { sender, type, title, message, link, event }
 */
const notifyMany = async (recipientIds, data) => {
  try {
    const { idempotencyKeyBase, ...rest } = data;
    
    const notifications = recipientIds.map((id, index) => ({
      ...rest,
      recipient: id,
      idempotencyKey: idempotencyKeyBase ? `${idempotencyKeyBase}-${id}` : undefined
    }));
    
    const savedNotifications = await Notification.insertMany(notifications, { ordered: false });
    
    // Send socket updates to each
    savedNotifications.forEach(n => {
      sendSocketNotification(n.recipient, n);
    });
    
    return savedNotifications;
  } catch (error) {
    if (error.code === 11000) {
      // Some failed due to duplicate, we can ignore or fetch existing
      return Notification.find({ recipient: { $in: recipientIds }, ...rest });
    }
    console.error('Error sending batch notifications:', error);
    return [];
  }
};

module.exports = {
  createNotification,
  notifyMany
};
