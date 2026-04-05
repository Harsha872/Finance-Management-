const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.sendEmail = async (subject, html) => {
    try {
        await transporter.sendMail({ from: process.env.EMAIL_USER, to: process.env.EMAIL_RECEIVER, subject, html });
    } catch (err) {
        console.error("Email error:", err.message);
    }
};