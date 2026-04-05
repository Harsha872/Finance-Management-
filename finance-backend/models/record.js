const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },
    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

recordSchema.index({ type: 1, category: 1, date: -1, isDeleted: 1 });

module.exports = mongoose.models.Record || mongoose.model("Record", recordSchema);