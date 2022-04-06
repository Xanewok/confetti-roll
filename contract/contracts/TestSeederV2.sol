// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './ISeederV2.sol';

// Originally deployed at https://etherscan.io/address/0x2Ed251752DA7F24F33CFbd38438748BB8eeb44e1
contract TestSeederV2 is ISeederV2 {
    uint256 batch;
    mapping(uint256 => bytes32) batchToReqId;
    uint256 _lastBatchTimestamp = 1649198305;
    uint256 _batchCadence = 30;

    function setBatch(uint256 batch_) external {
        batch = batch_;
    }

    function setBatchToReqId(uint256 batch_, bytes32 reqId) external {
        batchToReqId[batch_] = reqId;
    }

    function setLastBatchTimestamp(uint256 value) external {
        _lastBatchTimestamp = value;
    }

    function getNextAvailableBatch() external view returns (uint256) {
        return _lastBatchTimestamp + _batchCadence;
    }

    function executeRequestMulti() external {
        batch = batch + 1;
        batchToReqId[batch] = keccak256(abi.encodePacked(batch));
        _lastBatchTimestamp = block.timestamp;
    }

    function getBatch() external override view returns (uint256) {
	    return batch;
    }
    function getReqByBatch(uint256 batch_) external override view returns (bytes32) {
        return batchToReqId[batch_];
    }
}
