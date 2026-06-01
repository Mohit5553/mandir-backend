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
app.use(express.json({ limit: '10mb' })); // Increased limit for Base64 images
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/events', require('./routes/events'));
app.use('/api/news', require('./routes/news'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/contact', require('./routes/contact'));

// Welcome Route
app.get('/', (req, res) => res.send('🕉️ Shree Manvat Baba Mahashiv Mandir Trust API is Running...'));

// Error Handler Middleware (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🛰️ Server broadcasting on port ${PORT}`));
