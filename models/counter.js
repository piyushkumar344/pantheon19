const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    find: {
        type: String,
        default: "pantheonId"
    },
    count: {
        type: Number,
        default: 190001
    }
});

module.exports = mongoose.model("counters", counterSchema);