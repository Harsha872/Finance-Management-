const Record = require("../models/record");

exports.createRecord = async (req, res) => {
    try {
        const { amount, type, category, note, date } = req.body;
        const record = await Record.create({ amount, type, category, note, date: date || new Date(), createdBy: req.user.id });
        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRecords = async (req, res) => {
    try {
        const { type, category, startDate, endDate, search, page = 1, limit = 10 } = req.query;
        const filter = { isDeleted: false };
        if (type) filter.type = type;
        if (category) filter.category = { $regex: category, $options: "i" };
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }
        if (search) filter.note = { $regex: search, $options: "i" };
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [records, total] = await Promise.all([
            Record.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)).populate("createdBy", "name"),
            Record.countDocuments(filter)
        ]);
        res.json({ records, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRecord = async (req, res) => {
    try {
        const record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!record) return res.status(404).json({ error: "Record not found" });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const record = await Record.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!record) return res.status(404).json({ error: "Record not found" });
        res.json({ message: "Record deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};