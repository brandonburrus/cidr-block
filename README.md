IPv4 and IPv6 address and CIDR range utilities for JavaScript and TypeScript.

## Installation

```bash
npm install cidr-block
```

## Features

- Full IPv4 and IPv6 address support
- CIDR block creation and manipulation
- Address validation and parsing
- Network calculations (netmask, address count, usable addresses)
- Subnetting operations
- Address type detection (private, loopback, multicast, etc.)
- Full TypeScript support with comprehensive type definitions
- Zero dependencies
- Works with ESM and CommonJS

## Quick Start

```typescript
import { ipv4, ipv6 } from 'cidr-block';

// Create and work with IPv4 addresses
const addr = ipv4.address('192.168.1.1');
console.log(addr.isPrivateAddress()); // true

// Create and work with CIDR blocks
const cidr = ipv4.cidr('10.0.0.0/16');
console.log(cidr.addressCount()); // 65536

// IPv6 works the same way
const v6addr = ipv6.address('2001:db8::1');
console.log(v6addr.toString()); // "2001:db8::1"
```

## API Reference

Full documentation can be found at [cidr-block.com](https://cidr-block.com).

### IPv4

#### Creating Addresses

```typescript
import { ipv4 } from 'cidr-block';

// From string
const addr1 = ipv4.address('192.168.1.1');

// From number
const addr2 = ipv4.address(3232235777);

// From octet array
const addr3 = ipv4.address([192, 168, 1, 1]);
```

#### Address Validation

```typescript
import { ipv4 } from 'cidr-block';

ipv4.isValidAddress('192.168.1.1');     // true
ipv4.isValidAddress('256.1.1.1');       // false
ipv4.isValidAddress([10, 0, 0, 1]);     // true
ipv4.isValidAddress(4294967295);        // true (255.255.255.255)
ipv4.isValidAddress(4294967296);        // false (exceeds max)
```

#### Address Conversion

```typescript
import { ipv4 } from 'cidr-block';

const addr = ipv4.address('192.168.1.1');

addr.toString();       // "192.168.1.1"
addr.toNumber();       // 3232235777
addr.octets();         // [192, 168, 1, 1]
addr.toBinaryString(); // "11000000.10101000.00000001.00000001"
```

#### Address Type Detection

```typescript
import { ipv4 } from 'cidr-block';

// Private addresses (RFC 1918)
ipv4.address('10.0.0.1').isPrivateAddress();      // true
ipv4.address('172.16.0.1').isPrivateAddress();    // true
ipv4.address('192.168.0.1').isPrivateAddress();   // true
ipv4.address('8.8.8.8').isPrivateAddress();       // false

// Loopback addresses
ipv4.address('127.0.0.1').isLoopbackAddress();    // true
ipv4.address('127.255.255.255').isLoopbackAddress(); // true

// Link-local addresses
ipv4.address('169.254.1.1').isLocalLinkAddress(); // true

// Multicast addresses
ipv4.address('224.0.0.1').isMulticastAddress();   // true
ipv4.address('239.255.255.255').isMulticastAddress(); // true
```

#### Address Comparison

```typescript
import { ipv4 } from 'cidr-block';

const addr1 = ipv4.address('192.168.1.1');
const addr2 = ipv4.address('192.168.1.2');

addr1.equals('192.168.1.1');           // true
addr1.equals(addr2);                   // false
addr1.isLessThan(addr2);               // true
addr1.isGreaterThan(addr2);            // false
addr1.isLessThanOrEqual(addr2);        // true
addr1.isGreaterThanOrEqual(addr2);     // false
```

#### Address Navigation

```typescript
import { ipv4 } from 'cidr-block';

const addr = ipv4.address('192.168.1.100');

addr.hasNextAddress();       // true
addr.nextAddress()?.toString();    // "192.168.1.101"

addr.hasPreviousAddress();   // true
addr.previousAddress()?.toString(); // "192.168.1.99"

// Edge cases
const maxAddr = ipv4.address('255.255.255.255');
maxAddr.hasNextAddress();    // false
maxAddr.nextAddress();       // undefined

const minAddr = ipv4.address('0.0.0.0');
minAddr.hasPreviousAddress(); // false
minAddr.previousAddress();    // undefined
```

#### Creating CIDR Blocks

```typescript
import { ipv4 } from 'cidr-block';

// From string
const cidr1 = ipv4.cidr('192.168.0.0/24');

// From object
const cidr2 = ipv4.cidr({ address: '192.168.0.0', range: 24 });

// From tuple
const cidr3 = ipv4.cidr(['192.168.0.0', 24]);

// Mixed formats work too
const cidr4 = ipv4.cidr({ address: [192, 168, 0, 0], range: 24 });
```

#### CIDR Validation

```typescript
import { ipv4 } from 'cidr-block';

ipv4.isValidCIDR('192.168.0.0/24');   // true
ipv4.isValidCIDR('192.168.0.0/33');   // false (range exceeds 32)
ipv4.isValidCIDR('256.0.0.0/24');     // false (invalid address)
ipv4.isValidCIDR(['10.0.0.0', 8]);    // true
```

#### CIDR Properties

```typescript
import { ipv4 } from 'cidr-block';

const cidr = ipv4.cidr('192.168.0.0/24');

cidr.toString();                  // "192.168.0.0/24"
cidr.baseAddress().toString();    // "192.168.0.0"
cidr.range();                     // 24
cidr.netmask().toString();        // "255.255.255.0"
cidr.addressCount();              // 256
cidr.rangeParts();                // [Ipv4Address, 24]
```

#### Usable Addresses

```typescript
import { ipv4 } from 'cidr-block';

const cidr = ipv4.cidr('192.168.1.0/24');

// First usable (excludes network address)
cidr.getFirstUsableAddress()?.toString(); // "192.168.1.1"

// Last usable (excludes broadcast address)
cidr.getLastUsableAddress()?.toString();  // "192.168.1.254"

// For /32, there are no usable addresses
const hostCidr = ipv4.cidr('192.168.1.1/32');
hostCidr.getFirstUsableAddress(); // undefined
hostCidr.getLastUsableAddress();  // undefined
```

#### Iterating Addresses

```typescript
import { ipv4 } from 'cidr-block';

const cidr = ipv4.cidr('192.168.1.0/30');

// Using the generator
for (const addr of cidr.addresses()) {
  console.log(addr.toString());
}
// Output:
// 192.168.1.0
// 192.168.1.1
// 192.168.1.2
// 192.168.1.3

// Convert to array
const allAddresses = [...cidr.addresses()];
console.log(allAddresses.length); // 4
```

#### Address Containment

```typescript
import { ipv4 } from 'cidr-block';

const cidr = ipv4.cidr('192.168.0.0/24');

cidr.includes(ipv4.address('192.168.0.100')); // true
cidr.includes(ipv4.address('192.168.1.1'));   // false
cidr.includes(ipv4.address('192.168.0.0'));   // true
cidr.includes(ipv4.address('192.168.0.255')); // true
```

#### CIDR Overlap Detection

```typescript
import { ipv4 } from 'cidr-block';

const cidr1 = ipv4.cidr('192.168.0.0/24');
const cidr2 = ipv4.cidr('192.168.0.128/25');
const cidr3 = ipv4.cidr('192.168.1.0/24');

cidr1.overlaps(cidr2); // true (cidr2 is a subnet of cidr1)
cidr1.overlaps(cidr3); // false (different networks)

// Also accepts string format
cidr1.overlaps('10.0.0.0/8'); // false
```

#### Subnetting

```typescript
import { ipv4 } from 'cidr-block';

const cidr = ipv4.cidr('192.168.0.0/24');

// Split into equal subnets
const subnets = cidr.subnet(26);
subnets.forEach(s => console.log(s.toString()));
// Output:
// 192.168.0.0/26
// 192.168.0.64/26
// 192.168.0.128/26
// 192.168.0.192/26

// Split into variable-sized subnets
const varSubnets = cidr.subnetBy([26, 27, 27, 26]);
varSubnets.forEach(s => console.log(s.toString()));
// Output:
// 192.168.0.0/26
// 192.168.0.64/27
// 192.168.0.96/27
// 192.168.0.128/26
```

#### CIDR Navigation

```typescript
import { ipv4 } from 'cidr-block';

const cidr = ipv4.cidr('192.168.0.0/24');

cidr.hasNextCIDR();                    // true
cidr.nextCIDR()?.toString();           // "192.168.1.0/24"

cidr.hasPreviousCIDR();                // true
cidr.previousCIDR()?.toString();       // "192.167.255.0/24"
```

### IPv6

#### Creating Addresses

```typescript
import { ipv6 } from 'cidr-block';

// From string (with :: compression)
const addr1 = ipv6.address('2001:db8::1');

// From full string
const addr2 = ipv6.address('2001:0db8:0000:0000:0000:0000:0000:0001');

// From BigInt
const addr3 = ipv6.address(42540766411282592856903984951653826561n);

// From hextets array
const addr4 = ipv6.address([0x2001, 0x0db8, 0, 0, 0, 0, 0, 1]);
```

#### Address Validation

```typescript
import { ipv6 } from 'cidr-block';

ipv6.isValidAddress('2001:db8::1');           // true
ipv6.isValidAddress('::1');                   // true
ipv6.isValidAddress('::');                    // true
ipv6.isValidAddress('::ffff:192.168.1.1');    // true (IPv4-mapped)
ipv6.isValidAddress('2001:db8::g');           // false (invalid hex)
ipv6.isValidAddress('2001:db8:::1');          // false (multiple ::)
```

#### Address Conversion

```typescript
import { ipv6 } from 'cidr-block';

const addr = ipv6.address('2001:db8::1');

addr.toString();     // "2001:db8::1" (compressed)
addr.toFullString(); // "2001:0db8:0000:0000:0000:0000:0000:0001"
addr.toBigInt();     // 42540766411282592856903984951653826561n
addr.hextets();      // [8193, 3512, 0, 0, 0, 0, 0, 1]
addr.toBinaryString(); // Binary representation with colons
```

#### Address Type Detection

```typescript
import { ipv6 } from 'cidr-block';

// Loopback
ipv6.address('::1').isLoopbackAddress();          // true

// Unspecified
ipv6.address('::').isUnspecifiedAddress();        // true

// Unique local (private equivalent)
ipv6.address('fc00::1').isUniqueLocalAddress();   // true
ipv6.address('fd00::1').isUniqueLocalAddress();   // true

// Link-local
ipv6.address('fe80::1').isLinkLocalAddress();     // true

// Multicast
ipv6.address('ff02::1').isMulticastAddress();     // true

// IPv4-mapped
ipv6.address('::ffff:192.168.1.1').isIPv4MappedAddress(); // true

// Documentation
ipv6.address('2001:db8::1').isDocumentationAddress(); // true
```

#### Address Comparison

```typescript
import { ipv6 } from 'cidr-block';

const addr1 = ipv6.address('2001:db8::1');
const addr2 = ipv6.address('2001:db8::2');

addr1.equals('2001:db8::1');           // true
addr1.equals(addr2);                   // false
addr1.isLessThan(addr2);               // true
addr1.isGreaterThan(addr2);            // false
addr1.isLessThanOrEqual(addr2);        // true
addr1.isGreaterThanOrEqual(addr2);     // false
```

#### Address Navigation

```typescript
import { ipv6 } from 'cidr-block';

const addr = ipv6.address('2001:db8::1');

addr.hasNextAddress();                // true
addr.nextAddress()?.toString();       // "2001:db8::2"

addr.hasPreviousAddress();            // true
addr.previousAddress()?.toString();   // "2001:db8::"
```

#### Creating CIDR Blocks

```typescript
import { ipv6 } from 'cidr-block';

// From string
const cidr1 = ipv6.cidr('2001:db8::/32');

// From object
const cidr2 = ipv6.cidr({ address: '2001:db8::', range: 32 });

// From tuple
const cidr3 = ipv6.cidr(['2001:db8::', 32]);
```

#### CIDR Validation

```typescript
import { ipv6 } from 'cidr-block';

ipv6.isValidCIDR('2001:db8::/32');    // true
ipv6.isValidCIDR('2001:db8::/129');   // false (range exceeds 128)
ipv6.isValidCIDR(['::1', 128]);       // true
```

#### CIDR Properties

```typescript
import { ipv6 } from 'cidr-block';

const cidr = ipv6.cidr('2001:db8::/32');

cidr.toString();                  // "2001:db8::/32"
cidr.baseAddress().toString();    // "2001:db8::"
cidr.range();                     // 32
cidr.netmask().toString();        // "ffff:ffff::"
cidr.addressCount();              // 79228162514264337593543950336n (BigInt)
```

#### Usable Addresses

```typescript
import { ipv6 } from 'cidr-block';

const cidr = ipv6.cidr('2001:db8::/126');

cidr.getFirstUsableAddress()?.toString(); // "2001:db8::1"
cidr.getLastUsableAddress()?.toString();  // "2001:db8::2"

// For /128, there are no usable addresses
const hostCidr = ipv6.cidr('2001:db8::1/128');
hostCidr.getFirstUsableAddress(); // undefined
hostCidr.getLastUsableAddress();  // undefined
```

#### Iterating Addresses

```typescript
import { ipv6 } from 'cidr-block';

const cidr = ipv6.cidr('2001:db8::/126');

for (const addr of cidr.addresses()) {
  console.log(addr.toString());
}
// Output:
// 2001:db8::
// 2001:db8::1
// 2001:db8::2
// 2001:db8::3

// With limit (useful for large ranges)
for (const addr of cidr.addresses(2n)) {
  console.log(addr.toString());
}
// Output:
// 2001:db8::
// 2001:db8::1
```

#### Address Containment and Overlap

```typescript
import { ipv6 } from 'cidr-block';

const cidr = ipv6.cidr('2001:db8::/32');

cidr.includes(ipv6.address('2001:db8::1'));      // true
cidr.includes(ipv6.address('2001:db9::1'));      // false

const cidr2 = ipv6.cidr('2001:db8:1::/48');
cidr.overlaps(cidr2);  // true
```

#### Subnetting

```typescript
import { ipv6 } from 'cidr-block';

const cidr = ipv6.cidr('2001:db8::/32');

// Split into /34 subnets
const subnets = cidr.subnet(34);
subnets.forEach(s => console.log(s.toString()));
// Output:
// 2001:db8::/34
// 2001:db8:4000::/34
// 2001:db8:8000::/34
// 2001:db8:c000::/34

// Variable-sized subnets
const varSubnets = cidr.subnetBy([34, 34, 33]);
varSubnets.forEach(s => console.log(s.toString()));
```

#### CIDR Navigation

```typescript
import { ipv6 } from 'cidr-block';

const cidr = ipv6.cidr('2001:db8::/32');

cidr.hasNextCIDR();                  // true
cidr.nextCIDR()?.toString();         // "2001:db9::/32"

cidr.hasPreviousCIDR();              // true
cidr.previousCIDR()?.toString();     // "2001:db7::/32"
```

### Error Handling

```typescript
import {
  ipv4,
  ipv6,
  InvalidIpv4AddressError,
  InvalidIpv4CidrError,
  InvalidIpv4CidrRangeError,
  InvalidIpv6AddressError,
  InvalidIpv6CidrError,
  InvalidIpv6CidrRangeError
} from 'cidr-block';

// Invalid address throws error
try {
  ipv4.address('256.0.0.1');
} catch (e) {
  if (e instanceof InvalidIpv4AddressError) {
    console.log(e.message); // "256.0.0.1 is not a valid IPv4 address"
  }
}

// Invalid CIDR throws error
try {
  ipv4.cidr('192.168.0.0/33');
} catch (e) {
  if (e instanceof InvalidIpv4CidrError) {
    console.log(e.message); // "192.168.0.0/33 is not a valid IPv4 CIDR range"
  }
}

// Invalid subnet operation throws error
try {
  const cidr = ipv4.cidr('192.168.0.0/24');
  cidr.subnet(20); // Can't create larger subnets
} catch (e) {
  if (e instanceof InvalidIpv4CidrRangeError) {
    console.log('Invalid subnet range');
  }
}

// Use validation to avoid exceptions
if (ipv4.isValidAddress(userInput)) {
  const addr = ipv4.address(userInput);
  // Safe to use
}
```

### Constants

```typescript
import { ipv4, ipv6 } from 'cidr-block';

// IPv4 constants
ipv4.MAX_SIZE;   // 0xffffffff (4294967295)
ipv4.MIN_SIZE;   // 0x00000000
ipv4.MAX_RANGE;  // 32
ipv4.MIN_RANGE;  // 0

// IPv6 constants
ipv6.MAX_SIZE;   // (1n << 128n) - 1n
ipv6.MIN_SIZE;   // 0n
ipv6.MAX_RANGE;  // 128
ipv6.MIN_RANGE;  // 0
```

### Type Definitions

```typescript
import type {
  // IPv4 types
  Ipv4AddressLiteral,  // string | number | number[]
  Ipv4AddressString,   // "${number}.${number}.${number}.${number}"
  Ipv4AddressOctets,   // [number, number, number, number]
  Ipv4CidrLiteral,     // string | { address, range } | [address, range]
  Ipv4CidrString,      // "${number}.${number}.${number}.${number}/${number}"

  // IPv6 types
  Ipv6AddressLiteral,  // string | bigint | number[]
  Ipv6AddressHextets,  // [number, number, number, number, number, number, number, number]
  Ipv6CidrLiteral,     // string | { address, range } | [address, range]
} from 'cidr-block';
```

## Common Use Cases

### Checking if an IP is in a Private Network

```typescript
import { ipv4 } from 'cidr-block';

function isInternalIP(ip: string): boolean {
  if (!ipv4.isValidAddress(ip)) return false;
  const addr = ipv4.address(ip);
  return addr.isPrivateAddress() || addr.isLoopbackAddress();
}

isInternalIP('192.168.1.1');  // true
isInternalIP('10.0.0.1');     // true
isInternalIP('8.8.8.8');      // false
```

### Allocating Subnets from a Pool

```typescript
import { ipv4 } from 'cidr-block';

function allocateSubnets(poolCidr: string, subnetSize: number, count: number) {
  const pool = ipv4.cidr(poolCidr);
  const subnets = pool.subnet(subnetSize);
  return subnets.slice(0, count);
}

const allocated = allocateSubnets('10.0.0.0/16', 24, 3);
allocated.forEach(s => console.log(s.toString()));
// 10.0.0.0/24
// 10.0.1.0/24
// 10.0.2.0/24
```

### Checking for CIDR Conflicts

```typescript
import { ipv4, Ipv4Cidr } from 'cidr-block';

function findConflicts(newCidr: string, existing: string[]): string[] {
  const cidr = ipv4.cidr(newCidr);
  return existing.filter(e => cidr.overlaps(e));
}

const existingRanges = ['10.0.0.0/24', '10.0.1.0/24', '192.168.0.0/16'];
const conflicts = findConflicts('10.0.0.0/16', existingRanges);
// ['10.0.0.0/24', '10.0.1.0/24']
```

### Generating IP Addresses in a Range

```typescript
import { ipv4 } from 'cidr-block';

function getUsableIPs(cidrStr: string): string[] {
  const cidr = ipv4.cidr(cidrStr);
  const ips: string[] = [];

  for (const addr of cidr.addresses()) {
    // Skip network and broadcast addresses for practical use
    if (addr.equals(cidr.baseAddress())) continue;

    const lastOctet = addr.octets()[3];
    if (lastOctet === 255) continue; // Skip broadcast

    ips.push(addr.toString());
  }

  return ips;
}

const usable = getUsableIPs('192.168.1.0/29');
// ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5', '192.168.1.6']
```
