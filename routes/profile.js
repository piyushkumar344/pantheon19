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
        if (err) res.send("Could not fetch required details!");
        else if (!user) res.send("Could not find user!");
        else {
          res.send(user);
        }
      });
    } catch (e) {
      res.send(e.message);
      return res.json({ status: 500, message: "Error on the server!" });
    }
  }
  getUser();
});

router.post('/teamRegister', verifyToken, (req, res) => {
  async function teamRegister() {
    try {
      const userId = req.userId;
      let user = null;
      await UserModel.findById(userId, (err, res) => {
        if (err || !res) return res.json({ status: 500, message: "error on the server" });
        user = res;
      });

      //checking if team name has minimum 4 characters
      const teamName = req.body.teamName;
      if (teamName.length < 4) return res.json({ status: 422, message: "Email address must contain at least 4 characters!" });

      //checking if team name is unique
      await TeamModel.findOne({ teamName: teamName }, (err, res) => {
        if (err) return res.json({ status: 500, message: "error on the server" });
        if (res) return res.json({ status: 415, message: "Team name already used!" });
      });

      const teamSize = req.body.teamSize;
      //check all pantheon ids are unique
      let panIdSet = new Set();
      panIdSet.add(req.body.member1PanId);
      panIdSet.add(req.body.member2PanId);
      panIdSet.add(req.body.member3PanId);
      panIdSet.add(req.body.member4PanId);
      panIdSet.add(req.body.member5PanId);
      panIdSet.add(req.body.member6PanId);
      if (teamSize > 6) panIdSet.add(req.body.member7PanId);
      if (teamSize > 7) panIdSet.add(req.body.member8PanId);
      if (panIdSet.size() < teamSize) return res.json({ status: 415, message: "Ensure that unique pantheon ids are used for team regsitration!" });

      //check all email ids are unique
      let emailSet = new Set();
      emailSet.add(req.body.member1email);
      emailSet.add(req.body.member2email);
      emailSet.add(req.body.member3email);
      emailSet.add(req.body.member4email);
      emailSet.add(req.body.member5email);
      emailSet.add(req.body.member6email);
      if (teamSize > 6) emailSet.add(req.body.member7email);
      if (teamSize > 7) emailSet.add(req.body.member8email);
      if (emailSet.size() < teamSize) return res.json({ status: 415, message: "Ensure that unique email ids are used for team regsitration!" });

      //check if any member is already in some team and email and panIds are in sync
      async function validateMembers(key, panId, email) {
        await UserModel.findOne({ email: email }, (err, res) => {
          if (err) return res.json({ status: 500, message: "Error on the server!" });
          if (!res) return res.json({ status: 415, message: `Wrong credentials of member ${key}` });
          if (res.email !== email) return res.json({ status: 415, message: `Wrong credentials of member ${key}` });
          if (res.teamMongoId) return res.json({ status: 415, message: `Member ${key} is already registered in some another team!` });
        });
      }
      validateMembers(1, req.body.member1PanId, req.body.member1email);
      validateMembers(2, req.body.member2PanId, req.body.member2email);
      validateMembers(3, req.body.member3PanId, req.body.member3email);
      validateMembers(4, req.body.member4PanId, req.body.member4email);
      validateMembers(5, req.body.member5PanId, req.body.member5email);
      validateMembers(6, req.body.member6PanId, req.body.member6email);
      if (teamSize > 6) validateMembers(7, req.body.member7PanId, req.body.member7email);
      if (teamSize > 7) validateMembers(8, req.body.member8PanId, req.body.member8email);

      //increment team id couter
      let teamCount = -1;
      await TeamIdCounter.findOne({ find: 'teamId' }, (err, res) => {
        if (err || !res) return res.json({ status: 500, message: "Error on the server!" });
        teamCount = res.count + 1;
        res.count = teamCount;
        res.save();
      });


      let newTeam = new TeamModel({
        teamName: req.body.teamName,
        teamId: req.body.teamCount,
        teamSize: req.body.teamSize
      });

      //member1
      let member = {
        userPanId: req.body.member1PanId,
        userEmail: req.body.member1email
      };
      newTeam.members.push(member);

      //member2
      member.userEmail = req.body.member2email;
      member.userPanId = req.body.member2PanId;
      newTeam.members.push(member);

      //member3
      member.userEmail = req.body.member3email;
      member.userPanId = req.body.member3PanId;
      newTeam.members.push(member);

      //member4
      member.userEmail = req.body.member4email;
      member.userPanId = req.body.member4PanId;
      newTeam.members.push(member);

      //member5
      member.userEmail = req.body.member5email;
      member.userPanId = req.body.member5PanId;
      newTeam.members.push(member);

      //member6
      member.userEmail = req.body.member6email;
      member.userPanId = req.body.member6PanId;
      newTeam.members.push(member);

      if (teamSize > 6) {
        //member7
        member.userEmail = req.body.member7email;
        member.userPanId = req.body.member7PanId;
        newTeam.members.push(member);
      }

      if (teamSize > 7) {
        //member8
        member.userEmail = req.body.member8email;
        member.userPanId = req.body.member8PanId;
        newTeam.members.push(member);
      }


      newTeam.save();

      await TeamModel.findOne({ teamId: teamCount }, (err, res) => {
        if (err || !res) return res.json({ status: 500, message: "Error on the server!" });
        const id = res._id;

        //setting member1 as leader and its teamMongoId
        user.isTeamLeader = true;
        user.teamMongoId = id;
        user.save();

        //setting  teamMongoId of other users
        async function includeInTeam() {
          try {
            await UserModel.findOneAndUpdate({ pantheonId: req.body.member1PanId }, { $set: { teamMongoId: id } });
            await UserModel.findOneAndUpdate({ pantheonId: req.body.member2PanId }, { $set: { teamMongoId: id } });
            await UserModel.findOneAndUpdate({ pantheonId: req.body.member3PanId }, { $set: { teamMongoId: id } });
            await UserModel.findOneAndUpdate({ pantheonId: req.body.member4PanId }, { $set: { teamMongoId: id } });
            await UserModel.findOneAndUpdate({ pantheonId: req.body.member5PanId }, { $set: { teamMongoId: id } });
            await UserModel.findOneAndUpdate({ pantheonId: req.body.member6PanId }, { $set: { teamMongoId: id } });
            if (teamSize > 6) await UserModel.findOneAndUpdate({ pantheonId: req.body.member7PanId }, { $set: { teamMongoId: id } });
            if (teamSize > 7) await UserModel.findOneAndUpdate({ pantheonId: req.body.member8PanId }, { $set: { teamMongoId: id } });
          }
          catch (er) {
            console.log(er.message);
            return res.json({ status: 500, message: "Error on the server!" });
          }
        }


      });
    }
    catch (err) {
      console.log(err.message);
      return res.json({ status: 500, message: "Error on the server!" });
    }
  }

  teamRegister();
});



module.exports = router;