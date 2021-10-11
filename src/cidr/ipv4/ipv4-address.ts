import { IPv4_MAX } from './../constants'
import { InvalidIpAddressError } from './../errors'

const MAX_OCTET_SIZE = 255n

/**
 * Representation of an IPv4 address. Provides various utility methods like equality
 * checking.
 *
 * @remarks
 * Direct instantiation should be avoided; use {@link ipv4.address|ipv4.address()} instead.
 */
export class Ipv4Address {
  private address: bigint

  public constructor(address: string) {
    this.address = fromString(address)
  }

  /**
   * @public
   * @returns the IPv4 address as a string
   */
  public toString(): string {
    return toString(this.address)
  }

  /**
   * Compares if two IP address are the same.
   *
   * @public
   * @param otherIpAddress the other IPv4 address to compare
   * @returns if the other IP address is the same
   */
  public equals(otherIpAddress: Ipv4Address): boolean {
    return this.address === otherIpAddress.address
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
 * import * as cidr from 'cidr-block'
 *
 * const localhost = cidr.ipv4.address('172.0.0.0')
 * ```
 *
 * @see {@link Ipv4Address}
 *
 * @param ip string representation of the IPv4 address
 * @returns an instance of Ipv4Address
 */
export function address(ip: string): Ipv4Address {
  return new Ipv4Address(ip)
}

/**
 * Converts the string representation of an IPv4 address to a BigInt.
 *
 * @remarks
 *
 * Conversion must be between string and bigint instead of integer as
 * on 32-bit systems, Node.js may allocate the number as a 32-bit integer.
 * To avoid this behavior, a BigInt is always used instead.
 *
 * @example
 *
 * ```typescript
 * import * as cidr from 'cidr-block'
 *
 * cidr.ipv4.fromString('255.255.255.255') === 4_294_967_295n     // ==> true
 * cidr.ipv4.fromString('0.0.0.255') === 255n                     // ==> true
 * ```
 *
 * @see This method is the inverse of {@link ipv4.toString|ipv4.toString()}
 * @throws {@link InvalidIpAddressError}
 *
 * @public
 * @param address IPv4 address represented as a string
 * @returns numerical BigInt representation of the address
 */
export function fromString(address: string): bigint {
  try {
    let [firstOctet, secondOctet, thirdOctet, fourthOctet] = address
      .split('.')
      .map(BigInt)
      .filter(octet => octet >= 0 && octet <= MAX_OCTET_SIZE)
    firstOctet = (firstOctet! & MAX_OCTET_SIZE) << 24n
    secondOctet = (secondOctet! & MAX_OCTET_SIZE) << 16n
    thirdOctet = (thirdOctet! & MAX_OCTET_SIZE) << 8n
    fourthOctet = fourthOctet! & MAX_OCTET_SIZE
    return firstOctet + secondOctet + thirdOctet + fourthOctet
  } catch {
    throw new InvalidIpAddressError(address)
  }
}

/**
 * Converts the numerical BigInt representation of an IPv4 address to its string representation.
 *
 * @remarks
 *
 * Conversion must be between string and bigint instead of integer as
 * on 32-bit systems, Node.js may allocate the number as a 32-bit integer.
 * To avoid this behavior, a BigInt is always used instead.
 *
 * @example
 *
 * ```typescript
 * import * as cidr from 'cidr-block'
 *
 * cidr.ipv4.toString(0n) === '0.0.0.0'                            // ==> true
 * cidr.ipv4.toString(65_280n) === '0.0.255.0'                     // ==> true
 * cidr.ipv4.toString(4_294_967_295n) === '255.255.255.255'        // ==> true
 * ```
 *
 * @see This method is the inverse of {@link ipv4.fromString|ipv4.fromString()}
 * @throws {@link InvalidIpAddressError}
 *
 * @public
 * @param ip IPv4 address as a BigInt
 * @returns string representation of the address
 */
export function toString(ip: bigint): string {
  if (ip < 0 || ip > IPv4_MAX) {
    throw new InvalidIpAddressError(ip.toString())
  }
  const firstOctet = (ip >> 24n) & MAX_OCTET_SIZE
  const secondOctet = (ip >> 16n) & MAX_OCTET_SIZE
  const thirdOctet = (ip >> 8n) & MAX_OCTET_SIZE
  const fourthOctet = ip & MAX_OCTET_SIZE
  return `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}`
}
