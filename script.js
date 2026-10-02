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
let currentShoppingFilter = "all";
let currentShoppingCategory = "all";

function getData() {
  const saved = localStorage.getItem("householdManager");

  if (!saved) {
    const freshData = JSON.parse(JSON.stringify(defaultData));
    localStorage.setItem("householdManager", JSON.stringify(freshData));
    return freshData;
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
  } catch (error) {
    const freshData = JSON.parse(JSON.stringify(defaultData));
    localStorage.setItem("householdManager", JSON.stringify(freshData));
    return freshData;
  }
}

function saveData(data) {
  localStorage.setItem("householdManager", JSON.stringify(data));
}

function createId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTomorrowString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date + "T00:00:00");

  if (isNaN(parsed.getTime())) {
    return date;
  }

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
  }).format(Number(amount) || 0);
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

  if (!sheet) {
    return;
  }

  sheet.classList.add("open");
  document.body.classList.add("sheet-open");
}

function closeSheet(id) {
  const sheet = document.getElementById(id);

  if (!sheet) {
    return;
  }

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

  document.querySelectorAll(".sheet-close, [data-close-sheet]").forEach(button => {
    button.addEventListener("click", () => {
      const sheetId =
        button.getAttribute("data-close-sheet") ||
        button.closest(".sheet-overlay")?.id;

      if (sheetId) {
        closeSheet(sheetId);
      }
    });
  });
}

/* =========================
   SHOPPING
========================= */

function addShoppingItem() {
  const nameElement = document.getElementById("shoppingName");
  const quantityElement = document.getElementById("shoppingQuantity");
  const categoryElement = document.getElementById("shoppingCategory");

  if (!nameElement || !quantityElement || !categoryElement) {
    console.error("Shopping form elements could not be found.");
    return;
  }

  const name = nameElement.value.trim();
  const quantity = quantityElement.value.trim();
  const category = categoryElement.value || "Groceries";

  if (!name) {
    alert("Please enter an item.");
    nameElement.focus();
    return;
  }

  const data = getData();

  data.shopping.push({
    id: createId(),
    name: name,
    quantity: quantity || "1",
    category: category,
    completed: false
  });

  saveData(data);

  nameElement.value = "";
  quantityElement.value = "";
  categoryElement.value = "Groceries";

  closeSheet("shoppingSheet");

  renderShopping();
  loadDashboard();
  updateToday();
}

function addTaskShoppingItem() {
  addShoppingItem();
}

function addDashboardShopping() {
  const nameElement = document.getElementById("dashboardShoppingName");
  const quantityElement = document.getElementById("dashboardShoppingQuantity");
  const categoryElement = document.getElementById("dashboardShoppingCategory");

  if (!nameElement || !quantityElement || !categoryElement) {
    console.error("Dashboard shopping form elements could not be found.");
    return;
  }

  const name = nameElement.value.trim();
  const quantity = quantityElement.value.trim();
  const category = categoryElement.value || "Groceries";

  if (!name) {
    alert("Please enter an item.");
    nameElement.focus();
    return;
  }

  const data = getData();

  data.shopping.push({
    id: createId(),
    name: name,
    quantity: quantity || "1",
    category: category,
    completed: false
  });

  saveData(data);

  nameElement.value = "";
  quantityElement.value = "";

  closeSheet("dashboardShoppingSheet");

  loadDashboard();
  updateToday();
}

function toggleShopping(id) {
  const data = getData();

  const item = data.shopping.find(item => item.id === id);

  if (!item) {
    return;
  }

  item.completed = !item.completed;

  saveData(data);

  renderShopping();
  loadDashboard();
  updateToday();
}

function deleteShopping(id) {
  const data = getData();

  data.shopping = data.shopping.filter(item => item.id !== id);

  saveData(data);

  renderShopping();
  loadDashboard();
  updateToday();
}

