import type { Ipv6AddressLiteral, Ipv6AddressHextets } from './ipv6-types'
import { ipv6 } from './ipv6'
import { InvalidIpv6AddressError } from './ipv6-errors'

/**
 * Represents an IPv6 address with utility methods for manipulation and comparison.
 *
 * While you can instantiate this class directly, it is recommended to use the
 * {@link ipv6.address} shorthand method from the `ipv6` namespace instead.
 *
 * @example Creating addresses (prefer the shorthand)
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * // Recommended: use the ipv6 namespace shorthand
 * const addr1 = ipv6.address("2001:db8::1");
 * const addr2 = ipv6.address(42540766411282592856903984951653826561n);
 * const addr3 = ipv6.address([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
 * ```
 *
 * @example Converting between formats
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * const addr = ipv6.address("2001:db8::1");
 * addr.toString();       // "2001:db8::1" (compressed)
 * addr.toFullString();   // "2001:0db8:0000:0000:0000:0000:0000:0001"
 * addr.toBigInt();       // 42540766411282592856903984951653826561n
 * addr.hextets();        // [0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]
 * ```
 *
 * @example Comparing addresses
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * const addr = ipv6.address("2001:db8::1");
 * addr.equals("2001:db8::1");         // true
 * addr.isGreaterThan("2001:db8::0");  // true
 * addr.isLessThan("2001:db8::2");     // true
 * ```
 *
 * @example Navigating sequential addresses
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * const addr = ipv6.address("2001:db8::1");
 * addr.nextAddress()?.toString();     // "2001:db8::2"
 * addr.previousAddress()?.toString(); // "2001:db8::"
 * ```
 *
 * @example Checking address types
 * ```ts
 * import { ipv6 } from 'cidr-block';
 *
 * ipv6.address("::1").isLoopbackAddress();           // true
 * ipv6.address("fc00::1").isUniqueLocalAddress();    // true
 * ipv6.address("fe80::1").isLinkLocalAddress();      // true
 * ipv6.address("ff02::1").isMulticastAddress();      // true
 * ```
 */
export class Ipv6Address {
  #hextets: Ipv6AddressHextets

  constructor(ip: Ipv6AddressLiteral) {
    if (!ipv6.isValidAddress(ip)) {
      throw new InvalidIpv6AddressError(ip)
    }
    this.#hextets = ipv6.parseHextets(ip)
  }

  /**
   * Gets the hextets of the IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.hextets(); // [0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]
   * ```
   *
   * @returns An array of eight numbers representing the hextets of the IPv6 address.
   */
  public hextets(): Ipv6AddressHextets {
    return this.#hextets
  }

  /**
   * Returns the full (expanded) string representation of the IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.toFullString(); // "2001:0db8:0000:0000:0000:0000:0000:0001"
   * ```
   *
   * @returns The IPv6 address as a full string with all hextets expanded.
   */
  public toFullString(): string {
    return this.#hextets.map(h => h.toString(16).padStart(4, '0')).join(':')
  }

  /**
   * Returns the compressed string representation of the IPv6 address.
   * Uses :: notation for the longest run of consecutive zero hextets.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:0db8:0000:0000:0000:0000:0000:0001");
   * addr.toString(); // "2001:db8::1"
   * ```
   *
   * @returns The IPv6 address as a compressed string.
   */
  public toString(): string {
    // Find the longest run of consecutive zeros
    let longestStart = -1
    let longestLength = 0
    let currentStart = -1
    let currentLength = 0

    for (let i = 0; i < 8; i++) {
      if (this.#hextets[i] === 0) {
        if (currentStart === -1) {
          currentStart = i
          currentLength = 1
        } else {
          currentLength++
        }
      } else {
        if (currentLength > longestLength && currentLength > 1) {
          longestStart = currentStart
          longestLength = currentLength
        }
        currentStart = -1
        currentLength = 0
      }
    }

    // Check if the last run is the longest
    if (currentLength > longestLength && currentLength > 1) {
      longestStart = currentStart
      longestLength = currentLength
    }

    // Build the compressed string
    if (longestStart === -1) {
      // No compression possible
      return this.#hextets.map(h => h.toString(16)).join(':')
    }

    const before = this.#hextets.slice(0, longestStart).map(h => h.toString(16))
    const after = this.#hextets.slice(longestStart + longestLength).map(h => h.toString(16))

    if (before.length === 0 && after.length === 0) {
      return '::'
    }
    if (before.length === 0) {
      return `::${after.join(':')}`
    }
    if (after.length === 0) {
      return `${before.join(':')}::`
    }
    return `${before.join(':')}::${after.join(':')}`
  }

  /**
   * Returns the binary string representation of the IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("::1");
   * addr.toBinaryString();
   * // "0000000000000000:0000000000000000:0000000000000000:0000000000000000:0000000000000000:0000000000000000:0000000000000000:0000000000000001"
   * ```
   *
   * @returns The IPv6 address as a binary string with colons separating hextets.
   */
  public toBinaryString(): string {
    return this.#hextets.map(h => h.toString(2).padStart(16, '0')).join(':')
  }

