import type { Ipv6AddressLiteral, Ipv6AddressHextets, Ipv6CidrLiteral } from './ipv6-types'
import { Ipv6Address } from './ipv6-address'
import { Ipv6Cidr } from './ipv6-cidr'
import { InvalidIpv6AddressError } from './ipv6-errors'

export * from './ipv6-address'
export * from './ipv6-cidr'
export * from './ipv6-types'
export * from './ipv6-errors'

export namespace ipv6 {
  /**
   * The maximum possible value for an IPv6 address.
   */
  export const MAX_SIZE = (1n << 128n) - 1n

  /**
   * The minimum possible value for an IPv6 address.
   */
  export const MIN_SIZE = 0n

  /**
   * The maximum CIDR range for IPv6 addresses.
   */
  export const MAX_RANGE = 128

  /**
   * The minimum CIDR range for IPv6 addresses.
   */
  export const MIN_RANGE = 0

  /**
   * Creates a new Ipv6Address instance from the given literal.
   * Valid formats include string (with :: compression support), bigint, or hextets array.
   *
   * @example Creating addresses
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
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
   * addr.equals("2001:db8::1");      // true
   * addr.isGreaterThan("2001:db8::"); // true
   * addr.isLessThan("2001:db8::2");    // true
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
   * ipv6.address("::1").isLoopbackAddress();         // true
   * ipv6.address("fc00::1").isUniqueLocalAddress();  // true
   * ipv6.address("fe80::1").isLinkLocalAddress();    // true
   * ipv6.address("ff02::1").isMulticastAddress();    // true
   * ```
   *
   * @param ip - The IPv6 address in string, bigint, or hextets array format.
   * @returns A new Ipv6Address instance.
   * @throws {InvalidIpv6AddressError} If the input is not a valid IPv6 address.
   */
  export function address(ip: Ipv6AddressLiteral): Ipv6Address {
    return new Ipv6Address(ip)
  }

  /**
   * Creates a new Ipv6Cidr instance from the given literal.
   * Valid formats include string, object, or tuple.
   *
   * @example Creating CIDR blocks
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
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
   * cidr.includes(ipv6.address("2001:db8::1")); // true
   * cidr.includes(ipv6.address("2001:db9::1")); // false
   * cidr.overlaps("2001:db8::/48");             // true
   * cidr.overlaps("2001:db9::/32");             // false
   * ```
   *
   * @example Splitting into subranges
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * const cidr = ipv6.cidr("2001:db8::/32");
   *
   * // Split into equal /34 subnets
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
   *
   * @param cidr - The IPv6 CIDR in string, object, or tuple format.
   * @returns A new Ipv6Cidr instance.
   * @throws {InvalidIpv6CidrError} If the input is not a valid IPv6 CIDR.
   */
  export function cidr(cidr: Ipv6CidrLiteral): Ipv6Cidr {
    return new Ipv6Cidr(cidr)
  }

