const mongoose = require("mongoose");
const express = require("express");
const Team = require('./models/Team');
const User = require('./models/User');
const bodyParser = require("body-parser");


require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoUrl = "mongodb+srv://" + process.env.MONGO_UID + ":" + process.env.MONGO_UID +"@data.yqoabll.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(
    mongoUrl,
    {
        useNewUrlParser: true,
    }
);

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
 charactersLength));
   }
   return result;
}

app.post("/createTeam",async function(req,res){


    const userName = req.body.userName;
    console.log(req.body.userName);
    //console.log(req.params.userName);

    User.find({userName:userName},function(err,userObj){

      if(err){
        console.log(err);
      }
      else{

        const ln = Object.keys(userObj).length;
        if(ln==0){

          console.log(userObj);
          res.send("User does not exist");

        }
        else{

          Team.find({teamMembers :{$elemMatch:{userName:userName}}} ,async function(err,teamObj){
            if(err){
              console.log(err);
            }
            else{

              //console.log(Object.keys(teamObj).length);
              const vr = Object.keys(teamObj).length;
              if(vr>0){
                res.send("user is already added to another team");
              }
              else{
                try{
                    const newTeam = makeid(5);
                  const team = new Team({
                    teamID : newTeam,
                    teamMembers : [],
                  });

                  team.save();
                  await User.updateOne({userID: userObj[0].userID},{$set: {teamID: newTeam}});
                  await Team.updateOne({teamID: newTeam}, {$push: {teamMembers: userObj}});

                  res.send("team created successfully");

                }
                catch(err){
                  console.log(err);
                }
              }
            }

          });

        }

      }

    });
});

app.post('/joinTeam', (req, res) => {
    try{
        const teamIDTest = req.body.teamID;
        const currentUser = req.body.user;
        Team.findOne({teamID: teamIDTest}, async function(err, team){
            if (team.teamMembers.length < 4){
                User.findOne({userName: currentUser}, async function(err, user){
                    if(user && user.teamID =="" ){
                        await User.updateOne({userName:currentUser},{$set: {teamID: teamIDTest}});
                        await Team.updateOne({teamID: teamIDTest}, {$push: {teamMembers: user}});
                        res.send("user joined a new team.");
                        console.log(user.teamID);
                    }else if(user && user.teamID!=""){
                        console.log(user);
                        res.send("Already in a team.")
                    } else {
                        console.log(err);
                    }
                });
            } else if (team.teamMembers.length ==4){
                console.log(team.teamMembers.length);
                res.send("Team already has 4 members");
            } else {
                console.log(err);
            }
        })
    } catch(err){
        res.send("Error "+err);
    }
});

app.post("/leaveTeam", async (req, res) => {
  const teamID = req.body.teamID;
  const userID = req.body.userID;

  try {
    const team = await Team.find({ "teamID": teamID });
    console.log(team);
    if (team.length === 0) {
      return res.status(500).json({ error: 'please enter correct team ID' })
    }
    if (userID === team[0].teamMembers[0].userID) {
      res.status(500).json({ error: 'the team leader cannot leave the team' });
      return;
    }

    const Updated = await Team.updateOne({teamID: teamID}, {
      $pull: {
        teamMembers: {userID: userID},
      },
    });
    await User.updateOne({userID:userID},{$set: {teamID: ""}});

    res.status(200).send(Updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'error' })
  }
});

app.post("/deleteTeam", async (req, res) => {
  const teamID = req.body.teamID;
  console.log(req.body.teamID);
  const userId = req.body.userID;

  try {
    const team = await Team.find({ teamID: teamID });
    if (team.length === 0) {
      return res.status(500).json({ error: "please enter correct team ID" });
    } else if (userId != team[0].teamMembers[0].userID) {
      res.status(500).json({ error: "only the team leader can delete a team" });
      return;
    }
    await Team.deleteOne({ teamID: teamID });
    const userDel = await User.updateMany({teamID: teamID},{$set: {teamID: ""}});
    res.status(200).send("team deleted");
    console.log(userDel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error" });
  }
});

app.post("/submit", function(req, res){

  const userId = req.query.userID;
  const link = req.query.submitLink;

  Team.find({teamMembers :{$elemMatch:{userID:userId}}}, function(err,obj){

    if(err){
      console.log(err);
    }
    else{

      const ln = Object.keys(obj).length;

      if(ln == 0){
        console.log(obj);
        res.send("user does not exist");
      }
      else{

        Team.find({"teamMembers.0.userID" : userId}, function(err, firstObj){

          if(err){
            console.log(err);
          }
          else{
            const len = Object.keys(firstObj).length;
            if(len == 0){
              res.send("team Leader can only submit");
            }
            else {
              try{

                const filter = {teamMembers :{$elemMatch:{userID:userId}}};
                const update = {submitLink : link};
                const changedTeam = Team.findOneAndUpdate(filter, update,{new: true});
                //console.log(changedTeam);
                res.send("submitted");

              }
              catch(err){
                console.log(err);
              }
            }

          }

        })
      }

    }

  });


});

app.post("/getUser", function(req,res){

  const userId = req.query.userID;
  console.log(userId);

  try{
    User.find( {userID: userId}, function(err,obj){

      const ln = Object.keys(obj).length;

      if(ln == 0){
        res.send("User not found");
      }
      else{
        res.send(obj);
      }

    })

  }
  catch(err){
    console.log(err);
  }

});

app.listen(3010, () => {
    console.log("Server runnig on port 3010");
})
