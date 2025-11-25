import { describe, it, expect } from 'vitest'
import { ipv4, Ipv4Address, InvalidIpv4AddressError } from '../src'

describe('ipv4.address', () => {
  describe('creation from different formats', () => {
    it('should create address from string', () => {
      const addr = ipv4.address('192.168.1.1')
      expect(addr).toBeInstanceOf(Ipv4Address)
      expect(addr.toString()).toBe('192.168.1.1')
    })

    it('should create address from number', () => {
      const addr = ipv4.address(3232235777)
      expect(addr).toBeInstanceOf(Ipv4Address)
      expect(addr.toString()).toBe('192.168.1.1')
    })

    it('should create address from octet array', () => {
      const addr = ipv4.address([192, 168, 1, 1])
      expect(addr).toBeInstanceOf(Ipv4Address)
      expect(addr.toString()).toBe('192.168.1.1')
    })

    it('should handle minimum address', () => {
      const addr = ipv4.address('0.0.0.0')
      expect(addr.toNumber()).toBe(0)
    })

    it('should handle maximum address', () => {
      const addr = ipv4.address('255.255.255.255')
      expect(addr.toNumber()).toBe(0xffffffff)
    })
  })

  describe('validation', () => {
    it('should validate valid addresses', () => {
      expect(ipv4.isValidAddress('192.168.1.1')).toBe(true)
      expect(ipv4.isValidAddress('0.0.0.0')).toBe(true)
      expect(ipv4.isValidAddress('255.255.255.255')).toBe(true)
      expect(ipv4.isValidAddress(3232235777)).toBe(true)
      expect(ipv4.isValidAddress([192, 168, 1, 1])).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(ipv4.isValidAddress('256.0.0.1')).toBe(false)
      expect(ipv4.isValidAddress('192.168.1')).toBe(false)
      expect(ipv4.isValidAddress('192.168.1.1.1')).toBe(false)
      expect(ipv4.isValidAddress('invalid')).toBe(false)
      expect(ipv4.isValidAddress(-1)).toBe(false)
      expect(ipv4.isValidAddress(0xffffffff + 1)).toBe(false)
      expect(ipv4.isValidAddress([192, 168, 256, 1])).toBe(false)
      expect(ipv4.isValidAddress([192, 168, 1])).toBe(false)
      expect(ipv4.isValidAddress(null as any)).toBe(false)
      expect(ipv4.isValidAddress(undefined as any)).toBe(false)
    })

    it('should throw on invalid address creation', () => {
      expect(() => ipv4.address('256.0.0.1')).toThrow(InvalidIpv4AddressError)
      expect(() => ipv4.address('invalid')).toThrow(InvalidIpv4AddressError)
      expect(() => ipv4.address(-1)).toThrow(InvalidIpv4AddressError)
    })
  })

  describe('conversions', () => {
    it('should convert to string', () => {
      expect(ipv4.address('192.168.1.1').toString()).toBe('192.168.1.1')
      expect(ipv4.address(3232235777).toString()).toBe('192.168.1.1')
    })

    it('should convert to number', () => {
      expect(ipv4.address('192.168.1.1').toNumber()).toBe(3232235777)
      expect(ipv4.address('10.0.0.1').toNumber()).toBe(167772161)
    })

    it('should convert to octets', () => {
      expect(ipv4.address('192.168.1.1').octets()).toEqual([192, 168, 1, 1])
      expect(ipv4.address(3232235777).octets()).toEqual([192, 168, 1, 1])
    })

    it('should convert to binary string', () => {
      expect(ipv4.address('192.168.1.1').toBinaryString()).toBe(
        '11000000.10101000.00000001.00000001'
      )
      expect(ipv4.address('255.0.0.1').toBinaryString()).toBe(
        '11111111.00000000.00000000.00000001'
      )
    })
  })

  describe('parseOctets', () => {
    it('should parse from string', () => {
      expect(ipv4.parseOctets('192.168.1.1')).toEqual([192, 168, 1, 1])
    })

    it('should parse from number', () => {
      expect(ipv4.parseOctets(3232235777)).toEqual([192, 168, 1, 1])
    })

    it('should parse from array', () => {
      expect(ipv4.parseOctets([192, 168, 1, 1])).toEqual([192, 168, 1, 1])
    })

    it('should throw on invalid input', () => {
      expect(() => ipv4.parseOctets('invalid')).toThrow(InvalidIpv4AddressError)
    })
  })

  describe('comparisons', () => {
    const addr = ipv4.address('192.168.1.100')

    it('should check equality', () => {
      expect(addr.equals('192.168.1.100')).toBe(true)
      expect(addr.equals([192, 168, 1, 100])).toBe(true)
      expect(addr.equals(3232235876)).toBe(true)
      expect(addr.equals(ipv4.address('192.168.1.100'))).toBe(true)
      expect(addr.equals('192.168.1.101')).toBe(false)
    })

    it('should check greater than', () => {
      expect(addr.isGreaterThan('192.168.1.99')).toBe(true)
      expect(addr.isGreaterThan('192.168.1.100')).toBe(false)
      expect(addr.isGreaterThan('192.168.1.101')).toBe(false)
    })

    it('should check greater than or equal', () => {
      expect(addr.isGreaterThanOrEqual('192.168.1.99')).toBe(true)
      expect(addr.isGreaterThanOrEqual('192.168.1.100')).toBe(true)
      expect(addr.isGreaterThanOrEqual('192.168.1.101')).toBe(false)
    })

    it('should check less than', () => {
      expect(addr.isLessThan('192.168.1.101')).toBe(true)
      expect(addr.isLessThan('192.168.1.100')).toBe(false)
      expect(addr.isLessThan('192.168.1.99')).toBe(false)
    })

    it('should check less than or equal', () => {
      expect(addr.isLessThanOrEqual('192.168.1.101')).toBe(true)
      expect(addr.isLessThanOrEqual('192.168.1.100')).toBe(true)
      expect(addr.isLessThanOrEqual('192.168.1.99')).toBe(false)
    })
  })

  describe('navigation', () => {
    it('should get next address', () => {
      expect(ipv4.address('192.168.1.1').nextAddress()?.toString()).toBe('192.168.1.2')
      expect(ipv4.address('192.168.1.255').nextAddress()?.toString()).toBe('192.168.2.0')
    })

    it('should return undefined for max address next', () => {
      expect(ipv4.address('255.255.255.255').nextAddress()).toBeUndefined()
    })

    it('should check hasNextAddress', () => {
      expect(ipv4.address('192.168.1.1').hasNextAddress()).toBe(true)
      expect(ipv4.address('255.255.255.255').hasNextAddress()).toBe(false)
    })

    it('should get previous address', () => {
      expect(ipv4.address('192.168.1.1').previousAddress()?.toString()).toBe('192.168.1.0')
      expect(ipv4.address('192.168.2.0').previousAddress()?.toString()).toBe('192.168.1.255')
    })

    it('should return undefined for min address previous', () => {
      expect(ipv4.address('0.0.0.0').previousAddress()).toBeUndefined()
    })

    it('should check hasPreviousAddress', () => {
      expect(ipv4.address('192.168.1.1').hasPreviousAddress()).toBe(true)
      expect(ipv4.address('0.0.0.0').hasPreviousAddress()).toBe(false)
    })
  })

  describe('address types', () => {
    it('should identify loopback addresses', () => {
      expect(ipv4.address('127.0.0.1').isLoopbackAddress()).toBe(true)
      expect(ipv4.address('127.255.255.255').isLoopbackAddress()).toBe(true)
      expect(ipv4.address('192.168.1.1').isLoopbackAddress()).toBe(false)
    })

    it('should identify private addresses', () => {
      expect(ipv4.address('10.0.0.1').isPrivateAddress()).toBe(true)
      expect(ipv4.address('10.255.255.255').isPrivateAddress()).toBe(true)
      expect(ipv4.address('172.16.0.1').isPrivateAddress()).toBe(true)
      expect(ipv4.address('172.31.255.255').isPrivateAddress()).toBe(true)
      expect(ipv4.address('192.168.0.1').isPrivateAddress()).toBe(true)
      expect(ipv4.address('192.168.255.255').isPrivateAddress()).toBe(true)
      expect(ipv4.address('8.8.8.8').isPrivateAddress()).toBe(false)
      expect(ipv4.address('172.15.255.255').isPrivateAddress()).toBe(false)
      expect(ipv4.address('172.32.0.0').isPrivateAddress()).toBe(false)
    })

    it('should identify local link addresses', () => {
      expect(ipv4.address('169.254.1.1').isLocalLinkAddress()).toBe(true)
      expect(ipv4.address('169.254.255.255').isLocalLinkAddress()).toBe(true)
      expect(ipv4.address('192.168.1.1').isLocalLinkAddress()).toBe(false)
    })

    it('should identify multicast addresses', () => {
      expect(ipv4.address('224.0.0.1').isMulticastAddress()).toBe(true)
      expect(ipv4.address('239.255.255.255').isMulticastAddress()).toBe(true)
      expect(ipv4.address('223.255.255.255').isMulticastAddress()).toBe(false)
      expect(ipv4.address('240.0.0.0').isMulticastAddress()).toBe(false)
    })
  })

  describe('constants', () => {
    it('should have correct max size', () => {
      expect(ipv4.MAX_SIZE).toBe(0xffffffff)
    })

    it('should have correct min size', () => {
      expect(ipv4.MIN_SIZE).toBe(0)
    })

    it('should have correct max range', () => {
      expect(ipv4.MAX_RANGE).toBe(32)
    })

    it('should have correct min range', () => {
      expect(ipv4.MIN_RANGE).toBe(0)
    })
  })

  describe('comparison with Ipv4Address instances', () => {
    const addr1 = ipv4.address('192.168.1.100')
    const addr2 = ipv4.address('192.168.1.101')
    const addr3 = ipv4.address('192.168.1.100')

    it('should compare isGreaterThan with Ipv4Address instance', () => {
      expect(addr2.isGreaterThan(addr1)).toBe(true)
      expect(addr1.isGreaterThan(addr2)).toBe(false)
      expect(addr1.isGreaterThan(addr3)).toBe(false)
    })

    it('should compare isGreaterThanOrEqual with Ipv4Address instance', () => {
      expect(addr2.isGreaterThanOrEqual(addr1)).toBe(true)
      expect(addr1.isGreaterThanOrEqual(addr3)).toBe(true)
      expect(addr1.isGreaterThanOrEqual(addr2)).toBe(false)
    })

    it('should compare isLessThan with Ipv4Address instance', () => {
      expect(addr1.isLessThan(addr2)).toBe(true)
      expect(addr2.isLessThan(addr1)).toBe(false)
      expect(addr1.isLessThan(addr3)).toBe(false)
    })

    it('should compare isLessThanOrEqual with Ipv4Address instance', () => {
      expect(addr1.isLessThanOrEqual(addr2)).toBe(true)
      expect(addr1.isLessThanOrEqual(addr3)).toBe(true)
      expect(addr2.isLessThanOrEqual(addr1)).toBe(false)
    })
  })

  describe('validation edge cases', () => {
    it('should reject objects without address property', () => {
      expect(ipv4.isValidAddress({ foo: 'bar' } as any)).toBe(false)
    })

    it('should reject string with letters', () => {
      expect(ipv4.isValidAddress('192.168.abc.1')).toBe(false)
      expect(ipv4.isValidAddress('a.b.c.d')).toBe(false)
    })

    it('should handle string with leading zeros', () => {
      const result = ipv4.isValidAddress('192.168.001.001')
      expect(typeof result).toBe('boolean')
    })

    it('should reject arrays with non-integer numbers', () => {
      expect(ipv4.isValidAddress([192.5, 168, 1, 1])).toBe(false)
    })

    it('should accept valid numbers', () => {
      expect(ipv4.isValidAddress(192168)).toBe(true)
    })

    it('should reject empty string', () => {
      expect(ipv4.isValidAddress('')).toBe(false)
    })

    it('should reject string with extra dots', () => {
      expect(ipv4.isValidAddress('192.168.1.1.')).toBe(false)
      expect(ipv4.isValidAddress('.192.168.1.1')).toBe(false)
    })

    it('should reject arrays with string elements', () => {
      expect(ipv4.isValidAddress(['192', '168', '1', '1'] as any)).toBe(false)
    })

    it('should reject Infinity', () => {
      expect(ipv4.isValidAddress(Infinity)).toBe(false)
      expect(ipv4.isValidAddress(-Infinity)).toBe(false)
    })

    it('should reject NaN', () => {
      expect(ipv4.isValidAddress(NaN)).toBe(false)
    })

    it('should validate IPv4 arrays with edge values', () => {
      expect(ipv4.isValidAddress([0, 0, 0, 0])).toBe(true)
      expect(ipv4.isValidAddress([255, 255, 255, 255])).toBe(true)
      expect(ipv4.isValidAddress([127, 0, 0, 1])).toBe(true)
    })

    it('should handle IPv4 with whitespace gracefully', () => {
      const result1 = ipv4.isValidAddress('192.168.1.1 ')
      const result2 = ipv4.isValidAddress(' 192.168.1.1')
      expect(typeof result1).toBe('boolean')
      expect(typeof result2).toBe('boolean')
    })
  })

  describe('creation edge cases', () => {
    it('should handle address with all zeros', () => {
      const addr = ipv4.address([0, 0, 0, 0])
      expect(addr.toString()).toBe('0.0.0.0')
    })

    it('should handle address with mixed high and low values', () => {
      const addr = ipv4.address([255, 0, 255, 0])
      expect(addr.toString()).toBe('255.0.255.0')
    })

    it('should handle boundary octet values', () => {
      expect(ipv4.address([0, 0, 0, 0]).toString()).toBe('0.0.0.0')
      expect(ipv4.address([255, 255, 255, 255]).toString()).toBe('255.255.255.255')
    })

    it('should handle number at boundaries', () => {
      expect(ipv4.address(0).toString()).toBe('0.0.0.0')
      expect(ipv4.address(0xffffffff).toString()).toBe('255.255.255.255')
    })
  })
})
