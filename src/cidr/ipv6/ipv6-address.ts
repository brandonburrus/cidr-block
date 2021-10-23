import { Ipv6Literal, Ipv6Representable } from './types'
const MAX_HEXTET_SIZE = 65_535n

export class Ipv6Address {
  private _address: bigint

  public constructor(address: Ipv6Literal) {
    this._address = typeof address === 'bigint' ? address : stringToNum(address)
  }

  public get address(): bigint {
    return this._address
  }

  public toString(): string {
    return numToString(this._address)
  }

  public equals(otherIpAddress: Ipv6Representable): boolean {
    if (otherIpAddress instanceof Ipv6Address) {
      return this._address === otherIpAddress._address
    } else {
      return this._address === address(otherIpAddress)._address
    }
  }

  public nextIp(): Ipv6Address {
    return address(this._address + 1n)
  }

  public previousIp(): Ipv6Address {
    return address(this._address - 1n)
  }
}

export function address(ip: Ipv6Literal): Ipv6Address {
  return new Ipv6Address(ip)
}

export function stringToNum(address: string): bigint {
  if (address === '::') {
    return 0n
  }

  let ipv6 = 0n
  const rawHextets: string[] = []
  const [leftAddress, rightAddress] = address.split('::')

  for (const hextet of leftAddress.split(':')) {
    rawHextets.push(hextet || '0')
  }

  if (rightAddress !== undefined) {
    const rightHextets = rightAddress.split(':')
    const emptyFillCount = 8 - (rawHextets.length + rightHextets.length)

    for (let i = 0; i < emptyFillCount; i++) {
      rawHextets.push('0')
    }

    for (const hextet of rightHextets) {
      rawHextets.push(hextet || '0')
    }
  }

  const decimals = rawHextets.map(hextet => parseInt(hextet, 16))

  let shiftSize = 0n
  let binHex = 0n
  for (const pos in decimals) {
    const num = decimals[pos]
    if (num === 0) {
      continue
    }
    shiftSize = BigInt(Math.abs(parseInt(pos) - 7) * 16)
    binHex = BigInt(num) << shiftSize
    ipv6 |= binHex
  }

  return ipv6
}

export function numToString(num: bigint): string {
  if (num === 0n) {
    return '::'
  }
  const hextets: string[] = []
  for (let n = 0; n < 8; n++) {
    const bitOffset = BigInt(Math.abs(n - 7) * 16)
    hextets.push(((num >> bitOffset) & MAX_HEXTET_SIZE).toString(16))
  }
  const dropStartIdx = hextets.indexOf('0')
  if (dropStartIdx >= 0) {
    let dropCount = 1
    for (let i = dropStartIdx + 1; hextets[i] === '0'; i++) {
      dropCount++
    }
    hextets.splice(
      dropStartIdx,
      dropCount,
      dropStartIdx === 0 || dropStartIdx + dropCount === 8 ? ':' : ''
    )
  }
  return hextets.join(':')
}
