export class InvalidIpv4AddressError extends Error {
  override name = 'InvalidIpv4AddressError'

  constructor(invalidAddress: unknown) {
    super(`${invalidAddress} is not a valid IPv4 address`)
  }
}

export class InvalidIpv4CidrError extends Error {
  override name = 'InvalidIpv4CidrError'

  constructor(invalidCidr: unknown) {
    super(`${invalidCidr} is not a valid IPv4 CIDR range`)
  }
}

export class InvalidIpv4CidrRangeError extends Error {
  override name = 'InvalidIpv4RangeError'
}
