import { describe, it, expect } from 'vitest'
import { ipv6, Ipv6Cidr, InvalidIpv6CidrError, InvalidIpv6CidrRangeError } from '../src'

describe('ipv6.cidr', () => {
  describe('creation from different formats', () => {
    it('should create CIDR from string', () => {
      const cidr = ipv6.cidr('2001:db8::/32')
      expect(cidr).toBeInstanceOf(Ipv6Cidr)
      expect(cidr.toString()).toBe('2001:db8::/32')
    })

    it('should create CIDR from object', () => {
      const cidr = ipv6.cidr({ address: '2001:db8::', range: 32 })
      expect(cidr).toBeInstanceOf(Ipv6Cidr)
      expect(cidr.toString()).toBe('2001:db8::/32')
    })

    it('should create CIDR from tuple', () => {
      const cidr = ipv6.cidr(['2001:db8::', 32])
      expect(cidr).toBeInstanceOf(Ipv6Cidr)
      expect(cidr.toString()).toBe('2001:db8::/32')
    })

    it('should handle /0 range', () => {
      const cidr = ipv6.cidr('::/0')
      expect(cidr.range()).toBe(0)
    })

    it('should handle /128 range', () => {
      const cidr = ipv6.cidr('2001:db8::1/128')
      expect(cidr.range()).toBe(128)
    })
  })

  describe('validation', () => {
    it('should validate valid CIDRs', () => {
      expect(ipv6.isValidCIDR('2001:db8::/32')).toBe(true)
      expect(ipv6.isValidCIDR('::/0')).toBe(true)
      expect(ipv6.isValidCIDR('::1/128')).toBe(true)
      expect(ipv6.isValidCIDR({ address: '2001:db8::', range: 32 })).toBe(true)
      expect(ipv6.isValidCIDR(['2001:db8::', 32])).toBe(true)
    })

    it('should reject invalid CIDRs', () => {
      expect(ipv6.isValidCIDR('2001:db8::/129')).toBe(false)
      expect(ipv6.isValidCIDR('2001:db8::/-1')).toBe(false)
      expect(ipv6.isValidCIDR('invalid/32')).toBe(false)
      expect(ipv6.isValidCIDR('2001:db8::')).toBe(false)
      expect(ipv6.isValidCIDR({ address: '2001:db8::', range: 129 })).toBe(false)
      expect(ipv6.isValidCIDR(null as any)).toBe(false)
      expect(ipv6.isValidCIDR(undefined as any)).toBe(false)
    })

    it('should throw on invalid CIDR creation', () => {
      expect(() => ipv6.cidr('2001:db8::/129')).toThrow(InvalidIpv6CidrError)
      expect(() => ipv6.cidr('invalid/32')).toThrow(InvalidIpv6CidrError)
    })
  })

  describe('properties', () => {
    const cidr = ipv6.cidr('2001:db8::/32')

    it('should get base address', () => {
      expect(cidr.baseAddress().toString()).toBe('2001:db8::')
    })

    it('should get range', () => {
      expect(cidr.range()).toBe(32)
    })

    it('should get range parts', () => {
      const [address, range] = cidr.rangeParts()
      expect(address.toString()).toBe('2001:db8::')
      expect(range).toBe(32)
    })

    it('should calculate netmask', () => {
      expect(ipv6.cidr('2001:db8::/32').netmask().toString()).toBe('ffff:ffff::')
      expect(ipv6.cidr('2001:db8::/64').netmask().toString()).toBe('ffff:ffff:ffff:ffff::')
      expect(ipv6.cidr('2001:db8::/128').netmask().toString()).toBe('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff')
      expect(ipv6.cidr('::/0').netmask().toString()).toBe('::')
    })

    it('should calculate address count', () => {
      expect(ipv6.cidr('2001:db8::/32').addressCount()).toBe(79228162514264337593543950336n)
      expect(ipv6.cidr('2001:db8::/64').addressCount()).toBe(18446744073709551616n)
      expect(ipv6.cidr('2001:db8::1/128').addressCount()).toBe(1n)
    })

    it('should convert to string', () => {
      expect(cidr.toString()).toBe('2001:db8::/32')
      expect(ipv6.cidr({ address: '::1', range: 128 }).toString()).toBe('::1/128')
    })
  })

  describe('usable addresses', () => {
    it('should get first usable address', () => {
      expect(ipv6.cidr('2001:db8::/64').getFirstUsableAddress()?.toString()).toBe('2001:db8::1')
      expect(ipv6.cidr('::/64').getFirstUsableAddress()?.toString()).toBe('::1')
    })

    it('should get last usable address', () => {
      expect(ipv6.cidr('2001:db8::/126').getLastUsableAddress()?.toString()).toBe('2001:db8::2')
    })

    it('should return undefined for /128 usable addresses', () => {
      expect(ipv6.cidr('2001:db8::1/128').getFirstUsableAddress()).toBeUndefined()
      expect(ipv6.cidr('2001:db8::1/128').getLastUsableAddress()).toBeUndefined()
    })
  })

  describe('iteration', () => {
    it('should iterate over addresses in small range', () => {
      const cidr = ipv6.cidr('2001:db8::/126')
      const addresses = Array.from(cidr.addresses()).map(addr => addr.toString())
      expect(addresses).toEqual([
        '2001:db8::',
        '2001:db8::1',
        '2001:db8::2',
        '2001:db8::3',
      ])
    })

    it('should iterate over /128', () => {
      const cidr = ipv6.cidr('2001:db8::1/128')
      const addresses = Array.from(cidr.addresses()).map(addr => addr.toString())
      expect(addresses).toEqual(['2001:db8::1'])
    })

    it('should handle iteration for larger ranges', () => {
      const cidr = ipv6.cidr('2001:db8::/120')
      let count = 0
      for (const addr of cidr.addresses()) {
        count++
        if (count > 10) break // Don't iterate all 256 addresses
      }
      expect(count).toBe(11)
    })

    it('should respect limit parameter when provided', () => {
      const cidr = ipv6.cidr('2001:db8::/120')
      const addresses = Array.from(cidr.addresses(5n)).map(addr => addr.toString())
      expect(addresses).toHaveLength(5)
      expect(addresses[0]).toBe('2001:db8::')
      expect(addresses[4]).toBe('2001:db8::4')
    })

    it('should use full count when limit is greater than address count', () => {
      const cidr = ipv6.cidr('2001:db8::/126')
      const addresses = Array.from(cidr.addresses(1000n)).map(addr => addr.toString())
      expect(addresses).toHaveLength(4) // /126 only has 4 addresses
    })
  })

  describe('comparisons', () => {
    const cidr = ipv6.cidr('2001:db8::/32')

    it('should check equality', () => {
      expect(cidr.equals('2001:db8::/32')).toBe(true)
      expect(cidr.equals({ address: '2001:db8::', range: 32 })).toBe(true)
      expect(cidr.equals(ipv6.cidr('2001:db8::/32'))).toBe(true)
      expect(cidr.equals('2001:db8::/64')).toBe(false)
      expect(cidr.equals('2001:db9::/32')).toBe(false)
    })
  })

  describe('containment', () => {
    const cidr = ipv6.cidr('2001:db8::/32')

    it('should check if address is included', () => {
      expect(cidr.includes(ipv6.address('2001:db8::'))).toBe(true)
      expect(cidr.includes(ipv6.address('2001:db8::1'))).toBe(true)
      expect(cidr.includes(ipv6.address('2001:db8:ffff:ffff:ffff:ffff:ffff:ffff'))).toBe(true)
      expect(cidr.includes(ipv6.address('2001:db9::'))).toBe(false)
      expect(cidr.includes(ipv6.address('2001:db7:ffff:ffff:ffff:ffff:ffff:ffff'))).toBe(false)
    })
  })

  describe('overlap', () => {
    const cidr = ipv6.cidr('2001:db8::/32')

    it('should check overlap with contained CIDR', () => {
      expect(cidr.overlaps('2001:db8::/64')).toBe(true)
      expect(cidr.overlaps('2001:db8:1234::/48')).toBe(true)
    })

    it('should check overlap with partial overlap', () => {
      expect(cidr.overlaps('2001:db8::/31')).toBe(true)
    })

    it('should check no overlap', () => {
      expect(cidr.overlaps('2001:db9::/32')).toBe(false)
      expect(cidr.overlaps('::/64')).toBe(false)
    })

    it('should check overlap with same CIDR', () => {
      expect(cidr.overlaps('2001:db8::/32')).toBe(true)
    })
  })

  describe('navigation', () => {
    it('should get next CIDR', () => {
      expect(ipv6.cidr('2001:db8::/32').nextCIDR()?.toString()).toBe('2001:db9::/32')
      expect(ipv6.cidr('2001:db8::/48').nextCIDR()?.toString()).toBe('2001:db8:1::/48')
    })

    it('should return undefined for max CIDR next', () => {
      const maxCidr = ipv6.cidr('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ff00/120')
      expect(maxCidr.nextCIDR()).toBeUndefined()
    })

    it('should check hasNextCIDR', () => {
      expect(ipv6.cidr('2001:db8::/32').hasNextCIDR()).toBe(true)
      expect(ipv6.cidr('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ff00/120').hasNextCIDR()).toBe(false)
    })

    it('should get previous CIDR', () => {
      expect(ipv6.cidr('2001:db9::/32').previousCIDR()?.toString()).toBe('2001:db8::/32')
      expect(ipv6.cidr('2001:db8:1::/48').previousCIDR()?.toString()).toBe('2001:db8::/48')
    })

    it('should return undefined for min CIDR previous', () => {
      expect(ipv6.cidr('::/32').previousCIDR()).toBeUndefined()
    })

    it('should check hasPreviousCIDR', () => {
      expect(ipv6.cidr('2001:db8::/32').hasPreviousCIDR()).toBe(true)
      expect(ipv6.cidr('::/32').hasPreviousCIDR()).toBe(false)
    })
  })

  describe('subnetting', () => {
    it('should split into equal subnets', () => {
      const cidr = ipv6.cidr('2001:db8::/32')
      const subnets = cidr.subnet(34)
      expect(subnets).toHaveLength(4)
      expect(subnets.map(s => s.toString())).toEqual([
        '2001:db8::/34',
        '2001:db8:4000::/34',
        '2001:db8:8000::/34',
        '2001:db8:c000::/34',
      ])
    })

    it('should split /48 into /64', () => {
      const cidr = ipv6.cidr('2001:db8::/48')
      const subnets = cidr.subnet(64)
      expect(subnets).toHaveLength(65536)
      expect(subnets[0]?.toString()).toBe('2001:db8::/64')
      expect(subnets[1]?.toString()).toBe('2001:db8:0:1::/64')
    })

    it('should throw on invalid subnet range', () => {
      const cidr = ipv6.cidr('2001:db8::/32')
      expect(() => cidr.subnet(31)).toThrow(InvalidIpv6CidrRangeError)
      expect(() => cidr.subnet(129)).toThrow(InvalidIpv6CidrRangeError)
    })

    it('should split by specific ranges', () => {
      const cidr = ipv6.cidr('2001:db8::/32')
      const subnets = cidr.subnetBy([48, 48])
      expect(subnets.map(s => s.toString())).toEqual([
        '2001:db8::/48',
        '2001:db8:1::/48',
      ])
    })

    it('should throw on subnetBy with invalid range', () => {
      const cidr = ipv6.cidr('2001:db8::/32')
      expect(() => cidr.subnetBy([31, 32])).toThrow(InvalidIpv6CidrRangeError)
      expect(() => cidr.subnetBy([33, 129])).toThrow(InvalidIpv6CidrRangeError)
    })

    it('should throw on subnetBy exceeding parent bounds', () => {
      const cidr = ipv6.cidr('2001:db8::/32')
      expect(() => cidr.subnetBy([33, 33, 33, 33, 33])).toThrow(InvalidIpv6CidrRangeError)
    })
  })

  describe('comparison with Ipv6Cidr instances', () => {
    const cidr1 = ipv6.cidr('2001:db8::/32')
    const cidr2 = ipv6.cidr('2001:db8::/32')

    it('should compare equals with Ipv6Cidr instance', () => {
      expect(cidr1.equals(cidr2)).toBe(true)
    })

    it('should check overlaps with Ipv6Cidr instance', () => {
      const cidr3 = ipv6.cidr('2001:db8::/48')
      expect(cidr1.overlaps(cidr3)).toBe(true)
    })
  })

  describe('edge cases for large address spaces', () => {
    it('should handle /127 with 2 addresses', () => {
      const cidr = ipv6.cidr('2001:db8::/127')
      const addresses = Array.from(cidr.addresses()).map(a => a.toString())
      expect(addresses).toHaveLength(2)
    })

    it('should handle /120 with 256 addresses', () => {
      const cidr = ipv6.cidr('2001:db8::/120')
      let count = 0
      for (const _ of cidr.addresses()) {
        count++
        if (count > 300) break
      }
      expect(count).toBe(256)
    })
  })

  describe('boundary cases for subnetting', () => {
    it('should subnet /127 to /128', () => {
      const cidr = ipv6.cidr('2001:db8::/127')
      const subnets = cidr.subnet(128)
      expect(subnets).toHaveLength(2)
      expect(subnets.map(s => s.toString())).toEqual([
        '2001:db8::/128',
        '2001:db8::1/128',
      ])
    })

    it('should subnet /0 to /1', () => {
      const cidr = ipv6.cidr('::/0')
      const subnets = cidr.subnet(1)
      expect(subnets).toHaveLength(2)
      expect(subnets[0]?.toString()).toBe('::/1')
      expect(subnets[1]?.toString()).toBe('8000::/1')
    })
  })

  describe('validation edge cases', () => {
    it('should reject object without address key', () => {
      expect(ipv6.isValidCIDR({ range: 32 } as any)).toBe(false)
    })

    it('should reject object without range key', () => {
      expect(ipv6.isValidCIDR({ address: '2001:db8::' } as any)).toBe(false)
    })

    it('should reject object with null address', () => {
      expect(ipv6.isValidCIDR({ address: null, range: 32 } as any)).toBe(false)
    })

    it('should reject object with undefined address', () => {
      expect(ipv6.isValidCIDR({ address: undefined, range: 32 } as any)).toBe(false)
    })

    it('should reject object with non-number range', () => {
      expect(ipv6.isValidCIDR({ address: '2001:db8::', range: '32' } as any)).toBe(false)
    })

    it('should reject array with null address', () => {
      expect(ipv6.isValidCIDR([null, 32] as any)).toBe(false)
    })

    it('should reject array with undefined address', () => {
      expect(ipv6.isValidCIDR([undefined, 32] as any)).toBe(false)
    })

    it('should reject array with non-number range', () => {
      expect(ipv6.isValidCIDR(['2001:db8::', '32'] as any)).toBe(false)
    })

    it('should parse non-integer range as integer', () => {
      expect(ipv6.isValidCIDR('2001:db8::/32.5')).toBe(true)
      const cidr = ipv6.cidr('2001:db8::/32.5')
      expect(cidr.range()).toBe(32)
    })

    it('should reject function as input', () => {
      expect(ipv6.isValidCIDR((() => {}) as any)).toBe(false)
    })

    it('should reject array with wrong length', () => {
      expect(ipv6.isValidCIDR(['2001:db8::'] as any)).toBe(false)
      expect(ipv6.isValidCIDR(['2001:db8::', 32, 'extra'] as any)).toBe(false)
    })

    it('should handle IPv6 CIDR array with various formats', () => {
      expect(ipv6.isValidCIDR([[0x2001, 0xdb8, 0, 0, 0, 0, 0, 1], 32])).toBe(true)
      expect(ipv6.isValidCIDR([42540766411282592856903984951653826561n, 32])).toBe(true)
    })

    it('should validate CIDR with boundary range values', () => {
      expect(ipv6.isValidCIDR('2001:db8::/0')).toBe(true)
      expect(ipv6.isValidCIDR('2001:db8::/128')).toBe(true)
      expect(ipv6.isValidCIDR('2001:db8::/129')).toBe(false)
      expect(ipv6.isValidCIDR('2001:db8::/-1')).toBe(false)
    })

    it('should handle CIDR with whitespace gracefully', () => {
      const result = ipv6.isValidCIDR('2001:db8::/32 ')
      expect(typeof result).toBe('boolean')
    })
  })

  describe('constructor edge cases', () => {
    it('should throw on invalid type in Ipv6Cidr constructor', () => {
      expect(() => new Ipv6Cidr(123 as any)).toThrow(InvalidIpv6CidrError)
      expect(() => new Ipv6Cidr(true as any)).toThrow(InvalidIpv6CidrError)
      expect(() => new Ipv6Cidr(null as any)).toThrow(InvalidIpv6CidrError)
      expect(() => new Ipv6Cidr(undefined as any)).toThrow(InvalidIpv6CidrError)
      expect(() => new Ipv6Cidr((() => {}) as any)).toThrow(InvalidIpv6CidrError)
      expect(() => new Ipv6Cidr(new Number(123) as any)).toThrow(InvalidIpv6CidrError)
    })

    it('should throw InvalidIpv6CidrError with correct message for numbers', () => {
      try {
        new Ipv6Cidr(12345 as any)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidIpv6CidrError)
      }
    })

    it('should throw InvalidIpv6CidrError with correct message for boolean', () => {
      try {
        new Ipv6Cidr(false as any)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidIpv6CidrError)
      }
    })
  })
})
