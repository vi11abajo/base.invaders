//PHAROS INVADERS - XMAS EASTER EGG FOR TOURNAMENT LOBBY
//Random Christmas decorations appearances on tournament lobby screen

class XmasBossEasterEgg {
    constructor() {
        this.isActive = false;
        this.decorContainer = null;
        this.blackHole = null;
        this.nextAppearanceTimeout = null;
        this.currentDecorColor = null; //Current decoration color

        //Boss configuration (from boss-system)
        //Array is filled dynamically at start() considering ThemeManager
        this.bossImages = [];
        //DO NOT call initBossImages() here - ThemeManager may not be ready
        //Initialization will happen in start()

        this.bossNames = [
            'Emerald Warlord',
            'Azure Leviathan',
            'Solar Kraken',
            'Crimson Behemoth',
            'Void Sovereign'
        ];

        this.bossColors = [
            '#33cc66', //Emerald Warlord - green
            '#3366ff', //Azure Leviathan - blue
            '#ffdd33', //Solar Kraken - yellow
            '#ff3333', //Crimson Behemoth - red
            '#9966ff'  //Void Sovereign - violet
        ];

        //Boss dimensions (as in game)
        this.bossWidth = 200;
        this.bossHeight = 160;

        //Durations (new sequence)
        this.BLACK_HOLE_APPEAR_TIME = 1500; //1.5 sec - hole appearance
        this.BOSS_EXIT_TIME = 1000; //1 sec - boss exit from hole
        this.PAUSE_WITH_HOLE_TIME = 1500; //1.5 sec - boss stands, hole disappears
        this.FLIGHT_DURATION = 6000; //6 sec - flight across screen
        this.PAUSE_BEFORE_EXIT_TIME = 1500; //1.5 sec - boss stands before disappearing
        this.BOSS_ENTER_TIME = 1000; //1 sec - boss enters hole
        this.BLACK_HOLE_DISAPPEAR_TIME = 1500; //1.5 sec - hole disappearance

        this.MIN_INTERVAL = 10000; //10 seconds
        this.MAX_INTERVAL = 40000; //40 seconds

        //Black hole sound - determine path via ThemeManager
        this.holeSound = null;
        //DO NOT call initHoleSound() here - ThemeManager may not be ready
        //Initialization will happen in start()
    }

    //Initialize boss images via ThemeManager
    initBossImages() {
        const bossKeys = ['crabBOSSGreen', 'crabBossBlue', 'crabBossYellow', 'crabBossRed', 'crabBossViolet'];

        //Get current theme
        const currentTheme = window.themeManager ? window.themeManager.getCurrentTheme() : 'xmas';

        //Determine base path (relative for tournament page)
        const basePath = window.location.pathname.includes('/tournament/') ? '..' : '';

        //Determine mobile device for format selection
        //Desktop → .gif (animation), Mobile → .png (performance)
        const isMobile = this.isMobileDevice();
        const imageFormat = isMobile ? 'png' : 'gif';

        //Build paths directly with current theme and correct format
        this.bossImages = bossKeys.map(key => `${basePath}/themes/${currentTheme}/images/${key}.${imageFormat}`);
    }

    //Detect mobile device
    isMobileDevice() {
        //Check by userAgent
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

        //Check by screen width (MOBILE_BREAKPOINT from config)
        const isMobileWidth = window.innerWidth < 768;

        //Consider device mobile if any condition is true
        return isMobileUA || isMobileWidth;
    }

    //Initialize black hole sound
    initHoleSound() {
        //Determine iOS for format selection
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const soundExt = isIOS ? 'm4a' : 'mp3';

        //Get current theme
        const currentTheme = window.themeManager ? window.themeManager.getCurrentTheme() : 'xmas';
        const iosFolder = isIOS ? '/ios' : '';

        //Determine base path (relative for tournament page)
        const basePath = window.location.pathname.includes('/tournament/') ? '..' : '';

        //Build path directly with current theme
        const soundPath = `${basePath}/themes/${currentTheme}/sounds${iosFolder}/sfx/ui/hole.${soundExt}`;
        this.holeSound = new Audio(soundPath);
        this.holeSound.volume = 0.5;
    }

