//PHAROS INVADERS - SOUND MANAGER
//Sound and music management system

class SoundManager {
    //Detect correct path to sounds folder based on device and page
    detectSoundsPath() {
        const currentPath = window.location.pathname;

        //Check if running in Next.js (Vercel) environment
        const isNextJS = window.location.hostname.includes('vercel.app') ||
                        window.location.hostname === 'localhost' && currentPath.startsWith('/game');

        //Use Theme Manager if available
        if (window.themeManager && window.themeManager.isInitialized) {
            //Theme Manager will determine base path considering tournament mode
            const basePath = window.themeManager._detectBasePath();
            const currentTheme = window.themeManager.getCurrentTheme();
            const themeConfig = window.themeManager.themesConfig?.themes[currentTheme];

            if (themeConfig) {
                const soundsPath = isNextJS
                    ? `/themes/${currentTheme}/sounds`  // Next.js: absolute path from public/
                    : `${basePath}/${themeConfig.basePath}/sounds`;
                return soundsPath;
            }
        }

        //Fallback to current structure
        //Detect theme by URL (same as preload-manager.js)
        const detectPageTheme = () => {
            const path = window.location.pathname;
            if (path.includes('coraluna.html') || path.includes('/coraluna')) {
                return 'coraluna';
            }
            if (path.includes('tournament-lobby.html') || path.includes('/tournament')) {
                return 'xmas';  // tournament always uses xmas
            }
            if (path.includes('index.html') || path === '/' || path.endsWith('/') || path.includes('/game')) {
                return 'xmas';  // index and Next.js game always use xmas
            }
            return 'xmas';  // default to xmas
        };

        const urlBasedTheme = detectPageTheme();
        const savedTheme = localStorage.getItem('selectedTheme') || urlBasedTheme;

        //Next.js uses absolute paths from public folder
        if (isNextJS) {
            return `/themes/${savedTheme}/sounds`;
        }

        let basePath = `themes/${savedTheme}/sounds`;

        //If we're in subfolder (e.g., tournament/, coraluna/, xmas/), need relative path
        if (currentPath.includes('/tournament/') || currentPath.includes('\\tournament\\') ||
            currentPath.includes('/coraluna/') || currentPath.includes('\\coraluna\\') ||
            currentPath.includes('/xmas/') || currentPath.includes('\\xmas\\')) {
            basePath = `../themes/${savedTheme}/sounds`;
        }

        return basePath;
    }

