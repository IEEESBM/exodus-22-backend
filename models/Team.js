const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User  = require('./User');

const teamsSchema = new Schema({
    teamID: {
        type: String,
        required: true,
    },
    teamMembers : {
        type: [User.schema],
    },
    submitLink:{
      type : String,
    },
});

const Team = mongoose.model("Team", teamsSchema);

module.exports = Team;