function filterShopping(filter, button) {
  currentShoppingFilter = filter;

  document
    .querySelectorAll(".shopping-filters .filter-button")
    .forEach(item => {
      item.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  renderShopping();
}

function filterShoppingCategory(category, button) {
  currentShoppingCategory = category;

  document.querySelectorAll(".category-button").forEach(item => {
    item.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  }

  renderShopping();
}

function getShoppingCategoryIcon(category) {
  const icons = {
    Groceries: "🛒",
    Household: "🏠",
    Cleaning: "🧹",
    Bathroom: "🛁",
    Pet: "🐾",
    Other: "📦"
  };

  return icons[category] || "📦";
}

function createShoppingHTML(item) {
  const icon = getShoppingCategoryIcon(item.category);

  return `
    <div class="shopping-card ${item.completed ? "completed" : ""}">
      <input
        class="shopping-checkbox"
        type="checkbox"
        ${item.completed ? "checked" : ""}
        onchange="toggleShopping('${item.id}')"
        aria-label="Complete ${escapeHTML(item.name)}"
      >

      <div class="shopping-item-content">
        <div class="shopping-item-name">
          ${escapeHTML(item.name)}
        </div>

        <div class="shopping-item-details">
          <span class="shopping-item-detail">
            ${escapeHTML(item.quantity || "1")}
          </span>

          <span class="shopping-item-dot">•</span>

          <span class="shopping-item-detail">
            ${icon}
            ${escapeHTML(item.category || "Other")}
          </span>
        </div>
      </div>

      <span class="shopping-category-badge">
        ${escapeHTML(item.category || "Other")}
      </span>

      <button
        class="shopping-delete"
        type="button"
        onclick="deleteShopping('${item.id}')"
        aria-label="Delete ${escapeHTML(item.name)}"
      >
        ×
      </button>
    </div>
  `;
}

function renderShopping() {
  const container = document.getElementById("shoppingList");

  if (!container) {
    return;
  }

  const data = getData();

  const total = data.shopping.length;

  const completed = data.shopping.filter(
    item => item.completed
  ).length;

  const remaining = total - completed;

  const countElement = document.getElementById("shoppingCount");
  const remainingElement = document.getElementById("shoppingRemaining");
  const completedElement = document.getElementById("shoppingCompleted");

  if (countElement) {
    countElement.textContent = total;
  }

  if (remainingElement) {
    remainingElement.textContent = remaining;
  }

  if (completedElement) {
    completedElement.textContent = completed;
  }

  let items = [...data.shopping];

  if (currentShoppingFilter === "remaining") {
    items = items.filter(item => !item.completed);
  }

  if (currentShoppingFilter === "completed") {
    items = items.filter(item => item.completed);
  }

  if (currentShoppingCategory !== "all") {
    items = items.filter(
      item => item.category === currentShoppingCategory
    );
  }

  items.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    return 0;
  });

  const visibleElement =
    document.getElementById("shoppingVisibleCount");

  if (visibleElement) {
    visibleElement.textContent = items.length;
  }

  const titleElement =
    document.getElementById("shoppingSectionTitle");

  if (titleElement) {
    if (currentShoppingFilter === "completed") {
      titleElement.textContent = "Completed Items";
    } else if (currentShoppingFilter === "remaining") {
      titleElement.textContent = "Items to Buy";
    } else if (currentShoppingCategory !== "all") {
      titleElement.textContent = currentShoppingCategory;
    } else {
      titleElement.textContent = "Shopping List";
    }
  }

  if (items.length === 0) {
    let title = "Your shopping list is empty";
    let text = "Add your first shopping item to get started.";

    if (currentShoppingFilter === "completed") {
      title = "No completed items";
      text = "Bought items will appear here.";
    }

    if (currentShoppingFilter === "remaining") {
      title = "Nothing left to buy";
      text = "Everything on your list is completed.";
    }

    if (currentShoppingCategory !== "all") {
      title = "No items in this category";
      text = "Add something to this category.";
    }

    container.innerHTML = `
      <div class="shopping-empty">
        <div class="shopping-empty-icon">🛒</div>
        <div class="shopping-empty-title">${title}</div>
        <div class="shopping-empty-text">${text}</div>
      </div>
    `;

    updateClearCompletedButton(completed);
    return;
  }

  container.innerHTML = items
    .map(item => createShoppingHTML(item))
    .join("");

  updateClearCompletedButton(completed);
}

function clearCompletedShopping() {
  const data = getData();

  const completed = data.shopping.filter(
    item => item.completed
  ).length;

  if (completed === 0) {
    return;
  }

  const confirmed = confirm(
    `Remove ${completed} completed shopping item${completed === 1 ? "" : "s"}?`
  );

  if (!confirmed) {
    return;
  }

  data.shopping = data.shopping.filter(
    item => !item.completed
  );

  saveData(data);

  renderShopping();
  loadDashboard();
  updateToday();
}

function updateClearCompletedButton(count) {
  const button = document.getElementById("clearCompletedButton");

  if (!button) {
    return;
  }

  button.style.display = count > 0 ? "block" : "none";
}

/* =========================
   TASKS
========================= */

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
  const priority = priorityElement.value || "Medium";

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
  priorityElement.value = "Medium";

  closeSheet("taskSheet");

  renderTasks();
  loadDashboard();
  updateToday();
}

