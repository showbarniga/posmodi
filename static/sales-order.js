document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     1) ELEMENTS
  ========================= */
  const searchInput     = document.getElementById("searchInput");
  const clearFilterBtn  = document.getElementById("clearFilterBtn");
 
  const statusFilter    = document.getElementById("statusFilter");
  const orderTypeFilter = document.getElementById("orderTypeFilter");
  const salesRepFilter  = document.getElementById("salesRepFilter");
 
  const tbody           = document.getElementById("salesOrderTbody");
  const noDataRow       = document.getElementById("noDataRow");
 
  const showingText     = document.getElementById("showingText");
  const prevBtn         = document.getElementById("prevBtn");
  const nextBtn         = document.getElementById("nextBtn");
  const pageText        = document.getElementById("pageText");
 
  const successToast    = document.getElementById("successToast");
  const errorToast      = document.getElementById("errorToast");
 
  /* =========================
     2) STATE
  ========================= */
  const ROWS_PER_PAGE = 10;
  let currentPage = 1;
 
  // Load from API later. For now empty (NO demo data as you asked)
  let allOrders = [];
  let filteredOrders = [];
 
  /* =========================
     3) HELPERS
  ========================= */
  function showToast(type, msg) {
    const el = type === "success" ? successToast : errorToast;
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2200);
  }
 
  function safeText(v) {
    return (v === null || v === undefined || v === "") ? "—" : String(v);
  }
 
  function formatMoney(v) {
    const num = Number(v);
    if (Number.isNaN(num)) return "—";
    return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }
 
  function totalPages() {
    return Math.max(1, Math.ceil(filteredOrders.length / ROWS_PER_PAGE));
  }
 
  function updatePagerUI() {
    const tp = totalPages();
 
    // ✅ Prev disabled when page = 1
    prevBtn.disabled = currentPage <= 1;
 
    // ✅ Next disabled when last page
    nextBtn.disabled = currentPage >= tp;
 
    pageText.textContent = `Page ${currentPage} of ${tp}`;
  }
 
  function updateShowing() {
    showingText.textContent = `Showing ${filteredOrders.length} Entries`;
  }
 
  function renderTable() {
    // Clear tbody
    tbody.innerHTML = "";
 
    if (filteredOrders.length === 0) {
      tbody.appendChild(noDataRow);
      updateShowing();
      currentPage = 1;
      updatePagerUI();
      return;
    }
 
    const tp = totalPages();
    if (currentPage > tp) currentPage = tp;
    if (currentPage < 1) currentPage = 1;
 
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    const pageRows = filteredOrders.slice(start, end);
 
    // Hide no-data row
    if (noDataRow.parentNode) noDataRow.remove();
 
    pageRows.forEach((o) => {
      const tr = document.createElement("tr");
 
      tr.innerHTML = `
        <td><input type="checkbox" class="row-mark" data-id="${safeText(o.so_id)}"></td>
        <td>${safeText(o.so_id)}</td>
        <td>${safeText(o.order_type)}</td>
        <td>${safeText(o.customer_name)}</td>
        <td>${safeText(o.sales_rep)}</td>
        <td>${safeText(o.order_date)}</td>
        <td>${safeText(o.status)}</td>
        <td>${safeText(o.stock_status)}</td>
        <td>${formatMoney(o.grand_total)}</td>
        <td>
          <div class="action-wrap">
            <button class="action-btn view-btn" data-id="${safeText(o.so_id)}" type="button">View</button>
            <button class="action-btn edit-btn" data-id="${safeText(o.so_id)}" type="button">Edit</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
 
    updateShowing();
    updatePagerUI();
  }
 
  function applyFilters() {
    const q = (searchInput.value || "").trim().toLowerCase();
    const status = statusFilter.value;
    const orderType = orderTypeFilter.value;
    const salesRep = salesRepFilter.value;
 
    filteredOrders = allOrders.filter((o) => {
      const idMatch = safeText(o.so_id).toLowerCase().includes(q);
 
      const statusMatch = !status || safeText(o.status) === status;
      const typeMatch = !orderType || safeText(o.order_type) === orderType;
      const repMatch = !salesRep || safeText(o.sales_rep) === salesRep;
 
      return idMatch && statusMatch && typeMatch && repMatch;
    });
 
    currentPage = 1;
    renderTable();
  }
 
  function fillSalesRepsDropdown() {
    // Optional: build dropdown from data (when you connect API)
    const reps = [...new Set(allOrders.map(o => safeText(o.sales_rep)).filter(v => v !== "—"))].sort();
    salesRepFilter.innerHTML = `<option value="">All</option>` + reps.map(r => `<option value="${r}">${r}</option>`).join("");
  }
 
  /* =========================
     4) EVENTS
  ========================= */
  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  orderTypeFilter.addEventListener("change", applyFilters);
  salesRepFilter.addEventListener("change", applyFilters);
 
  clearFilterBtn.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "";
    orderTypeFilter.value = "";
    salesRepFilter.value = "";
    applyFilters();
  });
 
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });
 
  nextBtn.addEventListener("click", () => {
    const tp = totalPages();
    if (currentPage < tp) {
      currentPage++;
      renderTable();
    }
  });
 
  tbody.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-btn");
    const editBtn = e.target.closest(".edit-btn");
 
    if (viewBtn) {
      const id = viewBtn.dataset.id;
      // later: window.location.href = `/sales-order/${id}`;
      showToast("success", `View: ${id}`);
    }
 
    if (editBtn) {
      const id = editBtn.dataset.id;
      // later: open edit modal
      showToast("success", `Edit: ${id}`);
    }
  });
 
  /* =========================
     5) LOAD DATA (API hook)
  ========================= */
  async function loadSalesOrders() {
    try {
      // ✅ When backend ready, just enable this:
      // const res = await fetch("/api/sales-orders");
      // const data = await res.json();
      // allOrders = Array.isArray(data) ? data : [];
 
      allOrders = []; // ✅ no demo data
      filteredOrders = [...allOrders];
 
      fillSalesRepsDropdown();
      renderTable();
    } catch (err) {
      console.error(err);
      allOrders = [];
      filteredOrders = [];
      renderTable();
      showToast("error", "Unable to load sales orders");
    }
  }
 
  loadSalesOrders();
});