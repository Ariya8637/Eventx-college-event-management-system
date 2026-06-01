const Registration = require('../models/registration.model');
const Event = require('../models/event.model');

exports.registerForEvent = async (userId, eventId) => {
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    // Check duplicate
    const existing = await Registration.findOne({ student: userId, event: eventId });
    if (existing) throw new Error('Already registered for this event');

    const registration = new Registration({
        student: userId,
        event: eventId,
        status: 'registered'
    });
    return await registration.save();
};

exports.getRegistrationsForStudent = async (userId) => {
    return await Registration.find({ student: userId }).populate('event');
};

exports.getRegistrationsForEvent = async (eventId) => {
    return await Registration.find({ event: eventId }).populate('student', 'name email department year');
};

exports.updateAttendance = async (registrationId, status) => {
    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error('Registration not found');

    registration.status = status;
    return await registration.save();
};
