import { InvalidCidrBlockError } from './../errors'
import { address as ipAddress, Ipv4Address, numToString } from './ipv4-address'

export class Ipv4CidrBlock {
  private _ipAddress: Ipv4Address
  private _subnetMask: number

  constructor(cidrRange: string) {
    try {
      const [address, subnetMask] = cidrRange.split('/')
      this._ipAddress = ipAddress(address)
      this._subnetMask = Number(subnetMask)
    } catch {
      throw new InvalidCidrBlockError(cidrRange)
    }
  }

  public get subnetMask(): bigint {
    return BigInt(this._subnetMask)
  }

  public get allocatableIpCount(): bigint {
    return 2n ** this.addressLength
  }

  public get netmask(): Ipv4Address {
    return ipAddress((2n ** this.subnetMask - 1n) << this.addressLength)
  }

  public get firstUsableIp(): Ipv4Address {
    return ipAddress(this._ipAddress.address)
  }

  public get lastUsableIp(): Ipv4Address {
    // FIXME: Handle edge case of when cidr range goes outside valid ip range
    return ipAddress(this._ipAddress.address + 2n ** this.addressLength - 1n)
  }

  private get addressLength(): bigint {
    return BigInt(Math.abs(32 - this._subnetMask))
  }

  public toString(): string {
    return `${this._ipAddress.toString()}/${this._subnetMask}`
  }

  public nextBlock(): Ipv4CidrBlock {
    const nextIp = this._ipAddress.address + 2n ** this.addressLength
    return block(`${numToString(nextIp)}/${this._subnetMask}`)
  }

  public previousBlock(): Ipv4CidrBlock {
    const nextIp = this._ipAddress.address - 2n ** this.addressLength
    return block(`${numToString(nextIp)}/${this._subnetMask}`)
  }

  public includes(address: string | bigint | Ipv4Address): boolean {
    const ip = address instanceof Ipv4Address ? address : ipAddress(address)
    return (
      // FIXME: How to handle edge case of next block erroring out?
      ip.address >= this._ipAddress.address && ip.address <= this.nextBlock()._ipAddress.address
    )
  }
}

export function block(cidrRange: string): Ipv4CidrBlock {
  return new Ipv4CidrBlock(cidrRange)
}
