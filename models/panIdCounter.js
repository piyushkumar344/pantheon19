const mongoose = require("mongoose");
const schema = mongoose.schema;

const panIdCounterSchema = new schema({
    find: {
        type: String,
        default: 'pantheonId'
    },
    count: {
        type: Number,
        default: 1900001
    }
});

const PanIdCounter = mongoose.model('panIdCounters', panIdCounterSchema);
module.exports = PanIdCounter;