// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./RpSeeder.sol";

/// @title A Death Roll-inspired game for Raid Party
/// @author xanewok.eth
/// @notice The games uses $CFTI, the native Raid Party token
contract ConfettiRoll is AccessControlEnumerable, Ownable, Pausable {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    IERC20 public immutable confetti;
    RpSeeder public immutable seeder;
    address public immutable treasury;
    uint256 public tipAmount;
    uint256 public treasuryAmount;

    uint256 public treasuryFee = 500; // 5%
    uint256 public betTip = 25; // 0.25%
    uint256 constant FEE_PRECISION = 1e4;

    uint256 public minBet = 1e17; // 0.1 $CFTI
    uint256 public maxBet = 150e18; // 150 $CFTI
    uint256 public defaultBet = 15e18; // 15 $CFTI

    uint256 public minStartingRoll = 2;
    uint256 public maxStartingRoll = 1000;
    uint256 public defaultStartingRoll = 100;

    uint256 public defaultMaxParticipants = 100;

    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    struct Game {
        uint256 roundNum;
        uint256 poolBet;
        address[] participants;
        uint256 startingRoll;
        uint256 maxParticipants;
    }

    struct GameResult {
        address[] players;
        // The player who rolled last is the loser
        uint256[] rolls;
        uint256 prizeShare;
    }

    event PlayerLost(bytes32 indexed gameId, address indexed player);
    event GameCreated(bytes32 indexed gameId);
    event PlayerJoined(bytes32 indexed gameId, address indexed player);

    mapping(bytes32 => GameResult) gameResults;
    mapping(bytes32 => Game) games;

    mapping(address => EnumerableSet.Bytes32Set) pendingGames;

    constructor(
        IERC20 confetti_,
        address seeder_,
        address treasury_
    ) {
        _setupRole(TREASURY_ROLE, treasury_);

        seeder = RpSeeder(seeder_);
        treasury = treasury_;
        confetti = confetti_;
        tipAmount = 0;
        treasuryAmount = 0;
    }

    function setTreasuryFee(uint256 treasuryFee_)
        public
        onlyRole(TREASURY_ROLE)
    {
        require(treasuryFee_ <= 1500, "Let the gamblers gamble in peace");
        treasuryFee = treasuryFee_;
    }

    function withdrawTax() public onlyRole(TREASURY_ROLE) {
        require(treasuryAmount > 0, "Nothing to withdraw");
        confetti.transfer(treasury, treasuryAmount);
        treasuryAmount = 0;
    }

    function withdrawTip() public onlyOwner {
        require(tipAmount > 0, "Nothing to withdraw");
        confetti.transfer(owner(), tipAmount);
        tipAmount = 0;
    }

    function setBetTip(uint256 betTip_) public onlyOwner {
        betTip = betTip_;
    }

    function setBets(
        uint256 min,
        uint256 max,
        uint256 default_
    ) public onlyOwner {
        minBet = min;
        maxBet = max;
        defaultBet = default_;
    }

    function setStartingRolls(
        uint256 min,
        uint256 max,
        uint256 default_
    ) public onlyOwner {
        minStartingRoll = min;
        maxStartingRoll = max;
        defaultStartingRoll = default_;
    }

    function setDefaultMaxParticipants(uint256 value) public onlyOwner {
        defaultMaxParticipants = value;
    }

    /// @dev We piggyback on the RaidParty batch seeder for our game round abstraction
    function currentRound() public view returns (uint256) {
        return seeder.getBatch();
    }

    /// @notice Return generated random words for a given game round
    function getSeed(uint256 roundNum) public view returns (uint256) {
        bytes32 reqId = seeder.getReqByBatch(roundNum);
        return seeder.getRandomness(reqId);
    }

    function getGame(bytes32 gameId) public view returns (Game memory) {
        return games[gameId];
    }

    function getGameResults(bytes32 gameId)
        public
        view
        returns (GameResult memory)
    {
        return gameResults[gameId];
    }

    function isGameFinished(bytes32 gameId) public view returns (bool) {
        return gameResults[gameId].rolls.length != 0;
    }

    /// @notice Given a game result, return an address of a player who lost
    function getLoser(GameResult memory result) public pure returns (address) {
        if (result.rolls.length == 0) {
            return address(0x0);
        }
        uint256 loserIdx = (result.rolls.length - 1) % result.players.length;
        return result.players[loserIdx];
    }

    function getRolls(bytes32 gameId) public view returns (uint256[] memory) {
        Game memory game = games[gameId];
        uint256 seed = getSeed(game.roundNum);
        require(seed != 0, "Game not seeded yet");
        require(game.participants.length >= 2, "Need at least 2 players");
        // NOTE: The part below is the same as `simulateGame` only with
        // remembering the roll values (which are originally not to save gas).

        // The upper bound for the number of rolls is the starting roll value
        uint256[] memory rolls = new uint256[](game.startingRoll);

        uint256 roll = game.startingRoll;
        uint256 rollCount = 0;
        while (roll > 0) {
            // NOTE: `roll` is always in the [1, game.startingRoll - 1] range
            // here, as we start if it's positive and we always use modulo,
            // starting from the `game.startingRoll`
            roll = uint256(keccak256(abi.encodePacked(rollCount, seed))) % roll;
            rolls[rollCount] = roll + 1;
            rollCount++;
        }
        // NOTE: This is meant to be executed as read-only function, so it's fine
        // to copy over the results to truncate the rolls array;
        uint256[] memory returnedRolls = new uint256[](rollCount);
        for (uint256 i = 0; i < rollCount; i++) {
            returnedRolls[i] = rolls[rollCount];
        }
        return returnedRolls;
    }

    /// @notice Returns a list of outstanding games for the player
    function getPendingGames(address player)
        public
        view
        returns (bytes32[] memory)
    {
        bytes32[] memory pendingGames_ = new bytes32[](
            pendingGames[player].length()
        );
        for (uint256 i = 0; i < pendingGames[player].length(); i++) {
            pendingGames_[i] = pendingGames[player].at(i);
        }
        return pendingGames_;
    }

    /// @notice Returns whether the player is eligible to collect a prize for a given game
    function canCollectReward(address player, bytes32 gameId)
        public
        view
        returns (bool)
    {
        return (isGameFinished(gameId) &&
            getLoser(gameResults[gameId]) != player);
    }

    /// @notice Returns a total amount of claimable rewards by the player
    function getPendingRewards(address player) public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < pendingGames[player].length(); i++) {
            bytes32 gameId = pendingGames[player].at(i);
            if (canCollectReward(player, gameId)) {
                sum += gameResults[gameId].prizeShare;
            }
        }
        return sum;
    }

    /// @notice Process and clear every outstanding game, collecting the rewards
    function withdrawRewards() public whenNotPaused returns (uint256) {
        address player = msg.sender;
        uint256 rewards = 0;

        for (uint256 i = 0; i < pendingGames[player].length(); ) {
            bytes32 gameId = pendingGames[player].at(i);
            if (canCollectReward(player, gameId)) {
                rewards += gameResults[gameId].prizeShare;
            }
            // NOTE: This is the main function that is responsible for clearing
            // up pending games (e.g. for UI reasons), so make sure to clear up
            // pending *lost* games as well, even if we didn't collect a prize
            if (isGameFinished(gameId)) {
                pendingGames[player].remove(gameId);
                // Deleting an element might've shifted the order of the elements
                // and since we're deleting while iterating (a Bad Idea^TM),
                // simply start iterating from the start to be safe
                i = 0;
            } else {
                i++;
            }
        }

        confetti.transfer(msg.sender, rewards);
        return rewards;
    }

    /// @notice Calculates the game identifier for a given game initializer and roundNum
    function calcGameId(address initializer, uint256 roundNum)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(initializer, roundNum));
    }

    /// @notice Returns a game identifier for the currently running, global game
    function currentGlobalGameId() public view returns (bytes32) {
        return calcGameId(address(this), currentRound());
    }

    // Anyone can join the game for the current round where either they are the
    // initializer and they can set a custom bet or they can create a global
    // game per round with a default bet amount
    /// @notice Create a new game
    /// @param initializer needs to be an address of the contract or the sender
    /// @param poolBet The amount of money that the player enters with. Use 18 decimals, just like for $CFTI
    /// @param maxParticipants The maximum number of players that can join the game
    /// @param startingRoll The upper roll that the game begins with
    /// @param roundNum The round when the game will be played. Must be bigger than the current round
    function createGame(
        address initializer,
        uint256 poolBet,
        uint256 startingRoll,
        uint256 maxParticipants,
        uint256 roundNum
    ) public whenNotPaused returns (bytes32) {
        if (startingRoll == 0) {
            startingRoll = defaultStartingRoll;
        }
        if (poolBet == 0) {
            poolBet = defaultBet;
        }
        if (maxParticipants < 2) {
            maxParticipants = defaultMaxParticipants;
        }
        uint256 seed = getSeed(roundNum);
        require(seed == 0, "Game already seeded");
        require(
            roundNum >= currentRound(),
            "Can't create games for past rounds"
        );
        require(
            poolBet >= minBet && poolBet <= maxBet,
            "Bet outside legal range"
        );
        require(
            startingRoll >= minStartingRoll && startingRoll <= maxStartingRoll,
            "Start roll outside legal range"
        );
        // Allow for creating a custom game with the sender as initializer or
        // a "global" (per round) one that needs to have default values set
        require(
            initializer == msg.sender ||
                (initializer == address(this) &&
                    poolBet == defaultBet &&
                    startingRoll == defaultStartingRoll &&
                    maxParticipants == defaultMaxParticipants)
        );
        bytes32 gameId = calcGameId(initializer, roundNum);
        require(!isGameFinished(gameId), "Game already finished");

        games[gameId] = Game({
            poolBet: poolBet,
            roundNum: roundNum,
            startingRoll: startingRoll,
            maxParticipants: maxParticipants,
            participants: new address[](0)
        });

        emit GameCreated(gameId);
        return gameId;
    }

    /// @notice Join the given game. Needs $CFTI approval as the player needs to deposit the pool bet in order to play.
    function joinGame(bytes32 gameId) public whenNotPaused {
        Game memory game = games[gameId];
        require(game.startingRoll > 0, "Game doesn't exist yet");
        require(!isGameFinished(gameId), "Game already finished");
        // Mitigate possible front-running - close the game sign-ups about a minute
        // before the seeder can request randomness. The RP seeder is pre-configured
        // to require 3 block confirmations, so 60 seconds makes sense (< 3 * 14s)
        uint256 seed = getSeed(game.roundNum);
        require(seed == 0, "Game already seeded");
        require(
            seeder.getNextAvailableBatch() > (block.timestamp + 60),
            "Seed imminent; sign-up is closed"
        );
        require(!pendingGames[msg.sender].contains(gameId), "Already joined");
        require(
            games[gameId].participants.length < game.maxParticipants &&
                games[gameId].participants.length <= (FEE_PRECISION / betTip),
            "Too many players"
        );

        uint256 tip = (game.poolBet * betTip) / FEE_PRECISION;
        tipAmount += tip;
        confetti.transferFrom(msg.sender, address(this), game.poolBet);

        games[gameId].participants.push(msg.sender);
        pendingGames[msg.sender].add(gameId);
        emit PlayerJoined(gameId, msg.sender);
    }

    /// @notice A convenient method to join the currently running global game
    function joinGlobalGame() public whenNotPaused returns (bytes32) {
        bytes32 globalGameId = currentGlobalGameId();
        // Lazily create a global game if there isn't one already
        if (games[globalGameId].startingRoll == 0) {
            createGame(
                address(this),
                defaultBet,
                defaultStartingRoll,
                defaultMaxParticipants,
                currentRound()
            );
        }
        joinGame(globalGameId);
        return globalGameId;
    }

    /// @return Shuffled randomly players from the given ones, using supplied seed
    function shuffledPlayers(address[] memory players, uint256 seed)
        public
        pure
        returns (address[] memory)
    {
        address[] memory shuffled = players;

        address temp;
        uint256 pick;
        for (uint256 i = 0; i < players.length; i++) {
            // Randomly pick a value from i (incl.) till the end of the array
            // To further increase randomness entropy, add the current player address
            pick =
                uint256(keccak256(abi.encodePacked(players[i], seed))) %
                (players.length - i);
            temp = shuffled[i];
            // Save the randomly picked number as the i-th address in the sequence
            shuffled[i] = shuffled[i + pick];
            // Return the original value to the pool that we pick from
            shuffled[i + pick] = temp;
        }

        return shuffled;
    }

    /// @dev Given an unitialized yet game, simulate the game and commit the results to the storage
    function simulateGame(bytes32 gameId)
        internal
        whenNotPaused
        returns (GameResult storage)
    {
        require(!isGameFinished(gameId), "Game already finished");
        Game memory game = games[gameId];

        uint256 seed = getSeed(game.roundNum);
        require(seed > 0, "Game not seeded yet");
        // To remove any bias from the order that players registered with, make
        // sure to shuffle them before starting the actual game
        address[] memory players = shuffledPlayers(game.participants, seed);
        gameResults[gameId].players = players;
        uint256[] storage rolls = gameResults[gameId].rolls;

        uint256 roll = game.startingRoll;
        while (roll > 0) {
            // NOTE: `roll` is always in the [1, game.startingRoll - 1] range
            // here, as we start if it's positive and we always use modulo,
            // starting from the `game.startingRoll`
            unchecked {
                roll =
                    uint256(keccak256(abi.encodePacked(rolls.length, seed))) %
                    roll;
                rolls.push(roll + 1);
            }
        }

        return gameResults[gameId];
    }

    /// @notice Simulates a given game, assuming it's been seeded since its creation
    function commenceGame(bytes32 gameId) public whenNotPaused {
        Game memory game = games[gameId];

        require(game.participants.length > 0, "No players in the game");
        if (game.participants.length == 1) {
            // Not much of a game if we have a single participant, return the bet
            confetti.transfer(game.participants[0], game.poolBet);
            pendingGames[game.participants[0]].remove(gameId);
            return;
        }

        GameResult storage results = simulateGame(gameId);
        require(isGameFinished(gameId), "Game not finished after simul.");

        address loser = getLoser(results);
        emit PlayerLost(gameId, loser);

        // Tax the prize money for the treasury
        uint256 collectedBetTip = (game.poolBet * betTip) / FEE_PRECISION;
        uint256 payableBet = game.poolBet - collectedBetTip;
        uint256 treasuryShare = (payableBet * treasuryFee) / FEE_PRECISION;
        treasuryAmount += treasuryShare;

        // Split the remaining prize pool among the winners; they need to collect
        // them themselves to amortize gas cost of the game simulation
        results.prizeShare =
            // Original bet
            payableBet +
            // Taxed prize pool that's split among everyone
            (payableBet - treasuryShare) /
            (results.players.length - 1);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
