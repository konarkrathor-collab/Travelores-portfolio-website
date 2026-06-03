const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    // Name of the person submitting the form.
    name: {
        type: String,
        required: true
    },
    // Email of the person submitting the form.
    email: {
        type: String,
        required: true
    },
    // The message or inquiry text.
    message: {
        type: String,
        required: true
    },
    // Optional: timestamp for when the message was received.
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', ContactSchema);