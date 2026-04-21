/* ================= GLOBAL ================= */
let count = 0;

/* ================= ADD ROW ================= */
function addRow() {
    const table = document.querySelector("#tableBody");
    count++;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${count}</td>
        <td><input type="text" value="Item"></td>
        <td>ID${count}</td>

        <!-- Qty -->
        <td><input type="number" value="1" class="qty"></td>

        <!-- ✅ UOM as TEXT -->
        <td><input type="text" value="PCS" class="uom"></td>

        <!-- Reason -->
        <td><input type="text" placeholder="Reason"></td>

        <!-- Rate -->
        <td><input type="number" value="0" class="rate"></td>

        <!-- Tax -->
        <td><input type="number" value="18" class="tax"></td>

        <!-- Discount -->
        <td><input type="number" value="20" class="discount"></td>

        <!-- Total -->
        <td class="row-total">₹0</td>
    `;

    table.appendChild(row);
    attachRowEvents(row);
}

/* ================= COMMENTS ================= */
function addComment() {
    const input = document.getElementById("commentInput");
    const text = input.value.trim();

    if (!text) return alert("Enter a comment!");

    const div = document.createElement("div");
    div.className = "cn-comment";

    div.innerHTML = `
        <div class="avatar">👤</div>
        <div>
            <strong>You – ${new Date().toLocaleString()}</strong>
            <p>${text}</p>
        </div>
    `;

    document.getElementById("commentList").prepend(div);
    input.value = "";
}

/* ================= TABS ================= */
function openTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
    document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

/* ================= DATA ================= */
let data = [
    { name: "T-shirtEdit", id: "CT101", uom: "PCS", qty: 1, rate: 120, tax: 18, discount: 20 },
    { name: "T-shirtEdit", id: "CT101", uom: "PCS", qty: 10, rate: 120, tax: 18, discount: 20 },
    { name: "T-shirtEdit", id: "CT101", uom: "PCS", qty: 10, rate: 120, tax: 18, discount: 20 }
];

/* ================= CALC ================= */
function calculateTotal(qty, rate, tax, discount) {
    let base = qty * rate;
    let discountAmount = base * discount / 100;
    let afterDiscount = base - discountAmount;
    let taxAmount = afterDiscount * tax / 100;
    return afterDiscount + taxAmount;
}

/* ================= RENDER ================= */
function renderTable() {
    const tbody = document.getElementById("tableBody");
    const totalEl = document.getElementById("grandTotal");

    tbody.innerHTML = "";
    let grandTotal = 0;

    data.forEach((item, index) => {
        let total = calculateTotal(item.qty, item.rate, item.tax, item.discount);
        grandTotal += total;

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.id}</td>

            <td><input type="number" value="${item.qty}" class="qty"></td>

            <!-- ✅ TEXT UOM -->
            <td><input type="text" value="${item.uom}" class="uom"></td>

            <td><input type="text" placeholder="Reason"></td>

            <td><input type="number" value="${item.rate}" class="rate"></td>

            <td><input type="number" value="${item.tax}" class="tax"></td>

            <td><input type="number" value="${item.discount}" class="discount"></td>

            <td class="row-total">₹${total.toLocaleString()}</td>
        `;

        tbody.appendChild(row);
        attachRowEvents(row);
    });

    totalEl.innerText = "₹" + grandTotal.toLocaleString();
}

/* ================= EVENTS ================= */
function attachRowEvents(row) {
    const qty = row.querySelector(".qty");
    const rate = row.querySelector(".rate");
    const tax = row.querySelector(".tax");
    const discount = row.querySelector(".discount");
    const totalCell = row.querySelector(".row-total");

    function update() {
        let total = calculateTotal(
            parseFloat(qty.value) || 0,
            parseFloat(rate.value) || 0,
            parseFloat(tax.value) || 18,
            parseFloat(discount.value) || 20
        );

        totalCell.innerText = "₹" + total.toLocaleString();
        updateGrandTotal();
    }

    qty.addEventListener("input", update);
    rate.addEventListener("input", update);
    tax.addEventListener("input", update);
    discount.addEventListener("input", update);
}

/* ================= GRAND TOTAL ================= */
function updateGrandTotal() {
    let total = 0;

    document.querySelectorAll(".row-total").forEach(cell => {
        total += parseFloat(cell.innerText.replace(/[₹,]/g, "")) || 0;
    });

    document.getElementById("grandTotal").innerText =
        "₹" + total.toLocaleString();
}

/* ================= INIT ================= */
window.addEventListener("load", renderTable);
function openTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
    document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}
/* ================= NAVIGATION ================= */
function goBack() {
    window.history.back();
}
function deleteNote() {
    if (confirm("Are you sure you want to delete this Credit Note?")) {
        window.history.back();
    }
}
/* ================= SAVE ================= */
function saveDraft() {
    if (confirm("Do you want to save as draft?")) {
        alert("Draft Saved!");
    }
}

/* ================= SUBMIT ================= */
function submitForm() {
    if (confirm("Are you sure you want to submit?")) {
        alert("Submitted successfully!");
    }
}

/* ================= MESSAGE ================= */
function openMessage() {
    if (confirm("Open Messages?")) {
        alert("Message opened!");
    }
}

/* ================= PDF ================= */
function openPDF() {
    if (confirm("Generate PDF?")) {
        alert("PDF Generated!");
    }
}
function handleCancel() {
    // If previous page exists
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // If no previous page → open blank page
        window.location.href = "about:blank";
    }
}