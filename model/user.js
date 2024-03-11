import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 6,
        require: true,
    },
    profilePicture: {
        type: String,
        default: null
    },
    preferSongs: {
        type: [
            { type: String, },
            { enum: ['rock', 'peace', 'love', 'bhajan', 'english', 'tamil'] }
        ],

    },
    follower: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    following: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    visited: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
    albumCreation: {
        type: [
            {
                albumImage: {
                    type: String,
                    default: null
                },
                albumName: {
                    type: String,
                },
                uploadedSongs: {
                    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
                },
            }
        ]
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    }
})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
})

userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = async function () {
    return jwt.sign({ _id: this._id }, "ritik123")
}

const User = mongoose.model("User", userSchema);

export default User;