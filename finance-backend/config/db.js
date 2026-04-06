const mongoose = require("mongoose");
let isConnected = false;

module.exports = async () => {
    if (isConnected) return;
    if (!process.env.MONGO_URI) throw new Error("CRITICAL: MONGO_URI is missing in Environment Variables!");
    try {
        const db = await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        isConnected = db.connections[0].readyState === 1;
        console.log("DB Connected");
    } catch (err) {
        console.error("DB Error:", err.message);
        throw new Error("Database connection failed. Is your IP allowed in MongoDB Atlas?");
    }
};