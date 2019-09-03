const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamIdCounterSchema = new Schema({
    find: {
        type: String,
        default: 'teamId'
    },
    count: {
        type: Number,
        default: 1900001
    }
});

const TeamIdCounter = mongoose.model('teamidcounters', teamIdCounterSchema);
module.exports = TeamIdCounter;