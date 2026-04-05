const PDFDocument = require("pdfkit");

exports.generatePDF = (data) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, doc.page.width, 72).fill("#111827");
    doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text("Finance Report", 50, 22, { align: "center" });
    doc.fillColor("#9ca3af").fontSize(10).text(`Generated ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}`, 50, 48, { align: "center" });

    doc.fillColor("#111827").fontSize(15).font("Helvetica-Bold").text("Summary", 50, 100);
    doc.moveTo(50, 120).lineTo(545, 120).strokeColor("#e5e7eb").lineWidth(1).stroke();

    const drawCard = (x, y, label, value, color) => {
        doc.rect(x, y, 148, 64).fillAndStroke("#f9fafb", "#e5e7eb");
        doc.fillColor(color).fontSize(9).font("Helvetica-Bold").text(label, x + 10, y + 12);
        doc.fillColor("#111827").fontSize(16).font("Helvetica-Bold").text(`Rs.${Number(value).toLocaleString("en-IN")}`, x + 10, y + 30);
    };

    drawCard(50, 130, "TOTAL INCOME", data.income, "#16a34a");
    drawCard(208, 130, "TOTAL EXPENSE", data.expense, "#dc2626");
    drawCard(366, 130, "NET BALANCE", data.balance, data.balance >= 0 ? "#2563eb" : "#dc2626");

    if (data.categoryMap && Object.keys(data.categoryMap).length > 0) {
        doc.fillColor("#111827").fontSize(15).font("Helvetica-Bold").text("Expense by Category", 50, 222);
        doc.moveTo(50, 242).lineTo(545, 242).strokeColor("#e5e7eb").stroke();
        let cy = 252;
        Object.entries(data.categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([cat, amt]) => {
            doc.fillColor("#374151").fontSize(10).font("Helvetica").text(cat, 60, cy);
            doc.fillColor("#111827").font("Helvetica-Bold").text(`Rs.${Number(amt).toLocaleString("en-IN")}`, 400, cy, { width: 130, align: "right" });
            cy += 20;
        });
    }

    if (data.records?.length > 0) {
        doc.addPage();
        doc.fillColor("#111827").fontSize(15).font("Helvetica-Bold").text("Transactions", 50, 50);
        doc.rect(50, 70, 495, 22).fill("#111827");
        doc.fillColor("#fff").fontSize(8).font("Helvetica-Bold");
        ["DATE", "TYPE", "CATEGORY", "NOTE", "AMOUNT"].forEach((h, i) => {
            doc.text(h, [60, 150, 220, 320, 460][i], 78);
        });

        let ry = 96;
        data.records.slice(0, 40).forEach((r, i) => {
            doc.rect(50, ry, 495, 20).fill(i % 2 === 0 ? "#fff" : "#f9fafb");
            const col = r.type === "income" ? "#16a34a" : "#dc2626";
            doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text(new Date(r.date).toLocaleDateString("en-IN"), 60, ry + 6);
            doc.fillColor(col).font("Helvetica-Bold").text(r.type.toUpperCase(), 150, ry + 6);
            doc.fillColor("#374151").font("Helvetica").text(r.category, 220, ry + 6, { width: 90 });
            doc.text((r.note || "-").slice(0, 28), 320, ry + 6, { width: 130 });
            doc.fillColor(col).font("Helvetica-Bold").text(`Rs.${Number(r.amount).toLocaleString("en-IN")}`, 460, ry + 6, { width: 75, align: "right" });
            ry += 20;
            if (ry > doc.page.height - 60) { doc.addPage(); ry = 50; }
        });
    }

    doc.fillColor("#9ca3af").fontSize(8).text("Finance Management System", 50, doc.page.height - 35, { align: "center" });
    doc.end();
});