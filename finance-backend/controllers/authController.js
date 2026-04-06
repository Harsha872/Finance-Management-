const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if email already exists
        const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("email", email.toLowerCase().trim())
            .single();

        if (existing) return res.status(409).json({ error: "Email already registered" });

        const hashed = await bcrypt.hash(password, 12);

        const { data: user, error } = await supabase
            .from("users")
            .insert([{
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashed,
                role: role || "admin",
                status: "active"
            }])
            .select("id, name, email, role, status, created_at")
            .single();

        if (error) throw error;

        res.status(201).json({ message: "Registered successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email.toLowerCase().trim())
            .single();

        if (error || !user) return res.status(404).json({ error: "User not found" });
        if (user.status === "inactive") return res.status(403).json({ error: "Account deactivated" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("id, name, email, role, status, created_at")
            .eq("id", req.user.id)
            .single();

        if (error || !user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};