const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const joi = require('joi')
const passwordComplexity = require('joi-password-complexity')

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    // Enhanced Profile Fields
    bio: { type: String, maxlength: 500, default: '' },
    interests: [{ type: String, maxlength: 50 }],
    profilePicture: { type: String, default: '' }, // base64 or URL
    lookingFor: { type: String, default: '' }, // e.g., "friends", "activity partners"
    favoriteActivities: [{ type: String, maxlength: 50 }],
    availability: { type: String, default: '' }, // e.g., "weekends", "evenings"
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]
})

userSchema.methods.generateAuthToken = function () {
    try {
        if (!process.env.JWTPRIVATEKEY) {
            throw new Error('JWTPRIVATEKEY is not defined');
        }
        const token = jwt.sign(
            {
                _id: this._id,
                email: this.email,
                isAdmin: this.isAdmin,
                firstName: this.firstName,
                lastName: this.lastName
            },
            process.env.JWTPRIVATEKEY,
            { expiresIn: "7d" }
        );
        return token;
    } catch (error) {
        console.error('Token generation error:', error);
        throw error;
    }
}

const User = mongoose.model("users", userSchema)

const validate = (data) => {
    const schema = joi.object({
        firstName: joi.string().required().label("First Name"),
        lastName: joi.string().required().label("Last Name"),
        username: joi.string().required().label("Username"),
        email: joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
        // Optional profile fields
        bio: joi.string().max(500).allow('').optional(),
        interests: joi.array().items(joi.string().max(50)).max(3).optional(),
        profilePicture: joi.string().allow('').optional(),
        lookingFor: joi.string().allow('').optional(),
        favoriteActivities: joi.array().items(joi.string().max(50)).optional(),
        availability: joi.string().allow('').optional(),
    });
    return schema.validate(data);
}


module.exports = { User, validate };