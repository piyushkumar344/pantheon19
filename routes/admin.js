const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const panUsers = require("../models/user");
const team = require("../models/team");
const adminAuth = require('./../middlewares/adminAuth');

router.post("/teamDetails", adminAuth, (req, res) => {
    const teamId = req.body.teamId;
    panUsers.find({ teamMongoId: teamId }, (err, users) => {
        var userMap = [];

        users.forEach(function (user) {
            userMap.push(user);
        });

        console.log(userMap)
    });

    res.send("in trial")
});

router.post("/verifyTeam", adminAuth, (req, res) => {
    const id = req.body.teamId;
    if (!id) {
        return res.json({ status: 422, message: "No Team Id Given" });
    }
    async function teamVerify() {
        try {
            let team = await TeamModel.findOne({ teamId: id });
            team.teamVerified = true;
            let teamUpdate = team.save();
            return res.json({ status: 200, message: "Team Verified Successfully" });
        } catch (e) {
            return res.json({ status: 500, message: "Error on the server!" });
        }
    }
    teamVerify();
});

router.post("/rejectTeam", adminAuth, (req, res) => {
    const id = req.body.teamId;
    if (!id) {
        return res.json({ status: 422, message: "No Team Id Given" });
    }
    async function teamReject() {
        try {
            let team = await TeamModel.findOne({ teamId: id });
            team.teamVerified = false;
            let teamUpdate = team.save();
            return res.json({ status: 200, message: "Team Verified Successfully" });
        } catch (e) {
            return res.json({ status: 500, message: "Error on the server!" });
        }
    }
    teamReject();
});

router.post("/verifyTeam", (req, res) => { });

router.post("/deverifyTeam", (req, res) => { });

router.get("/leaderboard", (req, res) => {
    async function getLeaderboard() {
        try {
            const leaderboard = await team.
                find({ 'teamVerified': true }).
                sort({ points: -1 }).
                select({ _id: 0, teamName: 1, teamId: 1, points: 1 });
            console.log("abc");
            return res.send({ status: 200, leaderboard: leaderboard });
        }
        catch (e) {
            return res.send({ status: 500, message: 'Error on the server!' });
        }
    }
    getLeaderboard();
});

router.post("/eventWinners", (req, res) => { });

router.post("/notification", (req, res) => { });

router.get("/notifications", (req, res) => { });

router.post("/updateEvents", (req, res) => { });

router.post("/userRegisterAdmin", (req, res) => { });

router.post("/teamRegisterAdmin", (req, res) => { });

module.exports = router;
