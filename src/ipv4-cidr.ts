import { ipv4 } from './ipv4'
import { Ipv4Address } from './ipv4-address'
import { InvalidIpv4CidrError, InvalidIpv4CidrRangeError } from './ipv4-errors'
import type { Ipv4CidrLiteral, Ipv4CidrString } from './ipv4-types'

/**
 * Represents an IPv4 CIDR block with utility methods for subnet operations.
 *
 * While you can instantiate this class directly, it is recommended to use the
 * {@link ipv4.cidr} shorthand method from the `ipv4` namespace instead.
 *
 * @example Creating CIDR blocks (prefer the shorthand)
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * // Recommended: use the ipv4 namespace shorthand
 * const cidr1 = ipv4.cidr("192.168.0.0/24");
 * const cidr2 = ipv4.cidr({ address: "10.0.0.0", range: 8 });
 * const cidr3 = ipv4.cidr([[172, 16, 0, 0], 12]);
 * ```
 *
 * @example Getting CIDR properties
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * const cidr = ipv4.cidr("192.168.0.0/24");
 * cidr.baseAddress().toString(); // "192.168.0.0"
 * cidr.range();                  // 24
 * cidr.netmask().toString();     // "255.255.255.0"
 * cidr.network().toString();     // "192.168.0.0"
 * cidr.addressCount();           // 256
 * ```
 *
 * @example Working with usable addresses
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * const cidr = ipv4.cidr("192.168.0.0/24");
 * cidr.getFirstUsableAddress()?.toString(); // "192.168.0.1"
 * cidr.getLastUsableAddress()?.toString();  // "192.168.0.254"
 * ```
 *
 * @example Iterating over addresses
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * const cidr = ipv4.cidr("192.168.1.0/30");
 * for (const addr of cidr.addresses()) {
 *   console.log(addr.toString());
 * }
 * // "192.168.1.0", "192.168.1.1", "192.168.1.2", "192.168.1.3"
 * ```
 *
 * @example Checking containment and overlap
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * const cidr = ipv4.cidr("192.168.0.0/24");
 * cidr.includes(ipv4.address("192.168.0.100")); // true
 * cidr.includes(ipv4.address("192.168.1.1"));   // false
 * cidr.overlaps("192.168.0.0/25");              // true
 * cidr.overlaps("10.0.0.0/8");                  // false
 * ```
 *
 * @example Splitting into subranges
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * const cidr = ipv4.cidr("192.168.0.0/24");
 *
 * // Split into equal /26 subnets
 * cidr.subnet(26).map(s => s.toString());
 * // ["192.168.0.0/26", "192.168.0.64/26", "192.168.0.128/26", "192.168.0.192/26"]
 *
 * // Split by specific ranges
 * cidr.subnetBy([25, 26, 27, 27]).map(s => s.toString());
 * // ["192.168.0.0/25", "192.168.0.128/26", "192.168.0.192/27", "192.168.0.224/27"]
 * ```
 *
 * @example Navigating sequential CIDRs
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * const cidr = ipv4.cidr("192.168.0.0/24");
 * cidr.nextCIDR()?.toString();     // "192.168.1.0/24"
 * cidr.previousCIDR()?.toString(); // "192.167.255.0/24"
 * ```
 */
export class Ipv4Cidr {
  #address: Ipv4Address
  #range: number

  constructor(address: Ipv4CidrLiteral) {
    if (!ipv4.isValidCIDR(address)) {
      throw new InvalidIpv4CidrError(address)
    }
    if (typeof address === 'string') {
      const [ip, rangeStr] = address.split('/')
      this.#address = new Ipv4Address(ip!)
      this.#range = parseInt(rangeStr!, 10)
    } else if (Array.isArray(address)) {
      this.#address = new Ipv4Address(address[0])
      this.#range = address[1]
    } else if (typeof address === 'object' && address !== null) {
      this.#address = new Ipv4Address(address.address)
      this.#range = address.range
    } else {
      throw new InvalidIpv4CidrError(address)
    }
  }

  /**
   * Gets the base IPv4 address of the CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.0.0/24");
   * cidr.baseAddress().toString(); // "192.168.0.0"
   * ```
   *
   * @returns The base IPv4 address.
   */
  public baseAddress(): Ipv4Address {
    return this.#address
  }

  /**
   * Gets the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.0.0/24");
   * cidr.range(); // 24
   * ```
   *
   * @returns The CIDR range as a number.
   */
  public range(): number {
    return this.#range
  }

