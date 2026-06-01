const express = require('express');
const router = express.Router();
const registrationService = require('../services/registration.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/mark', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { registrationId, status } = req.body; // status: 'Attended', 'Absent'
        const registration = await registrationService.updateAttendance(registrationId, status);
        res.json(registration);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
