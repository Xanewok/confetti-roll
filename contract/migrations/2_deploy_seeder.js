const TestSeederV2 = artifacts.require("TestSeederV2");
const TestSeedStorage = artifacts.require("TestSeedStorage");
const RpSeeder = artifacts.require("RpSeeder");

module.exports = async function (deployer, network, accounts) {
  const chainId = await web3.eth.net.getId();

  if (network === 'live' || chainId === 0x1) {
    seederV2Address = "0x2Ed251752DA7F24F33CFbd38438748BB8eeb44e1";
    seedStorageAddress = "0xFc8f72Ac252d5409ba427629F0F1bab113a7492F";

    await deployer.deploy(RpSeeder, seederV2Address, seedStorageAddress);
  } else {
    await deployer.deploy(TestSeederV2);
    await deployer.deploy(TestSeedStorage);

    await deployer.deploy(RpSeeder, TestSeederV2.address, TestSeedStorage.address);
  }
};