    //Start system
    start() {
        if (this.isActive) return;

        //IMPORTANT: Initialize images and sounds HERE when ThemeManager is definitely ready
        this.initBossImages();
        this.initHoleSound();

        this.isActive = true;
        this.scheduleNextAppearance();
    }

    //Stop system
    stop() {
        this.isActive = false;

        if (this.nextAppearanceTimeout) {
            clearTimeout(this.nextAppearanceTimeout);
            this.nextAppearanceTimeout = null;
        }

        this.cleanup();
    }

    //Force stop current animation
    forceStop() {
        //Stop sound
        this.fadeOutSound(300);

        //Instantly remove all elements
        if (this.bossContainer && this.bossContainer.parentNode) {
            this.bossContainer.style.transition = 'opacity 0.3s ease-out';
            this.bossContainer.style.opacity = '0';
            setTimeout(() => {
                if (this.bossContainer && this.bossContainer.parentNode) {
                    this.bossContainer.remove();
                    this.bossContainer = null;
                }
            }, 300);
        }

        if (this.blackHole && this.blackHole.parentNode) {
            this.blackHole.style.transition = 'opacity 0.3s ease-out';
            this.blackHole.style.opacity = '0';
            setTimeout(() => {
                if (this.blackHole && this.blackHole.parentNode) {
                    this.blackHole.remove();
                    this.blackHole = null;
                }
            }, 300);
        }

        this.currentBossColor = null;
    }

    //Schedule next appearance
    scheduleNextAppearance() {
        if (!this.isActive) return;

        const delay = this.MIN_INTERVAL + Math.random() * (this.MAX_INTERVAL - this.MIN_INTERVAL);

        this.nextAppearanceTimeout = setTimeout(() => {
            this.triggerBossAppearance();
        }, delay);
    }

    //Check if game is running
    isGameActive() {
        //Check for game modal window and active class
        const gameModal = document.querySelector('.game-modal');
        if (gameModal && gameModal.classList.contains('active')) {
            return true;
        }
        //Additional check via inline style
        if (gameModal && gameModal.style.display === 'flex') {
            return true;
        }
        return false;
    }

    //Trigger boss appearance (new sequence)
    async triggerBossAppearance() {
        if (!this.isActive) return;

        //Prevent appearance if game is running
        if (this.isGameActive()) {
            this.scheduleNextAppearance();
            return;
        }

        //Select random boss
        const bossIndex = Math.floor(Math.random() * this.bossImages.length);
        const bossImage = this.bossImages[bossIndex];
        const bossName = this.bossNames[bossIndex];
        const bossColor = this.bossColors[bossIndex];

        //Save current boss color
        this.currentBossColor = bossColor;

        //Create starting position (random at screen edges)
        const startPos = this.getRandomEdgePosition();

        //STEP 1: Black hole appearance - 1.5 seconds (with boss color)
        await this.createBlackHoleEntrance(startPos.x, startPos.y, bossColor);

        //STEP 2: Boss exits hole horizontally - 1 second
        const exitDirection = startPos.edge === 'left' ? 1 : (startPos.edge === 'right' ? -1 : (Math.random() > 0.5 ? 1 : -1));
        const exitOffset = 150; //Exit distance
        const pauseX = startPos.x + exitDirection * exitOffset;

        //Create boss inside hole (scale 0)
        this.createBoss(bossImage, bossName, startPos.x, startPos.y);

        //Exit from hole (with scaling from center)
        await this.animateBossExit(pauseX, startPos.y, startPos.x, startPos.y);

        //STEP 3: Boss stands next to hole 1.5 sec, hole smoothly disappears
        await this.pauseAndFadeHole();

        //STEP 4: Flight across screen - 6 seconds
        const endPos = this.getRandomPosition();
        await this.flyToPosition(endPos);

        //STEP 5: Pause before disappearing - 1.5 seconds
        await this.pause(this.PAUSE_BEFORE_EXIT_TIME);

        //STEP 6-8: Disappearance into black hole
        await this.triggerBossDisappearance();
    }

