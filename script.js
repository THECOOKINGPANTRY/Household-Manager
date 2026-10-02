
const defaultData = {
  shopping: [],
  tasks: [],
  events: [],
  spending: [],
  settings: {
    householdName: "My Household",
    currency: "AUD"
  }
};

let currentTaskFilter = "all";

function getData() {
  const saved = localStorage.getItem("householdManager");

  if (!saved) {
    localStorage.setItem(
      "householdManager",
      JSON.stringify(defaultData)
    );

    return JSON.parse(JSON.stringify(defaultData));
  }

  try {
    const data = JSON.parse(saved);

    return {
      shopping: Array.isArray(data.shopping) ? data.shopping : [],
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
      events: Array.isArray(data.events) ? data.events : [],
      spending: Array.isArray(data.spending) ? data.spending : [],
      settings: {
        ...defaultData.settings,
        ...(data.settings || {})
      }
    };
  } catch {
    localStorage.setItem(
      "householdManager",
      JSON.stringify(defaultData)
    );

    return JSON.parse(JSON.stringify(defaultData));
  }
}

function saveData(data) {
  localStorage.setItem(
    "householdManager",
    JSON.stringify(data)
  );
}

function createId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function setActiveNavigation() {
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("[data-page]").forEach(link => {
    if (link.getAttribute("data-page") === currentPage) {
      link.classList.add("active");
    }
  });
}

function updateHouseholdName() {
  const data = getData();

  document.querySelectorAll(".household-name").forEach(element => {
    element.textContent = data.settings.householdName;
  });
}

function openSheet(id) {
  const sheet = document.getElementById(id);
  if (!sheet) return;

  sheet.classList.add("open");
  document.body.classList.add("sheet-open");
}

function closeSheet(id) {
  const sheet = document.getElementById(id);
  if (!sheet) return;

  sheet.classList.remove("open");
  document.body.classList.remove("sheet-open");
}

function setupSheets() {
  document.querySelectorAll(".sheet-overlay").forEach(overlay => {
    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        overlay.classList.remove("open");
        document.body.classList.remove("sheet-open");
      }
    });
  });
}

function addShoppingItem() {
  const nameElement = document.getElementById("shoppingName");
  const quantityElement = document.getElementById("shoppingQuantity");
  const categoryElement = document.getElementById("shoppingCategory");

  if (!nameElement || !quantityElement || !categoryElement) return;

  const name = nameElement.value.trim();
  const quantity = quantityElement.value.trim();
  const category = categoryElement.value;

  if (!name) {
    alert("Please enter an item.");
    return;
  }

  const data = getData();

  data.shopping.push({
    id: createId(),
    name,
    quantity: quantity || "1",
    category,
    completed: false
  });

  saveData(data);

  nameElement.value = "";
  quantityElement.value = "";

  renderShopping();
  loadDashboard();
}

function toggleShopping(id) {
  const data = getData();
  const item = data.shopping.find(item => item.id === id);

  if (item) {
    item.completed = !item.completed;
  }

  saveData(data);
  renderShopping();
  loadDashboard();
}

function deleteShopping(id) {
  const data = getData();

  data.shopping = data.shopping.filter(
    item => item.id !== id
  );

  saveData(data);
  renderShopping();
  loadDashboard();
}

