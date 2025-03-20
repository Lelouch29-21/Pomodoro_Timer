// Variables
let timerDuration = 1500; // Default Pomodoro duration (25 minutes)
let isWorking = true; // Work mode or break mode
let timerInterval = null; // Timer interval reference
let history = []; // Array to store completed tasks
let totalTimeUsed = 0; // Total time used in minutes
let dailyLogs = []; // Array to store logs for the current day
let startTime; // Variable to store the start time of the timer
let chart; // Reference to the Chart.js instance

// DOM Elements
const timerDisplay = document.getElementById("timer-display");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const resetButton = document.getElementById("reset-button");
const logButton = document.getElementById("log-button");
const taskInput = document.getElementById("task-input");
const historyChartCanvas = document.getElementById("historyChart");
const totalTimeDisplay = document.getElementById("total-time");
const logList = document.getElementById("log-list");

// Update Timer Duration based on user input
timerDisplay.addEventListener("blur", () => {
    const inputValue = timerDisplay.innerText.trim();
    const [minutes, seconds] = inputValue.split(':').map(Number);
    timerDuration = (minutes * 60) + (seconds || 0); // Convert minutes and seconds to total seconds
});

// Start Timer Functionality
startButton.addEventListener("click", () => {
    if (timerInterval) return; // Prevent multiple intervals
    startTimer();
});

function startTimer() {
    startTime = Date.now(); // Record the start time of the timer

    timerInterval = setInterval(() => {
        if (timerDuration <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            alert(isWorking ? "Time for a break!" : "Back to work!");
            const activeDurationSeconds = Math.floor((Date.now() - startTime) / 1000); // Calculate active duration in seconds

            totalTimeUsed += activeDurationSeconds / 60; // Add time to total in minutes
            updateTotalTimeDisplay();
            isWorking = !isWorking; // Toggle between work and break mode
            timerDuration = isWorking ? parseInt(timerDisplay.innerText.split(':')[0]) * 60 : (5 * 60); // Reset timer duration for break to default of 5 minutes
            updateDisplay(timerDuration);
        } else {
            timerDuration--;
            updateDisplay(timerDuration);
        }
    }, 1000);
}

// Stop Timer Functionality
stopButton.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null; // Reset interval reference
});

// Reset Timer Functionality
resetButton.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null; // Reset interval reference
    totalTimeUsed = 0; // Reset total time used
    dailyLogs = []; // Clear daily logs
    updateTotalTimeDisplay(); // Update total time display
    logList.innerHTML = ""; // Clear log list

    if (chart) {
        chart.destroy(); // Clear the chart instance if it exists
        initializeChart(); // Reinitialize an empty chart
    }

    timerDuration = 1500; // Reset to default duration of 25 minutes
    updateDisplay(timerDuration); // Update displayed timer value
});

// Update Timer Display
function updateDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerDisplay.innerText = `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

// Log Task Functionality
logButton.addEventListener("click", () => {
    const taskName = taskInput.value.trim();

    if (!taskName) {
        alert("Please enter a task name!");
        return;
    }

    const activeDurationSeconds = Math.floor((Date.now() - startTime) / 1000); // Calculate active duration in seconds

    let activeDurationFormatted;

    if (activeDurationSeconds >= 60) {
        const minutesSpent = Math.floor(activeDurationSeconds / 60);
        const remainingSecondsSpent = activeDurationSeconds % 60;

        activeDurationFormatted =
            `${minutesSpent} minute${minutesSpent > 1 ? 's' : ''} ${
                remainingSecondsSpent > 0 ? `${remainingSecondsSpent} second${remainingSecondsSpent > 1 ? 's' : ''}` : ''
            }`.trim();
    } else {
        activeDurationFormatted =
            `${activeDurationSeconds} second${activeDurationSeconds > 1 ? 's' : ''}`;
    }

    const logEntry = {
        taskName,
        durationMinutes: activeDurationSeconds / 60,
        durationSeconds: activeDurationSeconds,
        dateTime: new Date().toLocaleTimeString(),
        activeDuration: activeDurationFormatted, // Log active duration based on work or break state
    };

    dailyLogs.push(logEntry); // Add to daily logs

    taskInput.value = ""; // Clear input field

    updateLogList(); // Update daily logs list
    updateChart(); // Update chart with new data dynamically
});

// Update Daily Logs List
function updateLogList() {
    logList.innerHTML = ""; // Clear existing logs

    dailyLogs.forEach(log => {
        const logItem = document.createElement("li");
        logItem.innerText =
            `${log.dateTime}: ${log.taskName} (Active Time: ${log.activeDuration})`;
        logList.appendChild(logItem);
    });
}

// Update Total Time Display
function updateTotalTimeDisplay() {
    totalTimeDisplay.innerText =
        `Total Time Used: ${Math.floor(totalTimeUsed)} minute${totalTimeUsed > 1 ? 's' : ''}`;
}

// Initialize Chart Functionality (Line Graph)
function initializeChart() {
    const ctx = historyChartCanvas.getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [], // Empty labels initially
            datasets: [{
                label: "Pomodoros Duration (Seconds)",
                data: [], // Empty data initially
                backgroundColor: "rgba(230,57,70,0.2)", // Thematic red (transparent)
                borderColor: "rgba(230,57,70,1)",
                borderWidth: 2,
                tension: 0.4, // Smooth line curve
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Update Chart Dynamically with New Logs
function updateChart() {
    if (!chart) initializeChart(); // Initialize chart if it doesn't exist

    const labels = dailyLogs.map(entry => entry.dateTime); // Use timestamps as labels for today’s logs only.
    const data = dailyLogs.map(entry => entry.durationSeconds); // Use duration in seconds for each log.

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    
    chart.update(); // Dynamically update the chart with new data.
}

// Initialize Timer Display and Chart with Default Value (25 minutes)
updateDisplay(timerDuration);
updateTotalTimeDisplay();
initializeChart(); // Initialize an empty chart on page load.
