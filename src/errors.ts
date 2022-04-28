export class InvalidIpAddressError extends Error {
  constructor(badIp: string) {
    super(`${badIp} is not a valid IPv4 address.`)
  }
}

export class InvalidCidrBlockError extends Error {
  constructor(badCidr: string) {
    super(`${badCidr} is not a valid IPv4 cidr block.`)
  }
}
