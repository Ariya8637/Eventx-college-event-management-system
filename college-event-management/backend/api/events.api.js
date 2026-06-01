const express = require('express');
const router = express.Router();
const eventService = require('../services/event.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', async (req, res) => {
    try {
        const events = await eventService.getAllEvents();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const event = await eventService.getEventById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const event = await eventService.createEvent({ ...req.body, organizer: req.user.id });
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const event = await eventService.updateEvent(req.params.id, req.body);
        res.json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        await eventService.deleteEvent(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
