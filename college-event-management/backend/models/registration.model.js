const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'registered' }
});

module.exports = mongoose.model('Registration', registrationSchema);
