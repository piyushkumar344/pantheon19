const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('../config');
const userData = require('../models/user');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const verifyToken = require('../middlewares/verify_token');
const counter = require("../models/counter")

//routes
router.post('/register', [
    check('email').isEmail(),
    check('password').isLength({ min: 5 }),
    check('phoneNo')
        .isLength({ min: 10 })
        .isLength({ max: 10 })
        .isMobilePhone()
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors);
        return res.json({ status: 422, message: "Invalid " + errors.errors[0].param });
    }
    else
        next();
}, (req, res, next) => {
    //check whether already registered
    userData.findOne({ email: req.body.email }, (err, user) => {
        if (err)
            return res.json({ status: 500, message: "error on the server" });

        else if (user)
            return res.json({ status: 415, message: "user already exits" });

        else
            next();

    })
}, (req, res) => {
    //continue registration
    if (req.body.password != req.body.confPassword) {
        return res.json({
            status: 401,
            message: "password doesnt match"
        })
    }
    else if (req.body.email && req.body.password && req.body.confPassword) {
        let hashedPassword = bcrypt.hashSync(req.body.password, 8);
        const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
        userData.create({
            email: req.body.email,
            password: hashedPassword,
            phoneNo: req.body.phoneNo,
            emailOTP,
            phoneOTP
        }, (err, user) => {
            if (err) {
                return res.json({
                    status: 500,
                    message: "something went wrong while registering the user, please try again"
                })
            }

            let token = jwt.sign({ id: user._id }, config.secret, {  //jwt sign encodes payload and secret
                expiresIn: 86400 // expires in 24 hours
            });
            res.json({ status: 200, auth: true, token: token, id: user._id });

            let transport = nodemailer.createTransport({
                host: 'smtp.mailtrap.io',
                port: 2525,
                auth: {
                    user: 'ae2a3afdf68576', // Change to config.js
                    pass: '03f4c3f8c9725c'
                }
            });

            const message = {
                from: 'pantheontechteam@gmail.com', // Sender address
                to: 'too@gmail.com',         // change it
                subject: 'Pantheon Email Verification', // Subject line
                html: `
                <h2 align="center">Pantheon BIT Mesra</h2>
                <br>
                <h3>Hey there!</h3>
                <p>OTP for Email Verification: ${emailOTP}</p>

                <p>For queries regarding Pantheon <br>
                Mail us at - pantheontechteam@gmail.com
                </p>

                <p>With Regards,<br>Pantheon Web Team</p>`
            };
            transport.sendMail(message, function (err, info) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(info);
                }
            });

            // Send OTP to mobile Phone also
        })
    }
    else {
        res.json({ status: 404, message: "missing required value" });
    }
});

router.post('/verify', verifyToken, (req, res) => {
    const { id, phoneOTP, emailOTP } = req.body;
    // console.log(phoneOTP, emailOTP, id);
    userData.findById(id, (err, user) => {
        if (err) {
            return res.json({
                status: 500,
                message: "Server Error"
            });
        }
        if (!user) {
            return res.json({
                status: 401,
                message: "User Not found"
            });
        }
        // Validate OTPs
        if (user.phoneOTP !== phoneOTP || user.emailOTP !== emailOTP) {
            return res.json({
                status: 401,
                message: "Invalid OTP"
            });
        }
        // Data Validation


        // Update user data & set isVerifired true and send token
        user.isVerified = true;
        let pantheonId = -1;
        counter.findOne({ find: "pantheonId" }, async (err, response) => {
            if (response) {
                pantheonId = response.count + 1;
                response.count = pantheonId;
                await response.save((err) => {
                    if (err) {
                        return res.json({ status: 500, message: "Internal server error" });
                    }
                });
                user.pantheonId = pantheonId;
                await user.save((err) => {
                    if (err) {
                        return res.json({ status: 500, message: "Internal server error" });
                    }
                    return res.json({
                        status: 200,
                        isVerfied: true,
                        token: req.headers['x-access-token'],
                        pantheonId: pantheonId
                    });
                });

            }
            else {
                return res.json({ status: 500, message: "Internal server error " })
            }
        })


    });
});

router.post('/login', [
    check('email').isEmail(),
    check('password').isLength({ min: 5 }),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ status: 422, message: errors.errors[0].msg });
    }
    else
        next();
}, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ status: 422, message: errors.errors[0].msg });
    }
    else
        next();
}, (req, res) => {
    if (req.body.email && req.body.password) {
        userData.findOne({ email: req.body.email }, (err, user) => {
            if (err) {
                return res.json({ status: 500, message: "Internal server error" });
            }
            else if (!user) {
                return res.json({ status: 404, message: "No such user exists" })
            }
            else {
                let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

                if (!passwordIsValid) {
                    return res.json({ staus: 401, message: "Incorrect password" });
                }

                let token = jwt.sign({ id: user._id }, config.secret, {
                    expiresIn: 86400
                })

                // isNotVerified
                if (user.isVerified) {
                    return res.json({ status: 200, isVerified: true, token: token });
                }
                const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
                const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
                user.phoneOTP = phoneOTP;
                user.emailOTP = emailOTP;
                user.save((err) => {
                    if (err) {
                        return res.json({ status: 500, message: "Internal server error" });
                    }
                    res.json({ status: 200, isVerfied: false, token: token });

                    let transport = nodemailer.createTransport({
                        host: 'smtp.mailtrap.io',
                        port: 2525,
                        auth: {
                            user: 'ae2a3afdf68576', // Change to config.js
                            pass: '03f4c3f8c9725c'
                        }
                    });

                    const message = {
                        from: 'pantheontechteam@gmail.com', // Sender address
                        to: 'too@gmail.com',         // change it
                        subject: 'Pantheon Email Verification', // Subject line
                        html: `
                        <h2 align="center">Pantheon BIT Mesra</h2>
                        <br>
                        <h3>Hey there!</h3>
                        <p>OTP for Email Verification: ${emailOTP}</p>

                        <p>For queries regarding Pantheon <br>
                        Mail us at - pantheontechteam@gmail.com
                        </p>

                        <p>With Regards,<br>Pantheon Web Team</p>`
                    };
                    transport.sendMail(message, function (err, info) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(info);
                        }
                    });

                    // Send OTP to mobile Phone also
                });
            }
        })
    }
    else {
        return res.json({ status: 404, message: "missing required details" })
    }
})

module.exports = router;