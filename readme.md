# realmlib

A TypeScript networking library for **Realm of the Mad God**. It implements the
RotMG wire protocol — packet framing, RC4 encryption, and typed read/write for
every packet — so you can build clientless apps, MITM proxies, and packet
sniffers without reimplementing the protocol.

realmlib is reconciled to the **current game build (6.11)**: the packet id map,
`StatType` enum, and incoming packet structures are diffed against a known-good
client and covered by round-trip tests.

## Install

Requires [Node.js 16+](https://nodejs.org/en/download/current/).

```bash
git clone https://github.com/rotmg-network/realmlib.git
cd realmlib
npm install
npm run build      # compiles to lib/
```

The compiled output lands in `lib/`. To consume it from another local project,
add it as a file dependency:

```json
{ "dependencies": { "realmlib": "file:../realmlib" } }
```

## Overview

realmlib is a **building block**, not a standalone app. It's meant to power
projects that speak the RotMG protocol, such as:

- clientless clients (e.g. [headless-client](https://github.com/rotmg-network/headless-client), nrelay)
- MITM proxies (KRelay / JRelay style)
- packet sniffers and analysers

The core pieces, all exported from the package root:

| export | purpose |
|--------|---------|
| `PacketIO` | event-based send/receive over a socket, with RC4 + framing |
| `Reader` / `Writer` | typed binary cursors used by every packet's `read`/`write` |
| `RC4` | the cipher, with the current `INCOMING_KEY` / `OUTGOING_KEY` |
| `PacketType` | string enum of every packet |
| `DEFAULT_PACKET_MAP` | bidirectional id ↔ type map for the current build |
| `Packet` subclasses | one class per packet (`packets/`) |
| models / enums / data | `StatType`, `PortalType`, `GameId`, `FameData`, … |

## Using `PacketIO`

`PacketIO` gives you an event-based API for sending and receiving packets — it
encrypts/decrypts and turns raw bytes into typed packet instances.

The constructor takes an object with three optional properties:

- `socket` — a [`net.Socket`](https://nodejs.org/api/net.html#net_class_net_socket).
  Optional; you can `attach()` a socket later instead.
- `rc4` — `{ incomingKey, outgoingKey }`. Defaults to the current RotMG keys,
  set up for a **clientless** application.
- `packetMap` — id ↔ type map. Defaults to `DEFAULT_PACKET_MAP`, so you usually
  don't pass one.

```typescript
import { PacketIO, PacketType, UpdatePacket } from 'realmlib';

const io = new PacketIO({ socket });

// Subscribing to a type is what makes PacketIO parse it.
io.on(PacketType.UPDATE, (update: UpdatePacket) => {
  io.send(buildUpdateAck(update));
});
```

### RC4 configuration for proxies

The default keys suit a clientless client. For a **MITM proxy**, each direction
uses one key for both ends:

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

It should cover every member of the [`PacketType` enum](src/packet-type.ts);
`DEFAULT_PACKET_MAP` already does. Missing entries mean those packets can't be
sent, and an incoming one can't be instantiated — a proxy will log it, but a
client app may disconnect.

## Game models, enums, and data

realmlib ships the in-game data structures and enums that map to numbers on the
wire — `StatType`, `PortalType`, `GameId`, `FailureCode`, `FameData`, object
stat data, and more. Import them from the package root alongside the packets.

## Debugging

- `hexdump(buffer)` — pretty-print raw packet bytes.
- `PacketIO` emits a **`rawPacket`** event with every frame (and
  **`unknownPacket`** for ids not in the map), handy for sniffing and for
  discovering protocol drift.

## Credits

The original library is by
[thomas-crane](https://github.com/thomas-crane/realmlib-net); this fork hardens
it and reconciles the protocol to the current build. Packet structures were
cross-checked against [pyrelay](https://github.com/Maxi35/pyrelay) (current
Python client) and [RealmShark](https://github.com/X-com/RealmShark) (pcap
sniffer).

Realm of the Mad God is a trademark of its respective owners. This is an
independent, educational protocol implementation, not affiliated with or
endorsed by them.
