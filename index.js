const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Changed from 50mb to prevent DDoS
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/events', require('./routes/events'));
app.use('/api/news', require('./routes/news'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/carousel', require('./routes/carousel'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/trust-management', require('./routes/trustManagement'));
app.use('/api/site-content', require('./routes/siteContent'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/live', require('./routes/live'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/reviews', require('./routes/reviews'));

// Welcome Route
app.get('/', (req, res) => res.send('🕉️ Shree Manvat Baba Mahashiv Mandir Trust API is Running...'));

// Error Handler Middleware (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Wrap express app with http server for socket.io
const http = require('http');
const { Server } = require('socket.io');
const LiveChatMessage = require('./models/LiveChatMessage');
const LiveStream = require('./models/LiveStream');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let adminSocketId = null;

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join the live stream room
  socket.on('join-live', (data) => {
    socket.join('live-room');
    const isAdmin = !!(data && data.isAdmin);
    console.log(`👤 Socket ${socket.id} joined live-room (isAdmin: ${isAdmin})`);

    if (isAdmin) {
      adminSocketId = socket.id;
      console.log(`🔑 Admin socket registered: ${adminSocketId}`);
    } else {
      // It's a viewer. Request the current playback time from admin if admin is connected.
      if (adminSocketId) {
        console.log(`📡 Requesting current playback time from admin ${adminSocketId} for viewer ${socket.id}`);
        io.to(adminSocketId).emit('request-current-time', { requesterId: socket.id });
      }
    }

    // Calculate viewer count and broadcast
    const room = io.sockets.adapter.rooms.get('live-room');
    const viewerCount = room ? room.size : 0;
    io.to('live-room').emit('viewer-count', viewerCount);
  });

  // Leave room manually or disconnect
  socket.on('leave-live', () => {
    socket.leave('live-room');
    const room = io.sockets.adapter.rooms.get('live-room');
    const viewerCount = room ? room.size : 0;
    io.to('live-room').emit('viewer-count', viewerCount);
  });

  // Broadcast WebRTC stream activation to viewers
  socket.on('stream-active', (data) => {
    socket.to('live-room').emit('stream-active', data);
  });

  // Handle viewer starting WebRTC handshaking
  socket.on('viewer-join-stream', () => {
    // Notify the host/broadcaster that a new viewer wants to connect
    socket.to('live-room').emit('viewer-joined-stream', { socketId: socket.id });
  });

  // WebRTC Signal forwarding: Host sends Offer to Viewer
  socket.on('send-offer', ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit('receive-offer', { offer, senderSocketId: socket.id });
  });

  // WebRTC Signal forwarding: Viewer sends Answer to Host
  socket.on('send-answer', ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit('receive-answer', { answer, senderSocketId: socket.id });
  });

  // WebRTC Signal forwarding: relay ICE candidates between Host and Viewers
  socket.on('send-ice-candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('receive-ice-candidate', { candidate, senderSocketId: socket.id });
  });

  // Playback state relay (synchronize pause/play between Admin and Viewers)
  socket.on('playback-state-change', async (data) => {
    console.log(`📡 Playback state change from admin: isPaused = ${data.isPaused}, currentTime = ${data.currentTime}s`);
    socket.to('live-room').emit('playback-state-change', data);
    try {
      await LiveStream.updateOne({}, { isPaused: !!data.isPaused });
    } catch (err) {
      console.error('Error saving playback pause state to DB:', err);
    }
  });

  // Admin responds with their current playback timing
  socket.on('send-current-time', ({ requesterId, currentTime }) => {
    console.log(`📡 Forwarding current playback time (${currentTime}s) to viewer ${requesterId}`);
    io.to(requesterId).emit('sync-current-time', { currentTime });
  });

  // Handle Chat Message
  socket.on('send-chat-message', async (data) => {
    try {
      const chatMsg = new LiveChatMessage({
        username: data.username,
        message: data.message,
        isAdmin: data.isAdmin || false
      });
      await chatMsg.save();
      
      // Broadcast new message to all clients in live-room
      io.to('live-room').emit('new-chat-message', chatMsg);
    } catch (err) {
      console.error('Error saving chat message:', err);
    }
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    if (socket.id === adminSocketId) {
      adminSocketId = null;
      console.log('🔑 Admin socket unregistered due to disconnect');
    }
    const room = io.sockets.adapter.rooms.get('live-room');
    const viewerCount = room ? room.size : 0;
    io.to('live-room').emit('viewer-count', viewerCount);
    
    // Notify other peers in case WebRTC connection was active
    socket.to('live-room').emit('peer-disconnected', socket.id);
  });
});

server.listen(PORT, () => console.log(`🛰️ Server broadcasting on port ${PORT}`));