function addDashboardTask() {
  const nameElement = document.getElementById("dashboardTaskName");
  const personElement = document.getElementById("dashboardTaskPerson");
  const dueElement = document.getElementById("dashboardTaskDue");
  const priorityElement = document.getElementById("dashboardTaskPriority");

  if (!nameElement || !personElement || !dueElement || !priorityElement) {
    return;
  }

  const name = nameElement.value.trim();
  const person = personElement.value.trim();
  const due = dueElement.value;
  const priority = priorityElement.value || "Medium";

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

  closeSheet("dashboardTaskSheet");

  loadDashboard();
  updateToday();
}

function toggleTask(id) {
  const data = getData();

  const task = data.tasks.find(task => task.id === id);

  if (!task) {
    return;
  }

  task.completed = !task.completed;

  saveData(data);

  renderTasks();
  loadDashboard();
  updateToday();
}

function deleteTask(id) {
  const data = getData();

  data.tasks = data.tasks.filter(
    task => task.id !== id
  );

  saveData(data);

  renderTasks();
  loadDashboard();
  updateToday();
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

function isToday(task) {
  return task.due === getTodayString();
}

function isOverdue(task) {
  if (!task.due || task.completed) {
    return false;
  }

  return task.due < getTodayString();
}

function isUpcoming(task) {
  if (!task.due || task.completed) {
    return false;
  }

  return task.due > getTodayString();
}

function getTaskDateLabel(task) {
  if (!task.due) {
    return "No due date";
  }

  if (task.due === getTodayString()) {
    return "Today";
  }

  if (task.due === getTomorrowString()) {
    return "Tomorrow";
  }

  if (isOverdue(task)) {
    return "Overdue · " + formatDate(task.due);
  }

  return "Due " + formatDate(task.due);
}

function createTaskHTML(task) {
  const dateClass = isOverdue(task)
    ? "overdue"
    : isToday(task)
    ? "due-today"
    : "";

  const priorityClass =
    task.priority === "High"
      ? "high"
      : task.priority === "Low"
      ? "low"
      : "";

  return `
    <div class="task-card ${task.completed ? "completed" : ""} ${dateClass}">
      <input
        class="task-checkbox"
        type="checkbox"
        ${task.completed ? "checked" : ""}
        onchange="toggleTask('${task.id}')"
        aria-label="Complete ${escapeHTML(task.name)}"
      >

      <div class="task-content">
        <div class="task-name">
          ${escapeHTML(task.name)}
        </div>

        <div class="task-details">
          <span class="task-detail">
            ${escapeHTML(task.person || "Anyone")}
          </span>

          <span class="task-detail-dot">•</span>

          <span class="task-detail">
            ${escapeHTML(getTaskDateLabel(task))}
          </span>
        </div>
      </div>

      <span class="task-priority ${priorityClass}">
        ${escapeHTML(task.priority || "Medium")}
      </span>

      <button
        class="task-delete"
        type="button"
        onclick="deleteTask('${task.id}')"
        aria-label="Delete ${escapeHTML(task.name)}"
      >
        ×
      </button>
    </div>
  `;
}

function renderTaskList(container, tasks, emptyTitle, emptyText) {
  if (!container) {
    return;
  }

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="task-empty">
        <div class="task-empty-icon">✓</div>
        <div class="task-empty-title">${emptyTitle}</div>
        <div class="task-empty-text">${emptyText}</div>
      </div>
    `;

    return;
  }

  container.innerHTML = tasks
    .map(task => createTaskHTML(task))
    .join("");
}

function updateTaskProgress(data) {
  const total = data.tasks.length;

  const completed = data.tasks.filter(
    task => task.completed
  ).length;

  const active = total - completed;

  const percentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  const completedElement =
    document.getElementById("taskProgressCompleted");

  const totalElement =
    document.getElementById("taskProgressTotal");

  const percentElement =
    document.getElementById("taskProgressPercent");

  const fillElement =
    document.getElementById("taskProgressFill");

  const messageElement =
    document.getElementById("taskProgressMessage");

  if (completedElement) {
    completedElement.textContent = completed;
  }

  if (totalElement) {
    totalElement.textContent = total;
  }

  if (percentElement) {
    percentElement.textContent = percentage + "%";
  }

  if (fillElement) {
    fillElement.style.width = percentage + "%";
  }

  if (messageElement) {
    if (total === 0) {
      messageElement.textContent =
        "Add your first task to get started.";
    } else if (percentage === 100) {
      messageElement.textContent =
        "Everything is done. Great work! 🎉";
    } else if (percentage >= 75) {
      messageElement.textContent =
        "Almost there. Keep going!";
    } else if (percentage >= 50) {
      messageElement.textContent =
        "You're making good progress.";
    } else {
      messageElement.textContent =
        active +
        " task" +
        (active === 1 ? "" : "s") +
        " still to go.";
    }
  }
}

function updateTaskSummary(data) {
  const active = data.tasks.filter(
    task => !task.completed
  ).length;

  const completed = data.tasks.filter(
    task => task.completed
  ).length;

  const highPriority = data.tasks.filter(
    task =>
      !task.completed &&
      task.priority === "High"
  ).length;

  const activeElement =
    document.getElementById("taskCount");

  const completedElement =
    document.getElementById("completedTaskCount");

  const highElement =
    document.getElementById("highPriorityCount");

  if (activeElement) {
    activeElement.textContent = active;
  }

  if (completedElement) {
    completedElement.textContent = completed;
  }

  if (highElement) {
    highElement.textContent = highPriority;
  }
}

function renderTasks() {
  const mainContainer =
    document.getElementById("taskList");

  if (!mainContainer) {
    return;
  }

  const data = getData();

  updateTaskProgress(data);
  updateTaskSummary(data);

  const todayContainer =
    document.getElementById("todayTaskList");

  const upcomingContainer =
    document.getElementById("upcomingTaskList");

  const todaySection =
    document.getElementById("todayTaskSection");

  const upcomingSection =
    document.getElementById("upcomingTaskSection");

  const todayCount =
    document.getElementById("todayTaskSectionCount");

  const upcomingCount =
    document.getElementById("upcomingTaskSectionCount");

  const activeTasks = data.tasks.filter(
    task => !task.completed
  );

  const todayTasks = activeTasks.filter(
    task => isToday(task)
  );

  const upcomingTasks = activeTasks
    .filter(task => isUpcoming(task))
    .sort((a, b) => {
      if (!a.due) return 1;
      if (!b.due) return -1;

      return new Date(a.due) - new Date(b.due);
    })
    .slice(0, 5);

  if (todayCount) {
    todayCount.textContent = todayTasks.length;
  }

  if (upcomingCount) {
    upcomingCount.textContent = upcomingTasks.length;
  }

  renderTaskList(
    todayContainer,
    todayTasks,
    "Nothing due today",
    "You're all caught up for today."
  );

  renderTaskList(
    upcomingContainer,
    upcomingTasks,
    "Nothing coming up",
    "Future tasks will appear here."
  );

  if (currentTaskFilter === "today") {
    const title = document.getElementById("mainTaskTitle");

    if (title) {
      title.textContent = "Today's Tasks";
    }

    if (todaySection) todaySection.classList.add("hidden");
    if (upcomingSection) upcomingSection.classList.add("hidden");

    const todayOnly = data.tasks.filter(
      task => isToday(task)
    );

    renderTaskList(
      mainContainer,
      todayOnly,
      "No tasks today",
      "You don't have any tasks due today."
    );

    return;
  }

  if (currentTaskFilter === "active") {
    const title = document.getElementById("mainTaskTitle");

    if (title) {
      title.textContent = "Active Tasks";
    }

    if (todaySection) todaySection.classList.add("hidden");
    if (upcomingSection) upcomingSection.classList.add("hidden");

    const activeOnly = data.tasks.filter(
      task => !task.completed
    );

    renderTaskList(
      mainContainer,
      activeOnly,
      "No active tasks",
      "Everything is completed. 🎉"
    );

    return;
  }

  if (currentTaskFilter === "completed") {
    const title = document.getElementById("mainTaskTitle");

    if (title) {
      title.textContent = "Completed Tasks";
    }

    if (todaySection) todaySection.classList.add("hidden");
    if (upcomingSection) upcomingSection.classList.add("hidden");

    const completedOnly = data.tasks.filter(
      task => task.completed
    );

    renderTaskList(
      mainContainer,
      completedOnly,
      "No completed tasks",
      "Completed tasks will appear here."
    );

    return;
  }

  const title = document.getElementById("mainTaskTitle");

  if (title) {
    title.textContent = "All Tasks";
  }

  if (todaySection) todaySection.classList.remove("hidden");
  if (upcomingSection) upcomingSection.classList.remove("hidden");

  const allTasks = [...data.tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (!a.due && !b.due) {
      return 0;
    }

    if (!a.due) {
      return 1;
    }

    if (!b.due) {
      return -1;
    }

    return new Date(a.due) - new Date(b.due);
  });

  renderTaskList(
    mainContainer,
    allTasks,
    "No tasks yet",
    "Add your first household task to get started."
  );
}

/* =========================
   EVENTS
========================= */

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

  closeSheet("eventSheet");

  renderEvents();
  loadDashboard();
}

function addDashboardEvent() {
  const nameElement = document.getElementById("dashboardEventName");
  const dateElement = document.getElementById("dashboardEventDate");
  const timeElement = document.getElementById("dashboardEventTime");
  const locationElement = document.getElementById("dashboardEventLocation");

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

  closeSheet("dashboardEventSheet");

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

  if (!container) {
    return;
  }

  const data = getData();

  const events = [...data.events].sort(
    (a, b) => {
      const dateA = new Date(
        `${a.date}T${a.time || "00:00"}`
      );

      const dateB = new Date(
        `${b.date}T${b.time || "00:00"}`
      );

      return dateA - dateB;
    }
  );

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <div class="empty-title">No upcoming events</div>
        <div class="empty-text">
          Add an event to your household calendar.
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML = events
    .map(event => `
      <div class="data-row">
        <div class="data-main">
          <div>
            <div class="data-name">
              ${escapeHTML(event.name)}
            </div>

            <div class="data-info">
              ${formatDate(event.date)}
              ${event.time ? " · " + escapeHTML(event.time) : ""}
              ${event.location ? " · " + escapeHTML(event.location) : ""}
            </div>
          </div>
        </div>

        <button
          class="btn btn-danger btn-small"
          type="button"
          onclick="deleteEvent('${event.id}')"
        >
          Delete
        </button>
      </div>
    `)
    .join("");
}

/* =========================
   SPENDING
========================= */

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
    date: date || getTodayString()
  });

  saveData(data);

  nameElement.value = "";
  amountElement.value = "";
  dateElement.value = "";

  closeSheet("expenseSheet");

  renderSpending();
  loadDashboard();
}

function addDashboardExpense() {
  const nameElement = document.getElementById("dashboardExpenseName");
  const amountElement = document.getElementById("dashboardExpenseAmount");
  const categoryElement = document.getElementById("dashboardExpenseCategory");
  const dateElement = document.getElementById("dashboardExpenseDate");

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
    date: date || getTodayString()
  });

  saveData(data);

  nameElement.value = "";
  amountElement.value = "";
  dateElement.value = "";

  closeSheet("dashboardExpenseSheet");

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

  if (!container) {
    return;
  }

  const data = getData();

  const total = data.spending.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const now = new Date();

  const thisMonth = data.spending
    .filter(expense => {
      const date = new Date(
        expense.date + "T00:00:00"
      );

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

  const totalElement =
    document.getElementById("totalSpending");

  const monthElement =
    document.getElementById("monthSpending");

  const averageElement =
    document.getElementById("averageSpending");

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
        <div class="empty-text">
          Add your first household expense.
        </div>
      </div>
    `;

    return;
  }

  const expenses = [...data.spending].reverse();

  container.innerHTML = expenses
    .map(expense => `
      <div class="data-row">
        <div class="data-main">
          <div>
            <div class="data-name">
              ${escapeHTML(expense.name)}
            </div>

            <div class="expense-category">
              ${escapeHTML(expense.category)}
              ·
              ${formatDate(expense.date)}
            </div>
          </div>
        </div>

        <div class="data-actions">
          <span class="expense-amount">
            ${formatMoney(expense.amount)}
          </span>

          <button
            class="btn btn-danger btn-small"
            type="button"
            onclick="deleteExpense('${expense.id}')"
          >
            Delete
          </button>
        </div>
      </div>
    `)
    .join("");
}

