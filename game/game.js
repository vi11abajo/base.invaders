//PHAROS INVADERS - MAIN GAME MODULE
//Main file - export all classes and systems
//VERSION: 20251218001

//Core
export { GameEngine } from './core/game-engine.js?v=20251227003';
export { GAME_CONSTANTS, MAX_LIVES, PERFORMANCE_SETTINGS, isMobileDevice } from './core/game-constants.js?v=20251218001';
export { DEFAULT_CONFIG, TOURNAMENT_CONFIG, CORALUNA_CONFIG } from './core/game-config.js?v=20251218001';

//Game Modes
export { RegularGame } from './modes/regular-game.js?v=20251218001';
export { TournamentGame } from './modes/tournament-game.js?v=20251218001';
export { CoralunaGame } from './modes/coraluna-game.js?v=20251218001';

//Systems
export { fastCollisionCheck, broadPhaseCollisionCheck } from './systems/physics.js';
export { setPlayerShadow, setCrabShadow, clearShadow } from './systems/rendering.js';
export { createSafeInterval, createSafeTimeout, clearAllGameTimers } from './systems/utils.js';

//Features
export { ToastySystem, SailorSystem, EasterEggManager } from './features/easter-eggs.js';

//Convenience function for FAST creation game
export function createGame(mode = 'regular', config = {}) {
    switch (mode) {
        case 'tournament':
            return new TournamentGame(config);
        case 'coraluna':
            return new CoralunaGame(config);
        default:
            return new RegularGame(config);
    }
}
