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
        
        //check all pantheon ids are unique
        let panIdSet = new Set();
        for (let i = 0; i < teamSize; i++) {
            panIdSet.add(membersData[i].pantheonId);
        }
        if (panIdSet.size < teamSize) {
            return res.json({ status: 415, message: "Ensure that unique pantheon ids are used for team regsitration!" });
        }

        //check all email ids are unique
        let emailSet = new Set();
        for (let i = 0; i < teamSize; i++) {
            emailSet.add(membersData[i].email);
        }
        if (emailSet.size < teamSize) {
            return res.json({ status: 415, message: "Ensure that unique email ids are used for team regsitration!" });
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
                    let email = membersData[i].email, panId = membersData[i].pantheonId;
                    const foundUser = await UserModel.findOne({ email: email });
                    if (!foundUser) {
                        return res.json({ status: 415, message: `wrong credentials of member ${i + 1}` });
                    }
                    else if(!foundUser.pantheonId || !foundUser.email) {
                        return res.json({ status: 415, message: `Member ${i + 1} not verified` });
                    }
                    else if (foundUser.email !== email || foundUser.pantheonId !== panId) {
                        return res.json({ status: 415, message: `Wrong credentials of member ${i + 1}` });
                    }
                    else if (foundUser.teamMongoId) {
                        return res.json({ status: 415, message: `Member ${i + 1} is already registered in some another team!` });
                    }
                }

                let newTeam = new TeamModel({ teamName, teamSize });

                newTeam.teamMembers = membersData;

                //increment team id couter
                let teamCount = -1;
                const teamCounter = await TeamIdCounter.findOne({ find: 'teamId' });
                if (!teamCounter) {
                    return res.json({ status: 500, message: "Error on the server!" });
                }
                teamCount = teamCounter.count + 1;
                teamCounter.count = teamCount;
                const updatedCounter = await teamCounter.save();
                newTeam.teamId = teamCount;

                const room = await newTeam.save();
                const { _id } = room;

                //setting member1 as leader and its teamMongoId
                user.isTeamLeader = true;
                user.teamMongoId = _id;
                const saveTeamLeader = await user.save();

                // Saving all members teamMongoId
                let panIdsInTeam = [];
                for (let i = 0; i < teamSize; i++) {
                    panIdsInTeam.push(membersData[i].pantheonId);
                }
                const modifiedTeams = await UserModel.updateMany({ pantheonId: { $in: panIdsInTeam } }, { $set: { teamMongoId: _id } });
                return res.json({ status: 200, message: "Team registration complete!" });
            } catch (e) {
                console.log(e);
                return res.json({ status: 500, message: "Internal server error" });
            }
        }
        teamRegister();
    }
);



module.exports = router;