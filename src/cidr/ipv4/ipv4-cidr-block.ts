import { InvalidCidrBlockError } from './../errors'
import { Ipv4Address } from './ipv4-address'
import { ipv4 } from '../../index'

export class Ipv4CidrBlock {
  private address: Ipv4Address
  private range: number

  constructor(cidrRange: string) {
    try {
      const [address, range] = cidrRange.split('/')
      this.address = ipv4.address(address)
      this.range = Number(range)
    } catch {
      throw new InvalidCidrBlockError(cidrRange)
    }
  }

  public toString(): string {
    return `${this.address}/${this.range}`
  }

  public get allocatableIpCount(): bigint {
    return 2n ** BigInt(Math.abs(32 - this.range))
  }
}

export function block(cidrRange: string): Ipv4CidrBlock {
  return new Ipv4CidrBlock(cidrRange)
}
