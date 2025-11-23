import type { Ipv4AddressLiteral, Ipv4AddressOctets, Ipv4AddressString } from './ipv4-types'
import { ipv4 } from './ipv4'
import { InvalidIpv4AddressError } from './ipv4-errors'

/**
 * Represents an IPv4 address with utility methods for manipulation and comparison.
 *
 * While you can instantiate this class directly, it is recommended to use the
 * {@link ipv4.address} shorthand method from the `ipv4` namespace instead.
 *
 * @example Creating addresses (prefer the shorthand)
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * // Recommended: use the ipv4 namespace shorthand
 * const addr1 = ipv4.address("192.168.1.1");
 * const addr2 = ipv4.address(3232235777);
 * const addr3 = ipv4.address([192, 168, 1, 1]);
 * ```
 *
 * @example Converting between formats
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * const addr = ipv4.address("192.168.1.1");
 * addr.toString();       // "192.168.1.1"
 * addr.toNumber();       // 3232235777
 * addr.octets();         // [192, 168, 1, 1]
 * addr.toBinaryString(); // "11000000.10101000.00000001.00000001"
 * ```
 *
 * @example Comparing addresses
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * const addr = ipv4.address("192.168.1.1");
 * addr.equals("192.168.1.1");      // true
 * addr.isGreaterThan("192.168.1.0"); // true
 * addr.isLessThan("192.168.1.2");    // true
 * ```
 *
 * @example Navigating sequential addresses
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * const addr = ipv4.address("192.168.1.1");
 * addr.nextAddress()?.toString();     // "192.168.1.2"
 * addr.previousAddress()?.toString(); // "192.168.1.0"
 * ```
 *
 * @example Checking address types
 * ```ts
 * import { ipv4 } from 'cidr-block';
 *
 * ipv4.address("127.0.0.1").isLoopbackAddress();  // true
 * ipv4.address("10.0.0.1").isPrivateAddress();    // true
 * ipv4.address("169.254.1.1").isLocalLinkAddress(); // true
 * ipv4.address("224.0.0.1").isMulticastAddress(); // true
 * ```
 */
export class Ipv4Address {
  #octets: Ipv4AddressOctets

  constructor(ip: Ipv4AddressLiteral) {
    if (!ipv4.isValidAddress(ip)) {
      throw new InvalidIpv4AddressError(ip)
    }
    this.#octets = ipv4.parseOctets(ip)
  }

  /**
   * Gets the octets of the IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.octets(); // [192, 168, 1, 1]
   * ```
   *
   * @returns An array of four numbers representing the octets of the IPv4 address.
   */
  public octets(): Ipv4AddressOctets {
    return this.#octets
  }

  /**
   * Returns the string representation of the IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address([10, 0, 0, 1]);
   * addr.toString(); // "10.0.0.1"
   * ```
   *
   * @returns The IPv4 address as a string in dotted-decimal notation (example: "192.187.0.1").
   */
  public toString(): Ipv4AddressString {
    return this.#octets.join('.') as Ipv4AddressString
  }

  /**
   * Returns the binary string representation of the IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.toBinaryString(); // "11000000.10101000.00000001.00000001"
   * ```
   *
   * @returns The IPv4 address as a binary string in dotted-decimal notation (example: "11000000.10111011.00000000.00000001").
   */
  public toBinaryString(): string {
    return this.#octets.map(octet => octet.toString(2).padStart(8, '0')).join('.')
  }

