const accountsDB = JSON.parse(localStorage.getItem("accountsDB")) || {};

let journalCounter = 1;

// 🔹 تحميل البيانات أول ما الصفحة تفتح
window.onload = function () {
    loadData();
};

// ➕ إضافة Entry
function addEntry() {
    if (!isLastEntryValid()) {
        alert("كمل البيانات الأول !");
        return;
    }

    saveData();

    const tbody = document.getElementById("tbody");

    for (let i = 0; i < 2; i++) {
        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td><input type="date" class="date" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="saveData()"></td>

        <td><input type="text" class="code" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="fillAccount(this); saveData()"></td>

        <td class="accountName"></td>

        <td><input type="number" class="dr" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="validateAll(); saveData()"></td>

        <td><input type="number" class="cr" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="validateAll(); saveData()"></td>

        <td class="journal">${journalCounter}</td>
        <td></td>
        <td></td>
        <td class="type"></td>
        <td></td>
        `;

        tbody.appendChild(tr);
    }

    journalCounter++;
}

// 🔹 تحميل البيانات
function loadData() {
    const data = JSON.parse(localStorage.getItem("journalData")) || [];
    const tbody = document.getElementById("tbody");

    tbody.innerHTML = "";

    data.forEach(row => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td><input type="date" class="date" value="${row.date || ""}" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="saveData()"></td>

        <td><input type="text" class="code" value="${row.code}" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="fillAccount(this); saveData()"></td>

        <td class="accountName">${accountsDB[row.code] || ""}</td>

        <td><input type="number" class="dr" value="${row.dr}" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="validateAll(); saveData()"></td>

        <td><input type="number" class="cr" value="${row.cr}" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="validateAll(); saveData()"></td>

        <td class="journal">${row.journal}</td>
        <td></td>
        <td></td>
        <td class="type">${getType(row.code)}</td>
        <td></td>
        `;

        tbody.appendChild(tr);

        journalCounter = Math.max(journalCounter, Number(row.journal) + 1);
    });

    validateAll();
}

// 🔹 تحديد الصف الحالي
function setActiveRow(input) {
    const row = input.closest("tr");
    row.classList.add("active");
}

// 🔹 إزالة التحديد
function removeActiveRow(input) {
    const row = input.closest("tr");
    row.classList.remove("active");

    // 🔥 شيل اللون من كل الصفوف
    document.querySelectorAll("#tbody tr").forEach(r => {
        r.classList.remove("ok", "error");
    });
}

// 🔹 النوع
function getType(code) {
    if (code.startsWith("1")) return "Asset";
    if (code.startsWith("2")) return "Liability";
    if (code.startsWith("3")) return "Expense";
    if (code.startsWith("4")) return "Revenue";
    return "";
}

// 🔹 اسم الحساب
function fillAccount(input) {
    const row = input.closest("tr");
    const code = input.value;

    row.querySelector(".accountName").innerText = accountsDB[code] || "";
    row.querySelector(".type").innerText = getType(code);
}

// 🔹 التحقق والتلوين (🔥 أهم جزء)
function validateAll() {
    const rows = document.querySelectorAll("#tbody tr");

    let journals = {};

    // 🔹 تجميع القيم لكل Journal
    rows.forEach(row => {
        const j = row.querySelector(".journal").innerText;
        const dr = Number(row.querySelector(".dr").value || 0);
        const cr = Number(row.querySelector(".cr").value || 0);

        if (!journals[j]) {
            journals[j] = { dr: 0, cr: 0 };
        }

        journals[j].dr += dr;
        journals[j].cr += cr;
    });

    // 🔥 نجيب الجورنال اللي بتعدله
    const activeJournal = document
        .querySelector("#tbody tr.active .journal")
        ?.innerText;

    rows.forEach(row => {
        const j = row.querySelector(".journal").innerText;
        const data = journals[j];

        row.classList.remove("ok", "error");

        // 🔥 بس نفس الجورنال اللي بتعدله
        if (j !== activeJournal) return;

        if (data.dr === 0 && data.cr === 0) return;

        if (data.dr === data.cr) {
            row.classList.add("ok");
        } else {
            row.classList.add("error");
        }
    });
}

// 🔹 تحقق قبل إضافة
function isLastEntryValid() {
    const rows = document.querySelectorAll("#tbody tr");
    if (rows.length === 0) return true;

    const lastJournal = rows[rows.length - 1].querySelector(".journal").innerText;

    let dr = 0;
    let cr = 0;
    let valid = true;

    rows.forEach(row => {
        if (row.querySelector(".journal").innerText === lastJournal) {

            const date = row.querySelector(".date").value;
            const code = row.querySelector(".code").value;
            const drVal = Number(row.querySelector(".dr").value || 0);
            const crVal = Number(row.querySelector(".cr").value || 0);

            if (!date || !code || (drVal === 0 && crVal === 0)) {
                valid = false;
            }

            dr += drVal;
            cr += crVal;
        }
    });

    return valid && dr === cr;
}

// 🔹 حفظ
function saveData() {
    const rows = document.querySelectorAll("#tbody tr");
    let data = [];

    rows.forEach(row => {
        const code = row.querySelector(".code").value;
        if (!code) return;

        data.push({
            code: code,
            dr: Number(row.querySelector(".dr").value || 0),
            cr: Number(row.querySelector(".cr").value || 0),
            journal: row.querySelector(".journal").innerText,
            date: row.querySelector(".date").value
        });
    });

    localStorage.setItem("journalData", JSON.stringify(data));
}