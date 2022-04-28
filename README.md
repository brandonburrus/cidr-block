# cidr-block

ipv4 and ipv6 address and cidr range utilities

## Installation

To install npm package, run the following in your project:

```bash
npm install cidr-block
```

or if you're using yarn instead of npm

```bash
yarn add cidr-block
```

The package is written completely in TypeScript and exports all of it's types automatically,
meaning you don't need to install any additional `@types` typings.

## Getting Started

Start by defining a cidr range

```typescript
import { ipv4 as ip } from 'cidr-block'

const myCidr = ip.cidr('10.0.0.0/24')
```

To get the next logical cidr block

```typescript
console.log(myCidr.nextBlock().toString()) // 10.0.1.0/24
```

All `cidr-block` functions and methods are immutable, meaning a new instance will always be
returned instead of trying to modify the current value.

Once you have a cidr, you have access to all of it's related utilities:

```typescript
myCidr.netmask // 255.255.255.0
myCidr.firstUsableIp // 10.0.0.0 (remember that methods act immutable, so this is still at 10.0.0.0)
myCidr.lastUsableIp // 10.0.0.254
myCidr.includes(ip.address('10.0.0.128')) // true
```

## Documentation and API Reference

The full documentation and API reference can be found at https://cidr-block.com

## FAQ

Q: Why are the imports in all the example code like that?

A: The imports in all example code are formatted as the following:

```typescript
// esm
import { ipv4 as ip } from 'cidr-block'
// commonjs
const { ipv4: ip } = require('cidr-block')
```

While you don't have to follow this convention, the API is design like this on purpose to help speed
up a refactoring of ipv4 to ipv6, as you would only need to change the number on the import.
