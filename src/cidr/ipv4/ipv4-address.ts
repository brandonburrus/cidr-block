import { Ipv4Literal, Ipv4Representable } from './types'
import { InvalidIpAddressError } from './../errors'
import { MAX } from './constants'

const MAX_OCTET_SIZE = 255n

/**
 * Representation of an IPv4 address. Provides various utility methods like equality
 * checking.
 *
 * @remarks
 * Direct instantiation should be avoided; use {@link ipv4.address|ipv4.address()} instead.
 */
export class Ipv4Address {
  private _address: bigint

  public constructor(address: Ipv4Literal) {
    this._address = typeof address === 'bigint' ? address : stringToNum(address)
  }

  /**
   * The address as a big integer
   */
  public get address(): bigint {
    return this._address
  }

  /**
   * @example
   * ```typescript
   * import { ipv4 as ip } from 'cidr-block'
   *
   * ip.address(255n)                                    // ==> '0.0.0.255'
   * ip.address(0b11111111_00000000_11111111_00000000n)  // ==> '255.0.255.0'
   * ````
   *
   * @public
   * @returns the IPv4 address as a string
   */
  public toString(): string {
    return numToString(this._address)
  }

  /**
   * Compares if two IP address are the same.
   *
   * @example
   * ```typescript
   * import { ipv4 as ip } from 'cidr-block'
   *
   * function isLoopback(address: Ipv4Representable) {
   *  return ip.address(address).equals('127.0.0.1')
   * }
   * ```
   *
   * @public
   * @param otherIpAddress the other IPv4 address to compare
   * @returns if the other IP address is the same
   */
  public equals(otherIpAddress: Ipv4Representable): boolean {
    if (otherIpAddress instanceof Ipv4Address) {
      return this._address === otherIpAddress._address
    } else {
      return this._address === address(otherIpAddress)._address
    }
  }

  /**
   * @example
   * ```typescript
   * import { ipv4 as ip } from 'cidr-block'
   *
   * const myIp = ip.address('52.89.32.255')
   * myIp.nextIp()                                       // ==> '52.89.33.0
   * ```
   *
   * @public
   * @returns the next consecutive IPv4 address
   */
  public nextIp(): Ipv4Address {
    return address(this._address + 1n)
  }

  /**
   * @example
   * ```typescript
   * import { ipv4 as ip } from 'cidr-block'
   *
   * const myIp = ip.address('52.89.32.19')
   * myIp.previousIp()                                   // ==> '52.89.32.18
   * ```
   *
   * @public
   * @returns the preceding IPv4 address
   */
  public previousIp(): Ipv4Address {
    return address(this._address - 1n)
  }
}

/**
 * Convenience function for creating an IPv4 address instance.
 *
 * @remarks
 *
 * In general, you should use this function instead of instantiating an Ipv4Address
 * object directly. While there is nothing wrong with direct instantiation, convenience
 * methods like these are meant to help reduce the footprint of your code and increase
 * readability.
 *
 * @example
 *
 * ```typescript
 * import { ipv4 as ip } from 'cidr-block'
 *
 * const localhost = ip.address('127.0.0.1')
 * ```
 *
 * @see {@link Ipv4Address}
 *
 * @param ip string representation of the IPv4 address
 * @returns an instance of Ipv4Address
 */
export function address(ip: Ipv4Literal): Ipv4Address {
  return new Ipv4Address(ip)
}

/**
 * Converts the string representation of an IPv4 address to a BigInt.
 *
 * @example
 *
 * ```typescript
 * import * as cidr from 'cidr-block'
 *
 * cidr.ipv4.stringToNum('255.255.255.255') === 4_294_967_295n     // ==> true
 * cidr.ipv4.stringToNum('0.0.0.255') === 255n                     // ==> true
 * ```
 *
 * @see This method is the inverse of {@link ipv4.numToString}
 * @throws {@link InvalidIpAddressError}
 *
 * @public
 * @param address IPv4 address represented as a string
 * @returns numerical BigInt representation of the address
 */
export function stringToNum(address: string): bigint {
  try {
    let [firstOctet, secondOctet, thirdOctet, fourthOctet] = address
      .split('.')
      .map(BigInt)
      .filter(octet => octet >= 0 && octet <= MAX_OCTET_SIZE)
    firstOctet = firstOctet << 24n
    secondOctet = secondOctet << 16n
    thirdOctet = thirdOctet << 8n
    return firstOctet + secondOctet + thirdOctet + fourthOctet
  } catch {
    throw new InvalidIpAddressError(address)
  }
}

/**
 * Converts the numerical BigInt representation of an IPv4 address to its string representation.
 *
 * @example
 *
 * ```typescript
 * import * as cidr from 'cidr-block'
 *
 * cidr.ipv4.numToString(0n) === '0.0.0.0'                            // ==> true
 * cidr.ipv4.numToString(65_280n) === '0.0.255.0'                     // ==> true
 * cidr.ipv4.numToString(4_294_967_295n) === '255.255.255.255'        // ==> true
 * ```
 *
 * @see This method is the inverse of {@link ipv4.stringToNum}
 * @throws {@link InvalidIpAddressError}
 *
 * @public
 * @param ip IPv4 address as a BigInt
 * @returns string representation of the address
 */
export function numToString(ip: bigint): string {
  try {
    if (ip < 0 || ip > MAX) {
      throw new Error()
    }
    const firstOctet = (ip >> 24n) & MAX_OCTET_SIZE
    const secondOctet = (ip >> 16n) & MAX_OCTET_SIZE
    const thirdOctet = (ip >> 8n) & MAX_OCTET_SIZE
    const fourthOctet = ip & MAX_OCTET_SIZE
    return `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}`
  } catch {
    throw new InvalidIpAddressError(ip.toString())
  }
}
