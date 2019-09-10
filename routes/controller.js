const express = require("express");
const router = express.Router();
const profile = require('./profile');
const event = require('./events');
const authentication = require('./authenticate')
const feedback = require('./feedback');

router.use('/auth', authentication);
router.use('/profile', profile);
router.use('/event', event);
router.use('/', feedback);

module.exports = router;