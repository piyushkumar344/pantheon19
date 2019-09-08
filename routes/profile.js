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
const { check, validationResult } = require("express-validator");
const router = express.Router();
const mongoose = require("mongoose");
const { isEmail } = require('validator');

router.get("/user", verifyToken, (req, res) => {
    const userId = req.userId;
    async function getUser() {
        try {
            const userFound = await UserModel.findById(userId)
            if (!userFound) {
                res.json({
                    status: 422,
                    message: "No such user Found"
                });
            }
            const user = {
                name: userFound.name,
                pantheonId: userFound.pantheonId,
                email: userFound.email,
                phoneNo: userFound.phoneNo,
                clgName: userFound.clgName,
                clgCity: userFound.clgCity,
                clgState: userFound.clgState,
                clgId: userFound.clgId,
                isTeamLeader: userFound.isTeamLeader
            }

            const teamMongoId = userFound.teamMongoId;
            if (!teamMongoId) {
                user.teamDetails = null;
                //user.eventsRegistered = null;
                return res.json({ status: 200, user: user });
            }
            const teamDetails = await TeamModel.findById(teamMongoId);
            user.teamName = teamDetails.teamName;
            user.teamId = teamDetails.teamId;
            user.teamSize = teamDetails.teamSize;
            user.teamMembers = teamDetails.teamMembers;
            user.eventsRegistered = teamDetails.eventsRegistered;

            return res.json({ status: 200, user: user });

        } catch (e) {
            return res.json({ status: 500, message: "Error on the server!" });
        }
    }
    getUser();
});

router.post("/teamRegister", verifyToken, (req, res, next) => {
    // Data Validation

    if (!req.body.teamName || !req.body.teamSize) {
        return res.json({
            status: 400,
            message: "Team Name and Team size is required"
        });
    }

    let memberDataInBody = req.body.membersData;

    if (!memberDataInBody || memberDataInBody instanceof Array === false) {
        return res.json({
            status: 400,
            message: "Members Data Missing"
        });
    }

    //checking if team name has minimum 4 characters
    const teamName = req.body.teamName
        .toString()
        .trim()
        .toLowerCase();
    if (teamName.length < 4) {
        return res.json({
            status: 422,
            message: "Team Name must contain at least 4 characters!"
        });
    }

    // Checking Team Size
    let teamSize = req.body.teamSize;
    try {
        teamSize = Number(teamSize);
        if (!teamSize) {
            throw "Team Size Should be a number";
        }
        if (teamSize % 1 !== 0) {
            throw "Team Size should be a integer";
        }
    } catch (e) {
        return res.json({ status: 422, message: e });
    }

    if (teamSize > 8 || teamSize < 6) {
        return res.json({
            status: 422,
            message: "Team Size Should be between 6 and 8 members"
        });
    }

    let membersData = [];
    for (let i = 0; i < teamSize; i++) {
        const obj = req.body.membersData[i];
        let panId = obj.pantheonId, emailId = obj.email;
        if (!panId || !emailId) {
            return res.json({ status: 422, message: `Missing Data of member ${i + 1}` });
        }
        try {
            panId = Number(panId);
            if (!panId) {
                throw `Invalid credentials of member ${i + 1}`;
            }
            if (panId % 1 !== 0) {
                throw `Invalid credentials of member ${i + 1}`;
            }
            emailId = emailId.toString().trim();
            if (!isEmail(emailId)) {
                throw `Invalid credentials of member ${i + 1}`;
            }
        } catch (e) {
            return res.json({ status: 422, message: e });
        }
        membersData.push(obj);
    }

    //check all pantheon ids are unique
    let panIdSet = new Set();
    for (let i = 0; i < teamSize; i++) {
        panIdSet.add(membersData[i].pantheonId);
    }
    if (panIdSet.size < teamSize) {
        return res.json({
            status: 415,
            message: "Ensure that unique pantheon ids are used for team regsitration!"
        });
    }

    //check all email ids are unique
    let emailSet = new Set();
    for (let i = 0; i < teamSize; i++) {
        emailSet.add(membersData[i].email);
    }
    if (emailSet.size < teamSize) {
        return res.json({
            status: 415,
            message: "Ensure that unique email ids are used for team regsitration!"
        });
    }

    async function teamRegister() {
        try {
            const userId = req.userId;
            let user = null;
            const foundUser1 = await UserModel.findById(userId);
            if (!foundUser1) {
                return res.json({ status: 500, message: "Internal server error" });
            }
            user = foundUser1;

            // Check Same Team
            const foundTeam = await TeamModel.findOne({ teamName: teamName });
            if (foundTeam) {
                return res.json({ status: 415, message: "Team name already used!" });
            }

            //check if any member is already in some team and email and panIds are in sync
            for (let i = 0; i < teamSize; i++) {
                let email = membersData[i].email,
                    panId = membersData[i].pantheonId;
                const foundUser = await UserModel.findOne({ email: email });
                if (!foundUser) {
                    return res.json({
                        status: 415,
                        message: `wrong credentials of member ${i + 1}`
                    });
                } else if (!foundUser.pantheonId || !foundUser.email) {
                    return res.json({
                        status: 415,
                        message: `Member ${i + 1} not verified`
                    });
                } else if (
                    foundUser.email !== email ||
                    foundUser.pantheonId !== panId
                ) {
                    return res.json({
                        status: 415,
                        message: `Wrong credentials of member ${i + 1}`
                    });
                } else if (foundUser.teamMongoId) {
                    return res.json({
                        status: 415,
                        message: `Member ${i +
                            1} is already registered in some another team!`
                    });
                }
            }

            let newTeam = new TeamModel({ teamName, teamSize });

            newTeam.teamMembers = membersData;

            //increment team id couter
            let teamCount = -1;
            const teamCounter = await TeamIdCounter.findOne({ find: "teamId" });
            if (!teamCounter) {
                return res.json({ status: 500, message: "Error on the server!" });
            }
            teamCount = teamCounter.count + 1;
            teamCounter.count = teamCount;
            const updatedCounter = await teamCounter.save();
            newTeam.teamId = teamCount;

            const room = await newTeam.save();
            let { _id } = room;

            //setting member1 as leader and its teamMongoId
            user.isTeamLeader = true;
            user.teamMongoId = _id;
            const saveTeamLeader = await user.save();

            // Saving all members teamMongoId
            let panIdsInTeam = [];
            for (let i = 0; i < teamSize; i++) {
                panIdsInTeam.push(membersData[i].pantheonId);
            }
            const modifiedTeams = await UserModel.updateMany(
                { pantheonId: { $in: panIdsInTeam } },
                { $set: { teamMongoId: _id } }
            );
            return res.json({ status: 200, message: "Team registration complete!" });
        } catch (e) {
            console.log(e);
            return res.json({ status: 500, message: "Internal server error" });
        }
    }
    teamRegister();
});

