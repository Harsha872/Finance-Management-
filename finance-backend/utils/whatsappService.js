const twilio = require("twilio");

exports.sendWhatsApp = async (message) => {
    try {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        await client.messages.create({
            from: process.env.TWILIO_PHONE,
            to:   process.env.TWILIO_TO,
            body: message
        });
        console.log("WhatsApp message sent");
    } catch (err) {
        console.error("WhatsApp send error:", err.message);
    }
};
