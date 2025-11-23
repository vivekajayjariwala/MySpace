require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require("cors")
const config = require('./config/config');

const userRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')
const eventRoutes = require('./routes/events')
const socialRoutes = require('./routes/social')

// middlewares
app.use(express.json({ limit: '10mb' })); // Increased limit for profile pictures
app.use(cors({
    origin: config.cors.origin
}));

// routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/ai', require('./routes/ai'));

// Serving frontend code
const path = require('path');
app.use(express.static(path.join(__dirname, '../third-spaces-client/build')));

// Import environment variables
const MONGOURL = process.env.MONGOURL;

// Establish connection to MongoDB database using mongoose
mongoose.connect(MONGOURL)
    .then(() => console.log('Database connection established!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Setup logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../third-spaces-client/build', 'index.html'));
});

// Attach error handler middleware after all routes
app.use(errorHandler);

// Listen on specified port
app.listen(config.server.port, () => {
    console.log(`Listening on port ${config.server.port}`);
});