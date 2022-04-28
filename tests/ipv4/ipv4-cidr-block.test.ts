import { Ipv4Cidr } from '../../src/ipv4/ipv4-cidr'
import * as cidr from '../../src/index'

describe('ipv4', () => {
  describe('block()', () => {
    it('instantiates an Ipv4CidrBlock instance', () => {
      expect(cidr.ipv4.cidr('10.0.0.0/16')).toBeInstanceOf(Ipv4Cidr)
    })

    it.each([
      ['/0', 2 ** 32],
      ['/1', 2 ** 31],
      ['/2', 2 ** 30],
      ['/3', 2 ** 29],
      ['/4', 2 ** 28],
      ['/5', 2 ** 27],
      ['/6', 2 ** 26],
      ['/7', 2 ** 25],
      ['/8', 2 ** 24],
      ['/9', 2 ** 23],
      ['/10', 2 ** 22],
      ['/11', 2 ** 21],
      ['/12', 2 ** 20],
      ['/13', 2 ** 19],
      ['/14', 2 ** 18],
      ['/15', 2 ** 17],
      ['/16', 2 ** 16],
      ['/17', 2 ** 15],
      ['/18', 2 ** 14],
      ['/19', 2 ** 13],
      ['/20', 2 ** 12],
      ['/21', 2 ** 11],
      ['/22', 2 ** 10],
      ['/23', 2 ** 9],
      ['/24', 2 ** 8],
      ['/25', 2 ** 7],
      ['/26', 2 ** 6],
      ['/27', 2 ** 5],
      ['/28', 2 ** 4],
      ['/29', 2 ** 3],
      ['/30', 2 ** 2],
      ['/31', 2],
      ['/32', 1]
    ])(
      'calculates the number of allocatable ip addresses [%s has %d ips]',
      (range: string, count: number) => {
        expect(cidr.ipv4.cidr('0.0.0.0' + range).allocatableIpCount).toBe(count)
      }
    )

    it.each([
      ['0.0.0.0/24', '0.0.1.0/24'],
      ['0.0.2.0/24', '0.0.3.0/24'],
      ['0.1.0.0/16', '0.2.0.0/16'],
      ['0.0.0.1/32', '0.0.0.2/32']
    ])('calculates the next block [%s to %s]', (start: string, end: string) => {
      expect(cidr.ipv4.cidr(start).nextBlock().toString()).toBe(end)
      expect(cidr.ipv4.cidr(end).previousBlock().toString()).toBe(start)
    })
  })
})
