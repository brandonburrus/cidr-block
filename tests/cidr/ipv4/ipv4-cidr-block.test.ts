import { Ipv4CidrBlock } from './../../../src/cidr/ipv4/ipv4-cidr-block'
import * as cidr from '../../../src/index'

describe('ipv4', () => {
  describe('block()', () => {
    it('instantiates an Ipv4CidrBlock instance', () => {
      expect(cidr.ipv4.block('10.0.0.0/16')).toBeInstanceOf(Ipv4CidrBlock)
    })

    it.each([
      ['/0', 2n ** 32n],
      ['/1', 2n ** 31n],
      ['/2', 2n ** 30n],
      ['/3', 2n ** 29n],
      ['/4', 2n ** 28n],
      ['/5', 2n ** 27n],
      ['/6', 2n ** 26n],
      ['/7', 2n ** 25n],
      ['/8', 2n ** 24n],
      ['/9', 2n ** 23n],
      ['/10', 2n ** 22n],
      ['/11', 2n ** 21n],
      ['/12', 2n ** 20n],
      ['/13', 2n ** 19n],
      ['/14', 2n ** 18n],
      ['/15', 2n ** 17n],
      ['/16', 2n ** 16n],
      ['/17', 2n ** 15n],
      ['/18', 2n ** 14n],
      ['/19', 2n ** 13n],
      ['/20', 2n ** 12n],
      ['/21', 2n ** 11n],
      ['/22', 2n ** 10n],
      ['/23', 2n ** 9n],
      ['/24', 2n ** 8n],
      ['/25', 2n ** 7n],
      ['/26', 2n ** 6n],
      ['/27', 2n ** 5n],
      ['/28', 2n ** 4n],
      ['/29', 2n ** 3n],
      ['/30', 2n ** 2n],
      ['/31', 2n ** 1n],
      ['/32', 2n ** 0n]
    ])(
      'calculates the number of allocatable ip addresses [%s has %d ips]',
      (range: string, count: bigint) => {
        expect(cidr.ipv4.block('0.0.0.0' + range).allocatableIpCount).toBe(count)
      }
    )
  })
})
