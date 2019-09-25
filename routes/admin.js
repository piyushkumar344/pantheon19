const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const panUsers = require("../models/user");
const team = require("../models/team");

router.post("/teamDetails", (req, res) => {
  const teamId = req.body.teamId;
  panUsers.find({ teamMongoId: teamId }, (err, users) => {
    var userMap=[];

    users.forEach(function(user) {
      userMap.push(user)
    });

    console.log(userMap);
  });

  
  res.send("in trial phase")
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
