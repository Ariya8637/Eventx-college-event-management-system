import api from './api.service';

const getAllEvents = async () => {
    return await api.get('/events');
};

const getEventById = async (id) => {
    return await api.get(`/events/${id}`);
};

const createEvent = async (eventData) => {
    return await api.post('/events', eventData);
};

const updateEvent = async (id, eventData) => {
    return await api.put(`/events/${id}`, eventData);
};

const deleteEvent = async (id) => {
    return await api.delete(`/events/${id}`);
};

const registerForEvent = async (eventId) => {
    return await api.post('/registrations', { eventId });
};

const getMyRegistrations = async () => {
    return await api.get('/registrations/my-registrations');
};

const getEventParticipants = async (eventId) => {
    return await api.get(`/registrations/event/${eventId}`);
};

const markAttendance = async (registrationId, status) => {
    return await api.post('/attendance/mark', { registrationId, status });
};

const getStats = async () => {
    return await api.get('/registrations/stats');
};

const addToWishlist = async (eventId) => {
    return await api.post('/wishlist/add', { eventId });
};

const getWishlist = async (userId) => {
    return await api.get(`/wishlist/${userId}`);
};

const removeFromWishlist = async (eventId) => {
    return await api.delete(`/wishlist/${eventId}`);
};

export default {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    getMyRegistrations,
    getEventParticipants,
    markAttendance,
    getStats,
    addToWishlist,
    getWishlist,
    removeFromWishlist
};