    constructor() {
        //Main settings - now using only individual volumes
        this.musicEnabled = true;

        //Music tracks
        this.currentMusic = null;
        this.musicPaused = false;
        this.musicStates = new Map(); //Save states of all tracks

        //Mobile optimizations
        this.activeSounds = []; //Array of active sounds
        this.maxSimultaneousSounds = 30; //Limit of simultaneous sounds
        this.soundThrottle = new Map(); //Throttling for frequent sounds

        //ALL DEVICES - SOUNDS ENABLED (no iOS restrictions)
        this.isiOS = false; // Force disable iOS detection

        //Sound priorities (higher = more important)
        this.soundPriorities = {
            //Critical sounds (10)
            playerShoot: 10,
            player3: 10,      //Player damage - important!
            wasted: 10,

            //High priority (8-9)
            player12: 9,      //Gaining life
            playerOuch1: 9,   //Player pain sounds - IMPORTANT to hear!
            playerOuch2: 9,
            playerOof: 9,
            playerOogh: 9,
            buttonClick: 8,
            toasty: 8,        //Easter eggs
            cu: 8,

            //Boost sounds (8) - IMPORTANT! Player must hear boost activation
            boostDefault: 8,
            boostCoinShower: 8,
            boostAutoTarget: 8,
            boostGravityWell: 8,
            boostHealthBoost: 8,
            boostIceFreeze: 8,
            boostInvincibility: 8,
            boostMultiShot: 8,
            boostPiercingBullets: 8,
            boostPointsFreeze: 8,
            boostRapidFire: 8,
            boostRicochet: 8,
            boostScoreMultiplier: 8,
            boostShieldBarrier: 8,
            boostSpeedTamer: 8,
            boostWaveBlast: 8,

            //Low priority (frequent sounds - not critical)
            bossShoot: 6,
            player1: 5,        //Hit - medium
            bossHit: 3,        //Low priority
            crabDeath: 2       //Low priority
        };

        //Specific throttling timings for frequent sounds (reduced for better responsiveness)
        this.soundThrottleTimings = {
            playerShoot: 30,   //Minimal throttling for player shooting
            crabDeath: 50,     //Reduced
            bossHit: 80,       //Reduced
            bossShoot: 50,     //Reduced
            player1: 50        //Hit
        };

        //Individual volume settings for each sound (0.0 - 1.0)
        this.soundVolumes = {
            //Music (reduced by 30%)
            menu: 0.1,
            tournamentLobby: 0.1,
            gameplay: 0.1,
            boss: 0.15,
            //Xmas theme music
            jinglebells: 0.25,
            lastchristmas: 0.25,

            //Player (reduced by 30%)
            playerShoot: 0.28,
            multiShot: 0.18,
            player1: 0.5,
            player3: 0.5,
            player12: 0.5,
            playerOuch1: 0.42,
            playerOuch2: 0.42,
            playerOof: 0.42,
            playerOogh: 0.42,

            //Enemies (reduced by 30%)
            crabDeath: 0.5,
            bossHit: 0.25,
            bossShoot: 0.28,

            //UI (reduced by 30%)
            buttonClick: 0.5,
            chooseWallet: 0.42,
            toasty: 0.6,
            cu: 0.6,
            wasted: 0.7,

            //Boosts (reduced by 30%)
            boostDefault: 0.4,
            boostCoinShower: 0.38,
            boostAutoTarget: 0.28,
            boostGravityWell: 0.35,
            boostHealthBoost: 0.38,
            boostIceFreeze: 0.4,
            boostInvincibility: 0.32,
            boostMultiShot: 0.4,
            boostPiercingBullets: 0.4,
            boostPointsFreeze: 0.34,
            boostRapidFire: 0.45,
            boostRicochet: 0.44,
            boostScoreMultiplier: 0.34,
            boostShieldBarrier: 0.38,
            boostSpeedTamer: 0.35,
            boostWaveBlast: 0.5
        };

        //Initialize sound paths
        this.initSoundPaths();

        //Loaded sounds
        this.loadedSounds = new Map();
        this.loadedMusic = new Map();

        //Sound state
        this.muted = false;
        this.enabled = true;

        //Mobile compatibility
        this.audioContext = null;
        this.unlocked = false;
        this.soundsLoaded = false;
        this.soundsLoadedPromise = null;

        this.init();

        //Listen for theme changes
        window.addEventListener('themeChanged', () => {
            this.initSoundPaths();
            //Clear loaded sounds cache to force reload
            this.loadedSounds.clear();
            this.loadedMusic.clear();
            //Reload sounds
            this.preloadSounds();
        });
    }

