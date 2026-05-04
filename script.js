// Get references to the HTML elements we need
var taskInput = document.getElementById("taskInput");
var addBtn = document.getElementById("addBtn");
var taskList = document.getElementById("taskList");

// This function runs when the user clicks "Add Task"
function addTask() {
  var taskText = taskInput.value.trim(); // Remove extra spaces

  if (taskText === "") {
    alert("Please enter a task.");
    return; // Stop here if the input is empty
  }

  // Create a new list item
  var li = document.createElement("li");

  // Create a span to hold the task text
  var span = document.createElement("span");
  span.textContent = taskText;

  // Create a delete button for this task
  var deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✕";
  deleteBtn.className = "delete-btn";
  deleteBtn.onclick = function () {
    taskList.removeChild(li); // Remove the task when clicked
  };

  // Put the text and button inside the list item
  li.appendChild(span);
  li.appendChild(deleteBtn);

  // Add the list item to the task list on the page
  taskList.appendChild(li);

  // Clear the input box so the user can type a new task
  taskInput.value = "";
  taskInput.focus();
}

// Run addTask when the button is clicked
addBtn.addEventListener("click", addTask);

// Also run addTask when the user presses Enter in the input box
taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});
