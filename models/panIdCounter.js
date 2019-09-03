const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const panIdCounterSchema = new Schema({
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