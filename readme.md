# realmlib

A TypeScript networking library for **Realm of the Mad God**. It handles packet
framing, RC4 encryption, and binary read/write for the game's packets, so
clientless apps, MITM proxies, and packet sniffers do not need to reimplement
the protocol.

realmlib is updated for **game build 6.11**

## Install

Requires [Node.js 16+](https://nodejs.org/en/download/current/).

```bash
git clone https://github.com/rotmg-network/realmlib.git
cd realmlib
npm install
npm run build      # compiles to lib/
```

The build writes compiled files to `lib/`. To use it from another local
project, add it as a file dependency:

```json
{ "dependencies": { "realmlib": "file:../realmlib" } }
```

## Overview

realmlib is a **library**, not a standalone app. Use it when you need to read,
write, or inspect RotMG packets, for example in:

- clientless clients (e.g. [headless-client](https://github.com/rotmg-network/headless-client), nrelay)
- MITM proxies (KRelay / JRelay style)
- packet sniffers and analysers

The main exports are available from the package root:

| export | purpose |
|--------|---------|
| `PacketIO` | event-based packet send/receive over a socket |
| `Reader` / `Writer` | binary readers and writers used by packet classes |
| `RC4` | the cipher and current `INCOMING_KEY` / `OUTGOING_KEY` values |
| `PacketType` | string enum of every packet |
| `DEFAULT_PACKET_MAP` | bidirectional id ↔ type map for the current build |
| `Packet` subclasses | one class per packet (`packets/`) |
| models / enums / data | `StatType`, `PortalType`, `GameId`, `FameData`, … |

## Using `PacketIO`

`PacketIO` sends and receives packets over a socket. It handles
encryption/decryption, packet framing, and parsing frames into packet classes.

The constructor takes an object with three optional properties:

- `socket` — a [`net.Socket`](https://nodejs.org/api/net.html#net_class_net_socket).
  Optional; you can `attach()` a socket later instead.
- `rc4` — `{ incomingKey, outgoingKey }`. Defaults to the current RotMG keys for
  a **clientless** application.
- `packetMap` — id ↔ type map. Defaults to `DEFAULT_PACKET_MAP`; most projects
  can leave it unset.

```typescript
import { PacketIO, PacketType, UpdatePacket } from 'realmlib';

const io = new PacketIO({ socket });

// Subscribing to a type is what makes PacketIO parse it.
io.on(PacketType.UPDATE, (update: UpdatePacket) => {
  io.send(buildUpdateAck(update));
});
```

### RC4 configuration for proxies

The default keys are for a clientless client. For a **MITM proxy**, configure
each side with the key for the traffic it reads and writes:

```typescript
import { PacketIO, INCOMING_KEY, OUTGOING_KEY } from 'realmlib';

// listens to server → client traffic
const serverIO = new PacketIO({ rc4: { incomingKey: INCOMING_KEY, outgoingKey: INCOMING_KEY } });

// listens to client → server traffic
const clientIO = new PacketIO({ rc4: { incomingKey: OUTGOING_KEY, outgoingKey: OUTGOING_KEY } });
```

### The packet map

`packetMap` is **bidirectional** — it holds both `TYPE → id` and `id → TYPE`:

```typescript
import { PacketMap, PacketType } from 'realmlib';

const packetMap: PacketMap = {
  FAILURE: 0,
  0: PacketType.FAILURE,
};
```

It should cover every member of the [`PacketType` enum](src/packet-type.ts).
`DEFAULT_PACKET_MAP` already does. Missing entries mean those packets cannot be
sent, and matching incoming packets cannot be parsed. A proxy will log them; a
client app may disconnect.

## Game models, enums, and data

realmlib also exports the game data structures and enums used by packets:
`StatType`, `PortalType`, `GameId`, `FailureCode`, `FameData`, object stat
data, and more. Import them from the package root alongside the packets.

## Debugging

- `hexdump(buffer)` — pretty-print raw packet bytes.
- `PacketIO` emits a **`rawPacket`** event for every frame, and an
  **`unknownPacket`** event for ids not in the map. These are useful for
  sniffing traffic or checking what changed after a game update.

## Credits

The original library is by
[thomas-crane](https://github.com/thomas-crane/realmlib-net). This fork updates
the protocol for the current build. Packet structures were cross-checked against
[pyrelay](https://github.com/Maxi35/pyrelay) and
[RealmShark](https://github.com/X-com/RealmShark).

Realm of the Mad God is a trademark of its respective owners. This is an
independent, educational protocol implementation, not affiliated with or
endorsed by them.