    //Initialize sound paths based on current theme
    initSoundPaths() {
        //Determine sound paths based on theme
        const soundsBasePath = this.detectSoundsPath();

        //Standard extensions for all devices
        const musicExt = 'mp3';
        const sfxExt = 'wav';
        const sfxMp3Ext = 'mp3';

        this.soundPaths = {
            music: {
                menu: `${soundsBasePath}/music/menu.${musicExt}`,
                tournamentLobby: `${soundsBasePath}/music/tournamentLobby.${musicExt}`,
                gameplay: `${soundsBasePath}/music/gameplay.${musicExt}`,
                boss: `${soundsBasePath}/music/boss.${musicExt}`,
                //Xmas theme specific tracks for random menu music
                jinglebells: `${soundsBasePath}/music/jinglebells.${musicExt}`,
                lastchristmas: `${soundsBasePath}/music/lastchristmas.${musicExt}`
            },
            sfx: {
                //Player
                playerShoot: `${soundsBasePath}/sfx/player/shoot.${sfxExt}`,
                multiShot: `${soundsBasePath}/sfx/player/shoot2.${sfxExt}`,
                player1: `${soundsBasePath}/sfx/player/1.${sfxExt}`,
                player3: `${soundsBasePath}/sfx/player/3.${sfxExt}`,
                player12: `${soundsBasePath}/sfx/player/12.${sfxExt}`,
                playerOuch1: `${soundsBasePath}/sfx/player/ouch_1.${sfxMp3Ext}`,
                playerOuch2: `${soundsBasePath}/sfx/player/ouch_2.${sfxMp3Ext}`,
                playerOof: `${soundsBasePath}/sfx/player/oof.${sfxMp3Ext}`,
                playerOogh: `${soundsBasePath}/sfx/player/oogh.${sfxMp3Ext}`,

                //Enemies
                crabDeath: `${soundsBasePath}/sfx/enemies/crab-death.${sfxExt}`,
                bossHit: `${soundsBasePath}/sfx/enemies/boss-hit.${sfxExt}`,
                bossShoot: `${soundsBasePath}/sfx/enemies/boss-shoot.${sfxMp3Ext}`,

                //UI
                buttonClick: `${soundsBasePath}/sfx/ui/button1.${sfxExt}`,
                chooseWallet: `${soundsBasePath}/sfx/ui/chooseWallet.${sfxMp3Ext}`,
                toasty: `${soundsBasePath}/sfx/ui/toasty.${sfxExt}`,
                cu: `${soundsBasePath}/sfx/ui/CU.${sfxExt}`,
                wasted: `${soundsBasePath}/sfx/ui/WASTED.${sfxExt}`,

                //Boosts
                boostDefault: `${soundsBasePath}/sfx/boosts/default.${sfxExt}`,
                boostCoinShower: `${soundsBasePath}/sfx/boosts/coinShower.${sfxExt}`,
                boostAutoTarget: `${soundsBasePath}/sfx/boosts/Auto-Target.${sfxExt}`,
                boostGravityWell: `${soundsBasePath}/sfx/boosts/GravityWell.${sfxExt}`,
                boostHealthBoost: `${soundsBasePath}/sfx/boosts/HealthBoost.${sfxExt}`,
                boostIceFreeze: `${soundsBasePath}/sfx/boosts/IceFreeze.${sfxExt}`,
                boostInvincibility: `${soundsBasePath}/sfx/boosts/Invincibility.${sfxExt}`,
                boostMultiShot: `${soundsBasePath}/sfx/boosts/Multi-Shot.${sfxExt}`,
                boostPiercingBullets: `${soundsBasePath}/sfx/boosts/PiercingBullets.${sfxExt}`,
                boostPointsFreeze: `${soundsBasePath}/sfx/boosts/PointsFreeze.${sfxExt}`,
                boostRapidFire: `${soundsBasePath}/sfx/boosts/RapidFire.${sfxExt}`,
                boostRicochet: `${soundsBasePath}/sfx/boosts/Ricochet.${sfxExt}`,
                boostScoreMultiplier: `${soundsBasePath}/sfx/boosts/ScoreMultiplier.${sfxExt}`,
                boostShieldBarrier: `${soundsBasePath}/sfx/boosts/ShieldBarrier.${sfxExt}`,
                boostSpeedTamer: `${soundsBasePath}/sfx/boosts/timeFramer.${sfxExt}`,
                boostWaveBlast: `${soundsBasePath}/sfx/boosts/WaveBlast.${sfxExt}`
            }
        };

    }

    //INITIALIZATION
    async init() {
        try {
            //Create AudioContext for better compatibility
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            //Load settings from localStorage
            this.loadSettings();

            //Load sounds BEFORE setting up handlers
            //This ensures sounds are ready for first interaction
            await this.preloadSounds();

            //Prepare mobile device handling
            this.setupMobileAudio();

        } catch (error) {
            Logger.error(' Sound Manager initialization failed:', error);
            this.enabled = false;
        }
    }

