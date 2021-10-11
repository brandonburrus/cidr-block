import * as cidr from '../../../src/index'

describe('ipv4', () => {
  describe('address()', () => {
    it('instantiates an Ipv4Address', () => {
      expect(cidr.ipv4.address('0.0.0.0')).toBeInstanceOf(cidr.ipv4.Ipv4Address)
    })
  })

  describe('fromString()', () => {
    it.each([
      ['0.0.0.0', 0b00000000_00000000_00000000_00000000n],
      ['255.0.0.0', 0b11111111_00000000_00000000_00000000n],
      ['0.255.0.0', 0b00000000_11111111_00000000_00000000n],
      ['0.0.255.0', 0b00000000_00000000_11111111_00000000n],
      ['0.0.0.255', 0b00000000_00000000_00000000_11111111n],
      ['255.0.0.255', 0b11111111_00000000_00000000_11111111n],
      ['255.255.0.255', 0b11111111_11111111_00000000_11111111n],
      ['255.255.255.255', 0b11111111_11111111_11111111_11111111n]
    ])('converts strings to ipv4 numbers (%s should equal %d)', (input: string, output: bigint) => {
      expect(cidr.ipv4.fromString(input)).toBe(output)
    })

    it('throws errors when the string is an invalid ip', () => {
      expect(() => cidr.ipv4.fromString('')).toThrow()
      expect(() => cidr.ipv4.fromString('-10.0.0.0')).toThrow()
      expect(() => cidr.ipv4.fromString('255.255.-3.0')).toThrow()
      expect(() => cidr.ipv4.fromString('255.255.256.0')).toThrow()
    })
  })

  describe('toString()', () => {
    it.each([
      [0b00000000_00000000_00000000_00000000n, '0.0.0.0'],
      [0b11111111_00000000_00000000_00000000n, '255.0.0.0'],
      [0b00000000_11111111_00000000_00000000n, '0.255.0.0'],
      [0b00000000_00000000_11111111_00000000n, '0.0.255.0'],
      [0b00000000_00000000_00000000_11111111n, '0.0.0.255'],
      [0b11111111_00000000_00000000_11111111n, '255.0.0.255'],
      [0b11111111_11111111_00000000_11111111n, '255.255.0.255'],
      [0b11111111_11111111_11111111_11111111n, '255.255.255.255']
    ])('converts ipv4 numbers to strings (%d should equal %s)', (input: bigint, output: string) => {
      expect(cidr.ipv4.toString(input)).toBe(output)
    })

    it('throws errors when the number is an invalid ip', () => {
      expect(() => cidr.ipv4.toString(-1n)).toThrowError()
      expect(() => cidr.ipv4.toString(2n ** 33n)).toThrowError()
    })
  })
})
