import JSBI from 'jsbi'

export const sqrtPrice = (sqrtRatioX96 : any, decimals : any) => {
    if (sqrtRatioX96) {
        const token0Decimals = decimals[0]
        const token1Decimals = decimals[1]
        const scalarNumerator = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(token0Decimals))
        const scalarDenominator = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(token1Decimals))

        const sqrtRatioX96BI = JSBI.BigInt(sqrtRatioX96)

        const inputNumerator = JSBI.multiply(sqrtRatioX96BI, sqrtRatioX96BI)
        const inputDenominator = JSBI.exponentiate(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96)), JSBI.BigInt(2))

        const adjustedForDecimalsNumerator = JSBI.BigInt(JSBI.multiply(scalarDenominator, inputDenominator))
        const adjustedForDecimalsDenominator = JSBI.BigInt(JSBI.multiply(scalarNumerator, inputNumerator))

        const numerator = adjustedForDecimalsNumerator
        const denominator = adjustedForDecimalsDenominator

        return Number(numerator.toString()) / Number(denominator.toString())
    } else {
        return 0
    }
}
