const supabase = require("../config/supabase");

exports.createRecord = async (req, res) => {
    try {
        const { amount, type, category, note, date } = req.body;

        const { data: record, error } = await supabase
            .from("records")
            .insert([{
                amount: parseFloat(amount),
                type,
                category: category.trim(),
                note: note || "",
                date: date || new Date().toISOString(),
                created_by: req.user.id,
                is_deleted: false
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRecords = async (req, res) => {
    try {
        const { type, category, startDate, endDate, search, page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        let query = supabase
            .from("records")
            .select("*, users(name)", { count: "exact" })
            .eq("is_deleted", false)
            .order("date", { ascending: false })
            .range(from, to);

        if (type) query = query.eq("type", type);
        if (category) query = query.ilike("category", `%${category}%`);
        if (search) query = query.ilike("note", `%${search}%`);
        if (startDate) query = query.gte("date", new Date(startDate).toISOString());
        if (endDate) query = query.lte("date", new Date(endDate).toISOString());

        const { data: records, error, count } = await query;

        if (error) throw error;

        res.json({
            records,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRecord = async (req, res) => {
    try {
        const { data: record, error } = await supabase
            .from("records")
            .update(req.body)
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!record) return res.status(404).json({ error: "Record not found" });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const { data: record, error } = await supabase
            .from("records")
            .update({ is_deleted: true })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!record) return res.status(404).json({ error: "Record not found" });
        res.json({ message: "Record deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};