    //Create black hole (vortex) for entrance - appears 1.5 sec and stays
    createBlackHoleEntrance(x, y, bossColor) {
        return new Promise((resolve) => {
            this.blackHole = document.createElement('div');
            //Convert hex color to rgba for glow
            const rgb = this.hexToRgb(bossColor);

            this.blackHole.style.cssText = `
                position: fixed;
                left: ${x - 75}px;
                top: ${y - 75}px;
                width: 150px;
                height: 150px;
                background: radial-gradient(circle, black 0%, black 70%, rgba(0, 0, 0, 0.9) 100%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: blackHoleSpinEntrance 1.5s ease-out;
                box-shadow:
                    0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9),
                    0 0 80px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7),
                    0 0 120px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5),
                    inset 0 0 30px rgba(0, 0, 0, 0.8);
            `;

            //Add CSS animation if not present
            this.addBlackHoleStyles();

            document.body.appendChild(this.blackHole);

            //Play black hole sound
            this.playHoleSound();

            //Hole stays, resolve promise after appearance
            setTimeout(() => {
                resolve();
            }, this.BLACK_HOLE_APPEAR_TIME);
        });
    }

    //Play black hole sound
    playHoleSound() {
        try {
            this.holeSound.currentTime = 0;
            this.holeSound.volume = 0.5; //Restore volume
            this.holeSound.play().catch(err => {
                //Sound didn't play (usually due to autoplay policy)
            });
        } catch (error) {
            //Sound playback error
        }
    }

    //Smooth sound fade out
    fadeOutSound(duration) {
        return new Promise((resolve) => {
            const startVolume = this.holeSound.volume;
            const fadeSteps = 20; //Number of fade steps
            const stepDuration = duration / fadeSteps;
            const volumeStep = startVolume / fadeSteps;
            let currentStep = 0;

            const fadeInterval = setInterval(() => {
                currentStep++;
                const newVolume = startVolume - (volumeStep * currentStep);

                if (newVolume > 0 && currentStep < fadeSteps) {
                    this.holeSound.volume = newVolume;
                } else {
                    this.holeSound.volume = 0;
                    this.holeSound.pause();
                    clearInterval(fadeInterval);
                    resolve();
                }
            }, stepDuration);
        });
    }

