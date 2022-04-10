import { useCall } from '@usedapp/core'
import { Contract } from '@ethersproject/contracts'
import { TOKEN_ADDRESS, TOKEN_ABI, AVG_BLOCK_TIME } from '../constants'

export const RAID_CONTRACT = new Contract(TOKEN_ADDRESS['RAID'], TOKEN_ABI)

export const BOSS_TYPES = [
  'Basic',
  'Strong',
  'Epic',
  'Mythic',
  'Legendary',
  'Godly',
]

export type RaidBoss = {
  weight: any
  blockHealth: any
  multiplier: any
}

// https://etherscan.io/address/0x3932deac6405edb53a3a020ef6e860f1536b412d#code#F10#L507
export const roundRewards = (
  blocks: number,
  bossMultiplier: number,
  dmgPerBlock: number
) => blocks * dmgPerBlock * bossMultiplier

export const useRaidBosses = (boss: number) => {
  const { value, error } =
    useCall({
      contract: RAID_CONTRACT, // instance of called contract
      method: 'bosses', // Method to be called
      args: [boss || 0], // Method arguments
    }) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return value as unknown as RaidBoss
}

export const useExpectedYield = (dpb: number) => {
  // We use a hard-coded constant so the number and the order of called hooks
  // will also be constant
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const bosses = BOSS_TYPES.map((value, index) => useRaidBosses(index)).filter(
    (boss) => boss
  )
  const totalWeight = bosses
    .map((boss) => boss?.weight)
    .reduce((acc, cur) => acc + cur, 0)

  const expectedBlockEarnings = bosses
    .map((boss) => {
      const spawnChance = boss?.weight / totalWeight
      const blockEarnings = dpb * boss?.multiplier
      return spawnChance * blockEarnings
    })
    .reduce((prev, curr) => prev + curr, 0)

  const secondsInDay = 60 * 60 * 24

  return expectedBlockEarnings * (secondsInDay / AVG_BLOCK_TIME)
}

export const useRaidData = () => {
  const { value, error } =
    useCall({
      contract: RAID_CONTRACT, // instance of called contract
      method: 'getRaidData', // Method to be called
      args: [], // Method arguments
    }) ?? {}
  if (error) {
    console.error(error.message)
    return 0
  }

  // console.log(value)
  return value?.[0]
}

export const useUnclaimedCFTI = (address: string | null | undefined) => {
  const { value, error } =
    useCall(
      address &&
        TOKEN_ADDRESS['RAID'] && {
          contract: RAID_CONTRACT, // instance of called contract
          method: 'getPendingRewards', // Method to be called
          args: [address], // Method arguments
        }
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return value?.[0]
}
