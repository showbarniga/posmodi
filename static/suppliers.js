const searchInput = document.querySelector(".supplier-search input");
const statusFilter = document.querySelectorAll(".supplier-filters select")[0];
const typeFilter = document.querySelectorAll(".supplier-filters select")[1];
const tierFilter = document.querySelectorAll(".supplier-filters select")[2];
const clearBtn = document.querySelector(".clear-filter");

const prevBtn = document.getElementById("supPrevBtn");
const nextBtn = document.getElementById("supNextBtn");
const pageText = document.getElementById("supPageText");
const showingText = document.getElementById("supShowingText");

const ROWS_PER_PAGE = 10;
let currentPage = 1;
let filteredRows = [];

function setBtnDisabled(btn, disabled) {
  if (!btn) return;
  btn.classList.toggle("disabled", !!disabled);
  btn.disabled = !!disabled;
  btn.setAttribute("aria-disabled", disabled ? "true" : "false");
}

function isDataRow(row) {
  return !!row && !row.querySelector("td.empty");
}

function rowMatches(row) {
  if (!isDataRow(row)) return false;
  const q = (searchInput?.value || "").trim().toLowerCase();
  if (q && !row.innerText.toLowerCase().includes(q)) return false;

  const statusVal = (statusFilter?.value || "all").toLowerCase();
  const typeVal = (typeFilter?.value || "all types").toLowerCase();
  const status = (row.children[4]?.innerText || "").toLowerCase();
  const type = (row.children[5]?.innerText || "").toLowerCase();

  if (statusVal !== "all" && !status.includes(statusVal)) return false;
  if (typeVal !== "all types" && !type.includes(typeVal)) return false;
  return true;
}

function getFilteredRows() {
  return Array.from(document.querySelectorAll("tbody tr")).filter(rowMatches);
}

function showCurrentPageRows() {
  document.querySelectorAll("tbody tr").forEach((row) => {
    if (row.querySelector("td.empty")) {
      row.style.display = filteredRows.length === 0 ? "" : "none";
      return;
    }
    row.style.display = "none";
  });

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  for (let i = startIndex; i < startIndex + ROWS_PER_PAGE && i < filteredRows.length; i++) {
    filteredRows[i].style.display = "";
  }
}

function updatePagination() {
  filteredRows = getFilteredRows();
  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  currentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const shown = filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE).length;

  if (showingText) showingText.textContent = `Showing ${shown} of ${total} Entries`;
  if (pageText) pageText.innerHTML = `Page <strong>${currentPage}</strong> of <strong>${totalPages}</strong>`;

  setBtnDisabled(prevBtn, currentPage <= 1 || total === 0);
  setBtnDisabled(nextBtn, currentPage >= totalPages || total === 0);
  if (totalPages === 1) {
    setBtnDisabled(prevBtn, true);
    setBtnDisabled(nextBtn, true);
  }

  showCurrentPageRows();
}

searchInput?.addEventListener("input", () => {
  currentPage = 1;
  updatePagination();
});

function applyFilters() {
  currentPage = 1;
  updatePagination();
}

statusFilter?.addEventListener("change", applyFilters);
typeFilter?.addEventListener("change", applyFilters);
tierFilter?.addEventListener("change", applyFilters);

clearBtn?.addEventListener("click", () => {
  searchInput.value = "";
  statusFilter.selectedIndex = 0;
  typeFilter.selectedIndex = 0;
  tierFilter.selectedIndex = 0;
  currentPage = 1;
  updatePagination();
  searchInput?.focus();
});

prevBtn?.addEventListener("click", () => {
  if (prevBtn.classList.contains("disabled")) return;
  currentPage -= 1;
  updatePagination();
});

nextBtn?.addEventListener("click", () => {
  if (nextBtn.classList.contains("disabled")) return;
  currentPage += 1;
  updatePagination();
});

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

  flyEl.appendChild(mkItem("Edit", () => editSupplier(supplierId)));
  flyEl.appendChild(mkItem("Delete", () => deleteSupplier(supplierId, row), "delete"));

  flyEl.addEventListener("mouseenter", keepOpen);
  flyEl.addEventListener("mouseleave", scheduleHide);
  document.body.appendChild(flyEl);

  const btnRect = anchorBtn.getBoundingClientRect();
  flyEl.style.visibility = "hidden";
  flyEl.style.left = "0px";
  flyEl.style.top = "0px";

  const popRect = flyEl.getBoundingClientRect();
  const gap = 8;
  const dropY = 25;
  let top = btnRect.top - popRect.height - gap + dropY;
  if (top < 8) top = btnRect.bottom + gap + dropY;
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

function editSupplier(supplierId) {
  removeFly();
  alert("Edit Supplier: " + supplierId);
}

function deleteSupplier(supplierId, row) {
  removeFly();
  if (confirm("Are you sure you want to delete this supplier?")) {
    row.remove();
    currentPage = 1;
    updatePagination();
    alert("Supplier deleted: " + supplierId);
  }
}

function attachActionMenusToRows() {
  document.querySelectorAll(".supplier-action-dots").forEach((btn) => {
    const row = btn.closest("tr");
    if (row) attachActionMenu(btn, row);
  });
}

window.addEventListener("scroll", () => removeFly(), true);
window.addEventListener("resize", () => removeFly());

document.addEventListener("DOMContentLoaded", () => {
  updatePagination();
  attachActionMenusToRows();
});
