const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("../config");
const userData = require("../models/user");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const panIdCounter = require("../models/panIdCounter");
const verifyToken = require("../middlewares/verifyToken");
const validateCaptcha = require("../middlewares/validateCaptcha");
const { isMobilePhone } = require("validator");
const sendEmail = require('../middlewares/sendEmail');

//routes
router.post(
    "/register",
    [check("email").isEmail(), check("password").isLength({ min: 6, max: 15 })],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (errors.errors[0].param == "email") {
                return res.json({ status: 422, message: "Invalid email address" });
            } else {
                return res.json({
                    status: 422,
                    message: "Invalid password, password length must be greater than 5."
                });
            }
        }
        next();
    },
    validateCaptcha,
    (req, res, next) => {
        if (req.body.password !== req.body.confPassword) {
            return res.json({
                status: 401,
                message: "Passwords doesn't match"
            });
        }
        //check whether already registered
        userData.findOne({ email: req.body.email }, (err, user) => {
            if (err) return res.json({ status: 500, message: "Error on the server" });
            else if (user)
                return res.json({ status: 415, message: "User already exits" });
            else next();
        });
    },
    (req, res) => {
        //continue registration
        if (req.body.email && req.body.password && req.body.confPassword) {
            bcrypt.hash(req.body.password, 8, (err, hashedPassword) => {
                if (err) {
                    return res.json({ status: 500, message: "Internal server error" });
                }

                const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
                userData.create(
                    {
                        email: req.body.email,
                        password: hashedPassword,
                        emailOTP
                    },
                    (err, user) => {
                        if (err) {
                            return res.json({
                                status: 500,
                                message:
                                    "Something went wrong while registering the user, please try again"
                            });
                        }

                        let token = jwt.sign({ id: user._id }, config.secret, {
                            //jwt sign encodes payload and secret
                            expiresIn: 86400 // expires in 24 hours
                        });
                        res.json({ status: 200, isVerified: false, token: token });

                        sendEmail(emailOTP);
                    }
                );
            });
        } else {
            res.json({ status: 404, message: "Missing required value" });
        }
    }
);

router.post("/verify", verifyToken, (req, res) => {
    const id = req.userId;
    if (!id) {
        return res.json({ status: 422, message: "Missing User ID" });
    }
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
        // User already verified
        if (user.isVerified === true) {
            return res.json({ status: 400, message: "User Already Verified" });
        }
        // Data Validation
        let {
            emailOTP,
            name,
            phoneNo,
            gender,
            clgName,
            clgCity,
            clgState,
            clgId
        } = req.body;

        if (
            !emailOTP ||
            !name ||
            !phoneNo ||
            !gender ||
            !clgName ||
            !clgCity ||
            !clgState ||
            !clgId
        ) {
            return res.json({ status: 422, message: "Missing Data Fields" });
        }

        emailOTP = emailOTP.toString().trim();
        name = name.toString().trim();
        phoneNo = phoneNo.toString().trim();
        clgName = clgName.toString().trim();
        clgCity = clgCity.toString().trim();
        clgState = clgState.toString().trim();
        clgId = clgId.toString().trim();
        try {
            gender = Number(gender);
            if (!gender) {
                throw "Invalid Gender";
            }
            if (gender % 1 !== 0) {
                throw "Invalid Gender";
            }
        } catch (e) {
            return res.json({ status: 422, message: e });
        }

        if (!emailOTP) {
            return res.json({ status: 422, message: "Invalid OTP" });
        }
        if (name === "") {
            return res.json({ status: 422, message: "Empty Name" });
        }
        if (clgName === "" || clgCity === "" || clgState === "" || clgId === "") {
            return res.json({ status: 422, message: "Missing College Details" });
        }
        if (!isMobilePhone(phoneNo)) {
            return res.json({ status: 422, message: "Invalid Phone Number" });
        }
        if (phoneNo.length !== 10) {
            return res.json({ status: 422, message: "Phone Number must be of 10 digits" });
        }
        for (let i = 0; i < 10; i++) {
            if (phoneNo[i] <= '0' || phonNo[i] >= '9') {
                return res.json({ status: 422, message: "Phone Number must contain only digits" });
            }
        }

        if (gender > 2 || gender <= 0) {
            return res.json({ status: 422, message: "Invalid Gender" });
        }

        try {
            emailOTP = Number(emailOTP);
            if (!emailOTP) {
                throw "Invalid OTP";
            }
        } catch (e) {
            return res.json({ status: 422, message: e });
        }
        // Validate OTPs
        if (user.emailOTP !== emailOTP) {
            return res.json({
                status: 401,
                message: "Invalid OTP"
            });
        }
        // Update user data & set isVerifired true and send token
        user.name = name;
        user.phoneNo = phoneNo;
        user.gender = gender;
        user.clgName = clgName;
        user.clgCity = clgCity;
        user.clgState = clgState;
        user.clgId = clgId;
        user.isVerified = true;
        user.emailOTP = -1;
        let pantheonId = -1;

        panIdCounter.findOne({ find: "pantheonId" }, async (err, response) => {
            if (response) {
                pantheonId = response.count + 1;
                response.count = pantheonId;
                await response.save(err => {
                    if (err) {
                        console.log(err);
                        return res.json({ status: 500, message: "Internal server error" });
                    }
                });
                user.pantheonId = pantheonId;
                await user.save(err => {
                    if (err) {
                        console.log(err);
                        return res.json({ status: 500, message: "Internal server error" });
                    }
                    return res.json({
                        status: 200,
                        isVerfied: true,
                        token: req.headers["x-access-token"],
                    });
                });
            } else {
                console.log(err);
                return res.json({ status: 500, message: "Internal server error " });
            }
        });
    });
});

