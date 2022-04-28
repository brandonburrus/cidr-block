import { Ipv4Address } from './ipv4-address'

/**
 * Type that indicates a literal string or number value that represents an IPv4 address
 */
export type Ipv4Literal = string | number

/**
 * Type that indicates either a literal value or an address instance that is an IPv4
 */
export type Ipv4Representable = Ipv4Address | Ipv4Literal
