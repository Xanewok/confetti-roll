import { Contract } from '@ethersproject/contracts'

import { ERC20 } from '@usedapp/core'
import ConfettiRoll from '../../../contract/build/contracts/ConfettiRoll.json'
import ISeederV2 from '../../../contract/build/contracts/ISeederV2.json'

export const TOKEN_ADDRESS = {
  CFTI: '0xAEf9e6c638e1Bc76cb4780514B7D6DC96722A3ee',
  SEEDER: '0xf34b97eAAa9cE5f9DC9F0A146cB4b2969Ee82FB8',
  CONFETTI_ROLL: '0xEb631D1a97B5B488B7f3fDCc98A123ab52442E2A',
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
