const express = require("express");
const router = express.Router();

router.get('/teamDetails', (req, res) => {

});

router.post('/verifyTeam', (req, res) => {
    const id = req.teamId;
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

router.post('/deverifyTeam', (req, res) => {
    const id = req.teamId;
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

router.get('/leaderboard', (req, res) => {

});

router.post('/eventWinners', (req, res) => {

});

router.post('/notification', (req, res) => {

});

router.get('/notifications', (req, res) => {

});

router.post('/updateEvents', (req, res) => {

});

router.post('/userRegisterAdmin', (req, res) => {

});

router.post('/teamRegisterAdmin', (req, res) => {

});