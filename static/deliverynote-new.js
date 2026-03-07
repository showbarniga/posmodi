console.log("✅ deliverynote-new.js loaded v100");

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     DOM REFERENCES
  ========================================================== */
  const dnId = document.getElementById("dnId");
  const dnIdView = document.getElementById("dnIdView");
  const dnDate = document.getElementById("dnDate");

  const returnBtn = document.getElementById("dn2ReturnBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const cancelDnBtn = document.getElementById("cancelDnBtn"); // Cancel DN button

  const addItemBtn = document.getElementById("addItemBtn");
  const itemsBody = document.getElementById("itemsBody");

  const saveDraftBtn = document.getElementById("saveDraftBtn");
  const submitBtn = document.getElementById("submitBtn");

  const soRefSel = document.getElementById("soRef");
  const custNameEl = document.getElementById("custName");
  const dnTypeEl = document.getElementById("dnType");
  const destAddrEl = document.getElementById("destAddr");

  const deliveryByEl = document.getElementById("deliveryBy");
  const deliveryStatusEl = document.getElementById("deliveryStatus");
  const vehicleNoEl = document.getElementById("vehicleNo");
  const trackingIdEl = document.getElementById("trackingId");
  const deliveryNotesEl = document.getElementById("deliveryNotes");

  // Header UI
  const pageTitleEl = document.getElementById("dn2PageTitle");
  const statusPillEl = document.getElementById("dn2StatusPill");

  // Acknowledgement
  const ackSection = document.getElementById("ackSection");
  const ackSaveBtn = document.getElementById("ackSaveBtn");
  const ackReceivedBy = document.getElementById("ackReceivedBy");
  const ackContact = document.getElementById("ackContact");
  const ackPodFile = document.getElementById("ackPodFile");
  const ackFiles = document.getElementById("ackFiles");

  // PDF / Email
  const pdfBtn = document.getElementById("pdfBtn");
  const emailBtn = document.getElementById("emailBtn");

  // Safety guard
  if (!itemsBody) {
    console.error("itemsBody not found. Check id='itemsBody' in HTML.");
    return;
  }

  /* =========================================================
     SMALL NAV HELPER
  ========================================================== */
  function redirectAfter(url, ms = 1200) {
    setTimeout(() => (window.location.href = url), ms);
  }

  /* =========================================================
     QUERY PARAMS (new/edit/view)
  ========================================================== */
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  const editId = qs("id");
  const mode = (qs("mode") || (editId ? "edit" : "new")).toLowerCase(); // new/edit/view

  /* =========================================================
     SAMPLE PRODUCT LIST (replace with API later)
  ========================================================== */
  const PRODUCTS = [
    { id: "PRD-001", name: "Rice Bag 25kg", uoms: ["Bag", "Kg"] },
    { id: "PRD-002", name: "Sugar 1kg", uoms: ["Kg", "Pack"] },
    { id: "PRD-003", name: "Soap Bar", uoms: ["Nos", "Box"] },
  ];

  /* =========================================================
     TOAST (custom)
  ========================================================== */
  window.showToast = function (message, type = "success") {
    const old = document.querySelector(".app-toast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.innerHTML = `
      <span class="toast-icon">✓</span>
      <span class="toast-msg">${message}</span>
    `;

    document.body.appendChild(toast);

    // Force paint first
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    }, 20);

    // Hide
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(-16px)";
    }, 2600);

    // Remove
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 3000);
  };

  /* =========================================================
     CANCEL DN MODAL (custom)
  ========================================================== */
  function openCancelDnModal(defaultText = "") {
    const backdrop = document.getElementById("cancelDnBackdrop");
    const reasonEl = document.getElementById("cancelDnReason");
    const btnYes = document.getElementById("cancelDnYes");
    const btnNo = document.getElementById("cancelDnNo");
    const btnX = document.getElementById("cancelDnX");

    const lastFocusedEl = document.activeElement;

    if (!backdrop || !reasonEl || !btnYes || !btnNo || !btnX) {
      showToast("Cancel modal HTML not found", "error");
      return Promise.resolve(null);
    }

    function getFocusable() {
      const modal = backdrop.querySelector(".pos-modal");
      if (!modal) return [];
      return [
        ...modal.querySelectorAll(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ),
      ].filter((el) => el.offsetParent !== null);
    }

    reasonEl.value = defaultText;
    reasonEl.disabled = false;
    reasonEl.readOnly = false;
    reasonEl.style.pointerEvents = "auto";

    let resolveFn;
    const p = new Promise((resolve) => (resolveFn = resolve));

    function close() {
      backdrop.style.display = "none";
      btnYes.removeEventListener("click", onYes);
      btnNo.removeEventListener("click", onNo);
      btnX.removeEventListener("click", onNo);
      backdrop.removeEventListener("click", onBackdrop);
      document.removeEventListener("keydown", onKeydown);

      if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
        setTimeout(() => lastFocusedEl.focus(), 0);
      }
    }

    function onYes() {
      const reason = (reasonEl.value || "").trim();
      close();
      resolveFn(reason);
    }

    function onNo() {
      close();
      resolveFn(null);
    }

    function onBackdrop(e) {
      if (e.target === backdrop) onNo();
    }

    function onKeydown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onNo();
        return;
      }

      if (e.key !== "Tab") return;

      const focusables = getFocusable();
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
        return;
      }

      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
        return;
      }
    }

    backdrop.style.display = "flex";
    btnYes.addEventListener("click", onYes);
    btnNo.addEventListener("click", onNo);
    btnX.addEventListener("click", onNo);
    backdrop.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKeydown);

    setTimeout(() => {
      reasonEl.focus();
      const focusables = getFocusable();
      if (focusables.length) focusables[0].focus();
    }, 50);

    return p;
  }

  /* =========================================================
     INPUT FILTER HELPERS (Logistics)
  ========================================================== */
  function filterDeliveredBy(value) {
    return String(value || "")
      .replace(/[0-9]/g, "")
      .replace(/[^\p{L}\s.\-']/gu, "")
      .replace(/\s{2,}/g, " ")
      .trimStart();
  }

  const deliveryByError = document.getElementById("deliveryByError");

  function validateDeliveredBy() {
    if (!deliveryByEl) return false;

    const value = deliveryByEl.value.trim();
    const len = value.length;

    const setMsg = (txt) => {
      if (deliveryByError) deliveryByError.textContent = txt;
    };

    if (len === 0) {
      deliveryByEl.classList.remove("input-valid", "input-invalid");
      setMsg("");
      return false;
    }

    if (len < 3) {
      deliveryByEl.classList.add("input-invalid");
      deliveryByEl.classList.remove("input-valid");
      setMsg("Minimum 3 characters required");
      return false;
    }

    if (len > 40) {
      deliveryByEl.classList.add("input-invalid");
      deliveryByEl.classList.remove("input-valid");
      setMsg("Maximum 40 characters allowed");
      return false;
    }

    deliveryByEl.classList.remove("input-invalid");
    deliveryByEl.classList.add("input-valid");
    setMsg("");
    return true;
  }

  function filterVehicleNo(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9\- ]/g, "")
      .replace(/\s{2,}/g, " ")
      .trimStart()
      .slice(0, 20);
  }

  function filterTrackingId(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "")
      .slice(0, 40);
  }

  function filterDeliveryNotes(value) {
    const v = String(value || "")
      .replace(/[<>{}\[\]]/g, "")
      .replace(/\s{3,}/g, "  ");
    return v.slice(0, 800);
  }

  /* =========================================================
     GENERAL HELPERS
  ========================================================== */
  function genDnId() {
    const n = String(Math.floor(1000 + Math.random() * 9000));
    return `DN-${n}`;
  }

  function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function productOptions() {
    return [`<option value="">Select Product</option>`]
      .concat(PRODUCTS.map((p) => `<option value="${p.id}">${p.name}</option>`))
      .join("");
  }

  function uomOptions(uoms) {
    const list = uoms?.length ? uoms : ["Nos"];
    return list.map((x) => `<option value="${x}">${x}</option>`).join("");
  }

  function setDnIdValue(id) {
    if (dnId) dnId.value = id;
    if (dnIdView) dnIdView.value = id;
  }

  function renumber() {
    [...itemsBody.querySelectorAll("tr")].forEach((tr, idx) => {
      const sno = tr.querySelector(".sno");
      if (sno) sno.textContent = String(idx + 1);
    });
  }

  function normalizeDeliveryStatus(v) {
    const s = String(v || "").trim().toLowerCase();
    const map = { submitted: "draft" };
    return map[s] || s;
  }

  function normalizeKey(v) {
    return String(v || "").trim().toLowerCase().replaceAll(" ", "_");
  }

  function statusText(key) {
    const map = {
      draft: "Draft",
      partially_delivered: "Partially Delivered",
      delivered: "Delivered",
      returned: "Returned",
      cancelled: "Cancelled",
    };
    return map[key] || "";
  }

  /* =========================================================
     ACK UI STATE + VALIDATION
  ========================================================== */
  let uploadedAckFile = null;
  let ackSaved = false;

  function showAckSection() {
    if (ackSection) ackSection.style.display = "";
  }

  function setAckDisabled(disabled) {
    if (!ackSection) return;
    ackSection.classList.toggle("ack-disabled", !!disabled);
  }

  function filterNameInput(value) {
    return String(value || "")
      .replace(/[0-9]/g, "")
      .replace(/[^\p{L}\s\.\-']/gu, "");
  }

  function filterPhoneInput(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 10);
  }

  function isNameValid() {
    const v = (ackReceivedBy?.value || "").trim();
    if (v.length < 3 || v.length > 40) return false;
    if (!/^\p{L}/u.test(v)) return false;
    if (!/^[\p{L}\s\.\-']+$/u.test(v)) return false;
    return true;
  }

  function isPhoneValid() {
    const v = (ackContact?.value || "").trim();
    return /^\d{10}$/.test(v);
  }

  function renderAckFiles() {
    if (!ackFiles) return;

    if (!uploadedAckFile) {
      ackFiles.innerHTML = `<div class="ack-empty">No file uploaded yet.</div>`;
      return;
    }

    ackFiles.innerHTML = `
      <div class="ack-file-row">
        <div class="ack-file-name">1. ${uploadedAckFile.name}</div>
        <div class="ack-file-actions">
          <button type="button" class="ack-btn" id="ackDownloadBtn">Download</button>
          <button type="button" class="ack-btn ghost" id="ackRemoveBtn">Remove</button>
        </div>
      </div>
    `;

    document.getElementById("ackDownloadBtn")?.addEventListener("click", () => {
      const url = URL.createObjectURL(uploadedAckFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = uploadedAckFile.name;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("ackRemoveBtn")?.addEventListener("click", () => {
      uploadedAckFile = null;
      ackSaved = false;
      if (ackPodFile) ackPodFile.value = "";
      renderAckFiles();
      updatePdfEmailButtons();
      showToast("POD removed", "info");
    });
  }

  ackReceivedBy?.addEventListener("input", () => {
    const cleaned = filterNameInput(ackReceivedBy.value);
    if (ackReceivedBy.value !== cleaned) ackReceivedBy.value = cleaned;
  });

  ackContact?.addEventListener("input", () => {
    const cleaned = filterPhoneInput(ackContact.value);
    if (ackContact.value !== cleaned) ackContact.value = cleaned;
  });

  ackPodFile?.addEventListener("change", () => {
    uploadedAckFile = ackPodFile.files && ackPodFile.files[0] ? ackPodFile.files[0] : null;
    ackSaved = false;
    renderAckFiles();
    updatePdfEmailButtons();
  });

  function isAckValid() {
    const nameOk = isNameValid();
    const phoneOk = isPhoneValid();
    const fileOk = !!uploadedAckFile;
    return nameOk && phoneOk && fileOk;
  }

  /* =========================================================
     PDF / EMAIL ENABLE RULES
  ========================================================== */
  function updatePdfEmailButtons() {
    const stKey = normalizeKey(deliveryStatusEl?.value || "");
    const statusOk = stKey === "partially_delivered" || stKey === "delivered";

    // In view: allow based on status only
    // In edit/new: require acknowledgement saved
    const canEnable = statusOk && (mode === "view" ? true : ackSaved);

    if (pdfBtn) pdfBtn.disabled = !canEnable;
    if (emailBtn) emailBtn.disabled = !canEnable;
  }

  ackSaveBtn?.addEventListener("click", async () => {
    if (!ackSection || ackSection.classList.contains("ack-disabled")) {
      showToast("Acknowledgement is disabled for this status.", "warn");
      return;
    }

    if (!isAckValid()) {
      if (!isNameValid()) showToast("Received By must be 3 to 40 letters (no numbers).", "error");
      else if (!isPhoneValid()) showToast("Contact Number must be exactly 10 digits.", "error");
      else if (!uploadedAckFile) showToast("Please upload POD file (PDF/JPG/PNG).", "error");
      return;
    }

    // If you have backend API, call it here
    ackSaved = true;
    showToast("Acknowledgement saved.", "success");
    updatePdfEmailButtons();
  });

  pdfBtn?.addEventListener("click", () => {
    console.log("PDF button clicked");

    const id = dnId?.value || dnIdView?.value || "";
    if (!id) {
      showToast("DN ID missing", "error");
      return;
    }

    window.open(`/api/delivery-notes/${encodeURIComponent(id)}/pdf`, "_blank");
  });

  emailBtn?.addEventListener("click", async () => {
    console.log("Email button clicked");

    const id = dnId?.value || dnIdView?.value || "";
    if (!id) {
      showToast("DN ID missing. Save the Delivery Note first.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/delivery-notes/${encodeURIComponent(id)}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        showToast("Email sent successfully ✔", "success");
      } else {
        showToast(data.message || "Email sending failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server not reachable", "error");
    }
  });

  /* =========================================================
     STATUS UI (title pill + ack enable + return enable)
  ========================================================== */
  function applyStatusUI({ mode, statusKey, isFreshNew }) {
    // Status pill
    if (statusPillEl) {
      if (isFreshNew) {
        statusPillEl.style.display = "none";
      } else {
        statusPillEl.style.display = "";
        statusPillEl.className = "dn2-status-pill " + statusKey;
        statusPillEl.textContent = "Status: " + statusText(statusKey);
      }
    }

    // ACK always visible; enable only for partial/delivered and not view
    showAckSection();

    const canEnableAck =
      (statusKey === "partially_delivered" || statusKey === "delivered") &&
      mode !== "view";

    setAckDisabled(!canEnableAck);

    // Return button enable only for partial/delivered (not view)
    const canReturn = statusKey === "partially_delivered" || statusKey === "delivered";
    if (returnBtn) returnBtn.disabled = !(canReturn && mode !== "view");

    // Cancel DN enable/disable
    if (cancelDnBtn) {
      const canCancel = statusKey !== "cancelled" && !isFreshNew;
      cancelDnBtn.disabled = !canCancel;
    }

    // If ack disabled in edit/new, lock pdf/email
    if (!canEnableAck && mode !== "view") {
      ackSaved = false;
    }

    updatePdfEmailButtons();
  }

  /* =========================================================
     LINE ITEMS (Add row)
  ========================================================== */
  function addRow(prefill = {}) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="w-sno" style="text-align:center;"><span class="sno">1</span></td>

      <td>
        <select class="prodSel">
          ${productOptions()}
        </select>
      </td>

      <td><input class="prodId" type="text" value="${prefill.product_id || ""}" readonly></td>

      <td><input class="qty" type="number" min="1" step="1" value="${prefill.qty ?? 1}"></td>

      <td>
        <select class="uomSel">
          ${uomOptions(prefill.uoms)}
        </select>
      </td>

      <td><input class="serials" type="text" placeholder="Ex: S001,S002" value="${prefill.serials || ""}"></td>

      <td class="w-act" style="text-align:center;">
        <button type="button" class="dn2-trash" title="Delete">🗑</button>
      </td>
    `;

    const prodSel = tr.querySelector(".prodSel");
    const prodIdInp = tr.querySelector(".prodId");
    const uomSel = tr.querySelector(".uomSel");
    const delBtn = tr.querySelector(".dn2-trash");

    prodSel.value = prefill.product_id || "";

    prodSel.addEventListener("change", () => {
      const pid = prodSel.value;
      const p = PRODUCTS.find((x) => x.id === pid);
      prodIdInp.value = pid || "";
      const uoms = p?.uoms || ["Nos"];
      uomSel.innerHTML = uomOptions(uoms);
      if (prefill.uom) uomSel.value = prefill.uom;
      validateSubmit();
    });

    delBtn.addEventListener("click", () => {
      tr.remove();
      renumber();
      validateSubmit();
    });

    itemsBody.appendChild(tr);

    if (prodSel.value) prodSel.dispatchEvent(new Event("change"));
    if (prefill.uom) uomSel.value = prefill.uom;

    renumber();
    validateSubmit();
  }

  /* =========================================================
     SALES ORDER REF -> AUTO FILL
  ========================================================== */
  async function loadSORefs() {
    if (!soRefSel) return;

    try {
      const res = await fetch("/api/sales-orders", { cache: "no-store" });
      const list = await res.json();

      soRefSel.innerHTML = `<option value="">Select Order Reference</option>`;
      (list || []).forEach((row) => {
        const id = row.so_id || row.id;
        if (!id) return;
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = id;
        soRefSel.appendChild(opt);
      });
    } catch (e) {
      console.error("Failed to load SO refs:", e);
    }
  }

  async function onSORefChange() {
    const soId = soRefSel?.value;

    if (!soId) {
      if (custNameEl) custNameEl.value = "";
      if (destAddrEl) destAddrEl.value = "";
      itemsBody.innerHTML = "";
      addRow();
      validateSubmit();
      return;
    }

    try {
      const res = await fetch(`/api/sales-orders/${encodeURIComponent(soId)}`, { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();

      if (custNameEl) custNameEl.value = data.customer_name || "";
      if (destAddrEl) destAddrEl.value = data.shipping_address || "";

      // Optional auto-fill Tracking ID from SO if available
      if (trackingIdEl) {
        trackingIdEl.value =
          data.tracking_number ||
          data.tracking_id ||
          data.trackingNo ||
          "";
      }

      itemsBody.innerHTML = "";
      const items = data.items || [];
      if (items.length === 0) {
        addRow();
        validateSubmit();
        return;
      }

      items.forEach((it) => {
        addRow({
          product_id: it.product_id || "",
          qty: it.qty ?? 1,
          uom: it.uom || "Nos",
          uoms: [it.uom || "Nos"],
          serials: it.serials || "",
        });
      });

      validateSubmit();
    } catch (e) {
      console.error("Failed to load SO detail:", e);
    }
  }

  soRefSel?.addEventListener("change", onSORefChange);

  /* =========================================================
     COLLECT + SAVE
  ========================================================== */
  function collectItems() {
    const rows = [...itemsBody.querySelectorAll("tr")];
    return rows
      .map((tr) => ({
        product_id: tr.querySelector(".prodId")?.value || "",
        product_name: tr.querySelector(".prodSel option:checked")?.textContent || "",
        qty: Number(tr.querySelector(".qty")?.value || 0),
        uom: tr.querySelector(".uomSel")?.value || "",
        serials: tr.querySelector(".serials")?.value || "",
      }))
      .filter((x) => x.product_id);
  }

  async function saveDN(status) {
    const payload = {
      dn_id: dnId?.value || dnIdView?.value || "",
      delivery_date: dnDate?.value || "",
      so_ref: soRefSel?.value || "",
      customer_name: custNameEl?.value || "",
      delivery_type: dnTypeEl?.value || "",
      destination_address: destAddrEl?.value || "",
      delivery_by: deliveryByEl?.value || "",
      delivery_status: deliveryStatusEl?.value || status,
      vehicle_no: vehicleNoEl?.value || "",
      tracking_id: trackingIdEl?.value || "",
      delivery_notes: deliveryNotesEl?.value || "",
      status: status, // Draft / Submitted
      items: collectItems(),
    };

    const url = editId ? `/api/delivery-notes/${encodeURIComponent(editId)}` : `/api/delivery-notes`;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        showToast(status === "Draft" ? "Saved as draft" : "Delivery Note submitted", "success");
        redirectAfter("/delivery_note", 1500);
      } else {
        showToast(data.message || "Save failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  }

  /* =========================================================
     LOAD FOR EDIT / VIEW
  ========================================================== */
  async function loadForEdit(dn_id) {
    const res = await fetch(`/api/delivery-notes/${encodeURIComponent(dn_id)}`, { cache: "no-store" });
    const json = await res.json();

    if (!json.success) {
      showToast(json.message || "Not found", "error");
      return;
    }

    const dn = json.data;

    setDnIdValue(dn.dn_id || "");
    if (dnDate) dnDate.value = dn.delivery_date || "";

    if (soRefSel) soRefSel.value = dn.so_ref || "";

    if (custNameEl) custNameEl.value = dn.customer_name || "";
    if (dnTypeEl) dnTypeEl.value = String(dn.delivery_type || "").trim().toLowerCase();
    if (destAddrEl) destAddrEl.value = dn.destination_address || "";

    if (deliveryByEl) deliveryByEl.value = dn.delivery_by || "";
    if (deliveryStatusEl) deliveryStatusEl.value = normalizeDeliveryStatus(dn.delivery_status || dn.status || "draft");
    if (vehicleNoEl) vehicleNoEl.value = dn.vehicle_no || "";
    if (trackingIdEl) trackingIdEl.value = dn.tracking_id || "";
    if (deliveryNotesEl) deliveryNotesEl.value = dn.delivery_notes || "";

    itemsBody.innerHTML = "";
    (dn.items || []).forEach((it) => {
      addRow({
        product_id: it.product_id || "",
        qty: it.qty ?? 1,
        serials: it.serials || "",
        uom: it.uom || "Nos",
        uoms: [it.uom || "Nos"],
      });
    });
    if (!itemsBody.querySelector("tr")) addRow();

    const stKey = normalizeKey(deliveryStatusEl?.value || dn.delivery_status || dn.status || "draft");
    applyStatusUI({ mode, statusKey: stKey, isFreshNew: false });

    validateSubmit();
  }

  function setReadonlyView() {
    document
      .querySelectorAll(".dn2-page input, .dn2-page select, .dn2-page textarea, .dn2-page button")
      .forEach((el) => {
        if (el === cancelBtn) return;
        if (el === cancelDnBtn) return;
        if (el.closest("#cancelDnBackdrop")) return;
        el.disabled = true;
      });

    addItemBtn?.style.setProperty("display", "none");
    saveDraftBtn?.style.setProperty("display", "none");
    submitBtn?.style.setProperty("display", "none");
  }

  /* =========================================================
     SUBMIT VALIDATION (enable/disable submit button)
  ========================================================== */
  const requiredFields = [
    "#dnDate",
    "#soRef",
    "#custName",
    "#dnType",
    "#destAddr",
    "#deliveryBy",
    "#deliveryStatus",
    "#vehicleNo",
    "#trackingId",
    "#deliveryNotes",
  ];

  function isFilled(selector) {
    const el = document.querySelector(selector);
    if (!el) return true;
    return (el.value || "").trim() !== "";
  }

  function validateSubmit() {
    if (!submitBtn) return;
    const allOk = requiredFields.every(isFilled) && validateDeliveredBy();
    const hasItems = document.querySelectorAll("#itemsBody tr").length > 0;
    submitBtn.disabled = !(allOk && hasItems);
  }

  requiredFields.forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener("input", validateSubmit);
    el.addEventListener("change", validateSubmit);
  });

  itemsBody?.addEventListener("input", validateSubmit);
  itemsBody?.addEventListener("change", validateSubmit);

  /* =========================================================
     INPUT EVENTS (Logistics live filters)
  ========================================================== */
  deliveryByEl?.addEventListener("input", () => {
    const cleaned = filterDeliveredBy(deliveryByEl.value);
    if (deliveryByEl.value !== cleaned) deliveryByEl.value = cleaned;

    validateDeliveredBy();
    validateSubmit();
  });

  vehicleNoEl?.addEventListener("input", () => {
    const cleaned = filterVehicleNo(vehicleNoEl.value);
    if (vehicleNoEl.value !== cleaned) vehicleNoEl.value = cleaned;
    validateSubmit();
  });

  trackingIdEl?.addEventListener("input", () => {
    const cleaned = filterTrackingId(trackingIdEl.value);
    if (trackingIdEl.value !== cleaned) trackingIdEl.value = cleaned;
    validateSubmit();
  });

  deliveryNotesEl?.addEventListener("input", () => {
    const cleaned = filterDeliveryNotes(deliveryNotesEl.value);
    if (deliveryNotesEl.value !== cleaned) {
      const pos = deliveryNotesEl.selectionStart;
      deliveryNotesEl.value = cleaned;
      deliveryNotesEl.setSelectionRange(Math.min(pos, cleaned.length), Math.min(pos, cleaned.length));
    }
    validateSubmit();
  });

  /* =========================================================
     MAIN EVENTS
  ========================================================== */
  cancelBtn?.addEventListener("click", () => (window.location.href = "/delivery_note"));

  addItemBtn?.addEventListener("click", () => addRow());

  saveDraftBtn?.addEventListener("click", () => saveDN("Draft"));
  submitBtn?.addEventListener("click", () => saveDN("Submitted"));

  returnBtn?.addEventListener("click", () => {
    const id = dnId?.value || dnIdView?.value || "";
    if (!id) return showToast("Delivery Note ID not found", "error");
    window.location.href = `/delivery-return/create/${encodeURIComponent(id)}`;
  });

  deliveryStatusEl?.addEventListener("change", () => {
    const stKey = normalizeKey(deliveryStatusEl.value);
    applyStatusUI({ mode, statusKey: stKey, isFreshNew: !editId });
    validateSubmit();
  });

  /* =========================================================
     INIT
  ========================================================== */
  (async function init() {
    showAckSection();
    renderAckFiles();

    await loadSORefs();

    if (editId) {
      await loadForEdit(editId);

      if (mode === "view") {
        setReadonlyView();
      } else {
        if (pageTitleEl) pageTitleEl.textContent = "New Delivery Note";
        if (submitBtn) submitBtn.textContent = "Update Delivery Note";
      }
    } else {
      const newId = genDnId();
      setDnIdValue(newId);
      if (dnDate) dnDate.value = todayISO();

      applyStatusUI({ mode: "new", statusKey: "draft", isFreshNew: true });

      addRow();
      validateSubmit();
    }

    updatePdfEmailButtons();
  })();
});