// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GameStarter
 * @dev Simple contract to initiate Base Invaders game sessions
 * @notice Players must call startGame() to begin playing
 */
contract GameStarter {
    // Events
    event GameStarted(
        address indexed player,
        uint256 indexed timestamp,
        uint256 gameCount
    );

    // Mapping to track number of games started per player
    mapping(address => uint256) public playerGameCount;

    // Total games started across all players
    uint256 public totalGamesStarted;

    /**
     * @dev Start a new game session
     * @notice This function emits an event to signal game start
     * @notice Extremely gas-efficient - only increments counters and emits event
     */
    function startGame() external {
        // Increment player's game count
        playerGameCount[msg.sender]++;

        // Increment total games count
        totalGamesStarted++;

        // Emit event
        emit GameStarted(
            msg.sender,
            block.timestamp,
            playerGameCount[msg.sender]
        );
    }

    /**
     * @dev Get number of games started by a specific player
     * @param player Address of the player
     * @return Number of games started
     */
    function getPlayerGameCount(address player) external view returns (uint256) {
        return playerGameCount[player];
    }

    /**
     * @dev Get total number of games started
     * @return Total game count
     */
    function getTotalGamesStarted() external view returns (uint256) {
        return totalGamesStarted;
    }
}
