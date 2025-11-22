const router = require('express').Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('creator', 'firstName lastName username profilePicture')
            .populate('participants', 'firstName lastName username profilePicture')
            .populate('comments.user', 'firstName lastName username profilePicture');
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
            participantsLimit,
            creator: req.user._id,
            participants: [] // Creator does not automatically join
        });

        const savedEvent = await newEvent.save();
        await savedEvent.populate('creator', 'firstName lastName username profilePicture');
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
        event.participants.push(req.user._id);
        await event.save();
        await event.populate('creator', 'firstName lastName username profilePicture');

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
        await event.populate('creator', 'firstName lastName username profilePicture');

        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update event
router.put('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is creator
        if (event.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        const { title, description, type, emoji, address, time, location, participantsLimit } = req.body;

        // Update fields
        event.title = title || event.title;
        event.description = description || event.description;
        event.type = type || event.type;
        event.emoji = emoji || event.emoji;
        event.address = address || event.address;
        event.time = time || event.time;
        event.location = location || event.location;
        event.participantsLimit = participantsLimit || event.participantsLimit;

        const updatedEvent = await event.save();
        await updatedEvent.populate('creator', 'firstName lastName username profilePicture');
        res.json(updatedEvent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is creator
        if (event.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
