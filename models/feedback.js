const mongoose = require('mongoose');
const schema = mongoose.Schema;

const feedbackSchema = new schema({
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
    }
});

const Feedback = mongoose.model('feedbacks', feedbackSchema);
module.exports = Feedback;