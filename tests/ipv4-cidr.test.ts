import { describe, it, expect } from 'vitest'
import { ipv4, Ipv4Cidr, InvalidIpv4CidrError, InvalidIpv4CidrRangeError } from '../src'

describe('ipv4.cidr', () => {
  describe('creation from different formats', () => {
    it('should create CIDR from string', () => {
      const cidr = ipv4.cidr('192.168.0.0/24')
      expect(cidr).toBeInstanceOf(Ipv4Cidr)
      expect(cidr.toString()).toBe('192.168.0.0/24')
    })

    it('should create CIDR from object', () => {
      const cidr = ipv4.cidr({ address: '192.168.0.0', range: 24 })
      expect(cidr).toBeInstanceOf(Ipv4Cidr)
      expect(cidr.toString()).toBe('192.168.0.0/24')
    })

    it('should create CIDR from tuple', () => {
      const cidr = ipv4.cidr([[192, 168, 0, 0], 24])
      expect(cidr).toBeInstanceOf(Ipv4Cidr)
      expect(cidr.toString()).toBe('192.168.0.0/24')
    })

    it('should create CIDR with number address', () => {
      const cidr = ipv4.cidr([3232235520, 24])
      expect(cidr.toString()).toBe('192.168.0.0/24')
    })

    it('should handle /0 range', () => {
      const cidr = ipv4.cidr('0.0.0.0/0')
      expect(cidr.range()).toBe(0)
    })

    it('should handle /32 range', () => {
      const cidr = ipv4.cidr('192.168.1.1/32')
      expect(cidr.range()).toBe(32)
    })
  })

  describe('validation', () => {
    it('should validate valid CIDRs', () => {
      expect(ipv4.isValidCIDR('192.168.0.0/24')).toBe(true)
      expect(ipv4.isValidCIDR('0.0.0.0/0')).toBe(true)
      expect(ipv4.isValidCIDR('255.255.255.255/32')).toBe(true)
      expect(ipv4.isValidCIDR({ address: '10.0.0.0', range: 8 })).toBe(true)
      expect(ipv4.isValidCIDR([[172, 16, 0, 0], 12])).toBe(true)
    })

    it('should reject invalid CIDRs', () => {
      expect(ipv4.isValidCIDR('192.168.0.0/33')).toBe(false)
      expect(ipv4.isValidCIDR('192.168.0.0/-1')).toBe(false)
      expect(ipv4.isValidCIDR('invalid/24')).toBe(false)
      expect(ipv4.isValidCIDR('192.168.0.0')).toBe(false)
      expect(ipv4.isValidCIDR({ address: '192.168.0.0', range: 33 })).toBe(false)
      expect(ipv4.isValidCIDR([[256, 0, 0, 0], 24])).toBe(false)
      expect(ipv4.isValidCIDR(null as any)).toBe(false)
      expect(ipv4.isValidCIDR(undefined as any)).toBe(false)
    })

    it('should throw on invalid CIDR creation', () => {
      expect(() => ipv4.cidr('192.168.0.0/33')).toThrow(InvalidIpv4CidrError)
      expect(() => ipv4.cidr('invalid/24')).toThrow(InvalidIpv4CidrError)
    })
  })

  describe('properties', () => {
    const cidr = ipv4.cidr('192.168.0.0/24')

    it('should get base address', () => {
      expect(cidr.baseAddress().toString()).toBe('192.168.0.0')
    })

    it('should get range', () => {
      expect(cidr.range()).toBe(24)
    })

    it('should get range parts', () => {
      const [address, range] = cidr.rangeParts()
      expect(address.toString()).toBe('192.168.0.0')
      expect(range).toBe(24)
    })

    it('should calculate netmask', () => {
      expect(ipv4.cidr('192.168.0.0/24').netmask().toString()).toBe('255.255.255.0')
      expect(ipv4.cidr('10.0.0.0/8').netmask().toString()).toBe('255.0.0.0')
      expect(ipv4.cidr('172.16.0.0/16').netmask().toString()).toBe('255.255.0.0')
      expect(ipv4.cidr('192.168.1.0/28').netmask().toString()).toBe('255.255.255.240')
      expect(ipv4.cidr('0.0.0.0/0').netmask().toString()).toBe('0.0.0.0')
    })

    it('should calculate hostmask', () => {
      expect(ipv4.cidr('192.168.0.0/24').hostmask().toString()).toBe('0.0.0.255')
      expect(ipv4.cidr('10.0.0.0/8').hostmask().toString()).toBe('0.255.255.255')
      expect(ipv4.cidr('172.16.0.0/16').hostmask().toString()).toBe('0.0.255.255')
      expect(ipv4.cidr('192.168.1.0/28').hostmask().toString()).toBe('0.0.0.15')
      expect(ipv4.cidr('192.168.1.0/30').hostmask().toString()).toBe('0.0.0.3')
      expect(ipv4.cidr('0.0.0.0/0').hostmask().toString()).toBe('255.255.255.255')
      expect(ipv4.cidr('192.168.1.1/32').hostmask().toString()).toBe('0.0.0.0')
    })

    it('should calculate network address', () => {
      expect(ipv4.cidr('192.168.1.5/24').network().toString()).toBe('192.168.1.0')
      expect(ipv4.cidr('10.5.10.20/8').network().toString()).toBe('10.0.0.0')
      expect(ipv4.cidr('172.16.5.1/16').network().toString()).toBe('172.16.0.0')
      expect(ipv4.cidr('192.168.0.0/24').network().toString()).toBe('192.168.0.0')
      expect(ipv4.cidr('192.168.1.5/32').network().toString()).toBe('192.168.1.5')
      expect(ipv4.cidr('0.0.0.0/0').network().toString()).toBe('0.0.0.0')
      expect(ipv4.cidr('255.255.255.255/32').network().toString()).toBe('255.255.255.255')
      expect(ipv4.cidr('192.168.1.127/25').network().toString()).toBe('192.168.1.0')
      expect(ipv4.cidr('192.168.1.128/25').network().toString()).toBe('192.168.1.128')
    })

    it('should calculate network CIDR', () => {
      expect(ipv4.cidr('192.168.1.5/24').networkCIDR().toString()).toBe('192.168.1.0/24')
      expect(ipv4.cidr('10.5.10.20/8').networkCIDR().toString()).toBe('10.0.0.0/8')
      expect(ipv4.cidr('172.16.5.1/16').networkCIDR().toString()).toBe('172.16.0.0/16')
      expect(ipv4.cidr('192.168.0.0/24').networkCIDR().toString()).toBe('192.168.0.0/24')
      expect(ipv4.cidr('192.168.1.5/32').networkCIDR().toString()).toBe('192.168.1.5/32')
      expect(ipv4.cidr('0.0.0.0/0').networkCIDR().toString()).toBe('0.0.0.0/0')
      expect(ipv4.cidr('255.255.255.255/32').networkCIDR().toString()).toBe('255.255.255.255/32')
      expect(ipv4.cidr('192.168.1.127/25').networkCIDR().toString()).toBe('192.168.1.0/25')
      expect(ipv4.cidr('192.168.1.128/25').networkCIDR().toString()).toBe('192.168.1.128/25')
    })

    it('should calculate address count', () => {
      expect(ipv4.cidr('192.168.0.0/24').addressCount()).toBe(256)
      expect(ipv4.cidr('10.0.0.0/8').addressCount()).toBe(16777216)
      expect(ipv4.cidr('192.168.1.0/30').addressCount()).toBe(4)
      expect(ipv4.cidr('192.168.1.1/32').addressCount()).toBe(1)
    })

    it('should convert to string', () => {
      expect(cidr.toString()).toBe('192.168.0.0/24')
      expect(ipv4.cidr({ address: '10.0.0.0', range: 8 }).toString()).toBe('10.0.0.0/8')
    })
  })

  describe('usable addresses', () => {
    it('should get first usable address', () => {
      expect(ipv4.cidr('192.168.0.0/24').getFirstUsableAddress()?.toString()).toBe('192.168.0.1')
      expect(ipv4.cidr('10.0.0.0/8').getFirstUsableAddress()?.toString()).toBe('10.0.0.1')
    })

    it('should get last usable address', () => {
      expect(ipv4.cidr('192.168.0.0/24').getLastUsableAddress()?.toString()).toBe('192.168.0.254')
      expect(ipv4.cidr('192.168.1.0/30').getLastUsableAddress()?.toString()).toBe('192.168.1.2')
    })

    it('should return undefined for /32 usable addresses', () => {
      expect(ipv4.cidr('192.168.1.1/32').getFirstUsableAddress()).toBeUndefined()
      expect(ipv4.cidr('192.168.1.1/32').getLastUsableAddress()).toBeUndefined()
    })
  })

  describe('iteration', () => {
    it('should iterate over addresses', () => {
      const cidr = ipv4.cidr('192.168.1.0/30')
      const addresses = Array.from(cidr.addresses()).map(addr => addr.toString())
      expect(addresses).toEqual([
        '192.168.1.0',
        '192.168.1.1',
        '192.168.1.2',
        '192.168.1.3',
      ])
    })

    it('should iterate over /32', () => {
      const cidr = ipv4.cidr('192.168.1.1/32')
      const addresses = Array.from(cidr.addresses()).map(addr => addr.toString())
      expect(addresses).toEqual(['192.168.1.1'])
    })
  })

  describe('comparisons', () => {
    const cidr = ipv4.cidr('192.168.0.0/24')

    it('should check equality', () => {
      expect(cidr.equals('192.168.0.0/24')).toBe(true)
      expect(cidr.equals({ address: '192.168.0.0', range: 24 })).toBe(true)
      expect(cidr.equals(ipv4.cidr('192.168.0.0/24'))).toBe(true)
      expect(cidr.equals('192.168.0.0/25')).toBe(false)
      expect(cidr.equals('192.168.1.0/24')).toBe(false)
    })
  })

  describe('containment', () => {
    const cidr = ipv4.cidr('192.168.0.0/24')

    it('should check if address is included', () => {
      expect(cidr.includes(ipv4.address('192.168.0.0'))).toBe(true)
      expect(cidr.includes(ipv4.address('192.168.0.100'))).toBe(true)
      expect(cidr.includes(ipv4.address('192.168.0.255'))).toBe(true)
      expect(cidr.includes(ipv4.address('192.168.1.0'))).toBe(false)
      expect(cidr.includes(ipv4.address('10.0.0.1'))).toBe(false)
    })
  })

  describe('overlap', () => {
    const cidr = ipv4.cidr('192.168.0.0/24')

    it('should check overlap with contained CIDR', () => {
      expect(cidr.overlaps('192.168.0.0/25')).toBe(true)
      expect(cidr.overlaps('192.168.0.128/25')).toBe(true)
    })

    it('should check overlap with partial overlap', () => {
      expect(cidr.overlaps('192.168.0.0/23')).toBe(true)
    })

    it('should check no overlap', () => {
      expect(cidr.overlaps('10.0.0.0/8')).toBe(false)
      expect(cidr.overlaps('192.168.1.0/24')).toBe(false)
    })

    it('should check overlap with same CIDR', () => {
      expect(cidr.overlaps('192.168.0.0/24')).toBe(true)
    })
  })

  describe('navigation', () => {
    it('should get next CIDR', () => {
      expect(ipv4.cidr('192.168.0.0/24').nextCIDR()?.toString()).toBe('192.168.1.0/24')
      expect(ipv4.cidr('10.0.0.0/8').nextCIDR()?.toString()).toBe('11.0.0.0/8')
    })

    it('should return undefined for max CIDR next', () => {
      expect(ipv4.cidr('255.255.255.0/24').nextCIDR()).toBeUndefined()
    })

    it('should check hasNextCIDR', () => {
      expect(ipv4.cidr('192.168.0.0/24').hasNextCIDR()).toBe(true)
      expect(ipv4.cidr('255.255.255.0/24').hasNextCIDR()).toBe(false)
    })

    it('should get previous CIDR', () => {
      expect(ipv4.cidr('192.168.1.0/24').previousCIDR()?.toString()).toBe('192.168.0.0/24')
      expect(ipv4.cidr('11.0.0.0/8').previousCIDR()?.toString()).toBe('10.0.0.0/8')
    })

    it('should return undefined for min CIDR previous', () => {
      expect(ipv4.cidr('0.0.0.0/24').previousCIDR()).toBeUndefined()
    })

    it('should check hasPreviousCIDR', () => {
      expect(ipv4.cidr('192.168.1.0/24').hasPreviousCIDR()).toBe(true)
      expect(ipv4.cidr('0.0.0.0/24').hasPreviousCIDR()).toBe(false)
    })
  })

  describe('subnetting', () => {
    it('should split into equal subnets', () => {
      const cidr = ipv4.cidr('192.168.0.0/24')
      const subnets = cidr.subnet(26)
      expect(subnets).toHaveLength(4)
      expect(subnets.map(s => s.toString())).toEqual([
        '192.168.0.0/26',
        '192.168.0.64/26',
        '192.168.0.128/26',
        '192.168.0.192/26',
      ])
    })

    it('should split /24 into /25', () => {
      const cidr = ipv4.cidr('192.168.0.0/24')
      const subnets = cidr.subnet(25)
      expect(subnets).toHaveLength(2)
      expect(subnets.map(s => s.toString())).toEqual([
        '192.168.0.0/25',
        '192.168.0.128/25',
      ])
    })

    it('should throw on invalid subnet range', () => {
      const cidr = ipv4.cidr('192.168.0.0/24')
      expect(() => cidr.subnet(23)).toThrow(InvalidIpv4CidrRangeError)
      expect(() => cidr.subnet(33)).toThrow(InvalidIpv4CidrRangeError)
    })

    it('should split by specific ranges', () => {
      const cidr = ipv4.cidr('192.168.0.0/24')
      const subnets = cidr.subnetBy([25, 26, 27, 27])
      expect(subnets.map(s => s.toString())).toEqual([
        '192.168.0.0/25',
        '192.168.0.128/26',
        '192.168.0.192/27',
        '192.168.0.224/27',
      ])
    })

    it('should throw on subnetBy with invalid range', () => {
      const cidr = ipv4.cidr('192.168.0.0/24')
      expect(() => cidr.subnetBy([23, 24])).toThrow(InvalidIpv4CidrRangeError)
      expect(() => cidr.subnetBy([25, 33])).toThrow(InvalidIpv4CidrRangeError)
    })

    it('should throw on subnetBy exceeding parent bounds', () => {
      const cidr = ipv4.cidr('192.168.0.0/24')
      expect(() => cidr.subnetBy([25, 25, 25])).toThrow(InvalidIpv4CidrRangeError)
    })
  })

  describe('comparison with Ipv4Cidr instances', () => {
    const cidr1 = ipv4.cidr('192.168.0.0/24')
    const cidr2 = ipv4.cidr('192.168.0.0/24')

    it('should compare equals with Ipv4Cidr instance', () => {
      expect(cidr1.equals(cidr2)).toBe(true)
    })

    it('should check overlaps with Ipv4Cidr instance', () => {
      const cidr3 = ipv4.cidr('192.168.0.0/25')
      expect(cidr1.overlaps(cidr3)).toBe(true)
    })
  })

  describe('edge cases for address iteration', () => {
    it('should iterate over /31 (2 addresses)', () => {
      const cidr = ipv4.cidr('192.168.1.0/31')
      const addresses = Array.from(cidr.addresses()).map(a => a.toString())
      expect(addresses).toHaveLength(2)
      expect(addresses).toEqual(['192.168.1.0', '192.168.1.1'])
    })

    it('should iterate over /30 (4 addresses)', () => {
      const cidr = ipv4.cidr('10.0.0.0/30')
      const addresses = Array.from(cidr.addresses()).map(a => a.toString())
      expect(addresses).toHaveLength(4)
    })
  })

  describe('boundary cases for subnetting', () => {
    it('should subnet /31 to /32', () => {
      const cidr = ipv4.cidr('192.168.1.0/31')
      const subnets = cidr.subnet(32)
      expect(subnets).toHaveLength(2)
      expect(subnets.map(s => s.toString())).toEqual([
        '192.168.1.0/32',
        '192.168.1.1/32',
      ])
    })

    it('should subnet /0 to /1', () => {
      const cidr = ipv4.cidr('0.0.0.0/0')
      const subnets = cidr.subnet(1)
      expect(subnets).toHaveLength(2)
      expect(subnets[0]?.toString()).toBe('0.0.0.0/1')
      expect(subnets[1]?.toString()).toBe('128.0.0.0/1')
    })
  })

  describe('validation edge cases', () => {
    it('should reject object without address key', () => {
      expect(ipv4.isValidCIDR({ range: 24 } as any)).toBe(false)
    })

    it('should reject object without range key', () => {
      expect(ipv4.isValidCIDR({ address: '192.168.0.0' } as any)).toBe(false)
    })

    it('should reject object with null address', () => {
      expect(ipv4.isValidCIDR({ address: null, range: 24 } as any)).toBe(false)
    })

    it('should reject object with undefined address', () => {
      expect(ipv4.isValidCIDR({ address: undefined, range: 24 } as any)).toBe(false)
    })

    it('should reject object with non-number range', () => {
      expect(ipv4.isValidCIDR({ address: '192.168.0.0', range: '24' } as any)).toBe(false)
    })

    it('should reject array with null address', () => {
      expect(ipv4.isValidCIDR([null, 24] as any)).toBe(false)
    })

    it('should reject array with undefined address', () => {
      expect(ipv4.isValidCIDR([undefined, 24] as any)).toBe(false)
    })

    it('should reject array with non-number range', () => {
      expect(ipv4.isValidCIDR(['192.168.0.0', '24'] as any)).toBe(false)
    })

    it('should parse non-integer range as integer', () => {
      expect(ipv4.isValidCIDR('192.168.0.0/24.5')).toBe(true)
      const cidr = ipv4.cidr('192.168.0.0/24.5')
      expect(cidr.range()).toBe(24)
    })

    it('should reject function as input', () => {
      expect(ipv4.isValidCIDR((() => {}) as any)).toBe(false)
    })

    it('should reject array with wrong length', () => {
      expect(ipv4.isValidCIDR(['192.168.0.0'] as any)).toBe(false)
      expect(ipv4.isValidCIDR(['192.168.0.0', 24, 'extra'] as any)).toBe(false)
    })

    it('should handle IPv4 CIDR array with various formats', () => {
      expect(ipv4.isValidCIDR([[10, 0, 0, 0], 8])).toBe(true)
      expect(ipv4.isValidCIDR([3232235520, 24])).toBe(true)
    })

    it('should validate CIDR with boundary range values', () => {
      expect(ipv4.isValidCIDR('192.168.0.0/0')).toBe(true)
      expect(ipv4.isValidCIDR('192.168.0.0/32')).toBe(true)
      expect(ipv4.isValidCIDR('192.168.0.0/33')).toBe(false)
      expect(ipv4.isValidCIDR('192.168.0.0/-1')).toBe(false)
    })

    it('should handle CIDR with whitespace gracefully', () => {
      const result = ipv4.isValidCIDR('192.168.0.0/24 ')
      expect(typeof result).toBe('boolean')
    })
  })

  describe('constructor edge cases', () => {
    it('should throw on invalid type in Ipv4Cidr constructor', () => {
      expect(() => new Ipv4Cidr(123 as any)).toThrow(InvalidIpv4CidrError)
      expect(() => new Ipv4Cidr(true as any)).toThrow(InvalidIpv4CidrError)
      expect(() => new Ipv4Cidr(null as any)).toThrow(InvalidIpv4CidrError)
      expect(() => new Ipv4Cidr(undefined as any)).toThrow(InvalidIpv4CidrError)
      expect(() => new Ipv4Cidr((() => {}) as any)).toThrow(InvalidIpv4CidrError)
      expect(() => new Ipv4Cidr(new Number(123) as any)).toThrow(InvalidIpv4CidrError)
    })

    it('should throw InvalidIpv4CidrError with correct message for numbers', () => {
      try {
        new Ipv4Cidr(12345 as any)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidIpv4CidrError)
      }
    })

    it('should throw InvalidIpv4CidrError with correct message for boolean', () => {
      try {
        new Ipv4Cidr(false as any)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidIpv4CidrError)
      }
    })
  })
})
