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
let currentEventFilter = "all";

/* =========================
   DATA
========================= */

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
  } catch {
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

/* =========================
   NAVIGATION / UI
========================= */

function setActiveNavigation() {
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("[data-page]").forEach(link => {
    if (link.getAttribute("data-page") === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function updateHouseholdName() {
  const data = getData();

  document.querySelectorAll(".household-name").forEach(element => {
    element.textContent =
      data.settings.householdName || "My Household";
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

  if (!document.querySelector(".sheet-overlay.open")) {
    document.body.classList.remove("sheet-open");
  }
}

function setupSheets() {
  document.querySelectorAll(".sheet-overlay").forEach(overlay => {
    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        overlay.classList.remove("open");

        if (!document.querySelector(".sheet-overlay.open")) {
          document.body.classList.remove("sheet-open");
        }
      }
    });
  });
}

/* =========================
   DATE / FORMAT HELPERS
========================= */

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

function getDateFromString(dateString) {
  if (!dateString) return null;

  const parts = dateString.split("-");

  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  return new Date(year, month, day);
}

function formatDate(date) {
  if (!date) return "";

  const parsed = getDateFromString(date);

  if (!parsed || isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatShortDate(date) {
  if (!date) return "";

  const parsed = getDateFromString(date);

  if (!parsed || isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short"
  });
}

function formatTime(time) {
  if (!time) return "";

  const parts = time.split(":");

  if (parts.length < 2) {
    return time;
  }

  let hour = Number(parts[0]);
  const minute = parts[1];

  if (isNaN(hour)) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${suffix}`;
}

function formatMoney(amount) {
  const data = getData();

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: data.settings.currency || "AUD"
  }).format(Number(amount) || 0);
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

/* =========================
   SHOPPING
========================= */

function addShoppingItem() {
  const nameElement =
    document.getElementById("shoppingName");

  const quantityElement =
    document.getElementById("shoppingQuantity");

  const categoryElement =
    document.getElementById("shoppingCategory");

  if (!nameElement || !quantityElement || !categoryElement) {
    return;
  }

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
    category: category || "Groceries",
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

function addDashboardShopping() {
  const nameElement =
    document.getElementById("dashboardShoppingName");

  const quantityElement =
    document.getElementById("dashboardShoppingQuantity");

  const categoryElement =
    document.getElementById("dashboardShoppingCategory");

  if (!nameElement || !quantityElement || !categoryElement) {
    return;
  }

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
    category: category || "Groceries",
    completed: false
  });

  saveData(data);

  nameElement.value = "";
  quantityElement.value = "";

  closeSheet("dashboardShoppingSheet");

  loadDashboard();
  updateToday();
}

function addTaskShoppingItem() {
  addShoppingItem();
}

function toggleShopping(id) {
  const data = getData();

  const item = data.shopping.find(
    item => item.id === id
  );

  if (!item) return;

  item.completed = !item.completed;

  saveData(data);

  renderShopping();
  loadDashboard();
  updateToday();
}

function deleteShopping(id) {
  const data = getData();

  data.shopping = data.shopping.filter(
    item => item.id !== id
  );

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

  document
    .querySelectorAll(".category-button")
    .forEach(item => {
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

function renderShopping() {
  const container =
    document.getElementById("shoppingList");

  if (!container) return;

  const data = getData();

  const total = data.shopping.length;

  const completed = data.shopping.filter(
    item => item.completed
  ).length;

  const remaining = total - completed;

  const countElement =
    document.getElementById("shoppingCount");

  const remainingElement =
    document.getElementById("shoppingRemaining");

  const completedElement =
    document.getElementById("shoppingCompleted");

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

  items.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    return 0;
  });

  container.innerHTML = items.map(item => {
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
          onclick="deleteShopping('${item.id}')"
          aria-label="Delete ${escapeHTML(item.name)}"
        >
          ×
        </button>

      </div>
    `;
  }).join("");

  updateClearCompletedButton(completed);
}

function clearCompletedShopping() {
  const data = getData();

  const completed =
    data.shopping.filter(item => item.completed).length;

  if (completed === 0) return;

  const confirmed = confirm(
    `Remove ${completed} completed shopping item${completed === 1 ? "" : "s"}?`
  );

  if (!confirmed) return;

  data.shopping = data.shopping.filter(
    item => !item.completed
  );

  saveData(data);

  renderShopping();
  loadDashboard();
  updateToday();
}

function updateClearCompletedButton(count) {
  const button =
    document.getElementById("clearCompletedButton");

  if (!button) return;

  button.style.display =
    count > 0 ? "block" : "none";
}

/* =========================
   TASKS
========================= */

function addTask() {
  const nameElement =
    document.getElementById("taskName");

  const personElement =
    document.getElementById("taskPerson");

  const dueElement =
    document.getElementById("taskDue");

  const priorityElement =
    document.getElementById("taskPriority");

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
    priority: priority || "Medium",
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
  const nameElement =
    document.getElementById("dashboardTaskName");

  const personElement =
    document.getElementById("dashboardTaskPerson");

  const dueElement =
    document.getElementById("dashboardTaskDue");

  const priorityElement =
    document.getElementById("dashboardTaskPriority");

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
    priority: priority || "Medium",
    completed: false
  });

  saveData(data);

  nameElement.value = "";
  personElement.value = "";
  dueElement.value = "";
  priorityElement.value = "Medium";

  closeSheet("dashboardTaskSheet");

  loadDashboard();
  updateToday();
}

function toggleTask(id) {
  const data = getData();

  const task = data.tasks.find(
    task => task.id === id
  );

  if (!task) return;

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

  document
    .querySelectorAll(".filter-button")
    .forEach(item => {
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
  const dateClass =
    isOverdue(task)
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
        onclick="deleteTask('${task.id}')"
        aria-label="Delete ${escapeHTML(task.name)}"
      >
        ×
      </button>

    </div>
  `;
}

function renderTaskList(
  container,
  tasks,
  emptyTitle,
  emptyText
) {
  if (!container) return;

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
        active + " task" +
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

  if (!mainContainer) return;

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

  const mainTitle =
    document.getElementById("mainTaskTitle");

  const activeTasks =
    data.tasks.filter(task => !task.completed);

  const todayTasks =
    activeTasks.filter(task => isToday(task));

  const upcomingTasks =
    activeTasks
      .filter(task => isUpcoming(task))
      .sort((a, b) => {
        if (!a.due) return 1;
        if (!b.due) return -1;

        return a.due.localeCompare(b.due);
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

  if (todaySection) {
    todaySection.classList.remove("hidden");
  }

  if (upcomingSection) {
    upcomingSection.classList.remove("hidden");
  }

  if (currentTaskFilter === "today") {
    if (mainTitle) {
      mainTitle.textContent = "Today's Tasks";
    }

    if (todaySection) {
      todaySection.classList.add("hidden");
    }

    if (upcomingSection) {
      upcomingSection.classList.add("hidden");
    }

    const todayOnly =
      data.tasks.filter(task => isToday(task));

    renderTaskList(
      mainContainer,
      todayOnly,
      "No tasks today",
      "You don't have any tasks due today."
    );

    return;
  }

  if (currentTaskFilter === "active") {
    if (mainTitle) {
      mainTitle.textContent = "Active Tasks";
    }

    if (todaySection) {
      todaySection.classList.add("hidden");
    }

    if (upcomingSection) {
      upcomingSection.classList.add("hidden");
    }

    const activeOnly =
      data.tasks.filter(task => !task.completed);

    renderTaskList(
      mainContainer,
      activeOnly,
      "No active tasks",
      "Everything is completed. 🎉"
    );

    return;
  }

  if (currentTaskFilter === "completed") {
    if (mainTitle) {
      mainTitle.textContent = "Completed Tasks";
    }

    if (todaySection) {
      todaySection.classList.add("hidden");
    }

    if (upcomingSection) {
      upcomingSection.classList.add("hidden");
    }

    const completedOnly =
      data.tasks.filter(task => task.completed);

    renderTaskList(
      mainContainer,
      completedOnly,
      "No completed tasks",
      "Completed tasks will appear here."
    );

    return;
  }

  if (mainTitle) {
    mainTitle.textContent = "All Tasks";
  }

  const allTasks =
    [...data.tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;

      return a.due.localeCompare(b.due);
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
  const nameElement =
    document.getElementById("eventName");

  const dateElement =
    document.getElementById("eventDate");

  const timeElement =
    document.getElementById("eventTime");

  const locationElement =
    document.getElementById("eventLocation");

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
  const nameElement =
    document.getElementById("dashboardEventName");

  const dateElement =
    document.getElementById("dashboardEventDate");

  const timeElement =
    document.getElementById("dashboardEventTime");

  const locationElement =
    document.getElementById("dashboardEventLocation");

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

function filterEvents(filter, button) {
  currentEventFilter = filter;

  document
    .querySelectorAll(".event-filters .filter-button")
    .forEach(item => {
      item.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  renderEvents();
}

function isEventToday(event) {
  return event.date === getTodayString();
}

function isEventPast(event) {
  return event.date < getTodayString();
}

function isEventThisWeek(event) {
  if (!event.date) return false;

  const today = getDateFromString(getTodayString());
  const eventDate = getDateFromString(event.date);

  if (!today || !eventDate) return false;

  const day = today.getDay();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - day);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return eventDate >= startOfWeek &&
         eventDate <= endOfWeek;
}

function getEventDateLabel(event) {
  if (!event.date) {
    return "No date";
  }

  if (event.date === getTodayString()) {
    return "Today";
  }

  if (event.date === getTomorrowString()) {
    return "Tomorrow";
  }

  return formatDate(event.date);
}

function getEventDay(event) {
  const date = getDateFromString(event.date);

  if (!date) {
    return "--";
  }

  return date.getDate();
}

function getEventMonth(event) {
  const date = getDateFromString(event.date);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-AU", {
    month: "short"
  }).toUpperCase();
}

function getEventWeekday(event) {
  const date = getDateFromString(event.date);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-AU", {
    weekday: "short"
  });
}

function createEventHTML(event) {
  const pastClass =
    isEventPast(event) ? "past" : "";

  const timeHTML =
    event.time
      ? `<span class="event-detail">🕐 ${escapeHTML(formatTime(event.time))}</span>`
      : "";

  const locationHTML =
    event.location
      ? `<span class="event-detail">📍 ${escapeHTML(event.location)}</span>`
      : "";

  return `
    <div class="event-card ${pastClass}">

      <div class="event-date-block">
        <div class="event-date-weekday">
          ${escapeHTML(getEventWeekday(event))}
        </div>

        <div class="event-date-day">
          ${escapeHTML(getEventDay(event))}
        </div>

        <div class="event-date-month">
          ${escapeHTML(getEventMonth(event))}
        </div>
      </div>

      <div class="event-content">

        <div class="event-name">
          ${escapeHTML(event.name)}
        </div>

        <div class="event-date-label">
          ${escapeHTML(getEventDateLabel(event))}
        </div>

        <div class="event-details">
          ${timeHTML}
          ${locationHTML}
        </div>

      </div>

      <button
        class="event-delete"
        onclick="deleteEvent('${event.id}')"
        aria-label="Delete ${escapeHTML(event.name)}"
      >
        ×
      </button>

    </div>
  `;
}

function renderEventList(
  container,
  events,
  emptyTitle,
  emptyText
) {
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = `
      <div class="event-empty">
        <div class="event-empty-icon">📅</div>
        <div class="event-empty-title">
          ${escapeHTML(emptyTitle)}
        </div>
        <div class="event-empty-text">
          ${escapeHTML(emptyText)}
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML = events
    .map(event => createEventHTML(event))
    .join("");
}

function updateEventSummary(data) {
  const today = getTodayString();

  const upcoming =
    data.events.filter(event => event.date >= today);

  const thisWeek =
    data.events.filter(event =>
      event.date >= today &&
      isEventThisWeek(event)
    );

  const upcomingElement =
    document.getElementById("eventUpcomingCount");

  const weekElement =
    document.getElementById("eventWeekCount");

  const totalElement =
    document.getElementById("eventTotalCount");

  if (upcomingElement) {
    upcomingElement.textContent = upcoming.length;
  }

  if (weekElement) {
    weekElement.textContent = thisWeek.length;
  }

  if (totalElement) {
    totalElement.textContent = data.events.length;
  }
}

function updateNextEvent(data) {
  const nextEventName =
    document.getElementById("nextEventName");

  const nextEventDate =
    document.getElementById("nextEventDate");

  const nextEventTime =
    document.getElementById("nextEventTime");

  const nextEventLocation =
    document.getElementById("nextEventLocation");

  const nextEventDay =
    document.getElementById("nextEventDay");

  const nextEventMonth =
    document.getElementById("nextEventMonth");

  const nextEventCard =
    document.getElementById("nextEventCard");

  const today = getTodayString();

  const upcoming =
    data.events
      .filter(event => event.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }

        const timeA = a.time || "99:99";
        const timeB = b.time || "99:99";

        return timeA.localeCompare(timeB);
      });

  const event = upcoming[0];

  if (!event) {
    if (nextEventCard) {
      nextEventCard.classList.add("empty");
    }

    if (nextEventName) {
      nextEventName.textContent = "No upcoming events";
    }

    if (nextEventDate) {
      nextEventDate.textContent = "Add an event to get started.";
    }

    if (nextEventTime) {
      nextEventTime.textContent = "";
    }

    if (nextEventLocation) {
      nextEventLocation.textContent = "";
    }

    if (nextEventDay) {
      nextEventDay.textContent = "—";
    }

    if (nextEventMonth) {
      nextEventMonth.textContent = "";
    }

    return;
  }

  if (nextEventCard) {
    nextEventCard.classList.remove("empty");
  }

  if (nextEventName) {
    nextEventName.textContent = event.name;
  }

  if (nextEventDate) {
    nextEventDate.textContent =
      getEventDateLabel(event);
  }

  if (nextEventTime) {
    nextEventTime.textContent =
      event.time ? formatTime(event.time) : "";
  }

  if (nextEventLocation) {
    nextEventLocation.textContent =
      event.location || "";
  }

  if (nextEventDay) {
    nextEventDay.textContent =
      getEventDay(event);
  }

  if (nextEventMonth) {
    nextEventMonth.textContent =
      getEventMonth(event);
  }
}

function renderEvents() {
  const container =
    document.getElementById("eventList");

  if (!container) return;

  const data = getData();

  updateEventSummary(data);
  updateNextEvent(data);

  let events = [...data.events];

  if (currentEventFilter === "today") {
    events = events.filter(event =>
      isEventToday(event)
    );
  }

  if (currentEventFilter === "week") {
    events = events.filter(event =>
      !isEventPast(event) &&
      isEventThisWeek(event)
    );
  }

  if (currentEventFilter === "past") {
    events = events.filter(event =>
      isEventPast(event)
    );
  }

  events.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    const timeA = a.time || "99:99";
    const timeB = b.time || "99:99";

    return timeA.localeCompare(timeB);
  });

  if (currentEventFilter === "past") {
    events.reverse();
  }

  const visibleElement =
    document.getElementById("eventVisibleCount");

  if (visibleElement) {
    visibleElement.textContent = events.length;
  }

  const titleElement =
    document.getElementById("eventSectionTitle");

  if (titleElement) {
    if (currentEventFilter === "today") {
      titleElement.textContent = "Today's Events";
    } else if (currentEventFilter === "week") {
      titleElement.textContent = "This Week";
    } else if (currentEventFilter === "past") {
      titleElement.textContent = "Past Events";
    } else {
      titleElement.textContent = "Upcoming Events";
    }
  }

  if (events.length === 0) {
    let title = "No upcoming events";
    let text = "Add an event to your household calendar.";

    if (currentEventFilter === "today") {
      title = "Nothing today";
      text = "You don't have any events scheduled today.";
    }

    if (currentEventFilter === "week") {
      title = "Nothing this week";
      text = "You don't have any events scheduled this week.";
    }

    if (currentEventFilter === "past") {
      title = "No past events";
      text = "Past events will appear here.";
    }

    renderEventList(
      container,
      [],
      title,
      text
    );

    return;
  }

  renderEventList(
    container,
    events,
    "No upcoming events",
    "Add an event to your household calendar."
  );
}

