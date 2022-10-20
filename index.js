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

app.listen(3010, () => {
    console.log("Server runnig on port 3010");
})