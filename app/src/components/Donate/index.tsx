import {
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  Flex,
  Img,
} from '@chakra-ui/react'
import { useSendTransaction } from '@usedapp/core'
import { useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from 'ethers/utils/units'

const Donate = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [disabled, setDisabled] = useState(false)
  const { sendTransaction, state } = useSendTransaction({
    transactionName: 'Send Ethereum',
  })

  const handleClick = (amount: string) => {
    if (amount) {
      sendTransaction({
        to: '0x51EC15594230DDf21A7EA5A4aC392BB8Dbda527E',
        value: BigNumber.from(parseEther(amount)),
      })
    }
  }

  useEffect(() => {
    if (state.status != 'Mining') {
      setDisabled(false)
    }
  }, [state])

  return (
    <>
      <Flex justify="center">
        <Button onClick={onOpen} variant="link" size="xs">
          <Text fontSize="xs" mb="5px" color="white" fontWeight="normal">
            Donate
          </Text>
          <Img src="/heart.png" h="19px" />
        </Button>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          mt="10%"
          px="16px"
          py="16px"
          color="purple.900"
          bg="purple.100"
          borderRadius="1px"
          boxShadow="0 -3px 0 0 #352561, 0 3px 0 0 #181030, -3px 0 0 0 #2c2051, 3px 0 0 0 #2c2051, 0 0 0 3px #0b0817, 0 -6px 0 0 #0b0817, 0 6px 0 0 #0b0817, -6px 0 0 0 #0b0817, 6px 0 0 0 #0b0817"
        >
          <ModalHeader textAlign="center">Donate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="white" fontSize="md" textAlign="center">
              Some people asked how to donate to me, so I added it. While I
              appreciate the support, I cannot promise anything in return. I
              have no affliation with the Raid Party team, I am just a dude who
              likes building things.
            </Text>
            <Flex justify="center" mt="25px">
              <Img src="/heart.png" w="32px" />
            </Flex>
            <Text textAlign="center" color="white">
              Thank you!
            </Text>
            <Flex justify="center" mt="55px" mb="15px">
              <Button
                mx="20px"
                px="20px"
                disabled={disabled}
                onClick={() => handleClick('0.1')}
              >
                0.1 ETH
              </Button>
              <Button
                mx="20px"
                px="20px"
                disabled={disabled}
                onClick={() => handleClick('0.01')}
              >
                0.01 ETH
              </Button>
              <Button
                mx="20px"
                px="20px"
                disabled={disabled}
                onClick={() => handleClick('0.001')}
              >
                0.001 ETH
              </Button>
            </Flex>
            <Text fontSize="sm" textAlign="center">
              All donations are sent directly to{' '}
              <Text as="span" color="white" fontSize="sm">
                oktal.eth
              </Text>{' '}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default Donate
