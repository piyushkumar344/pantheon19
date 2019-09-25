const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const panUsers = require("../models/user");
const team = require("../models/team");

router.post("/teamDetails", async (req, res) => {
  const teamzId = req.body.teamId;
  if (!teamzId) {
    return res.json({ status: 200, message: "invalid team id" });
  }

  try {
    const teamzz = await team.findOne({ teamId: teamzId });
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

router.post("/verifyTeam", (req, res) => {
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

router.post("/deverifyTeam", (req, res) => {
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

router.post("/verifyTeam", (req, res) => {});

router.post("/deverifyTeam", (req, res) => {});

router.get("/leaderboard", (req, res) => {});

router.post("/eventWinners", (req, res) => {});

router.post("/notification", (req, res) => {});

router.get("/notifications", (req, res) => {});

router.post("/updateEvents", (req, res) => {});

router.post("/userRegisterAdmin", (req, res) => {});

router.post("/teamRegisterAdmin", (req, res) => {});

module.exports = router;
