const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is not defined. Using fallback secret.');
}

// Connect to Database
connectDB();

const app = express();

// Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Keep flexible for Socket.io and media content loading
  crossOriginEmbedderPolicy: false
}));

// Improved CORS Config
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '5mb' })); // Changed from 50mb to prevent DDoS
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// Serve local upload fallbacks statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// General Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again after 15 minutes.' }
});

// Strict Rate Limiting for Public Submissions
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 form submissions per hour
  message: { message: 'Too many submissions, please try again after an hour.' }
});

// Apply rate limits on specific routes
app.use('/api/auth/login', generalLimiter);
app.use('/api/auth/register', generalLimiter);
app.use('/api/donations/create-order', formLimiter);
app.use('/api/contact', formLimiter);

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

  // Request viewers to re-handshake with admin
  socket.on('request-viewers-handshake', () => {
    socket.to('live-room').emit('request-viewers-handshake');
  });

  // Handle viewer starting WebRTC handshaking
  socket.on('viewer-join-stream', () => {
    console.log(`📡 Viewer ${socket.id} requested WebRTC stream. Relaying to admin...`);
    socket.to('live-room').emit('viewer-joined-stream', { socketId: socket.id });
    if (adminSocketId && adminSocketId !== socket.id) {
      io.to(adminSocketId).emit('viewer-joined-stream', { socketId: socket.id });
    }
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