/* =========================
   SETTINGS
========================= */

function loadSettings() {
  const data = getData();

  const nameInput =
    document.getElementById("householdName");

  if (nameInput) {
    nameInput.value =
      data.settings.householdName;
  }

  const currencyInput =
    document.getElementById("currency");

  if (currencyInput) {
    currencyInput.value =
      data.settings.currency;
  }
}

function saveSettings() {
  const data = getData();

  const nameInput =
    document.getElementById("householdName");

  const currencyInput =
    document.getElementById("currency");

  if (!nameInput || !currencyInput) {
    return;
  }

  const name = nameInput.value.trim();
  const currency = currencyInput.value;

  data.settings.householdName =
    name || "My Household";

  data.settings.currency =
    currency || "AUD";

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

  if (!confirmed) {
    return;
  }

  localStorage.removeItem("householdManager");
  location.reload();
}

/* =========================
   DASHBOARD
========================= */

function updateToday() {
  const data = getData();

  const today = new Date();
  const todayString = getTodayString();

  const todayTasks = data.tasks.filter(
    task =>
      !task.completed &&
      task.due === todayString
  ).length;

  const shoppingItems = data.shopping.filter(
    item => !item.completed
  ).length;

  const todayDateElement =
    document.getElementById("todayDate");

  const todayTaskElement =
    document.getElementById("todayTaskCount");

  const todayShoppingElement =
    document.getElementById("todayShoppingCount");

  if (todayDateElement) {
    todayDateElement.textContent =
      today.toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
  }

  if (todayTaskElement) {
    todayTaskElement.textContent =
      todayTasks;
  }

  if (todayShoppingElement) {
    todayShoppingElement.textContent =
      shoppingItems;
  }
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
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  const taskElement =
    document.getElementById("dashboardTasks");

  const shoppingElement =
    document.getElementById("dashboardShopping");

  const eventElement =
    document.getElementById("dashboardEvents");

  const spendingElement =
    document.getElementById("dashboardSpending");

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
    spendingElement.textContent =
      formatMoney(spending);
  }

  const taskList =
    document.getElementById("dashboardTaskList");

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
      taskList.innerHTML = tasks
        .map(task => `
          <div class="list-item">
            <div class="item-left">
              <span>✓</span>

              <div>
                <div class="item-title">
                  ${escapeHTML(task.name)}
                </div>

                <div class="item-meta">
                  ${escapeHTML(task.person || "Anyone")}
                </div>
              </div>
            </div>

            <span class="badge ${task.priority === "High" ? "yellow" : ""}">
              ${escapeHTML(task.priority || "Medium")}
            </span>
          </div>
        `)
        .join("");
    }
  }

  const eventList =
    document.getElementById("dashboardEventList");

  if (eventList) {
    const events = [...data.events]
      .sort((a, b) => {
        const dateA = new Date(
          `${a.date}T${a.time || "00:00"}`
        );

        const dateB = new Date(
          `${b.date}T${b.time || "00:00"}`
        );

        return dateA - dateB;
      })
      .slice(0, 4);

    if (events.length === 0) {
      eventList.innerHTML = `
        <div class="list-item">
          <span>No upcoming events</span>
        </div>
      `;
    } else {
      eventList.innerHTML = events
        .map(event => `
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
        `)
        .join("");
    }
  }
}

