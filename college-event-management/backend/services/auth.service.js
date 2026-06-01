const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.login = async (email, password, role) => {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error('Invalid credentials');
    }
    // Check if the user has the role they are trying to login as
    if (role && user.role !== role) {
        throw new Error(`User is not authorized as ${role}`);
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

exports.register = async (userData) => {
    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    const user = new User({ ...userData, password: hashedPassword });
    return await user.save();
};

exports.getUserById = async (id) => {
    return await User.findById(id).select('-password');
};

exports.updateUser = async (id, updateData) => {
    // Prevent password update through this route for safety, unless specific logic is added
    delete updateData.password;
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
};
