export class InvalidIpAddressError extends Error {
  constructor(badIp: string) {
    super(`${badIp} is not a valid IP address.`)
  }
}

export class InvalidCidrError extends Error {
  constructor(badCidr: string) {
    super(`${badCidr} is not a valid cidr block or range.`)
  }
}
