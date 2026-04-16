let count = 0;

function addRow() {
    const table = document.querySelector("#tableBody tbody");
    count++;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${count}</td>
        <td><input type="text" value="Item"></td>
        <td>ID${count}</td>
        <td><input type="number" value="1"></td>
        <td>PCS</td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><input type="text"></td>
    `;

    table.appendChild(row);
}

function closePage() {
    window.location.href = "/credit-note";
}
function addComment() {
    const input = document.getElementById("commentInput");
    const text = input.value.trim();

    if (text === "") {
        alert("Enter a comment!");
        return;
    }

    const commentList = document.getElementById("commentList");

    const div = document.createElement("div");
    div.className = "cn-comment";

    const now = new Date().toLocaleString();

    div.innerHTML = `
        <div class="avatar">👤</div>
        <div>
            <strong>You – ${now}</strong>
            <p>${text}</p>
        </div>
    `;

    commentList.prepend(div);
    input.value = "";
} function openTab(tabName) {

    // hide all
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    // remove active from tabs
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    // show selected
    document.getElementById(tabName).classList.add("active");

    // highlight tab
    event.target.classList.add("active");
}
function openTab(evt, tabName) {

    // hide all sections
    document.querySelectorAll(".tab-content").forEach(el => {
        el.style.display = "none";
    });

    // remove active class
    document.querySelectorAll(".tab").forEach(el => {
        el.classList.remove("active");
    });

    // show selected section
    document.getElementById(tabName).style.display = "block";

    // activate clicked tab
    evt.currentTarget.classList.add("active");
}
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

// STORE FILES
let uploadedFiles = [];

// HANDLE FILE SELECT
fileInput.addEventListener("change", function () {
    const files = Array.from(fileInput.files);

    files.forEach(file => {
        uploadedFiles.push(file);
    });

    renderFiles();
    fileInput.value = ""; // reset
});

// RENDER FILE LIST
function renderFiles() {
    fileList.innerHTML = "";

    uploadedFiles.forEach((file, index) => {

        const div = document.createElement("div");
        div.className = "file-item";

        div.innerHTML = `
            <p>${file.name}</p>
            <button class="btn-primary" onclick="downloadFile(${index})">Download</button>
            <button class="btn-remove" onclick="removeFile(${index})">Remove</button>
        `;

        fileList.appendChild(div);
    });
}

// REMOVE FILE
function removeFile(index) {
    const confirmDelete = confirm("Are you sure you want to remove this file?");

    if (confirmDelete) {
        uploadedFiles.splice(index, 1);
        renderFiles();
    }
}

// DOWNLOAD FILE
function downloadFile(index) {
    const confirmDownload = confirm("Download this file?");

    if (confirmDownload) {
        const file = uploadedFiles[index];
        const url = URL.createObjectURL(file);

        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();

        URL.revokeObjectURL(url);
    }
}