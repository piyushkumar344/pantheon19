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
const router = express.Router();

router.get("/user", verifyToken, (req, res) => {
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
    }
  }
  getUser();
});

module.exports = router;
