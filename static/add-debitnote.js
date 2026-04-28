document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM loaded, initializing debit note page');
  const purchasedTotalEl = document.getElementById("purchasedTotal");
const amountPaidInput = document.getElementById("amountPaid");
const balanceDueEl = document.getElementById("balanceDue");
const returnAmountEl = document.getElementById("returnAmount");
const balanceRecoverEl = document.getElementById("balanceRecover");

function updateSummary() {
  const purchaseTotalText = document.getElementById("lineItemsTotal")?.textContent || "₹0";
  const purchaseTotal = Number(purchaseTotalText.replace(/[₹,]/g, "")) || 0;

  const paid = Number(amountPaidInput?.value || 0);

  // Only calculate when user enters amount paid
  if (paid > 0) {
    const balanceDue = purchaseTotal - paid;
    const returnAmount = purchaseTotal;
    const recover = returnAmount - paid;

    if (balanceDueEl) balanceDueEl.textContent = "₹" + balanceDue.toLocaleString("en-IN");
    if (returnAmountEl) returnAmountEl.textContent = "₹" + returnAmount.toLocaleString("en-IN");
    if (balanceRecoverEl) balanceRecoverEl.textContent = "₹" + recover.toLocaleString("en-IN");
  } else {
    // Show ₹0 when no amount is paid
    if (balanceDueEl) balanceDueEl.textContent = "₹0";
    if (returnAmountEl) returnAmountEl.textContent = "₹0";
    if (balanceRecoverEl) balanceRecoverEl.textContent = "₹0";
  }

  if (purchasedTotalEl) purchasedTotalEl.textContent = "₹" + purchaseTotal.toLocaleString("en-IN");
}

// New function to update payment calculations when line items change
function updatePaymentCalculations(purchaseTotal) {
  const paid = Number(amountPaidInput?.value || 0);
  
  // Show ₹0 for all balance fields initially
  const balanceDue = 0;
  const returnAmount = 0;
  const recover = 0;

  if (purchasedTotalEl) purchasedTotalEl.textContent = "₹" + purchaseTotal.toLocaleString("en-IN");
  if (balanceDueEl) balanceDueEl.textContent = "₹" + balanceDue;
  if (returnAmountEl) returnAmountEl.textContent = "₹" + returnAmount;
  if (balanceRecoverEl) balanceRecoverEl.textContent = "₹" + recover;
}

amountPaidInput?.addEventListener("input", updateSummary);

