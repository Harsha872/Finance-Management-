const supabase = require("../config/supabase");

exports.getUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from("users")
            .select("id, name, email, role, status, created_at")
            .order("created_at", { ascending: false });

        if (error) throw error;
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

        const { data: user, error } = await supabase
            .from("users")
            .update({ role })
            .eq("id", req.params.id)
            .select("id, name, email, role, status")
            .single();

        if (error) throw error;
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

        const { data: user, error } = await supabase
            .from("users")
            .update({ status })
            .eq("id", req.params.id)
            .select("id, name, email, role, status")
            .single();

        if (error) throw error;
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};