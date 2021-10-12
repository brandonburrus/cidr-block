import * as cidr from '../../../src/index'

describe('ipv4', () => {
  describe('address()', () => {
    it('instantiates an Ipv4Address', () => {
      expect(cidr.ipv4.address('0.0.0.0')).toBeInstanceOf(cidr.ipv4.Ipv4Address)
    })
  })

  describe('fromString()', () => {
    it.each([
      ['0.0.0.0', 0b00000000_00000000_00000000_00000000],
      ['255.0.0.0', 0b11111111_00000000_00000000_00000000],
      ['0.255.0.0', 0b00000000_11111111_00000000_00000000],
      ['0.0.255.0', 0b00000000_00000000_11111111_00000000],
      ['0.0.0.255', 0b00000000_00000000_00000000_11111111],
      ['255.0.0.255', 0b11111111_00000000_00000000_11111111],
      ['255.255.0.255', 0b11111111_11111111_00000000_11111111],
      ['255.255.255.255', 0b11111111_11111111_11111111_11111111]
    ])('converts strings to ipv4 numbers (%s should equal %d)', (input: string, output: number) => {
      expect(cidr.ipv4.stringToNum(input)).toBe(output)
    })

    it('throws errors when the string is an invalid ip', () => {
      expect(() => cidr.ipv4.stringToNum('')).toThrow()
      expect(() => cidr.ipv4.stringToNum('-10.0.0.0')).toThrow()
      expect(() => cidr.ipv4.stringToNum('255.255.-3.0')).toThrow()
      expect(() => cidr.ipv4.stringToNum('255.255.256.0')).toThrow()
    })
  })

  describe('toString()', () => {
    it.each([
      [0b00000000_00000000_00000000_00000000, '0.0.0.0'],
      [0b11111111_00000000_00000000_00000000, '255.0.0.0'],
      [0b00000000_11111111_00000000_00000000, '0.255.0.0'],
      [0b00000000_00000000_11111111_00000000, '0.0.255.0'],
      [0b00000000_00000000_00000000_11111111, '0.0.0.255'],
      [0b11111111_00000000_00000000_11111111, '255.0.0.255'],
      [0b11111111_11111111_00000000_11111111, '255.255.0.255'],
      [0b11111111_11111111_11111111_11111111, '255.255.255.255']
    ])('converts ipv4 numbers to strings (%d should equal %s)', (input: number, output: string) => {
      expect(cidr.ipv4.numToString(input)).toBe(output)
    })

    it('throws errors when the number is an invalid ip', () => {
      expect(() => cidr.ipv4.numToString(-1)).toThrowError()
      expect(() => cidr.ipv4.numToString(2 ** 33)).toThrowError()
    })
  })
})
