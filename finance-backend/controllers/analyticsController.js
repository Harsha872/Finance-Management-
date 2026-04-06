const supabase = require("../config/supabase");
const { generatePDF } = require("../utils/pdfService");

const getFinancialData = async () => {
    const { data: records, error } = await supabase
        .from("records")
        .select("*")
        .eq("is_deleted", false);

    if (error) throw error;

    let income = 0, expense = 0;
    const categoryMap = {};
    const monthlyMap = {};

    (records || []).forEach(r => {
        if (r.type === "income") income += r.amount;
        else expense += r.amount;

        if (r.type === "expense") {
            categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount;
        }

        const key = new Date(r.date).toISOString().slice(0, 7);
        if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
        monthlyMap[key][r.type] += r.amount;
    });

    return { income, expense, balance: income - expense, categoryMap, monthlyMap, total: (records || []).length };
};

exports.getSummary = async (req, res) => {
    try {
        const { income, expense, balance, categoryMap } = await getFinancialData();
        const { data: recentRecords } = await supabase
            .from("records")
            .select("*")
            .eq("is_deleted", false)
            .order("date", { ascending: false })
            .limit(5);

        const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        res.json({
            totalIncome: income,
            totalExpense: expense,
            balance,
            topExpenseCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
            recentActivity: recentRecords || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getInsights = async (req, res) => {
    try {
        const { income, expense, balance, categoryMap, monthlyMap, total } = await getFinancialData();

        if (total === 0) {
            return res.json({ insights: [{ type: "neutral", title: "No data yet", message: "Start adding income and expense records to get AI-powered insights." }], income, expense, balance });
        }

        const insights = [];
        const savingRate = income > 0 ? ((income - expense) / income) * 100 : 0;
        const months = Object.keys(monthlyMap).sort();

        if (savingRate >= 30) {
            insights.push({ type: "positive", title: "Excellent saving rate", message: `You are saving ${savingRate.toFixed(1)}% of your income. You are in the top tier of savers. Consider investing the surplus.` });
        } else if (savingRate >= 10) {
            insights.push({ type: "neutral", title: "Moderate saving rate", message: `Your saving rate is ${savingRate.toFixed(1)}%. Aim for 20-30% to build a stronger financial cushion.` });
        } else if (income > 0) {
            insights.push({ type: "negative", title: "Low saving rate", message: `You are saving only ${savingRate.toFixed(1)}% of your income. Review your top expense categories and cut non-essentials.` });
        }

        if (expense > income) {
            const overspend = (expense - income).toLocaleString("en-IN");
            insights.push({ type: "negative", title: "Overspending detected", message: `Your expenses exceed income by ₹${overspend}. This is unsustainable. Immediate budget review recommended.` });
        }

        const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
        if (topCategories.length > 0 && expense > 0) {
            const top = topCategories[0];
            const pct = ((top[1] / expense) * 100).toFixed(1);
            if (parseFloat(pct) > 40) {
                insights.push({ type: "warning", title: "Spending concentration risk", message: `${pct}% of your expenses go to ${top[0]}. Diversifying your spending reduces financial risk.` });
            }
        }

        if (months.length >= 3) {
            const lastThree = months.slice(-3).map(m => monthlyMap[m]);
            const trend = lastThree[2].expense - lastThree[0].expense;
            if (trend > 0) {
                insights.push({ type: "warning", title: "Rising expense trend", message: `Your expenses have grown over the last 3 months. Monitor this trend before it becomes a problem.` });
            } else {
                insights.push({ type: "positive", title: "Expense trend improving", message: "Your expenses have been declining over the last 3 months. Great discipline." });
            }
        }

        if (income > 0 && expense / income > 0.9) {
            insights.push({ type: "negative", title: "Emergency fund risk", message: "You are spending over 90% of your income. You likely have no buffer for unexpected expenses. Build an emergency fund first." });
        }

        res.json({ insights, income, expense, balance, savingRate: parseFloat(savingRate.toFixed(2)), categoryBreakdown: categoryMap });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTrends = async (req, res) => {
    try {
        const { monthlyMap } = await getFinancialData();
        const trends = Object.keys(monthlyMap).sort().map(key => {
            const [year, month] = key.split("-");
            const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "short", year: "numeric" });
            return { key, label, income: monthlyMap[key].income, expense: monthlyMap[key].expense, net: monthlyMap[key].income - monthlyMap[key].expense };
        });
        res.json(trends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCategoryBreakdown = async (req, res) => {
    try {
        const { data: records } = await supabase
            .from("records")
            .select("type, category, amount")
            .eq("is_deleted", false);

        const income = {}, expense = {};
        (records || []).forEach(r => {
            const map = r.type === "income" ? income : expense;
            map[r.category] = (map[r.category] || 0) + r.amount;
        });
        res.json({ income, expense });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.downloadReport = async (req, res) => {
    try {
        const { income, expense, balance, categoryMap } = await getFinancialData();
        const { data: records } = await supabase
            .from("records")
            .select("*")
            .eq("is_deleted", false)
            .order("date", { ascending: false });

        const buffer = await generatePDF({ income, expense, balance, categoryMap, records: records || [] });
        res.set({ "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=finance-report.pdf" });
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.askAssistant = async (req, res) => {
    try {
        const { question } = req.body;
        const { income, expense, balance, categoryMap, total } = await getFinancialData();

        let answer = "I'm not sure how to answer that just yet.";

        if (question === "1") {
            answer = `Hey there! After running the numbers, your total net balance currently sits at ₹${balance.toLocaleString('en-IN')}. ${balance >= 0 ? 'You are doing great!' : 'You currently have a deficit, so keep an eye on those expenses.'}`;
        } else if (question === "2") {
            const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
            if (topCategory) {
                answer = `Looking at your data, your biggest expense category is **${topCategory[0]}**, where you've spent ₹${topCategory[1].toLocaleString('en-IN')}.`;
            } else {
                answer = "You haven't recorded any expenses yet, so there is no top category!";
            }
        } else if (question === "3") {
            answer = `You've added a total of ${total} financial record${total === 1 ? '' : 's'} so far. Keep logging them so I can provide better insights!`;
        } else if (question === "4") {
            const savingRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : 0;
            answer = `Here is a quick rundown: You've brought in ₹${income.toLocaleString('en-IN')} and spent ₹${expense.toLocaleString('en-IN')}. Your overall saving rate is about ${savingRate}%. Keep up the good work!`;
        }

        setTimeout(() => {
            res.json({ answer });
        }, 800);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};