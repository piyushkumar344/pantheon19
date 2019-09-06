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

        teamSize = floor(teamSize);
        if (teamSize > 8 || teamSize < 6) {
            return res.json({ status: 422, message: "Team Size Should be between 6 and 8 members" });
        }

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
        if (panIdSet.size < teamSize) {
            return res.json({ status: 415, message: "Ensure that unique pantheon ids are used for team regsitration!" });
        }

        //check all email ids are unique
        let emailSet = new Set();
        emailSet.add(req.body.member1Email);
        emailSet.add(req.body.member2Email);
        emailSet.add(req.body.member3Email);
        emailSet.add(req.body.member4Email);
        emailSet.add(req.body.member5Email);
        emailSet.add(req.body.member6Email);
        if (teamSize > 6) emailSet.add(req.body.member7Email);
        if (teamSize > 7) emailSet.add(req.body.member8Email);
        if (emailSet.size < teamSize) {
            return res.json({ status: 415, message: "Ensure that unique email ids are used for team regsitration!" });
        }
        next();
    },
    (req, res) => {
        async function teamRegister() {
            try {
                const userId = req.userId;
                let user = null;
                await UserModel.findById(userId, (err, foundUser) => {
                    if (err) {
                        return res.json({ status: 500, message: "Internal server error" });
                    }
                    if (!foundUser) {
                        res.json({ status: 422, message: "Invalid " + errors.errors[0].param });
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
                        if (err) return res.json({ status: 500, message: "Error on the server!" });
                        if (!foundUser) {
                            return res.json({ status: 415, message: `Wrong credentials of member ${key}` });
                        }
                        if (foundUser.email !== email || foundUser.panId !== panId) {
                            return res.json({ status: 415, message: `Wrong credentials of member ${key}` });
                        }
                        if (foundUser.teamMongoId) {
                            return res.json({ status: 415, message: `Member ${key} is already registered in some another team!` });
                        }
                    });
                }
                validateMembers(1, req.body.member1PanId, req.body.member1Email);
                validateMembers(2, req.body.member2PanId, req.body.member2Email);
                validateMembers(3, req.body.member3PanId, req.body.member3Email);
                validateMembers(4, req.body.member4PanId, req.body.member4Email);
                validateMembers(5, req.body.member5PanId, req.body.member5Email);
                validateMembers(6, req.body.member6PanId, req.body.member6Email);
                if (teamSize > 6) validateMembers(7, req.body.member7PanId, req.body.member7Email);
                if (teamSize > 7) validateMembers(8, req.body.member8PanId, req.body.member8Email);

                let newTeam = new TeamModel({
                    teamName: req.body.teamName,
                    teamSize: req.body.teamSize
                });

                let teamMembers = [];
                //member1
                let member = {
                    userPanId: req.body.member1PanId,
                    userEmail: req.body.member1Email
                };
                teamMembers.push({ ...member });

                //member2
                member.userEmail = req.body.member2Email;
                member.userPanId = req.body.member2PanId;
                teamMembers.push({ ...member });

                //member3
                member.userEmail = req.body.member3Email;
                member.userPanId = req.body.member3PanId;
                teamMembers.push({ ...member });

                //member4
                member.userEmail = req.body.member4Email;
                member.userPanId = req.body.member4PanId;
                teamMembers.push({ ...member });

                //member5
                member.userEmail = req.body.member5Email;
                member.userPanId = req.body.member5PanId;
                teamMembers.push({ ...member });

                //member6
                member.userEmail = req.body.member6Email;
                member.userPanId = req.body.member6PanId;
                teamMembers.push({ ...member });

                if (teamSize > 6) {
                    //member7
                    member.userEmail = req.body.member7Email;
                    member.userPanId = req.body.member7PanId;
                    teamMembers.push({ ...member });
                }

                if (teamSize > 7) {
                    //member8
                    member.userEmail = req.body.member8Email;
                    member.userPanId = req.body.member8PanId;
                    teamMembers.push({ ...member });
                }

                newTeam.teamMembers = [...teamMembers];

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
                            await UserModel.findOneAndUpdate({ pantheonId: req.body.member1PanId }, { $set: { teamMongoId: _id } });
                            await UserModel.findOneAndUpdate({ pantheonId: req.body.member2PanId }, { $set: { teamMongoId: _id } });
                            await UserModel.findOneAndUpdate({ pantheonId: req.body.member3PanId }, { $set: { teamMongoId: _id } });
                            await UserModel.findOneAndUpdate({ pantheonId: req.body.member4PanId }, { $set: { teamMongoId: _id } });
                            await UserModel.findOneAndUpdate({ pantheonId: req.body.member5PanId }, { $set: { teamMongoId: _id } });
                            await UserModel.findOneAndUpdate({ pantheonId: req.body.member6PanId }, { $set: { teamMongoId: _id } });
                            if (teamSize > 6) await UserModel.findOneAndUpdate({ pantheonId: req.body.member7PanId }, { $set: { teamMongoId: _id } });
                            if (teamSize > 7) await UserModel.findOneAndUpdate({ pantheonId: req.body.member8PanId }, { $set: { teamMongoId: _id } });
                            res.json({ status: 200, message: "Team registration complete!" });
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
                console.log(err.message);
                return res.json({ status: 500, message: "Error on the server!" });
            }
        }

        teamRegister();
    });



module.exports = router;