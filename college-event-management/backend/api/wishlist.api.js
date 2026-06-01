const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishlist.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Add event to wishlist
router.post('/add', authenticate, async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.id; // From auth token

        // Check if already in wishlist
        const existing = await Wishlist.findOne({ user: userId, event: eventId });
        if (existing) {
            return res.status(400).json({ message: 'Event already in wishlist' });
        }

        const wishlistItem = new Wishlist({ user: userId, event: eventId });
        await wishlistItem.save();

        res.status(201).json({ message: 'Event added to wishlist', data: wishlistItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's wishlist
router.get('/:userId', authenticate, async (req, res) => {
    try {
        // Security check: Ensure requesting user matches the param ID (or is admin)
        // Note: For simplicity and standard practice, it's often better to just use req.user.id 
        // regardless of param, but following the spec:
        if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access to this wishlist' });
        }

        const wishlist = await Wishlist.find({ user: req.params.userId })
            .populate('event') // Populate full event details
            .sort({ createdAt: -1 });

        res.json(wishlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove from wishlist by Event ID
router.delete('/:eventId', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await Wishlist.findOneAndDelete({ user: userId, event: req.params.eventId });

        if (!result) {
            // Also try deleting by the Wishlist ID just in case the frontend sends that
            // But per spec, it says "Remove bookmark" usually implies by Event context in UI
            // Let's stick to Event ID as requested "DELETE /api/wishlist/:eventId"
            return res.status(404).json({ message: 'Event not found in wishlist' });
        }

        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
