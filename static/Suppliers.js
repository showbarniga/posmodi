// ====== SELECT ELEMENTS ======
const searchInput = document.querySelector(".supplier-search input");
const statusFilter = document.querySelectorAll(".supplier-filters select")[0];
const typeFilter = document.querySelectorAll(".supplier-filters select")[1];
const tierFilter = document.querySelectorAll(".supplier-filters select")[2];
const clearBtn = document.querySelector(".clear-filter");

const tableRows = document.querySelectorAll("tbody tr");

// ====== SEARCH FUNCTION ======
searchInput.addEventListener("keyup", function () {
    const value = this.value.toLowerCase();

    document.querySelectorAll("tbody tr").forEach(row => {
        const text = row.innerText.toLowerCase();

        if (text.includes(value)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});

// ====== FILTER FUNCTION ======
function applyFilters() {
    const statusVal = statusFilter.value.toLowerCase();
    const typeVal = typeFilter.value.toLowerCase();
    const tierVal = tierFilter.value.toLowerCase();

    document.querySelectorAll("tbody tr").forEach(row => {
        const status = row.children[4].innerText.toLowerCase();
        const type = row.children[5].innerText.toLowerCase();

        let show = true;

        if (statusVal !== "all" && !status.includes(statusVal)) {
            show = false;
        }

        if (typeVal !== "all types" && !type.includes(typeVal)) {
            show = false;
        }

        // (tier column not present → extend later if needed)

        row.style.display = show ? "" : "none";
    });
}

// Attach filter events
statusFilter.addEventListener("change", applyFilters);
typeFilter.addEventListener("change", applyFilters);
tierFilter.addEventListener("change", applyFilters);

// ====== CLEAR FILTER ======
clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.selectedIndex = 0;
    typeFilter.selectedIndex = 0;
    tierFilter.selectedIndex = 0;

    document.querySelectorAll("tbody tr").forEach(row => {
        row.style.display = "";
    });
});

// ====== DELETE ROW ======
document.querySelectorAll(".icon-btn.delete").forEach(btn => {
    btn.addEventListener("click", function () {
        const row = this.closest("tr");

        const confirmDelete = confirm("Are you sure you want to delete?");
        if (confirmDelete) {
            row.remove();
        }
    });
});

// ====== EDIT BUTTON ======
document.querySelectorAll(".icon-btn:not(.delete)").forEach(btn => {
    btn.addEventListener("click", function () {
        const row = this.closest("tr");
        const supplierId = row.children[1].innerText;

        alert("Edit Supplier: " + supplierId);

        // 👉 Later connect:
        // window.location.href = `/edit-supplier/${supplierId}`;
    });
});

// ====== NEW SUPPLIER BUTTON ======
document.querySelector(".btn-primary").addEventListener("click", () => {
    alert("Open Add Supplier Form");

    // 👉 Later:
    // open modal or redirect
    // window.location.href = "/add-supplier";
});