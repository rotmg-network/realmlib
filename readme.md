# realmlib

A TypeScript networking library for **Realm of the Mad God**. It handles packet
framing, RC4 encryption, and binary read/write for the game's packets, so
clientless apps, MITM proxies, and packet sniffers do not need to reimplement
the protocol.

realmlib is updated for **game build 6.12.0.2.0**

## Install

Requires [Node.js 20.19+](https://nodejs.org/en/download/current/).

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

The main exports are available from the package root. Stable focused entry
points are also available as `realmlib/core`, `realmlib/protocol`,
`realmlib/packets`, `realmlib/models`, and `realmlib/data`.

| export                | purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| `PacketIO`            | event-based packet send/receive over a socket                 |
| `Reader` / `Writer`   | binary readers and writers used by packet classes             |
| `RC4`                 | the cipher and current `INCOMING_KEY` / `OUTGOING_KEY` values |
| `PacketType`          | string enum of every packet                                   |
| `DEFAULT_PACKET_MAP`  | immutable compatibility map for current one-byte wire ids     |
| `Packet` subclasses   | one class per packet (`packets/`)                             |
| models / enums / data | `StatType`, `PortalType`, `GameId`, `FameData`, …             |

## Using `PacketIO`

`PacketIO` sends and receives packets over a socket. It handles
encryption/decryption, packet framing, and parsing frames into packet classes.

The constructor takes an object with six optional properties:

- `socket` — a [`net.Socket`](https://nodejs.org/api/net.html#net_class_net_socket).
  Optional; you can `attach()` a socket later instead.
- `rc4` — `{ incomingKey, outgoingKey }`. Defaults to the current RotMG keys for
  a **clientless** application.
- `packetMap` — id ↔ type map. Defaults to `DEFAULT_PACKET_MAP`; most projects
  can leave it unset.
- `incomingDirection` — direction used to resolve ids read from the socket.
  Defaults to `incoming`.
- `outgoingDirection` — direction used to resolve types written to the socket.
  Defaults to `outgoing`.
- `maxOutgoingQueue` — maximum packets retained while the socket is
  backpressured.

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

// Reads and forwards server → client traffic.
const serverIO = new PacketIO({
  rc4: { incomingKey: INCOMING_KEY, outgoingKey: INCOMING_KEY },
  incomingDirection: 'incoming',
  outgoingDirection: 'incoming',
});

// Reads and forwards client → server traffic.
const clientIO = new PacketIO({
  rc4: { incomingKey: OUTGOING_KEY, outgoingKey: OUTGOING_KEY },
  incomingDirection: 'outgoing',
  outgoingDirection: 'outgoing',
});
```

The direction options are required for proxies because numeric ids are scoped
by protocol direction. For example, ids 215 and 217 each have different
client-to-server and server-to-client packet types. Swapping RC4 keys does not
change id resolution. A normal client can omit both options and use the
defaults shown by its traffic flow.

### The packet map

`packetMap` is **bidirectional** — it holds both `TYPE → id` and `id → TYPE`:

```typescript
import { createPacketMap, PacketType } from 'realmlib';

const packetMap = createPacketMap();
packetMap[PacketType.FAILURE] = 0;
packetMap[0] = PacketType.FAILURE;
```

`DEFAULT_PACKET_MAP` is frozen and contains the current one-byte wire mappings.
Use `createPacketMap()` when a mutable compatibility map is needed. The
canonical registry keeps direction-scoped identities separately, so a flat
numeric map cannot by itself represent both meanings of a colliding id.
`PacketIO` uses `incomingDirection` and `outgoingDirection` to resolve those
collisions. Missing entries mean packets cannot be sent or typed.

## Game models, enums, and data

realmlib also exports the game data structures and enums used by packets:
`StatType`, `PortalType`, `GameId`, `FailureCode`, `FameData`, object stat
data, and more. Import them from the package root alongside the packets.

## Debugging

- `hexdump(buffer)` — pretty-print raw packet bytes.
- `PacketIO` emits a **`rawPacket`** event for every frame.
- **`packetDiagnostic`** reports `unknown`, `unimplemented`, `parsed`,
  `parse-error`, `leftover`, and deliberately `opaque` bodies.
- Focused **`unknownPacket`**, **`packetParseError`**, **`packetLeftover`**, and
  **`packetOpaque`** events expose the corresponding diagnostic cases.

The [documentation index](docs/INDEX.md) distinguishes current contracts,
generated protocol status, dated evidence, and planning records.

## Development

Install the locked dependency graph and run every local quality gate:

```bash
npm ci
npm run check
```

`npm run check` runs TypeScript typechecking, ESLint, the offline packet tests,
Exalt packet-map reconciliation, the public API compatibility report, and
package publication validation. When an intentional public API change is made,
refresh the committed report with `npm run api:update` and review the diff in
`etc/realmlib.api.md`.

## Credits

The original library is by
[thomas-crane](https://github.com/thomas-crane/realmlib-net). This fork updates
the protocol for the current build. Packet structures were cross-checked against
[pyrelay](https://github.com/Maxi35/pyrelay) and
[RealmShark](https://github.com/X-com/RealmShark).

Realm of the Mad God is a trademark of its respective owners. This is an
independent, educational protocol implementation, not affiliated with or
endorsed by them.
