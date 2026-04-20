
const accountsDB = JSON.parse(localStorage.getItem("accountsDB")) || {};
const journalData = JSON.parse(localStorage.getItem("journalData")) || [];

function getType(code) {
    code = code.toString().trim(); // 🔥 مهم جدًا

    if (code.startsWith("1")) return "Asset";
    if (code.startsWith("2")) return "Liability";
    if (code.startsWith("3")) return "Expense";
    if (code.startsWith("4")) return "Revenue";
}

function calculateIncomeStatement() {
    let totalRevenue = 0;
    let totalExpense = 0;

    journalData.forEach(row => {
        if (!row.code) return;

        const type = getType(row.code);

        const dr = Number(row.dr || 0);
        const cr = Number(row.cr || 0);

        // 🔥 خد الكريديت بس للإيرادات
        if (type === "Revenue") {
            totalRevenue += cr;
        }

        // 🔥 خد الديبيت بس للمصروفات
        if (type === "Expense") {
            totalExpense += dr;
        }
    });

    return {
        revenue: totalRevenue,
        expense: totalExpense,
        net: totalRevenue - totalExpense
    };
}

// 🔹 عرض الجدول
function buildTable() {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    let grouped = {};

    // 🔹 نجمع البيانات لكل كود
    journalData.forEach(row => {
        if (!row.code) return;

        const code = row.code.toString().trim();

        if (!grouped[code]) {
            grouped[code] = { dr: 0, cr: 0 };
        }

        grouped[code].dr += Number(row.dr || 0);
        grouped[code].cr += Number(row.cr || 0);
    });

    // 🔥 ترتيب الأكواد
    const sortedCodes = Object.keys(grouped).sort((a, b) => {
        if (a[0] !== b[0]) return a[0] - b[0];
        if (a.length !== b.length) return a.length - b.length;
        return Number(a) - Number(b);
    });

    let totalRevenue = 0;
    let totalExpense = 0;

    let currentHeader = "";

    sortedCodes.forEach(code => {

        const type = getType(code);

        // ❌ نتجاهل أي حاجة مش Revenue أو Expense
        if (type !== "Revenue" && type !== "Expense") return;

        // 🔹 الهيدر
        if (type !== currentHeader) {
            const headerRow = document.createElement("tr");

            headerRow.innerHTML = `
            <td colspan="2" style="background:#d4edda; font-weight:bold">
                ${type === "Revenue" ? "Revenues" : "Expenses"}
            </td>`;

            tbody.appendChild(headerRow);
            currentHeader = type;
        }

        let amount = 0;

        // 🔥 نفس المنطق اللي اشتغل معاك
        if (type === "Revenue") {
            amount = grouped[code].cr;
            totalRevenue += amount;
        }

        if (type === "Expense") {
            amount = grouped[code].dr;
            totalExpense += amount;
        }

        if (amount === 0) return;

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td style="padding-left:${(code.length - 1) * 5}px">
            ${code} - ${accountsDB[code] || ""}
        </td>
        <td>${amount}</td>
        `;

        tbody.appendChild(tr);
    });

    // 🔥 Totals
    tbody.innerHTML += `
    <tr><td style="background:#cce5ff"><b>Total Revenue</b></td><td style="background:#cce5ff"><b>${totalRevenue}</b></td></tr>
    <tr><td style="background:#fff3cd"><b>Total Expense</b></td><td style="background:#fff3cd"><b>${totalExpense}</b></td></tr>
    <tr><td style="background:#ffcccc; color:black"><b>Net Income</b></td><td style="background:#ffcccc; color:black"><b>${totalRevenue - totalExpense}</b></td></tr>
    `;
}

buildTable();
console.log(journalData);
console.log(grouped);