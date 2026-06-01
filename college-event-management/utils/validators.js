exports.validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

exports.validateEvent = (event) => {
    return event.title && event.date && event.location;
};