  /**
   * Calculates the netmask for the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.cidr("192.168.0.0/24").netmask().toString(); // "255.255.255.0"
   * ipv4.cidr("10.0.0.0/8").netmask().toString();     // "255.0.0.0"
   * ipv4.cidr("172.16.0.0/16").netmask().toString();  // "255.255.0.0"
   * ```
   *
   * @returns The netmask as an Ipv4Address.
   */
  public netmask(): Ipv4Address {
    const maskNumber = this.#range === 0 ? 0 : (~0 << (32 - this.#range)) >>> 0
    return new Ipv4Address(maskNumber)
  }

  /**
   * Calculates the hostmask (inverse of the netmask) for the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.cidr("192.168.0.0/24").hostmask().toString(); // "0.0.0.255"
   * ipv4.cidr("10.0.0.0/8").hostmask().toString();     // "0.255.255.255"
   * ipv4.cidr("172.16.0.0/16").hostmask().toString();  // "0.0.255.255"
   * ```
   *
   * @returns The hostmask as an Ipv4Address.
   */
  public hostmask(): Ipv4Address {
    const maskNumber = this.#range === 0 ? 0 : (~0 << (32 - this.#range)) >>> 0
    const hostmaskNumber = ~maskNumber >>> 0
    return new Ipv4Address(hostmaskNumber)
  }

