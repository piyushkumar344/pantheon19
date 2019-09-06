const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const UserModel = require("../models/user");
const TeamModel = require("../models/team");
const EventModel = require("../models/event");
const PanIdCounter = require("../models/panIdCounter");
const TeamIdCounter = require("../models/teamIdCounter");
const verifyToken = require("../middlewares/verifyToken");
const { check, validationResult } = require('express-validator');
const router = express.Router();

router.get('/user', verifyToken, (req, res) => {
  const userId = req.userId;
  async function getUser() {
    try {
      await UserModel.findById(userId, (err, user) => {
        if (err) return res.json({ status: 500, message: "Internal server error" });
        else if (!user) {
          res.json({ status: 422, message: "Invalid " + errors.errors[0].param });
        }
        else {
          res.json({ status: 200, user: user });
        }
      });
    } catch (e) {
      return res.json({ status: 500, message: "Error on the server!" });
    }
  }
  getUser();
});

router.post('/teamRegister', verifyToken,
  (req, res, next) => {
    // Data Validation

    if (!req.body.teamName || !req.body.teamSize) {
      return res.json({ status: 400, message: "Team Name and Team size is required" });
    }

    //checking if team name has minimum 4 characters
    const teamName = req.body.teamName.toString().trim().toLowerCase();
    if (teamName.length < 4) {
      return res.json({ status: 422, message: "Team Name must contain at least 4 characters!" });
    };

    // Checking Team Size
    let teamSize = req.body.teamSize;
    try {
      teamSize = Number(teamSize);
    } catch (e) {
      return res.json({ status: 422, message: "Team Size Should be a number" });
    }

    teamSize = Math.floor(teamSize);
    if (teamSize > 8 || teamSize < 6) {
      return res.json({ status: 422, message: "Team Size Should be between 6 and 8 members" });
    }

    let membersData = [];
    for (let i = 0; i < teamSize; i++) {
      const obj = req.body.membersData[i];
      membersData.push(obj);
    }
    console.log(membersData);
    //check all pantheon ids are unique
    let panIdSet = new Set();
    for (let i = 0; i < teamSize; i++) {
      console.log(membersData[i].pantheonId);
      panIdSet.add(membersData[i].pantheonId);
    }
    console.log("panIdSet", panIdSet);
    if (panIdSet.size < teamSize) {
      return res.json({ status: 415, message: "Ensure that unique pantheon ids are used for team regsitration!" });
    }


    //check all email ids are unique
    let emailSet = new Set();
    for (let i = 0; i < teamSize; i++) {
      emailSet.add(membersData[i].email);
    }
    console.log("emailSet", emailSet);
    if (emailSet.size < teamSize) {
      return res.json({ status: 415, message: "Ensure that unique email ids are used for team regsitration!" });
    }


    async function teamRegister() {
      try {
        const userId = req.userId;
        let user = null;
        await UserModel.findById(userId, (err, foundUser) => {
          if (err || !foundUser) {
            return res.json({ status: 500, message: "Internal server error" });
          }
          user = foundUser;
        });

        //checking if team name is unique
        await TeamModel.findOne({ teamName: teamName }, (err, foundTeam) => {
          if (err) return res.json({ status: 500, message: "error on the server" });
          if (foundTeam) return res.json({ status: 415, message: "Team name already used!" });
        });

        //check if any member is already in some team and email and panIds are in sync
        async function validateMembers(key, panId, email) {
          await UserModel.findOne({ email: email }, (err, foundUser) => {
            if (err) return ({ status: 500, message: "Error on the server!" });
            if (!foundUser) {
              return ({ status: 415, message: `wrong credentials of member ${key}` });
            }
            if (foundUser.email !== email || foundUser.pantheonId !== panId) {
              return ({ status: 415, message: `Wrong credentials of member ${key}` });
            }
            if (foundUser.teamMongoId) {
              return ({ status: 415, message: `Member ${key} is already registered in some another team!` });
            }
            return {};
          });
        }

        for (let i = 0; i < teamSize; i++) {
          const obj = validateMembers(i + 1, membersData[i].pantheonId, membersData[i].email);
          if (obj.status) return res.json(obj);
        }


        let newTeam = new TeamModel({
          teamName: req.body.teamName,
          teamSize: req.body.teamSize
        });


        newTeam.teamMembers = membersData;

        //increment team id couter
        let teamCount = -1;
        await TeamIdCounter.findOne({ find: 'teamId' }, (err, foundTeam) => {
          if (err || !foundTeam) return res.json({ status: 500, message: "Error on the server!" });
          teamCount = foundTeam.count + 1;
          foundTeam.count = teamCount;
          foundTeam.save();
        });

        newTeam.teamId = teamCount;

        await newTeam.save((err, room) => {
          if (err) return res.json({ status: 500, message: "Error while saving the team on db!" });
          const { _id } = room;

          //setting member1 as leader and its teamMongoId
          user.isTeamLeader = true;
          user.teamMongoId = _id;
          user.save();

          //setting  teamMongoId of other users
          async function includeInTeam() {
            try {
              let panIdsInTeam = [];
              for (let i = 0; i < teamSize; i++) {
                panIdsInTeam.push(membersData[i].pantheonId);
              }
              const modifiedTeams = await UserModel.updateMany({ pantheonId: { $in: panIdsInTeam } }, { $set: { teamMongoId: _id } });
              console.log(modifiedTeams);

              return res.json({ status: 200, message: "Team registration complete!" });
            }
            catch (er) {
              console.log(er.message);
              return res.json({ status: 500, message: "Error on the server!" });
            }
          }

          includeInTeam();

        });

        // await TeamModel.findOne({ teamId: teamCount }, (err, res) => {
        //   if (err || !res) return res.json({ status: 500, message: "Error on the server!" });
        //   const id = res._id;

        //   //setting member1 as leader and its teamMongoId
        //   user.isTeamLeader = true;
        //   user.teamMongoId = id;
        //   user.save();

        //   //setting  teamMongoId of other users
        //   async function includeInTeam() {
        //     try {
        //       await UserModel.findOneAndUpdate({ pantheonId: req.body.member1PanId }, { $set: { teamMongoId: id } });
        //       await UserModel.findOneAndUpdate({ pantheonId: req.body.member2PanId }, { $set: { teamMongoId: id } });
        //       await UserModel.findOneAndUpdate({ pantheonId: req.body.member3PanId }, { $set: { teamMongoId: id } });
        //       await UserModel.findOneAndUpdate({ pantheonId: req.body.member4PanId }, { $set: { teamMongoId: id } });
        //       await UserModel.findOneAndUpdate({ pantheonId: req.body.member5PanId }, { $set: { teamMongoId: id } });
        //       await UserModel.findOneAndUpdate({ pantheonId: req.body.member6PanId }, { $set: { teamMongoId: id } });
        //       if (teamSize > 6) await UserModel.findOneAndUpdate({ pantheonId: req.body.member7PanId }, { $set: { teamMongoId: id } });
        //       if (teamSize > 7) await UserModel.findOneAndUpdate({ pantheonId: req.body.member8PanId }, { $set: { teamMongoId: id } });
        //     }
        //     catch (er) {
        //       console.log(er.message);
        //       return res.json({ status: 500, message: "Error on the server!" });
        //     }
        //   }

        //   includeInTeam();
        // });
      }
      catch (err) {
        console.log(err);
        return res.json({ status: 500, message: "Error on the server!" });
      }
    }

    teamRegister();
  });



module.exports = router;