/**
 * Represents an IPv6 address from a 'literal' value.
 * Examples:
 * - String: "2001:db8::1"
 * - BigInt: 42540766411282592856903984951653826561n
 * - Hextets Array: [0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]
 */
export type Ipv6AddressLiteral = string | bigint | number[]

/**
 * Represents an IPv6 address as an array of eight 16-bit hextets.
 */
export type Ipv6AddressHextets = [number, number, number, number, number, number, number, number]

/**
 * Represents an IPv6 CIDR from a 'literal' value.
 * Examples:
 * - String: "2001:db8::/32"
 * - Object: { address: "2001:db8::", range: 32 }
 * - Tuple: ["2001:db8::", 32]
 */
export type Ipv6CidrLiteral =
  | string
  | { address: Ipv6AddressLiteral; range: number }
  | [Ipv6AddressLiteral, number]
