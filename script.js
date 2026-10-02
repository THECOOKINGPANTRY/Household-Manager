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

  document
    .querySelectorAll(".sheet-close, [data-close-sheet]")
    .forEach(button => {
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

function addShoppingItem(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameElement = document.getElementById("shoppingName");
  const quantityElement = document.getElementById("shoppingQuantity");
  const categoryElement = document.getElementById("shoppingCategory");

  if (!nameElement) {
    console.error("Shopping name input could not be found.");
    return false;
  }

  const name = nameElement.value.trim();
  const quantity = quantityElement
    ? quantityElement.value.trim()
    : "1";
  const category = categoryElement
    ? categoryElement.value || "Groceries"
    : "Groceries";

  if (!name) {
    alert("Please enter an item.");
    nameElement.focus();
    return false;
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

  if (quantityElement) {
    quantityElement.value = "";
  }

  if (categoryElement) {
    categoryElement.value = "Groceries";
  }

  closeSheet("shoppingSheet");

  renderShopping();
  loadDashboard();
  updateToday();

  return false;
}

function addTaskShoppingItem(event) {
  return addShoppingItem(event);
}

function addDashboardShopping(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameElement =
    document.getElementById("dashboardShoppingName");

  const quantityElement =
    document.getElementById("dashboardShoppingQuantity");

  const categoryElement =
    document.getElementById("dashboardShoppingCategory");

  if (!nameElement) {
    return false;
  }

  const name = nameElement.value.trim();
  const quantity = quantityElement
    ? quantityElement.value.trim()
    : "1";

  const category = categoryElement
    ? categoryElement.value || "Groceries"
    : "Groceries";

  if (!name) {
    alert("Please enter an item.");
    nameElement.focus();
    return false;
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

  if (quantityElement) {
    quantityElement.value = "";
  }

  if (categoryElement) {
    categoryElement.value = "Groceries";
  }

  closeSheet("dashboardShoppingSheet");

  loadDashboard();
  updateToday();
  renderShopping();

  return false;
}

function toggleShoppingItem(id) {
  const data = getData();

  const item = data.shopping.find(
    item => String(item.id) === String(id)
  );

  if (!item) return;

  item.completed = !item.completed;

  saveData(data);

  renderShopping();
  loadDashboard();
  updateToday();
}

function deleteShoppingItem(id) {
  const data = getData();

  data.shopping = data.shopping.filter(
    item => String(item.id) !== String(id)
  );

  saveData(data);

  renderShopping();
  loadDashboard();
  updateToday();
}

function deleteShopping(id) {
  deleteShoppingItem(id);
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
  const data = getData();
  const items = Array.isArray(data.shopping)
    ? data.shopping
    : [];

  const list = document.getElementById("shoppingList");
  const remainingCount =
    document.getElementById("shoppingRemainingCount");
  const totalCount =
    document.getElementById("shoppingTotalCount");
  const completedCount =
    document.getElementById("shoppingCompletedCount");
  const visibleCount =
    document.getElementById("visibleShoppingCount");
  const sectionTitle =
    document.getElementById("shoppingSectionTitle");
  const clearButton =
    document.getElementById("clearCompletedButton");

  const total = items.length;

  const completed = items.filter(
    item => item.completed
  ).length;

  const remaining = total - completed;

  if (remainingCount) {
    remainingCount.textContent = remaining;
  }

  if (totalCount) {
    totalCount.textContent = total;
  }

  if (completedCount) {
    completedCount.textContent = completed;
  }

  let filteredItems = [...items];

  if (currentShoppingFilter === "remaining") {
    filteredItems = filteredItems.filter(
      item => !item.completed
    );
  }

  if (currentShoppingFilter === "completed") {
    filteredItems = filteredItems.filter(
      item => item.completed
    );
  }

  if (currentShoppingCategory !== "all") {
    filteredItems = filteredItems.filter(
      item => item.category === currentShoppingCategory
    );
  }

  if (visibleCount) {
    visibleCount.textContent = filteredItems.length;
  }

  if (sectionTitle) {
    if (currentShoppingFilter === "remaining") {
      sectionTitle.textContent = "Items to Buy";
    } else if (currentShoppingFilter === "completed") {
      sectionTitle.textContent = "Completed Items";
    } else if (currentShoppingCategory !== "all") {
      sectionTitle.textContent = currentShoppingCategory;
    } else {
      sectionTitle.textContent = "Shopping List";
    }
  }

  if (clearButton) {
    clearButton.style.display =
      completed > 0 ? "block" : "none";
  }

  if (!list) return;

  if (filteredItems.length === 0) {
    list.innerHTML = `
      <div class="shopping-empty">
        <div class="shopping-empty-icon">🛒</div>
        <div class="shopping-empty-title">Nothing here yet</div>
        <div class="shopping-empty-text">
          Add something your household needs.
        </div>
      </div>
    `;

    return;
  }

  list.innerHTML = filteredItems
    .map(item => {
      const icon = getShoppingCategoryIcon(item.category);

      return `
        <div class="shopping-card ${item.completed ? "completed" : ""}">
          <button
            type="button"
            class="shopping-checkbox ${item.completed ? "checked" : ""}"
            onclick="toggleShoppingItem('${item.id}')"
            aria-label="Complete ${escapeHTML(item.name)}"
          >
            ${item.completed ? "✓" : ""}
          </button>

          <div class="shopping-item-content">
            <div class="shopping-item-name">
              ${escapeHTML(item.name)}
            </div>

            <div class="shopping-item-details">
              <span class="shopping-item-detail">
                ${escapeHTML(item.quantity || "1")}
              </span>

              <span class="shopping-item-dot">•</span>

              <span class="shopping-category-badge">
                ${icon} ${escapeHTML(item.category || "Other")}
              </span>
            </div>
          </div>

          <button
            type="button"
            class="shopping-delete"
            onclick="deleteShoppingItem('${item.id}')"
            aria-label="Delete ${escapeHTML(item.name)}"
          >
            ×
          </button>
        </div>
      `;
    })
    .join("");
}

function clearCompletedShopping() {
  const data = getData();

  const completed = data.shopping.filter(
    item => item.completed
  ).length;

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

function addTask(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameElement = document.getElementById("taskName");
  const personElement = document.getElementById("taskPerson");
  const dueElement = document.getElementById("taskDue");
  const priorityElement =
    document.getElementById("taskPriority");

  if (!nameElement) return false;

  const name = nameElement.value.trim();
  const person = personElement
    ? personElement.value.trim()
    : "";
  const due = dueElement ? dueElement.value : "";
  const priority = priorityElement
    ? priorityElement.value || "Medium"
    : "Medium";

  if (!name) {
    alert("Please enter a task.");
    nameElement.focus();
    return false;
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

  if (personElement) personElement.value = "";
  if (dueElement) dueElement.value = "";
  if (priorityElement) priorityElement.value = "Medium";

  closeSheet("taskSheet");

  renderTasks();
  loadDashboard();
  updateToday();

  return false;
}

function addDashboardTask(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameElement =
    document.getElementById("dashboardTaskName");

  const personElement =
    document.getElementById("dashboardTaskPerson");

  const dueElement =
    document.getElementById("dashboardTaskDue");

  const priorityElement =
    document.getElementById("dashboardTaskPriority");

  if (!nameElement) return false;

  const name = nameElement.value.trim();
  const person = personElement
    ? personElement.value.trim()
    : "";
  const due = dueElement ? dueElement.value : "";
  const priority = priorityElement
    ? priorityElement.value || "Medium"
    : "Medium";

  if (!name) {
    alert("Please enter a task.");
    nameElement.focus();
    return false;
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

  if (personElement) personElement.value = "";
  if (dueElement) dueElement.value = "";
  if (priorityElement) priorityElement.value = "Medium";

  closeSheet("dashboardTaskSheet");

  loadDashboard();
  updateToday();
  renderTasks();

  return false;
}

function toggleTask(id) {
  const data = getData();

  const task = data.tasks.find(
    task => String(task.id) === String(id)
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
    task => String(task.id) !== String(id)
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

  const title =
    document.getElementById("mainTaskTitle");

  if (currentTaskFilter === "today") {
    if (title) title.textContent = "Today's Tasks";

    if (todaySection) {
      todaySection.classList.add("hidden");
    }

    if (upcomingSection) {
      upcomingSection.classList.add("hidden");
    }

    renderTaskList(
      mainContainer,
      data.tasks.filter(task => isToday(task)),
      "No tasks today",
      "You don't have any tasks due today."
    );

    return;
  }

  if (currentTaskFilter === "active") {
    if (title) title.textContent = "Active Tasks";

    if (todaySection) {
      todaySection.classList.add("hidden");
    }

    if (upcomingSection) {
      upcomingSection.classList.add("hidden");
    }

    renderTaskList(
      mainContainer,
      data.tasks.filter(task => !task.completed),
      "No active tasks",
      "Everything is completed. 🎉"
    );

    return;
  }

  if (currentTaskFilter === "completed") {
    if (title) title.textContent = "Completed Tasks";

    if (todaySection) {
      todaySection.classList.add("hidden");
    }

    if (upcomingSection) {
      upcomingSection.classList.add("hidden");
    }

    renderTaskList(
      mainContainer,
      data.tasks.filter(task => task.completed),
      "No completed tasks",
      "Completed tasks will appear here."
    );

    return;
  }

  if (title) {
    title.textContent = "All Tasks";
  }

  if (todaySection) {
    todaySection.classList.remove("hidden");
  }

  if (upcomingSection) {
    upcomingSection.classList.remove("hidden");
  }

  const allTasks = [...data.tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (!a.due && !b.due) return 0;
    if (!a.due) return 1;
    if (!b.due) return -1;

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

function addEvent(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameElement =
    document.getElementById("eventName");

  const dateElement =
    document.getElementById("eventDate");

  const timeElement =
    document.getElementById("eventTime");

  const locationElement =
    document.getElementById("eventLocation");

  if (!nameElement || !dateElement) {
    return false;
  }

  const name = nameElement.value.trim();
  const date = dateElement.value;
  const time = timeElement ? timeElement.value : "";
  const location = locationElement
    ? locationElement.value.trim()
    : "";

  if (!name || !date) {
    alert("Please enter an event name and date.");
    return false;
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

  if (timeElement) timeElement.value = "";
  if (locationElement) locationElement.value = "";

  closeSheet("eventSheet");

  renderEvents();
  loadDashboard();

  return false;
}

function addDashboardEvent(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameElement =
    document.getElementById("dashboardEventName");

  const dateElement =
    document.getElementById("dashboardEventDate");

  const timeElement =
    document.getElementById("dashboardEventTime");

  const locationElement =
    document.getElementById("dashboardEventLocation");

  if (!nameElement || !dateElement) {
    return false;
  }

  const name = nameElement.value.trim();
  const date = dateElement.value;
  const time = timeElement ? timeElement.value : "";
  const location = locationElement
    ? locationElement.value.trim()
    : "";

  if (!name || !date) {
    alert("Please enter an event name and date.");
    return false;
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

  if (timeElement) timeElement.value = "";
  if (locationElement) locationElement.value = "";

  closeSheet("dashboardEventSheet");

  renderEvents();
  loadDashboard();

  return false;
}

function deleteEvent(id) {
  const data = getData();

  data.events = data.events.filter(
    event => String(event.id) !== String(id)
  );

  saveData(data);

  renderEvents();
  loadDashboard();
}

function renderEvents() {
  const container =
    document.getElementById("eventList");

  if (!container) return;

  const data = getData();

  const events = [...data.events].sort((a, b) => {
    const dateA = new Date(
      `${a.date}T${a.time || "00:00"}`
    );

    const dateB = new Date(
      `${b.date}T${b.time || "00:00"}`
    );

    return dateA - dateB;
  });

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

function addExpense(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameElement =
    document.getElementById("expenseName");

  const amountElement =
    document.getElementById("expenseAmount");

  const categoryElement =
    document.getElementById("expenseCategory");

  const dateElement =
    document.getElementById("expenseDate");

  if (!nameElement || !amountElement || !categoryElement) {
    return false;
  }

  const name = nameElement.value.trim();
  const amount = parseFloat(amountElement.value);
  const category = categoryElement.value;
  const date = dateElement ? dateElement.value : "";

  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid expense.");
    return false;
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

  if (dateElement) {
    dateElement.value = "";
  }

  closeSheet("expenseSheet");

  renderSpending();
  loadDashboard();

  return false;
}

function addDashboardExpense(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameElement =
    document.getElementById("dashboardExpenseName");

  const amountElement =
    document.getElementById("dashboardExpenseAmount");

  const categoryElement =
    document.getElementById("dashboardExpenseCategory");

  const dateElement =
    document.getElementById("dashboardExpenseDate");

  if (!nameElement || !amountElement || !categoryElement) {
    return false;
  }

  const name = nameElement.value.trim();
  const amount = parseFloat(amountElement.value);
  const category = categoryElement.value;
  const date = dateElement ? dateElement.value : "";

  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid expense.");
    return false;
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

  if (dateElement) {
    dateElement.value = "";
  }

  closeSheet("dashboardExpenseSheet");

  renderSpending();
  loadDashboard();

  return false;
}

function deleteExpense(id) {
  const data = getData();

  data.spending = data.spending.filter(
    expense => String(expense.id) !== String(id)
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

  const total = data.spending.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
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
      (sum, expense) =>
        sum + Number(expense.amount),
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

function saveSettings(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const data = getData();

  const nameInput =
    document.getElementById("householdName");

  const currencyInput =
    document.getElementById("currency");

  if (!nameInput || !currencyInput) {
    return false;
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

  return false;
}

function resetData() {
  const confirmed = confirm(
    "Are you sure you want to delete all Household Manager data?"
  );

  if (!confirmed) return;

  localStorage.removeItem("householdManager");
  window.location.reload();
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
   FORM SUPPORT
========================= */

function setupForms() {
  const forms = [
    ["shoppingForm", addShoppingItem],
    ["dashboardShoppingForm", addDashboardShopping],
    ["taskForm", addTask],
    ["dashboardTaskForm", addDashboardTask],
    ["eventForm", addEvent],
    ["dashboardEventForm", addDashboardEvent],
    ["expenseForm", addExpense],
    ["dashboardExpenseForm", addDashboardExpense]
  ];

  forms.forEach(([id, handler]) => {
    const form = document.getElementById(id);

    if (!form) return;

    form.addEventListener("submit", event => {
      event.preventDefault();
      handler(event);
    });
  });
}

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
  setupForms();

  document.addEventListener("submit", event => {
    const form = event.target;

    if (!form) return;

    if (
      form.id === "shoppingForm" ||
      form.querySelector("#shoppingName")
    ) {
      event.preventDefault();

      if (form.id !== "shoppingForm") {
        addShoppingItem(event);
      }
    }
  });
});
