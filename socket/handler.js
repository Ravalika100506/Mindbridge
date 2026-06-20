const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

const onlineUsers = new Map(); // userId -> socketId
const peerRoomCounts = new Map(); // roomId -> Set of socketIds (shared across all connections)

module.exports = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mindbridge_secret');
      socket.userId = decoded.id;
      socket.user = await User.findById(decoded.id).select('name role');
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.user?.name || 'User'} connected`);
    onlineUsers.set(socket.userId, socket.id);
    io.emit('online_count', onlineUsers.size);

    // Join user's personal notification room
    socket.join(`user:${socket.userId}`);

    // Community chat (anonymous)
    socket.on('community:message', (data) => {
      io.emit('community:message', {
        id: Date.now(),
        content: data.content,
        displayName: data.isAnonymous ? 'Anonymous Soul' : socket.user?.name,
        isAnonymous: data.isAnonymous,
        category: data.category || 'general',
        timestamp: new Date()
      });
    });

    // ── Anonymous Peer Chat Rooms ──
    let currentPeerRoom = null;
    socket.on('peer:join', ({ room }) => {
      // Leave previous peer room
      if (currentPeerRoom) {
        socket.leave(`peer:${currentPeerRoom}`);
        if (peerRoomCounts.has(currentPeerRoom)) {
          peerRoomCounts.get(currentPeerRoom).delete(socket.id);
        }
        socket.to(`peer:${currentPeerRoom}`).emit('peer:system', {
          id: `sys-${Date.now()}`,
          content: 'A peer has left the room.',
          timestamp: new Date()
        });
      }
      currentPeerRoom = room;
      socket.join(`peer:${room}`);

      if (!peerRoomCounts.has(room)) peerRoomCounts.set(room, new Set());
      peerRoomCounts.get(room).add(socket.id);

      socket.to(`peer:${room}`).emit('peer:system', {
        id: `sys-${Date.now()}`,
        content: 'A peer has joined the room.',
        timestamp: new Date()
      });

      // Broadcast room counts
      const counts = {};
      peerRoomCounts.forEach((set, r) => { counts[r] = set.size; });
      io.emit('peer:room_counts', counts);
    });

    socket.on('peer:send', (data) => {
      const { content, room, displayName, id } = data;
      if (!content || !room) return;
      // Broadcast to room (excluding sender — sender already added optimistically)
      socket.to(`peer:${room}`).emit('peer:message', {
        id: id || `${Date.now()}-${socket.id}`,
        content: content.substring(0, 500),
        displayName: displayName || 'Anonymous Peer',
        room,
        timestamp: new Date(),
        isMine: false,
        reactions: {}
      });
    });

    socket.on('peer:typing', ({ room, name }) => {
      socket.to(`peer:${room}`).emit('peer:typing', { name: name || 'Someone' });
    });

    socket.on('peer:stop_typing', ({ room }) => {
      socket.to(`peer:${room}`).emit('peer:stop_typing');
    });

    socket.on('peer:react', ({ msgId, reaction, room }) => {
      socket.to(`peer:${room}`).emit('peer:reaction', { msgId, reaction, count: 1 });
    });

    // Legacy peer support typing indicator
    socket.on('typing:start', (room) => {
      socket.to(room).emit('typing:start', { user: 'Someone' });
    });
    socket.on('typing:stop', (room) => {
      socket.to(room).emit('typing:stop');
    });

    // Crisis SOS — alert counselors/admins in real-time
    socket.on('crisis:sos', async () => {
      try {
        const user = await User.findById(socket.userId).select('name university');
        const counselors = await User.find({ role: { $in: ['counselor', 'admin'] }, isActive: true }).select('_id');

        counselors.forEach(c => {
          const csocketId = onlineUsers.get(c._id.toString());
          if (csocketId) {
            io.to(csocketId).emit('crisis:alert', {
              userId: socket.userId,
              userName: user?.name || 'Student',
              university: user?.university || '',
              timestamp: new Date()
            });
          }
        });

        // Create notifications for all counselors
        await Notification.insertMany(counselors.map(c => ({
          user: c._id,
          type: 'crisis_support',
          title: '🚨 SOS Alert',
          message: `${user?.name || 'A student'} pressed the SOS button and needs immediate support`,
          link: '/crisis',
          data: { studentId: socket.userId }
        })));
      } catch (err) {
        console.error('SOS handler error:', err);
      }
    });

    // Real-time notification delivery
    socket.on('notification:send', async (data) => {
      const { targetUserId, notification } = data;
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification:new', notification);
      }
    });

    // Mood check-in reminder broadcast (admin use)
    socket.on('admin:reminder', (msg) => {
      if (socket.user?.role === 'admin') {
        io.emit('reminder:mood', msg);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 ${socket.user?.name || 'User'} disconnected`);
      onlineUsers.delete(socket.userId);
      io.emit('online_count', onlineUsers.size);
      // Clean up peer chat room membership
      if (currentPeerRoom && peerRoomCounts.has(currentPeerRoom)) {
        peerRoomCounts.get(currentPeerRoom).delete(socket.id);
        const counts = {};
        peerRoomCounts.forEach((set, r) => { counts[r] = set.size; });
        io.emit('peer:room_counts', counts);
      }
    });
  });
};
