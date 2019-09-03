const mongoose = require('mongoose');
const schema = mongoose.schema;

const eventWinnersSchema = new schema({
    teamId:{
        type: Number,
        required: true
    },
    teamName:{
        type: String,
        required: true
    },
    rank:{
        type: Number,
        enum:[1,2,3],
        required: true
    }
});

const eventSchema = new schema({
    eventId:{
        type: Number,
        required: true
    },
    eventType:{
        type: String,
        enum:['formal','informal','flagship'],
        required: true
    },
    eventName:{
        type: String,
        required: true
    },
    winners:[eventWinnersSchema]
});

const Event = mongoose.model('events',eventSchema);
module.exports = Event;