/* =========================
   SPENDING
========================= */

function addExpense() {
  const nameElement =
    document.getElementById("expenseName");

  const amountElement =
    document.getElementById("expenseAmount");

  const categoryElement =
    document.getElementById("expenseCategory");

  const dateElement =
    document.getElementById("expenseDate");

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
  const nameElement =
    document.getElementById("dashboardExpenseName");

  const amountElement =
    document.getElementById("dashboardExpenseAmount");

  const categoryElement =
    document.getElementById("dashboardExpenseCategory");

  const dateElement =
    document.getElementById("dashboardExpenseDate");

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
  const container =
    document.getElementById("spendingList");

  if (!container) return;

  const data = getData();

  const total =
    data.spending.reduce(
      (sum, expense) =>
        sum + Number(expense.amount),
      0
    );

  const today = getData();

  const currentDate = new Date();

  const thisMonth =
    data.spending
      .filter(expense => {
        const date =
          getDateFromString(expense.date);

        if (!date) return false;

        return (
          date.getMonth() === currentDate.getMonth() &&
          date.getFullYear() === currentDate.getFullYear()
        );
      })
      .reduce(
        (sum, expense) =>
          sum + Number(expense.amount),
        0
      );

  const average =
    data.spending.length
      ? total / data.spending.length
      : 0;

  const totalElement =
    document.getElementById("totalSpending");

  const monthElement =
    document.getElementById("monthSpending");

  const averageElement =
    document.getElementById("averageSpending");

  if (totalElement) {
    totalElement.textContent =
      formatMoney(total);
  }

  if (monthElement) {
    monthElement.textContent =
      formatMoney(thisMonth);
  }

  if (averageElement) {
    averageElement.textContent =
      formatMoney(average);
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

  const expenses =
    [...data.spending].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }

      return 0;
    });

  container.innerHTML =
    expenses.map(expense => `
      <div class="data-row">

        <div class="data-main">
          <div>
            <div class="data-name">
              ${escapeHTML(expense.name)}
            </div>

            <div class="expense-category">
              ${escapeHTML(expense.category || "Other")}
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
            onclick="deleteExpense('${expense.id}')"
          >
            Delete
          </button>

        </div>

      </div>
    `).join("");
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
      data.settings.householdName || "My Household";
  }

  const currencyInput =
    document.getElementById("currency");

  if (currencyInput) {
    currencyInput.value =
      data.settings.currency || "AUD";
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

  if (!confirmed) return;

  localStorage.removeItem("householdManager");
  location.reload();
}

