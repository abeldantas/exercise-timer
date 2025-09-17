// Parameterizable exercise configuration
// You can easily modify this structure to change exercises, durations, or add new groups

const exerciseRoutine = [
    {
        group: "🦵 Hip Flexors",
        duration: 180, // 3 minutes exercise time
        exercises: [
            {
                name: "World's Greatest Stretch",
                duration: 60, // Full minute for deep stretch
                perSide: true
            },
            {
                name: "Couch Stretch (hip flexor)",
                duration: 30, // 30 seconds each side
                perSide: true
            }
        ]
    },
    {
        group: "💪 Shoulders",
        duration: 180, // 3 minutes exercise time
        exercises: [
            {
                name: "Thread the Needle (from all fours)",
                duration: 60, // Full minute for proper stretch
                perSide: true
            },
            {
                name: "Arm Circles (both directions)",
                duration: 30, // Combined forward and backward
                perSide: false
            },
            {
                name: "Prone Y-T-W Sequence",
                duration: 30, // All three positions in sequence
                perSide: false
            }
        ]
    },
    {
        group: "🌀 Thoracic Spine",
        duration: 180, // 3 minutes exercise time
        exercises: [
            {
                name: "Cat-Cow",
                duration: 60, // Full minute for spinal mobility
                perSide: false
            },
            {
                name: "Open Books (side lying)",
                duration: 30, // 30 seconds each side
                perSide: true
            },
            {
                name: "T-Spine Extensions on All Fours",
                duration: 60, // Full minute for thoracic extension
                perSide: false
            }
        ]
    }
];

// Configuration for buffer time between exercises
const BUFFER_TIME = 10; // seconds

// Function to flatten the exercise structure for sequential execution
function prepareExerciseQueue() {
    const queue = [];
    let isFirst = true;

    exerciseRoutine.forEach(group => {
        group.exercises.forEach(exercise => {
            if (exercise.perSide) {
                // Add exercise for left side
                if (!isFirst) {
                    // Add buffer before exercise
                    queue.push({
                        group: group.group,
                        name: "Get Ready",
                        duration: BUFFER_TIME,
                        side: "",
                        isBuffer: true,
                        nextExercise: `${exercise.name} - Left Side`,
                        originalIndex: queue.length
                    });
                }
                queue.push({
                    group: group.group,
                    name: exercise.name,
                    duration: exercise.duration,
                    side: "Left Side",
                    isBuffer: false,
                    originalIndex: queue.length
                });

                // Add buffer before right side
                queue.push({
                    group: group.group,
                    name: "Switch Sides",
                    duration: BUFFER_TIME,
                    side: "",
                    isBuffer: true,
                    nextExercise: `${exercise.name} - Right Side`,
                    originalIndex: queue.length
                });

                // Add exercise for right side
                queue.push({
                    group: group.group,
                    name: exercise.name,
                    duration: exercise.duration,
                    side: "Right Side",
                    isBuffer: false,
                    originalIndex: queue.length
                });
            } else {
                // Add buffer before exercise (unless it's the first)
                if (!isFirst) {
                    queue.push({
                        group: group.group,
                        name: "Get Ready",
                        duration: BUFFER_TIME,
                        side: "",
                        isBuffer: true,
                        nextExercise: exercise.name,
                        originalIndex: queue.length
                    });
                }

                // Add exercise without sides
                queue.push({
                    group: group.group,
                    name: exercise.name,
                    duration: exercise.duration,
                    side: "",
                    isBuffer: false,
                    originalIndex: queue.length
                });
            }
            isFirst = false;
        });
    });

    return queue;
}

// Calculate total routine duration (including buffers)
function calculateTotalDuration() {
    const queue = prepareExerciseQueue();
    return queue.reduce((total, item) => total + item.duration, 0);
}