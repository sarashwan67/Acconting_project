
const SEED_ACCOUNTS = {
    "1": "الأصول",
    "2": "الالتزامات و حقوق الملكية",
    "3": "المصروفات",
    "4": "الإيرادات",
    "101": "الأصول الثابتة",
    "102": "البنوك و النقدية",
    "103": "العملاء",
    "201": "حسابات رأس المال",
    "202": "التزامات غير متداولة",
    "301": "مصروفات التشغيل",
    "302": "مصروفات إدارية",
    "401": "إيرادات مباشرة",
    "101001": "الأصول الثابتة - ثلاجات التبريد",
    "101002": "الأصول الثابتة",
    "101003": "الأصول الثابتة - كمبيوتر و طابعات و برامج",
    "102001": "حسابات البنوك",
    "102002": "حسابات النقدية",
    "103001": "عملاء - محليين",
    "201001": "رأس المال المدفوع",
    "202001": "التزامات الإيجار",
    "301001": "مصروفات التشغيل",
    "302001": "مصروفات عمومية",
    "401001": "إيرادات المشاريع",
    "101001001": "الأصول الثابتة - ثلاجة التبريد",
    "101001002": "الأصول الثابتة - ثلاجة التبريد",
    "101001003": "الأصول الثابتة - ثلاجة التبريد",
    "101002001": "الأصول الثابتة - كباسات تبريد",
    "101002002": "الأصول الثابتة - كباسات تبريد",
    "101003001": "الأصول الثابتة - كمبيوتر و طابعات - Laptop",
    "101003002": "الأصول الثابتة - كمبيوتر و طابعات - Desktop",
    "101003003": "الأصول الثابتة - كمبيوتر و طابعات - طابعات",
    "101003004": "الأصول الثابتة - كمبيوتر و طابعات - ماكينة تصوير",
    "101003005": "الأصول الثابتة - كمبيوتر و طابعات - Tablet",
    "102001001": "حساب بنك - CIB - بالجنية المصرى",
    "102001002": "حساب بنك - CIB - بالدولار",
    "102002001": "نقدية بالخزينة - الرئيسية - بالجنية المصرى",
    "103001001": "عملاء - محليين",
    "201001001": "رأس المال - المدفوع",
    "202001001": "الإيجار",
    "301001001": "تكلفة مبيعات - تمور خام",
    "302001001": "أجور و مرتبات",
    "401001001": "مبيعات تمور خام"
};

const SEED_JOURNALS = [];

function initDefaultData() {
    if (!localStorage.getItem("accountsDB")) {
        localStorage.setItem("accountsDB", JSON.stringify(SEED_ACCOUNTS));
    }
    if (!localStorage.getItem("journalData")) {
        localStorage.setItem("journalData", JSON.stringify(SEED_JOURNALS));
    }
}

// 🔢 Calculate next journal counter from existing data
function calculateJournalCounter() {
    const data = JSON.parse(localStorage.getItem("journalData")) || [];
    const maxJournal = data.reduce((max, row) => 
        Math.max(max, Number(row.journal) || 0), 0);
    return maxJournal + 1;
}

// 🌍 Global variables
let accountsDB = {};
let journalCounter = 1;

// =====================================================
// 🏠 ACCOUNTS TABLE FUNCTIONS
// =====================================================