function renderShopping() {
  const container = document.getElementById("shoppingList");

  if (!container) return;

  const data = getData();
  const remaining = data.shopping.filter(item => !item.completed).length;

  const countElement = document.getElementById("shoppingCount");
  const remainingElement = document.getElementById("shoppingRemaining");

  if (countElement) {
    countElement.textContent = data.shopping.length;
  }

  if (remainingElement) {
    remainingElement.textContent = remaining;
  }

  if (data.shopping.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <div class="empty-title">Your shopping list is empty</div>
        <div class="empty-text">Add something you need to buy.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = data.shopping.map(item => `
    <div class="data-row ${item.completed ? "completed" : ""}">
      <div class="data-main">
        <input
          class="check"
          type="checkbox"
          ${item.completed ? "checked" : ""}
          onchange="toggleShopping('${item.id}')"
          aria-label="Complete ${escapeHTML(item.name)}"
        >

        <div>
          <div class="data-name">${escapeHTML(item.name)}</div>
          <div class="data-info">
            ${escapeHTML(item.quantity)} · ${escapeHTML(item.category)}
          </div>
        </div>
      </div>

      <div class="data-actions">
        <button
          class="btn btn-danger btn-small"
          onclick="deleteShopping('${item.id}')"
        >
          Delete
        </button>
      </div>
    </div>
  `).join("");
}

function addTask() {
  const nameElement = document.getElementById("taskName");
  const personElement = document.getElementById("taskPerson");
  const dueElement = document.getElementById("taskDue");
  const priorityElement = document.getElementById("taskPriority");

  if (!nameElement || !personElement || !dueElement || !priorityElement) {
    return;
  }

  const name = nameElement.value.trim();
  const person = personElement.value.trim();
  const due = dueElement.value;
  const priority = priorityElement.value;

  if (!name) {
    alert("Please enter a task.");
    return;
  }

  const data = getData();

  data.tasks.push({
    id: createId(),
    name,
    person: person || "Anyone",
    due,
    priority,
    completed: false
  });

  saveData(data);

  nameElement.value = "";
  personElement.value = "";
  dueElement.value = "";

  renderTasks();
  loadDashboard();
}

function toggleTask(id) {
  const data = getData();
  const task = data.tasks.find(task => task.id === id);

  if (task) {
    task.completed = !task.completed;
  }

  saveData(data);
  renderTasks();
  loadDashboard();
}

function deleteTask(id) {
  const data = getData();

  data.tasks = data.tasks.filter(
    task => task.id !== id
  );

  saveData(data);
  renderTasks();
  loadDashboard();
}

function filterTasks(filter, button) {
  currentTaskFilter = filter;

  document.querySelectorAll(".filter-button").forEach(item => {
    item.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  }

  renderTasks();
}

function renderTasks() {
  const container = document.getElementById("taskList");

  if (!container) return;

  const data = getData();

  const activeTasks = data.tasks.filter(task => !task.completed);
  const completedTasks = data.tasks.filter(task => task.completed);

  const taskCount = document.getElementById("taskCount");
  const completedTaskCount = document.getElementById("completedTaskCount");

  if (taskCount) {
    taskCount.textContent = activeTasks.length;
  }

  if (completedTaskCount) {
    completedTaskCount.textContent = completedTasks.length;
  }

  let tasks = [...data.tasks];

  if (currentTaskFilter === "active") {
    tasks = tasks.filter(task => !task.completed);
  }

  if (currentTaskFilter === "completed") {
    tasks = tasks.filter(task => task.completed);
  }

  tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (!a.due && !b.due) return 0;
    if (!a.due) return 1;
    if (!b.due) return -1;

    return new Date(a.due) - new Date(b.due);
  });

  if (tasks.length === 0) {
    const title =
      currentTaskFilter === "completed"
        ? "No completed tasks"
        : currentTaskFilter === "active"
        ? "No active tasks"
        : "No tasks yet";

    const text =
      currentTaskFilter === "completed"
        ? "Completed tasks will appear here."
        : "Add your first household task.";

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✓</div>
        <div class="empty-title">${title}</div>
        <div class="empty-text">${text}</div>
      </div>
    `;

    return;
  }

  container.innerHTML = tasks.map(task => `
    <div class="data-row ${task.completed ? "completed" : ""}">
      <div class="data-main">
        <input
          class="check"
          type="checkbox"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask('${task.id}')"
          aria-label="Complete ${escapeHTML(task.name)}"
        >

        <div>
          <div class="data-name">${escapeHTML(task.name)}</div>
          <div class="data-info">
            ${escapeHTML(task.person)}
            ${task.due ? " · Due " + formatDate(task.due) : ""}
          </div>
        </div>
      </div>

      <div class="data-actions">
        <span class="badge ${task.priority === "High" ? "yellow" : ""}">
          ${escapeHTML(task.priority)}
        </span>

        <button
          class="btn btn-danger btn-small"
          onclick="deleteTask('${task.id}')"
        >
          Delete
        </button>
      </div>
    </div>
  `).join("");
}

function addEvent() {
  const nameElement = document.getElementById("eventName");
  const dateElement = document.getElementById("eventDate");
  const timeElement = document.getElementById("eventTime");
  const locationElement = document.getElementById("eventLocation");

  if (!nameElement || !dateElement || !timeElement || !locationElement) {
    return;
  }

  const name = nameElement.value.trim();
  const date = dateElement.value;
  const time = timeElement.value;
  const location = locationElement.value.trim();

  if (!name || !date) {
    alert("Please enter an event name and date.");
    return;
  }

  const data = getData();

  data.events.push({
    id: createId(),
    name,
    date,
    time,
    location
  });

  saveData(data);

  nameElement.value = "";
  dateElement.value = "";
  timeElement.value = "";
  locationElement.value = "";

  renderEvents();
  loadDashboard();
}

function deleteEvent(id) {
  const data = getData();

  data.events = data.events.filter(
    event => event.id !== id
  );

  saveData(data);
  renderEvents();
  loadDashboard();
}

function renderEvents() {
  const container = document.getElementById("eventList");

  if (!container) return;

  const data = getData();

  const events = [...data.events].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <div class="empty-title">No upcoming events</div>
        <div class="empty-text">Add an event to your household calendar.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(event => `
    <div class="data-row">
      <div class="data-main">
        <div>
          <div class="data-name">${escapeHTML(event.name)}</div>
          <div class="data-info">
            ${formatDate(event.date)}
            ${event.time ? " · " + escapeHTML(event.time) : ""}
            ${event.location ? " · " + escapeHTML(event.location) : ""}
          </div>
        </div>
      </div>

      <button
        class="btn btn-danger btn-small"
        onclick="deleteEvent('${event.id}')"
      >
        Delete
      </button>
    </div>
  `).join("");
}

function addExpense() {
  const nameElement = document.getElementById("expenseName");
  const amountElement = document.getElementById("expenseAmount");
  const categoryElement = document.getElementById("expenseCategory");
  const dateElement = document.getElementById("expenseDate");

  if (!nameElement || !amountElement || !categoryElement || !dateElement) {
    return;
  }

  const name = nameElement.value.trim();
  const amount = parseFloat(amountElement.value);
  const category = categoryElement.value;
  const date = dateElement.value;

  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid expense.");
    return;
  }

  const data = getData();

  data.spending.push({
    id: createId(),
    name,
    amount,
    category,
    date: date || new Date().toISOString().split("T")[0]
  });

  saveData(data);

  nameElement.value = "";
  amountElement.value = "";
  dateElement.value = "";

  renderSpending();
  loadDashboard();
}

function deleteExpense(id) {
  const data = getData();

  data.spending = data.spending.filter(
    expense => expense.id !== id
  );

  saveData(data);
  renderSpending();
  loadDashboard();
}

function renderSpending() {
  const container = document.getElementById("spendingList");

  if (!container) return;

  const data = getData();

  const total = data.spending.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const now = new Date();

  const thisMonth = data.spending
    .filter(expense => {
      const date = new Date(expense.date + "T00:00:00");

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

  const average = data.spending.length
    ? total / data.spending.length
    : 0;

  const totalElement = document.getElementById("totalSpending");
  const monthElement = document.getElementById("monthSpending");
  const averageElement = document.getElementById("averageSpending");

  if (totalElement) {
    totalElement.textContent = formatMoney(total);
  }

  if (monthElement) {
    monthElement.textContent = formatMoney(thisMonth);
  }

  if (averageElement) {
    averageElement.textContent = formatMoney(average);
  }

  if (data.spending.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💰</div>
        <div class="empty-title">No spending recorded</div>
        <div class="empty-text">Add your first household expense.</div>
      </div>
    `;
    return;
  }

  const expenses = [...data.spending].reverse();

  container.innerHTML = expenses.map(expense => `
    <div class="data-row">
      <div class="data-main">
        <div>
          <div class="data-name">${escapeHTML(expense.name)}</div>
          <div class="expense-category">
            ${escapeHTML(expense.category)} · ${formatDate(expense.date)}
          </div>
        </div>
      </div>

      <div class="data-actions">
        <span class="expense-amount">
          ${formatMoney(expense.amount)}
        </span>

        <button
          class="btn btn-danger btn-small"
          onclick="deleteExpense('${expense.id}')"
        >
          Delete
        </button>
      </div>
    </div>
  `).join("");
}

