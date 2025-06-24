// LocalStorage Key
const STORAGE_KEY = "todo_3rd_year_tasks";

const profileIcon = document.getElementById("profile-icon");
const dropdown = document.getElementById("dropdown-menu");

profileIcon.addEventListener("click", () => {
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

window.addEventListener("click", (e) => {
  if (!profileIcon.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});

// Elements
const form = document.getElementById("task-form");
const title = document.getElementById("task-title");
const desc = document.getElementById("task-desc");
const date = document.getElementById("task-date");
const priority = document.getElementById("task-priority");
const category = document.getElementById("task-category");

const taskList = document.getElementById("task-list");
const totalDisplay = document.getElementById("total-tasks");
const completedDisplay = document.getElementById("completed-tasks");
const progressBar = document.getElementById("progress-bar");

// Filter/Sort
const filterStatus = document.getElementById("filter-status");
const filterPriority = document.getElementById("filter-priority");
const filterCategory = document.getElementById("filter-category");
const sortBy = document.getElementById("sort-by");

// Dark mode toggle
document.getElementById("toggle-dark").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

// Restore dark mode
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// Task list
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Save
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";

  let filtered = [...tasks];

  if (filterStatus.value !== "all") {
    filtered = filtered.filter(t => filterStatus.value === "completed" ? t.completed : !t.completed);
  }
  if (filterPriority.value !== "all") {
    filtered = filtered.filter(t => t.priority === filterPriority.value);
  }
  if (filterCategory.value !== "all") {
    filtered = filtered.filter(t => t.category === filterCategory.value);
  }

  if (sortBy.value === "dueDate") {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortBy.value === "priority") {
    const order = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
    filtered.sort((a, b) => order[a.priority] - order[b.priority]);
  } else if (sortBy.value === "category") {
    filtered.sort((a, b) => a.category.localeCompare(b.category));
  }

  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    li.setAttribute("data-priority", task.priority);

    const info = document.createElement("div");
    info.className = "task-info";
    info.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.desc}</p>
      <small>📅 ${task.date} | 🏷 ${task.category} | ⚡ ${task.priority}</small>
    `;
    if (task.completed) info.style.textDecoration = "line-through";

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeBtn = document.createElement("button");
    completeBtn.innerHTML = task.completed ? "✅" : "✔";
    completeBtn.onclick = () => toggleTask(index);

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏";
    editBtn.onclick = () => editTask(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑";
    deleteBtn.onclick = () => deleteTask(index);

    actions.append(completeBtn, editBtn, deleteBtn);
    li.append(info, actions);
    taskList.appendChild(li);
  });

  updateStats();
}

// Add task
form.addEventListener("submit", e => {
  e.preventDefault();
  tasks.push({
    title: title.value,
    desc: desc.value,
    date: date.value,
    priority: priority.value,
    category: category.value,
    completed: false
  });
  saveTasks();
  renderTasks();
  form.reset();
});

// Toggle complete
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Edit task
function editTask(index) {
  const task = tasks[index];
  title.value = task.title;
  desc.value = task.desc;
  date.value = task.date;
  priority.value = task.priority;
  category.value = task.category;
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Delete task
function deleteTask(index) {
  if (confirm("Delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
}

// Update stats
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  totalDisplay.textContent = total;
  completedDisplay.textContent = completed;
  progressBar.value = total ? (completed / total) * 100 : 0;
}

// Filter/Sort events
[filterStatus, filterPriority, filterCategory, sortBy].forEach(el =>
  el.addEventListener("change", renderTasks)
);

// Export CSV
document.getElementById("export-csv").addEventListener("click", () => {
  const headers = ["Title", "Description", "Due Date", "Priority", "Category", "Completed"];
  const rows = tasks.map(t => [
    t.title, t.desc, t.date, t.priority, t.category, t.completed ? "Yes" : "No"
  ]);
  const csv = [headers, ...rows].map(row => row.map(item => "${item}").join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tasks.csv";
  a.click();
});

// Export PDF
document.getElementById("export-pdf").addEventListener("click", () => {
  const printWindow = window.open('', '', 'height=800,width=1000');
  printWindow.document.write('<html><head><title>Tasks PDF</title>');
  printWindow.document.write('<style>body{font-family:sans-serif;padding:20px;} table{border-collapse:collapse;width:100%;} th, td{border:1px solid #ccc;padding:8px;}</style></head><body>');
  printWindow.document.write('<h1>Task List</h1><table><tr><th>Title</th><th>Description</th><th>Date</th><th>Priority</th><th>Category</th><th>Status</th></tr>');
  tasks.forEach(t => {
    printWindow.document.write(<tr><td>${t.title}</td><td>${t.desc}</td><td>${t.date}</td><td>${t.priority}</td><td>${t.category}</td><td>${t.completed ? "✅" : "❌"}</td></tr>);
  });
  printWindow.document.write('</table></body></html>');
  printWindow.document.close();
  printWindow.print();
});

// Initial render
renderTasks();