router.post(
    "/login",
    [check("email").isEmail(), check("password").isLength({ min: 6, max: 15 })],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (errors.errors[0].param == "email") {
                return res.json({ status: 422, message: "Invalid email address" });
            } else {
                return res.json({
                    status: 422,
                    message: "Invalid password, password length must be greater than 5."
                });
            }
        }
        next();
    },
    validateCaptcha,
    (req, res) => {
        if (req.body.email && req.body.password) {
            userData.findOne({ email: req.body.email }, (err, user) => {
                if (err) {
                    return res.json({ status: 500, message: "Internal server error" });
                } else if (!user) {
                    return res.json({ status: 404, message: "No such user exists" });
                } else {
                    bcrypt.compare(req.body.password, user.password, function (err, result) {
                        if (err) {
                            return res.json({ status: 500, message: "Internal server error" });
                        }
                        if (result) {
                            let token = jwt.sign({ id: user._id }, config.secret, {
                                expiresIn: 86400
                            });

                            // isVerified
                            if (user.isVerified) {
                                return res.json({ status: 200, isVerified: true, token: token });
                            }
                            const emailOTP = Math.floor(
                                100000 + Math.random() * 900000
                            ).toString();
                            user.emailOTP = emailOTP;
                            user.save(err => {
                                if (err) {
                                    return res.json({
                                        status: 500,
                                        message: "Internal server error"
                                    });
                                }
                                res.json({
                                    status: 200,
                                    isVerfied: false,
                                    token: token
                                });

                                sendEmail(emailOTP);
                            })
                        } else {
                            return res.json({
                                staus: 401,
                                message: "Incorrect Email or Password"
                            });
                        }
                    });
                }
            });
        } else {
            return res.json({ status: 404, message: "Missing required details" });
        }
    }
);

router.post("/forgotPassword",
    [check("email").isEmail()],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ status: 422, message: "Invalid email address" });
        }
        next();
    },
    validateCaptcha,
    (req, res) => {
        let email = req.body.email.toString().trim();
        userData.findOne({ email: req.body.email }, async (err, user) => {
            if (err) {
                return res.json({ status: 500, message: "Internal Server Error" });
            }
            else if (!user) {
                return res.json({ status: 500, message: "Email id does not exist" });
            }
            else {
                const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
                user.emailOTP = emailOTP;
                await user.save(err => {
                    if (err) {
                        return res.json({
                            status: 500,
                            message: "Internal server error"
                        });
                    }
                });
                res.json({ status: 200, message: "OTP sent to your email address" });

                //email
                sendEmail(emailOTP);
            }
        });
    });

router.post(
    "/changePassword",
    [check("email").isEmail(), check("password").isLength({ min: 6, max: 15 })],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (errors.errors[0].param == "email") {
                return res.json({ status: 422, message: "Invalid email address" });
            } else {
                return res.json({
                    status: 422,
                    message: "Invalid password, password length must be greater than 5."
                });
            }
        }
        next();
    },
    validateCaptcha,
    (req, res, next) => {
        let emailOTP = req.body.emailOTP;
        if (!emailOTP) {
            return res.json({ status: 422, message: "Missing email OTP" });
        }
        try {
            emailOTP = Number(emailOTP);
            if (!emailOTP) {
                throw "Invalid email OTP";
            }
        } catch (e) {
            return res.json({ status: 422, message: e });
        }
        userData.findOne({ email: req.body.email }, (err, user) => {
            if (err) {
                return res.json({ status: 500, message: "Internal Server Error" });
            }
            if (!user) {
                return res.json({ status: 500, message: "No user found" });
            }
            if (user.emailOTP !== emailOTP) {
                return res.json({ status: 400, message: "Wrong otp , please try again" });
            } else if (req.body.password !== req.body.confPassword) {
                return res.json({ status: 400, message: "Password does not match" });
            } else {
                bcrypt.hash(req.body.password, 8, (err, hashedPassword) => {
                    if (err) {
                        return res.json({ status: 500, message: "Internal Server Error" });
                    }
                    user.password = hashedPassword;
                    user.emailOTP = -1;
                    user.save(err => {
                        if (err) {
                            return res.json({ status: 500, message: "Internal Server Error" });
                        } else {
                            return res.json({
                                status: 200,
                                message: " Password succesfully changed"
                            });
                        }
                    });
                });
            }
        });
    }
);

router.get("/getUserState", verifyToken, (req, res) => {
    const userMongoId = req.userId;
    async function getState() {
        try {
            const user = await userData.findById(userMongoId);
            if (!user) {
                return res.json({ status: 400, auth: false, message: 'User not found!', verified: false });
            }
            if (user.isVerified) {
                return res.json({ status: 200, auth: true, message: 'Token authenticated!', verified: true });
            }
            else {
                return res.json({ status: 400, auth: true, message: 'Token authenticated!', verified: false, email: user.email });
            }
        }
        catch (err) {
            console.log(err);
            return res.json({ status: 500, auth: false, message: 'Internal server error!', verified: false });
        }
    }
    getState();
});



router.post("/logout", (req, res) => {
    return res.json({ status: 200, token: "" });
});

module.exports = router;