/* =========================
   DASHBOARD
========================= */

function updateToday() {
  const data = getData();

  const todayString =
    getTodayString();

  const today =
    getDateFromString(todayString);

  const todayTasks =
    data.tasks.filter(
      task =>
        !task.completed &&
        task.due === todayString
    ).length;

  const shoppingItems =
    data.shopping.filter(
      item => !item.completed
    ).length;

  const todayDateElement =
    document.getElementById("todayDate");

  const todayTaskElement =
    document.getElementById("todayTaskCount");

  const todayShoppingElement =
    document.getElementById("todayShoppingCount");

  if (todayDateElement && today) {
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

  const taskCount =
    data.tasks.filter(
      task => !task.completed
    ).length;

  const shoppingCount =
    data.shopping.filter(
      item => !item.completed
    ).length;

  const todayString =
    getTodayString();

  const eventCount =
    data.events.filter(
      event => event.date >= todayString
    ).length;

  const spending =
    data.spending.reduce(
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
    taskElement.textContent =
      taskCount;
  }

  if (shoppingElement) {
    shoppingElement.textContent =
      shoppingCount;
  }

  if (eventElement) {
    eventElement.textContent =
      eventCount;
  }

  if (spendingElement) {
    spendingElement.textContent =
      formatMoney(spending);
  }

  const taskList =
    document.getElementById("dashboardTaskList");

  if (taskList) {
    const tasks =
      data.tasks
        .filter(task => !task.completed)
        .sort((a, b) => {
          if (!a.due && !b.due) return 0;
          if (!a.due) return 1;
          if (!b.due) return -1;

          return a.due.localeCompare(b.due);
        })
        .slice(0, 4);

    if (tasks.length === 0) {
      taskList.innerHTML = `
        <div class="list-item">
          <span>No outstanding tasks 🎉</span>
        </div>
      `;
    } else {
      taskList.innerHTML =
        tasks.map(task => `
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
        `).join("");
    }
  }

  const eventList =
    document.getElementById("dashboardEventList");

  if (eventList) {
    const events =
      data.events
        .filter(event => event.date >= todayString)
        .sort((a, b) => {
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }

          return (a.time || "99:99")
            .localeCompare(a.time || "99:99");
        })
        .slice(0, 4);

    if (events.length === 0) {
      eventList.innerHTML = `
        <div class="list-item">
          <span>No upcoming events</span>
        </div>
      `;
    } else {
      eventList.innerHTML =
        events.map(event => `
          <div class="list-item">

            <div class="item-left">
              <span>📅</span>

              <div>
                <div class="item-title">
                  ${escapeHTML(event.name)}
                </div>

                <div class="item-meta">
                  ${escapeHTML(getEventDateLabel(event))}
                  ${event.time ? " · " + escapeHTML(formatTime(event.time)) : ""}
                </div>
              </div>
            </div>

          </div>
        `).join("");
    }
  }
}

/* =========================
   DOM READY
========================= */

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavigation();
  updateHouseholdName();
  loadSettings();

  currentTaskFilter = "all";
  currentShoppingFilter = "all";
  currentShoppingCategory = "all";
  currentEventFilter = "all";

  loadDashboard();
  updateToday();
  renderShopping();
  renderTasks();
  renderEvents();
  renderSpending();

  setupSheets();
});
