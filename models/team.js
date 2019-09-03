const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamMemberSchema = new Schema({
    userPanId:{
        type: Number,
        required: true
    },
    userEmail:{
        type: String,
        required: true
    }
});

const eventRegisteredSchema = new Schema({
    eventId:{
        type: String,
        required: true
    },
    eventName:{
        type: String,
        required: true
    }
});

const teamSchema = new Schema({
    teamName:{
        type: String,
        required: true
    },
    teamId:{
        type: String,
        required: true
    },
    teamSize:{
        type: Number,
        required: true
    },
    teamMembers:[teamMemberSchema],
    eventsRegistered:[eventRegisteredSchema],
    points:{
        type: Number,
        default: 0
    }
});

const Team = mongoose.model('teams',teamSchema);
module.exports = Team;