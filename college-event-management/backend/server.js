require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./api/auth.api');
const eventRoutes = require('./api/events.api');
const registrationRoutes = require('./api/registrations.api');
const attendanceRoutes = require('./api/attendance.api');
const wishlistRoutes = require('./api/wishlist.api');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB (Mocked for now or use ENV)
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
