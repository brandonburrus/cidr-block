import type { Ipv4AddressLiteral, Ipv4AddressOctets, Ipv4CidrLiteral } from './ipv4-types'
import { Ipv4Address } from './ipv4-address'
import { Ipv4Cidr } from './ipv4-cidr'
import { InvalidIpv4AddressError } from './ipv4-errors'

export * from './ipv4-address'
export * from './ipv4-cidr'
export * from './ipv4-types'
export * from './ipv4-errors'

export namespace ipv4 {
  /**
   * The maximum possible value for an IPv4 address.
   */
  export const MAX_SIZE = 0xffffffff

  /**
   * The minimum possible value for an IPv4 address.
   */
  export const MIN_SIZE = 0x00000000

  /**
   * The maximum CIDR range for IPv4 addresses.
   */
  export const MAX_RANGE = 32

  /**
   * The minimum CIDR range for IPv4 addresses.
   */
  export const MIN_RANGE = 0

  /**
   * Creates a new Ipv4Address instance from the given literal.
   * Valid formats include string, number, or octet array.
   *
   * @example Creating addresses
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
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
   *
   * @param ip - The IPv4 address in string, number, or octet array format.
   * @returns A new Ipv4Address instance.
   * @throws {InvalidIpv4AddressError} If the input is not a valid IPv4 address.
   */
  export function address(ip: Ipv4AddressLiteral): Ipv4Address {
    return new Ipv4Address(ip)
  }

  /**
   * Creates a new Ipv4Cidr instance from the given literal.
   * Valid formats include string, object, or tuple.
   *
   * @example Creating CIDR blocks
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
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
   *
   * @param cidr - The IPv4 CIDR in string, object, or tuple format.
   * @returns A new Ipv4Cidr instance.
   * @throws {InvalidIpv4CidrError} If the input is not a valid IPv4 CIDR.
   */
  export function cidr(cidr: Ipv4CidrLiteral): Ipv4Cidr {
    return new Ipv4Cidr(cidr)
  }

  /**
   * Validates whether the given input is a valid IPv4 address.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.isValidAddress("192.168.1.1");   // true
   * ipv4.isValidAddress("256.0.0.1");     // false (octet out of range)
   * ipv4.isValidAddress(3232235777);      // true
   * ipv4.isValidAddress([192, 168, 1, 1]); // true
   * ipv4.isValidAddress("invalid");       // false
   * ```
   *
   * @param ip - The IPv4 address to validate, which can be in string, number, or octet array format.
   * @returns True if the input is a valid IPv4 address; otherwise, false.
   */
  export function isValidAddress(ip: Ipv4AddressLiteral): boolean {
    if (ip === null || ip === undefined) {
      return false
    }

    let octets: number[] = []

    if (typeof ip === 'string') {
      octets = ip.split('.').map(Number)
    } else if (typeof ip === 'number') {
      if (!Number.isFinite(ip) || ip < MIN_SIZE || ip > MAX_SIZE) {
        return false
      }
      octets = [(ip >> 24) & 0xff, (ip >> 16) & 0xff, (ip >> 8) & 0xff, ip & 0xff]
    } else if (Array.isArray(ip)) {
      for (const element of ip) {
        if (typeof element !== 'number') {
          return false
        }
      }
      octets = ip
    } else {
      return false
    }

    if (octets.length !== 4) {
      return false
    }

    for (const octet of octets) {
      if (typeof octet !== 'number' || !Number.isInteger(octet) || octet < 0 || octet > 255) {
        return false
      }
    }

    return true
  }

  /**
   * Validates whether the given input is a valid IPv4 CIDR.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.isValidCIDR("192.168.0.0/24");                  // true
   * ipv4.isValidCIDR("192.168.0.0/33");                  // false (range out of bounds)
   * ipv4.isValidCIDR({ address: "10.0.0.0", range: 8 }); // true
   * ipv4.isValidCIDR([[172, 16, 0, 0], 12]);             // true
   * ipv4.isValidCIDR("invalid/24");                      // false
   * ```
   *
   * @param cidr - The IPv4 CIDR to validate, which can be in string, object, or tuple format.
   * @returns True if the input is a valid IPv4 CIDR; otherwise, false.
   */
  export function isValidCIDR(cidr: Ipv4CidrLiteral): boolean {
    if (cidr === null || cidr === undefined) {
      return false
    }

    let address: Ipv4AddressLiteral | undefined
    let range: number

    if (typeof cidr === 'string') {
      const parts = cidr.split('/')
      if (parts.length !== 2) {
        return false
      }
      address = parts[0]!
      range = parseInt(parts[1]!, 10)
    } else if (Array.isArray(cidr)) {
      if (cidr.length !== 2) {
        return false
      }
      // Validate array element types at runtime
      const [first, second] = cidr
      if (first === null || first === undefined) {
        return false
      }
      if (typeof second !== 'number') {
        return false
      }
      address = first as Ipv4AddressLiteral
      range = second
    } else if (typeof cidr === 'object') {
      if (!('address' in cidr) || !('range' in cidr)) {
        return false
      }
      const { address: addr, range: r } = cidr as { address: unknown; range: unknown }
      if (addr === null || addr === undefined) {
        return false
      }
      if (typeof r !== 'number') {
        return false
      }
      address = addr as Ipv4AddressLiteral
      range = r
    } else {
      return false
    }

    if (address === undefined || !isValidAddress(address)) {
      return false
    }

    if (
      typeof range !== 'number'
      || !Number.isInteger(range)
      || range < MIN_RANGE
      || range > MAX_RANGE
    ) {
      return false
    }

    return true
  }

  /**
   * Parses the given IPv4 address into its octet representation.
   *
   * @example
   * ```ts
   * import { ipv4 } from 'cidr-block';
   *
   * ipv4.parseOctets("192.168.1.1");   // [192, 168, 1, 1]
   * ipv4.parseOctets(3232235777);      // [192, 168, 1, 1]
   * ipv4.parseOctets([10, 0, 0, 1]);   // [10, 0, 0, 1]
   * ```
   *
   * @param ip - The IPv4 address to parse, which can be in string, number, or octet array format.
   * @returns {Ipv4AddressOctets} An array of four numbers representing the octets of the IPv4 address.
   * @throws {InvalidIpv4AddressError} If the input is not a valid IPv4 address.
   */
  export function parseOctets(ip: Ipv4AddressLiteral): Ipv4AddressOctets {
    if (!isValidAddress(ip)) {
      throw new InvalidIpv4AddressError(ip)
    }
    if (typeof ip === 'string') {
      return ip.split('.').map(Number) as Ipv4AddressOctets
    } else if (typeof ip === 'number') {
      return [
        (ip >> 24) & 0xff,
        (ip >> 16) & 0xff,
        (ip >> 8) & 0xff,
        ip & 0xff,
      ] as Ipv4AddressOctets
    } else {
      return ip as Ipv4AddressOctets
    }
  }
}
