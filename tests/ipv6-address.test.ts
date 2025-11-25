import { describe, it, expect } from 'vitest'
import { ipv6, Ipv6Address, InvalidIpv6AddressError } from '../src'

describe('ipv6.address', () => {
  describe('creation from different formats', () => {
    it('should create address from compressed string', () => {
      const addr = ipv6.address('2001:db8::1')
      expect(addr).toBeInstanceOf(Ipv6Address)
      expect(addr.toString()).toBe('2001:db8::1')
    })

    it('should create address from full string', () => {
      const addr = ipv6.address('2001:0db8:0000:0000:0000:0000:0000:0001')
      expect(addr).toBeInstanceOf(Ipv6Address)
      expect(addr.toString()).toBe('2001:db8::1')
    })

    it('should create address from bigint', () => {
      const addr = ipv6.address(42540766411282592856903984951653826561n)
      expect(addr).toBeInstanceOf(Ipv6Address)
      expect(addr.toString()).toBe('2001:db8::1')
    })

    it('should create address from hextets array', () => {
      const addr = ipv6.address([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1])
      expect(addr).toBeInstanceOf(Ipv6Address)
      expect(addr.toString()).toBe('2001:db8::1')
    })

    it('should handle minimum address', () => {
      const addr = ipv6.address('::')
      expect(addr.toBigInt()).toBe(0n)
      expect(addr.toString()).toBe('::')
    })

    it('should handle maximum address', () => {
      const addr = ipv6.address('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff')
      expect(addr.toBigInt()).toBe(ipv6.MAX_SIZE)
    })

    it('should handle loopback address', () => {
      const addr = ipv6.address('::1')
      expect(addr.toString()).toBe('::1')
      expect(addr.toBigInt()).toBe(1n)
    })

    it('should handle IPv4-mapped addresses', () => {
      const addr = ipv6.address('::ffff:192.168.1.1')
      expect(addr.isIPv4MappedAddress()).toBe(true)
    })
  })

  describe('validation', () => {
    it('should validate valid addresses', () => {
      expect(ipv6.isValidAddress('2001:db8::1')).toBe(true)
      expect(ipv6.isValidAddress('::')).toBe(true)
      expect(ipv6.isValidAddress('::1')).toBe(true)
      expect(ipv6.isValidAddress('fe80::1')).toBe(true)
      expect(ipv6.isValidAddress('2001:0db8:0000:0000:0000:0000:0000:0001')).toBe(true)
      expect(ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1])).toBe(true)
      expect(ipv6.isValidAddress(42540766411282592856903984951653826561n)).toBe(true)
      expect(ipv6.isValidAddress('::ffff:192.168.1.1')).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(ipv6.isValidAddress('gggg::1')).toBe(false)
      expect(ipv6.isValidAddress('2001:db8')).toBe(false)
      expect(ipv6.isValidAddress('2001:db8::1::2')).toBe(false) // multiple ::
      expect(ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0])).toBe(false) // wrong length
      expect(ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0x10000])).toBe(false) // value too large
      expect(ipv6.isValidAddress(ipv6.MAX_SIZE + 1n)).toBe(false)
      expect(ipv6.isValidAddress(-1n)).toBe(false)
      expect(ipv6.isValidAddress(null as any)).toBe(false)
      expect(ipv6.isValidAddress(undefined as any)).toBe(false)
    })

    it('should throw on invalid address creation', () => {
      expect(() => ipv6.address('gggg::1')).toThrow(InvalidIpv6AddressError)
      expect(() => ipv6.address('invalid')).toThrow(InvalidIpv6AddressError)
    })
  })

  describe('conversions', () => {
    it('should convert to compressed string', () => {
      expect(ipv6.address('2001:0db8:0000:0000:0000:0000:0000:0001').toString()).toBe('2001:db8::1')
      expect(ipv6.address('::').toString()).toBe('::')
      expect(ipv6.address('::1').toString()).toBe('::1')
    })

    it('should convert to full string', () => {
      expect(ipv6.address('2001:db8::1').toFullString()).toBe('2001:0db8:0000:0000:0000:0000:0000:0001')
      expect(ipv6.address('::1').toFullString()).toBe('0000:0000:0000:0000:0000:0000:0000:0001')
    })

    it('should convert to bigint', () => {
      expect(ipv6.address('2001:db8::1').toBigInt()).toBe(42540766411282592856903984951653826561n)
      expect(ipv6.address('::1').toBigInt()).toBe(1n)
      expect(ipv6.address('::').toBigInt()).toBe(0n)
    })

    it('should convert to hextets', () => {
      expect(ipv6.address('2001:db8::1').hextets()).toEqual([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1])
      expect(ipv6.address('::1').hextets()).toEqual([0, 0, 0, 0, 0, 0, 0, 1])
    })

    it('should convert to binary string', () => {
      const addr = ipv6.address('::1')
      const binary = addr.toBinaryString()
      expect(binary).toContain('0000000000000001')
    })
  })

  describe('parseHextets', () => {
    it('should parse from string', () => {
      expect(ipv6.parseHextets('2001:db8::1')).toEqual([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1])
      expect(ipv6.parseHextets('::')).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    })

    it('should parse from bigint', () => {
      expect(ipv6.parseHextets(42540766411282592856903984951653826561n)).toEqual([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1])
    })

    it('should parse from array', () => {
      expect(ipv6.parseHextets([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1])).toEqual([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1])
    })

    it('should parse IPv4-mapped addresses', () => {
      const hextets = ipv6.parseHextets('::ffff:192.168.1.1')
      expect(hextets[5]).toBe(0xffff)
    })

    it('should throw on invalid input', () => {
      expect(() => ipv6.parseHextets('invalid')).toThrow(InvalidIpv6AddressError)
    })
  })

  describe('comparisons', () => {
    const addr = ipv6.address('2001:db8::100')

    it('should check equality', () => {
      expect(addr.equals('2001:db8::100')).toBe(true)
      expect(addr.equals('2001:0db8:0000:0000:0000:0000:0000:0100')).toBe(true)
      expect(addr.equals([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0x100])).toBe(true)
      expect(addr.equals(ipv6.address('2001:db8::100'))).toBe(true)
      expect(addr.equals('2001:db8::101')).toBe(false)
    })

    it('should check greater than', () => {
      expect(addr.isGreaterThan('2001:db8::99')).toBe(true)
      expect(addr.isGreaterThan('2001:db8::100')).toBe(false)
      expect(addr.isGreaterThan('2001:db8::101')).toBe(false)
    })

    it('should check greater than or equal', () => {
      expect(addr.isGreaterThanOrEqual('2001:db8::99')).toBe(true)
      expect(addr.isGreaterThanOrEqual('2001:db8::100')).toBe(true)
      expect(addr.isGreaterThanOrEqual('2001:db8::101')).toBe(false)
    })

    it('should check less than', () => {
      expect(addr.isLessThan('2001:db8::101')).toBe(true)
      expect(addr.isLessThan('2001:db8::100')).toBe(false)
      expect(addr.isLessThan('2001:db8::99')).toBe(false)
    })

    it('should check less than or equal', () => {
      expect(addr.isLessThanOrEqual('2001:db8::101')).toBe(true)
      expect(addr.isLessThanOrEqual('2001:db8::100')).toBe(true)
      expect(addr.isLessThanOrEqual('2001:db8::99')).toBe(false)
    })
  })

  describe('navigation', () => {
    it('should get next address', () => {
      expect(ipv6.address('2001:db8::1').nextAddress()?.toString()).toBe('2001:db8::2')
      expect(ipv6.address('2001:db8::ffff').nextAddress()?.toString()).toBe('2001:db8::1:0')
    })

    it('should return undefined for max address next', () => {
      expect(ipv6.address('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff').nextAddress()).toBeUndefined()
    })

    it('should check hasNextAddress', () => {
      expect(ipv6.address('2001:db8::1').hasNextAddress()).toBe(true)
      expect(ipv6.address('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff').hasNextAddress()).toBe(false)
    })

    it('should get previous address', () => {
      expect(ipv6.address('2001:db8::1').previousAddress()?.toString()).toBe('2001:db8::')
      expect(ipv6.address('2001:db8::1:0').previousAddress()?.toString()).toBe('2001:db8::ffff')
    })

    it('should return undefined for min address previous', () => {
      expect(ipv6.address('::').previousAddress()).toBeUndefined()
    })

    it('should check hasPreviousAddress', () => {
      expect(ipv6.address('2001:db8::1').hasPreviousAddress()).toBe(true)
      expect(ipv6.address('::').hasPreviousAddress()).toBe(false)
    })
  })

  describe('address types', () => {
    it('should identify loopback address', () => {
      expect(ipv6.address('::1').isLoopbackAddress()).toBe(true)
      expect(ipv6.address('::2').isLoopbackAddress()).toBe(false)
      expect(ipv6.address('2001:db8::1').isLoopbackAddress()).toBe(false)
    })

    it('should identify unspecified address', () => {
      expect(ipv6.address('::').isUnspecifiedAddress()).toBe(true)
      expect(ipv6.address('::1').isUnspecifiedAddress()).toBe(false)
    })

    it('should identify unique local addresses', () => {
      expect(ipv6.address('fc00::1').isUniqueLocalAddress()).toBe(true)
      expect(ipv6.address('fd00::1').isUniqueLocalAddress()).toBe(true)
      expect(ipv6.address('fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff').isUniqueLocalAddress()).toBe(true)
      expect(ipv6.address('2001:db8::1').isUniqueLocalAddress()).toBe(false)
      expect(ipv6.address('fe80::1').isUniqueLocalAddress()).toBe(false)
    })

    it('should identify link-local addresses', () => {
      expect(ipv6.address('fe80::1').isLinkLocalAddress()).toBe(true)
      expect(ipv6.address('fe80::').isLinkLocalAddress()).toBe(true)
      expect(ipv6.address('febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff').isLinkLocalAddress()).toBe(true)
      expect(ipv6.address('2001:db8::1').isLinkLocalAddress()).toBe(false)
      expect(ipv6.address('fec0::1').isLinkLocalAddress()).toBe(false)
    })

    it('should identify multicast addresses', () => {
      expect(ipv6.address('ff02::1').isMulticastAddress()).toBe(true)
      expect(ipv6.address('ff00::').isMulticastAddress()).toBe(true)
      expect(ipv6.address('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff').isMulticastAddress()).toBe(true)
      expect(ipv6.address('2001:db8::1').isMulticastAddress()).toBe(false)
      expect(ipv6.address('fe80::1').isMulticastAddress()).toBe(false)
    })

    it('should identify IPv4-mapped addresses', () => {
      expect(ipv6.address('::ffff:192.168.1.1').isIPv4MappedAddress()).toBe(true)
      expect(ipv6.address('::ffff:c0a8:0101').isIPv4MappedAddress()).toBe(true)
      expect(ipv6.address('2001:db8::1').isIPv4MappedAddress()).toBe(false)
      expect(ipv6.address('::1').isIPv4MappedAddress()).toBe(false)
    })

    it('should identify documentation addresses', () => {
      expect(ipv6.address('2001:db8::1').isDocumentationAddress()).toBe(true)
      expect(ipv6.address('2001:db8:1234::1').isDocumentationAddress()).toBe(true)
      expect(ipv6.address('2001:db8:ffff:ffff:ffff:ffff:ffff:ffff').isDocumentationAddress()).toBe(true)
      expect(ipv6.address('2001:470::1').isDocumentationAddress()).toBe(false)
      expect(ipv6.address('2001:db7::1').isDocumentationAddress()).toBe(false)
    })
  })

  describe('constants', () => {
    it('should have correct max size', () => {
      expect(ipv6.MAX_SIZE).toBe((1n << 128n) - 1n)
    })

    it('should have correct min size', () => {
      expect(ipv6.MIN_SIZE).toBe(0n)
    })

    it('should have correct max range', () => {
      expect(ipv6.MAX_RANGE).toBe(128)
    })

    it('should have correct min range', () => {
      expect(ipv6.MIN_RANGE).toBe(0)
    })
  })

  describe('comparison with Ipv6Address instances', () => {
    const addr1 = ipv6.address('2001:db8::100')
    const addr2 = ipv6.address('2001:db8::101')
    const addr3 = ipv6.address('2001:db8::100')

    it('should compare isGreaterThan with Ipv6Address instance', () => {
      expect(addr2.isGreaterThan(addr1)).toBe(true)
      expect(addr1.isGreaterThan(addr2)).toBe(false)
      expect(addr1.isGreaterThan(addr3)).toBe(false)
    })

    it('should compare isGreaterThanOrEqual with Ipv6Address instance', () => {
      expect(addr2.isGreaterThanOrEqual(addr1)).toBe(true)
      expect(addr1.isGreaterThanOrEqual(addr3)).toBe(true)
      expect(addr1.isGreaterThanOrEqual(addr2)).toBe(false)
    })

    it('should compare isLessThan with Ipv6Address instance', () => {
      expect(addr1.isLessThan(addr2)).toBe(true)
      expect(addr2.isLessThan(addr1)).toBe(false)
      expect(addr1.isLessThan(addr3)).toBe(false)
    })

    it('should compare isLessThanOrEqual with Ipv6Address instance', () => {
      expect(addr1.isLessThanOrEqual(addr2)).toBe(true)
      expect(addr1.isLessThanOrEqual(addr3)).toBe(true)
      expect(addr2.isLessThanOrEqual(addr1)).toBe(false)
    })
  })

  describe('validation edge cases', () => {
    it('should reject too few hextets without compression', () => {
      expect(ipv6.isValidAddress('2001:db8:0:0:0:0:0')).toBe(false)
    })

    it('should reject too many hextets', () => {
      expect(ipv6.isValidAddress('2001:db8:0:0:0:0:0:0:1')).toBe(false)
    })

    it('should reject hextet value > 0xffff', () => {
      expect(ipv6.isValidAddress('10000::1')).toBe(false)
    })

    it('should reject empty hextets without ::', () => {
      expect(ipv6.isValidAddress('2001::db8:::1')).toBe(false)
    })

    it('should reject invalid characters', () => {
      expect(ipv6.isValidAddress('200g:db8::1')).toBe(false)
      expect(ipv6.isValidAddress('zzzz::1')).toBe(false)
    })

    it('should reject object without required properties', () => {
      expect(ipv6.isValidAddress({ foo: 'bar' } as any)).toBe(false)
    })

    it('should reject array with wrong length', () => {
      expect(ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0])).toBe(false)
      expect(ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0, 1])).toBe(false)
    })

    it('should reject array with values out of range', () => {
      expect(ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0x10000])).toBe(false)
      expect(ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0, -1])).toBe(false)
    })

    it('should reject array with non-integers', () => {
      expect(ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1.5])).toBe(false)
    })

    it('should handle :: at the beginning', () => {
      expect(ipv6.isValidAddress('::1')).toBe(true)
      expect(ipv6.isValidAddress('::ffff:192.168.1.1')).toBe(true)
    })

    it('should handle :: at the end', () => {
      expect(ipv6.isValidAddress('2001:db8::')).toBe(true)
    })

    it('should handle :: in the middle', () => {
      expect(ipv6.isValidAddress('2001::1')).toBe(true)
    })

    it('should reject :: with too many hextets', () => {
      expect(ipv6.isValidAddress('2001:db8:1:2:3:4:5::6:7:8:9')).toBe(false)
      expect(ipv6.isValidAddress('1:2:3:4:5:6:7::8:9')).toBe(false)
      expect(ipv6.isValidAddress('1:2:3:4:5::6:7:8:9')).toBe(false)
    })

    it('should handle IPv6 with exactly 8 hextets separated by colons', () => {
      expect(ipv6.isValidAddress('1:2:3:4:5:6:7:8')).toBe(true)
    })

    it('should validate hextet values are in range', () => {
      expect(ipv6.isValidAddress('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff')).toBe(true)
      expect(ipv6.isValidAddress('0:0:0:0:0:0:0:0')).toBe(true)
    })

    it('should validate IPv6 arrays with edge values', () => {
      expect(ipv6.isValidAddress([0, 0, 0, 0, 0, 0, 0, 0])).toBe(true)
      expect(ipv6.isValidAddress([0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff])).toBe(true)
      expect(ipv6.isValidAddress([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1])).toBe(true)
    })

    it('should handle IPv6 with whitespace gracefully', () => {
      const result1 = ipv6.isValidAddress('2001:db8::1 ')
      const result2 = ipv6.isValidAddress(' 2001:db8::1')
      expect(typeof result1).toBe('boolean')
      expect(typeof result2).toBe('boolean')
    })
  })

  describe('IPv4-mapped address edge cases', () => {
    it('should validate IPv4-mapped with dotted decimal', () => {
      expect(ipv6.isValidAddress('::ffff:192.168.1.1')).toBe(true)
      expect(ipv6.isValidAddress('::ffff:255.255.255.255')).toBe(true)
    })

    it('should reject IPv4-mapped with invalid IPv4', () => {
      expect(ipv6.isValidAddress('::ffff:256.1.1.1')).toBe(false)
      expect(ipv6.isValidAddress('::ffff:192.168.1')).toBe(false)
    })

    it('should parse IPv4-mapped addresses correctly', () => {
      const hextets = ipv6.parseHextets('::ffff:192.168.1.1')
      expect(hextets[5]).toBe(0xffff)
      expect(hextets[6]).toBe(0xc0a8)
      expect(hextets[7]).toBe(0x0101)
    })

    it('should handle empty parts in IPv6 compression', () => {
      expect(ipv6.isValidAddress('::1')).toBe(true)
      expect(ipv6.isValidAddress('::ffff:192.168.1.1')).toBe(true)
      expect(ipv6.isValidAddress('fe80::')).toBe(true)
      expect(ipv6.isValidAddress('2001:db8::')).toBe(true)
      expect(ipv6.isValidAddress('2001::1')).toBe(true)
      expect(ipv6.isValidAddress('fe80::1')).toBe(true)
    })
  })

  describe('compression edge cases', () => {
    it('should compress longest run of zeros', () => {
      const addr = ipv6.address([0x2001, 0, 0, 0, 0, 0, 0, 1])
      expect(addr.toString()).toBe('2001::1')
    })

    it('should not compress single zero', () => {
      const addr = ipv6.address([0x2001, 0, 0xdb8, 0, 0, 0, 0, 1])
      expect(addr.toString()).toContain('::')
    })

    it('should handle all zeros', () => {
      const addr = ipv6.address([0, 0, 0, 0, 0, 0, 0, 0])
      expect(addr.toString()).toBe('::')
    })

    it('should handle no zeros', () => {
      const addr = ipv6.address([1, 2, 3, 4, 5, 6, 7, 8])
      expect(addr.toString()).toBe('1:2:3:4:5:6:7:8')
    })

    it('should handle compression scenarios correctly', () => {
      const addr1 = ipv6.address('2001:0:0:0:0:0:0:1')
      expect(addr1.toString()).toContain('::')

      const addr2 = ipv6.address('2001:0:0:db8:0:0:0:1')
      expect(addr2.toString()).toContain('::')
    })
  })

  describe('boundary values', () => {
    it('should handle max bigint', () => {
      const addr = ipv6.address(ipv6.MAX_SIZE)
      expect(addr.toString()).toBe('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff')
    })

    it('should handle min bigint', () => {
      const addr = ipv6.address(ipv6.MIN_SIZE)
      expect(addr.toString()).toBe('::')
    })

    it('should handle IPv6 addresses with maximum length hextets', () => {
      const addr = ipv6.address('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff')
      expect(addr.hextets()).toEqual([0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff])
    })
  })
})
