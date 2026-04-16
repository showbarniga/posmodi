document.addEventListener("DOMContentLoaded", () => {

    let page = 1;
    const size = 6;

    const data = [];

    // SAMPLE DATA
    for (let i = 1; i <= 30; i++) {
        data.push({
            id: `INV-${String(i).padStart(4, '0')}`,
            so: `SO-${String(i).padStart(4, '0')}`,
            name: ["Acme Corp", "Corp", "Kishore", "Srinivas"][i % 4],
            date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
            pay: ["Unpaid", "Paid", "Partial"][i % 3],
            status: ["draft", "sent", "paid", "cancel"][i % 4]
        });
    }

    const tbody = document.getElementById("tbody");

    function getFilteredData() {
        let filtered = [...data];

        const search = document.getElementById("search").value.toLowerCase();
        const type = document.getElementById("typeFilter").value;
        const payment = document.getElementById("paymentFilter").value;
        const from = document.getElementById("fromDate").value;
        const to = document.getElementById("toDate").value;

        if (search) {
            filtered = filtered.filter(d =>
                d.id.toLowerCase().includes(search) ||
                d.name.toLowerCase().includes(search)
            );
        }

        // ✅ FIXED FILTER
        if (type !== "all") {
            filtered = filtered.filter(d => d.status === type);
        }

        if (payment !== "all") {
            filtered = filtered.filter(d => d.pay === payment);
        }

        if (from) filtered = filtered.filter(d => d.date >= from);
        if (to) filtered = filtered.filter(d => d.date <= to);

        return filtered;
    }

    function render() {

        const filteredData = getFilteredData();
        const totalPages = Math.ceil(filteredData.length / size) || 1;

        if (page > totalPages) page = totalPages;

        document.getElementById("totalPages").innerText = totalPages;
        document.getElementById("pageNow").innerText = page;

        tbody.innerHTML = "";

        const start = (page - 1) * size;
        const rows = filteredData.slice(start, start + size);

        rows.forEach((r, i) => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${start + i + 1}</td>
                <td>${r.id}</td>
                <td>${r.so}</td>
                <td>${r.name}</td>
                <td>${r.date}</td>
                <td>${r.date}</td>
                <td><span class="badge ${r.status}">${r.status}</span></td>
                <td>${r.pay}</td>
                <td>
                    <div class="dropdown">
                        <button class="menu-btn">⋮</button>
                        <div class="dropdown-menu">
                            <div class="view">View</div>
                            <div class="edit">Edit</div>
                            <div class="delete">Delete</div>
                        </div>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);

            const menuBtn = tr.querySelector(".menu-btn");
            const menu = tr.querySelector(".dropdown-menu");

            menuBtn.onclick = (e) => {
                e.stopPropagation();
                document.querySelectorAll(".dropdown-menu").forEach(m => m.style.display = "none");
                menu.style.display = "block";
            };

            tr.querySelector(".view").onclick = () => alert("View: " + r.id);
            tr.querySelector(".edit").onclick = () => alert("Edit: " + r.id);
            tr.querySelector(".delete").onclick = () => alert("Delete: " + r.id);
        });

        document.getElementById("showing").innerText =
            `Showing ${rows.length} of ${filteredData.length}`;
    }

    document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-menu").forEach(m => m.style.display = "none");
    });

    document.getElementById("search").oninput = () => { page = 1; render(); };
    document.getElementById("typeFilter").onchange = () => { page = 1; render(); };
    document.getElementById("paymentFilter").onchange = () => { page = 1; render(); };
    document.getElementById("fromDate").onchange = () => { page = 1; render(); };
    document.getElementById("toDate").onchange = () => { page = 1; render(); };

    document.getElementById("prev").onclick = () => {
        if (page > 1) { page--; render(); }
    };

    document.getElementById("next").onclick = () => {
        const total = Math.ceil(getFilteredData().length / size);
        if (page < total) { page++; render(); }
    };

    document.getElementById("clearBtn").onclick = () => {
        document.getElementById("search").value = "";
        document.getElementById("typeFilter").value = "all";
        document.getElementById("paymentFilter").value = "all";
        document.getElementById("fromDate").value = "";
        document.getElementById("toDate").value = "";
        page = 1;
        render();
    };

    // Add Credit Note button click handler
    document.querySelector(".cn-btn").onclick = () => {
        window.location.href = "/new-credit-note";
    };

    render();
});