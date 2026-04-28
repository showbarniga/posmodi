
/* ============================================
   DEBIT NOTE PAGE - MAIN LOGIC
   ============================================ */

(function () {
  // ==================================================
  // DOM ELEMENTS
  // ==================================================
  const addDebitNoteBtn = document.getElementById("addDebitNoteBtn");
  const searchInput = document.getElementById("debitnoteSearch");
  const clearFilterBtn = document.getElementById("clearFilterBtn");
  const statusFilter = document.getElementById("statusFilter");
  const supplierFilter = document.getElementById("supplierFilter");
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");
  const tbody = document.getElementById("debitnoteTableBody");
  const noDataRow = document.getElementById("noDataRow");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageNow = document.getElementById("pageNow");
  const pageTotal = document.getElementById("pageTotal");
  const showingCount = document.getElementById("showingCount");

  // ==================================================
  // STATE
  // ==================================================
  const ROWS_PER_PAGE = 10;
  let allDebitNotes = [];
  let filteredDebitNotes = [];
  let currentPage = 1;
  let flyEl = null;
  let hideTimer = null;

  // ==================================================
  // ADD DEBIT NOTE BUTTON
  // ==================================================
  if (addDebitNoteBtn) {
    addDebitNoteBtn.addEventListener("click", () => {
      // Navigate to add new debit note page
      // Adjust the URL based on your routing
      window.location.href = "/debitnote-new";
    });
  }

  // ==================================================
  // FETCH DATA
  // ==================================================
  async function fetchDebitNotes() {
    try {
      const response = await fetch("/api/debitnotes");
      if (!response.ok) throw new Error("Failed to fetch debit notes");
      const data = await response.json();
      allDebitNotes = Array.isArray(data) ? data : data.debitnotes || [];
      populateSupplierFilter();
      applyFilters();
    } catch (error) {
      console.error("Error fetching debit notes:", error);
      // Fallback to mock data for testing
      allDebitNotes = [
        {
          "dbn_id": "DBN-0001",
          "po_ref_id": "PO-0001",
          "supplier_name": "Acme Supplies",
          "debitnote_date": "2026-03-15",
          "status": "draft",
          "payment_status": "unpaid"
        },
        {
          "dbn_id": "DBN-0002",
          "po_ref_id": "PO-0002",
          "supplier_name": "Fresh Produce Ltd",
          "debitnote_date": "2026-03-10",
          "status": "sent",
          "payment_status": "paid"
        },
        {
          "dbn_id": "DBN-0003",
          "po_ref_id": "PO-0003",
          "supplier_name": "Tech Solutions Inc",
          "debitnote_date": "2026-03-08",
          "status": "paid",
          "payment_status": "paid"
        }
      ];
      populateSupplierFilter();
      applyFilters();
    }
  }

  // ==================================================
  // POPULATE DROPDOWN
  // ==================================================
  function populateSupplierFilter() {
    if (!supplierFilter) return;

    const suppliers = [...new Set(allDebitNotes.map((dn) => dn.supplier_name))];
    suppliers.forEach((supplier) => {
      const option = document.createElement("option");
      option.value = supplier;
      option.textContent = supplier;
      supplierFilter.appendChild(option);
    });
  }

  // ==================================================
  // FILTERS & SEARCH
  // ==================================================
  function applyFilters() {
    const searchQuery = (searchInput?.value || "").trim().toLowerCase();
    const status = statusFilter?.value || "";
    const supplier = supplierFilter?.value || "";
    const from = fromDate?.value || "";
    const to = toDate?.value || "";

    filteredDebitNotes = allDebitNotes.filter((dn) => {
      const searchMatch =
        (dn.dbn_id || "").toLowerCase().includes(searchQuery) ||
        (dn.supplier_name || "").toLowerCase().includes(searchQuery);

      const statusMatch = !status || (dn.status || "") === status;
      const supplierMatch = !supplier || (dn.supplier_name || "") === supplier;

      let dateMatch = true;
      if (from || to) {
        const dnDate = new Date(dn.debitnote_date || "");
        if (from) {
          dateMatch = dateMatch && dnDate >= new Date(from);
        }
        if (to) {
          dateMatch = dateMatch && dnDate <= new Date(to);
        }
      }

      return searchMatch && statusMatch && supplierMatch && dateMatch;
    });

    currentPage = 1;
    renderTable();
  }

  // ==================================================
  // EVENT LISTENERS
  // ==================================================
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (statusFilter) statusFilter.value = "";
      if (supplierFilter) supplierFilter.value = "";
      if (fromDate) fromDate.value = "";
      if (toDate) toDate.value = "";
      applyFilters();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }

  if (supplierFilter) {
    supplierFilter.addEventListener("change", applyFilters);
  }

  if (fromDate) {
    fromDate.addEventListener("change", applyFilters);
  }

  if (toDate) {
    toDate.addEventListener("change", applyFilters);
  }

  // ==================================================
  // ACTION MENU (HOVER)
  // ==================================================
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
    const dbnId = String(row.dbn_id || "").trim();
    if (!dbnId) return;

    flyEl = document.createElement("div");
    flyEl.className = "debitnote-action-menu";

    const mkItem = (label, onClick, disabled) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "debitnote-action-item";
      button.textContent = label;
      button.disabled = !!disabled;

      if (!disabled) {
        button.addEventListener("click", onClick);
      }

      return button;
    };

    // Add menu items based on debit note status
    flyEl.appendChild(mkItem("View", () => viewDebitNote(dbnId), false));
    flyEl.appendChild(mkItem("Generate Debit Note Return", () => generateDebitNoteReturn(dbnId), false));

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

  // ==================================================
  // ACTION HANDLERS
  // ==================================================
  function viewDebitNote(dbnId) {
    // Navigate to add-debitnote page in view mode
    window.location.href = `/add-debitnote?view=${dbnId}`;
  }

  function editDebitNote(dbnId) {
    // Navigate to edit debit note page
    window.location.href = `/debitnote-edit/${dbnId}`;
  }

  function deleteDebitNote(dbnId) {
    if (!confirm("Are you sure you want to delete this debit note?")) return;

    fetch(`/api/debitnotes/${dbnId}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) throw new Error("Delete failed");
        fetchDebitNotes();
      })
      .catch((error) => {
        console.error("Error deleting debit note:", error);
        alert("Failed to delete debit note");
      });
  }

  function generateDebitNoteReturn(dbnId) {
    // Navigate to generate debit note return page
    window.location.href = `/debitnote-return-new?ref=${dbnId}`;
  }

  // ==================================================
  // HELPER FUNCTIONS
  // ==================================================
  function safeText(text) {
    return String(text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function getStatusClass(status) {
    const statusLower = (status || "").toLowerCase();
    return `debitnote-badge ${statusLower}`;
  }

  function getPaymentStatusClass(paymentStatus) {
    const ps = (paymentStatus || "").toLowerCase();
    if (ps === "paid") return "debitnote-payment-paid";
    if (ps === "partial") return "debitnote-payment-partial";
    return "debitnote-payment-unpaid";
  }

  function totalPages() {
    return Math.max(1, Math.ceil(filteredDebitNotes.length / ROWS_PER_PAGE));
  }

  function updateShowing() {
    const total = filteredDebitNotes.length;
    if (showingCount) {
      if (total === 0) {
        showingCount.textContent = "Showing 0 entries";
        return;
      }
      
      const startEntry = (currentPage - 1) * ROWS_PER_PAGE + 1;
      const endEntry = Math.min(currentPage * ROWS_PER_PAGE, total);
      showingCount.textContent = `Showing ${startEntry}-${endEntry} of ${total} entries`;
    }
  }

  function updatePagerUI() {
    const totalPagesCount = totalPages();
    
    if (totalPagesCount <= 1) {
      if (prevBtn) {
        prevBtn.classList.add('inactive');
        prevBtn.style.pointerEvents = 'none';
      }
      if (nextBtn) {
        nextBtn.classList.add('inactive');
        nextBtn.style.pointerEvents = 'none';
      }
    } else {
      if (prevBtn) {
        if (currentPage <= 1) {
          prevBtn.classList.add('inactive');
          prevBtn.style.pointerEvents = 'none';
        } else {
          prevBtn.classList.remove('inactive');
          prevBtn.style.pointerEvents = 'auto';
        }
      }
      if (nextBtn) {
        if (currentPage >= totalPagesCount) {
          nextBtn.classList.add('inactive');
          nextBtn.style.pointerEvents = 'none';
        } else {
          nextBtn.classList.remove('inactive');
          nextBtn.style.pointerEvents = 'auto';
        }
      }
    }
    
    if (pageNow) {
      pageNow.textContent = currentPage;
    }
    if (pageTotal) {
      pageTotal.textContent = totalPagesCount;
    }
  }

  // ==================================================
  // TABLE RENDERING
  // ==================================================
  function renderTable() {
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!filteredDebitNotes.length) {
      if (noDataRow) {
        tbody.appendChild(noDataRow);
      }
      currentPage = 1;
      updateShowing();
      updatePagerUI();
      return;
    }

    const tp = totalPages();
    currentPage = Math.min(Math.max(1, currentPage), tp);

    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    const pageRows = filteredDebitNotes.slice(start, end);

    if (noDataRow?.parentNode) {
      noDataRow.remove();
    }

    // Add S.No starting from 1
    let sNo = start + 1;

    pageRows.forEach((dn) => {
      const dbnId = String(dn.dbn_id || "").trim();

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${sNo}</td>
        <td>${safeText(dbnId)}</td>
        <td>${safeText(dn.po_ref_id || "N/A")}</td>
        <td>${safeText(dn.supplier_name || "")}</td>
        <td>${safeText(dn.debitnote_date || "")}</td>
        <td>
          <span class="${getStatusClass(dn.status)}">
            ${safeText(dn.status || "")}
          </span>
        </td>
        <td>
          <span class="${getPaymentStatusClass(dn.payment_status)}">
            ${safeText(dn.payment_status || "")}
          </span>
        </td>
        <td class="debitnote-action-cell">
          <button
            type="button"
            class="debitnote-action-dots"
            aria-label="Actions"
            ${dbnId ? "" : "disabled"}
          >
            ⋮
          </button>
        </td>
      `;

      const dots = tr.querySelector(".debitnote-action-dots");
      if (dots && dbnId) {
        attachActionMenu(dots, dn);
      }

      tbody.appendChild(tr);
      sNo++;
    });

    updateShowing();
    updatePagerUI();
  }

  // ==================================================
  // PAGINATION
  // ==================================================
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages()) {
        currentPage++;
        renderTable();
      }
    });
  }

  // ==================================================
  // INITIALIZE
  // ==================================================
  fetchDebitNotes();
})();