    //Convert hex to rgb
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 215, g: 0 }; //fallback gold
    }

    //Animate boss exit from hole - 1 second (with scaling from center)
    animateBossExit(targetX, targetY, startX, startY) {
        return new Promise((resolve) => {
            if (!this.bossContainer) {
                resolve();
                return;
            }

            //Set initial position at center of hole with scale 0
            this.bossContainer.style.left = `${startX - this.bossWidth / 2}px`;
            this.bossContainer.style.top = `${startY - this.bossHeight / 2}px`;
            this.bossContainer.style.transform = 'scale(0)';
            this.bossContainer.style.opacity = '1';

            //Small delay before starting animation
            setTimeout(() => {
                if (!this.bossContainer) {
                    resolve();
                    return;
                }

                //Animation: movement + scaling + remove floating animation temporarily
                this.bossContainer.style.transition = `left ${this.BOSS_EXIT_TIME}ms linear, top ${this.BOSS_EXIT_TIME}ms linear, transform ${this.BOSS_EXIT_TIME}ms ease-out`;
                this.bossContainer.style.animation = 'none'; //Remove floating during exit
                this.bossContainer.style.left = `${targetX - this.bossWidth / 2}px`;
                this.bossContainer.style.top = `${targetY - this.bossHeight / 2}px`;
                this.bossContainer.style.transform = 'scale(1)';

                setTimeout(() => {
                    //Restore floating animation
                    if (this.bossContainer) {
                        this.bossContainer.style.animation = 'bossFloating 3s ease-in-out infinite';
                    }
                    resolve();
                }, this.BOSS_EXIT_TIME);
            }, 50);
        });
    }

    //Pause and smooth hole fade out - 1.5 seconds
    pauseAndFadeHole() {
        return new Promise((resolve) => {
            if (this.blackHole && this.blackHole.parentNode) {
                //Fade out sound parallel with hole disappearance
                this.fadeOutSound(this.PAUSE_WITH_HOLE_TIME);

                this.blackHole.style.transition = `opacity ${this.PAUSE_WITH_HOLE_TIME}ms ease-out`;
                this.blackHole.style.opacity = '0';

                setTimeout(() => {
                    if (this.blackHole && this.blackHole.parentNode) {
                        this.blackHole.remove();
                        this.blackHole = null;
                    }
                    resolve();
                }, this.PAUSE_WITH_HOLE_TIME);
            } else {
                resolve();
            }
        });
    }

    //Fly to position with constant speed - 6 seconds
    flyToPosition(targetPos) {
        return new Promise((resolve) => {
            if (!this.bossContainer) {
                resolve();
                return;
            }

            this.bossContainer.style.transition = `left ${this.FLIGHT_DURATION}ms linear, top ${this.FLIGHT_DURATION}ms linear`;
            this.bossContainer.style.left = `${targetPos.x - this.bossWidth / 2}px`;
            this.bossContainer.style.top = `${targetPos.y - this.bossHeight / 2}px`;

            setTimeout(() => {
                resolve();
            }, this.FLIGHT_DURATION);
        });
    }

    //Simple pause
    pause(duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    //Create black hole (circle with effect) for exit - just appears
    createBlackHoleExit(x, y) {
        this.blackHole = document.createElement('div');
        //Use saved boss color
        const rgb = this.hexToRgb(this.currentBossColor || '#9966ff');

        this.blackHole.style.cssText = `
            position: fixed;
            left: ${x - 75}px;
            top: ${y - 75}px;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, black 0%, black 70%, rgba(0, 0, 0, 0.9) 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            box-shadow:
                0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9),
                0 0 80px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7),
                0 0 120px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5),
                inset 0 0 50px rgba(0, 0, 0, 0.8);
            border: 2px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8);
            transition: opacity 0.3s ease-in;
        `;

        document.body.appendChild(this.blackHole);

        //Play hole appearance sound
        this.playHoleSound();

        //Smooth appearance
        setTimeout(() => {
            if (this.blackHole) {
                this.blackHole.style.opacity = '1';
            }
        }, 50);
    }

    //Boss enters hole - 1 second
    animateBossEnter(holeX, holeY) {
        return new Promise((resolve) => {
            if (!this.bossContainer) {
                resolve();
                return;
            }

            this.bossContainer.style.transition = `left ${this.BOSS_ENTER_TIME}ms linear, top ${this.BOSS_ENTER_TIME}ms linear, opacity ${this.BOSS_ENTER_TIME}ms ease-out`;
            this.bossContainer.style.left = `${holeX - this.bossWidth / 2}px`;
            this.bossContainer.style.top = `${holeY - this.bossHeight / 2}px`;
            this.bossContainer.style.opacity = '0';

            setTimeout(() => {
                resolve();
            }, this.BOSS_ENTER_TIME);
        });
    }

    //Smooth hole fade out - 1.5 seconds
    fadeOutHole() {
        return new Promise((resolve) => {
            if (this.blackHole && this.blackHole.parentNode) {
                //Fade out sound parallel with hole disappearance
                this.fadeOutSound(this.BLACK_HOLE_DISAPPEAR_TIME);

                this.blackHole.style.transition = `opacity ${this.BLACK_HOLE_DISAPPEAR_TIME}ms ease-out`;
                this.blackHole.style.opacity = '0';

                setTimeout(() => {
                    if (this.blackHole && this.blackHole.parentNode) {
                        this.blackHole.remove();
                        this.blackHole = null;
                    }
                    resolve();
                }, this.BLACK_HOLE_DISAPPEAR_TIME);
            } else {
                resolve();
            }
        });
    }

    //Add styles for black hole animation
    addBlackHoleStyles() {
        if (document.getElementById('xmas-easter-egg-styles')) return;

        const style = document.createElement('style');
        style.id = 'xmas-easter-egg-styles';
        style.textContent = `
            @keyframes blackHoleSpinEntrance {
                0% {
                    transform: scale(0) rotate(0deg);
                    opacity: 0;
                }
                30% {
                    opacity: 0.5;
                }
                60% {
                    opacity: 1;
                }
                100% {
                    transform: scale(1) rotate(1080deg);
                    opacity: 1;
                }
            }

            @keyframes blackHoleCircleExit {
                0% {
                    transform: scale(0.3) rotate(0deg);
                    opacity: 0;
                }
                20% {
                    opacity: 0.5;
                }
                40% {
                    opacity: 1;
                    transform: scale(1) rotate(270deg);
                }
                100% {
                    transform: scale(1.5) rotate(540deg);
                    opacity: 1;
                }
            }

            @keyframes bossFloating {
                0%, 100% {
                    transform: translateY(0) rotate(0deg);
                }
                25% {
                    transform: translateY(-10px) rotate(2deg);
                }
                50% {
                    transform: translateY(0) rotate(0deg);
                }
                75% {
                    transform: translateY(-10px) rotate(-2deg);
                }
            }
        `;

        document.head.appendChild(style);
    }

    //Create boss (invisible, scale 0)
    createBoss(imagePath, name, x, y) {
        this.bossContainer = document.createElement('div');
        this.bossContainer.style.cssText = `
            position: fixed;
            left: ${x - this.bossWidth / 2}px;
            top: ${y - this.bossHeight / 2}px;
            width: ${this.bossWidth}px;
            height: ${this.bossHeight}px;
            pointer-events: none;
            z-index: 10000;
            opacity: 1;
            transform: scale(0);
            animation: bossFloating 3s ease-in-out infinite;
        `;

        const bossImage = document.createElement('img');
        bossImage.src = imagePath;
        bossImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 0 20px ${this.currentBossColor});
        `;

        this.bossContainer.appendChild(bossImage);
        document.body.appendChild(this.bossContainer);
    }

    //Get random position at screen edge (with edge indication)
    getRandomEdgePosition() {
        const margin = 100;
        const edgeIndex = Math.floor(Math.random() * 4); //0 = top, 1 = right, 2 = bottom, 3 = left
        const edges = ['top', 'right', 'bottom', 'left'];
        const edge = edges[edgeIndex];

        let x, y;

        switch(edgeIndex) {
            case 0: //top
                x = margin + Math.random() * (window.innerWidth - margin * 2);
                y = margin;
                break;
            case 1: //right
                x = window.innerWidth - margin;
                y = margin + Math.random() * (window.innerHeight - margin * 2);
                break;
            case 2: //bottom
                x = margin + Math.random() * (window.innerWidth - margin * 2);
                y = window.innerHeight - margin;
                break;
            case 3: //left
                x = margin;
                y = margin + Math.random() * (window.innerHeight - margin * 2);
                break;
        }

        return { x, y, edge };
    }

    //Get random position on screen (not at edge)
    getRandomPosition() {
        const margin = 150;
        const x = margin + Math.random() * (window.innerWidth - margin * 2);
        const y = margin + Math.random() * (window.innerHeight - margin * 2);
        return { x, y };
    }

    //Boss disappearance (new sequence)
    async triggerBossDisappearance() {
        if (!this.bossContainer) {
            this.scheduleNextAppearance();
            return;
        }

        //Get current boss position
        const rect = this.bossContainer.getBoundingClientRect();
        const bossX = rect.left + rect.width / 2;
        const bossY = rect.top + rect.height / 2;

        //Determine hole position to the side of boss
        const holeDirection = Math.random() > 0.5 ? 1 : -1; //Left or right
        const holeX = bossX + holeDirection * 180; //180px to the side
        const holeY = bossY;

        //STEP 6: Black hole appearance to the side
        this.createBlackHoleExit(holeX, holeY);

        //Small pause for hole appearance
        await this.pause(300);

        //STEP 7: Boss enters hole - 1 second
        await this.animateBossEnter(holeX, holeY);

        //STEP 8: Hole smoothly disappears - 1.5 seconds
        await this.fadeOutHole();

        //Cleanup
        this.cleanup();

        //Schedule next appearance
        this.scheduleNextAppearance();
    }

    //Cleanup elements
    cleanup() {
        if (this.bossContainer && this.bossContainer.parentNode) {
            this.bossContainer.remove();
            this.bossContainer = null;
        }

        if (this.blackHole && this.blackHole.parentNode) {
            this.blackHole.remove();
            this.blackHole = null;
        }

        this.currentBossColor = null;
    }
}

//Global initialization
window.xmasBossEasterEgg = new XmasBossEasterEgg();

//Autostart on page load (only on tournament lobby page)
document.addEventListener('DOMContentLoaded', () => {
    //Check that we are on tournament lobby page
    const path = window.location.pathname;
    const isTournamentLobby = path === '/tournament' || path === '/tournament/' || path.includes('tournament-lobby.html');

    if (isTournamentLobby) {
        //Check if xmas theme is active
        const checkThemeAndStart = () => {
            const currentTheme = window.themeManager ? window.themeManager.getCurrentTheme() : null;

            if (currentTheme === 'xmas') {
                //Give a small delay before first start
                setTimeout(() => {
                    window.xmasBossEasterEgg.start();
                }, 5000); //First appearance 5 seconds after load

                //Listen for game start events
                setupGameStartListener();
            }
        };

        //Wait for ThemeManager to be ready
        if (window.themeManager) {
            checkThemeAndStart();
        } else {
            setTimeout(checkThemeAndStart, 1000);
        }

        //Listen for theme changes
        window.addEventListener('themeChanged', () => {
            const currentTheme = window.themeManager ? window.themeManager.getCurrentTheme() : null;

            if (currentTheme === 'xmas') {
                if (!window.xmasBossEasterEgg.isActive) {
                    window.xmasBossEasterEgg.start();
                }
            } else {
                if (window.xmasBossEasterEgg.isActive) {
                    window.xmasBossEasterEgg.stop();
                }
            }
        });
    }
});

//Setup game start listener
function setupGameStartListener() {
    //Track game modal window appearance via MutationObserver
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('tournament-game-modal')) {
                    //Game started - force stop animation
                    if (window.xmasBossEasterEgg) {
                        window.xmasBossEasterEgg.forceStop();
                    }
                }
            });
        });
    });

    //Observe changes in body
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    //Also track modal window display changes
    setInterval(() => {
        if (window.xmasBossEasterEgg && window.xmasBossEasterEgg.isGameActive()) {
            //If game is active and animation is running - stop
            if (window.xmasBossEasterEgg.bossContainer || window.xmasBossEasterEgg.blackHole) {
                window.xmasBossEasterEgg.forceStop();
            }
        }
    }, 500); //Check every 500ms
}

//Export class for use in other modules
window.XmasBossEasterEgg = XmasBossEasterEgg;
