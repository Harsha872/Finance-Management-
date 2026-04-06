const supabase = require("../config/supabase");

exports.createRecord = async (req, res) => {
    try {
        const { amount, type, category, note, date } = req.body;

        const { data, error } = await supabase.from("records")
            .insert({ amount, type, category, note: note || "", date: date || new Date().toISOString(), created_by: req.user.id })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ ...data, _id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRecords = async (req, res) => {
    try {
        const { type, category, startDate, endDate, search, page = 1, limit = 10 } = req.query;

        let query = supabase.from("records").select("*, users(name)", { count: "exact" }).eq("is_deleted", false);

        if (type) query = query.eq("type", type);
        if (category) query = query.ilike("category", `%${category}%`);
        if (search) query = query.ilike("note", `%${search}%`);
        if (startDate) query = query.gte("date", startDate);
        if (endDate) query = query.lte("date", endDate);

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        const { data, error, count } = await query.order("date", { ascending: false }).range(from, to);

        if (error) throw error;

        res.json({
            records: (data || []).map(r => ({ ...r, _id: r.id })),
            pagination: { total: count, page: pageNum, limit: limitNum, totalPages: Math.ceil(count / limitNum) }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRecord = async (req, res) => {
    try {
        const { data, error } = await supabase.from("records")
            .update({ ...req.body, updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: "Record not found" });
        res.json({ ...data, _id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const { data, error } = await supabase.from("records")
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: "Record not found" });
        res.json({ message: "Record deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
