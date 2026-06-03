const mongoose = require('mongoose');

// Sub-schema for individual activities within a day
const ActivitySchema = new mongoose.Schema({
    time: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String }
}, { _id: false }); // Prevents creation of an ID for sub-documents

// Sub-schema for a single day in the itinerary
const DaySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    title: { type: String, required: true },
    // An array of the ActivitySchema documents
    activities: [ActivitySchema] 
}, { _id: false });

// Main Itinerary Schema
const ItinerarySchema = new mongoose.Schema({
    // Name of the country or destination (e.g., "Japan", "Paris").
    name: {
        type: String,
        required: true
    },
    // Short description for the card view.
    description: {
        type: String
    },
    // URL for the main image of the destination.
    image: {
        type: String
    },
    // An array of the DaySchema documents (the core of the plan).
    days: [DaySchema],
    // Optional: timestamp for when the itinerary was created.
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);