// 🔥 عرض بيانات الحسابات
function buildTable() {
    const tbody = document.getElementById("tbody");
    if (!tbody) return; // Exit if not on accounts page
    
    accountsDB = JSON.parse(localStorage.getItem("accountsDB")) || {};
    tbody.innerHTML = "";

    Object.keys(accountsDB)
        .sort((a, b) => {
            if (a[0] !== b[0]) return a[0] - b[0];
            if (a.length !== b.length) return a.length - b.length;
            return Number(a) - Number(b);
        })
        .forEach(code => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td style="padding-left:${(code.length - 1) * 5}px">
                <input value="${code}" class="code">
            </td>
            <td><input value="${accountsDB[code]}" class="name"></td>
            <td><button type="button" onclick="deleteRow(this)">❌</button></td>
            `;
            tbody.appendChild(tr);
        });
}

// ➕ إضافة صف جديد في جدول الحسابات
function addRow() {
    const tbody = document.getElementById("tbody");
    if (!tbody) return;
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td><input class="code"></td>
    <td><input class="name"></td>
    <td><button type="button" onclick="deleteRow(this)">❌</button></td>
    `;
    tbody.appendChild(tr);
}

// ❌ حذف صف من جدول الحسابات
function deleteRow(btn) {
    btn.closest("tr").remove();
}

// 💾 حفظ جدول الحسابات
function saveAccounts() {
    const rows = document.querySelectorAll("#tbody tr");
    let newDB = {};

    rows.forEach(row => {
        const code = row.querySelector(".code")?.value.trim();
        const name = row.querySelector(".name")?.value.trim();
        if (code && name) newDB[code] = name;
    });

    localStorage.setItem("accountsDB", JSON.stringify(newDB));
    alert("Saved Successfully ✅");
    buildTable();
}

// =====================================================
// 📒 JOURNAL ENTRIES FUNCTIONS
// =====================================================

// ➕ إضافة قيد يومية جديد
function addEntry() {
    if (!isLastEntryValid()) {
        alert("أكمل البيانات أولاً !");
        return;
    }

    saveJournalData();

    const tbody = document.getElementById("tbody");
    if (!tbody) return;

    for (let i = 0; i < 2; i++) {
        const tr = document.createElement("tr");
        const isFirstRow = (i === 0);
        
        tr.innerHTML = `
        <td><input type="date" class="date" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="saveJournalData()"></td>
        <td><input type="text" class="code" 
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="fillAccount(this); saveJournalData()"></td>
        <td class="accountName"></td>
        <td><input type="number" class="dr" step="0.01"
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="validateAll(); saveJournalData()"></td>
        <td><input type="number" class="cr" step="0.01"
            onfocus="setActiveRow(this)" 
            onblur="removeActiveRow(this)" 
            oninput="validateAll(); saveJournalData()"></td>
        <td class="journal">${journalCounter}</td>
        <td></td>
        <td></td>
        <td class="type"></td>
        <td>
            ${isFirstRow ? 
                `<button type="button" onclick="deleteJournal(this)" 
                    style="background:#ff4444;color:white;border:none;padding:5px 10px;cursor:pointer;border-radius:4px;" 
                    title="حذف هذا القيد">🗑️</button>` 
                : ''}
        </td>
        `;
        tbody.appendChild(tr);
    }

    journalCounter++;
    validateAll();
}

// 🔹 تحميل بيانات القيود
function loadJournalData() {
    const tbody = document.getElementById("tbody");
    if (!tbody) return;
    
    const data = JSON.parse(localStorage.getItem("journalData")) || [];
    tbody.innerHTML = "";
    
    let addedJournals = new Set();

    data.forEach(row => {
        const tr = document.createElement("tr");
        const isFirstChild = !addedJournals.has(row.journal);
        if (isFirstChild) addedJournals.add(row.journal);

        tr.innerHTML = `
        <td><input type="date" class="date" value="${row.date || ""}" 
            onfocus="setActiveRow(this)" onblur="removeActiveRow(this)" oninput="saveJournalData()"></td>
        <td><input type="text" class="code" value="${row.code || ""}" 
            onfocus="setActiveRow(this)" onblur="removeActiveRow(this)" oninput="fillAccount(this); saveJournalData()"></td>
        <td class="accountName">${accountsDB[row.code] || ""}</td>
        <td><input type="number" class="dr" step="0.01" value="${row.dr || 0}" 
            onfocus="setActiveRow(this)" onblur="removeActiveRow(this)" oninput="validateAll(); saveJournalData()"></td>
        <td><input type="number" class="cr" step="0.01" value="${row.cr || 0}" 
            onfocus="setActiveRow(this)" onblur="removeActiveRow(this)" oninput="validateAll(); saveJournalData()"></td>
        <td class="journal">${row.journal}</td>
        <td></td>
        <td></td>
        <td class="type">${getType(row.code)}</td>
        <td>
            ${isFirstChild ? 
                `<button type="button" onclick="deleteJournal(this)" 
                    style="background:#ff4444;color:white;border:none;padding:5px 10px;cursor:pointer;border-radius:4px;"
                    title="حذف هذا القيد">🗑️</button>` 
                : ''}
        </td>
        `;
        tbody.appendChild(tr);
        journalCounter = Math.max(journalCounter, Number(row.journal) + 1);
    });

    validateAll();
}

// 🔹 تحديد الصف النشط
function setActiveRow(input) {
    const row = input.closest("tr");
    if (row) row.classList.add("active");
}

// 🔹 إزالة التحديد
function removeActiveRow(input) {
    const row = input.closest("tr");
    if (row) row.classList.remove("active");
    document.querySelectorAll("#tbody tr").forEach(r => {
        r.classList.remove("ok", "error");
    });
}

// 🔹 تحديد نوع الحساب
function getType(code) {
    if (!code) return "";
    if (code.startsWith("1")) return "Asset";
    if (code.startsWith("2")) return "Liability";
    if (code.startsWith("3")) return "Expense";
    if (code.startsWith("4")) return "Revenue";
    return "";
}

// 🔹 ملء اسم الحساب تلقائياً
function fillAccount(input) {
    const row = input.closest("tr");
    if (!row) return;
    
    const code = input.value;
    const nameCell = row.querySelector(".accountName");
    const typeCell = row.querySelector(".type");
    
    if (nameCell) nameCell.innerText = accountsDB[code] || "";
    if (typeCell) typeCell.innerText = getType(code);
}

// 🔹 التحقق من توازن القيود وتلوينها
function validateAll() {
    const rows = document.querySelectorAll("#tbody tr");
    let journals = {};

    rows.forEach(row => {
        const j = row.querySelector(".journal")?.innerText;
        if (!j) return;
        
        const dr = Number(row.querySelector(".dr")?.value || 0);
        const cr = Number(row.querySelector(".cr")?.value || 0);

        if (!journals[j]) journals[j] = { dr: 0, cr: 0 };
        journals[j].dr += dr;
        journals[j].cr += cr;
    });

    const activeJournal = document
        .querySelector("#tbody tr.active .journal")
        ?.innerText;

    rows.forEach(row => {
        const j = row.querySelector(".journal")?.innerText;
        if (!j || !journals[j]) return;
        
        const data = journals[j];
        row.classList.remove("ok", "error");

        if (j !== activeJournal) return;
        if (data.dr === 0 && data.cr === 0) return;

        if (Math.abs(data.dr - data.cr) < 0.01) {
            row.classList.add("ok");
        } else {
            row.classList.add("error");
        }
    });
}

// 🔹 التحقق قبل إضافة قيد جديد
function isLastEntryValid() {
    const rows = document.querySelectorAll("#tbody tr");
    if (rows.length === 0) return true;

    const lastJournal = rows[rows.length - 1].querySelector(".journal")?.innerText;
    if (!lastJournal) return true;

    let dr = 0, cr = 0, valid = true;

    rows.forEach(row => {
        if (row.querySelector(".journal")?.innerText === lastJournal) {
            const date = row.querySelector(".date")?.value;
            const code = row.querySelector(".code")?.value;
            const drVal = Number(row.querySelector(".dr")?.value || 0);
            const crVal = Number(row.querySelector(".cr")?.value || 0);

            if (!date || !code || (drVal === 0 && crVal === 0)) {
                valid = false;
            }
            dr += drVal;
            cr += crVal;
        }
    });

    return valid && Math.abs(dr - cr) < 0.01;
}

// 🔹 حفظ بيانات القيود
function saveJournalData() {
    const rows = document.querySelectorAll("#tbody tr");
    let data = [];

    rows.forEach(row => {
        const code = row.querySelector(".code")?.value.trim();
        if (!code) return;

        data.push({
            code: code,
            dr: Number(row.querySelector(".dr")?.value || 0),
            cr: Number(row.querySelector(".cr")?.value || 0),
            journal: row.querySelector(".journal")?.innerText || "",
            date: row.querySelector(".date")?.value || ""
        });
    });

    localStorage.setItem("journalData", JSON.stringify(data));
}

// ❌ حذف قيد يومية كامل (الصفين معاً)
function deleteJournal(btn) {
    const row = btn.closest("tr");
    if (!row) return;
    
    const journalId = row.querySelector(".journal")?.innerText;
    if (!journalId) return;
    
    if (!confirm(`حذف قيد اليومية رقم ${journalId}؟`)) return;

    const rows = document.querySelectorAll("#tbody tr");
    rows.forEach(r => {
        if (r.querySelector(".journal")?.innerText === journalId) {
            r.remove();
        }
    });

    saveJournalData();
    validateAll();
}

// =====================================================
// 🔄 UTILITY & DEBUG FUNCTIONS
// =====================================================

// 🔄 إعادة ضبط كل البيانات للوضع الافتراضي (للتجربة/التصحيح)
function resetDemoData() {
    if (!confirm("⚠️ هل تريد إعادة ضبط جميع البيانات للوضع الافتراضي؟\nسيتم فقدان أي تعديلات محلية.")) return;
    
    localStorage.removeItem("accountsDB");
    localStorage.removeItem("journalData");
    
    initDefaultData();
    accountsDB = JSON.parse(localStorage.getItem("accountsDB")) || {};
    journalCounter = calculateJournalCounter();
    
    // إعادة تحميل الجداول حسب الصفحة الحالية
    if (document.getElementById("tbody")) {
        // Check if we're on accounts page (has .name inputs) or journal page (has .dr/.cr inputs)
        const firstRow = document.querySelector("#tbody tr");
        if (firstRow?.querySelector(".name")) {
            buildTable();
        } else {
            loadJournalData();
        }
    }
    
    alert("✅ تم إعادة الضبط بنجاح!");
}

// 📤 تصدير البيانات كملف JSON (للتصدير اليدوي)
function exportData() {
    const data = {
        accountsDB: JSON.parse(localStorage.getItem("accountsDB")) || {},
        journalData: JSON.parse(localStorage.getItem("journalData")) || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounting_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 📥 استيراد بيانات من ملف JSON
function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            
            if (imported.accountsDB) {
                localStorage.setItem("accountsDB", JSON.stringify(imported.accountsDB));
            }
            if (imported.journalData) {
                localStorage.setItem("journalData", JSON.stringify(imported.journalData));
            }
            
            alert("✅ تم الاستيراد بنجاح! جاري إعادة التحميل...");
            location.reload();
        } catch (err) {
            alert("❌ ملف غير صالح: " + err.message);
        }
    };
    reader.readAsText(file);
}

// =====================================================
// 🚀 INITIALIZATION
// =====================================================

window.onload = function () {
    // 1️⃣ Seed data if empty (for GitHub/demo)
    initDefaultData();
    
    // 2️⃣ Load accounts reference
    accountsDB = JSON.parse(localStorage.getItem("accountsDB")) || {};
    
    // 3️⃣ Calculate journal counter
    journalCounter = calculateJournalCounter();
    
    // 4️⃣ Load appropriate table based on page
    const tbody = document.getElementById("tbody");
    if (tbody) {
        // Detect page type by checking for journal-specific columns
        const hasJournalCols = tbody.querySelector(".dr, .cr, .journal");
        if (hasJournalCols) {
            loadJournalData();
        } else {
            buildTable();
        }
    }
};