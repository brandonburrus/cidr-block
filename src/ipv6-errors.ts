export class InvalidIpv6AddressError extends Error {
  override name = 'InvalidIpv6AddressError'

  constructor(invalidAddress: unknown) {
    super(`${invalidAddress} is not a valid IPv6 address`)
  }
}

export class InvalidIpv6CidrError extends Error {
  override name = 'InvalidIpv6CidrError'

  constructor(invalidCidr: unknown) {
    super(`${invalidCidr} is not a valid IPv6 CIDR range`)
  }
}

export class InvalidIpv6CidrRangeError extends Error {
  override name = 'InvalidIpv6RangeError'
}
