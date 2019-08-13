const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNo: {
        type: Number
    },
    instituteName: {
        type: String,
        // required: true
    },
    instituteCity: {
        type: String,
        // required: true
    },
    instituteState: {
        type: String,
        // required: true
    },
    instituteId: {
        type: String,
        // required: true
    },
    emailOTP: {
        type: String
    },
    phoneOTP: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    pantheonId: {
        type: String
    }
});

const User = mongoose.model('users', userSchema);
module.exports = User;