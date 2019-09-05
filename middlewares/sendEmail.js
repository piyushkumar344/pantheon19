const nodemailer = require("nodemailer");

const sendEmail = (emailOTP) => {
    let transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "ae2a3afdf68576", // Change to config.js
            pass: "03f4c3f8c9725c"
        }
    });

    const message = {
        from: "pantheontechteam@gmail.com", // Sender address
        to: "too@gmail.com", // change it
        subject: "Pantheon Email Verification", // Subject line
        html: `
              <h2 align="center">Pantheon BIT Mesra</h2>
              <br>
              <h3>Hey there!</h3>
              <p>OTP for Password Reset: ${emailOTP}</p>

              <p>For queries regarding Pantheon <br>
              Mail us at - pantheontechteam@gmail.com
              </p>

              <p>With Regards,<br>Pantheon Web Team</p>`
    };
    transport.sendMail(message, function (err, info) {
        if (err) {
            console.log(err);
            return res.json({ status: 500, msg: " Internal Server Error " });
        } else {
            console.log("Email Sent");
            return res.json({
                status: 200,
                msg: " Otp sent to your registered email id "
            });
        }
    });
}

module.exports = sendEmail;