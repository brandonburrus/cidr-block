# cidr-block

npm package for calculating CIDR range blocks

## WARNING

This package is still in _very_ early stages and should **NOT** be used in production code!

## Installation

To install npm package, run the following in your project:

```bash
npm install cidr-block
```

or if you're using yarn instead of npm

```bash
yarn add cidr-block
```

## Getting Started

Start by defining a cidr range

```typescript
import * as cidr from 'cidr-block'

const myRange = cidr.ipv4.block('192.0.0.0/32')
```

To get the next logical cidr block

```typescript
console.log(myRange.nextBlock()) // 192.0.0.1/32
```

All cidr methods are immutable, meaning a new instance of the cidr is created every time a method is called on it.