  /**
   * Converts the IPv6 address to its BigInt representation.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.toBigInt(); // 42540766411282592856903984951653826561n
   * ```
   *
   * @returns The IPv6 address as a BigInt.
   */
  public toBigInt(): bigint {
    let result = 0n
    for (let i = 0; i < 8; i++) {
      result = (result << 16n) | BigInt(this.#hextets[i]!)
    }
    return result
  }

  /**
   * Checks if there is a next sequential IPv6 address.
   * This would only return false if the current address is the maximum possible value.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.address("2001:db8::1").hasNextAddress();                               // true
   * ipv6.address("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff").hasNextAddress();   // false
   * ```
   *
   * @returns true if there is a next IPv6 address.
   */
  public hasNextAddress(): boolean {
    return this.toBigInt() < ipv6.MAX_SIZE
  }

  /**
   * Gets the next sequential IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.nextAddress()?.toString(); // "2001:db8::2"
   *
   * const maxAddr = ipv6.address("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff");
   * maxAddr.nextAddress(); // undefined
   * ```
   *
   * @returns The next IPv6 address, or undefined if the current address is the maximum possible value.
   */
  public nextAddress(): Ipv6Address | undefined {
    const nextAddress = this.toBigInt() + 1n
    if (nextAddress > ipv6.MAX_SIZE) {
      return undefined
    }
    return new Ipv6Address(nextAddress)
  }

  /**
   * Checks if there is a previous sequential IPv6 address.
   * This would only return false if the current address is the minimum possible value (::).
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.address("2001:db8::1").hasPreviousAddress(); // true
   * ipv6.address("::").hasPreviousAddress();          // false
   * ```
   *
   * @returns true if there is a previous IPv6 address.
   */
  public hasPreviousAddress(): boolean {
    return this.toBigInt() > ipv6.MIN_SIZE
  }

  /**
   * Gets the previous sequential IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.previousAddress()?.toString(); // "2001:db8::"
   *
   * const minAddr = ipv6.address("::");
   * minAddr.previousAddress(); // undefined
   * ```
   *
   * @returns The previous IPv6 address, or undefined if the current address is the minimum possible value.
   */
  public previousAddress(): Ipv6Address | undefined {
    const prevAddress = this.toBigInt() - 1n
    if (prevAddress < ipv6.MIN_SIZE) {
      return undefined
    }
    return new Ipv6Address(prevAddress)
  }

  /**
   * Compares two IPv6 addresses for equality.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.equals("2001:db8::1");                    // true
   * addr.equals("2001:0db8:0:0:0:0:0:1");          // true
   * addr.equals(ipv6.address("2001:db8::2"));      // false
   * ```
   *
   * @param otherAddress - The other IPv6 address to compare with, which can be an Ipv6Address instance or literal value.
   * @returns true if both IPv6 addresses are equal
   */
  public equals(otherAddress: Ipv6Address | Ipv6AddressLiteral): boolean {
    if (otherAddress instanceof Ipv6Address) {
      return this.toBigInt() === otherAddress.toBigInt()
    }
    return this.toBigInt() === new Ipv6Address(otherAddress).toBigInt()
  }

  /**
   * Compares if this IPv6 address is greater than another IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.isGreaterThan("2001:db8::");   // true
   * addr.isGreaterThan("2001:db8::1");  // false
   * addr.isGreaterThan("2001:db8::2");  // false
   * ```
   *
   * @param otherAddress - The other IPv6 address to compare with, which can be an Ipv6Address instance or literal value.
   * @returns true if this IPv6 address is greater than the other IPv6 address
   */
  public isGreaterThan(otherAddress: Ipv6Address | Ipv6AddressLiteral): boolean {
    if (otherAddress instanceof Ipv6Address) {
      return this.toBigInt() > otherAddress.toBigInt()
    }
    return this.toBigInt() > new Ipv6Address(otherAddress).toBigInt()
  }

  /**
   * Compares if this IPv6 address is greater than or equal to another IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.isGreaterThanOrEqual("2001:db8::");   // true
   * addr.isGreaterThanOrEqual("2001:db8::1");  // true
   * addr.isGreaterThanOrEqual("2001:db8::2");  // false
   * ```
   *
   * @param otherAddress - The other IPv6 address to compare with, which can be an Ipv6Address instance or literal value.
   * @returns true if this IPv6 address is greater than or equal to the other IPv6 address
   */
  public isGreaterThanOrEqual(otherAddress: Ipv6Address | Ipv6AddressLiteral): boolean {
    if (otherAddress instanceof Ipv6Address) {
      return this.toBigInt() >= otherAddress.toBigInt()
    }
    return this.toBigInt() >= new Ipv6Address(otherAddress).toBigInt()
  }

  /**
   * Compares if this IPv6 address is less than another IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.isLessThan("2001:db8::2");  // true
   * addr.isLessThan("2001:db8::1");  // false
   * addr.isLessThan("2001:db8::");   // false
   * ```
   *
   * @param otherAddress - The other IPv6 address to compare with, which can be an Ipv6Address instance or literal value.
   * @returns true if this IPv6 address is less than the other IPv6 address
   */
  public isLessThan(otherAddress: Ipv6Address | Ipv6AddressLiteral): boolean {
    if (otherAddress instanceof Ipv6Address) {
      return this.toBigInt() < otherAddress.toBigInt()
    }
    return this.toBigInt() < new Ipv6Address(otherAddress).toBigInt()
  }

  /**
   * Compares if this IPv6 address is less than or equal to another IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const addr = ipv6.address("2001:db8::1");
   * addr.isLessThanOrEqual("2001:db8::2");  // true
   * addr.isLessThanOrEqual("2001:db8::1");  // true
   * addr.isLessThanOrEqual("2001:db8::");   // false
   * ```
   *
   * @param otherAddress - The other IPv6 address to compare with, which can be an Ipv6Address instance or literal value.
   * @returns true if this IPv6 address is less than or equal to the other IPv6 address
   */
  public isLessThanOrEqual(otherAddress: Ipv6Address | Ipv6AddressLiteral): boolean {
    if (otherAddress instanceof Ipv6Address) {
      return this.toBigInt() <= otherAddress.toBigInt()
    }
    return this.toBigInt() <= new Ipv6Address(otherAddress).toBigInt()
  }

  /**
   * Checks if the IPv6 address is the loopback address (::1)
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.address("::1").isLoopbackAddress();          // true
   * ipv6.address("2001:db8::1").isLoopbackAddress();  // false
   * ```
   *
   * @returns true if the IPv6 address is the loopback address
   */
  public isLoopbackAddress(): boolean {
    return this.toBigInt() === 1n
  }

  /**
   * Checks if the IPv6 address is the unspecified address (::)
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.address("::").isUnspecifiedAddress();          // true
   * ipv6.address("2001:db8::1").isUnspecifiedAddress(); // false
   * ```
   *
   * @returns true if the IPv6 address is the unspecified address
   */
  public isUnspecifiedAddress(): boolean {
    return this.toBigInt() === 0n
  }

  /**
   * Checks if the IPv6 address is a unique local address (fc00::/7).
   * These are the IPv6 equivalent of RFC 1918 private addresses.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.address("fc00::1").isUniqueLocalAddress();     // true
   * ipv6.address("fd00::1").isUniqueLocalAddress();     // true
   * ipv6.address("2001:db8::1").isUniqueLocalAddress(); // false
   * ```
   *
   * @returns true if the IPv6 address is a unique local address
   */
  public isUniqueLocalAddress(): boolean {
    // fc00::/7 means first 7 bits are 1111110
    // This covers fc00::/8 and fd00::/8
    return (this.#hextets[0]! & 0xfe00) === 0xfc00
  }

  /**
   * Checks if the IPv6 address is a link-local address (fe80::/10)
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.address("fe80::1").isLinkLocalAddress();     // true
   * ipv6.address("2001:db8::1").isLinkLocalAddress(); // false
   * ```
   *
   * @returns true if the IPv6 address is a link-local address
   */
  public isLinkLocalAddress(): boolean {
    // fe80::/10 means first 10 bits are 1111111010
    return (this.#hextets[0]! & 0xffc0) === 0xfe80
  }

  /**
   * Checks if the IPv6 address is a multicast address (ff00::/8)
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.address("ff02::1").isMulticastAddress();     // true
   * ipv6.address("2001:db8::1").isMulticastAddress(); // false
   * ```
   *
   * @returns true if the IPv6 address is a multicast address
   */
  public isMulticastAddress(): boolean {
    return (this.#hextets[0]! & 0xff00) === 0xff00
  }

  /**
   * Checks if the IPv6 address is an IPv4-mapped IPv6 address (::ffff:0:0/96)
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.address("::ffff:192.168.1.1").isIPv4MappedAddress();  // true
   * ipv6.address("::ffff:c0a8:0101").isIPv4MappedAddress();    // true
   * ipv6.address("2001:db8::1").isIPv4MappedAddress();         // false
   * ```
   *
   * @returns true if the IPv6 address is an IPv4-mapped address
   */
  public isIPv4MappedAddress(): boolean {
    // First 80 bits (5 hextets) must be 0, 6th hextet must be 0xffff
    return (
      this.#hextets[0] === 0
      && this.#hextets[1] === 0
      && this.#hextets[2] === 0
      && this.#hextets[3] === 0
      && this.#hextets[4] === 0
      && this.#hextets[5] === 0xffff
    )
  }

  /**
   * Checks if the IPv6 address is a documentation address (2001:db8::/32)
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.address("2001:db8::1").isDocumentationAddress();     // true
   * ipv6.address("2001:db8:1234::1").isDocumentationAddress(); // true
   * ipv6.address("2001:470::1").isDocumentationAddress();     // false
   * ```
   *
   * @returns true if the IPv6 address is a documentation address
   */
  public isDocumentationAddress(): boolean {
    return this.#hextets[0] === 0x2001 && this.#hextets[1] === 0x0db8
  }
}
