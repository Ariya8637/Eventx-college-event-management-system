const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    createdAt: { type: Date, default: Date.now }
});

// Ensure a user can only wishllist an event once
wishlistSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
