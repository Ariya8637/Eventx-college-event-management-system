const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' }, // Admin represents Staff
    department: { type: String }, // For students
    year: { type: String } // For students
});

module.exports = mongoose.model('User', userSchema);