  /**
   * Converts the IPv4 address to its numeric representation.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.toNumber(); // 3232235777
   * ```
   *
   * @returns The IPv4 address as a number.
   */
  public toNumber(): number {
    return (
      (this.#octets[0] << 24) | (this.#octets[1] << 16) | (this.#octets[2] << 8) | this.#octets[3]
    )
  }

  /**
   * Checks if there is a next sequential IPv4 address.
   * This would only return false if the current address is the maximum possible value (255.255.255.255).
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.address("192.168.1.1").hasNextAddress();     // true
   * ipv4.address("255.255.255.255").hasNextAddress(); // false
   * ```
   *
   * @returns true if there is a next IPv4 address.
   */
  public hasNextAddress(): boolean {
    return this.toNumber() < ipv4.MAX_SIZE
  }

  /**
   * Gets the next sequential IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.nextAddress()?.toString(); // "192.168.1.2"
   *
   * const maxAddr = ipv4.address("255.255.255.255");
   * maxAddr.nextAddress(); // undefined
   * ```
   *
   * @returns The next IPv4 address, or undefined if the current address is the maximum possible value.
   */
  public nextAddress(): Ipv4Address | undefined {
    const nextAddress = this.toNumber() + 1
    if (nextAddress > ipv4.MAX_SIZE) {
      return undefined
    }
    return new Ipv4Address(nextAddress)
  }

  /**
   * Checks if there is a previous sequential IPv4 address.
   * This would only return false if the current address is the minimum possible value (0.0.0.0).
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.address("192.168.1.1").hasPreviousAddress(); // true
   * ipv4.address("0.0.0.0").hasPreviousAddress();     // false
   * ```
   *
   * @returns true if there is a previous IPv4 address.
   */
  public hasPreviousAddress(): boolean {
    return this.toNumber() > ipv4.MIN_SIZE
  }

  /**
   * Gets the previous sequential IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.previousAddress()?.toString(); // "192.168.1.0"
   *
   * const minAddr = ipv4.address("0.0.0.0");
   * minAddr.previousAddress(); // undefined
   * ```
   *
   * @returns The previous IPv4 address, or undefined if the current address is the minimum possible value.
   */
  public previousAddress(): Ipv4Address | undefined {
    const prevAddress = this.toNumber() - 1
    if (prevAddress < ipv4.MIN_SIZE) {
      return undefined
    }
    return new Ipv4Address(prevAddress)
  }

  /**
   * Compares two IPv4 addresses for equality.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.equals("192.168.1.1");         // true
   * addr.equals([192, 168, 1, 1]);      // true
   * addr.equals(ipv4.address("10.0.0.1")); // false
   * ```
   *
   * @param otherAddress - The other IPv4 address to compare with, which can be an Ipv4Address instance or literal value.
   * @returns true if both IPv4 addresses are equal
   */
  public equals(otherAddress: Ipv4Address | Ipv4AddressLiteral): boolean {
    if (otherAddress instanceof Ipv4Address) {
      return this.toNumber() === otherAddress.toNumber()
    }
    return this.toNumber() === new Ipv4Address(otherAddress).toNumber()
  }

  /**
   * Compares if this IPv4 address is greater than another IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.isGreaterThan("192.168.1.0"); // true
   * addr.isGreaterThan("192.168.1.1"); // false
   * addr.isGreaterThan("192.168.1.2"); // false
   * ```
   *
   * @param otherAddress - The other IPv4 address to compare with, which can be an Ipv4Address instance or literal value.
   * @returns true if this IPv4 address is greater than the other IPv4 address
   */
  public isGreaterThan(otherAddress: Ipv4Address | Ipv4AddressLiteral): boolean {
    if (otherAddress instanceof Ipv4Address) {
      return this.toNumber() > otherAddress.toNumber()
    }
    return this.toNumber() > new Ipv4Address(otherAddress).toNumber()
  }

  /**
   * Compares if this IPv4 address is greater than or equal to another IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.isGreaterThanOrEqual("192.168.1.0"); // true
   * addr.isGreaterThanOrEqual("192.168.1.1"); // true
   * addr.isGreaterThanOrEqual("192.168.1.2"); // false
   * ```
   *
   * @param otherAddress - The other IPv4 address to compare with, which can be an Ipv4Address instance or literal value.
   * @returns true if this IPv4 address is greater than or equal to the other IPv4 address
   */
  public isGreaterThanOrEqual(otherAddress: Ipv4Address | Ipv4AddressLiteral): boolean {
    if (otherAddress instanceof Ipv4Address) {
      return this.toNumber() >= otherAddress.toNumber()
    }
    return this.toNumber() >= new Ipv4Address(otherAddress).toNumber()
  }

  /**
   * Compares if this IPv4 address is less than another IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.isLessThan("192.168.1.2"); // true
   * addr.isLessThan("192.168.1.1"); // false
   * addr.isLessThan("192.168.1.0"); // false
   * ```
   *
   * @param otherAddress - The other IPv4 address to compare with, which can be an Ipv4Address instance or literal value.
   * @returns true if this IPv4 address is less than the other IPv4 address
   */
  public isLessThan(otherAddress: Ipv4Address | Ipv4AddressLiteral): boolean {
    if (otherAddress instanceof Ipv4Address) {
      return this.toNumber() < otherAddress.toNumber()
    }
    return this.toNumber() < new Ipv4Address(otherAddress).toNumber()
  }

  /**
   * Compares if this IPv4 address is less than or equal to another IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * const addr = ipv4.address("192.168.1.1");
   * addr.isLessThanOrEqual("192.168.1.2"); // true
   * addr.isLessThanOrEqual("192.168.1.1"); // true
   * addr.isLessThanOrEqual("192.168.1.0"); // false
   * ```
   *
   * @param otherAddress - The other IPv4 address to compare with, which can be an Ipv4Address instance or literal value.
   * @returns true if this IPv4 address is less than or equal to the other IPv4 address
   */
  public isLessThanOrEqual(otherAddress: Ipv4Address | Ipv4AddressLiteral): boolean {
    if (otherAddress instanceof Ipv4Address) {
      return this.toNumber() <= otherAddress.toNumber()
    }
    return this.toNumber() <= new Ipv4Address(otherAddress).toNumber()
  }

  /**
   * Checks if the IPv4 address is a loopback address (in the CIDR of 127.0.0.0/8)
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.address("127.0.0.1").isLoopbackAddress();   // true
   * ipv4.address("127.255.0.1").isLoopbackAddress(); // true
   * ipv4.address("192.168.1.1").isLoopbackAddress(); // false
   * ```
   *
   * @returns true if the IPv4 address is a loopback address (example: 127.0.0.1 is true)
   */
  public isLoopbackAddress(): boolean {
    return this.#octets[0] === 127
  }

  /**
   * Checks if the IPv4 address is a private address.
   *
   * This is based on RFC 1918, which defines the following private address ranges:
   * - 10.0.0.0/8
   * - 172.16.0.0/12
   * - 192.168.0.0/16
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.address("10.0.0.1").isPrivateAddress();     // true
   * ipv4.address("172.16.0.1").isPrivateAddress();   // true
   * ipv4.address("192.168.1.1").isPrivateAddress();  // true
   * ipv4.address("8.8.8.8").isPrivateAddress();      // false
   * ```
   *
   * @returns true if the IPv4 address is in any of the private address ranges.
   */
  public isPrivateAddress(): boolean {
    const [o1, o2] = this.#octets

    return o1 === 10 || (o1 === 172 && o2 >= 16 && o2 <= 31) || (o1 === 192 && o2 === 168)
  }

  /**
   * Checks if the IPv4 address is a local-link address (in the CIDR of 169.254.0.0/16).
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.address("169.254.1.1").isLocalLinkAddress();   // true
   * ipv4.address("169.254.255.255").isLocalLinkAddress(); // true
   * ipv4.address("192.168.1.1").isLocalLinkAddress();   // false
   * ```
   *
   * @returns true if the IPv4 address is a local-link address.
   */
  public isLocalLinkAddress(): boolean {
    const [o1, o2] = this.#octets

    return o1 === 169 && o2 === 254
  }

  /**
   * Checks if the IPv4 address is a multicast address (between 224.0.0.0 to 239.255.255.255).
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.address("224.0.0.1").isMulticastAddress();   // true
   * ipv4.address("239.255.255.255").isMulticastAddress(); // true
   * ipv4.address("192.168.1.1").isMulticastAddress(); // false
   * ```
   *
   * @returns true if the IPv4 address is a multicast address.
   */
  public isMulticastAddress(): boolean {
    const firstOctet = this.#octets[0]
    return firstOctet >= 224 && firstOctet <= 239
  }
}
