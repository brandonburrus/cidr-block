import { ipv6 } from './ipv6'
import { Ipv6Address } from './ipv6-address'
import { InvalidIpv6CidrError, InvalidIpv6CidrRangeError } from './ipv6-errors'
import type { Ipv6CidrLiteral } from './ipv6-types'

/**
 * Represents an IPv6 CIDR block with utility methods for subnet operations.
 *
 * While you can instantiate this class directly, it is recommended to use the
 * {@link ipv6.cidr} shorthand method from the `ipv6` namespace instead.
 *
 * @example Creating CIDR blocks (prefer the shorthand)
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * // Recommended: use the ipv6 namespace shorthand
 * const cidr1 = ipv6.cidr("2001:db8::/32");
 * const cidr2 = ipv6.cidr({ address: "2001:db8::", range: 32 });
 * const cidr3 = ipv6.cidr(["2001:db8::", 32]);
 * ```
 *
 * @example Getting CIDR properties
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * const cidr = ipv6.cidr("2001:db8::/32");
 * cidr.baseAddress().toString(); // "2001:db8::"
 * cidr.range();                  // 32
 * cidr.netmask().toString();     // "ffff:ffff::"
 * cidr.addressCount();           // 79228162514264337593543950336n
 * ```
 *
 * @example Working with usable addresses
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * const cidr = ipv6.cidr("2001:db8::/126");
 * cidr.getFirstUsableAddress()?.toString(); // "2001:db8::1"
 * cidr.getLastUsableAddress()?.toString();  // "2001:db8::2"
 * ```
 *
 * @example Checking containment and overlap
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * const cidr = ipv6.cidr("2001:db8::/32");
 * cidr.includes(ipv6.address("2001:db8::1"));  // true
 * cidr.includes(ipv6.address("2001:db9::1"));  // false
 * cidr.overlaps("2001:db8::/48");              // true
 * cidr.overlaps("2001:db9::/32");              // false
 * ```
 *
 * @example Splitting into subranges
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * const cidr = ipv6.cidr("2001:db8::/32");
 *
 * // Split into equal /48 subnets
 * cidr.subnet(34).map(s => s.toString());
 * // ["2001:db8::/34", "2001:db8:4000::/34", "2001:db8:8000::/34", "2001:db8:c000::/34"]
 * ```
 *
 * @example Navigating sequential CIDRs
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * const cidr = ipv6.cidr("2001:db8::/32");
 * cidr.nextCIDR()?.toString();     // "2001:db9::/32"
 * cidr.previousCIDR()?.toString(); // "2001:db7::/32"
 * ```
 */
export class Ipv6Cidr {
  #address: Ipv6Address
  #range: number

  constructor(address: Ipv6CidrLiteral) {
    if (!ipv6.isValidCIDR(address)) {
      throw new InvalidIpv6CidrError(address)
    }
    if (typeof address === 'string') {
      const [ip, rangeStr] = address.split('/')
      this.#address = new Ipv6Address(ip!)
      this.#range = Number.parseInt(rangeStr!, 10)
    } else if (Array.isArray(address)) {
      this.#address = new Ipv6Address(address[0])
      this.#range = address[1]
    } else if (typeof address === 'object' && address !== null) {
      this.#address = new Ipv6Address(address.address)
      this.#range = address.range
    } else {
      throw new InvalidIpv6CidrError(address)
    }
  }

  /**
   * Gets the base IPv6 address of the CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   * cidr.baseAddress().toString(); // "2001:db8::"
   * ```
   *
   * @returns The base IPv6 address.
   */
  public baseAddress(): Ipv6Address {
    return this.#address
  }

