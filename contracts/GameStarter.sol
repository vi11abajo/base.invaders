// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GameStarter
 * @notice Simple contract to initiate Base Invaders game sessions via on-chain transaction
 * @dev Extremely gas-efficient - only increments counters and emits event
 */
contract GameStarter {
    /// @notice Emitted when a player starts a new game
    /// @param player Address of the player starting the game
    /// @param timestamp Block timestamp when game was started
    /// @param gameCount Total number of games this player has started
    event GameStarted(
        address indexed player,
        uint256 indexed timestamp,
        uint256 gameCount
    );

    /// @notice Number of games started per player (auto-generates getter: playerGameCount(address))
    mapping(address => uint256) public playerGameCount;

    /// @notice Total games started across all players (auto-generates getter: totalGamesStarted())
    uint256 public totalGamesStarted;

    /**
     * @notice Start a new game session by signing this transaction
     * @dev Increments player count, total count, and emits GameStarted event
     */
    function startGame() external {
        playerGameCount[msg.sender]++;
        totalGamesStarted++;

        emit GameStarted(
            msg.sender,
            block.timestamp,
            playerGameCount[msg.sender]
        );
    }
}
