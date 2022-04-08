import { Contract } from '@ethersproject/contracts'

import { ERC20 } from '@usedapp/core'
import ConfettiRoll from '../../../contract/build/contracts/ConfettiRoll.json'
import ISeederV2 from '../../../contract/build/contracts/ISeederV2.json'

export const TOKEN_ADDRESS = {
  CFTI: '0xCfef8857E9C80e3440A823971420F7Fa5F62f020',
  SEEDER: '0xD9bc167E6C37b29F65E708C4Bb1D299937dFF718',
  CONFETTI_ROLL: '0x1fAaC523223fBf79667ab621653bd378093E8693',
}

export const CONFETTI_CONTRACT = new Contract(TOKEN_ADDRESS['CFTI'], ERC20.abi)

export const CONFETTI_ROLL_CONTRACT = new Contract(
  TOKEN_ADDRESS['CONFETTI_ROLL'],
  ConfettiRoll.abi
)

export const SEEDERV2_CONTRACT = new Contract(
  TOKEN_ADDRESS['SEEDER'],
  ISeederV2.abi
)
