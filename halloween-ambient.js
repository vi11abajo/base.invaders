//HALLOWEEN AMBIENT SOUNDS MANAGER
//withtheme with ambient soundin for Halloween

class HalloweenAmbientManager {
    constructor() {
        this.enabled = false;
        this.isPlaying = false;
        this.currentAudio = null;
        this.nextTimeout = null;
        this.currentTheme = null;

        //withto inwith ambient soundin
        this.ambientSounds = [
            'random1.m4a',
            'random2.m4a',
            'random3.m4a',
            'Random5.m4a',
            'random6.m4a',
            'random8.m4a',
            'random10.m4a',
            'random11.m4a',
            'random12.m4a',
            'random13.m4a',
            'random14.m4a'
        ];

        //sound start game
        this.startSound = 'START.m4a';

        //and inwithfromin soundin ( NOT inwith with)
        this.recentSounds = [];
        this.maxRecentSounds = 3;

        //settings intervalin (in withtoyes)
        this.minInterval = 15;
        this.maxInterval = 45;

        //volume ambient soundin
        this.volume = 0.4;

        this.init();
    }

    init() {
        //fromwithandin with
        window.addEventListener('themeChanged', () => {
            this.checkTheme();
        });

        //Checking at initialization
        setTimeout(() => this.checkTheme(), 500);
    }

    //inand to
    checkTheme() {
        if (!window.themeManager) return;

        const newTheme = window.themeManager.getCurrentTheme();

        //if theme fromandwith
        if (newTheme !== this.currentTheme) {
            this.currentTheme = newTheme;

            if (newTheme === 'halloween') {
                this.start();
            } else {
                this.stop();
            }
        }
    }

    //Start with ambient soundin
    start() {
        if (this.enabled) return;

        this.enabled = true;
        this.scheduleNextSound();
    }

    //Stop with ambient soundin
    stop() {
        if (!this.enabled) return;

        this.enabled = false;

        //Clearing
        if (this.nextTimeout) {
            clearTimeout(this.nextTimeout);
            this.nextTimeout = null;
        }

        //Stopping current sound
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        this.isPlaying = false;
    }

    //andin next ambient sound
    scheduleNextSound() {
        if (!this.enabled) return;

        //withon to minInterval and maxInterval withtoyesand
        const delay = (this.minInterval + Math.random() * (this.maxInterval - this.minInterval)) * 1000;

        this.nextTimeout = setTimeout(() => {
            this.playRandomAmbient();
        }, delay);
    }

    //inwithfrominwithand with ambient sound
    playRandomAmbient() {
        if (!this.enabled || this.isPlaying) return;

        //inand with sound, from NOTyesinbut game
        const availableSounds = this.ambientSounds.filter(
            sound => !this.recentSounds.includes(sound)
        );

        //if inwith soundand were NOTyesinbut, Clearing and
        const soundsToChooseFrom = availableSounds.length > 0 ? availableSounds : this.ambientSounds;

        const randomSound = soundsToChooseFrom[Math.floor(Math.random() * soundsToChooseFrom.length)];

        this.playAmbientSound(randomSound);

        //Adding in and
        this.recentSounds.push(randomSound);
        if (this.recentSounds.length > this.maxRecentSounds) {
            this.recentSounds.shift();
        }
    }

    //inwithfrominwithand toto ambient sound
    playAmbientSound(soundName) {
        const path = this.getAmbientPath(soundName);

        this.isPlaying = true;
        this.currentAudio = new Audio(path);
        this.currentAudio.volume = this.volume;

        this.currentAudio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.currentAudio = null;
            //and next sound
            this.scheduleNextSound();
        });

        this.currentAudio.addEventListener('error', (e) => {
            console.error(` Error playing ambient sound ${soundName}:`, e);
            this.isPlaying = false;
            this.currentAudio = null;
            //inwith inbut and next
            this.scheduleNextSound();
        });

        this.currentAudio.play().catch(err => {
            console.error(' Failed to play ambient sound:', err);
            this.isPlaying = false;
            this.currentAudio = null;
            this.scheduleNextSound();
        });
    }

    //inwithfrominwithand sound START.mp3 at on game
    playStartSound() {
        //Checking, theme Halloween
        if (!this.enabled || this.currentTheme !== 'halloween') return;

        const path = this.getAmbientPath(this.startSound);
        const audio = new Audio(path);
        audio.volume = this.volume * 1.2; //

        audio.play().catch(err => {
            console.error('Failed to play START sound:', err);
        });
    }

    //Get path to ambient sound
    getAmbientPath(soundName) {
        //in path in inandwithand from withand
        const currentPath = window.location.pathname;
        let basePath = 'themes/halloween/sounds/ambient';

        //if in to (onat, tournament/)
        if (currentPath.includes('/tournament/') || currentPath.includes('\\tournament\\')) {
            basePath = '../themes/halloween/sounds/ambient';
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

    //Set interval (in withtoyes)
    setIntervals(min, max) {
        this.minInterval = min;
        this.maxInterval = max;
    }
}

//Creating global instance
if (!window.halloweenAmbient) {
    window.halloweenAmbient = new HalloweenAmbientManager();
}