  /**
   * Calculates the network address by applying the netmask to the base address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.cidr("192.168.1.5/24").network().toString(); // "192.168.1.0"
   * ipv4.cidr("10.5.10.20/8").network().toString();   // "10.0.0.0"
   * ipv4.cidr("172.16.5.1/16").network().toString();  // "172.16.0.0"
   * ```
   *
   * @returns The network address as an Ipv4Address.
   */
  public network(): Ipv4Address {
    const maskNumber = this.#range === 0 ? 0 : (~0 << (32 - this.#range)) >>> 0
    const networkNumber = (this.#address.toNumber() & maskNumber) >>> 0
    return new Ipv4Address(networkNumber)
  }

  /**
   * Calculates the network CIDR by applying the netmask to the base address and returning a CIDR with the network address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.cidr("192.168.1.5/24").networkCIDR().toString(); // "192.168.1.0/24"
   * ipv4.cidr("10.5.10.20/8").networkCIDR().toString();   // "10.0.0.0/8"
   * ipv4.cidr("172.16.5.1/16").networkCIDR().toString();  // "172.16.0.0/16"
   * ```
   *
   * @returns The network CIDR as an Ipv4Cidr.
   */
  public networkCIDR(): Ipv4Cidr {
    const maskNumber = this.#range === 0 ? 0 : (~0 << (32 - this.#range)) >>> 0
    const networkNumber = (this.#address.toNumber() & maskNumber) >>> 0
    return new Ipv4Cidr([networkNumber, this.#range])
  }

  /**
   * Returns the string representation of the IPv4 CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr({ address: "10.0.0.0", range: 8 });
   * cidr.toString(); // "10.0.0.0/8"
   * ```
   *
   * @returns The IPv4 CIDR as a string (example: "192.0.0.0/24").
   */
  public toString(): Ipv4CidrString {
    return `${this.#address.toString()}/${this.#range}` as Ipv4CidrString
  }

  /**
   * Gets the address and range parts of the IPv4 CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const [address, range] = ipv4.cidr("192.168.0.0/24").rangeParts();
   * address.toString(); // "192.168.0.0"
   * range; // 24
   * ```
   *
   * @returns A tuple containing the IPv4 address and the CIDR range.
   */
  public rangeParts(): [Ipv4Address, number] {
    return [this.#address, this.#range]
  }

  /**
   * Calculates the total number of addresses in the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.cidr("192.168.0.0/24").addressCount(); // 256
   * ipv4.cidr("10.0.0.0/8").addressCount();     // 16777216
   * ipv4.cidr("192.168.1.0/32").addressCount(); // 1
   * ```
   *
   * @returns The total number of addresses in the CIDR range.
   */
  public addressCount(): number {
    return 2 ** (32 - this.#range)
  }

  /**
   * Generates all IPv4 addresses within the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.1.0/30");
   * for (const addr of cidr.addresses()) {
   *   console.log(addr.toString());
   * }
   * // Output: "192.168.1.0", "192.168.1.1", "192.168.1.2", "192.168.1.3"
   * ```
   *
   * @returns A generator that yields each IPv4 address in the CIDR range.
   */
  public *addresses(): Generator<Ipv4Address> {
    const baseNumber = this.#address.toNumber()
    const count = this.addressCount()
    for (let i = 0; i < count; i++) {
      yield new Ipv4Address(baseNumber + i)
    }
  }

  /**
   * Checks if this CIDR is equal to another CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.0.0/24");
   * cidr.equals("192.168.0.0/24");                     // true
   * cidr.equals({ address: "192.168.0.0", range: 24 }); // true
   * cidr.equals("10.0.0.0/8");                         // false
   * ```
   *
   * @param other - The other IPv4 CIDR to compare with.
   * @returns True if both CIDRs have the same base address and range; otherwise, false.
   */
  public equals(other: Ipv4Cidr | Ipv4CidrLiteral): boolean {
    const otherCidr = other instanceof Ipv4Cidr ? other : new Ipv4Cidr(other)
    return this.#address.equals(otherCidr.#address) && this.#range === otherCidr.#range
  }

  /**
   * Checks if there is a next sequential CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.cidr("192.168.0.0/24").hasNextCIDR(); // true
   * ipv4.cidr("255.255.255.0/24").hasNextCIDR(); // false
   * ```
   *
   * @returns true if there is a next CIDR.
   */
  public hasNextCIDR(): boolean {
    const nextBaseAddressNumber = this.#address.toNumber() + this.addressCount()
    return nextBaseAddressNumber <= ipv4.MAX_SIZE
  }

  /**
   * Gets the next sequential CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.0.0/24");
   * cidr.nextCIDR()?.toString(); // "192.168.1.0/24"
   *
   * const lastCidr = ipv4.cidr("255.255.255.0/24");
   * lastCidr.nextCIDR(); // undefined
   * ```
   *
   * @returns The next CIDR, or undefined if there is no next CIDR.
   */
  public nextCIDR(): Ipv4Cidr | undefined {
    const nextBaseAddressNumber = this.#address.toNumber() + this.addressCount()
    if (nextBaseAddressNumber > ipv4.MAX_SIZE) {
      return undefined
    }
    return new Ipv4Cidr([nextBaseAddressNumber, this.#range])
  }

  /**
   * Checks if there is a previous sequential CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.cidr("192.168.1.0/24").hasPreviousCIDR(); // true
   * ipv4.cidr("0.0.0.0/24").hasPreviousCIDR();     // false
   * ```
   *
   * @returns true if there is a previous CIDR.
   */
  public hasPreviousCIDR(): boolean {
    return this.#address.toNumber() >= this.addressCount()
  }

  /**
   * Gets the previous sequential CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.1.0/24");
   * cidr.previousCIDR()?.toString(); // "192.168.0.0/24"
   *
   * const firstCidr = ipv4.cidr("0.0.0.0/24");
   * firstCidr.previousCIDR(); // undefined
   * ```
   *
   * @returns The previous CIDR, or undefined if there is no previous CIDR.
   */
  public previousCIDR(): Ipv4Cidr | undefined {
    const prevBaseAddressNumber = this.#address.toNumber() - this.addressCount()
    if (prevBaseAddressNumber < ipv4.MIN_SIZE) {
      return undefined
    }
    return new Ipv4Cidr([prevBaseAddressNumber, this.#range])
  }

  /**
   * Gets the first usable address in the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.0.0/24");
   * cidr.getFirstUsableAddress()?.toString(); // "192.168.0.1"
   *
   * const hostCidr = ipv4.cidr("192.168.1.1/32");
   * hostCidr.getFirstUsableAddress(); // undefined (no usable addresses in /32)
   * ```
   *
   * @returns The first usable IPv4 address, or undefined if the range is /32.
   */
  public getFirstUsableAddress(): Ipv4Address | undefined {
    if (this.#range === 32) {
      return undefined
    }
    const firstUsableNumber = this.#address.toNumber() + 1
    return new Ipv4Address(firstUsableNumber)
  }

  /**
   * Gets the last usable address in the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.0.0/24");
   * cidr.getLastUsableAddress()?.toString(); // "192.168.0.254"
   *
   * const hostCidr = ipv4.cidr("192.168.1.1/32");
   * hostCidr.getLastUsableAddress(); // undefined (no usable addresses in /32)
   * ```
   *
   * @returns The last usable IPv4 address, or undefined if the range is /32.
   */
  public getLastUsableAddress(): Ipv4Address | undefined {
    if (this.#range === 32) {
      return undefined
    }
    const lastUsableNumber = this.#address.toNumber() + this.addressCount() - 2
    return new Ipv4Address(lastUsableNumber)
  }

  /**
   * Checks if the given IPv4 address is within the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.0.0/24");
   * cidr.includes(ipv4.address("192.168.0.100")); // true
   * cidr.includes(ipv4.address("192.168.1.1"));   // false
   * ```
   *
   * @param ip - The IPv4 address to check.
   * @returns True if the address is within the CIDR range; otherwise, false.
   */
  public includes(ip: Ipv4Address): boolean {
    const ipNumber = ip.toNumber()
    const baseNumber = this.#address.toNumber()
    const count = this.addressCount()
    return ipNumber >= baseNumber && ipNumber < baseNumber + count
  }

  /**
   * Checks if this CIDR overlaps with another CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.0.0/24");
   * cidr.overlaps("192.168.0.0/25");  // true (subset)
   * cidr.overlaps("192.168.0.128/25"); // true (partial overlap)
   * cidr.overlaps("10.0.0.0/8");      // false (no overlap)
   * ```
   *
   * @param other - The other IPv4 CIDR to check for overlap.
   * @returns True if the CIDRs overlap; otherwise, false.
   */
  public overlaps(other: Ipv4Cidr | Ipv4CidrLiteral): boolean {
    const otherCidr = other instanceof Ipv4Cidr ? other : new Ipv4Cidr(other)
    const thisBase = this.#address.toNumber()
    const thisCount = this.addressCount()
    const otherBase = otherCidr.#address.toNumber()
    const otherCount = otherCidr.addressCount()
    return thisBase < otherBase + otherCount && otherBase < thisBase + thisCount
  }

  /**
   * Splits the CIDR into smaller subranges of the specified new range.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("192.168.0.0/24");
   * const subnets = cidr.subnet(26);
   * subnets.map(s => s.toString());
   * // ["192.168.0.0/26", "192.168.0.64/26", "192.168.0.128/26", "192.168.0.192/26"]
   * ```
   *
   * @param newRange - The new CIDR range for the subnets.
   * @returns An array of Ipv4Cidr instances representing the subnets.
   * @throws InvalidIpv4CidrRangeError if the new range is less than the current range or greater than the maximum range.
   */
  public subnet(newRange: number): Ipv4Cidr[] {
    if (newRange < this.#range || newRange > ipv4.MAX_RANGE) {
      throw new InvalidIpv4CidrRangeError(
        `New range ${newRange} must be between current range ${this.#range} and ${ipv4.MAX_RANGE}`,
      )
    }

    const subranges: Ipv4Cidr[] = []
    const totalSubnets = 2 ** (newRange - this.#range)
    const baseNumber = this.#address.toNumber()
    const subnetSize = 2 ** (32 - newRange)

    for (let i = 0; i < totalSubnets; i++) {
      const subnetBaseNumber = baseNumber + i * subnetSize
      subranges.push(new Ipv4Cidr([subnetBaseNumber, newRange]))
    }

    return subranges
  }

  /**
   * Splits the CIDR into sequential subranges with the specified CIDR ranges.
   * Each range in the input array creates a subrange starting where the previous one ended.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const cidr = ipv4.cidr("10.0.0.0/16");
   * const subnets = cidr.subnetBy([24, 20, 24]);
   * subnets.map(s => s.toString());
   * // ["10.0.0.0/24", "10.0.1.0/20", "10.0.17.0/24"]
   * ```
   *
   * @param ranges - An array of CIDR range values (e.g., [24, 20, 24]).
   * @returns An array of Ipv4Cidr instances representing the subnets.
   * @throws InvalidIpv4CidrRangeError if any range is less than the current range or greater than 32.
   */
  public subnetBy(ranges: number[]): Ipv4Cidr[] {
    const subranges: Ipv4Cidr[] = []
    let currentBase = this.#address.toNumber()
    const endAddress = currentBase + this.addressCount()

    for (const range of ranges) {
      if (range < this.#range || range > ipv4.MAX_RANGE) {
        throw new InvalidIpv4CidrRangeError(
          `Range ${range} must be between current range ${this.#range} and ${ipv4.MAX_RANGE}`,
        )
      }

      const subnetSize = 2 ** (32 - range)

      if (currentBase + subnetSize > endAddress) {
        throw new InvalidIpv4CidrRangeError(
          `Subrange /${range} at ${new Ipv4Address(currentBase).toString()} exceeds the bounds of the parent CIDR`,
        )
      }

      subranges.push(new Ipv4Cidr([currentBase, range]))
      currentBase += subnetSize
    }

    return subranges
  }
}
