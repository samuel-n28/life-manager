// ── Data ──────────────────────────────────────────────────────────────────────
var tasks = [];
var habits = [];
var activeTab = "today";
var activeSection = "tasks";

// Returns a date string like "2026-05-05" for today + offset days
function dateString(offset) {
  var d = new Date();
  d.setDate(d.getDate() + (offset || 0));
  return d.toISOString().split("T")[0];
}

// ── Storage ───────────────────────────────────────────────────────────────────
function loadFromStorage() {
  var savedTasks = localStorage.getItem("foundation-tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    // Migrate old tasks that have no date — assign today's date
    var today = dateString(0);
    tasks.forEach(function (task) {
      if (!task.date) task.date = today;
    });
  }

  var savedHabits = localStorage.getItem("foundation-habits");
  if (savedHabits) {
    habits = JSON.parse(savedHabits);
    // Migrate old habits that used lastDone instead of doneHistory
    habits.forEach(function (habit) {
      if (!habit.doneHistory) {
        habit.doneHistory = habit.lastDone ? [habit.lastDone] : [];
        delete habit.lastDone;
      }
    });
  }
}

function saveToStorage() {
  localStorage.setItem("foundation-tasks", JSON.stringify(tasks));
  localStorage.setItem("foundation-habits", JSON.stringify(habits));
}

// ── Tasks: Rendering ──────────────────────────────────────────────────────────
var taskList = document.getElementById("taskList");

function renderTasks() {
  taskList.innerHTML = "";

  var filterDate = null;
  if (activeTab === "yesterday") filterDate = dateString(-1);
  if (activeTab === "today")     filterDate = dateString(0);
  if (activeTab === "tomorrow")  filterDate = dateString(1);

  var count = 0;

  tasks.forEach(function (task, index) {
    if (filterDate && task.date !== filterDate) return;
    count++;

    var li = document.createElement("li");
    if (task.done) li.classList.add("done");

    var checkBtn = document.createElement("button");
    checkBtn.className = "check-btn";
    checkBtn.textContent = task.done ? "✓" : "";
    checkBtn.setAttribute("aria-label", "Mark task complete");
    checkBtn.onclick = function () {
      tasks[index].done = !tasks[index].done;
      saveToStorage();
      renderTasks();
    };

    var span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;
    span.onclick = function () {
      tasks[index].done = !tasks[index].done;
      saveToStorage();
      renderTasks();
    };

    var deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.onclick = function () {
      tasks.splice(index, 1);
      saveToStorage();
      renderTasks();
    };

    li.appendChild(checkBtn);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  if (count === 0) {
    var empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent =
      activeTab === "yesterday" ? "Nothing from yesterday." :
      activeTab === "today"     ? "No tasks for today." :
      activeTab === "tomorrow"  ? "Nothing planned yet." :
                                  "No tasks yet.";
    taskList.appendChild(empty);
  }
}

// ── Tasks: Tab switching ───────────────────────────────────────────────────────
var dateSubtitle = document.getElementById("dateSubtitle");

function switchTab(tab) {
  activeTab = tab;

  document.querySelectorAll(".tab-btn").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });

  if (tab === "all") {
    dateSubtitle.textContent = "";
  } else {
    var offset = tab === "yesterday" ? -1 : tab === "tomorrow" ? 1 : 0;
    var d = new Date();
    d.setDate(d.getDate() + offset);
    dateSubtitle.textContent = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }

  renderTasks();
}

// ── Tasks: Adding ─────────────────────────────────────────────────────────────
var taskInput = document.getElementById("taskInput");
var addBtn = document.getElementById("addBtn");

function addTask() {
  var taskText = taskInput.value.trim();
  if (taskText === "") {
    alert("Please enter a task.");
    return;
  }

  var offset = activeTab === "yesterday" ? -1 : activeTab === "tomorrow" ? 1 : 0;
  tasks.push({ text: taskText, done: false, date: dateString(offset) });
  saveToStorage();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") addTask();
});

// ── Habits: Streak ────────────────────────────────────────────────────────────
function computeStreak(history) {
  if (history.length === 0) return 0;

  var historySet = {};
  history.forEach(function (d) { historySet[d] = true; });

  var today = dateString(0);
  var yesterday = dateString(-1);
  var cursor = historySet[today] ? today : historySet[yesterday] ? yesterday : null;
  if (!cursor) return 0;

  var streak = 0;
  while (historySet[cursor]) {
    streak++;
    var parts = cursor.split("-");
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2] - 1);
    cursor = d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  return streak;
}

// ── Habits: Rendering ─────────────────────────────────────────────────────────
var habitList = document.getElementById("habitList");

function renderHabits() {
  habitList.innerHTML = "";

  if (habits.length === 0) {
    var empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No habits yet. Add one above.";
    habitList.appendChild(empty);
    return;
  }

  var today = dateString(0);

  habits.forEach(function (habit, index) {
    var done = habit.doneHistory.indexOf(today) !== -1;
    var streak = computeStreak(habit.doneHistory);

    var li = document.createElement("li");
    if (done) li.classList.add("done");

    var checkBtn = document.createElement("button");
    checkBtn.className = "check-btn";
    checkBtn.textContent = done ? "✓" : "";
    checkBtn.setAttribute("aria-label", "Mark habit complete");
    checkBtn.onclick = function () {
      if (done) {
        habits[index].doneHistory = habits[index].doneHistory.filter(function (d) { return d !== today; });
      } else {
        habits[index].doneHistory.push(today);
      }
      saveToStorage();
      renderHabits();
    };

    var span = document.createElement("span");
    span.className = "task-text";
    span.textContent = habit.text;
    span.onclick = function () {
      if (done) {
        habits[index].doneHistory = habits[index].doneHistory.filter(function (d) { return d !== today; });
      } else {
        habits[index].doneHistory.push(today);
      }
      saveToStorage();
      renderHabits();
    };

    if (streak > 0) {
      var streakBadge = document.createElement("span");
      streakBadge.className = "streak-badge";
      streakBadge.textContent = streak + "d";
      li.appendChild(checkBtn);
      li.appendChild(span);
      li.appendChild(streakBadge);
    } else {
      li.appendChild(checkBtn);
      li.appendChild(span);
    }

    var deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", "Delete habit");
    deleteBtn.onclick = function () {
      habits.splice(index, 1);
      saveToStorage();
      renderHabits();
    };

    li.appendChild(deleteBtn);
    habitList.appendChild(li);
  });
}

// ── Habits: Adding ────────────────────────────────────────────────────────────
var habitInput = document.getElementById("habitInput");
var addHabitBtn = document.getElementById("addHabitBtn");

function addHabit() {
  var text = habitInput.value.trim();
  if (text === "") {
    alert("Please enter a habit.");
    return;
  }

  habits.push({ id: Date.now(), text: text, doneHistory: [] });
  saveToStorage();
  renderHabits();

  habitInput.value = "";
  habitInput.focus();
}

addHabitBtn.addEventListener("click", addHabit);
habitInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") addHabit();
});

// ── Section switching (bottom nav) ────────────────────────────────────────────
function switchSection(section) {
  activeSection = section;

  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.section === section);
  });

  document.getElementById("section-tasks").style.display  = section === "tasks"  ? "block" : "none";
  document.getElementById("section-habits").style.display = section === "habits" ? "block" : "none";

  if (section === "tasks") {
    switchTab(activeTab);
  } else if (section === "habits") {
    dateSubtitle.textContent = "";
    renderHabits();
  }
}

// ── Start up ───────────────────────────────────────────────────────────────────
loadFromStorage();
switchSection("tasks");
