const router = require('express').Router();
const { User, validate } = require('../models/User');
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const auth = require('../middleware/auth');

router.post("/", async (req, res) => {
    try {
        console.log('Received registration request:', {
            ...req.body,
            password: '[HIDDEN]'
        });

        const { error } = validate(req.body);
        if (error) {
            console.log('Validation error:', error.details[0].message);
            return res.status(400).send({ message: error.details[0].message });
        }

        const user = await User.findOne({ email: req.body.email })
        if (user) {
            console.log('Duplicate email found:', req.body.email);
            return res.status(409).send({ message: "User with given email already exists." })
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newUser = await new User({
            ...req.body,
            password: hashPassword,
            verificationToken,
            verificationTokenExpires,
            isVerified: false
        }).save();
        console.log('User created successfully:', {
            id: newUser._id,
            email: newUser.email
        });

        // Create verification URL
        const verificationUrl = `http://localhost:3000/api/users/verify/${verificationToken}`;

        // Instead of sending email, return the verification URL to the client
        res.status(201).send({
            message: "User created successfully. Please verify your email.",
            verificationUrl
        });
    } catch (error) {
        console.error('Server error during registration:', error);
        res.status(500).send({ message: "Internal Server Error", details: error.message })
    }
})

// Add new route for verification
router.get("/verify/:token", async (req, res) => {
    try {
        console.log('Verification attempt for token:', req.params.token);

        const user = await User.findOne({
            verificationToken: req.params.token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('No user found with token or token expired');
            return res.status(400).send({
                message: "Invalid or expired verification token"
            });
        }

        console.log('User found, verifying:', user.email);

        // Update user verification status
        await User.findByIdAndUpdate(user._id, {
            isVerified: true,
            $unset: {
                verificationToken: 1,
                verificationTokenExpires: 1
            }
        });

        console.log('User verified successfully');

        // Updated redirect URL to port 3001
        res.redirect('http://localhost:3001/login?verified=true');
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Add this new route
router.post("/change-password", auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Find user by ID (from auth middleware)
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).send({ message: "Current password is incorrect" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await User.findByIdAndUpdate(req.user._id, { password: hashPassword });

        res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Update user profile (enhanced with new fields)
router.put("/profile", auth, async (req, res) => {
    try {
        const { firstName, lastName, bio, interests, profilePicture, lookingFor, favoriteActivities, availability } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (bio !== undefined) updateData.bio = bio;
        if (interests) updateData.interests = interests;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        if (lookingFor !== undefined) updateData.lookingFor = lookingFor;
        if (favoriteActivities) updateData.favoriteActivities = favoriteActivities;
        if (availability !== undefined) updateData.availability = availability;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password -verificationToken -verificationTokenExpires');

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.send(user);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Get public user profile
router.get("/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password -verificationToken -verificationTokenExpires')
            .populate('friends', 'firstName lastName username profilePicture')
            .populate('friendRequests', 'firstName lastName username profilePicture')
            .populate('sentFriendRequests', 'firstName lastName username profilePicture');

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.send(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Send friend request
router.post("/friend-request/:userId", auth, async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).send({ message: "Cannot send friend request to yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if already friends
        if (targetUser.friends.includes(currentUserId)) {
            return res.status(400).send({ message: "Already friends" });
        }

        // Check if request already sent
        if (targetUser.friendRequests.includes(currentUserId)) {
            return res.status(400).send({ message: "Friend request already sent" });
        }

        // Add to friend requests
        targetUser.friendRequests.push(currentUserId);
        await targetUser.save();

        // Add to sender's sentFriendRequests
        const currentUser = await User.findById(currentUserId);
        if (!currentUser.sentFriendRequests.includes(targetUserId)) {
            currentUser.sentFriendRequests.push(targetUserId);
            await currentUser.save();
        }

        res.send({ message: "Friend request sent" });
    } catch (error) {
        console.error('Friend request error:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Accept friend request
router.post("/accept-friend/:userId", auth, async (req, res) => {
    try {
        const requesterId = req.params.userId;
        const currentUserId = req.user._id;

        const currentUser = await User.findById(currentUserId);
        const requester = await User.findById(requesterId);

        if (!requester) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if friend request exists
        if (!currentUser.friendRequests.includes(requesterId)) {
            return res.status(400).send({ message: "No friend request from this user" });
        }

        // Add to friends list for both users
        currentUser.friends.push(requesterId);
        requester.friends.push(currentUserId);

        // Remove from friend requests
        currentUser.friendRequests = currentUser.friendRequests.filter(
            id => id.toString() !== requesterId
        );

        // Remove from requester's sentFriendRequests
        requester.sentFriendRequests = requester.sentFriendRequests.filter(
            id => id.toString() !== currentUserId.toString()
        );

        await currentUser.save();
        await requester.save();

        res.send({ message: "Friend request accepted" });
    } catch (error) {
        console.error('Accept friend error:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Remove friend
router.delete("/remove-friend/:userId", auth, async (req, res) => {
    try {
        const friendId = req.params.userId;
        const currentUserId = req.user._id;

        const currentUser = await User.findById(currentUserId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).send({ message: "User not found" });
        }

        // Remove from both users' friends lists
        currentUser.friends = currentUser.friends.filter(
            id => id.toString() !== friendId
        );
        friend.friends = friend.friends.filter(
            id => id.toString() !== currentUserId.toString()
        );

        await currentUser.save();
        await friend.save();

        res.send({ message: "Friend removed" });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Get all users (admin only)
router.get("/all", auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).send({ message: "Access denied. Admin only." });
        }

        const users = await User.find({}, '-password -verificationToken -verificationTokenExpires');
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Toggle user properties (admin only)
router.put("/:userId/toggle/:property", auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).send({ message: "Access denied. Admin only." });
        }

        const { userId, property } = req.params;

        // Only allow toggling isAdmin and isDisabled
        if (property !== 'isAdmin' && property !== 'isDisabled') {
            return res.status(400).send({ message: "Invalid property" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Toggle the property
        user[property] = !user[property];
        await user.save();

        res.send({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;