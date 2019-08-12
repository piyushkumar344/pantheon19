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
        required: true
    },
    instituteCity: {
        type: String,
        required: true
    },
    instituteState: {
        type: String,
        required: true
    },
    instituteId: {
        type: String,
        required: true
    },
    emailOTP: {
        type: Number
    },
    phoneOTP: {
        type: Number
    },
    isVerified: {
        type: Boolean
    },
    hasAllFields: {
        type: Boolean
    },
    pantheonId: {
        type: String
    }
});

const User = mongoose.model('users', userSchema);
module.exports = User;