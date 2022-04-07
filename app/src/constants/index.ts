export const TOKEN_ADDRESS = {
    "CFTI": '0xAEf9e6c638e1Bc76cb4780514B7D6DC96722A3ee',
    "SEEDER": '0xf34b97eAAa9cE5f9DC9F0A146cB4b2969Ee82FB8',
    "SEED_STORAGE": "0x49b611E9EC4aE6d6C76332432413ceBa1c10d813",
    "CONFETTI_ROLL": "0xEb631D1a97B5B488B7f3fDCc98A123ab52442E2A"
}

import ConfettiRoll from '../../../contract/build/contracts/ConfettiRoll.json';
export const ROLL_ABI = ConfettiRoll.abi;
import TestSeederV2 from '../../../contract/build/contracts/TestSeederV2.json';
export const TEST_SEEDERV2_ABI = TestSeederV2.abi;
import TestSeedStorage from '../../../contract/build/contracts/TestSeedStorage.json';
export const TEST_SEED_STORAGE_ABI = TestSeedStorage.abi;

export const SEEDERV2_ABI = [
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "subscriptionId",
                "type": "uint64"
            },
            {
                "internalType": "address",
                "name": "link",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "coordinator",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "keyHash",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "batch",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "seederv1",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "seedStorage",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "requestStorage",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "admin",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "batchCadence",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "have",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "want",
                "type": "address"
            }
        ],
        "name": "OnlyCoordinatorCanFulfill",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "origin",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "Requested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "previousAdminRole",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "newAdminRole",
                "type": "bytes32"
            }
        ],
        "name": "RoleAdminChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "RoleGranted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "RoleRevoked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "identifier",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "randomness",
                "type": "uint256"
            }
        ],
        "name": "Seeded",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "INTERNAL_CALLER_ROLE",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "origin",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "executeRequest",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "executeRequestMulti",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getBatch",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "origin",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getData",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "batch",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "randomnessId",
                        "type": "bytes32"
                    }
                ],
                "internalType": "struct Randomness.SeedData",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "randomnessId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "origin",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "startIdx",
                "type": "uint256"
            }
        ],
        "name": "getIdReferenceCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "randomnessId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "origin",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "startIdx",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "count",
                "type": "uint256"
            }
        ],
        "name": "getIdentifiers",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getNextAvailableBatch",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "batch",
                "type": "uint256"
            }
        ],
        "name": "getReqByBatch",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            }
        ],
        "name": "getRoleAdmin",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getRoleMember",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            }
        ],
        "name": "getRoleMemberCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "origin",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getSeed",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "origin",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getSeedSafe",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSubscriptionId",
        "outputs": [
            {
                "internalType": "uint64",
                "name": "",
                "type": "uint64"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "hasRole",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "origin",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "isSeeded",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "internalType": "uint256[]",
                "name": "randomWords",
                "type": "uint256[]"
            }
        ],
        "name": "rawFulfillRandomWords",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "renounceRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "requestSeed",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "batchCadence",
                "type": "uint256"
            }
        ],
        "name": "setBatchCadence",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            }
        ],
        "name": "setFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "subscriptionId",
                "type": "uint64"
            }
        ],
        "name": "setSubscriptionId",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const DefaultProviderName = 'DEFAULT'
