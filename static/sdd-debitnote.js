document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  const commentTextarea = document.querySelector("#comments textarea[name='comment']");
  const addCommentBtn = document.querySelector(".comment-box .btn-secondary");
  const commentsPanel = document.querySelector("#comments");
  const attachmentPlaceholder = document.querySelector(".attachment-placeholder");
  const cancelButtons = document.querySelectorAll(".btn-outline");
  const saveDraftBtn = document.querySelector(".form-actions .btn-secondary");
  const purchaseTotalEl = document.querySelector(".summary-row strong");
  const lineTableBody = document.querySelector(".line-items-table tbody");
  const form = document.querySelector(".debitnote-form");

  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    if (Number.isNaN(amount)) return "₹0";
    return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const parseNumber = (value) => {
    const number = Number(String(value).replace(/,/g, ""));
    return Number.isNaN(number) ? 0 : number;
  };

  const switchTab = (targetId) => {
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === targetId);
    });
    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
  };

  const updateRowTotal = (row) => {
    const qtyInput = row.querySelector("input[name^='returned_qty_']");
    const rateInput = row.querySelector("input[name^='rate_']");
    const taxInput = row.querySelector("input[name^='tax_']");
    const totalInput = row.querySelector("input[name^='total_']");

    if (!qtyInput || !rateInput || !taxInput || !totalInput) return;

    const qty = parseNumber(qtyInput.value);
    const rate = parseNumber(rateInput.value);
    const tax = parseNumber(taxInput.value);
    const gross = qty * rate;
    const total = gross + gross * (tax / 100);
    totalInput.value = formatCurrency(total);
    return total;
  };

  const updateTotals = () => {
    if (!lineTableBody) return;
    const rows = Array.from(lineTableBody.querySelectorAll("tr"));
    const grandTotal = rows.reduce((sum, row) => sum + updateRowTotal(row), 0);
    if (purchaseTotalEl) {
      purchaseTotalEl.textContent = formatCurrency(grandTotal);
    }
  };

  const addLineInputListeners = () => {
    if (!lineTableBody) return;
    const inputs = lineTableBody.querySelectorAll("input[name^='returned_qty_'], input[name^='rate_'], input[name^='tax_']");
    inputs.forEach((input) => {
      input.addEventListener("input", updateTotals);
    });
  };

  const addComment = () => {
    const text = commentTextarea?.value.trim();
    if (!text) {
      commentTextarea?.focus();
      return;
    }

    const created = new Date();
    const label = created.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-avatar">You</div>
      <div class="history-text">
        <strong>You</strong>
        <span>${label}</span>
        <p>${text}</p>
      </div>
    `;

    commentsPanel.appendChild(item);
    commentTextarea.value = "";
    commentTextarea.focus();
  };

  const createAttachmentInput = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.addEventListener("change", () => {
      const files = Array.from(fileInput.files || []);
      if (!files.length) return;
      attachmentPlaceholder.innerHTML = `<p>${files.length} file${files.length > 1 ? "s" : ""} selected</p>`;
      document.body.removeChild(fileInput);
    });
    fileInput.click();
  };

  if (tabs.length) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });
  }

  if (addCommentBtn) {
    addCommentBtn.addEventListener("click", addComment);
  }

  if (attachmentPlaceholder) {
    attachmentPlaceholder.addEventListener("click", createAttachmentInput);
    attachmentPlaceholder.addEventListener("dragover", (event) => {
      event.preventDefault();
      attachmentPlaceholder.classList.add("drag-over");
    });
    attachmentPlaceholder.addEventListener("dragleave", () => {
      attachmentPlaceholder.classList.remove("drag-over");
    });
    attachmentPlaceholder.addEventListener("drop", (event) => {
      event.preventDefault();
      attachmentPlaceholder.classList.remove("drag-over");
      const files = Array.from(event.dataTransfer.files || []);
      if (!files.length) return;
      attachmentPlaceholder.innerHTML = `<p>${files.length} file${files.length > 1 ? "s" : ""} dropped</p>`;
    });
  }

  if (cancelButtons.length) {
    cancelButtons.forEach((button) => {
      button.addEventListener("click", () => window.history.back());
    });
  }

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
      alert("Draft saved successfully.");
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Debit note saved successfully.");
    });
  }

  addLineInputListeners();
  updateTotals();
});
