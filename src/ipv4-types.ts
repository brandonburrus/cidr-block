/**
 * Represents an IPv4 address from a 'literal' value.
 * Examples:
 * - String: "10.0.0.0"
 * - Number: 167772160
 * - Octet Array: [10, 0, 0, 0]
 */
export type Ipv4AddressLiteral = string | number | number[]

/**
 * Represents an IPv4 address in string format (uses stricter typescript type).
 */
export type Ipv4AddressString = `${number}.${number}.${number}.${number}`

/**
 * Represents an IPv4 address as an array of four octets.
 */
export type Ipv4AddressOctets = [number, number, number, number]

/**
 * Represents an IPv4 CIDR from a 'literal' value.
 * Examples:
 * - String: "10.0.0.0/24"
 * - Object: { address: "10.0.0.0", range: 24 }
 * - Tuple: [[10, 0, 0, 0], 24]
 */
export type Ipv4CidrLiteral =
  | string
  | { address: Ipv4AddressLiteral; range: number }
  | [Ipv4AddressLiteral, number]

/**
 * Represents an IPv4 CIDR in string format (uses stricter typescript type).
 */
export type Ipv4CidrString = `${number}.${number}.${number}.${number}/${number}`
