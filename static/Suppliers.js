// ====== SELECT ELEMENTS ======
const searchInput = document.querySelector(".supplier-search input");
const statusFilter = document.querySelectorAll(".supplier-filters select")[0];
const typeFilter = document.querySelectorAll(".supplier-filters select")[1];
const tierFilter = document.querySelectorAll(".supplier-filters select")[2];
const clearBtn = document.querySelector(".clear-filter");

const tableRows = document.querySelectorAll("tbody tr");

// Pagination elements
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNow = document.getElementById("pageNow");
const pageTotal = document.getElementById("pageTotal");
const showingCount = document.getElementById("showingCount");

// Pagination state
const ROWS_PER_PAGE = 5;
let currentPage = 1;
let filteredRows = [];

// ====== PAGINATION FUNCTIONS ======
function updatePagination() {
    // Get all visible rows
    filteredRows = Array.from(document.querySelectorAll("tbody tr")).filter(row => {
        return row.style.display !== "none" && !row.classList.contains("empty-row");
    });
    
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);
    
    // Update pagination display
    if (pageNow) pageNow.textContent = currentPage;
    if (pageTotal) pageTotal.textContent = totalPages;
    
    // Update showing count
    if (showingCount) {
        if (filteredRows.length === 0) {
            showingCount.textContent = "Showing 0 Entities";
        } else {
            const startEntry = (currentPage - 1) * ROWS_PER_PAGE + 1;
            const endEntry = Math.min(currentPage * ROWS_PER_PAGE, filteredRows.length);
            showingCount.textContent = `Showing ${startEntry}-${endEntry} of ${filteredRows.length} Entities`;
        }
    }
    
    // Update button states
    if (prevBtn) {
        if (currentPage <= 1 || totalPages <= 1) {
            prevBtn.classList.add('inactive');
            prevBtn.style.pointerEvents = 'none';
        } else {
            prevBtn.classList.remove('inactive');
            prevBtn.style.pointerEvents = 'auto';
        }
    }
    
    if (nextBtn) {
        if (currentPage >= totalPages || totalPages <= 1) {
            nextBtn.classList.add('inactive');
            nextBtn.style.pointerEvents = 'none';
        } else {
            nextBtn.classList.remove('inactive');
            nextBtn.style.pointerEvents = 'auto';
        }
    }
    
    // Show/hide rows based on current page
    showCurrentPageRows();
}

function showCurrentPageRows() {
    // Hide all rows first
    document.querySelectorAll("tbody tr").forEach(row => {
        row.style.display = "none";
    });
    
    // Show rows for current page
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    
    for (let i = startIndex; i < endIndex && i < filteredRows.length; i++) {
        filteredRows[i].style.display = "";
    }
    
    // Show empty message if no rows
    if (filteredRows.length === 0) {
        const emptyRow = document.querySelector(".empty");
        if (emptyRow && emptyRow.closest("tr")) {
            emptyRow.closest("tr").style.display = "";
        }
    }
}

// Pagination event listeners
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });
}

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
    
    // Reset to first page and update pagination
    currentPage = 1;
    updatePagination();
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
    
    // Reset to first page and update pagination
    currentPage = 1;
    updatePagination();
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
    
    // Reset to first page and update pagination
    currentPage = 1;
    updatePagination();
});

// ====== NEW SUPPLIER BUTTON ======
document.querySelector(".btn-primary").addEventListener("click", () => {
    alert("Open Add Supplier Form");

    // 👉 Later:
    // open modal or redirect
    // window.location.href = "/add-supplier";
});

// ====== ACTION MENU FUNCTIONALITY ======
let flyEl = null;
let hideTimer = null;

function removeFly() {
  if (flyEl) {
    flyEl.remove();
    flyEl = null;
  }
}

function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => removeFly(), 120);
}

function keepOpen() {
  clearTimeout(hideTimer);
}

function buildActionMenu(row, anchorBtn) {
  const supplierId = row.children[1].innerText.trim();
  if (!supplierId) return;

  flyEl = document.createElement("div");
  flyEl.className = "supplier-action-menu";

  const mkItem = (label, onClick, className = "") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `supplier-action-item ${className}`;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  };

  // Add menu items
  flyEl.appendChild(mkItem("Edit", () => editSupplier(supplierId)));
  flyEl.appendChild(mkItem("Delete", () => deleteSupplier(supplierId, row), "delete"));

  flyEl.addEventListener("mouseenter", keepOpen);
  flyEl.addEventListener("mouseleave", scheduleHide);

  document.body.appendChild(flyEl);

  // Position the menu
  const btnRect = anchorBtn.getBoundingClientRect();

  flyEl.style.visibility = "hidden";
  flyEl.style.left = "0px";
  flyEl.style.top = "0px";

  const popRect = flyEl.getBoundingClientRect();
  const gap = 8;
  const dropY = 25;

  let top = btnRect.top - popRect.height - gap + dropY;
  if (top < 8) {
    top = btnRect.bottom + gap + dropY;
  }

  let left = btnRect.right - popRect.width;
  const maxLeft = window.innerWidth - popRect.width - 8;

  if (left > maxLeft) left = maxLeft;
  if (left < 8) left = 8;

  flyEl.style.left = `${Math.round(left)}px`;
  flyEl.style.top = `${Math.round(top)}px`;
  flyEl.style.visibility = "visible";
}

function attachActionMenu(btn, row) {
  btn.addEventListener("mouseenter", () => {
    removeFly();
    keepOpen();
    buildActionMenu(row, btn);
  });

  btn.addEventListener("mouseleave", scheduleHide);
}

// Action handlers
function editSupplier(supplierId) {
  removeFly();
  alert("Edit Supplier: " + supplierId);
  // Later: window.location.href = `/edit-supplier/${supplierId}`;
}

function deleteSupplier(supplierId, row) {
  removeFly();
  const confirmDelete = confirm("Are you sure you want to delete this supplier?");
  if (confirmDelete) {
    row.remove();
    // Reset pagination after deletion
    currentPage = 1;
    updatePagination();
    alert("Supplier deleted: " + supplierId);
    // Later: API call to delete supplier
  }
}

// Attach action menus to existing rows
function attachActionMenusToRows() {
  document.querySelectorAll(".supplier-action-dots").forEach(btn => {
    const row = btn.closest("tr");
    if (row) {
      attachActionMenu(btn, row);
    }
  });
}

// Close menu on scroll or resize
window.addEventListener("scroll", () => removeFly(), true);
window.addEventListener("resize", () => removeFly());

// ====== INITIALIZE PAGINATION ======
// Initialize pagination on page load
document.addEventListener("DOMContentLoaded", () => {
    updatePagination();
    attachActionMenusToRows();
});