/* =========================
   FORM SUBMIT SUPPORT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavigation();
  updateHouseholdName();
  loadSettings();
  loadDashboard();
  updateToday();

  renderShopping();
  renderTasks();
  renderEvents();
  renderSpending();

  setupSheets();

  /*
    This makes the shopping form work even if the HTML
    button uses a form submit instead of onclick.
  */
  const shoppingForm = document.getElementById("shoppingForm");

  if (shoppingForm) {
    shoppingForm.addEventListener("submit", event => {
      event.preventDefault();
      addShoppingItem();
    });
  }

  const dashboardShoppingForm =
    document.getElementById("dashboardShoppingForm");

  if (dashboardShoppingForm) {
    dashboardShoppingForm.addEventListener("submit", event => {
      event.preventDefault();
      addDashboardShopping();
    });
  }

  const taskForm =
    document.getElementById("taskForm");

  if (taskForm) {
    taskForm.addEventListener("submit", event => {
      event.preventDefault();
      addTask();
    });
  }

  const eventForm =
    document.getElementById("eventForm");

  if (eventForm) {
    eventForm.addEventListener("submit", event => {
      event.preventDefault();
      addEvent();
    });
  }

  const expenseForm =
    document.getElementById("expenseForm");

  if (expenseForm) {
    expenseForm.addEventListener("submit", event => {
      event.preventDefault();
      addExpense();
    });
  }

  const dashboardTaskForm =
    document.getElementById("dashboardTaskForm");

  if (dashboardTaskForm) {
    dashboardTaskForm.addEventListener("submit", event => {
      event.preventDefault();
      addDashboardTask();
    });
  }

  const dashboardEventForm =
    document.getElementById("dashboardEventForm");

  if (dashboardEventForm) {
    dashboardEventForm.addEventListener("submit", event => {
      event.preventDefault();
      addDashboardEvent();
    });
  }

  const dashboardExpenseForm =
    document.getElementById("dashboardExpenseForm");

  if (dashboardExpenseForm) {
    dashboardExpenseForm.addEventListener("submit", event => {
      event.preventDefault();
      addDashboardExpense();
    });
  }
});
