const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user"
    },
    address: {
        type: String
    },
    pin: {
        type: Number
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    otp: {
        type: Number
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

module.exports = User