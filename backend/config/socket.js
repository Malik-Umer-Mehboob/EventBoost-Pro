const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room specific to the user
    socket.on('join_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    });

    // Join/leave a room for a specific event (for live attendee counts & updates)
    socket.on('join_event', (eventId) => {
      socket.join(`event_${eventId}`);
    });
    socket.on('leave_event', (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    // Join a role-based room (admin, organizer)
    socket.on('join_role', (role) => {
      socket.join(`role_${role}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Send notification to a specific user via Socket.IO
 * @param {string} userId - Recipient User ID
 * @param {Object} notification - Notification object
 */
const sendSocketNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('new_notification', notification);
  }
};

/**
 * Broadcast an event create/update/delete to ALL connected clients.
 * @param {Object} event - The event object with an `action` field: 'created' | 'updated' | 'deleted'
 */
const broadcastEventUpdate = (event) => {
  if (io) io.emit('event:updated', { event });
};

/**
 * Broadcast live attendee count to everyone inside the event room.
 * @param {string} eventId
 * @param {number} soldTickets
 */
const broadcastAttendeeCount = (eventId, soldTickets) => {
  if (io) io.to(`event_${eventId}`).emit('event:attendee_count', { eventId, soldTickets });
};

/**
 * Broadcast an emergency/announcement alert.
 * @param {Object} payload - { title, message, eventId? }
 * @param {string[]} targetRooms - Optional room names. Empty = platform-wide.
 */
const broadcastEmergencyAlert = (payload, targetRooms = []) => {
  if (!io) return;
  if (targetRooms.length === 0) {
    io.emit('emergency:alert', payload);
  } else {
    targetRooms.forEach(room => io.to(room).emit('emergency:alert', payload));
  }
};

module.exports = {
  initSocket,
  getIO,
  sendSocketNotification,
  broadcastEventUpdate,
  broadcastAttendeeCount,
  broadcastEmergencyAlert
};
