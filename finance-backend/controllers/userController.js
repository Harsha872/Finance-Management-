const User = require("../models/user");

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!["viewer", "analyst", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role" });
        if (req.params.id === req.user.id) return res.status(400).json({ error: "Cannot change your own role" });
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["active", "inactive"].includes(status)) return res.status(400).json({ error: "Invalid status" });
        if (req.params.id === req.user.id) return res.status(400).json({ error: "Cannot change your own status" });
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};