  /**
   * Validates whether the given input is a valid IPv6 address.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.isValidAddress("2001:db8::1");          // true
   * ipv6.isValidAddress("::");                   // true
   * ipv6.isValidAddress("::1");                  // true
   * ipv6.isValidAddress("gggg::1");              // false (invalid hex)
   * ipv6.isValidAddress("2001:db8");             // false (incomplete)
   * ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]); // true
   * ```
   *
   * @param ip - The IPv6 address to validate, which can be in string, bigint, or hextets array format.
   * @returns True if the input is a valid IPv6 address; otherwise, false.
   */
  export function isValidAddress(ip: Ipv6AddressLiteral): boolean {
    if (ip === null || ip === undefined) {
      return false
    }

    if (typeof ip === 'bigint') {
      return ip >= MIN_SIZE && ip <= MAX_SIZE
    }

    if (Array.isArray(ip)) {
      if (ip.length !== 8) {
        return false
      }
      for (const element of ip) {
        if (
          typeof element !== 'number'
          || !Number.isInteger(element)
          || element < 0
          || element > 0xffff
        ) {
          return false
        }
      }
      return true
    }

    if (typeof ip !== 'string') {
      return false
    }

    // Handle IPv4-mapped IPv6 addresses (::ffff:192.168.1.1)
    const ipv4MappedMatch = ip.match(/^(::ffff:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i)
    if (ipv4MappedMatch) {
      const ipv4Part = ipv4MappedMatch[2]!
      const octets = ipv4Part.split('.').map(Number)
      if (octets.length !== 4) return false
      for (const octet of octets) {
        if (octet < 0 || octet > 255) return false
      }
      return true
    }

    // Check for multiple :: which is invalid
    const doubleColonCount = (ip.match(/::/g) || []).length
    if (doubleColonCount > 1) {
      return false
    }

    // Handle :: expansion
    let expandedIp = ip

    if (ip.includes('::')) {
      const parts = ip.split('::')
      const leftParts = parts[0] ? parts[0].split(':') : []
      const rightParts = parts[1] ? parts[1].split(':') : []
      const missingCount = 8 - leftParts.length - rightParts.length

      if (missingCount < 0) {
        return false
      }

      const middleParts = Array(missingCount).fill('0')
      expandedIp = [...leftParts, ...middleParts, ...rightParts].join(':')
    }

    const hextets = expandedIp.split(':')

    if (hextets.length !== 8) {
      return false
    }

    for (const hextet of hextets) {
      if (hextet === '' || hextet.length > 4) {
        return false
      }
      if (!/^[0-9a-fA-F]+$/.test(hextet)) {
        return false
      }
      const value = Number.parseInt(hextet, 16)
      if (value < 0 || value > 0xffff) {
        return false
      }
    }

    return true
  }

  /**
   * Validates whether the given input is a valid IPv6 CIDR.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.isValidCIDR("2001:db8::/32");                   // true
   * ipv6.isValidCIDR("2001:db8::/129");                  // false (range out of bounds)
   * ipv6.isValidCIDR({ address: "2001:db8::", range: 32 }); // true
   * ipv6.isValidCIDR(["2001:db8::", 32]);                // true
   * ipv6.isValidCIDR("invalid/32");                      // false
   * ```
   *
   * @param cidr - The IPv6 CIDR to validate, which can be in string, object, or tuple format.
   * @returns True if the input is a valid IPv6 CIDR; otherwise, false.
   */
  export function isValidCIDR(cidr: Ipv6CidrLiteral): boolean {
    if (cidr === null || cidr === undefined) {
      return false
    }

    let address: Ipv6AddressLiteral | undefined
    let range: number

    if (typeof cidr === 'string') {
      const parts = cidr.split('/')
      if (parts.length !== 2) {
        return false
      }
      address = parts[0]!
      range = Number.parseInt(parts[1]!, 10)
    } else if (Array.isArray(cidr)) {
      if (cidr.length !== 2) {
        return false
      }
      const [first, second] = cidr
      if (first === null || first === undefined) {
        return false
      }
      if (typeof second !== 'number') {
        return false
      }
      address = first as Ipv6AddressLiteral
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
      address = addr as Ipv6AddressLiteral
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
   * Parses the given IPv6 address into its hextets representation.
   *
   * @example
   * ```ts
   * import { ipv6 } from 'cidr-block';
   *
   * ipv6.parseHextets("2001:db8::1");   // [0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]
   * ipv6.parseHextets("::");            // [0, 0, 0, 0, 0, 0, 0, 0]
   * ipv6.parseHextets(42540766411282592856903984951653826561n); // [0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]
   * ```
   *
   * @param ip - The IPv6 address to parse, which can be in string, bigint, or hextets array format.
   * @returns {Ipv6AddressHextets} An array of eight numbers representing the hextets of the IPv6 address.
   * @throws {InvalidIpv6AddressError} If the input is not a valid IPv6 address.
   */
  export function parseHextets(ip: Ipv6AddressLiteral): Ipv6AddressHextets {
    if (!isValidAddress(ip)) {
      throw new InvalidIpv6AddressError(ip)
    }

    if (typeof ip === 'bigint') {
      const hextets: number[] = []
      let value = ip
      for (let i = 0; i < 8; i++) {
        hextets.unshift(Number(value & 0xffffn))
        value = value >> 16n
      }
      return hextets as Ipv6AddressHextets
    }

    if (Array.isArray(ip)) {
      return ip as Ipv6AddressHextets
    }

    // Handle IPv4-mapped IPv6 addresses
    const ipv4MappedMatch = ip.match(/^(::ffff:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i)
    if (ipv4MappedMatch) {
      const ipv4Part = ipv4MappedMatch[2]!
      const octets = ipv4Part.split('.').map(Number)
      return [
        0,
        0,
        0,
        0,
        0,
        0xffff,
        (octets[0]! << 8) | octets[1]!,
        (octets[2]! << 8) | octets[3]!,
      ] as Ipv6AddressHextets
    }

    // Handle :: expansion
    let expandedIp = ip

    if (ip.includes('::')) {
      const parts = ip.split('::')
      const leftParts = parts[0] ? parts[0].split(':') : []
      const rightParts = parts[1] ? parts[1].split(':') : []
      const missingCount = 8 - leftParts.length - rightParts.length
      const middleParts = Array(missingCount).fill('0')
      expandedIp = [...leftParts, ...middleParts, ...rightParts].join(':')
    }

    return expandedIp.split(':').map(h => Number.parseInt(h, 16)) as Ipv6AddressHextets
  }
}
