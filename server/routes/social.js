const router = require('express').Router();
const { User } = require('../models/User');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Follow a user
router.post('/follow/:id', auth, async (req, res) => {
    try {
        if (req.user._id === req.params.id) {
            return res.status(400).send({ message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) return res.status(404).send({ message: "User not found" });

        if (!currentUser.following.includes(req.params.id)) {
            await currentUser.updateOne({ $push: { following: req.params.id } });
            await userToFollow.updateOne({ $push: { followers: req.user._id } });
            res.status(200).send({ message: "User followed successfully" });
        } else {
            res.status(403).send({ message: "You already follow this user" });
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Unfollow a user
router.post('/unfollow/:id', auth, async (req, res) => {
    try {
        if (req.user._id === req.params.id) {
            return res.status(400).send({ message: "You cannot unfollow yourself" });
        }

        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToUnfollow) return res.status(404).send({ message: "User not found" });

        if (currentUser.following.includes(req.params.id)) {
            await currentUser.updateOne({ $pull: { following: req.params.id } });
            await userToUnfollow.updateOne({ $pull: { followers: req.user._id } });
            res.status(200).send({ message: "User unfollowed successfully" });
        } else {
            res.status(403).send({ message: "You do not follow this user" });
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Add a comment to an event
router.post('/events/:id/comment', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send({ message: "Event not found" });

        const comment = {
            user: req.user._id,
            text: req.body.text,
            createdAt: new Date()
        };

        event.comments.push(comment);
        await event.save();

        // Populate user details for the new comment to return
        const updatedEvent = await Event.findById(req.params.id).populate('comments.user', 'firstName lastName username');
        const newComment = updatedEvent.comments[updatedEvent.comments.length - 1];

        res.status(201).send(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Delete a comment
router.delete('/events/:eventId/comment/:commentId', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).send({ message: "Event not found" });

        const comment = event.comments.id(req.params.commentId);
        if (!comment) return res.status(404).send({ message: "Comment not found" });

        // Check if user is comment author or event creator
        if (comment.user.toString() !== req.user._id && event.creator.toString() !== req.user._id) {
            return res.status(403).send({ message: "Access denied" });
        }

        comment.deleteOne();
        await event.save();

        res.status(200).send({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
