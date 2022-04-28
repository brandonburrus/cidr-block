import { Ipv6Literal, Ipv6Representable } from './types'
const MAX_HEXTET_SIZE = 65_535n

/**
 * Representation of an IPv6 address. Provides various utilities methods like equality
 * checking.
 *
 * @remarks
 * Avoid direct instantiation; use {@link ipv6.address} instead.
 */
export class Ipv6Address {
  private _address: bigint

  public constructor(address: Ipv6Literal) {
    this._address = typeof address === 'bigint' ? address : stringToNum(address)
  }

  /**
   * The address as a bigint
   *
   * @remarks
   * Because the representation of an IPv6 address is too large to fit into a typical
   * JavaScript integer, a
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt}
   * is used instead.
   */
  public get address(): bigint {
    return this._address
  }

  // TODO: Add example code
  /**
   * Returns the string representation of the address
   */
  public toString(): string {
    return numToString(this._address)
  }

  /**
   * Compares if two IPv6 addresses are the same.
   *
   * @example
   * ```typescript
   * import { ipv6 as ip } from 'cidr-block'
   *
   * function isLoopback(address: Ipv6Representable) {
   *   return ip.address(address).equals('::1')
   * }
   *
   * @public
   * @param otherIpAddress the other Ipv6 address to compare
   * @returns if the other IP address is the same
   * ```
   */
  public equals(otherIpAddress: Ipv6Representable): boolean {
    if (otherIpAddress instanceof Ipv6Address) {
      return this._address === otherIpAddress._address
    } else {
      return this._address === address(otherIpAddress)._address
    }
  }

  /**
   * Calculates the next logical IPv6 address.
   *
   * @example
   * ```typescript
   * import { ipv6 as ip } from 'cidr-block'
   *
   * const myIp = ip.address('2001:0db8::ac10')
   * myIp.nextIp()                                       // ==> '2001:0db8::ac11'
   * ```
   */
  public nextIp(): Ipv6Address {
    // TODO: Handle last ip address
    return address(this._address + 1n)
  }

  /**
   * Calculates the previous logical IPv6 address.
   *
   * @example
   * ```typescript
   * import { ipv6 as ip } from 'cidr-block'
   *
   * const myIp = ip.address('2001:0db8::ac10')
   * myIp.previousIp()                                   // ==> '2001:0db8::ac09'
   * ```
   */
  public previousIp(): Ipv6Address {
    return address(this._address - 1n)
  }
}

/**
 * Convenience function for creating an IPv6 address instance.
 *
 * @remarks
 * In general, you should use this function instead of instantiating an Ipv6Address
 * object directly.
 *
 * @example
 *
 * ```typescript
 * import { ipv6 as ip } from 'cidr-block'
 *
 * const localhost = ip.address('::1')
 * ```
 *
 * @see {@link Ipv6Address}
 *
 * @param ip string representation of the IPv6 address
 * @returns an instance of Ipv6Address
 */
export function address(ip: Ipv6Literal): Ipv6Address {
  // TODO: Implement memoization
  return new Ipv6Address(ip)
}

// TODO: Add code example
/**
 * Converts the string representation of an IPv6 address to a bigint.
 *
 * @see {@link Ipv6Address}
 *
 * @public
 * @param ip string representation of the IPv6 address
 * @returns an instance of Ipv6Address
 */
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

/**
 * Converts the numerical representation of an IPv6 address to its string representation.
 *
 * @see This method is the inverse of {@link ipv6.stringToNum}
 * @throws {@link InvalidIpAddressError}
 *
 * @public
 * @param ip IPv6 address as a number
 * @returns string representation of the address
 */
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
