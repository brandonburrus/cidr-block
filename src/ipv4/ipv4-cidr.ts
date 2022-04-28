import { Ipv4Representable } from './types'
import { InvalidCidrBlockError } from '../errors'
import { address as ipAddress, Ipv4Address, numToString } from './ipv4-address'

export class Ipv4Cidr {
  private _ipAddress: Ipv4Address
  private _maskSize: number

  // TODO: Allow wider-range of values that can be used to create a cidr
  constructor(cidrRange: string) {
    try {
      const [address, subnetMask] = cidrRange.split('/')
      this._ipAddress = ipAddress(address)
      this._maskSize = Number(subnetMask)
    } catch {
      throw new InvalidCidrBlockError(cidrRange)
    }
  }

  /**
   * The size of the cidr netmask (the number after the slash in cidr notation)
   */
  public get maskSize(): number {
    return this._maskSize
  }

  /**
   * Number of IP addresses within the cidr range
   */
  public get allocatableIpCount(): number {
    return 2 ** this.addressLength
  }

  /**
   * The actual IPv4 netmask address
   */
  public get netmask(): Ipv4Address {
    return ipAddress((2 ** this.maskSize - 1) << this.addressLength)
  }

  /**
   * The first IPv4 address that is usable within the given cidr range
   */
  public get firstUsableIp(): Ipv4Address {
    return ipAddress(this._ipAddress.address)
  }

  /**
   * The last IPv4 address that is usable within the given cidr range
   */
  public get lastUsableIp(): Ipv4Address {
    // FIXME: Handle edge case of when cidr range goes outside valid ip range
    return ipAddress(this._ipAddress.address + 2 ** this.addressLength - 1)
  }

  private get addressLength(): number {
    return Math.abs(32 - this._maskSize)
  }

  /**
   * @returns string representation of the cidr range
   */
  public toString(): string {
    return `${this._ipAddress.toString()}/${this._maskSize}`
  }

  /**
   * @returns the next consecutive cidr block
   */
  public nextBlock(ofSize?: number): Ipv4Cidr {
    const nextIp = this._ipAddress.address + 2 ** this.addressLength
    return cidr(`${numToString(nextIp)}/${ofSize ?? this._maskSize}`)
  }

  /**
   * @returns the previous cidr block
   */
  public previousBlock(): Ipv4Cidr {
    const nextIp = this._ipAddress.address - 2 ** this.addressLength
    return cidr(`${numToString(nextIp)}/${this._maskSize}`)
  }

  /**
   * @returns if the given IPv4 address is within the cidr range
   */
  public includes(address: Ipv4Representable): boolean {
    const ip = address instanceof Ipv4Address ? address : ipAddress(address)
    return (
      // FIXME: How to handle edge case of next block erroring out?
      ip.address >= this._ipAddress.address && ip.address <= this.nextBlock()._ipAddress.address
    )
  }
}

/**
 * Convenience function for creating an IPv4 cidr range instance.
 *
 * @remarks
 *
 * In general, you should use this function instead of instantiating an Ipv4Cidr
 * object directly. While there is nothing wrong with direct instantiation, convenience
 * methods like these are meant to help reduce the footprint of your code and increase
 * readability.
 *
 * @example
 *
 * ```typescript
 * import { ipv4 as ip } from 'cidr-block'
 *
 * const vpcCidrRange = ip.cidr('10.0.0.0/16')
 * ```
 *
 * @see {@link Ipv4Cidr}
 *
 * @param cidrRange string representation of the cidr range
 * @returns an instance of Ipv4Cidr
 */
export function cidr(cidrRange: string): Ipv4Cidr {
  return new Ipv4Cidr(cidrRange)
}
