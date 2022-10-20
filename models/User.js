const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usersSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    userID: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
    },
    phone: {
        type: Number,
        unique: true,
        required: true,
    },
    teamID: {
        type: String,
    }
})

const User = mongoose.model("User", usersSchema);

module.exports = User;