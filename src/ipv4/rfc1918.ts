import { Ipv4Address } from './ipv4-address'
import { cidr } from './ipv4-cidr'

const RFC_1918_CIDRS = [cidr('10.0.0.0/8'), cidr('172.16.0.0/12'), cidr('192.168.0.0/16')]

/**
 * Predicate function that will return true if the given
 * address is in the private RFC 1918 ipv4 address space.
 *
 * See more {@link https://datatracker.ietf.org/doc/html/rfc1918}
 */
export function isPrivateRFC1918(address: Ipv4Address): boolean {
  for (const rfcCidr of RFC_1918_CIDRS) {
    if (rfcCidr.includes(address)) {
      return true
    }
  }
  return false
}
