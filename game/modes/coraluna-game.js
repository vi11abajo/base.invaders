//PHAROS INVADERS - CORALUNA GAME MODE
//Coraluna themed tournament

import { GameEngine } from '../core/game-engine.js?v=20251227003';
import { CORALUNA_CONFIG } from '../core/game-config.js?v=20251218001';

export class CoralunaGame extends GameEngine {
    constructor(config = {}) {
        super({
            mode: 'coraluna',
            ...CORALUNA_CONFIG,
            ...config
        });

        this.enableEasterEggs = true;
        this.enableBoosts = true;
        this.enableBoss = true;
        this.enableAntiCheat = true;
        this.strictAntiCheat = true; //Stricter anti-cheat
        this.saveScoreToServer = true;
        this.tournamentMode = true;
        this.tournamentData = config.tournamentData || null;
        this.theme = 'coraluna';
        this.customEnemies = true; //Coraluna-specific enemies
    }

    async init() {
        await super.init();

        //Initialize FPS counter for anti-cheat
        if (window.startFPSCounter) {
            window.startFPSCounter();
        }

        //Initialize Coraluna resources
        if (window.CORALUNA_RESOURCES) {
            this.loadCoralunaResources();
        }

    }

    loadCoralunaResources() {
        //Load Coraluna-specific resources
        //TODO: implement custom image loading
    }

    start() {
        super.start();

        //Coraluna theme
        if (window.themeManager) {
            window.themeManager.switchTheme('coraluna');
        }
    }

    //GameEngine calls handleGameOver when player dies
    //This method must be defined, otherwise nothing will happen
    handleGameOver() {
        this.showGameOver();
    }

    //Override Game Over display method for tournament mode
    async showGameOver() {

        //Stop game loop
        this.gameState = 'gameover';

        //IMPORTANT: Clear all boosts on Game Over
        if (window.clearAllBoosts) {
            window.clearAllBoosts();
        }

        //In tournament mode use tournament-adapter to handle Game Over
        //IMPORTANT: Get current attempt number directly from window.tournamentData
        const currentAttemptNumber = window.tournamentData?.attempt ||
                                     (window.tournamentLobby?.playerAttempts || 0) + 1;

        const gameResult = {
            score: this.score,
            level: this.level,
            lives: this.lives,
            duration: this.gameStartTime ? Date.now() - this.gameStartTime : 0,
            enemiesKilled: this.enemiesKilled || 0,
            attempt: currentAttemptNumber
        };


        //PRIORITY 1: Call onGameOver callback (it will save score AND show UI)
        if (window.tournamentAdapter && window.tournamentAdapter.tournamentCallbacks &&
            typeof window.tournamentAdapter.tournamentCallbacks.onGameOver === 'function') {
            await window.tournamentAdapter.tournamentCallbacks.onGameOver(gameResult);
        }
        //PRIORITY 2: Only show UI if callback doesn't exist
        else if (window.tournamentAdapter && typeof window.tournamentAdapter.showTournamentGameOver === 'function') {
            window.tournamentAdapter.showTournamentGameOver(gameResult);
        }
        //Fallback to tournament-ui directly
        else if (window.tournamentUI && typeof window.tournamentUI.handleGameOver === 'function') {
            await window.tournamentUI.handleGameOver(gameResult);
        } else {
            console.warn(' Tournament adapter not available or not properly initialized');
        }

        //DO NOT call super.showGameOver() - it searches for elements that don't exist on tournament page
    }

    //Override method for saving tournament results
    async saveScore() {
        if (!this.saveScoreToServer || !this.tournamentData) return;

        try {
            await window.apiClient.submitTournamentScore({
                tournamentId: this.tournamentData.id,
                score: this.score,
                level: this.level
            });
        } catch (error) {
            console.error('Failed to save tournament score:', error);
        }
    }
}
