require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');
const Event = require('./models/event.model');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        console.log('Cleared existing data...');

        // Create Users
        const adminPassword = bcrypt.hashSync('admin123', 10);
        const studentPassword = bcrypt.hashSync('student123', 10);

        const admin = new User({
            name: 'Admin User',
            email: 'admin@college.edu',
            password: adminPassword,
            role: 'admin',
            department: 'Administration'
        });

        const student = new User({
            name: 'John Student',
            email: 'student@college.edu',
            password: studentPassword,
            role: 'student',
            department: 'Computer Science',
            year: '3rd Year'
        });

        await admin.save();
        await student.save();
        console.log('Users created...');

        // Create Events
        const events = [
            {
                title: 'Tech Symposium 2026',
                description: 'Annual technology symposium featuring AI and ML workshops.',
                date: new Date('2026-03-15'),
                venue: 'Main Auditorium',
                eventType: 'Workshop',
                organizer: admin._id
            },
            {
                title: 'Cultural Fest',
                description: 'A day of music, dance, and arts.',
                date: new Date('2026-04-20'),
                venue: 'Open Air Theatre',
                eventType: 'Cultural',
                organizer: admin._id
            }
        ];

        await Event.insertMany(events);
        console.log('Events created...');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
