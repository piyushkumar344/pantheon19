const express = require("express");
const path = require('path');
const router = express.Router();
const Notification = require('./../models/notification');

router.get('/getFormalEvents', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'eventJson', 'formalEvents.json'));
});

router.get('/getInformalEvents', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'eventJson', 'informalEvents.json'));
});

router.get('/getFlagshipEvents', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'eventJson', 'flagshipEvents.json'));
});

router.get('/notifications', (req, res) => {
    Notification.find({})
        .sort({ '_id': -1 })
        .limit(10)
        .select({ title: 1, _id: 0, message: 1 })
        .exec(function (err, messages) {
            if (err) {
                return res.json({ status: 500, message: "Error on the server" });
            }
            return res.json({ status: 200, messages: messages });
        });
});

module.exports = router;

