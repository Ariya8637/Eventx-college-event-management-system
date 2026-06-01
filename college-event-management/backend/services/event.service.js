const Event = require('../models/event.model');

exports.getAllEvents = async () => {
    return await Event.find().populate('organizer', 'name');
};

exports.getEventById = async (id) => {
    return await Event.findById(id).populate('organizer', 'name');
};

exports.createEvent = async (eventData) => {
    const event = new Event(eventData);
    return await event.save();
};

exports.updateEvent = async (id, eventData) => {
    return await Event.findByIdAndUpdate(id, eventData, { new: true });
};

exports.deleteEvent = async (id) => {
    return await Event.findByIdAndDelete(id);
};
