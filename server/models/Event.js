const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true },
    emoji: { type: String, default: '📅' },
    address: { type: String },
    time: { type: Date, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    participantsLimit: { type: Number },
    createdAt: { type: Date, default: Date.now },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
