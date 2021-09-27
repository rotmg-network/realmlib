## realmlib 
### Networking library and data framework for Realm of the Mad God  

![](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white&logoWidth=18)
![](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white&logoWidth=18)
![](https://img.shields.io/badge/game%20version-2.0.2.0.0-007ACC?style=flat-square&logoWidth=15&logo=applearcade)  
 
  
realmlib provides you with an interface for interacting with the game at the network level, meaning it can be used for creating bots, proxy servers, game clients or anything else you wish. 

#### Some example features:
* The [`PacketIO`](https://github.com/abrn/realmlib/blob/master/src/packetio.ts#L48) class for receiving, sending and ciphering game packets
* Built-in game packets and the structures for reading/writing them


### Table of Contents

+ [Requirements](#requirements)
+ [Installing](#installing)
+ [Usage](#usage)
+ [Documentation](#documentation)
+ [Credits](#credits)

## Requirements  

* Node.js 12+ is required for using the library. You can [download the latest version here.](https://nodejs.org/en/download/)
* TypeScript 4.x compiler for development only, check out [releases](https://github.com/abrn/realmlib/releases) for compiled JavaScript versions  

## Installing  

 You can download compiled JavaScript versions [here](https://github.com/abrn/realmlib/releases) or to install manually:  
 ```bash
git clone https://github.com/abrn/realmlib.git
cd realmlib && tsc
 ```
The `build` folder will now include the working Node.js module

## Usage

```bash
git clone https://github.com/abrn/realmlib.git
cd realmlib
```

Install the TypeScript compiler then compile the source:

```bash
npm install -g typescript
tsc
```

Your compiled code will be in the `lib` folder ready to use in a NodeJS project.


The realmlib networking module cannot be used on its own. It is designed to be used as a building block for other RotMG projects that require an implementation of the RotMG networking protocol such as:

+ MITM proxies (such as KRelay or JRelay)
+ Clientless applications (such as nrelay)

#### Using the `PacketIO` class

The `PacketIO` class provides an event based way of sending and receiving RotMG packets, encrypting/decrypting them and then turning them into useable code structures.

When a new `PacketIO` instance is constructed, it expects an object with 3 optional properties:

+ `socket` - An instance of [`net.Socket`](https://nodejs.org/api/net.html#net_class_net_socket)
+ `rc4` - An object which contains an incoming RC4 key and an outgoing RC4 key
+ `packetMap` - An object which maps packet types to their ID integer

By default:

+ `socket` will be initialised to `undefined`
+ `rc4` will be initialised to an object containing the current RotMG incoming and outgoing RC4 keys
+ `packetMap` will be initialised to a basic updated version of the packets

If a `socket` is provided, the `PacketIO` instance will be immediately attached to that socket. A `PacketIO` instance can always be attached to a socket after constructed via the `attach()` method, so providing a socket to the constructor is not necessary.

The default values which are used for the `rc4` property are set up for a clientless application. However, they are configurable to allow the `PacketIO` class to be used for other applications. For example, when building a MITM proxy, the `PacketIO` instance which listens to traffic coming from the server should use the **incoming** key for both the incoming and outgoing key configurations. The `PacketIO` instance which is listening to traffic coming from the client should use the **outgoing** key for both the incoming and outgoing key configurations.

```typescript
import { PacketIO, INCOMING_KEY, OUTGOING_KEY } from './realmlib';

const serverIO = new PacketIO({
  rc4: {
    incomingKey: INCOMING_KEY,
    outgoingKey: INCOMING_KEY,
  }
});

const clientIO = new PacketIO({
  rc4: {
    incomingKey: OUTGOING_KEY,
    outgoingKey: OUTGOING_KEY,
  }
})
```

The `packetMap` property is the most important one, as it allows the `PacketIO` instance to resolve packet ids to their types. This is necessary in order to create the right instances of packets when they are received, and to use the right ID when sending packets.

The `packetMap` object is expected to **bidirectional**. That is, if the map contains the property

```typescript
import { PacketMap, PacketType } from './realmlib';

const packetMap: PacketMap = {
  FAILURE: 0,
};
```

it should also contain the reverse of that property:

```typescript
const packetMap: PacketMap = {
  FAILURE: 0,
  0: PacketType.FAILURE,
};
```

Ideally, the `packetMap` should contain an entry for each property present in the [`PacketType` enum](src/packet-type.ts). This will ensure that the `PacketIO` instance knows how to create any type of packet which it may receive. If some of the packet types are missing, the `PacketIO` will be unable to send those packets, and will not be able to create an instance of the packet when one is received. It will display some useful information about the unknown packet for proxies, but may cause a client application to disconnect.

#### Using in-game models and enums

realmlib also has classes that contain useful game data structures and enums for data that map to numbers when used in the network protocol


## Credits

The credits for the original library go to [github.com/thomas-crane/realmlib-net](https://github.com/thomas-crane/realmlib-net). It has been heavily modified since to stay compatible with the game meaning this is no longer a fork.