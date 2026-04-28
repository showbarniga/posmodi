document.addEventListener("DOMContentLoaded", () => {
 
  console.log("Supplier Page Loaded ✅");
 
  const commentText = document.getElementById("commentText");
  const addCommentBtn = document.getElementById("addCommentBtn");
  const historyList = document.getElementById("historyList");
 
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
 
  const uploadBtn = document.getElementById("uploadBtn");
  const uploadCard = document.getElementById("uploadCard");
  const fileInput = document.getElementById("fileInput");
  const filesList = document.getElementById("filesList");
  const fileCount = document.getElementById("fileCount");
 
  /* SAFETY */
  if (!commentText || !addCommentBtn) {
    console.error("❌ Comment elements missing");
    return;
  }
 
  // let comments = [];
  // let files = [];
 
  /* ENABLE BUTTON */
  commentText.addEventListener("input", () => {
    const hasText = commentText.value.trim().length > 0;
    addCommentBtn.disabled = !hasText;
    addCommentBtn.classList.toggle("enabled", hasText);
  });
 
  /* ADD COMMENT */
  // addCommentBtn.addEventListener("click", (e) => {
  //   e.preventDefault();
 
  //   const text = commentText.value.trim();
  //   if (!text) return;
 
  //   const time = new Date().toLocaleString();
 
  //   comments.push({ text, time });
 
  //   commentText.value = "";
  //   addCommentBtn.disabled = true;
 
  //   renderHistory();
  // });
 
 
 
  /* TAB SWITCH */
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
 
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
 
      tabContents.forEach(c => c.style.display = "none");
 
      document.getElementById(tab.dataset.tab).style.display = "block";
    });
  });
 
  /* FILE UI */
  function updateFileUI() {
 
    filesList.innerHTML = "";
 
    if (!files.length) {
      filesList.innerHTML = `<div class="no-files"><p>No files attached yet</p></div>`;
    } else {
 
      files.forEach((file, index) => {
 
        const url = URL.createObjectURL(file);
 
        const div = document.createElement("div");
        div.className = "file-item";
 
        div.innerHTML = `
          <span>${file.name}</span>
          <div class="file-actions">
            <a href="${url}" download="${file.name}">
              <button class="download-btn">Download</button>
            </a>
            <button class="remove-btn" data-index="${index}">Remove</button>
          </div>
        `;
 
        filesList.appendChild(div);
      });
    }
 
    fileCount.textContent = `${files.length} file(s)`;
  }
 
  function handleFiles(selectedFiles) {
    for (let f of selectedFiles) {
      files.push(f);
    }
    updateFileUI();
  }
 
  uploadBtn?.addEventListener("click", () => fileInput.click());
  uploadCard?.addEventListener("click", () => fileInput.click());
 
  fileInput?.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    fileInput.value = "";
  });
 
  filesList?.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      files.splice(e.target.dataset.index, 1);
      updateFileUI();
    }
  });
 
 
 
 
  initializeComments();
});
 
 
 
 
uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fileInput.click();
});
 
 
const uploadBox = document.getElementById("uploadBox");
 
uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.style.borderColor = "#a52a2a";
});
 
uploadBox.addEventListener("dragleave", () => {
  uploadBox.style.borderColor = "#ddd";
});
 
uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
 
  const files = e.dataTransfer.files;
 
  [...files].forEach(file => {
    fileInput.files = e.dataTransfer.files;
    fileInput.dispatchEvent(new Event("change"));
  });
 
  uploadBox.style.borderColor = "#ddd";
});
 
 
 
let comments = [];
 
 
  function renderHistory() {
    historyList.innerHTML = "";
 
    if (!comments.length) {
      historyList.innerHTML = `<div class="no-history-message">No history available.</div>`;
      return;
    }
 
    comments.slice().reverse().forEach(c => {
      const div = document.createElement("div");
      div.className = "history-item";
 
      div.innerHTML = `
        <p><strong>Admin - ${c.time}</strong></p>
        <p>${c.text}</p>
      `;
 
      historyList.appendChild(div);
    });
  }
 
// ===================================================
// SHOW TOAST FUNCTION - SINGLE STYLE FOR ALL TOASTS
// ===================================================
 
