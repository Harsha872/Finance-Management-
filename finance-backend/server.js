require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const setupSwagger = require("./utils/swagger");

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: "Too many requests" } }));

setupSwagger(app);

// Ensure DB connects on every serverless request before routing
app.use(async (req, res, next) => {
    await connectDB();
    next();
});
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/records", require("./routes/recordRoutes"));
app.use("/analytics", require("./routes/analyticsRoutes"));

app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// Simple root route for Vercel health check
app.get("/", (req, res) => {
    res.json({ message: "FinanceOS Backend is fully operational on Vercel 🎉" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// Vercel Serverless Export
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;