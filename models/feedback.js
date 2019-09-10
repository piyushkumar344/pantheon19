const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    dummy1: {
        type: String
    }
});

const Feedback = mongoose.model('feedbacks', feedbackSchema);
module.exports = Feedback;