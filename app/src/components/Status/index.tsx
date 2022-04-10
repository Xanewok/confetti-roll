import {
  Text,
  Box,
  Img,
  Flex,
  Progress,
  Grid,
  GridItem,
  Tooltip,
} from '@chakra-ui/react'
import BannerBox from '../Global/BannerBox'

import { BOSS_TYPES, roundRewards } from '../../contracts/raid'
import { useState, useEffect } from 'react'
import { useInterval } from '../../hooks/useInterval'
import {
  BossCrownBasic,
  BossCrownEpic,
  BossCrownGodly,
  BossCrownLegendary,
  BossCrownMythic,
  BossCrownStrong,
} from './BossCrowns'
import { AVG_BLOCK_TIME, CFTI_DECIMALS } from '../../constants'

type StatusProps = {
  bossTypeNum?: any
  bossHealth: any
  bossMaxHealth: any
  raidDmg: any
  avgYield: any
  multiplier: any
  unclaimedBalance: any
  tokenBalance: any
  connected: any
  usdPrice: any
  usdToggled: boolean
}

const calculateCFTI = ({
  blocks,
  multiplier,
  DPB,
}: {
  blocks: any
  multiplier: any
  DPB: any
}) => (blocks ? roundRewards(blocks, multiplier, DPB) / 10 ** CFTI_DECIMALS : 0)

const Status = ({
  bossTypeNum,
  bossHealth,
  bossMaxHealth,
  raidDmg,
  avgYield,
  multiplier,
  unclaimedBalance,
  tokenBalance,
  connected,
  usdPrice,
  usdToggled,
}: StatusProps) => {
  const [counter, setCounter] = useState(0)

  useInterval(() => {
    if (counter > 0) {
      setCounter(counter - 1)
    }
  }, 1000)

  useEffect(() => {
    setCounter((bossHealth + 1) * AVG_BLOCK_TIME)
  }, [bossHealth])

  const bossPercent = () => {
    return (bossHealth / AVG_BLOCK_TIME) * 100
  }

  const bossPercentInverse = () => {
    return (bossPercent() - 100) / -1
  }

  const timeLeft = (seconds: number) => {
    var date = new Date(1970, 0, 1)
    date.setSeconds(seconds)
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
  }

  const bossCfti = calculateCFTI({
    blocks: bossMaxHealth,
    multiplier,
    DPB: raidDmg,
  })
  const nextCfti = calculateCFTI({
    blocks: bossHealth,
    multiplier,
    DPB: raidDmg,
  })

  return (
    <BannerBox heading={'Current Raid'}>
      <Box p="16px" textAlign="center">
        {connected && (
          <Flex justify="center">
            <Flex h="32px">
              {bossTypeNum === 0 && <BossCrownBasic />}
              {bossTypeNum === 1 && <BossCrownStrong />}
              {bossTypeNum === 2 && <BossCrownEpic />}
              {bossTypeNum === 3 && <BossCrownMythic />}
              {bossTypeNum === 4 && <BossCrownLegendary />}
              {bossTypeNum === 5 && <BossCrownGodly />}
            </Flex>
          </Flex>
        )}
        {connected ? (
          <Text fontSize="lg">{BOSS_TYPES[bossTypeNum]} Boss Encounter</Text>
        ) : (
          <Text fontSize="xx-large" mb="20px" color="white">
            Not connected
          </Text>
        )}
        {connected && (
          <Grid>
            <GridItem>
              <Progress
                value={bossPercentInverse()}
                colorScheme="red"
                w="100%"
                my="24px"
              />
            </GridItem>
          </Grid>
        )}
        <Text fontSize="md" fontWeight="bold" color={connected ? '' : 'gray'}>
          Round Earnings:
        </Text>
        <Text color={connected ? '' : 'gray'}>
          <Text as="span" fontSize="md" color={connected ? 'white' : 'gray'}>
            {usdToggled
              ? ((bossCfti - nextCfti) * usdPrice).toFixed(3)
              : (bossCfti - nextCfti).toFixed(3)}
          </Text>{' '}
          of{' '}
          <Text as="span" color={connected ? 'white' : 'gray'} fontSize="md">
            {usdToggled
              ? (bossCfti * usdPrice).toFixed(3)
              : bossCfti.toFixed(3)}
          </Text>{' '}
          {usdToggled ? 'USD' : 'CFTI'}
        </Text>
        <Text fontSize="md" fontWeight="bold" color={connected ? '' : 'gray'}>
          Per Block:
        </Text>
        <Text color={connected ? '' : 'gray'}>
          <Text as="span" fontSize="md" color={connected ? 'white' : 'gray'}>
            {connected && usdToggled
              ? ((bossCfti / bossMaxHealth) * usdPrice).toFixed(4)
              : (bossCfti / bossMaxHealth).toFixed(4)}
          </Text>{' '}
          {usdToggled ? 'USD' : 'CFTI'}
        </Text>
        <Text fontSize="md" fontWeight="bold" color={connected ? '' : 'gray'}>
          Time Left:
        </Text>
        <Text>
          <Text as="span" fontSize="md" color={connected ? 'white' : 'gray'}>
            {timeLeft(counter)}
          </Text>
        </Text>
        <div style={{ marginTop: '1em' }}>
          <Text fontSize="md" fontWeight="bold" color={connected ? '' : 'gray'}>
            Avg Daily Earnings:
          </Text>
          <Text color={connected ? '' : 'gray'}>
            <Text as="span" fontSize="md" color={connected ? 'white' : 'gray'}>
              {usdToggled
                ? ((avgYield * usdPrice) / 10 ** CFTI_DECIMALS).toFixed(2)
                : (avgYield / 10 ** CFTI_DECIMALS).toFixed(2)}
            </Text>{' '}
            {usdToggled ? 'USD' : 'CFTI'}
          </Text>
        </div>
      </Box>
      {connected && (
        <Flex justify="space-between">
          <Flex>
            <Img h="27px" mt="3px" src="/dmg.png" pr="10px" />
            <Text>{raidDmg}</Text>
          </Flex>
          <Flex>
            <Img h="27px" mt="6px" src="/cfti.png" pr="10px" />
            <Tooltip
              bg="purple.300"
              color="white"
              placement="top"
              hasArrow
              label={
                <>
                  <Text>
                    Unclaimed: {unclaimedBalance.toFixed(3)} ($
                    {(unclaimedBalance * usdPrice).toFixed(3)})
                  </Text>
                  <Text>
                    Balance: {tokenBalance.toFixed(3)} ($
                    {(tokenBalance * usdPrice).toFixed(3)})
                  </Text>
                </>
              }
            >
              <Text>{unclaimedBalance.toFixed(3)}</Text>
            </Tooltip>
          </Flex>
        </Flex>
      )}
    </BannerBox>
  )
}

export default Status
