const express = require('express');
const router = express.Router();
const registrationService = require('../services/registration.service');
const Registration = require('../models/registration.model'); // Direct model access for quick count or use service
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Get Stats (Admin only)
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
    try {
        const count = await Registration.countDocuments();
        res.json({ totalRegistrations: count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Register for an event
router.post('/', authenticate, async (req, res) => {
    try {
        const { eventId } = req.body;
        const registration = await registrationService.registerForEvent(req.user.id, eventId);
        res.status(201).json(registration);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get my registrations
router.get('/my-registrations', authenticate, async (req, res) => {
    try {
        const registrations = await registrationService.getRegistrationsForStudent(req.user.id);
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get participants for an event (Admin only)
router.get('/event/:eventId', authenticate, authorize('admin'), async (req, res) => {
    try {
        const participants = await registrationService.getRegistrationsForEvent(req.params.eventId);
        res.json(participants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
