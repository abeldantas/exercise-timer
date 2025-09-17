// Timer application logic
let exerciseQueue = [];
let currentExerciseIndex = 0;
let currentTime = 0;
let totalTime = 0;
let intervalId = null;
let isPaused = false;
let lastBeepSecond = -1; // Track last second we beeped to avoid duplicates

// DOM elements
const timerDisplay = document.getElementById('timerDisplay');
const exerciseName = document.getElementById('exerciseName');
const groupName = document.getElementById('groupName');
const sideIndicator = document.getElementById('sideIndicator');
const progressFill = document.getElementById('progressFill');
const currentExerciseSpan = document.getElementById('currentExercise');
const totalExercisesSpan = document.getElementById('totalExercises');
const upcomingExercise = document.getElementById('upcomingExercise');
const exerciseList = document.getElementById('exerciseList');
const totalTimeSpan = document.getElementById('totalTime');

// Buttons
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');

// Initialize
function init() {
    exerciseQueue = prepareExerciseQueue();
    totalTime = calculateTotalDuration();
    totalExercisesSpan.textContent = exerciseQueue.length;
    totalTimeSpan.textContent = formatTime(totalTime);
    displayExerciseList();
    loadExercise(0);
}

// Format time for display
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Load exercise at given index
function loadExercise(index) {
    if (index >= exerciseQueue.length) {
        completeRoutine();
        return;
    }

    currentExerciseIndex = index;
    const exercise = exerciseQueue[index];
    lastBeepSecond = -1; // Reset beep tracker for new exercise

    // Update display based on buffer or exercise
    if (exercise.isBuffer) {
        exerciseName.textContent = exercise.name;
        groupName.textContent = exercise.group;
        sideIndicator.textContent = `Next: ${exercise.nextExercise}`;
        // Change background for buffers
        document.querySelector('.current-exercise').style.background = 'linear-gradient(135deg, #ffa500 0%, #ff6b6b 100%)';
    } else {
        exerciseName.textContent = exercise.name;
        groupName.textContent = exercise.group;
        sideIndicator.textContent = exercise.side || '';
        // Restore normal background for exercises
        document.querySelector('.current-exercise').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    currentTime = exercise.duration;
    timerDisplay.textContent = formatTime(currentTime);
    currentExerciseSpan.textContent = index + 1;

    // Update upcoming exercise
    if (index + 1 < exerciseQueue.length) {
        const next = exerciseQueue[index + 1];
        if (next.isBuffer) {
            upcomingExercise.textContent = `Buffer, then: ${next.nextExercise || 'Next exercise'}`;
        } else {
            upcomingExercise.textContent = `${next.name}${next.side ? ` - ${next.side}` : ''}`;
        }
    } else {
        upcomingExercise.textContent = 'Last exercise!';
    }

    // Update progress bar
    const completedTime = exerciseQueue.slice(0, index).reduce((sum, ex) => sum + ex.duration, 0);
    progressFill.style.width = `${(completedTime / totalTime) * 100}%`;

    // Update exercise list highlighting
    updateExerciseListHighlight();
}

// Display exercise list in sidebar
function displayExerciseList() {
    exerciseList.innerHTML = '';

    let currentGroup = '';
    let groupDiv = null;

    exerciseQueue.forEach((exercise, index) => {
        // Skip buffers in the list display
        if (exercise.isBuffer) {
            return;
        }

        if (exercise.group !== currentGroup) {
            currentGroup = exercise.group;
            groupDiv = document.createElement('div');
            groupDiv.className = 'exercise-group';

            const header = document.createElement('div');
            header.className = 'exercise-group-header';
            header.textContent = currentGroup;
            groupDiv.appendChild(header);

            exerciseList.appendChild(groupDiv);
        }

        const item = document.createElement('div');
        item.className = 'exercise-item';
        item.id = `exercise-item-${index}`;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = exercise.name + (exercise.side ? ` (${exercise.side})` : '');

        const durationSpan = document.createElement('span');
        durationSpan.className = 'exercise-duration';
        durationSpan.textContent = formatTime(exercise.duration);

        item.appendChild(nameSpan);
        item.appendChild(durationSpan);
        groupDiv.appendChild(item);
    });
}

// Update exercise list highlighting
function updateExerciseListHighlight() {
    document.querySelectorAll('.exercise-item').forEach((item, index) => {
        item.classList.remove('active', 'completed');
        if (index === currentExerciseIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (index < currentExerciseIndex) {
            item.classList.add('completed');
        }
    });
}

// Start timer
async function startTimer() {
    if (intervalId) return;

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    skipBtn.disabled = false;
    isPaused = false;

    // Play start sound if starting a real exercise (not buffer)
    const currentExercise = exerciseQueue[currentExerciseIndex];
    if (!currentExercise.isBuffer && currentTime === currentExercise.duration) {
        await audio.exerciseStartSound();
    }

    intervalId = setInterval(async () => {
        currentTime--;
        timerDisplay.textContent = formatTime(currentTime);

        // Update overall progress
        const completedTime = exerciseQueue.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + ex.duration, 0);
        const currentProgress = completedTime + (exerciseQueue[currentExerciseIndex].duration - currentTime);
        progressFill.style.width = `${(currentProgress / totalTime) * 100}%`;

        // Audio feedback for countdown
        if (!exerciseQueue[currentExerciseIndex].isBuffer) {
            if (currentTime === 3 && lastBeepSecond !== 3) {
                await audio.countdownBeep();
                lastBeepSecond = 3;
            } else if (currentTime === 2 && lastBeepSecond !== 2) {
                await audio.countdownBeep();
                lastBeepSecond = 2;
            } else if (currentTime === 1 && lastBeepSecond !== 1) {
                await audio.finalCountdownBeep();
                lastBeepSecond = 1;
            }
        }

        if (currentTime <= 0) {
            // Play completion sound and move to next
            if (!exerciseQueue[currentExerciseIndex].isBuffer) {
                await audio.completionSound();
            } else {
                await audio.transitionSound();
            }
            nextExercise();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!intervalId) return;

    clearInterval(intervalId);
    intervalId = null;
    isPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Reset everything
function resetTimer() {
    clearInterval(intervalId);
    intervalId = null;
    isPaused = false;
    currentExerciseIndex = 0;

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    skipBtn.disabled = true;

    init();
}

// Skip to next exercise
function nextExercise() {
    clearInterval(intervalId);
    intervalId = null;

    if (currentExerciseIndex + 1 < exerciseQueue.length) {
        loadExercise(currentExerciseIndex + 1);
        if (!isPaused) {
            startTimer();
        }
    } else {
        completeRoutine();
    }
}

// Complete routine
function completeRoutine() {
    clearInterval(intervalId);
    intervalId = null;

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    skipBtn.disabled = true;

    exerciseName.textContent = 'Routine Complete!';
    groupName.textContent = 'Great job!';
    sideIndicator.textContent = '';
    timerDisplay.textContent = '0:00';
    upcomingExercise.textContent = 'You\'ve completed all exercises!';
    progressFill.style.width = '100%';

    // Mark all exercises as completed
    document.querySelectorAll('.exercise-item').forEach(item => {
        item.classList.remove('active');
        item.classList.add('completed');
    });
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click', nextExercise);

// Initialize on load
document.addEventListener('DOMContentLoaded', init);