    //MOBILE AUDIO SETUP
    setupMobileAudio() {
        //Automatic unlock for all mobile devices
        let unlockAttempts = 0;
        const startTime = Date.now();

        const unlockAudio = async () => {
            //If already unlocked, exit
            if (this.unlocked) {
                return;
            }

            unlockAttempts++;

            //⏳ IMPORTANT: Wait for sounds to load
            if (!this.soundsLoaded) {
                //Check every 100ms for up to 5 seconds
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (this.soundsLoaded) {
                        break;
                    }
                }

                if (!this.soundsLoaded) {
                    return; //DO NOT remove handlers
                }
            }

            try {
                //Method 1: AudioContext resume
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }

                //Wait a bit after resume
                await new Promise(resolve => setTimeout(resolve, 50));

                //Check that AudioContext is actually unlocked
                if (this.audioContext.state !== 'running') {
                    return; //DO NOT remove handlers
                }

                //Method 2: Play silence to unlock Web Audio API
                try {
                    const buffer = this.audioContext.createBuffer(1, 1, 22050);
                    const source = this.audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(this.audioContext.destination);
                    source.start(0);
                } catch (err) {
                    //Ignore errors
                }

                //Method 3: Try to play test sound via HTML5 Audio
                try {
                    const tempAudio = new Audio();
                    tempAudio.volume = 0.01;
                    tempAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
                    await tempAudio.play();
                } catch (err) {
                    //Ignore errors
                }

                //Method 4: Play real sounds
                const criticalSounds = ['playerShoot', 'buttonClick', 'crabDeath'];
                let successCount = 0;
                const soundResults = {};

                for (const soundKey of criticalSounds) {
                    if (this.loadedSounds.has(soundKey)) {
                        const sound = this.loadedSounds.get(soundKey);
                        try {
                            const clone = sound.cloneNode();
                            clone.volume = 0.01;
                            clone.muted = true;

                            await clone.play();
                            clone.muted = false;

                            //Stop immediately after unlock
                            setTimeout(() => {
                                clone.pause();
                                clone.currentTime = 0;
                            }, 50);

                            successCount++;
                            soundResults[soundKey] = '';
                        } catch (err) {
                            soundResults[soundKey] = ` ${err.name}`;
                        }
                    } else {
                        soundResults[soundKey] = ' not loaded';
                    }
                }

                //Consider success if at least one sound is unlocked
                if (successCount === 0) {
                    return; //DO NOT remove handlers
                }

                //All successful - mark as unlocked
                this.unlocked = true;

                //Update music button state after unlock
                setTimeout(() => {
                    const button = document.getElementById('musicToggleBtn');
                    if (button && !this.currentMusic) {
                        button.innerHTML = ' OFF';
                        button.style.background = 'rgba(255,100,100,0.2)';
                        button.style.borderColor = 'rgba(255,100,100,0.5)';
                    }
                    //In tournament mode automatically start lobby music
                    if ((window.tournamentMode || typeof tournamentMode !== 'undefined' && tournamentMode) && !this.currentMusic) {
                        setTimeout(() => {
                            this.playMusic('tournamentLobby', true);
                        }, 200);
                    }
                }, 100);

                //Remove handlers only if successfully unlocked
                this.removeUnlockListeners(unlockAudio);

            } catch (error) {
                //On error DO NOT remove handlers - will try on next interaction
            }
        };

        //Save reference for possible removal
        this._unlockAudioHandler = unlockAudio;

        //Add handlers for audio unlock (NOT once, will remove manually)
        document.addEventListener('touchstart', unlockAudio, { passive: true });
        document.addEventListener('touchend', unlockAudio, { passive: true });
        document.addEventListener('mousedown', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
        document.addEventListener('click', unlockAudio);
    }

    //Remove unlock handlers
    removeUnlockListeners(handler) {
        document.removeEventListener('touchstart', handler);
        document.removeEventListener('touchend', handler);
        document.removeEventListener('mousedown', handler);
        document.removeEventListener('keydown', handler);
        document.removeEventListener('click', handler);
    }

    //FORCED AUDIO UNLOCK (called by button)
    async forceUnlockAudio() {
        try {
            //SYNCHRONOUS unlock in the same event loop tick!

            //1. IMMEDIATELY unlock AudioContext (synchronously!)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume(); //NO await!
            }

            //2. Create NEW test Audio elements from data URI
            const silentDataURL = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

            for (let i = 0; i < 3; i++) {
                const testAudio = new Audio(silentDataURL);
                testAudio.volume = 0.01;
                testAudio.play().then(() => {
                    setTimeout(() => {
                        testAudio.pause();
                        testAudio.src = '';
                        testAudio.load();
                    }, 100);
                }).catch(() => {});
            }

            //3.  CRITICAL: Create NEW Audio elements (DO NOT clone!)
            //Need FRESH elements with src
            //Create ALWAYS, regardless of this.soundsLoaded!
            const soundsToUnlock = [
                { key: 'playerShoot', path: this.soundPaths.sfx.playerShoot },
                { key: 'buttonClick', path: this.soundPaths.sfx.buttonClick },
                { key: 'crabDeath', path: this.soundPaths.sfx.crabDeath }
            ];

            let unlockedCount = 0;

            for (const { key, path } of soundsToUnlock) {
                try {
                    //new Audio element with src (NOT clone!)
                    const freshAudio = new Audio(path);
                    freshAudio.volume = 0.01;

                    //Fire-and-forget (NO await!)
                    freshAudio.play().then(() => {
                        setTimeout(() => {
                            freshAudio.pause();
                            freshAudio.currentTime = 0;
                            freshAudio.src = '';
                            freshAudio.load();
                        }, 50);
                    }).catch(() => {});

                    unlockedCount++;
                } catch (err) {
                    //Ignore errors
                }
            }

            //4. Mark as unlocked IMMEDIATELY
            this.unlocked = true;

            //5. Remove automatic handlers IMMEDIATELY
            if (this._unlockAudioHandler) {
                this.removeUnlockListeners(this._unlockAudioHandler);
            }

            return true;

        } catch (error) {
            this.unlocked = true;
            return true;
        }
    }

    //Load sound
    async loadSound(key, path, isMusic = false) {
        if (!this.enabled) return Promise.resolve(null); // ✅ CRITICAL: Return Promise for compatibility with preload-manager

        try {
            const audio = new Audio();
            audio.crossOrigin = 'anonymous';

            return new Promise((resolve, reject) => {
                let resolved = false;

                // Timeout for mobile devices with slow connection
                // if sound doesn't load in 10 seconds, skip it
                const timeout = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        console.warn(` Sound ${key} loading timeout (10s) - skipping`);
                        resolve(null); // Don't block the game
                    }
                }, 10000); // 10 seconds (optimized)

                audio.onloadeddata = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);

                        const individualVolume = this.getSoundVolume(key);

                        if (isMusic) {
                            //For xmas gameplay tracks, don't loop - play until end then switch to next random track
                            const isXmasGameplayTrack = (key === 'jinglebells' || key === 'lastchristmas');
                            audio.loop = !isXmasGameplayTrack;

                            //Add ended handler for xmas tracks to auto-play next random track
                            if (isXmasGameplayTrack) {
                                audio.addEventListener('ended', () => {
                                    console.log(`🎵 Xmas track ended: ${key}`);
                                    console.log(`🎵 Conditions: musicEnabled=${this.musicEnabled}, currentMusicMatch=${this.currentMusic === audio}`);

                                    //Auto-play next track if music is enabled and this is still the current track
                                    if (this.musicEnabled && this.currentMusic === audio) {
                                        const xmasTracks = ['jinglebells', 'lastchristmas'];
                                        const nextTrack = xmasTracks[Math.floor(Math.random() * xmasTracks.length)];
                                        console.log(`🎵 Auto-playing next xmas track: ${nextTrack}`);
                                        setTimeout(() => {
                                            this.playMusic(nextTrack, true, false);
                                        }, 100);
                                    } else {
                                        console.log(`🎵 NOT auto-playing next track (conditions not met)`);
                                    }
                                });
                            }

                            audio.volume = individualVolume;
                            this.loadedMusic.set(key, audio);
                        } else {
                            audio.volume = individualVolume;
                            this.loadedSounds.set(key, audio);
                        }
                        resolve(audio);
                    }
                };

                audio.onerror = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        resolve(null); //Don't block game due to missing sounds
                    }
                };

                audio.src = path;
                audio.load(); //CRITICAL! Without this onloadeddata won't trigger!
            });
        } catch (error) {
            Logger.error(` Error loading sound ${key}:`, error);
            return null;
        }
    }

    //PRELOAD SOUNDS
    async preloadSounds() {
        if (!this.enabled) {
            this.soundsLoaded = true;
            return;
        }

        const loadPromises = [];

        //Load music
        for (const [key, path] of Object.entries(this.soundPaths.music)) {
            loadPromises.push(this.loadSound(key, path, true));
        }

        //Load sound effects
        for (const [key, path] of Object.entries(this.soundPaths.sfx)) {
            loadPromises.push(this.loadSound(key, path, false));
        }

        //Load ambient sounds (if available)
        if (this.soundPaths.ambient) {
            for (const [key, path] of Object.entries(this.soundPaths.ambient)) {
                loadPromises.push(this.loadSound(key, path, false));
            }
        }

        try {
            await Promise.all(loadPromises);
            this.soundsLoaded = true;
        } catch (error) {
            Logger.error(' Error preloading sounds:', error);
            this.soundsLoaded = true; //Mark as loaded to not block
        }
    }

    //PLAY MUSIC WITH CROSSFADE
    playMusic(track, fadeIn = false, crossfade = false) {
        //iOS - sounds disabled
        if (this.isiOS) return;

        if (!this.enabled || this.muted || !this.musicEnabled) {
            return;
        }

        //Resume AudioContext if suspended (Chrome autoplay policy)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('AudioContext resume failed:', err);
            });
        }

        //Xmas theme: random menu music selection
        if (track === 'menu') {
            const currentTheme = window.themeManager?.getCurrentTheme() || localStorage.getItem('selectedTheme');
            if (currentTheme === 'xmas') {
                //Randomly choose between jinglebells and lastchristmas
                const xmasTracks = ['jinglebells', 'lastchristmas'];
                track = xmasTracks[Math.floor(Math.random() * xmasTracks.length)];
            }
        }

        const music = this.loadedMusic.get(track);
        if (!music) {
            return;
        }

        //if already playing this same track, do nothing
        if (this.currentMusic === music && !music.paused) {
            return;
        }

        //Save state of current track
        if (this.currentMusic && !this.currentMusic.paused) {
            const currentTrackName = this.getCurrentTrackName();
            if (currentTrackName) {
                this.musicStates.set(currentTrackName, {
                    currentTime: this.currentMusic.currentTime,
                    volume: this.currentMusic.volume
                });
            }
        }

        //Crossfade: smoothly fade out old track
        if (crossfade && this.currentMusic && !this.currentMusic.paused) {
            this.fadeOut(this.currentMusic, 1000);
        } else if (this.currentMusic) {
            //Normal stop without crossfade
            this.currentMusic.pause();
        }

        //Restore state of new track
        const savedState = this.musicStates.get(track);
        if (savedState) {
            music.currentTime = savedState.currentTime;
        } else {
            music.currentTime = 0;
        }

        this.currentMusic = music;

        //Use individual volume for this track
        const individualVolume = this.getSoundVolume(track);
        music.volume = fadeIn ? 0 : individualVolume;

        //Start playback
        const playPromise = music.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (fadeIn) {
                    this.fadeIn(music, individualVolume, 1000);
                }
            }).catch(error => {
                //music may be blocked by autoplay policy
                //User can manually enable via music button
            });
        }
    }

    //GET INDIVIDUAL SOUND VOLUME
    getSoundVolume(trackName) {
        return this.soundVolumes[trackName] || 1.0; //by default 100% if not configured
    }

    //GET CURRENT TRACK NAME
    getCurrentTrackName() {
        if (!this.currentMusic) return null;

        for (const [trackName, audio] of this.loadedMusic.entries()) {
            if (audio === this.currentMusic) {
                return trackName;
            }
        }
        return null;
    }

    //PLAY SOUND EFFECT
    playSound(effect, volume = 1.0, pitch = 1.0) {
        //iOS - sounds disabled
        if (this.isiOS) return;

        if (!this.enabled || this.muted) return;

        //If sounds are still loading, silently skip (avoid console spam)
        if (!this.soundsLoaded) {
            return;
        }

        //Resume AudioContext if suspended (Chrome autoplay policy)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('AudioContext resume failed:', err);
            });
        }

        //SPECIAL HANDLING for WASTED sound
        if (effect === 'wasted') {
            console.log(' Playing WASTED sound');
            console.log(' Current sound path:', this.soundPaths?.sfx?.wasted);

            //Stop current music (gameplay)
            if (this.currentMusic) {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            }
        }

        const sound = this.loadedSounds.get(effect);
        if (!sound) {
            console.warn(` Sound "${effect}" not found in loaded sounds`);
            return;
        }

        if (effect === 'wasted') {
            console.log(' WASTED sound loaded, src:', sound.src);
        }

        const now = Date.now();

        //Specific throttling for frequent sounds
        const throttleTime = this.soundThrottleTimings[effect];
        if (throttleTime) {
            const lastPlayed = this.soundThrottle.get(effect);
            if (lastPlayed && (now - lastPlayed) < throttleTime) {
                return; //Skip, sound played too recently
            }
            this.soundThrottle.set(effect, now);
        }

        //Clear finished sounds
        this.activeSounds = this.activeSounds.filter(s => !s.paused && !s.ended);

        //if reached limit of simultaneous sounds - stop oldest
        if (this.activeSounds.length >= this.maxSimultaneousSounds) {
            const oldestSound = this.activeSounds.shift();
            if (oldestSound) {
                oldestSound.pause();
                oldestSound.currentTime = 0;
                oldestSound.src = '';
                oldestSound.load();
            }
        }

        try {
            //Clone audio for simultaneous playback
            const audioClone = sound.cloneNode();

            //Save priority for subsequent cleanup
            audioClone._priority = this.soundPriorities[effect] || 5;

            //Use individual volume for this sound
            const individualVolume = this.getSoundVolume(effect);
            const finalVolume = Math.min(1.0, (volume * individualVolume));
            audioClone.volume = finalVolume;

            //Change pitch if needed
            if (pitch !== 1.0) {
                audioClone.playbackRate = pitch;
            }

            //Automatic cleanup when sound finishes
            const cleanupSound = () => {
                //Remove from active sounds
                const index = this.activeSounds.indexOf(audioClone);
                if (index !== -1) {
                    this.activeSounds.splice(index, 1);
                }

                //Free resources
                try {
                    audioClone.pause();
                    audioClone.currentTime = 0;
                    audioClone.src = '';
                    audioClone.load();
                } catch (e) {
                    //Ignore cleanup errors
                }

                //Remove all event listeners
                audioClone.removeEventListener('ended', cleanupSound);
                audioClone.removeEventListener('error', cleanupSound);
            };

            //Add event listeners for automatic cleanup
            audioClone.addEventListener('ended', cleanupSound, { once: true });
            audioClone.addEventListener('error', cleanupSound, { once: true });

            //SPECIAL HANDLING: After wasted sound start menu music
            if (effect === 'wasted') {
                audioClone.addEventListener('ended', () => {
                    //Start menu music after wasted finishes
                    setTimeout(() => {
                        this.playMusic('menu', true);
                    }, 500); //Small delay for smoothness
                }, { once: true });
            }

            const playPromise = audioClone.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    //Add to list of active sounds
                    this.activeSounds.push(audioClone);
                }).catch(error => {
                    //Cleanup on playback error
                    cleanupSound();
                });
            }
        } catch (error) {
            //Ignore cloning errors
        }
    }

    //PLAY BOOST SOUND WITH FALLBACK
    playBoostSound(boostName, volume = 0.7, pitch = 1.0) {
        //iOS - sounds disabled
        if (this.isiOS) return;

        if (!this.enabled || this.muted) return;

        //Convert boost name to sound key format
        const specificSoundKey = `boost${boostName.charAt(0).toUpperCase()}${boostName.slice(1)}`;

        //Check if there's a specific sound for this boost
        if (this.loadedSounds.has(specificSoundKey)) {
            this.playSound(specificSoundKey, volume, pitch);
        } else {
            //Use generic boost sound
            this.playSound('boostDefault', volume, pitch);
        }
    }

    //PLAY RANDOM PLAYER HURT SOUND
    playRandomHurtSound(volume = 0.6, pitch = 1.0) {
        //iOS - sounds disabled
        if (this.isiOS) return;

        if (!this.enabled || this.muted) return;

        //array of all hurt sounds
        const hurtSounds = ['playerOuch1', 'playerOuch2', 'playerOof', 'playerOogh'];

        //Select random sound
        const randomSound = hurtSounds[Math.floor(Math.random() * hurtSounds.length)];

        //Play selected sound
        this.playSound(randomSound, volume, pitch);
    }

    //FADE IN SOUND
    fadeIn(audio, targetVolume, duration) {
        const startVolume = 0;
        const volumeStep = targetVolume / (duration / 50);
        let currentVolume = startVolume;

        const fadeInterval = setInterval(() => {
            currentVolume += volumeStep;
            if (currentVolume >= targetVolume) {
                currentVolume = targetVolume;
                clearInterval(fadeInterval);
            }
            audio.volume = currentVolume;
        }, 50);
    }

    //FADE OUT SOUND
    fadeOut(audio, duration, pauseAtEnd = true) {
        const startVolume = audio.volume;
        const volumeStep = startVolume / (duration / 50);
        let currentVolume = startVolume;

        const fadeInterval = setInterval(() => {
            currentVolume -= volumeStep;
            if (currentVolume <= 0) {
                currentVolume = 0;
                if (pauseAtEnd) {
                    audio.pause();
                    //DON'T reset currentTime for crossfade
                }
                clearInterval(fadeInterval);
            }
            audio.volume = currentVolume;
        }, 50);
    }

    //⏹ STOP MUSIC
    stopMusic(fadeOut = false) {
        if (!this.currentMusic) return;

        if (fadeOut) {
            this.fadeOut(this.currentMusic, 1000);
        } else {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }

        this.currentMusic = null;
    }

    //⏸ PAUSE/RESUME MUSIC
    pauseMusic() {
        if (this.currentMusic && !this.musicPaused) {
            this.currentMusic.pause();
            this.musicPaused = true;
        }
    }

    resumeMusic() {
        if (this.currentMusic && this.musicPaused) {
            this.currentMusic.play();
            this.musicPaused = false;
        }
    }

    //SOUND CONTROL
    mute() {
        this.muted = true;
        if (this.currentMusic) {
            this.currentMusic.volume = 0;
        }
        this.saveSettings();
    }

    unmute() {
        this.muted = false;
        if (this.currentMusic) {
            const individualVolume = this.getSoundVolume(this.currentMusic.dataset?.track || 'menu');
            this.currentMusic.volume = individualVolume;
        }
        this.saveSettings();
    }

    toggleMute() {
        if (this.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    //UPDATE CURRENT MUSIC VOLUME
    updateCurrentMusicVolume() {
        if (this.currentMusic) {
            const track = this.currentMusic.dataset?.track || 'menu';
            const individualVolume = this.getSoundVolume(track);
            this.currentMusic.volume = individualVolume;
        }
    }

    //SET INDIVIDUAL SOUND VOLUME
    setSoundVolume(soundName, volume) {
        this.soundVolumes[soundName] = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.updateCurrentMusicVolume(); //Update volume if changing current track
    }

    //SAVE SETTINGS
    saveSettings() {
        const settings = {
            musicEnabled: this.musicEnabled,
            muted: this.muted,
            soundVolumes: this.soundVolumes //Save individual volumes
        };
        localStorage.setItem('pharosInvadersSoundSettings', JSON.stringify(settings));
    }

    //LOAD SETTINGS
    loadSettings() {
        try {
            const saved = localStorage.getItem('pharosInvadersSoundSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.musicEnabled = settings.musicEnabled !== false;
                this.muted = settings.muted || false;

                //Load individual volume settings
                if (settings.soundVolumes) {
                    //Merge saved settings with defaults
                    this.soundVolumes = { ...this.soundVolumes, ...settings.soundVolumes };
                }
            }
        } catch (error) {
            Logger.error(' Error loading sound settings:', error);
        }
    }

    //GET INFORMATION
    getStatus() {
        return {
            enabled: this.enabled,
            musicEnabled: this.musicEnabled,
            muted: this.muted,
            currentMusic: this.currentMusic ? 'playing' : 'none',
            individualVolumes: this.soundVolumes,
            loadedSounds: this.loadedSounds.size,
            loadedMusic: this.loadedMusic.size
        };
    }

    //Cleanup
    destroy() {
        this.stopMusic();
        this.loadedSounds.clear();
        this.loadedMusic.clear();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

//Create global instance
window.soundManager = new SoundManager();

//Global functions for testing (can use in console)
window.setSoundVolume = (soundName, volume) => {
    if (window.soundManager) {
        window.soundManager.setSoundVolume(soundName, volume);
    }
};

window.getSoundStatus = () => {
    if (window.soundManager) {
        console.table(window.soundManager.soundVolumes);
        return window.soundManager.getStatus();
    }
};

//Global function for buttons
window.playButtonSound = () => {
    if (window.soundManager) {
        window.soundManager.playSound('buttonClick');
    }
};

//Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}