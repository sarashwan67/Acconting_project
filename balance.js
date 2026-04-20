const accountsDB = JSON.parse(localStorage.getItem("accountsDB")) || {};
const journalData = JSON.parse(localStorage.getItem("journalData")) || [];

// 🔹 اسم الحساب (حتى لو parent)
function getAccountName(code) {
    if (accountsDB[code]) return accountsDB[code];

    for (let i = code.length - 1; i > 0; i--) {
        const parent = code.substring(0, i);
        if (accountsDB[parent]) return accountsDB[parent];
    }

    return "—";
}

// 🔹 مستويات الكود
function getAllLevels(code) {
    let levels = [];
    for (let i = 1; i <= code.length; i += 3) {
        levels.push(code.substring(0, i));
    }
    return levels;
}

// 🔹 تجميع البيانات
function groupData() {
    let grouped = {};

    journalData.forEach(row => {
        if (!row.code) return;

        const code = row.code.toString().trim();
        const levels = getAllLevels(code);

        levels.forEach(level => {
            if (!grouped[level]) {
                grouped[level] = { dr: 0, cr: 0 };
            }

            grouped[level].dr += Number(row.dr || 0);
            grouped[level].cr += Number(row.cr || 0);
        });
    });

    return grouped;
}

// 🔥 بناء الجدول
function buildTable() {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    const grouped = groupData();

    const sortedCodes = Object.keys(grouped).sort((a, b) => {
        if (a[0] !== b[0]) return a[0] - b[0];
        if (a.length !== b.length) return a.length - b.length;
        return Number(a) - Number(b);
    });

    let assetsTotal = 0;
    let liabilitiesTotal = 0;
    let equityTotal = 0;

    let currentSection = "";

    sortedCodes.forEach(code => {

        let type = "";

        if (code.startsWith("1")) type = "Assets";
        else if (code.startsWith("201")) type = "Equity";
        else if (code.startsWith("2")) type = "Liabilities";
        else return;

        const dr = grouped[code].dr;
        const cr = grouped[code].cr;

        let amount = (type === "Assets") ? dr : cr;

        const isLeaf = code.length > 3;
        if (amount === 0 && isLeaf) return;

        // 🔥 ألوان الهيدرز
        let headerColor = "";
        if (type === "Assets") headerColor = "#cce5ff";
        else if (type === "Liabilities") headerColor = "#f6d1af";
        else if (type === "Equity") headerColor = "#fff3cd";

        // 🔹 الهيدر
        if (type !== currentSection) {
            const headerRow = document.createElement("tr");

            headerRow.innerHTML = `
            <td colspan="3" style="background:${headerColor}; font-weight:bold; color:black;">
                ${type}
            </td>`;

            tbody.appendChild(headerRow);
            currentSection = type;
        }

        // 🔹 تجميع التوتال
        if (type === "Assets") assetsTotal += amount;
        if (type === "Liabilities") liabilitiesTotal += amount;
        if (type === "Equity") equityTotal += amount;

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td style="padding-left:${(code.length - 1) * 5}px">
            ${code}
        </td>
        <td>${getAccountName(code)}</td>
        <td>${amount !== 0 ? amount : ""}</td>
        `;

        tbody.appendChild(tr);
    });

    // 🔥 Totals
    tbody.innerHTML += `
<tr style="background:#cce5ff; font-weight:bold; color:black;">
    <td colspan="2">Total Assets</td>
    <td>${assetsTotal}</td>
</tr>

<tr style="background:#f8d7da; font-weight:bold; color:black;">
    <td colspan="2">Liabilities + Equity</td>
    <td>${liabilitiesTotal + equityTotal}</td>
</tr>
`;

    // 🔥 Check
    if (assetsTotal === (liabilitiesTotal + equityTotal)) {
        tbody.innerHTML += `
        <tr style="background:#d4edda; font-weight:bold; color:black;">
            <td colspan="3">Balanced ✅</td>
        </tr>`;
    } else {
        tbody.innerHTML += `
        <tr style="background:#f8d7da; font-weight:bold; color:black;">
            <td colspan="3">Not Balanced ❌</td>
        </tr>`;
    }
}

// تشغيل
buildTable();