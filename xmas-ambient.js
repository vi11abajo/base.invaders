//XMAS AMBIENT SOUNDS MANAGER
//Manages ambient sounds for Xmas theme

class XmasAmbientManager {
    constructor() {
        this.enabled = false;
        this.isPlaying = false;
        this.currentAudio = null;
        this.nextTimeout = null;
        this.currentTheme = null;

        //List of ambient sounds
        this.ambientSounds = [
            'bells1.mp3',
            'bells2.mp3',
            'chimes.mp3',
            'curanty.mp3',
            'curanty2.mp3',
            'hohoho.mp3',
            'hohoho1.mp3',
            'hohoho2.mp3',
            'hohoho3.mp3',
            'twinkle.mp3',
            'whoosh.mp3'
        ];

        //Prevent recent sounds from repeating
        this.recentSounds = [];
        this.maxRecentSounds = 3;

        //Interval settings (in seconds)
        this.minInterval = 15;
        this.maxInterval = 45;

        //Volume for ambient sounds
        this.volume = 0.35;

        this.init();
    }

    init() {
        //Listen for theme changes
        window.addEventListener('themeChanged', () => {
            this.checkTheme();
        });

        //Check theme at initialization
        setTimeout(() => this.checkTheme(), 500);
    }

    //Check current theme
    checkTheme() {
        if (!window.themeManager) return;

        const newTheme = window.themeManager.getCurrentTheme();

        //If theme changed
        if (newTheme !== this.currentTheme) {
            this.currentTheme = newTheme;

            if (newTheme === 'xmas') {
                this.start();
            } else {
                this.stop();
            }
        }
    }

    //Start playing ambient sounds
    start() {
        if (this.enabled) return;

        this.enabled = true;
        this.scheduleNextSound();
    }

    //Stop playing ambient sounds
    stop() {
        if (!this.enabled) return;

        this.enabled = false;

        //Clear timeout
        if (this.nextTimeout) {
            clearTimeout(this.nextTimeout);
            this.nextTimeout = null;
        }

        //Stop current sound
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        this.isPlaying = false;
    }

    //Schedule next ambient sound
    scheduleNextSound() {
        if (!this.enabled) return;

        //Random delay between minInterval and maxInterval (in milliseconds)
        const delay = (this.minInterval + Math.random() * (this.maxInterval - this.minInterval)) * 1000;

        this.nextTimeout = setTimeout(() => {
            this.playRandomAmbient();
        }, delay);
    }

    //Play random ambient sound
    playRandomAmbient() {
        if (!this.enabled || this.isPlaying) return;

        //Get sounds that weren't played recently
        const availableSounds = this.ambientSounds.filter(
            sound => !this.recentSounds.includes(sound)
        );

        //If all sounds were recently played, clear the recent list
        const soundsToChooseFrom = availableSounds.length > 0 ? availableSounds : this.ambientSounds;

        const randomSound = soundsToChooseFrom[Math.floor(Math.random() * soundsToChooseFrom.length)];

        this.playAmbientSound(randomSound);

        //Add to recent sounds
        this.recentSounds.push(randomSound);
        if (this.recentSounds.length > this.maxRecentSounds) {
            this.recentSounds.shift();
        }
    }

    //Play specific ambient sound
    playAmbientSound(soundName) {
        const path = this.getAmbientPath(soundName);

        this.isPlaying = true;
        this.currentAudio = new Audio(path);
        this.currentAudio.volume = this.volume;

        this.currentAudio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.currentAudio = null;
            //Schedule next sound
            this.scheduleNextSound();
        });

        this.currentAudio.addEventListener('error', (e) => {
            console.error(`❌ Error playing xmas ambient sound ${soundName}:`, e);
            this.isPlaying = false;
            this.currentAudio = null;
            //Schedule next sound even on error
            this.scheduleNextSound();
        });

        this.currentAudio.play().catch(err => {
            console.error('❌ Failed to play xmas ambient sound:', err);
            this.isPlaying = false;
            this.currentAudio = null;
            this.scheduleNextSound();
        });
    }

    //Get path to ambient sound
    getAmbientPath(soundName) {
        //Detect base path depending on current location
        const currentPath = window.location.pathname;
        let basePath = 'themes/xmas/sounds/sfx/ambient';

        //If in subfolder (e.g., tournament/)
        if (currentPath.includes('/tournament/') || currentPath.includes('\\tournament\\')) {
            basePath = '../themes/xmas/sounds/sfx/ambient';
        }
        if (currentPath.includes('/coraluna/') || currentPath.includes('\\coraluna\\')) {
            basePath = '../themes/xmas/sounds/sfx/ambient';
        }
        if (currentPath.includes('/xmas/') || currentPath.includes('\\xmas\\')) {
            basePath = '../themes/xmas/sounds/sfx/ambient';
        }

        return `${basePath}/${soundName}`;
    }

    //Set volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = this.volume;
        }
    }

    //Set interval (in seconds)
    setIntervals(min, max) {
        this.minInterval = min;
        this.maxInterval = max;
    }
}

//Create global instance
if (!window.xmasAmbient) {
    window.xmasAmbient = new XmasAmbientManager();
}
