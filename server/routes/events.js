const router = require('express').Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('creator', 'firstName lastName username')
            .populate('participants', 'firstName lastName username');
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new event
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, type, emoji, address, time, location, participantsLimit } = req.body;

        const newEvent = new Event({
            title,
            description,
            type,
            emoji,
            address,
            time,
            location,
            participantsLimit,
            creator: req.user._id,
            participants: [req.user._id] // Creator automatically joins
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Join event
router.post('/:id/join', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.participants.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already joined this event' });
        }

        if (event.participantsLimit && event.participants.length >= event.participantsLimit) {
            return res.status(400).json({ message: 'Event is full' });
        }

        event.participants.push(req.user._id);
        await event.save();

        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Leave event
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is actually a participant
        if (!event.participants.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are not a participant of this event' });
        }

        // Creator cannot leave their own event (optional rule, but good for consistency)
        if (event.creator.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Creator cannot leave the event. Delete it instead.' });
        }

        event.participants = event.participants.filter(
            p => p.toString() !== req.user._id.toString()
        );

        await event.save();

        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
