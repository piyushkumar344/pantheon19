const express = require("express");
const FeedbackModel = require('../models/feedback');
const { isEmail, isLength } = require('validator');
const validateCaptcha = require('../middlewares/validateCaptcha');
const router = express.Router();

router.post('/sendFeedback', validateCaptcha, (req, res) => {

    if (!req.body.name) {
        return res.json({
            status: 400,
            message: "Name is required!"
        });
    }

    if (!req.body.email) {
        return res.json({
            status: 400,
            message: "Email is required!"
        });
    }

    if (!req.body.message) {
        return res.json({
            status: 400,
            message: "Message is required!"
        });
    }

    const name = req.body.name.toString().trim();
    const email = req.body.email.toString().trim();
    const message = req.body.message.toString().trim();

    if (name === "" || email === "" || message === "") {
        return res.json({
            status: 400,
            message: "Missing required fields!"
        });
    }

    if (!isLength(name, { min: 4, max: 100 })) {
        return res.json({
            status: 422,
            message: "Name should have minimum 4 and max 100 characters!"
        });
    }

    if (!isEmail(email)) {
        return res.json({
            status: 422,
            message: "Invalid email!"
        });
    }

    if (!isLength(message, { min: 15, max: 1000 })) {
        return res.json({
            status: 422,
            message: "Message should have minimum 15 and max 100 characters!"
        });
    }

    async function sendFeedback() {
        try {
            let newFeedback = new FeedbackModel({
                name,
                email,
                message
            });

            const feed = await newFeedback.save();
            res.json({ status: 200, message: "Feedback sent successfully!" });
        }
        catch (e) {
            return res.json({ status: 500, message: "Internal server error" });
        }
    }

    sendFeedback();
});

module.exports = router;