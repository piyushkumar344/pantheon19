const nodemailer = require("nodemailer");
const config = require("./../config");
const path = require("path");

const sendEmail = (emailOTP, email) => {
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.email.username,
            pass: config.email.password
        }
    });

    const message = {
        from: "info@pantheonbit.com",
        to: email,
        subject: "Pantheon Email Verification", // Subject line
        html: `
              <p>Hey there,</p>
              <p>Your Email Otp is: ${emailOTP}</p>

              <p>For any queries or help regarding Pantheon<br>
              Mail us at - info@pantheonbit.com
              </p>

              <p>With Regards,<br>Pantheon Tech Team</p>
              <img width="240" height="150" src="cid:img1@tech.ac" />`,
        attachments: [{
            filename: 'pantheonLogo.jpeg',
            path: path.join(__dirname, 'pantheonLogo.jpeg'),
            cid: 'img1@tech.ac'
        }]
    };
    transport.sendMail(message, function (err, info) {
        if (err) {
            return;
        } else {
            console.log("Email Sent");
        }
    });
}

module.exports = sendEmail;