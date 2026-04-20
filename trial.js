const accountsDB = JSON.parse(localStorage.getItem("accountsDB")) || {};
const journalData = JSON.parse(localStorage.getItem("journalData")) || [];

// 🔥 تخزين القيم (بالمرة نخليه بالكود مش index)
let trialData = JSON.parse(localStorage.getItem("trialData")) || {};

function getType(code) {
    if (code.startsWith("1")) return "Asset";
    if (code.startsWith("2")) return "Liability";
    if (code.startsWith("3")) return "Expense";
    if (code.startsWith("4")) return "Revenue";

}

// 🔹 تجميع البيانات حسب الكود
function groupData() {
    let grouped = {};

    journalData.forEach(row => {
        if (!row.code) return;

        if (!grouped[row.code]) {
            grouped[row.code] = { dr: 0, cr: 0 };
        }

        grouped[row.code].dr += row.dr;
        grouped[row.code].cr += row.cr;
    });

    return grouped;
}

function buildTable() {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    const grouped = groupData();

    // 🔥 ترتيب الأكواد صح
    const sortedCodes = Object.keys(grouped).sort((a, b) => {

        // 1️⃣ حسب أول رقم (1 → 4)
        if (a[0] !== b[0]) {
            return a[0] - b[0];
        }

        // 2️⃣ حسب طول الكود
        if (a.length !== b.length) {
            return a.length - b.length;
        }

        // 3️⃣ ترتيب رقمي
        return Number(a) - Number(b);
    });

    let currentHeader = "";

    sortedCodes.forEach(code => {

        // 🔹 الهيدر (1 / 2 / 3 / 4)
        const header = code[0];

        if (header !== currentHeader) {
            const headerRow = document.createElement("tr");

            let headerColor = "";

            if (header === "1") headerColor = "#cce5ff";      // Assets
            else if (header === "2") headerColor = "#f8d7da"; // Liabilities
            else if (header === "3") headerColor = "#fff3cd"; // Expenses
            else if (header === "4") headerColor = "#d4edda"; // Revenue

            headerRow.innerHTML = `
<td colspan="10" style="background:${headerColor}; font-weight:bold">
    ${header} - ${accountsDB[header] || ""}
</td>
`;

            tbody.appendChild(headerRow);
            currentHeader = header;
        }

        const begDr = trialData[code]?.begDr || 0;
        const begCr = trialData[code]?.begCr || 0;

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td style="padding-left:${(code.length - 1) * 5}px">${code}</td>
        <td>${accountsDB[code] || ""}</td>

        <td><input type="number" value="${begDr}" 
            oninput="saveTrialData('${code}', this, 'begDr')"></td>

        <td><input type="number" value="${begCr}" 
            oninput="saveTrialData('${code}', this, 'begCr')"></td>

        <td class="movDr">${grouped[code].dr}</td>
        <td class="movCr">${grouped[code].cr}</td>

        <td class="totDr">0</td>
        <td class="totCr">0</td>

        <td class="balDr">0</td>
        <td class="balCr">0</td>
        `;

        tbody.appendChild(tr);
    });

    calculate();
}

// 🔹 حفظ البيانات (بالكود مش index 🔥)
function saveTrialData(code, input, field) {
    if (!trialData[code]) trialData[code] = {};

    trialData[code][field] = Number(input.value || 0);

    localStorage.setItem("trialData", JSON.stringify(trialData));

    calculate();
}

// 🔹 الحسابات
function calculate() {
    const rows = document.querySelectorAll("#tbody tr");

    rows.forEach(row => {
        const begDr = Number(row.children[2].querySelector("input").value || 0);
        const begCr = Number(row.children[3].querySelector("input").value || 0);

        const movDr = Number(row.querySelector(".movDr").innerText);
        const movCr = Number(row.querySelector(".movCr").innerText);

        const code = row.children[0].innerText;
        const type = getType(code);

        const totalDr = begDr + movDr;
        const totalCr = begCr + movCr;

        row.querySelector(".totDr").innerText = totalDr;
        row.querySelector(".totCr").innerText = totalCr;

        let balDr = "";
        let balCr = "";

        if (type === "Asset" || type === "Expense") {
            const result = totalDr - totalCr;
            if (result > 0) balDr = result;
        } else {
            const result = totalCr - totalDr;
            if (result > 0) balCr = result;
        }

        row.querySelector(".balDr").innerText = balDr;
        row.querySelector(".balCr").innerText = balCr;
    });
}

// تشغيل
buildTable();