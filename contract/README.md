# Developing the smart contract

### Compile
```
yarn install # Pull @openzeppelin/contracts
truffle compile
```

### Migrate to local testnet
```
npx ganache-cli # Or install it globally
truffle migrate
```

### Deploy

If you want to use the Ledger, make sure that either `node-hid` has pre-built
binaries or the relevant system dependencies are installed:

#### Ubuntu
```
sudo apt install libusb-1.0.0-dev libudev-dev
```