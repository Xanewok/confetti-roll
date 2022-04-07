import { useCall } from '@usedapp/core'
import { CONFETTI_ROLL_CONTRACT } from '../constants'

export function useConfettiRoll(method: string, ...args: Array<any>) {
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
