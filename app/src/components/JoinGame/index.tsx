import { Button, Flex, Img, Text, useToast } from '@chakra-ui/react'
import {
  useEthers,
  useInterval,
  useTokenAllowance,
  useTokenBalance,
} from '@usedapp/core'
import { useCallback, useState } from 'react'
import {
  CONFETTI_CONTRACT,
  CONFETTI_ROLL_CONTRACT,
  TOKEN_ADDRESS,
} from '../../constants'
import { useConfettiRoll, useNextSeed, useSigner } from '../../hooks'

type JoinGameProps = { game: any }

export const JoinGame = (props: JoinGameProps) => {
  const game = props.game || {}
  //   console.log({ game })

  const { library, account } = useEthers()
  const allowance = useTokenAllowance(
    TOKEN_ADDRESS['CFTI'],
    account,
    TOKEN_ADDRESS['CONFETTI_ROLL']
  )
  const balance = useTokenBalance(TOKEN_ADDRESS['CFTI'], account)

  const nextSeedBatch = Number(useNextSeed())
  const [timeTillSeed, setTimeTillSeed] = useState(NaN)
  useInterval(() => {
    setTimeTillSeed(nextSeedBatch * 1000 - new Date().getTime())
  }, 1000)

  const toast = useToast()
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

  const signer = useSigner()
  const defaultBet = useConfettiRoll('defaultBet')
  const defaultMaxParticipants = useConfettiRoll('defaultMaxParticipants')

  const poolBet = game.poolBet || defaultBet || 0
  const maxParticipants = game.maxParticipants || defaultMaxParticipants
  //   const globalGameId = useConfettiRoll('currentGlobalGameId')
  //   const globalGame = useConfettiRoll('getGame', globalGameId)
  // Possible button states:
  // 1. $CFTI not approved
  // 2. Game is accepting new sign-ups:
  //    - the maximum participants limit is not yet met
  //    - enough time before seeding happens (we respect the frontrunning safeguard)
  //    - we have enough money
  const notApproved = allowance?.lt(poolBet)
  const gameIsFull =
    game?.participants?.length && game.participants.length >= maxParticipants
  const alreadyJoined =
    account &&
    game?.participants?.length &&
    game.participants.some(
      (player: any) => account.toLowerCase() == player.toString().toLowerCase()
    )
  const seedImminent = timeTillSeed <= 60 * 1000

  const onClick = useCallback(() => {
    if (!game || !signer) {
      /* no-op */
    } else if (notApproved) {
      CONFETTI_CONTRACT.connect(signer).approve(
        TOKEN_ADDRESS['CONFETTI_ROLL'],
        '2000000000000000000000000'
      )
    } else {
      CONFETTI_ROLL_CONTRACT.connect(signer)
        .joinGlobalGame()
        .catch(showErrorToast)
    }
  }, [game, notApproved, showErrorToast, signer])
  const disabled = !signer || gameIsFull || seedImminent || alreadyJoined
  const label = !game ? (
    'Loading'
  ) : notApproved ? (
    'Approve $CFTI'
  ) : gameIsFull ? (
    'Game is full'
  ) : seedImminent || alreadyJoined ? (
    'Pending next seed'
  ) : (
    <Flex justifyItems={'right'}>
      <Text>Sign up:</Text>
      <Text ml="min(0.5em, 5vw)">
        {(Number(defaultBet) / 10 ** 18).toPrecision(4).replace('.00', '')}
      </Text>
      <Img
        style={{ transform: 'scale(0.85)' }}
        h="27px"
        mt="6px"
        src="/cfti.png"
      />
    </Flex>
  )
  return (
    <Button
      size="xs"
      pb="6px"
      m="1em 3em 0.5em 3em"
      isDisabled={!account || disabled}
      onClick={onClick}
      //       onClick={async () => {
      //         const signer = account && library?.getSigner()
      //         if (signer) {
      //           const confettiRoll = CONFETTI_ROLL_CONTRACT.connect(signer)
      //           const confetti = CONFETTI_CONTRACT.connect(signer)

      //           if (game?.t == 'Playable') {
      //             await confettiRoll.commenceGame(game.id)
      //           } else if (allowance?.gte(defaultBet)) {
      //             await confettiRoll.joinGlobalGame().catch(showErrorToast)
      //           } else {
      //             await confetti.approve(
      //               TOKEN_ADDRESS['CONFETTI_ROLL'],
      //               '2000000000000000000000000'
      //             )
      //           }
      //         }
      //       }}
    >
      {label}
      {/* {game && allowance?.lt(defaultBet) ? (
        'Approve $CFTI'
      ) : (
        <Flex justifyItems={'right'}>
          <Text>Sign up:</Text>
          <Text ml="min(0.5em, 5vw)">
            {(Number(defaultBet) / 10 ** 18).toPrecision(4).replace('.00', '')}
          </Text>
          <Img
            style={{ transform: 'scale(0.85)' }}
            h="27px"
            mt="6px"
            src="/cfti.png"
          />
        </Flex> */}
      {/* )} */}
    </Button>
  )
}
