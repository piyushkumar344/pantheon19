const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const panUsers = require("../models/user");
const Notification = require("../models/notification");
const TeamModel = require("../models/team");
const adminAuth = require('./../middlewares/adminAuth');
const webadminAuth = require("./../middlewares/webadminAuth");

router.post("/teamDetails", adminAuth, async (req, res) => {
    const teamzId = req.body.teamId;
    if (!teamzId) {
        return res.json({ status: 200, message: "invalid team id" });
    }

    try {
        const teamzz = await TeamModel.findOne({ teamId: teamzId });
        const teamMongoId = teamzz._id;
        const teamName = teamzz.teamName;
        const teamSize = teamzz.teamSize;
        const teamId = teamzz.teamId;
        const users = await panUsers.find({ teamMongoId: teamMongoId })
        let members = [];

        for (let i = 0; i < users.length; i++) {
            const memDetails = {
                name: users[i].name,
                email: users[i].email,
                clgId: users[i].clgId,
                pantheonId: users[i].pantheonId
            };

            members.push(memDetails);
        }
        return res.json({ status: 200, teamName, teamSize, teamId, members });

    } catch (err) {
        return res.json({ status: 400, message: "server error" });
    }
});

router.post("/verifyTeam", adminAuth, (req, res) => {
    const id = Number(req.body.teamId);
    if (!id) {
        return res.json({ status: 422, message: "No Team Id Given" });
    }
    async function teamVerify() {
        try {
            let team = await TeamModel.findOne({ 'teamId': id });
            console.log
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
    const id = Number(req.body.teamId);
    if (!id) {
        return res.json({ status: 422, message: "No Team Id Given" });
    }
    async function teamReject() {
        try {
            let team = await TeamModel.findOne({ 'teamId': id });
            team.teamVerified = false;
            let teamUpdate = team.save();
            return res.json({ status: 200, message: "Team Rejected Successfully" });
        } catch (e) {
            return res.json({ status: 500, message: "Errosr on the server!" });
        }
    }
    teamReject();
});

router.get("/leaderboard", (req, res) => {
    async function getLeaderboard() {
        try {
            const leaderboard = await TeamModel.
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

router.post("/addPoints", webadminAuth, (req, res) => {
    const teamId = req.body.teamId;
    const points = req.body.points;


});

router.post("/pushMessage", webadminAuth, (req, res) => {
    const title = req.body.title;
    const message = req.body.message;

    const notification = new Notification({
        title,
        message
    });
    notification.save((err, notif) => {
        if (err) {
            return res.json({ status: 500, message: err });
        }
        res.json({ status: 200, message: "Notification Pushed" });
    });
});

router.post("/eventWinners", (req, res) => { });

router.post("/updateEvents", (req, res) => { });

router.post("/userRegisterAdmin", (req, res) => { });

router.post("/teamRegisterAdmin", (req, res) => { });

module.exports = router;
