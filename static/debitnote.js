
document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1;
  const pageSize = 5;
  
  // Mock data - replace with API call in production
  const mockData = [
    {
      id: 1,
      dbnId: "INV-0001",
      poRefId: "SO-0001",
      supplierName: "Acme Crop",
      debitDate: "2025-01-28",
      status: "draft",
      paymentStatus: "Unpaid"
    },
    {
      id: 2,
      dbnId: "INV-0002",
      poRefId: "SO-0002",
      supplierName: "Acme Crop",
      debitDate: "2025-01-28",
      status: "sent",
      paymentStatus: "Unpaid"
    },
    {
      id: 3,
      dbnId: "INV-0003",
      poRefId: "SO-0003",
      supplierName: "Crop",
      debitDate: "2025-01-28",
      status: "sent",
      paymentStatus: "Paid"
    },
    {
      id: 4,
      dbnId: "INV-0004",
      poRefId: "SO-0004",
      supplierName: "Acme",
      debitDate: "2025-01-28",
      status: "paid",
      paymentStatus: "Unpaid"
    },
    {
      id: 5,
      dbnId: "INV-0005",
      poRefId: "SO-0005",
      supplierName: "Freelance writer",
      debitDate: "2025-01-28",
      status: "overdue",
      paymentStatus: "-"
    }
  ];
  
  // DOM Elements
  const searchInput = document.getElementById("debitnoteSearch");
  const clearBtn = document.getElementById("clearFilterBtn");
  const statusFilter = document.getElementById("statusFilter");
  const supplierFilter = document.getElementById("supplierFilter");
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");
  const tableBody = document.getElementById("debitnoteTableBody");
  const showingCount = document.getElementById("showingCount");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageNow = document.getElementById("pageNow");
  const pageTotal = document.getElementById("pageTotal");

  // Initialize supplier dropdown
  function initializeSupplierDropdown() {
    const suppliers = [...new Set(mockData.map(item => item.supplierName))];
    suppliers.forEach(supplier => {
      const option = document.createElement("option");
      option.value = supplier.toLowerCase();
      option.textContent = supplier;
      supplierFilter.appendChild(option);
    });
  }

  // Get filtered data
  function getFilteredData() {
    let filtered = [...mockData];

    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const supplierValue = supplierFilter.value;
    const fromDateValue = fromDate.value;
    const toDateValue = toDate.value;

    // Search
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.dbnId.toLowerCase().includes(searchTerm) ||
        item.supplierName.toLowerCase().includes(searchTerm) ||
        item.poRefId.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (statusValue) {
      filtered = filtered.filter(item => item.status === statusValue);
    }

    // Supplier filter
    if (supplierValue) {
      filtered = filtered.filter(item => 
        item.supplierName.toLowerCase() === supplierValue
      );
    }

    // Date range filter
    if (fromDateValue) {
      filtered = filtered.filter(item => item.debitDate >= fromDateValue);
    }
    if (toDateValue) {
      filtered = filtered.filter(item => item.debitDate <= toDateValue);
    }

    return filtered;
  }

  // Get badge class based on status
  function getStatusBadgeClass(status) {
    switch(status) {
      case "draft": return "debitnote-badge draft";
      case "sent": return "debitnote-badge sent";
      case "paid": return "debitnote-badge paid";
      case "overdue": return "debitnote-badge overdue";
      case "cancelled": return "debitnote-badge cancelled";
      default: return "debitnote-badge";
    }
  }

  // Get payment status class
  function getPaymentStatusClass(status) {
    switch(status) {
      case "Paid": return "debitnote-payment-paid";
      case "Unpaid": return "debitnote-payment-unpaid";
      case "Partial": return "debitnote-payment-partial";
      default: return "";
    }
  }

  // Render table
  function render() {
    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

    // Validate current page
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    if (currentPage < 1) {
      currentPage = 1;
    }

    // Update pagination display
    pageNow.textContent = currentPage;
    pageTotal.textContent = totalPages;

    // Clear table
    tableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = filteredData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
      const noDataRow = document.createElement("tr");
      noDataRow.innerHTML = `<td colspan="8" class="debitnote-empty">No debit notes found</td>`;
      tableBody.appendChild(noDataRow);
    } else {
      pageData.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${startIndex + index + 1}</td>
          <td>${item.dbnId}</td>
          <td>${item.poRefId}</td>
          <td>${item.supplierName}</td>
          <td>${item.debitDate}</td>
          <td><span class="${getStatusBadgeClass(item.status)}">${item.status}</span></td>
          <td><span class="${getPaymentStatusClass(item.paymentStatus)}">${item.paymentStatus}</span></td>
          <td>
            <div class="debitnote-action-icons">
              <button class="debitnote-action-icon" title="View" onclick="viewDebitnote('${item.dbnId}')">👁️</button>
              <button class="debitnote-action-icon" title="Edit" onclick="editDebitnote('${item.dbnId}')">✏️</button>
              <button class="debitnote-action-icon" title="Delete" onclick="deleteDebitnote('${item.dbnId}')">☰</button>
            </div>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }

    // Update showing count
    showingCount.textContent = `Showing ${pageData.length} Entities`;

    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  // Event listeners
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    render();
  });

  statusFilter.addEventListener("change", () => {
    currentPage = 1;
    render();
  });

  supplierFilter.addEventListener("change", () => {
    currentPage = 1;
    render();
  });

  fromDate.addEventListener("change", () => {
    currentPage = 1;
    render();
  });

  toDate.addEventListener("change", () => {
    currentPage = 1;
    render();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "";
    supplierFilter.value = "";
    fromDate.value = "";
    toDate.value = "";
    currentPage = 1;
    render();
  });

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  });

  nextBtn.addEventListener("click", () => {
    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    if (currentPage < totalPages) {
      currentPage++;
      render();
    }
  });

  // Action functions
  window.viewDebitnote = (id) => {
    console.log("View debitnote:", id);
    alert("View functionality coming soon for: " + id);
  };

  window.editDebitnote = (id) => {
    console.log("Edit debitnote:", id);
    alert("Edit functionality coming soon for: " + id);
  };

  window.deleteDebitnote = (id) => {
    console.log("Delete debitnote:", id);
    if (confirm("Are you sure you want to delete: " + id + "?")) {
      alert("Delete functionality coming soon for: " + id);
    }
  };

  // Initialize
  initializeSupplierDropdown();
  render();
});
