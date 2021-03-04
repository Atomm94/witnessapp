const nodemailer = require("nodemailer");
let smtpTransport = require('nodemailer-smtp-transport');
const cron = require('node-cron');

const emailSend = async (email, resetPass) => {
    let mailOptions = {
        from: 'accts.gowitness@gmail.com',
        to: email,
        subject: 'Reset Password!',
        html: `
                <h3 style="color: grey">Your new generated password!</h3>
                <p style="color: cadetblue">${resetPass}</p>
              `
    };
    let schedule = cron.schedule("18 17  1 2 1", function() {
        let transporter = nodemailer.createTransport(smtpTransport({
            service: "gmail",
            host: 'smtp.gmail.com',
            auth: {
                user: 'accts.gowitness@gmail.com',
                pass: 'DOM123%%craw337'
            }
        }));

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    })
    await schedule.stop();
}

module.exports = {
    emailSend
}
