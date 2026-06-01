const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: Date,
    venue: { type: String, required: true },
    eventType: { type: String, enum: ['Workshop', 'Seminar', 'Cultural'], required: true },
    status: { type: String, enum: ['Draft', 'Upcoming', 'Completed', 'Cancelled'], default: 'Draft' },
    registrationDeadline: Date,
    capacity: { type: Number, default: 0 }, // 0 means unlimited
    fee: { type: Number, default: 0 },
    department: { type: String, default: 'General' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
