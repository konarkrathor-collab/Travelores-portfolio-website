const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // User's email address, used as a unique login identifier.
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two users can register with the same email
    },
    // The hashed version of the user's password (NEVER store plain text).
    password: {
        type: String,
        required: true,
    },
    // Optional: timestamp for when the user was created.
    date: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('User', UserSchema);