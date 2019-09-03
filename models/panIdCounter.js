const mongoose = require("mongoose");
const schema = mongoose.Schema;

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

const PanIdCounter = mongoose.model('panidcounters', panIdCounterSchema);
module.exports = PanIdCounter;