function loadSettings() {
  const data = getData();

  const nameInput = document.getElementById("householdName");
  if (nameInput) {
    nameInput.value = data.settings.householdName;
  }

  const currencyInput = document.getElementById("currency");
  if (currencyInput) {
    currencyInput.value = data.settings.currency;
  }
}

function saveSettings() {
  const data = getData();

  const nameInput = document.getElementById("householdName");
  const currencyInput = document.getElementById("currency");

  if (!nameInput || !currencyInput) return;

  const name = nameInput.value.trim();
  const currency = currencyInput.value;

  data.settings.householdName = name || "My Household";
  data.settings.currency = currency;

  saveData(data);
  updateHouseholdName();
  loadDashboard();
  renderSpending();

  alert("Settings saved.");
}

function resetData() {
  const confirmed = confirm(
    "Are you sure you want to delete all Household Manager data?"
  );

  if (!confirmed) return;

  localStorage.removeItem("householdManager");
  location.reload();
}

function loadDashboard() {
  const data = getData();

  const taskCount = data.tasks.filter(
    task => !task.completed
  ).length;

  const shoppingCount = data.shopping.filter(
    item => !item.completed
  ).length;

  const eventCount = data.events.length;

  const spending = data.spending.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const taskElement = document.getElementById("dashboardTasks");
  const shoppingElement = document.getElementById("dashboardShopping");
  const eventElement = document.getElementById("dashboardEvents");
  const spendingElement = document.getElementById("dashboardSpending");

  if (taskElement) {
    taskElement.textContent = taskCount;
  }

  if (shoppingElement) {
    shoppingElement.textContent = shoppingCount;
  }

  if (eventElement) {
    eventElement.textContent = eventCount;
  }

  if (spendingElement) {
    spendingElement.textContent = formatMoney(spending);
  }

  const taskList = document.getElementById("dashboardTaskList");

  if (taskList) {
    const tasks = data.tasks
      .filter(task => !task.completed)
      .slice(0, 4);

    if (tasks.length === 0) {
      taskList.innerHTML = `
        <div class="list-item">
          <span>No outstanding tasks 🎉</span>
        </div>
      `;
    } else {
      taskList.innerHTML = tasks.map(task => `
        <div class="list-item">
          <div class="item-left">
            <span>✓</span>

            <div>
              <div class="item-title">
                ${escapeHTML(task.name)}
              </div>

              <div class="item-meta">
                ${escapeHTML(task.person)}
              </div>
            </div>
          </div>

          <span class="badge ${task.priority === "High" ? "yellow" : ""}">
            ${escapeHTML(task.priority)}
          </span>
        </div>
      `).join("");
    }
  }

  const eventList = document.getElementById("dashboardEventList");

  if (eventList) {
    const events = [...data.events]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);

    if (events.length === 0) {
      eventList.innerHTML = `
        <div class="list-item">
          <span>No upcoming events</span>
        </div>
      `;
    } else {
      eventList.innerHTML = events.map(event => `
        <div class="list-item">
          <div class="item-left">
            <span>📅</span>

            <div>
              <div class="item-title">
                ${escapeHTML(event.name)}
              </div>

              <div class="item-meta">
                ${formatDate(event.date)}
              </div>
            </div>
          </div>
        </div>
      `).join("");
    }
  }
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date + "T00:00:00");

  return parsed.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatMoney(amount) {
  const data = getData();

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: data.settings.currency || "AUD"
  }).format(amount);
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavigation();
  updateHouseholdName();
  loadSettings();
  loadDashboard();
  renderShopping();
  renderTasks();
  renderEvents();
  renderSpending();
  setupSheets();
});

