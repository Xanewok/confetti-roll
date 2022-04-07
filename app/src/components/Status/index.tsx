import {
  Text,
  Box,
  Button,
  Img,
  Flex,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import BannerBox from '../Global/BannerBox'
import {
  useEthers,
  useCall,
  useTokenAllowance,
  useTokenBalance,
  ERC20,
} from '@usedapp/core'
import {
  ROLL_ABI,
  TEST_SEEDERV2_ABI,
  TEST_SEED_STORAGE_ABI,
  TOKEN_ADDRESS,
} from '../../constants'
import { useState, useEffect, useMemo, useCallback } from 'react'

import { Contract } from '@ethersproject/contracts'
import { keccak256 } from 'ethers/utils/solidity'
import DeathRoll, { PlayerRoll } from '../DeathRoll'

type StatusProps = {
  connected: any
}

const CONFETTI_ROLL_CONTRACT = new Contract(
  TOKEN_ADDRESS['CONFETTI_ROLL'],
  ROLL_ABI
)

function useConfettiRoll(method: string, ...args: Array<any>) {
  const { value, error } =
    useCall({
      contract: CONFETTI_ROLL_CONTRACT,
      method,
      args: [...args],
    }) ?? {}

  if (error) {
    console.error(error.message)
    return null
  }
  return value?.[0]
}

// FIXME: Well this got out of hand really quickly - ideally this should be
// refactored in tandem with the RP tracker made by Oktalize

const Status = ({ connected }: StatusProps) => {
  const toast = useToast()
  const { account, library } = useEthers()
  const tokenAllowance = useTokenAllowance(
    TOKEN_ADDRESS['CFTI'],
    account,
    TOKEN_ADDRESS['CONFETTI_ROLL']
  )
  const cftiBalance = useTokenBalance(TOKEN_ADDRESS['CFTI'], account)

  const contracts = useMemo(
    () => ({
      seederV2: new Contract(TOKEN_ADDRESS['SEEDER'], TEST_SEEDERV2_ABI),
      seedStorage: new Contract(
        TOKEN_ADDRESS['SEED_STORAGE'],
        TEST_SEED_STORAGE_ABI
      ),
      confettiRoll: CONFETTI_ROLL_CONTRACT,
      confetti: new Contract(TOKEN_ADDRESS['CFTI'], ERC20.abi),
    }),
    []
  )

  const showErrorToast = useCallback(
    (err: any) => {
      console.error(JSON.stringify(err))
      const error = err.error || err
      toast({
        description: `${error.message}`,
        status: 'error',
        duration: 3000,
      })
    },
    [toast]
  )

  const signer = useMemo(
    () => account && library?.getSigner(),
    [account, library]
  )

  const globalGameId = useConfettiRoll('currentGlobalGameId')
  const globalGame = useConfettiRoll('getGame', globalGameId)
  const currentRound = useConfettiRoll('currentRound')
  const defaultBet = useConfettiRoll('defaultBet')
  const pendingRewards = useConfettiRoll('getPendingRewards', account)
  const internalGames = useConfettiRoll('getPendingGames', account)

  type GameState =
    | { t: 'Pending' }
    | { t: 'Playable' }
    | { t: 'Finished'; lost: boolean }

  type PendingGame = GameState & { id: any }
  const [pendingGames, setPendingGames] = useState<Array<PendingGame>>([])

  useEffect(() => {
    if (!account) {
      setPendingGames([])
    }
    if (!signer || !account) return
    const confettiRoll = CONFETTI_ROLL_CONTRACT.connect(signer)

    async function fetchPendingGames() {
      const pendingGames = (await confettiRoll.getPendingGames(account)) || []
      return Promise.all(
        pendingGames
          .map((gameId: any) =>
            Promise.all([
              gameId,
              confettiRoll.getGame(gameId),
              confettiRoll.getGameResults(gameId),
            ])
          )
          .map(async (data: PromiseLike<[any, any, any]>) => {
            const [gameId, game, results] = await data
            const roundNum = game.roundNum
            const seed = await confettiRoll.getSeed(roundNum)
            const loser = results.loser

            const state: GameState = seed.eq(0)
              ? { t: 'Pending' }
              : loser.eq(0)
              ? { t: 'Playable' }
              : { t: 'Finished', lost: loser == account }

            return { id: gameId, ...state }
          })
      )
    }

    fetchPendingGames().then(setPendingGames)
  }, [signer, account, internalGames])
  const [rolls, setRolls] = useState<{
    startingRoll: number
    rolls: Array<PlayerRoll>
    pending: boolean
  }>({ startingRoll: 100, rolls: [], pending: false })
  const clearRolls = useCallback(() => {
    setRolls({ startingRoll: 0, rolls: [], pending: false })
  }, [])

  const pendingGlobalGame = pendingGames.find((game) => game.id == globalGameId)

  return (
    <BannerBox heading={`Round #${currentRound || 0}`}>
      <Box p="16px" textAlign="center">
        {!connected && (
          <Text fontSize="xx-large" mb="20px" color="white">
            Not connected
          </Text>
        )}

        <Flex direction="column">
          <Text fontSize="md" fontWeight="bold" color={connected ? '' : 'gray'}>
            Global game
          </Text>
          <Text>
            ID:{' '}
            {globalGameId
              ? `${globalGameId.slice(0, 6)}...${globalGameId.slice(-4)}`
              : 'Unknown'}
          </Text>
          <Text>Participants: {(globalGame?.participants || []).length}</Text>
          <Button
            size="xs"
            pb="6px"
            m="1em 3em 0.5em 3em"
            isDisabled={
              !account ||
              (pendingGlobalGame && pendingGlobalGame.t != 'Playable')
            }
            onClick={async () => {
              const signer = account && library?.getSigner()
              if (signer) {
                const confettiRoll = contracts.confettiRoll.connect(signer)

                if (pendingGlobalGame?.t == 'Playable') {
                  const gameId = pendingGlobalGame.id
                  await confettiRoll.commenceGame(gameId)
                  // Trigger modal display to inform the user that the game
                  // will commence
                  setRolls({
                    startingRoll: 0,
                    rolls: [],
                    pending: true,
                  })
                  // Wait until the game is registered by our provider
                  // TODO: Clean up and modularize this mess
                  await new Promise((resolve) => {
                    const filter =
                      contracts.confettiRoll.filters.PlayerLost(gameId)
                    const callback = () => {
                      library?.removeListener(filter, callback)
                      resolve(void 0)
                    }
                    library?.addListener(filter, callback)
                  })
                  const [game, players, rolls] = await Promise.all([
                    confettiRoll.getGame(gameId),
                    confettiRoll.getRollingPlayers(gameId),
                    confettiRoll.getRolls(gameId),
                  ])

                  const playerRolls = rolls.map((roll: any, idx: number) => ({
                    player: players[idx % players.length],
                    roll: Number(roll),
                  }))
                  setRolls({
                    startingRoll: game.startingRoll,
                    rolls: playerRolls,
                    pending: true,
                  })
                } else if (tokenAllowance?.gte(defaultBet)) {
                  confettiRoll.joinGlobalGame().catch(showErrorToast)
                } else {
                  contracts.confetti
                    .connect(signer)
                    .approve(
                      TOKEN_ADDRESS['CONFETTI_ROLL'],
                      '2000000000000000000000000'
                    )
                }
              }
            }}
          >
            {pendingGlobalGame ? (
              pendingGlobalGame.t
            ) : tokenAllowance?.lt(defaultBet || 0) ? (
              'Approve $CFTI'
            ) : (
              <Flex>
                <Text>Join game - {`${defaultBet}`}</Text>
                <Img h="27px" mt="6px" src="/cfti.png" pr="10px" />
              </Flex>
            )}
          </Button>
          <Text fontSize="md" fontWeight="bold" color={connected ? '' : 'gray'}>
            Recent games
          </Text>
          <ul>
            {pendingGames.map((game) => (
              <li style={{ fontSize: '1.25rem' }} key={game.id}>
                {`${game.id.slice(0, 6)}...${game.id.slice(-4)}`}
                <Button
                  size="xs"
                  ml="1rem"
                  p="0 0 7px 0"
                  opacity={game.t === 'Playable' ? '1' : '0.7'}
                  isDisabled={game.t === 'Pending'}
                  onClick={async () => {
                    if (!signer || game.t === 'Pending') {
                      return
                    }
                    const confettiRoll = contracts.confettiRoll.connect(signer)

                    // If the game is not yet finished and needs to be triggered,
                    // make sure to call the contract and wait for the game
                    // conclusion event
                    if (game.t === 'Playable') {
                      await confettiRoll.commenceGame(game.id)
                      // Trigger modal display to inform the user that the game
                      // will commence
                      setRolls({
                        startingRoll: 0,
                        rolls: [],
                        pending: true,
                      })
                      // Wait until the game is registered by our provider
                      // TODO: Clean up and modularize this mess
                      await new Promise((resolve) => {
                        const filter =
                          contracts.confettiRoll.filters.PlayerLost(game.id)
                        const callback = () => {
                          library?.removeListener(filter, callback)
                          resolve(void 0)
                        }
                        library?.addListener(filter, callback)
                      })
                    }

                    const [game_, players, rolls] = await Promise.all([
                      confettiRoll.getGame(game.id),
                      confettiRoll.getRollingPlayers(game.id),
                      confettiRoll.getRolls(game.id),
                    ])

                    const playerRolls = rolls.map((roll: any, idx: number) => ({
                      player: players[idx % players.length],
                      roll: Number(roll),
                    }))
                    setRolls({
                      startingRoll: game_.startingRoll,
                      rolls: playerRolls,
                      pending: true,
                    })
                  }}
                >
                  {game.t}
                </Button>
              </li>
            ))}
          </ul>
          -----------
          <Button
            size="xs"
            pb="6px"
            m="0.5em 3em 0.5em 3em"
            onClick={async () => {
              if (signer) {
                const seederV2 = contracts.seederV2.connect(signer)
                const seedStorage = contracts.seedStorage.connect(signer)
                // First, seed our current round
                const reqId = await seederV2.getReqByBatch(
                  await seederV2.getBatch()
                )
                const seed = Math.trunc(Math.random() * 10 ** 10)
                await seedStorage.setRandomness(reqId, seed)
              }
            }}
          >
            Seed!
          </Button>
          <Button
            size="xs"
            pb="6px"
            m="0.5em 3em 0.5em 3em"
            onClick={async () => {
              if (signer) {
                const seederV2 = contracts.seederV2.connect(signer)
                const batch = await seederV2.getBatch()
                await seederV2.setBatch(batch.add(1))
                const newBatch = await seederV2.getBatch()
                await seederV2.setBatchToReqId(
                  newBatch,
                  keccak256(['uint256'], [newBatch])
                )
              }
            }}
          >
            Advance!
          </Button>
        </Flex>
      </Box>
      {connected && (
        <Flex justify="space-between">
          <Flex>
            <Tooltip
              bg="purple.300"
              color="white"
              placement="left"
              hasArrow
              label="Withdraw rewards"
            >
              <Button
                isDisabled={!account || !pendingRewards || pendingRewards <= 0}
                onClick={() => {
                  if (signer) {
                    const confetti = contracts.confettiRoll.connect(signer)
                    confetti.withdrawRewards().catch(showErrorToast)
                  }
                }}
              >
                <Img h="27px" mt="6px" src="/cfti.png" pr="10px" />
                <Text>{`${(pendingRewards / 10 ** 18).toFixed(3)}`}</Text>
              </Button>
            </Tooltip>
          </Flex>
          <Flex>
            <Img h="27px" mt="6px" src="/cfti.png" pr="10px" />
            <Text>{`${(Number(cftiBalance) / 10 ** 18).toFixed(3)}`}</Text>
          </Flex>
          <DeathRoll
            startingRoll={rolls.startingRoll}
            rolls={rolls.rolls}
            pending={rolls.pending}
            onClosed={clearRolls}
          />
        </Flex>
      )}
    </BannerBox>
  )
}

export default Status