// initial load
updateSummary();
  // Simple tab switching functionality
  function initializeTabs() {
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".tab-panel");
    
    console.log('Found tabs:', tabs.length);
    console.log('Found panels:', panels.length);
    
    tabs.forEach(tab => {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetId = this.getAttribute('data-tab');
        console.log('Clicked tab:', targetId);
        
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all panels
        panels.forEach(p => p.classList.remove('active'));
        // Show target panel
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
          console.log('Activated panel:', targetId);
          
          // Load content for specific tabs
          if (targetId === 'history') {
            loadHistoryContent();
          } else if (targetId === 'attachments') {
            initializeAttachments();
          }
        } else {
          console.error('Panel not found:', targetId);
        }
      });
    });
  }
  
  function loadHistoryContent() {
    if (typeof window.loadDebitHistoryComments === "function") {
      window.loadDebitHistoryComments();
    }
  }
  function initializeRowActions() {
    const tbody = document.querySelector(".line-items-table tbody");
    const addBtn = document.getElementById("addRowBtn");

    if (!tbody || !addBtn) return;

    let rowCount = tbody.querySelectorAll("tr").length;

    // ADD ROW
    addBtn.addEventListener("click", () => {
      rowCount++;

      const newRow = document.createElement("tr");

      newRow.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" name="product_name_${rowCount}"></td>
        <td><input type="text" name="product_id_${rowCount}"></td>
        <td><input type="number" name="returned_qty_${rowCount}" value="0" min="0"></td>
        <td><input type="text" name="uom2_${rowCount}" value="PCS"></td>
        <td><input type="number" name="rate_${rowCount}" value="0" step="0.01"></td>
        <td><input type="number" name="tax_${rowCount}" value="0" step="0.01"></td>
        <td><input type="text" name="total_${rowCount}" readonly></td>
        <td>
          <button type="button" class="delete-row so-delete-btn" aria-label="Delete row" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;

      tbody.appendChild(newRow);
      
      // Add event listeners for calculations
      const newInputs = newRow.querySelectorAll("input[name^='returned_qty_'], input[name^='rate_'], input[name^='tax_']");
      newInputs.forEach((input) => {
        input.addEventListener("input", window.updateTotals);
      });
    });

    // DELETE ROW (event delegation)
    tbody.addEventListener("click", (e) => {
      if (e.target.closest(".delete-row")) {
        const row = e.target.closest("tr");
        row.remove();

        // Reorder serial numbers
        const rows = tbody.querySelectorAll("tr");
        rows.forEach((row, index) => {
          row.children[0].textContent = index + 1;
        });

        rowCount = rows.length;
        window.updateTotals(); // Recalculate totals after deletion
      }
    });
  }
  function initializeAttachments() {
    console.log('Initializing attachments');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadCard = document.getElementById('uploadCard');
    const filesList = document.getElementById('filesList');
    const fileCount = document.getElementById('fileCount');
    
    if (!fileInput || !uploadBtn || !uploadCard || !filesList) {
      console.warn('Attachment elements not found');
      return;
    }
    
    let attachedFiles = [];
    
    // Click handlers for upload
    uploadBtn.onclick = () => fileInput.click();
    uploadCard.onclick = () => fileInput.click();
    
    // File selection handler
    fileInput.addEventListener('change', function(e) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (validateFile(file)) {
          attachedFiles.push({
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            uploadDate: new Date().toLocaleDateString()
          });
        }
      });
      renderFiles();
      fileInput.value = '';
    });
    
    function validateFile(file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                           'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                           'image/jpeg', 'image/jpg', 'image/png'];
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File type not allowed. Please use PDF, DOC, XLS, JPG, or PNG files.`);
        return false;
      }
      
      return true;
    }
    
    function renderFiles() {
      if (fileCount) {
        fileCount.textContent = `${attachedFiles.length} file${attachedFiles.length !== 1 ? 's' : ''}`;
      }
      
      if (attachedFiles.length === 0) {
        filesList.innerHTML = `
          <div class="no-files" style="text-align: center; padding: 40px; color: #999;">
            <i class="fa-regular fa-folder-open" style="font-size: 48px; margin-bottom: 15px;"></i>
            <p>No files attached yet</p>
          </div>
        `;
        return;
      }
      
      filesList.innerHTML = attachedFiles.map(file => `
        <div class="file-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; background: #f8f9fa;">
          <div style="display: flex; align-items: center;">
            <i class="fa-solid fa-file" style="margin-right: 10px; color: #666; font-size: 18px;"></i>
            <div>
              <div style="font-weight: 500; color: #333;">${file.name}</div>
              <div style="font-size: 12px; color: #666;">${formatFileSize(file.size)} • ${file.uploadDate}</div>
            </div>
          </div>
          <div>
            <button onclick="downloadFile('${file.id}')" style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 8px; cursor: pointer;">
              Download
            </button>
            <button onclick="removeFile('${file.id}')" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
              Remove
            </button>
          </div>
        </div>
      `).join('');
    }
    
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Global functions for file operations
    window.removeFile = function(fileId) {
      if (confirm('Are you sure you want to remove this file?')) {
        attachedFiles = attachedFiles.filter(file => file.id != fileId);
        renderFiles();
      }
    };
    
    window.downloadFile = function(fileId) {
      const file = attachedFiles.find(f => f.id == fileId);
      if (file) {
        const url = URL.createObjectURL(file.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };
  }
  
  // Initialize tabs
  initializeTabs();
  
  // Initialize other functionality
  initializeRowActions();
  initializeComments();
  initializeFormHandlers();
  initializeCalculations();
});

function initializeComments() {
  const HISTORY_STORAGE_KEY = "debitnote_comment_history";
  const commentTextarea = document.querySelector("#comments textarea[name='comment']");
  const addCommentBtn = document.querySelector("#addCommentBtn") || document.querySelector(".comment-box .btn-primary");
  const historyPanel = document.querySelector("#history");
  const latestCommentPreview = document.getElementById("latestCommentPreview");

  const readStoredHistory = () => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  };

  const writeStoredHistory = (items) => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  };

  const renderLatestComment = () => {
    if (!latestCommentPreview) return;
    const history = readStoredHistory();
    const latest = history[history.length - 1];
    if (!latest) {
      latestCommentPreview.classList.add("latest-comment-empty");
      latestCommentPreview.textContent = "No comments yet.";
      return;
    }
    latestCommentPreview.classList.remove("latest-comment-empty");
    latestCommentPreview.innerHTML = `<strong>${latest.user || "You"}</strong> <span style="color:#7f5e5e;">- ${latest.time || ""}</span><div style="margin-top:6px;">${latest.text || ""}</div>`;
  };

  const renderHistory = () => {
    if (!historyPanel) return;
    const history = readStoredHistory();
    historyPanel.innerHTML = "";
    if (!history.length) {
      historyPanel.innerHTML = `<div class="no-history-message">No history available.</div>`;
      return;
    }
    history.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.innerHTML = `
        <span class="user">${entry.user || "You"}</span>
        <span class="time">- ${entry.time || ""}</span>
        <p>${entry.text || ""}</p>
      `;
      historyPanel.appendChild(item);
    });
  };

  window.loadDebitHistoryComments = renderHistory;
  renderHistory();
  renderLatestComment();

  if (addCommentBtn && commentTextarea && historyPanel) {
    addCommentBtn.addEventListener("click", () => {
      const text = commentTextarea.value.trim();
      if (!text) {
        commentTextarea.focus();
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

      const current = readStoredHistory();
      current.push({ user: "You", time: label, text });
      writeStoredHistory(current);
      renderHistory();
      renderLatestComment();
      commentTextarea.value = "";
      commentTextarea.focus();
    });
  }
}

function initializeFormHandlers() {
  const cancelBtn = document.querySelector(".btn-outline");
  const saveDraftBtn = document.querySelector(".btn-save-draft");
  const submitBtn = document.querySelector(".btn-submit");
  const mailBtn = document.querySelector("#mailBtn");
  const pdfBtn = document.querySelector("#pdfBtn");
  const form = document.querySelector(".debitnote-form");
  
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = '/debitnote';
    });
  }

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
      alert("Draft saved successfully.");
    });
  }

  if (mailBtn) {
    mailBtn.addEventListener("click", () => {
      alert("Email functionality - Send debit note via email");
      // Add your email sending logic here
    });
  }

  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      alert("PDF functionality - Generate PDF of debit note");
      // Add your PDF generation logic here
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Debit note saved successfully.");
    });
  }
}

function initializeCalculations() {
  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    if (Number.isNaN(amount)) return "₹0";
    return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const parseNumber = (value) => {
    const number = Number(String(value).replace(/,/g, ""));
    return Number.isNaN(number) ? 0 : number;
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

  // Make updateTotals globally available
  window.updateTotals = () => {
    const lineTableBody = document.querySelector(".line-items-table tbody");
    const purchaseTotalEl = document.querySelector(".summary-row strong");
    const purchasedTotalEl = document.getElementById("purchasedTotal");
    
    if (!lineTableBody) return;
    const rows = Array.from(lineTableBody.querySelectorAll("tr"));
    const grandTotal = rows.reduce((sum, row) => sum + updateRowTotal(row), 0);
    
    const formattedTotal = formatCurrency(grandTotal);
    
    // Update both line items total and payment section
    if (purchaseTotalEl) {
      purchaseTotalEl.textContent = formattedTotal;
    }
    if (purchasedTotalEl) {
      purchasedTotalEl.textContent = formattedTotal;
    }
    
    // Trigger payment calculations update
    updatePaymentCalculations(grandTotal);
  };

  const addLineInputListeners = () => {
    const lineTableBody = document.querySelector(".line-items-table tbody");
    if (!lineTableBody) return;
    const inputs = lineTableBody.querySelectorAll("input[name^='returned_qty_'], input[name^='rate_'], input[name^='tax_']");
    inputs.forEach((input) => {
      input.addEventListener("input", window.updateTotals);
    });
  };

  addLineInputListeners();
  window.updateTotals();
}