/* Add these functions to script.js */

function updateToday() {
  const data = getData();

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const todayTasks = data.tasks.filter(
    task => !task.completed && task.due === todayString
  ).length;

  const shoppingItems = data.shopping.filter(
    item => !item.completed
  ).length;

  const todayDateElement = document.getElementById("todayDate");
  const todayTaskElement = document.getElementById("todayTaskCount");
  const todayShoppingElement = document.getElementById("todayShoppingCount");

  if (todayDateElement) {
    todayDateElement.textContent = today.toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  if (todayTaskElement) {
    todayTaskElement.textContent = todayTasks;
  }

  if (todayShoppingElement) {
    todayShoppingElement.textContent = shoppingItems;
  }
}

function addDashboardTask() {
  const name = document.getElementById("dashboardTaskName").value.trim();
  const person = document.getElementById("dashboardTaskPerson").value.trim();
  const due = document.getElementById("dashboardTaskDue").value;
  const priority = document.getElementById("dashboardTaskPriority").value;

  if (!name) {
    alert("Please enter a task.");
    return;
  }

  const data = getData();

  data.tasks.push({
    id: createId(),
    name,
    person: person || "Anyone",
    due,
    priority,
    completed: false
  });

  saveData(data);

  document.getElementById("dashboardTaskName").value = "";
  document.getElementById("dashboardTaskPerson").value = "";
  document.getElementById("dashboardTaskDue").value = "";

  closeSheet("dashboardTaskSheet");

  loadDashboard();
  updateToday();
}

function addDashboardShopping() {
  const name = document
    .getElementById("dashboardShoppingName")
    .value
    .trim();

  const quantity = document
    .getElementById("dashboardShoppingQuantity")
    .value
    .trim();

  const category = document
    .getElementById("dashboardShoppingCategory")
    .value;

  if (!name) {
    alert("Please enter an item.");
    return;
  }

  const data = getData();

  data.shopping.push({
    id: createId(),
    name,
    quantity: quantity || "1",
    category,
    completed: false
  });

  saveData(data);

  document.getElementById("dashboardShoppingName").value = "";
  document.getElementById("dashboardShoppingQuantity").value = "";

  closeSheet("dashboardShoppingSheet");

  loadDashboard();
  updateToday();
}

function addDashboardEvent() {
  const name = document
    .getElementById("dashboardEventName")
    .value
    .trim();

  const date = document
    .getElementById("dashboardEventDate")
    .value;

  const time = document
    .getElementById("dashboardEventTime")
    .value;

  const location = document
    .getElementById("dashboardEventLocation")
    .value
    .trim();

  if (!name || !date) {
    alert("Please enter an event name and date.");
    return;
  }

  const data = getData();

  data.events.push({
    id: createId(),
    name,
    date,
    time,
    location
  });

  saveData(data);

  document.getElementById("dashboardEventName").value = "";
  document.getElementById("dashboardEventDate").value = "";
  document.getElementById("dashboardEventTime").value = "";
  document.getElementById("dashboardEventLocation").value = "";

  closeSheet("dashboardEventSheet");

  loadDashboard();
}

function addDashboardExpense() {
  const name = document
    .getElementById("dashboardExpenseName")
    .value
    .trim();

  const amount = parseFloat(
    document.getElementById("dashboardExpenseAmount").value
  );

  const category = document
    .getElementById("dashboardExpenseCategory")
    .value;

  const date = document
    .getElementById("dashboardExpenseDate")
    .value;

  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid expense.");
    return;
  }

  const data = getData();

  data.spending.push({
    id: createId(),
    name,
    amount,
    category,
    date: date || new Date().toISOString().split("T")[0]
  });

  saveData(data);

  document.getElementById("dashboardExpenseName").value = "";
  document.getElementById("dashboardExpenseAmount").value = "";
  document.getElementById("dashboardExpenseDate").value = "";

  closeSheet("dashboardExpenseSheet");

  loadDashboard();
}

document.addEventListener("DOMContentLoaded", () => {
  updateToday();
});
