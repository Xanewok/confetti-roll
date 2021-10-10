const RpSeeder = artifacts.require("RpSeeder");
const TestConfetti = artifacts.require("TestConfetti");
const ConfettiRoll = artifacts.require("ConfettiRoll");

async function deployConfetti(deployer, network, accounts) {
  const chainId = await web3.eth.net.getId();

  if (network === 'live' || chainId === 0x1) {
    return "0xCfef8857E9C80e3440A823971420F7Fa5F62f020";
  } else {
    await deployer.deploy(TestConfetti);

    const confetti = await TestConfetti.deployed();
    for (const account of accounts.slice(0, 4)) {
      await confetti.mint(account, "1000000000000000000000");
    }

    return TestConfetti.address;
  }
}

module.exports = async function (deployer, network, accounts) {
  const chainId = await web3.eth.net.getId();

  const confetti = deployConfetti(deployer, network, accounts);
  const treasury = chainId == 0x1 ? "0xcf2d2da4c2f9b0675a197febc6708704834f9c24" : accounts[0];

  await deployer.deploy(ConfettiRoll, confetti, RpSeeder.address, treasury);
};