router.post("/eventRegister", verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) return res.json({ status: 400, message: " No such user exist " });
        else if (!user.isTeamLeader) {
            return res.json({
                status: 400,
                message: " Only team leader can register for an event "
            });
        }
        let eventId = req.body.eventId;
        try {
            eventId = Number(req.body.eventId);
            if (!eventId) {
                throw "Event Id must be an integer";
            }
            if (eventId % 2 !== 1) {
                throw "Event Id must be an integer";
            }
        } catch (e) {
            return res.json({ status: 422, message: e });
        }
        const event = await EventModel.findOne({ eventId: eventId });

        if (!event) {
            return res.json({ status: 400, message: " No such event exist" });
        }
        const team = await TeamModel.findById(user.teamMongoId);
        let totalEvents = team.eventsRegistered.length;
        for (let i = 0; i < totalEvents; i++) {
            if (team.eventsRegistered[i].eventId === eventId) {
                return res.json({ status: 304, message: " Event already registered" });
            }
        }
        team.eventsRegistered.push({ eventId: event.eventId, eventName: event.eventName });
        await team.save();

        return res.json({ status: 200, message: "Successfully Registered" });
    } catch (err) {
        return res.json({ status: 500, message: "Internal Server Error" });
    }
});

router.post("/eventDeregister", verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) return res.json({ status: 400, message: " No such user exist " });
        else if (!user.isTeamLeader) {
            return res.json({
                status: 400,
                message: " Only team leader can register for an event "
            });
        }
        let eventId = req.body.eventId;
        try {
            eventId = Number(req.body.eventId);
            if (!eventId) {
                throw "Event Id must be an integer";
            }
            if (eventId % 2 !== 1) {
                throw "Event Id must be an integer";
            }
        } catch (e) {
            return res.json({ status: 422, message: e });
        }
        const event = await EventModel.findOne({ eventId: eventId });
        if (!event) {
            return res.json({ status: 400, message: "No such event exist" });
        }
        const team = await TeamModel.findById(user.teamMongoId);
        let index = -1;
        for (let i = 0; i < team.eventsRegistered.length; i++) {
            if (team.eventsRegistered[i].eventId === eventId) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            team.eventsRegistered.splice(index, 1);
        }
        await team.save();

        return res.json({ status: 200, message: "Successfully Deregistered" });
    } catch (err) {
        console.log(err)
        return res.json({ status: 500, message: "Internal Server Error" });
    }
});

module.exports = router;
