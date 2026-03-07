document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     CONFIG
  ========================================================== */
  const pageSize = 10;

  const API_URL = "/api/delivery-notes";
  const SECOND_PAGE_URL = "/delivery_note/form";

  /* =========================================================
     DOM REFERENCES
  ========================================================== */
  const tbody = document.getElementById("dnTbody");
  const noDataRow = document.getElementById("dnNoDataRow");

  const searchInput = document.getElementById("dnSearchInput");
  const clearBtn = document.getElementById("dnClearBtn");

  const statusFilter = document.getElementById("dnStatusFilter");
  const typeFilter = document.getElementById("dnTypeFilter");
  const fromDate = document.getElementById("dnFromDate");
  const toDate = document.getElementById("dnToDate");

  const showingText = document.getElementById("dnShowingText");
  const prevBtn = document.getElementById("dnPrevBtn");
  const nextBtn = document.getElementById("dnNextBtn");
  const pageText = document.getElementById("dnPageText");

  const newBtn = document.getElementById("newDeliveryNoteBtn");

  // Generate buttons (enabled when any row checkbox is checked)
  const genInvoiceBtn = document.getElementById("genInvoiceBtn");
  const genDeliveryReturnBtn = document.getElementById("genDeliveryReturnBtn");

  /* =========================================================
     STATE
  ========================================================== */
  let allRows = [];
  let filteredRows = [];
  let page = 1;

  /* =========================================================
     SMALL HELPERS
  ========================================================== */
  const titleCase = (s) => {
    const t = String(s || "").replaceAll("_", " ");
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
  };

  function normalizeStatus(v) {
    return String(v || "").trim().toLowerCase().replaceAll(" ", "_");
  }

  const statusBadgeClass = (status) => normalizeStatus(status);

  function statusLabel(v) {
    const key = normalizeStatus(v);
    const map = {
      delivered: "Delivered",
      partially_delivered: "Partially Delivered",
      returned: "Returned",
      cancelled: "Cancelled",
      draft: "Draft",
    };
    return map[key] || "—";
  }

  function setBtnDisabled(btn, disabled) {
    if (!btn) return;
    btn.classList.toggle("disabled", !!disabled);
    btn.disabled = !!disabled;
    btn.setAttribute("aria-disabled", disabled ? "true" : "false");
  }

  function parseISO(d) {
    if (!d) return null;
    const dt = new Date(d + "T00:00:00");
    return isNaN(dt.getTime()) ? null : dt;
  }

  function inDateRange(rowDateStr, fromStr, toStr) {
    const d = parseISO(rowDateStr);
    if (!d) return false;

    const f = parseISO(fromStr);
    const t = parseISO(toStr);

    if (f && d < f) return false;
    if (t && d > t) return false;
    return true;
  }

  function clearDataRows() {
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    rows.forEach((tr) => {
      if (tr.id !== "dnNoDataRow") tr.remove();
    });
  }

  /* =========================================================
     NAVIGATION / ACTION HELPERS
  ========================================================== */
  function goSecondPage(dnId, mode) {
    const url = `${SECOND_PAGE_URL}?id=${encodeURIComponent(dnId)}&mode=${encodeURIComponent(mode)}`;
    window.location.href = url;
  }

  function generateInvoice(dnId) {
    window.location.href = `/delivery-invoice/create/${encodeURIComponent(dnId)}`;
  }

  function generateDeliveryReturn(dnId) {
    window.location.href = `/delivery-return/create/${encodeURIComponent(dnId)}`;
  }

  /* =========================================================
     BODY-ATTACHED HOVER FLY MENU (3 dots)
  ========================================================== */
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

  function buildFlyMenu(row, anchorBtn) {
    const dnId = row.dn_id;
    const st = normalizeStatus(row.status);

    const isDraft = st === "draft";
    const isPartial = st === "partially_delivered";
    const isDelivered = st === "delivered";
    const isReturned = st === "returned";
    const isCancelled = st === "cancelled";

    // First menu item is Edit only for Draft; otherwise View
    const firstLabel = isDraft ? "Edit details" : "View details";
    const firstMode = isDraft ? "edit" : "view";

    // Generate rules (same logic you had)
    let canReturn = isPartial || isDelivered || isReturned;
    let canInvoice = isPartial || isDelivered || isReturned;

    if (isCancelled || isDraft) {
      canReturn = false;
      canInvoice = false;
    }

    flyEl = document.createElement("div");
    flyEl.className = "dn-act-fly";

    const mkItem = (label, onClick, disabled) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dn-act-item";
      b.textContent = label;
      b.disabled = !!disabled;
      if (!disabled) b.addEventListener("click", onClick);
      return b;
    };

    flyEl.appendChild(mkItem(firstLabel, () => goSecondPage(dnId, firstMode), false));
    flyEl.appendChild(mkItem("Generate Delivery Return", () => generateDeliveryReturn(dnId), !canReturn));
    flyEl.appendChild(mkItem("Generate Invoice", () => generateInvoice(dnId), !canInvoice));

    flyEl.addEventListener("mouseenter", keepOpen);
    flyEl.addEventListener("mouseleave", scheduleHide);

    document.body.appendChild(flyEl);

    // Position the fly menu near the button
    const btnRect = anchorBtn.getBoundingClientRect();

    // Measure popup size
    flyEl.style.visibility = "hidden";
    flyEl.style.left = "0px";
    flyEl.style.top = "0px";
    const popRect = flyEl.getBoundingClientRect();

    const gap = 8;
    const DROP_Y = 25;

    // Try showing above; if not enough space, show below
    let top = btnRect.top - popRect.height - gap + DROP_Y;
    if (top < 8) top = btnRect.bottom + gap + DROP_Y;

    // Align right edge of popup to right edge of button
    let left = btnRect.right - popRect.width;
    const maxLeft = window.innerWidth - popRect.width - 8;
    if (left > maxLeft) left = maxLeft;
    if (left < 8) left = 8;

    flyEl.style.left = `${Math.round(left)}px`;
    flyEl.style.top = `${Math.round(top)}px`;
    flyEl.style.visibility = "visible";
  }

  function attachHoverMenu(btn, row) {
    btn.addEventListener("mouseenter", () => {
      removeFly();
      keepOpen();
      buildFlyMenu(row, btn);
    });
    btn.addEventListener("mouseleave", scheduleHide);
  }

  window.addEventListener("scroll", () => removeFly(), true);
  window.addEventListener("resize", () => removeFly());

  /* =========================================================
     CHECKBOX -> ENABLE GENERATE BUTTONS
  ========================================================== */
  function toggleGenerateButtons() {
    const anyChecked = document.querySelectorAll(".row-check:checked").length > 0;
    if (genInvoiceBtn) genInvoiceBtn.disabled = !anyChecked;
    if (genDeliveryReturnBtn) genDeliveryReturnBtn.disabled = !anyChecked;
  }

  document.addEventListener("change", (e) => {
    if (!e.target.classList.contains("row-check")) return;
    toggleGenerateButtons();
  });

  /* =========================================================
     DATA LOAD
  ========================================================== */
  async function loadData() {
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      const result = await res.json();
      const data = result.data || [];

      allRows = Array.isArray(data)
        ? data.map((x) => ({
            dn_id: x.dn_id || "",
            so_ref: x.so_ref || "",
            customer_name: x.customer_name || "",
            delivery_type: x.delivery_type || "regular",
            delivery_date: x.delivery_date || "",
            status: normalizeStatus(x.delivery_status || x.status || "draft"),
          }))
        : [];
    } catch (e) {
      console.error(e);
      allRows = [];
    }

    applyFilters(true);
  }

  /* =========================================================
     FILTERS
  ========================================================== */
  function applyFilters(resetPage = false) {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const st = (statusFilter?.value || "all").toLowerCase();
    const tp = (typeFilter?.value || "all").toLowerCase();
    const fd = fromDate?.value || "";
    const td = toDate?.value || "";

    filteredRows = allRows.filter((r) => {
      const hay = `${r.dn_id} ${r.so_ref} ${r.customer_name}`.toLowerCase();
      const okSearch = !q || hay.includes(q);

      const okStatus = st === "all" || String(r.status).toLowerCase() === st;
      const okType = tp === "all" || String(r.delivery_type).toLowerCase() === tp;

      const okDate = !fd && !td ? true : inDateRange(r.delivery_date, fd, td);

      return okSearch && okStatus && okType && okDate;
    });

    if (resetPage) page = 1;
    render();
  }

  /* =========================================================
     RENDER
  ========================================================== */
  function render() {
    if (!tbody) return;

    const total = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    const startIndex = (page - 1) * pageSize;
    const pageItems = filteredRows.slice(startIndex, startIndex + pageSize);

    clearDataRows();

    if (pageItems.length === 0) {
      if (noDataRow) noDataRow.style.display = "";
    } else {
      if (noDataRow) noDataRow.style.display = "none";

      pageItems.forEach((r, idx) => {
        const sno = startIndex + idx + 1;
        const tr = document.createElement("tr");

        // Checkbox cell
        const tdCheck = document.createElement("td");
        tdCheck.className = "dn-td-check";
        tdCheck.innerHTML = `<input type="checkbox" class="row-check" data-id="${r.dn_id}">`;

        const tdSno = document.createElement("td");
        tdSno.className = "dn-th-sno";
        tdSno.style.textAlign = "center";
        tdSno.textContent = sno;

        const tdDn = document.createElement("td");
        tdDn.textContent = r.dn_id;

        const tdSo = document.createElement("td");
        tdSo.textContent = r.so_ref;

        const tdCus = document.createElement("td");
        tdCus.textContent = r.customer_name;

        const tdType = document.createElement("td");
        tdType.textContent = titleCase(r.delivery_type);

        const tdDate = document.createElement("td");
        tdDate.textContent = r.delivery_date;

        const tdStatus = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `dn-badge ${statusBadgeClass(r.status)}`;
        badge.textContent = statusLabel(r.status);
        tdStatus.appendChild(badge);

        const tdAction = document.createElement("td");
        tdAction.className = "dn-td-action";
        tdAction.style.textAlign = "right";

        const dots = document.createElement("button");
        dots.type = "button";
        dots.className = "dn-act-dots";
        dots.textContent = "⋮";

        attachHoverMenu(dots, r);
        tdAction.appendChild(dots);

        // Append all cells in the exact table order
        tr.appendChild(tdCheck);
        tr.appendChild(tdSno);
        tr.appendChild(tdDn);
        tr.appendChild(tdSo);
        tr.appendChild(tdCus);
        tr.appendChild(tdType);
        tr.appendChild(tdDate);
        tr.appendChild(tdStatus);
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
      });
    }

    const shown = pageItems.length;
    if (showingText) showingText.textContent = `Showing ${shown} of ${total} Entries`;
    if (pageText) pageText.innerHTML = `Page <strong>${page}</strong> of <strong>${totalPages}</strong>`;

    setBtnDisabled(prevBtn, page <= 1 || total === 0);
    setBtnDisabled(nextBtn, page >= totalPages || total === 0);

    if (totalPages === 1) {
      setBtnDisabled(prevBtn, true);
      setBtnDisabled(nextBtn, true);
    }

    // Reset generate buttons after re-render
    toggleGenerateButtons();
  }

  /* =========================================================
     EVENTS
  ========================================================== */
  newBtn?.addEventListener("click", () => (window.location.href = "/delivery_note/new"));

  searchInput?.addEventListener("input", () => applyFilters(true));
  statusFilter?.addEventListener("change", () => applyFilters(true));
  typeFilter?.addEventListener("change", () => applyFilters(true));
  fromDate?.addEventListener("change", () => applyFilters(true));
  toDate?.addEventListener("change", () => applyFilters(true));

  clearBtn?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (statusFilter) statusFilter.value = "all";
    if (typeFilter) typeFilter.value = "all";
    if (fromDate) fromDate.value = "";
    if (toDate) toDate.value = "";
    applyFilters(true);
    searchInput?.focus();
  });

  prevBtn?.addEventListener("click", () => {
    if (prevBtn.classList.contains("disabled")) return;
    page -= 1;
    render();
  });

  nextBtn?.addEventListener("click", () => {
    if (nextBtn.classList.contains("disabled")) return;
    page += 1;
    render();
  });

  /* =========================================================
     INIT
  ========================================================== */
  loadData();
});