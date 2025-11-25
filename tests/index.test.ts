import { describe, it, expect } from 'vitest'
import {
  ipv4,
  ipv6,
  Ipv4Address,
  Ipv4Cidr,
  Ipv6Address,
  Ipv6Cidr,
  InvalidIpv4AddressError,
  InvalidIpv4CidrError,
  InvalidIpv4CidrRangeError,
  InvalidIpv6AddressError,
  InvalidIpv6CidrError,
  InvalidIpv6CidrRangeError,
} from '../src'

describe('index exports', () => {
  it('should export ipv4 namespace', () => {
    expect(ipv4).toBeDefined()
    expect(typeof ipv4.address).toBe('function')
    expect(typeof ipv4.cidr).toBe('function')
    expect(typeof ipv4.isValidAddress).toBe('function')
    expect(typeof ipv4.isValidCIDR).toBe('function')
  })

  it('should export ipv6 namespace', () => {
    expect(ipv6).toBeDefined()
    expect(typeof ipv6.address).toBe('function')
    expect(typeof ipv6.cidr).toBe('function')
    expect(typeof ipv6.isValidAddress).toBe('function')
    expect(typeof ipv6.isValidCIDR).toBe('function')
  })

  it('should export Ipv4Address class', () => {
    expect(Ipv4Address).toBeDefined()
    const addr = new Ipv4Address('192.168.1.1')
    expect(addr).toBeInstanceOf(Ipv4Address)
  })

  it('should export Ipv4Cidr class', () => {
    expect(Ipv4Cidr).toBeDefined()
    const cidr = new Ipv4Cidr('192.168.0.0/24')
    expect(cidr).toBeInstanceOf(Ipv4Cidr)
  })

  it('should export Ipv6Address class', () => {
    expect(Ipv6Address).toBeDefined()
    const addr = new Ipv6Address('2001:db8::1')
    expect(addr).toBeInstanceOf(Ipv6Address)
  })

  it('should export Ipv6Cidr class', () => {
    expect(Ipv6Cidr).toBeDefined()
    const cidr = new Ipv6Cidr('2001:db8::/32')
    expect(cidr).toBeInstanceOf(Ipv6Cidr)
  })

  it('should export IPv4 error classes', () => {
    expect(InvalidIpv4AddressError).toBeDefined()
    expect(InvalidIpv4CidrError).toBeDefined()
    expect(InvalidIpv4CidrRangeError).toBeDefined()

    const addrError = new InvalidIpv4AddressError('invalid')
    expect(addrError).toBeInstanceOf(InvalidIpv4AddressError)
    expect(addrError).toBeInstanceOf(Error)

    const cidrError = new InvalidIpv4CidrError('invalid')
    expect(cidrError).toBeInstanceOf(InvalidIpv4CidrError)
    expect(cidrError).toBeInstanceOf(Error)

    const rangeError = new InvalidIpv4CidrRangeError(33)
    expect(rangeError).toBeInstanceOf(InvalidIpv4CidrRangeError)
    expect(rangeError).toBeInstanceOf(Error)
  })

  it('should export IPv6 error classes', () => {
    expect(InvalidIpv6AddressError).toBeDefined()
    expect(InvalidIpv6CidrError).toBeDefined()
    expect(InvalidIpv6CidrRangeError).toBeDefined()

    const addrError = new InvalidIpv6AddressError('invalid')
    expect(addrError).toBeInstanceOf(InvalidIpv6AddressError)
    expect(addrError).toBeInstanceOf(Error)

    const cidrError = new InvalidIpv6CidrError('invalid')
    expect(cidrError).toBeInstanceOf(InvalidIpv6CidrError)
    expect(cidrError).toBeInstanceOf(Error)

    const rangeError = new InvalidIpv6CidrRangeError(129)
    expect(rangeError).toBeInstanceOf(InvalidIpv6CidrRangeError)
    expect(rangeError).toBeInstanceOf(Error)
  })

  it('should be able to use exported classes together', () => {
    const ipv4Addr = ipv4.address('10.0.0.1')
    const ipv4CIDR = ipv4.cidr('10.0.0.0/24')
    expect(ipv4CIDR.includes(ipv4Addr)).toBe(true)

    const ipv6Addr = ipv6.address('2001:db8::1')
    const ipv6CIDR = ipv6.cidr('2001:db8::/32')
    expect(ipv6CIDR.includes(ipv6Addr)).toBe(true)
  })
})
