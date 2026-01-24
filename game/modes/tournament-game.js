//PHAROS INVADERS - TOURNAMENT GAME MODE
//tournament mode with withand andand

import { GameEngine } from '../core/game-engine.js?v=20251227003';
import { TOURNAMENT_CONFIG } from '../core/game-config.js?v=20251218001';

export class TournamentGame extends GameEngine {
    constructor(config = {}) {
        super({
            mode: 'tournament',
            ...TOURNAMENT_CONFIG,
            ...config
        });

        this.enableEasterEggs = true;
        this.enableBoosts = true;
        this.enableBoss = true;
        this.enableAntiCheat = true;
        this.strictAntiCheat = true; //withtoand andand
        this.saveScoreToServer = true;
        this.tournamentMode = true;
        this.tournamentData = config.tournamentData || null;
    }

    async init() {
        await super.init();

        //Initialization FPS counter for andand
        if (window.startFPSCounter) {
            window.startFPSCounter();
        }

        console.log(' Tournament Game initialized');
    }

    start() {
        super.start();

        //in tournamentbut mode music DISABLED
        //( frominto)
    }

    //GameEngine inin handleGameOver at withand player
    //from method to , else and NOT from
    handleGameOver() {
        console.log(' Tournament handleGameOver called');
        this.showGameOver();
    }

    //method while Game Over for tournamentbut mode
    async showGameOver() {
        console.log(' Tournament showGameOver called');

        //Stopping andin andto
        this.gameState = 'gameover';

        //inbut: Clearing inwith boost at Game Over
        if (window.clearAllBoosts) {
            window.clearAllBoosts();
            console.log(' Cleared all boosts on game over');
        }

        //in tournamentbut mode tournament-adapter for fromtoand Game Over
        //inbut: tobut value toand ondirect from window.tournamentData
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

        console.log(` showGameOver: attempt = ${currentAttemptNumber} (from window.tournamentData.attempt = ${window.tournamentData?.attempt})`);

        //atand 1: inin toto onGameOver ( withand with and while UI)
        if (window.tournamentAdapter && window.tournamentAdapter.tournamentCallbacks &&
            typeof window.tournamentAdapter.tournamentCallbacks.onGameOver === 'function') {
            console.log(' Calling tournament callback onGameOver:', gameResult);
            await window.tournamentAdapter.tournamentCallbacks.onGameOver(gameResult);
            console.log(' onGameOver callback completed');
        }
        //atand 2: to whilein UI, if toto NOT
        else if (window.tournamentAdapter && typeof window.tournamentAdapter.showTournamentGameOver === 'function') {
            console.log(' No callback, calling showTournamentGameOver directly');
            window.tournamentAdapter.showTournamentGameOver(gameResult);
        }
        //Fallback on tournament-ui ondirect
        else if (window.tournamentUI && typeof window.tournamentUI.handleGameOver === 'function') {
            console.log(' Calling tournament UI handleGameOver:', gameResult);
            await window.tournamentUI.handleGameOver(gameResult);
        } else {
            console.warn(' Tournament adapter not available or not properly initialized');
        }

        //NOT inin super.showGameOver() - and elements, tofrom NOT on tournamentbut withand
    }

    //method for withNOTand resultin tournament
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
