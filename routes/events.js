const express = require("express");
const path = require('path');
const router = express.Router();

router.get('/getFormalEvents', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'eventJson', 'formalEvents.json'));
});

router.get('/getInformalEvents', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'eventJson', 'informalEvents.json'));
});

router.get('/getFlagshipEvents', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'eventJson', 'flagshipEvents.json'));
});

module.exports = router;

