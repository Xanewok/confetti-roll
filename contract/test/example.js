const assert = require("assert");

const TestConfetti = artifacts.require("TestConfetti");
const TestSeederV2 = artifacts.require("TestSeederV2");
const TestSeedStorage = artifacts.require("TestSeedStorage");
const ConfettiRoll = artifacts.require("ConfettiRoll");

// Returns a current timestamp in *seconds* - similar to `block.timestamp`.
const timestamp = () => Math.trunc(new Date().getTime() / 1000);

async function mintAndApprove(address, amount) {
  const confetti = await TestConfetti.deployed();
  await confetti.burn(await confetti.balanceOf(address), { from: address });
  await confetti.mint(address, amount);
  await confetti.approve(ConfettiRoll.address, amount, { from: address });
}

async function balanceOf(address) {
  const confetti = await TestConfetti.deployed();
  console.log(
    `${address.slice(0, 6)} $CFTI balance: ${await confetti.balanceOf(address)}`
  );
}

async function playerRolls(gameId) {
  const roll = await ConfettiRoll.deployed();
  let results = await roll.getGameResults(gameId);

  return results.rolls.map((val, idx) => ({
    roll: val,
    player: results.players[idx % results.players.length],
  }));
}

async function setSeedForRound(roundNum, seed) {
  const seederV2 = await TestSeederV2.deployed();
  const seedStorage = await TestSeedStorage.deployed();
  const roll = await ConfettiRoll.deployed();

  const reqId = await web3.utils.keccak256(`My test prefix ${roundNum}`);
  await seederV2.setBatchToReqId(roundNum, reqId);
  await seedStorage.setRandomness(reqId, seed);

  assert.equal(seed, await roll.getSeed(roundNum));
}

async function setRound(roundNum) {
  const seederV2 = await TestSeederV2.deployed();
  await seederV2.setBatch(roundNum);
}

contract("ConfettiRoll", (accounts) => {
  beforeEach(async () => {
    for (const account of accounts.slice(0, 4)) {
      await mintAndApprove(account, "1000000000000000000000"); // 1000 $CFTI
      await balanceOf(account);
    }
  });

  beforeEach(async () => {
    const seederV2 = await TestSeederV2.deployed();
    // Mark seed as ready in 5 minutes (to work around front-running security measures)
    await seederV2.setLastBatchTimestamp(timestamp() + 5 * 60);

    await setRound(0);
    await setSeedForRound(0, 0);
  });

  it("passes simple global game", async () => {
    const roll = await ConfettiRoll.deployed();
    const roundNum = await roll.currentRound();
    console.log({ roundNum: roundNum.toString() });
    console.log(`Seed for ${roundNum}: ${await roll.getSeed(roundNum)}`);

    const treasury = accounts[9];

    console.log("Joining game...");
    for (const account of accounts.slice(0, 4)) {
      await roll.joinGlobalGame({ from: account });
    }
    for (const account of accounts.slice(0, 4)) {
      console.log(`Pending rewards ${account.slice(0, 4)}: ${await roll.getPendingRewards(account)}`);
    }

    console.log("Commencing game...");
    let gameId = await roll.currentGlobalGameId();
    await setSeedForRound(roundNum, 0x1337);
    console.log(`Seed for ${roundNum}: ${await roll.getSeed(roundNum)}`);
    await roll.commenceGame(gameId);
    const rolls = await playerRolls(gameId);
    console.log({ rolls });

    for (const account of accounts.slice(0, 4)) {
      await balanceOf(account);
    }

    for (const account of accounts.slice(0, 4)) {
      console.log(`Pending rewards ${account.slice(0, 4)}: ${await roll.getPendingRewards(account)}`);
    }

    await roll.withdrawRewards();

    for (const account of accounts.slice(0, 4)) {
      console.log(`Pending rewards ${account.slice(0, 4)}: ${await roll.getPendingRewards(account)}`);
    }

    await balanceOf(accounts[0]);
    await roll.withdrawTip();
    await balanceOf(accounts[0]);

    await balanceOf(treasury);
  });

  it("passes simple custom game", async () => {
    const roll = await ConfettiRoll.deployed();
    const roundNum = await roll.currentRound();

    const betSize = "10000000000000000000"; // 10 $CFTI
    const startingRoll = 420;
    const maxParticipants = 10;
    await roll.createGame(accounts[0], betSize, startingRoll, maxParticipants, roundNum);

    const gameId = await roll.calcGameId(accounts[0], roundNum);
    await roll.joinGame(gameId, { from: accounts[0] });
    await roll.joinGame(gameId, { from: accounts[1] });

    await setSeedForRound(roundNum, 1337);
    await roll.commenceGame(gameId);
    const rolls = await playerRolls(gameId);
    console.log({ rolls });

    for (const account of accounts.slice(0, 2)) {
      await balanceOf(account);
    }
  });

  contract("ConfettiRoll", accounts => {
    it("asserts that games can't be seeded prior to creation", async () => {
      await setRound(0x539);
      const roll = await ConfettiRoll.deployed();
      const roundNum = await roll.currentRound();
      assert.equal(0x539, roundNum);

      await setSeedForRound(roundNum, 123);
      await assert.rejects(() => roll.joinGlobalGame());

      await setSeedForRound(roundNum, 0);
      await roll.joinGlobalGame();
    });
  });

  contract("ConfettiRoll", accounts => {
    it("asserts that game sign-ups are closed before the seed may be ready", async () => {
      const seederV2 = await TestSeederV2.deployed();
      const roll = await ConfettiRoll.deployed();
      const roundNum = await roll.currentRound();

      // Seed ready in 5 seconds - to prevent possible front-running we should
      // disallow joining games
      await seederV2.setLastBatchTimestamp(timestamp() + 5);
      await assert.rejects(() => roll.joinGlobalGame());
      // But 1 minute prior should be safe
      await seederV2.setLastBatchTimestamp(timestamp() + 61);
      await roll.joinGlobalGame();
    });
  });

  contract("ConfettiRoll", accounts => {
    it("asserts that game max participants limit is enforced", async () => {
      const seederV2 = await TestSeederV2.deployed();
      const roll = await ConfettiRoll.deployed();
      const roundNum = await roll.currentRound();

      const betSize = "10000000000000000000"; // 10 $CFTI
      const startingRoll = 100;
      const maxParticipants = 2;
      await roll.createGame(accounts[0], betSize, startingRoll, maxParticipants, roundNum);
      const gameId = await roll.calcGameId(accounts[0], roundNum);

      await roll.joinGame(gameId, { from: accounts[0] })
      await roll.joinGame(gameId, { from: accounts[1] })
      await assert.rejects(() => roll.joinGame(gameId, { from: accounts[2] }));

      const game = await roll.getGame(gameId);
      assert.equal(game.participants.length, maxParticipants);
    });
  });

  it("asserts that default max participants limit is enforced", async () => {
    const seederV2 = await TestSeederV2.deployed();
    const roll = await ConfettiRoll.deployed();

    await setRound(0x123);

    await roll.setDefaultMaxParticipants(3);
    await roll.joinGlobalGame({ from: accounts[0] })
    await roll.joinGlobalGame({ from: accounts[1] })
    await roll.joinGlobalGame({ from: accounts[2] })
    await assert.rejects(() => roll.joinGlobalGame({ from: accounts[3] }));

    const game = await roll.getGame(await roll.currentGlobalGameId());
    assert.equal(game.participants.length, 3);
  });
});
