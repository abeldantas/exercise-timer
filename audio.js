// Audio feedback system using Web Audio API
class AudioFeedback {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        // Initialize audio context on first user interaction
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Resume audio context if suspended (required for some browsers)
    async ensureAudioContext() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Generate a beep sound
    async beep(frequency = 440, duration = 200, volume = 0.3) {
        await this.ensureAudioContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    // Countdown beep (higher pitch for urgency)
    async countdownBeep() {
        await this.beep(600, 150, 0.4);
    }

    // Final countdown beep (even higher pitch)
    async finalCountdownBeep() {
        await this.beep(800, 150, 0.5);
    }

    // Completion sound (multiple beeps)
    async completionSound() {
        for (let i = 0; i < 3; i++) {
            await this.beep(1000, 120, 0.5);
            await this.sleep(150);
        }
    }

    // Exercise start sound (pleasant chime)
    async exerciseStartSound() {
        // Play two quick ascending tones
        await this.beep(523, 100, 0.3); // C5
        await this.sleep(50);
        await this.beep(659, 150, 0.3); // E5
    }

    // Buffer/transition sound (gentle notification)
    async transitionSound() {
        // Play a gentle two-tone chime
        await this.beep(392, 200, 0.2); // G4
        await this.sleep(100);
        await this.beep(523, 200, 0.2); // C5
    }

    // Helper function for delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global audio instance
const audio = new AudioFeedback();