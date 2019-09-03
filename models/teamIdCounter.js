const mongoose = require("mongoose");
const schema = mongoose.Schema;

const teamIdCounterSchema = new schema({
    find: {
        type: String,
        default: 'teamId'
    },
    count: {
        type: Number,
        default: 1900001
    }
});

const TeamIdCounter = mongoose.model('teamIdCounters', teamIdCounterSchema);
module.exports = TeamIdCounter;