import { Ipv6Address } from './ipv6-address'

/**
 * Type that indicates a literal string or number value that represents an IPv6 address
 */
export type Ipv6Literal = string | bigint

/**
 * Type that indicates either a literal value or an address instance that is an IPv6
 */
export type Ipv6Representable = Ipv6Address | Ipv6Literal
