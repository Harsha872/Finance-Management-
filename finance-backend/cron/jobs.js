const cron = require("node-cron");
const Record = require("../models/record");
const { sendEmail } = require("../utils/emailService");

const THRESHOLD = parseInt(process.env.EXPENSE_ALERT_THRESHOLD) || 10000;

const getStats = async () => {
    const records = await Record.find({ isDeleted: false });
    let income = 0, expense = 0;
    records.forEach(r => { if (r.type === "income") income += r.amount; else expense += r.amount; });
    return { income, expense, balance: income - expense };
};

cron.schedule("0 8 * * *", async () => {
    try {
        const { income, expense, balance } = await getStats();
        const savingRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : "0.0";
        await sendEmail("Daily Finance Summary", `
      <h2 style="font-family:sans-serif">Daily Summary</h2>
      <table style="font-family:sans-serif;border-collapse:collapse">
        <tr><td style="padding:8px 16px 8px 0;color:#6b7280">Income</td><td style="font-weight:bold;color:#16a34a">Rs.${income.toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:8px 16px 8px 0;color:#6b7280">Expense</td><td style="font-weight:bold;color:#dc2626">Rs.${expense.toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:8px 16px 8px 0;color:#6b7280">Balance</td><td style="font-weight:bold">Rs.${balance.toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:8px 16px 8px 0;color:#6b7280">Saving Rate</td><td style="font-weight:bold">${savingRate}%</td></tr>
      </table>
    `);
        console.log("Daily summary sent");
    } catch (err) {
        console.error("Daily summary error:", err.message);
    }
});

cron.schedule("0 * * * *", async () => {
    try {
        const { expense } = await getStats();
        if (expense > THRESHOLD) {
            await sendEmail("Expense Alert", `<p style="font-family:sans-serif">Total expenses have exceeded your threshold of Rs.${THRESHOLD.toLocaleString("en-IN")}. Current: <strong>Rs.${expense.toLocaleString("en-IN")}</strong></p>`);
            console.log("Expense alert sent:", expense);
        }
    } catch (err) {
        console.error("Expense alert error:", err.message);
    }
});

cron.schedule("0 9 1 * *", async () => {
    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        const records = await Record.find({ isDeleted: false, date: { $gte: start, $lte: end } });
        let income = 0, expense = 0;
        records.forEach(r => { if (r.type === "income") income += r.amount; else expense += r.amount; });
        const month = start.toLocaleString("default", { month: "long", year: "numeric" });
        await sendEmail(`Monthly Report — ${month}`, `
      <h2 style="font-family:sans-serif">${month} Summary</h2>
      <p style="font-family:sans-serif">Income: Rs.${income.toLocaleString("en-IN")} | Expense: Rs.${expense.toLocaleString("en-IN")} | Saved: Rs.${(income - expense).toLocaleString("en-IN")}</p>
    `);
        console.log("Monthly report sent");
    } catch (err) {
        console.error("Monthly report error:", err.message);
    }
});

console.log("Cron jobs scheduled");