function showToast(message, type = 'info') {
    // Centered toast (Department & Roles style) for success / error / warning
    if (type === 'success' || type === 'error' || type === 'warning') {
        document
            .querySelectorAll('.success-notification, .error-notification')
            .forEach(n => n.remove());
 
        const notification = document.createElement('div');
        notification.className =
            type === 'success' ? 'success-notification' : 'error-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
 
        // trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
 
        // auto hide (2s success, 3s error) – same as Department & Roles
        const duration = type === 'success' ? 2000 : 3000;
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, duration);
        return;
    }
 
    // Info / warning: simple top-right toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
 
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
 
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #cce5ff;
        color: #004085;
        padding: 10px 16px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: 'Segoe UI', Arial, sans-serif;
        max-width: 360px;
    `;
 
    document.body.appendChild(toast);
 
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
 
 
 
// ===================================================
// COMMENTS FUNCTIONALITY
// ===================================================
 
function initializeComments() {
    const addBtn = document.getElementById("addCommentBtn");
    const commentInput = document.getElementById("commentText");
    const historyContainer = document.getElementById("history");
   
    if (!addBtn || !commentInput || !historyContainer) return;
 
    // Enable the "Add New" button only when the comment box is
    // editable and has some text typed in it.
    function updateAddCommentButtonState() {
        const hasText = commentInput.value.trim().length > 0;
        const isEditable = !commentInput.disabled && !commentInput.readOnly;
 
        if (isEditable && hasText) {
            addBtn.disabled = false;
            addBtn.style.opacity = "";
            addBtn.style.cursor = "pointer";
            addBtn.style.pointerEvents = "";
            addBtn.removeAttribute("title");
        } else {
            addBtn.disabled = true;
            addBtn.style.opacity = "0.5";
            addBtn.style.cursor = "not-allowed";
            addBtn.style.pointerEvents = "none";
        }
    }
 
    // Initial state on load
    updateAddCommentButtonState();
 
    // Re-evaluate whenever the user types in the comment box
    commentInput.addEventListener("input", updateAddCommentButtonState);
 
    addBtn.addEventListener("click", function(e) {
    e.preventDefault();
   
    const commentText = commentInput.value.trim();
    if (commentText === "") {
        showToast("Please enter a comment", 'warning');
        return;
    }
 
    // const quotationId = document.getElementById("quotationNumber").value;
    // if (!quotationId) {
    //     showToast("Quotation ID not found", 'error');
    //     return;
    // }
   
    const scrollPos = historyContainer.scrollTop;
   
    addBtn.disabled = true;
    addBtn.textContent = "Adding...";
 
    fetch("/add-comment", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
    comment: commentText,
    user: "Admin"
})
    })
    .then(res => res.json())
    // .then(data => {
        // console.log("Comment saved:", data);
        // commentInput.value = "";
        // Reset to first page and reload
        // currentCommentPage = 1;
        // return loadCommentsForQuotation(quotationId, 1);
       
    // })
.then(data => {
    console.log("Comment saved:", data);
 
    if (!Array.isArray(comments)) {
        comments = [];
    }
 
    comments.push({
        text: commentInput.value.trim(),
        time: new Date().toLocaleString()
    });
 
    renderHistory();
 
    commentInput.value = "";
})
.then(() => {
 
    showToast('Comment added successfully', 'success');
 
    setTimeout(() => {
        document.querySelector('[data-tab="history"]')?.click();
        historyContainer.scrollTop = scrollPos;
    }, 500);
 
})
 
    .catch(error => {
        console.error("Error saving comment:", error);
        showToast("Error saving comment", 'error');
    })
    .finally(() => {
        addBtn.disabled = false;
        addBtn.textContent = "Add New";
    });
});
}
 
 
// ===================================================
// DISABLE COMMENT AND ATTACHMENT SECTIONS IN VIEW MODE
// ===================================================
 
function disableCommentAndAttachmentSections() {
    console.log("🔒 Disabling comment and attachment sections");
   
    // Disable comment textarea
    const commentTextarea = document.getElementById('commentText');
    if (commentTextarea) {
        commentTextarea.disabled = true;
        commentTextarea.style.backgroundColor = '#f5f5f5';
        commentTextarea.style.cursor = 'not-allowed';
        commentTextarea.placeholder = 'Comments are read-only in view mode';
        commentTextarea.readOnly = true; // Add this for extra safety
    } else {
        console.warn("Comment textarea not found");
    }
   
    // Disable add comment button
    const addCommentBtn = document.getElementById('addCommentBtn');
    if (addCommentBtn) {
        addCommentBtn.disabled = true;
        addCommentBtn.style.opacity = '0.5';
        addCommentBtn.style.cursor = 'not-allowed';
        addCommentBtn.style.pointerEvents = 'none';
        addCommentBtn.setAttribute('title', 'Cannot add comments in view mode');
    } else {
        console.warn("Add comment button not found");
    }
   
    // Disable file upload
    const fileInput = document.getElementById('fileInput');
    const uploadCard = document.getElementById('uploadCard');
    const uploadBtn = document.getElementById('uploadBtn');
   
    if (fileInput) {
        fileInput.disabled = true;
    } else {
        console.warn("File input not found");
    }
   
    if (uploadCard) {
        uploadCard.style.pointerEvents = 'none';
        uploadCard.style.opacity = '0.5';
        uploadCard.style.cursor = 'not-allowed';
        uploadCard.setAttribute('title', 'Cannot upload files in view mode');
    } else {
        console.warn("Upload card not found");
    }
   
    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.style.opacity = '0.5';
        uploadBtn.style.cursor = 'not-allowed';
        uploadBtn.style.pointerEvents = 'none';
        uploadBtn.setAttribute('title', 'Cannot upload files in view mode');
    } else {
        console.warn("Upload button not found");
    }
   
    // Hide delete buttons on existing files
    setTimeout(() => {
        const deleteButtons = document.querySelectorAll('.btn-delete');
        console.log(`🔒 Hiding ${deleteButtons.length} delete buttons`);
        deleteButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }, 500);
}