  /**
   * Gets the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   * cidr.range(); // 32
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
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.cidr("2001:db8::/32").netmask().toString();  // "ffff:ffff::"
   * ipv6.cidr("2001:db8::/64").netmask().toString();  // "ffff:ffff:ffff:ffff::"
   * ipv6.cidr("2001:db8::/128").netmask().toString(); // "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff"
   * ```
   *
   * @returns The netmask as an Ipv6Address.
   */
  public netmask(): Ipv6Address {
    if (this.#range === 0) {
      return new Ipv6Address(0n)
    }
    // Create a mask with `range` 1-bits followed by (128 - range) 0-bits
    const mask = (1n << 128n) - (1n << BigInt(128 - this.#range))
    return new Ipv6Address(mask)
  }

  /**
   * Returns the string representation of the IPv6 CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr({ address: "2001:db8::", range: 32 });
   * cidr.toString(); // "2001:db8::/32"
   * ```
   *
   * @returns The IPv6 CIDR as a string (example: "2001:db8::/32").
   */
  public toString(): string {
    return `${this.#address.toString()}/${this.#range}`
  }

  /**
   * Gets the address and range parts of the IPv6 CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const [address, range] = ipv6.cidr("2001:db8::/32").rangeParts();
   * address.toString(); // "2001:db8::"
   * range; // 32
   * ```
   *
   * @returns A tuple containing the IPv6 address and the CIDR range.
   */
  public rangeParts(): [Ipv6Address, number] {
    return [this.#address, this.#range]
  }

  /**
   * Calculates the total number of addresses in the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.cidr("2001:db8::/64").addressCount();  // 18446744073709551616n
   * ipv6.cidr("2001:db8::/128").addressCount(); // 1n
   * ipv6.cidr("2001:db8::/126").addressCount(); // 4n
   * ```
   *
   * @returns The total number of addresses in the CIDR range as a BigInt.
   */
  public addressCount(): bigint {
    return 1n << BigInt(128 - this.#range)
  }

  /**
   * Generates IPv6 addresses within the CIDR range.
   * Note: For large CIDR ranges, this may generate an extremely large number of addresses.
   * Use with caution and consider using a limit parameter.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/126");
   * for (const addr of cidr.addresses()) {
   *   console.log(addr.toString());
   * }
   * // Output: "2001:db8::", "2001:db8::1", "2001:db8::2", "2001:db8::3"
   * ```
   *
   * @param limit - Optional maximum number of addresses to generate (defaults to all addresses).
   * @returns A generator that yields each IPv6 address in the CIDR range.
   */
  public *addresses(limit?: bigint): Generator<Ipv6Address> {
    const baseBigInt = this.#address.toBigInt()
    const count = this.addressCount()
    const maxIterations = limit !== undefined && limit < count ? limit : count

    for (let i = 0n; i < maxIterations; i++) {
      yield new Ipv6Address(baseBigInt + i)
    }
  }

  /**
   * Checks if this CIDR is equal to another CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   * cidr.equals("2001:db8::/32");                      // true
   * cidr.equals({ address: "2001:db8::", range: 32 }); // true
   * cidr.equals("2001:db8::/48");                      // false
   * ```
   *
   * @param other - The other IPv6 CIDR to compare with.
   * @returns True if both CIDRs have the same base address and range; otherwise, false.
   */
  public equals(other: Ipv6Cidr | Ipv6CidrLiteral): boolean {
    const otherCidr = other instanceof Ipv6Cidr ? other : new Ipv6Cidr(other)
    return this.#address.equals(otherCidr.#address) && this.#range === otherCidr.#range
  }

  /**
   * Checks if there is a next sequential CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.cidr("2001:db8::/32").hasNextCIDR(); // true
   * ipv6.cidr("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ff00/120").hasNextCIDR(); // false
   * ```
   *
   * @returns true if there is a next CIDR.
   */
  public hasNextCIDR(): boolean {
    const nextBaseBigInt = this.#address.toBigInt() + this.addressCount()
    return nextBaseBigInt <= ipv6.MAX_SIZE
  }

  /**
   * Gets the next sequential CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   * cidr.nextCIDR()?.toString(); // "2001:db9::/32"
   * ```
   *
   * @returns The next CIDR, or undefined if there is no next CIDR.
   */
  public nextCIDR(): Ipv6Cidr | undefined {
    const nextBaseBigInt = this.#address.toBigInt() + this.addressCount()
    if (nextBaseBigInt > ipv6.MAX_SIZE) {
      return undefined
    }
    return new Ipv6Cidr([nextBaseBigInt, this.#range])
  }

  /**
   * Checks if there is a previous sequential CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.cidr("2001:db8::/32").hasPreviousCIDR(); // true
   * ipv6.cidr("::/32").hasPreviousCIDR();         // false
   * ```
   *
   * @returns true if there is a previous CIDR.
   */
  public hasPreviousCIDR(): boolean {
    return this.#address.toBigInt() >= this.addressCount()
  }

  /**
   * Gets the previous sequential CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   * cidr.previousCIDR()?.toString(); // "2001:db7::/32"
   *
   * const firstCidr = ipv6.cidr("::/32");
   * firstCidr.previousCIDR(); // undefined
   * ```
   *
   * @returns The previous CIDR, or undefined if there is no previous CIDR.
   */
  public previousCIDR(): Ipv6Cidr | undefined {
    const prevBaseBigInt = this.#address.toBigInt() - this.addressCount()
    if (prevBaseBigInt < ipv6.MIN_SIZE) {
      return undefined
    }
    return new Ipv6Cidr([prevBaseBigInt, this.#range])
  }

  /**
   * Gets the first usable address in the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/64");
   * cidr.getFirstUsableAddress()?.toString(); // "2001:db8::1"
   *
   * const hostCidr = ipv6.cidr("2001:db8::1/128");
   * hostCidr.getFirstUsableAddress(); // undefined (no usable addresses in /128)
   * ```
   *
   * @returns The first usable IPv6 address, or undefined if the range is /128.
   */
  public getFirstUsableAddress(): Ipv6Address | undefined {
    if (this.#range === 128) {
      return undefined
    }
    const firstUsableBigInt = this.#address.toBigInt() + 1n
    return new Ipv6Address(firstUsableBigInt)
  }

  /**
   * Gets the last usable address in the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/126");
   * cidr.getLastUsableAddress()?.toString(); // "2001:db8::2"
   *
   * const hostCidr = ipv6.cidr("2001:db8::1/128");
   * hostCidr.getLastUsableAddress(); // undefined (no usable addresses in /128)
   * ```
   *
   * @returns The last usable IPv6 address, or undefined if the range is /128.
   */
  public getLastUsableAddress(): Ipv6Address | undefined {
    if (this.#range === 128) {
      return undefined
    }
    const lastUsableBigInt = this.#address.toBigInt() + this.addressCount() - 2n
    return new Ipv6Address(lastUsableBigInt)
  }

  /**
   * Checks if the given IPv6 address is within the CIDR range.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   * cidr.includes(ipv6.address("2001:db8::1"));  // true
   * cidr.includes(ipv6.address("2001:db9::1"));  // false
   * ```
   *
   * @param ip - The IPv6 address to check.
   * @returns True if the address is within the CIDR range; otherwise, false.
   */
  public includes(ip: Ipv6Address): boolean {
    const ipBigInt = ip.toBigInt()
    const baseBigInt = this.#address.toBigInt()
    const count = this.addressCount()
    return ipBigInt >= baseBigInt && ipBigInt < baseBigInt + count
  }

  /**
   * Checks if this CIDR overlaps with another CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   * cidr.overlaps("2001:db8::/48");   // true (subset)
   * cidr.overlaps("2001:db8:8000::/33"); // true (partial overlap)
   * cidr.overlaps("2001:db9::/32");   // false (no overlap)
   * ```
   *
   * @param other - The other IPv6 CIDR to check for overlap.
   * @returns True if the CIDRs overlap; otherwise, false.
   */
  public overlaps(other: Ipv6Cidr | Ipv6CidrLiteral): boolean {
    const otherCidr = other instanceof Ipv6Cidr ? other : new Ipv6Cidr(other)
    const thisBase = this.#address.toBigInt()
    const thisCount = this.addressCount()
    const otherBase = otherCidr.#address.toBigInt()
    const otherCount = otherCidr.addressCount()
    return thisBase < otherBase + otherCount && otherBase < thisBase + thisCount
  }

  /**
   * Splits the CIDR into smaller subranges of the specified new range.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   * const subnets = cidr.subnet(34);
   * subnets.map(s => s.toString());
   * // ["2001:db8::/34", "2001:db8:4000::/34", "2001:db8:8000::/34", "2001:db8:c000::/34"]
   * ```
   *
   * @param newRange - The new CIDR range for the subnets.
   * @returns An array of Ipv6Cidr instances representing the subnets.
   * @throws InvalidIpv6CidrRangeError if the new range is less than the current range or greater than the maximum range.
   */
  public subnet(newRange: number): Ipv6Cidr[] {
    if (newRange < this.#range || newRange > ipv6.MAX_RANGE) {
      throw new InvalidIpv6CidrRangeError(
        `New range ${newRange} must be between current range ${this.#range} and ${ipv6.MAX_RANGE}`,
      )
    }

    const subranges: Ipv6Cidr[] = []
    const totalSubnets = 1n << BigInt(newRange - this.#range)
    const baseBigInt = this.#address.toBigInt()
    const subnetSize = 1n << BigInt(128 - newRange)

    for (let i = 0n; i < totalSubnets; i++) {
      const subnetBaseBigInt = baseBigInt + i * subnetSize
      subranges.push(new Ipv6Cidr([subnetBaseBigInt, newRange]))
    }

    return subranges
  }

  /**
   * Splits the CIDR into sequential subranges with the specified CIDR ranges.
   * Each range in the input array creates a subrange starting where the previous one ended.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   * const subnets = cidr.subnetBy([48, 36, 48]);
   * subnets.map(s => s.toString());
   * // ["2001:db8::/48", "2001:db8:1::/36", "2001:db8:1100::/48"]
   * ```
   *
   * @param ranges - An array of CIDR range values (e.g., [48, 36, 48]).
   * @returns An array of Ipv6Cidr instances representing the subnets.
   * @throws InvalidIpv6CidrRangeError if any range is less than the current range or greater than 128.
   */
  public subnetBy(ranges: number[]): Ipv6Cidr[] {
    const subranges: Ipv6Cidr[] = []
    let currentBase = this.#address.toBigInt()
    const endAddress = currentBase + this.addressCount()

    for (const range of ranges) {
      if (range < this.#range || range > ipv6.MAX_RANGE) {
        throw new InvalidIpv6CidrRangeError(
          `Range ${range} must be between current range ${this.#range} and ${ipv6.MAX_RANGE}`,
        )
      }

      const subnetSize = 1n << BigInt(128 - range)

      if (currentBase + subnetSize > endAddress) {
        throw new InvalidIpv6CidrRangeError(
          `Subrange /${range} at ${new Ipv6Address(currentBase).toString()} exceeds the bounds of the parent CIDR`,
        )
      }

      subranges.push(new Ipv6Cidr([currentBase, range]))
      currentBase += subnetSize
    }

    return subranges
  }
}
