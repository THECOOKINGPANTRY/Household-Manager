/* HOUSEHOLD MANAGER */

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

function getData() {
    const saved = localStorage.getItem("householdManager");

    if (!saved) {
        localStorage.setItem(
            "householdManager",
            JSON.stringify(defaultData)
        );

        return defaultData;
    }

    return JSON.parse(saved);
}

function saveData(data) {
    localStorage.setItem(
        "householdManager",
        JSON.stringify(data)
    );
}

function createId() {
    return Date.now().toString() + Math.random().toString(16);
}

/* NAVIGATION */

function setActiveNavigation() {
    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll("[data-page]").forEach(link => {
        if (link.getAttribute("data-page") === currentPage) {
            link.classList.add("active");
        }
    });
}

/* SETTINGS */

function updateHouseholdName() {
    const data = getData();

    document.querySelectorAll(".household-name").forEach(element => {
        element.textContent = data.settings.householdName;
    });
}

/* SHOPPING */

function addShoppingItem() {
    const name = document.getElementById("shoppingName").value.trim();
    const quantity = document.getElementById("shoppingQuantity").value.trim();
    const category = document.getElementById("shoppingCategory").value;

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

    document.getElementById("shoppingName").value = "";
    document.getElementById("shoppingQuantity").value = "";

    renderShopping();
}

function toggleShopping(id) {
    const data = getData();

    const item = data.shopping.find(item => item.id === id);

    if (item) {
        item.completed = !item.completed;
    }

    saveData(data);
    renderShopping();
}

function deleteShopping(id) {
    const data = getData();

    data.shopping = data.shopping.filter(
        item => item.id !== id
    );

    saveData(data);
    renderShopping();
}

function renderShopping() {
    const container = document.getElementById("shoppingList");

    if (!container) return;

    const data = getData();

    if (data.shopping.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <div class="empty-title">Your shopping list is empty</div>
                <div class="empty-text">
                    Add something you need to buy.
                </div>
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
                >

                <div>
                    <div class="data-name">${escapeHTML(item.name)}</div>

                    <div class="data-info">
                        ${escapeHTML(item.quantity)}
                        ·
                        ${escapeHTML(item.category)}
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

/* TASKS */

function addTask() {
    const name = document.getElementById("taskName").value.trim();
    const person = document.getElementById("taskPerson").value.trim();
    const due = document.getElementById("taskDue").value;
    const priority = document.getElementById("taskPriority").value;

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

    document.getElementById("taskName").value = "";
    document.getElementById("taskPerson").value = "";
    document.getElementById("taskDue").value = "";

    renderTasks();
}

function toggleTask(id) {
    const data = getData();

    const task = data.tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
    }

    saveData(data);
    renderTasks();
}

function deleteTask(id) {
    const data = getData();

    data.tasks = data.tasks.filter(
        task => task.id !== id
    );

    saveData(data);
    renderTasks();
}

function renderTasks() {
    const container = document.getElementById("taskList");

    if (!container) return;

    const data = getData();

    if (data.tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✓</div>
                <div class="empty-title">No tasks yet</div>
                <div class="empty-text">
                    Add your first household task.
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = data.tasks.map(task => `
        <div class="data-row ${task.completed ? "completed" : ""}">
            <div class="data-main">
                <input
                    class="check"
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask('${task.id}')"
                >

                <div>
                    <div class="data-name">
                        ${escapeHTML(task.name)}
                    </div>

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

/* EVENTS */

function addEvent() {
    const name = document.getElementById("eventName").value.trim();
    const date = document.getElementById("eventDate").value;
    const time = document.getElementById("eventTime").value;
    const location = document.getElementById("eventLocation").value.trim();

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

    document.getElementById("eventName").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventTime").value = "";
    document.getElementById("eventLocation").value = "";

    renderEvents();
}

function deleteEvent(id) {
    const data = getData();

    data.events = data.events.filter(
        event => event.id !== id
    );

    saveData(data);
    renderEvents();
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
                <div class="empty-text">
                    Add an event to your household calendar.
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => `
        <div class="data-row">
            <div class="data-main">
                <div>
                    <div class="data-name">
                        ${escapeHTML(event.name)}
                    </div>

                    <div class="data-info">
                        ${formatDate(event.date)}
                        ${event.time ? " · " + event.time : ""}
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

/* SPENDING */

function addExpense() {
    const name = document.getElementById("expenseName").value.trim();
    const amount = parseFloat(
        document.getElementById("expenseAmount").value
    );
    const category = document.getElementById("expenseCategory").value;
    const date = document.getElementById("expenseDate").value;

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

    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDate").value = "";

    renderSpending();
}

function deleteExpense(id) {
    const data = getData();

    data.spending = data.spending.filter(
        expense => expense.id !== id
    );

    saveData(data);
    renderSpending();
}

function renderSpending() {
    const container = document.getElementById("spendingList");

    if (!container) return;

    const data = getData();

    const total = data.spending.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const thisMonth = data.spending
        .filter(expense => {
            const date = new Date(expense.date);
            const now = new Date();

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
                <div class="empty-text">
                    Add your first household expense.
                </div>
            </div>
        `;
        return;
    }

    const expenses = [...data.spending].reverse();

    container.innerHTML = expenses.map(expense => `
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
                    onclick="deleteExpense('${expense.id}')"
                >
                    Delete
                </button>
            </div>
        </div>
    `).join("");
}

/* SETTINGS */

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

    const name = document
        .getElementById("householdName")
        .value
        .trim();

    const currency =
        document.getElementById("currency").value;

    data.settings.householdName =
        name || "My Household";

    data.settings.currency = currency;

    saveData(data);

    updateHouseholdName();

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

/* DASHBOARD */

function loadDashboard() {
    const data = getData();

    const taskCount =
        data.tasks.filter(task => !task.completed).length;

    const shoppingCount =
        data.shopping.filter(item => !item.completed).length;

    const eventCount = data.events.length;

    const spending = data.spending.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const taskElement = document.getElementById("dashboardTasks");
    const shoppingElement = document.getElementById("dashboardShopping");
    const eventElement = document.getElementById("dashboardEvents");
    const spendingElement = document.getElementById("dashboardSpending");

    if (taskElement) taskElement.textContent = taskCount;
    if (shoppingElement) shoppingElement.textContent = shoppingCount;
    if (eventElement) eventElement.textContent = eventCount;
    if (spendingElement) spendingElement.textContent = formatMoney(spending);

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

                    <span class="badge">
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

/* HELPERS */

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
    div.textContent = value;
    return div.innerHTML;
}

/* START */

document.addEventListener("DOMContentLoaded", () => {
    setActiveNavigation();
    updateHouseholdName();

    loadSettings();
    loadDashboard();

    renderShopping();
    renderTasks();
    renderEvents();
    renderSpending();
});
