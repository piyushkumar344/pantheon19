const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamMemberSchema = new Schema({
    pantheonId: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const eventRegisteredSchema = new Schema({
    eventId: {
        type: Number,
        required: true
    },
    eventName: {
        type: String,
        // required: true
    }
});

const teamSchema = new Schema({
    teamName: {
        type: String,
        required: true
    },
    teamId: {
        type: Number,
        required: true
    },
    teamSize: {
        type: Number,
        required: true
    },
    teamMembers: {
        type: [teamMemberSchema],
        default: []
    },
    eventsRegistered: {
        type: [eventRegisteredSchema],
        default: []
    },
    points: {
        type: Number,
        default: 0
    },
    leaderId: {
        type: String,
        required: true
    },
    teamVerified: {
        type: Boolean,
        default: false
    },
    dummy1: {
        type: String,
        defaut: null
    },
    dummy2: {
        type: String,
        default: null
    }
});

const Team = mongoose.model('teams', teamSchema);
module.exports = Team;