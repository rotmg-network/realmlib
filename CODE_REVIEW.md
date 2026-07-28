# RealmLib Code Review

**Review date:** 2026-07-28  
**Reviewed state:** the current working tree, including its uncommitted protocol-reconciliation changes  
**Current protocol snapshot:** Exalt 6.12.0.2.0

## Executive summary

RealmLib has a sound protocol-library core: packet metadata is centralized,
binary primitives enforce useful bounds, capture-backed tests verify exact wire
bytes, and the full release gate currently passes. The direction-aware packet
registry, optional-tail preservation, parse diagnostics, and conservative
treatment of unresolved protocol data are particularly strong.

The main architectural problem is that direction-aware registry data is
flattened back into a legacy bidirectional `PacketMap` before `PacketIO` and
the corpus analyzer use it. That makes the newly supported direction-colliding
ids 215 and 217 ambiguous in the advertised proxy workflow. There are also
several confirmed runtime defects outside the current test coverage:

- `NotificationPacket.toString()` recurses until the process throws;
- malformed compressed integers can wrap into plausible values;
- invalid or empty RC4 keys silently produce an ineffective cipher;
- `hexdump(data, 0)` never terminates;
- the public `PlayerData` type promises a complete object while the parser
  returns a partial object;
- the second eight-slot backpack bank is represented in `StatType` but silently
  discarded by the projection helpers;
- several read/write pairs accept or create states that cannot round-trip.

These findings do not contradict the green test suite. They identify inputs,
directions, state transitions, and public contracts that the current suite does
not exercise.

## Scope and validation

The review covered the complete repository layout and all production areas:

| Area | Scope reviewed |
| --- | ---: |
| TypeScript production source | 271 files / about 15,700 lines |
| Incoming packet source | 105 files |
| Outgoing packet source | 101 files |
| Data codecs/projection | 17 files |
| Tests and support files | 23 files / about 3,600 lines |
| Scripts | 2 corpus/protocol tools |
| Documentation | 6 evidence/planning documents plus the README |
| Package/release configuration | TypeScript, ESLint, Mocha, API Extractor, publint, CI, npm packaging |

Review methods included a full file inventory, targeted line-by-line review of
the framing/crypto/registry/data paths, systematic packet-family review, source
and test cross-reference scans, API/package inspection, and small runtime
reproductions for findings where behavior was not obvious from source alone.

Current validation snapshot:

- `npm run check`: passes;
- Mocha: 244 tests pass;
- protocol reconciliation: 209 extractor mappings, 208 local one-byte wire
  mappings, zero id/type conflicts, zero direction conflicts, and no extractor
  mappings missing locally;
- API Extractor and publint: pass;
- a separate manual test-source TypeScript check: passes today, although it is
  not part of `npm run check`;
- `npm audit --json`: zero known vulnerabilities;
- `npm pack --dry-run`: succeeds; 544 emitted package files, about 769 KiB
  unpacked.

The worktree already contained a large in-progress reconciliation before this
review. This report does not treat those edits as disposable and does not
recommend reverting them.

## How the project works

### Public API and packet metadata

[`src/index.ts`](src/index.ts) exports one broad CommonJS package-root API:
`PacketIO`, binary readers/writers, RC4, packet metadata, models, data codecs,
and every incoming/outgoing packet class.

[`src/packet-type.ts`](src/packet-type.ts) is the public string catalog.
[`src/packet-registry.ts`](src/packet-registry.ts) is the authoritative runtime
table for:

- logical packet type;
- numeric packet id, where one exists;
- incoming/outgoing/unknown direction;
- a factory for modeled packets.

Registry initialization creates type and direction-scoped indexes and rejects
duplicate types or duplicate `(direction, id)` pairs. That is the correct
identity model for the current protocol.

[`src/packet-map.ts`](src/packet-map.ts) derives the older compatibility
object. It contains both `type -> id` and `id -> type` entries. A single numeric
key cannot represent different incoming and outgoing meanings, so incoming
definitions currently win collisions.

### Receive path

```text
TCP bytes
  -> 4-byte big-endian total frame length
  -> 1-byte plaintext packet id
  -> RC4-decrypt packet body
  -> resolve id to PacketType
  -> create packet from registry factory
  -> packet.read(Reader)
  -> emit raw/unknown/parse/leftover diagnostics
  -> emit typed packet event
```

[`src/packetio.ts`](src/packetio.ts) handles fragmented and coalesced TCP input
by accumulating a header and then resizing its reader for the full frame. A
typed packet is only constructed when a typed or diagnostic listener makes
parsing useful. Parsed packets with unread bytes are still dispatched, while a
leftover diagnostic preserves evidence of protocol drift.

### Send path

```text
Packet object or raw id/body
  -> resolve PacketType to id
  -> bounded outgoing queue
  -> packet.write(Writer)
  -> 4-byte length + 1-byte id + body
  -> RC4-encrypt body
  -> socket.write with drain/backpressure handling
```

The queue returns explicit accepted/sent/queued/invalid status and has a
configurable size limit. RC4 state is continuous across frames for a connection
and resets on connect.

### Packet and data model

Most packet classes are mutable wire DTOs with:

- a fixed `PacketType`;
- zero/empty constructor defaults;
- symmetric `read(Reader)` and `write(Writer)` methods;
- optional convenience builders or compatibility aliases.

Nested codecs under [`src/data`](src/data) model structures reused by packets.
The important object-update chain is:

```text
UPDATE
  -> ObjectData
  -> ObjectStatusData
  -> StatData
  -> processStatData()
  -> consumer-facing PlayerData projection

NEWTICK
  -> ObjectStatusData deltas
  -> StatData
  -> merge into existing player projection
```

`StatData` decides between a string and compressed integer from `StatType`; the
wire value itself has no type tag.

### Evidence, tests, and release gates

- capture fixtures assert parsing and byte-exact reserialization;
- primitive tests cover reader bounds and writer ranges;
- packet reconciliation compares the library with
  [`protocol/exalt-current.json`](protocol/exalt-current.json);
- [`scripts/analyze-log-corpus.cjs`](scripts/analyze-log-corpus.cjs) replays
  external packet logs;
- API Extractor snapshots the public TypeScript surface in
  [`etc/realmlib.api.md`](etc/realmlib.api.md);
- publint validates the emitted npm package;
- CI runs on supported Node 20 and Node 22 releases.

## What is already strong

1. **Protocol ownership is in the library.** Packet ids, directions, structures,
   aliases, and factories are centralized instead of being delegated to
   consumers.
2. **Registry identity is correct.** Duplicate protection is based on
   `(direction, id)`, not just numeric id.
3. **Wire preservation is evidence-driven.** `MapInfoPacket.hasRealmScores` and
   `UpdatePacket.hasTrailingByte` preserve absent optional tails instead of
   inventing bytes.
4. **Unknown semantics are generally preserved.** Raw fields and conservative
   names are preferable to guesses unsupported by captures.
5. **Binary safety is good on ordinary paths.** Fixed reads check remaining
   bytes, writer methods validate scalar ranges, and collection readers use
   conservative count/remaining-byte validation. All 29 reviewed collection
   validation sites use appropriate minimum item sizes.
6. **Diagnostics are useful.** Unknown, factory-less, parse-error, parsed, and
   leftover states are distinguishable; typed packets with leftovers remain
   usable.
7. **Backpressure is explicit.** Outgoing data is serialized through a bounded
   queue instead of being written concurrently.
8. **Tests use real protocol evidence.** Exact body round trips are much more
   valuable than constructor-only tests for this library.
9. **Release gates are broad.** TypeScript, lint, tests, protocol reconciliation,
   API review, package validation, and two supported Node majors are all checked.
10. **Supply-chain surface is small.** The published library has no runtime
    dependencies and currently audits cleanly.

## Priority definitions

- **P0:** exploitable or destructive defect requiring immediate containment.
- **P1:** confirmed correctness, security, or public-contract defect to fix
  before the next release.
- **P2:** important robustness, compatibility, test, or maintainability work.
- **P3:** cleanup, clarity, performance, or longer-term design improvement.

No P0 finding was confirmed during this review.

## Accepted project policy

**Evidence:** [`HelloPacket.toString()`](src/packets/outgoing/hello-packet.ts)
prints `accessToken`, reconnect `key`, `platformToken`, `userToken`, and
`clientToken`. [`ChatHelloPacket.toString()`](src/packets/outgoing/chat-hello.ts)
prints the chat token and account id.

The project explicitly accepts this behavior: token and key values are intended
to remain visible in these `toString()` results. This review therefore does not
classify that exposure as a defect, recommend redaction, or include it in the
release blockers below. Consumers should still decide where those strings are
stored and who can read their logs.

## P1 findings

### P1.1 Direction-scoped ids are flattened into an ambiguous runtime map

**Evidence:** ids 215 and 217 each have different incoming and outgoing
definitions in [`src/packet-registry.ts`](src/packet-registry.ts).
[`src/packet-map.ts`](src/packet-map.ts) gives a numeric key only one value and
prefers incoming definitions. The receive and raw-send paths in
[`src/packetio.ts`](src/packetio.ts) resolve through that flattened value.

**Impact:**

- the documented client-to-server side of a MITM proxy can construct the wrong
  class for ids 215 and 217;
- `sendRaw()` can label an outgoing frame with an incoming type;
- new direction-aware registry work is correct but not preserved end-to-end.

**Recommendation:** make wire direction explicit in `PacketIOOptions`, and use
separate `incomingById`, `outgoingById`, and `idByType` maps internally. Keep
`DEFAULT_PACKET_MAP` as a deprecated compatibility view until the next major
release. Add integration fixtures for both directions of both reused ids.

### P1.2 Corpus replay ignores packet direction

**Evidence:** `parseCurrent()` in
[`scripts/analyze-log-corpus.cjs`](scripts/analyze-log-corpus.cjs) uses
`DEFAULT_PACKET_MAP[record.id]`, although each record has `record.dir`.

**Impact:** outgoing id-215/id-217 records can be parsed using incoming packet
factories. This weakens “all corpus records parse” and round-trip conclusions
for any corpus containing those frames.

**Recommendation:** resolve through `getPacketDefinitionById(id, direction)`,
with an explicit mapping from log directions such as `C->S` to `outgoing` and
`S->C` to `incoming`. Add a small synthetic log fixture that contains all four
direction-colliding packet forms, then rerun the full corpus before treating its
aggregate report as current.

### P1.3 `NotificationPacket.toString()` always recurses

**Evidence:** the method interpolates `${this}` inside its own implementation in
[`src/packets/incoming/notification-packet.ts`](src/packets/incoming/notification-packet.ts).
Calling it reproduces `RangeError: Maximum call stack size exceeded`.

**Impact:** logging a notification packet can crash the active operation and
potentially the process.

**Recommendation:** replace the recursive interpolation with a safe,
effect-aware representation and add a direct regression test.

### P1.4 Malformed compressed integers wrap into plausible values

**Evidence:** [`Reader.readCompressedInt()`](src/reader.ts) has no maximum
encoded length and continues using 32-bit bitwise shifts after the shift count
passes 31. Verified malformed examples include:

- `ff ff ff ff 7f` decoding as `1`;
- `80 80 80 80 80 00` consuming six bytes and decoding as `0`.

**Impact:** corrupted lengths, ids, or scalar values can be accepted as normal
data rather than producing a `PacketReadError`.

**Recommendation:** enforce the protocol maximum byte count, reject invalid
terminal high bits and non-canonical encodings, accumulate without 32-bit shift
wrap, and range-check the final signed int32. Test positive/negative boundaries,
overlong encodings, truncated continuation chains, and non-canonical forms.

### P1.5 Empty or malformed RC4 keys silently disable useful encryption

**Evidence:** [`src/crypto/rc4.ts`](src/crypto/rc4.ts) accepts empty buffers and
arbitrary hex strings. Invalid hex can decode to an empty buffer, after which
the key schedule indexes modulo zero. Verified empty-key ciphering leaves bytes
unchanged instead of throwing.

**Impact:** a configuration error can look like a working cipher object while
producing invalid protocol traffic and misleading diagnostics.

**Recommendation:** require a non-empty buffer or a non-empty, even-length,
fully hexadecimal string. Copy caller-owned buffers so later mutation cannot
alter reset behavior. Add standard RC4 known-answer vectors, invalid-key tests,
reset tests, and a buffer-mutation test. Remove the stale TSLint suppression.

### P1.6 `hexdump` accepts row widths that never terminate

**Evidence:** [`hexdump()`](src/debug.ts) increments its loop offset by the
caller-provided `bytesPerRow`. Zero never advances; a negative value advances
away from the end.

**Impact:** debugging malformed traffic with a bad option can hang the process.

**Recommendation:** require a positive integer, optionally cap it, and test
zero, negative, fractional, `NaN`, and a normal large width.

### P1.7 `processStatData()` violates the `PlayerData` contract

**Evidence:** [`src/data/parser.ts`](src/data/parser.ts) creates
`{} as PlayerData`, initializes only `inventory`, and applies observed stats.
Every property in [`src/models/player-data.ts`](src/models/player-data.ts) is
declared required. `processStatData([])` therefore returns an object with only
`inventory`, while consumers are told that fields such as `hp`, `name`,
`worldPos`, and `objectId` are present.

**Impact:** strict TypeScript consumers receive runtime `undefined` for values
typed as `number`, `boolean`, or `string`.

**Recommendation:** model stat processing as a patch:

```ts
type PlayerDataPatch = Partial<Omit<PlayerData, 'inventory'>> & {
  inventory?: Array<number | undefined>;
};
```

Alternatively, provide a real `createPlayerData()` initializer and make the
merge/mutation behavior explicit. Do not use a type assertion to manufacture a
complete public object.

### P1.8 The second backpack bank is silently discarded

**Evidence:** `StatType` defines `BACKPACK_8_STAT` through
`BACKPACK_15_STAT`, but `BACKPACK_SLOT_COUNT`, slot-range helpers, parser logic,
and tests cover only `BACKPACK_0_STAT` through `BACKPACK_7_STAT`. A reproduced
`BACKPACK_8_STAT` update does not enter `PlayerData.inventory`.

**Impact:** current-client inventory data can disappear from the consumer-facing
projection with no error.

**Recommendation:** first confirm whether these stats extend the flat backpack
or represent a separately exposed bank. Then model all 16 slots using one
authoritative range/helper and add boundary tests for slots 7, 8, and 15. If the
second bank is semantically separate, expose a separate property instead of
dropping it.

### P1.9 `ShowEffectPacket` has a non-serializable default color

**Evidence:** when the color flag is absent,
[`src/packets/incoming/show-effect-packet.ts`](src/packets/incoming/show-effect-packet.ts)
stores `4294967295`; if a caller later enables the flag, `writeInt32()` rejects
that unsigned value.

**Impact:** a successfully read packet can become impossible to write after a
reasonable flag mutation.

**Recommendation:** represent the sentinel consistently as signed `-1`, or use
unsigned color reads/writes consistently. Add a test that reads a no-color
packet, enables the color flag, and reserializes it.

## P2 findings

### P2.1 PacketIO lifecycle needs an explicit state machine

`PacketIO` tracks socket presence, destruction, backpressure, RC4 state, and an
outgoing queue through loosely coupled flags and handlers. It listens for
`data`, `connect`, and `drain`, but not a complete close/error lifecycle.
Sending during connection can advance RC4 before the connect handler resets it;
a closed blocked socket can retain queued packet objects; and a synchronous
`socket.write()` exception sits outside the serialization guard.

Model `detached`, `connecting`, `connected`, `backpressured`, and `closed`
states explicitly. Queue until connected, reset cipher state once per
connection epoch, clear retained data on close/detach, and guard the actual
write. Test connect, close, error, reconnect, attach/detach, backpressure, and
synchronous write failure.

### P2.2 Invalid mappings are rejected too late

`PacketIO.send()` checks whether a mapping is defined but not whether it is an
integer byte id. The broad compatibility `PacketMap` can contain bad custom
values, and the registry retains legacy `IP_ADDRESS = 1000`, which cannot fit
the one-byte frame id. A send can initially report acceptance and fail later.

Validate an integer range of 0–255 synchronously, exclude non-wire metadata from
active wire maps, and return `invalid` before enqueueing.

### P2.3 Notification effect 17 has an asymmetric optional tail

The reader accepts effect 17 with a message and no trailing short, but the
writer always emits `uiExtra`. A short-less body therefore gains two bytes on
round trip.

Add `hasUiExtra`, following the established optional-tail pattern, unless
capture evidence proves the short mandatory; in that case, make the reader
reject its absence.

### P2.4 Public notification variants include impossible effect values

`NotificationEffect.REALM_THRESHOLD = 1001` and `DUST = 1002`, while
`NotificationPacket` reads and writes the effect as a signed byte. These public
variants cannot be serialized by this codec.

Determine whether those values belong to another notification channel or
whether the field-width model is wrong. Until then, do not present them as
constructible `NotificationPacket` variants.

### P2.5 `PicPacket.write()` can create bodies its reader rejects

The reader consumes exactly `width * height * 4` RGBA bytes; the writer emits
whatever `bitmapData` contains without checking it. Validate positive integer
dimensions, an overflow-safe byte count, and exact bitmap length before
writing.

### P2.6 Deprecated packet aliases do not preserve factory behavior

`Unknown198Packet` and `Unknown226Packet` subclass renamed packet classes and
carry deprecated property accessors. Registry factories construct the renamed
base classes, so `createPacket(PacketType.UNKNOWN198)` and
`createPacket(PacketType.UNKNOWN226)` do not return instances of the deprecated
classes and lack their old accessors.

Put compatibility accessors on the canonical classes and use constructor/type
aliases, as done for `Unknown224Packet`, or document a deliberate breaking
change. Inventory all aliases and remove them together only in a planned major
release.

### P2.7 Tests execute without TypeScript checking

`tsconfig.json` includes only `src/**/*`, while `ts-node` uses
`transpileOnly`. The tests happen to pass a manual typecheck today, but future
test type errors will not fail `npm run check`.

Add `tsconfig.test.json` and a `typecheck:test` gate. Keep production emit rooted
at `src`.

### P2.8 Packet debug-string design is incoherent

`DataPacket` requires `toString()`, but inherited `Object.prototype.toString`
satisfies the structural interface; most packet/data classes therefore provide
no useful implementation. Existing implementations range from helpful, to
incorrect (`StatData` prints numeric zero for string stats), to dangerous
(notification recursion).

Remove `toString` from the codec contract or explicitly document that useful
output is optional. A centralized inspector or `toJSON` convention could make
output consistent without changing the accepted raw-token behavior. Fix
`StatData` to select `stringStatValue` for string stats and rename its “extra
byte” label because `statValueTwo` is a compressed integer.

### P2.9 Potion amount fields are dead or misleading

`PlayerData` exposes `potionOneAmount`, `potionTwoAmount`, and
`potionThreeAmount`, but the parser only fills corresponding potion types and
does not use `StatData.statValueTwo`. Verify the wire meaning with captures;
then populate the amount fields or make/remove them as unsupported. Do not infer
their semantics from the field position alone.

### P2.10 Character XML parsing is brittle

[`src/models/character-data.ts`](src/models/character-data.ts) uses regular
expressions for XML. It is sensitive to formatting/attribute variations, does
not robustly decode XML entities, and can turn malformed or unrecognized ids
into plausible zero values.

Use a small maintained XML parser, or explicitly scope the accepted format and
fail on malformed required fields. Test escaped entities, reordered elements,
quote styles, missing values, and malformed numbers.

### P2.11 Opaque tails can overstate decoding completeness

`VaultContentPacket` consumes every remaining byte into `unknownBytes`.
Preserving those bytes is correct, but a zero-leftover result then means only
“preserved,” not “semantically decoded.”

Represent it as an `opaqueTail` and distinguish preserved opaque payload from
fully modeled payload in diagnostics/corpus reporting. Prefer `Buffer` or
unsigned bytes to signed `number[]`.

### P2.12 Test coverage is broad but uneven

The 11-fixture capture file exercises only a small fraction of packet classes.
Textual cross-reference scans also show many incoming and outgoing serializers
without direct focused tests. Factory construction verifies registration, not
wire layout.

Add a table-driven codec contract suite for every registered factory:

- captured parse consumes all bytes;
- `read -> write` is byte-identical when preservation is promised;
- `write -> read` consumes the complete body;
- malformed/truncated fields and invalid counts reject;
- optional tails retain present/absent state;
- conditional packet objects reset inactive fields when instances are reused.

Prioritize authentication, direction-colliding proxy traffic, inventory,
trading, movement acknowledgements, and classes derived only from client
metadata.

### P2.13 Package licensing is unspecified

The package has no `license` field and the repository has no `LICENSE` or
`COPYING` file. This makes redistribution and contribution rights unclear.
Choose the intended license, add the canonical text, and declare it in
`package.json` before broader publication.

## P3 findings and cleanup

### P3.1 Split `PacketIO` by responsibility

At 567 lines, `PacketIO` combines:

- socket lifecycle;
- frame accumulation;
- RC4 epochs;
- outbound serialization and queueing;
- registry/factory resolution;
- typed/raw/diagnostic event dispatch.

A maintainable split is:

```text
src/io/
  frame-decoder.ts       incremental length/id/body framing
  frame-encoder.ts       header/body creation and cipher application
  packet-resolver.ts     direction-aware registry/factory use
  outgoing-queue.ts      limits, ordering, drain handling
  packetio-events.ts     typed event and diagnostic definitions
  packetio.ts            public facade and socket lifecycle
```

This makes fragmentation, encryption epochs, direction resolution, and
backpressure independently testable.

### P3.2 Split `NotificationPacket` into effect codecs

The 327-line class repeats a large effect switch across initialization, read,
and write paths. This invites drift and leaves stale conditional fields when an
instance is reused.

Keep the two-byte notification header in the packet and move supported effects
to small codecs or a discriminated payload table. Preserve unsupported effects
as raw data and add layouts only from capture/client evidence.

### P3.3 Replace the stat switch with a handler table

`processStatData()` is a large switch coupled to inventory range arithmetic and
a monolithic `PlayerData`. A typed `StatType -> patch handler` table plus
contiguous inventory-bank helpers would make omissions visible and simplify
boundary tests.

Split `PlayerData` into composed facets such as identity/location, combat,
inventory, account/guild, potion/quick-slot, and progression/exaltation. Keep a
compatibility aggregate type for consumers.

### P3.4 Split large packet helpers from wire DTOs

`PetUpgradeRequestPacket` combines raw fields, operation projection, builders,
codec logic, and debug output. Move operation builders/projections to a sibling
helper while keeping the packet class focused on the wire layout. Apply the
same rule only where a packet has real domain behavior; tiny DTOs do not need
deep inheritance.

### P3.5 Reorganize the flat packet surface carefully

One file per packet is readable, but more than 200 packet files are barrel
exported through one package root. Group source by stable feature families
(core gameplay, inventory/trade, pets, parties, missions, enchantments,
customization) and consider additive subpath exports:

```text
realmlib/core
realmlib/protocol
realmlib/packets
realmlib/models
realmlib/data
```

Retain root exports for compatibility. Do not force consumers into internal
file paths.

### P3.6 Split and deduplicate tests

`test/packet-recon.spec.ts` is about 1,109 lines and combines unrelated packet
families. Several suites duplicate `fromHex`, reader construction,
serialization, and round-trip helpers.

Create `test/support/codec.ts`, then split reconciliation tests by domain or
wire concern. Replace the direction-ambiguous
`DEFAULT_PACKET_MAP[fixture.id]` assertion in capture tests with a directional
registry lookup before adding outgoing 215/217 fixtures.

Add coverage reporting and thresholds for core framing, crypto, registry, and
data projection. Property/fuzz tests are especially useful for Reader/Writer
round trips and incremental frame decoding.

### P3.7 Type PacketIO events and errors

`PacketIO` extends an untyped `EventEmitter` and stores handlers with
`any[]`. Define a `PacketIOEventMap` and typed `on`, `once`, and `emit`
overloads. Use distinct error classes/codes for unknown type, known type without
a factory, invalid frame length, oversized frame, invalid mapping, read error,
and write error. A frame shorter than five bytes should not be labeled
`FRAME_TOO_LARGE`.

### P3.8 Freeze canonical registry exports

`readonly` fields are compile-time only. `PACKET_REGISTRY` and
`DEFAULT_PACKET_MAP` are mutable exported objects shared by default instances.
A consumer mutation can desynchronize public data from private lookup indexes.

Freeze canonical definitions and maps. Provide an explicit clone/builder for
custom mutable mappings.

### P3.9 Avoid unconditional payload copies

The incoming path copies a body before it knows whether raw, unknown, typed, or
diagnostic listeners need it. Defer `Buffer.from()` for known ignored packets.
Benchmark before and after because production captures contain millions of
frames.

### P3.10 Clarify protocol completeness

The protocol gate currently reports 10 mapped one-byte packets without
factories and 79 unmapped catalog names. These numbers need taxonomy:

- current wire packet, modeled;
- current wire packet, deliberately raw/factory-less;
- legacy/non-wire metadata;
- nested model/helper/native class, not a wire packet;
- unresolved research candidate.

Do not turn every catalog name into a packet class. The current factory-less
structures should remain explicit until framing/layout evidence exists,
especially ids 135, 136, 218, and 238. Likewise, retain conservative names for
unresolved stat ids 156–158.

### P3.11 Correct documentation drift

Current examples and claims have drifted:

- README says `PacketIO` has three optional properties but omits
  `maxOutgoingQueue`;
- README says the default map covers every `PacketType`, although id-less chat
  types and non-wire metadata exist;
- the proxy example implies key swapping is sufficient despite direction
  collisions;
- `scripts/analyze-log-corpus.cjs` prints a `.js` usage filename;
- the dated log-corpus executive table still labels already implemented
  INVRESULT flags, generic multishot fields, and leftover diagnostics as open
  P1 work;
- several packet comments contain stale ids, widths, units, or inventory-slot
  counts.

Add `docs/README.md` or `docs/INDEX.md` identifying authoritative current
documents versus dated/archival evidence. Generate protocol-completeness tables
from the registry where practical.

### P3.12 Improve API documentation rather than suppressing it

API Extractor protects shape compatibility, but configuration suppresses
release-tag, unresolved-link, and all TSDoc messages. The API report contains
about 1,877 undocumented markers.

Enable unresolved-link checks first, then missing-doc/release-tag warnings for
new or changed public APIs. Document stable entry points before attempting to
document every packet field. Mark provisional protocol semantics clearly.

### P3.13 Simplify the build gate

`npm run check` triggers separate clean builds for protocol, API, and package
checks. Build once in the aggregate command and let downstream gates consume
the exact same output, while retaining independently usable commands.

Add script linting/tests; the current lint glob excludes `.cjs`. Add a
packed-tarball installation and root `require()` smoke test, and optionally a
package-size/file-count guard.

### P3.14 Remove or justify unused configuration

- `typedoc` is installed but has no script/configuration: remove it or establish
  an intentional docs build.
- `resolveJsonModule` appears unused by production source: remove it if a clean
  typecheck confirms that.
- `.yarnclean` is stale in the npm/package-lock workflow: remove it if Yarn
  publication is no longer supported.
- normalize the API report line endings.

### P3.15 Standardize style incrementally

Formatting varies by age: two/four-space indentation, quote styles, spacing
such as `if(`, loose equality, region comments, and verbose hand-built debug
strings. Add a formatter and a check-only CI command, apply it in a standalone
mechanical commit, then tighten `no-explicit-any` in core code incrementally.
Avoid mixing whole-repository formatting with protocol changes.

### P3.16 Repository hygiene

Ignore `.DS_Store` repository-wide and remove the untracked root artifact.
Keep generated `lib/` and `temp/` ignored. Review package contents periodically;
544 emitted files are plausible for this API but deserve an install smoke test.

### P3.17 Small correctness/documentation fixes

- require integer indices in inventory helper functions;
- return a meaningful string for `GuildRank.NoRank`;
- rename `MapInfoPacket.unknownShort1`, which is encoded as `int32`;
- remove the hard-coded obsolete id from `ChatTokenPacket.toString()`;
- correct the internally inconsistent trade-slot count comment;
- verify whether `EnemyShootPacket.angleInc` is degrees or radians before
  changing its unit documentation;
- remove the dead `if (!packet)` capture-helper branch if `createPacket()` is
  kept as throw-or-return;
- store explicit tail presence in `EnemyShootPacket` if captures show that a
  present `numShots = 1` tail is valid.

## Code that should stay conservative

The following are research backlog, not cleanup-by-deletion:

- packet fields still named raw/unknown because values do not prove semantics;
- compatibility aliases required by the current semver line;
- opaque bytes needed for lossless forwarding;
- factory-less registry entries whose nested framing is not proven;
- catalog-only packet layouts derived from current client metadata but not yet
  seen in controlled success/failure captures.

For these areas, add evidence and tests before names or layouts. In particular,
capture each unmodeled `NotificationEffect`, actual enchantment/gift/custom-map
success and failure flows, backpack bank behavior, and remaining stat ids.

## Suggested remediation sequence

The current worktree spans independent concerns. Keep changes reviewable and
bisectable with commits in this order:

1. **Debug-string correctness**
   - fix notification recursion;
   - fix incorrect value/id labels;
   - add debug-string regression tests while retaining the accepted raw-token
     output.
2. **Direction-aware runtime resolution**
   - introduce explicit `PacketIO` wire direction;
   - split directional maps;
   - fix raw outgoing labels;
   - add 215/217 integration fixtures.
3. **Direction-aware corpus tooling**
   - fix the analyzer;
   - add CLI fixtures/tests;
   - regenerate/review corpus results.
4. **Primitive input hardening**
   - compressed-int validation;
   - RC4 key validation;
   - `hexdump` option validation;
   - focused unit/property tests.
5. **Player-data contract and inventory banks**
   - introduce patch/complete types;
   - resolve the second backpack bank;
   - fix integer slot validation and potion-field semantics.
6. **Read/write symmetry fixes**
   - ShowEffect color representation;
   - Notification effect-17 tail presence;
   - Pic bitmap validation;
   - any evidence-confirmed EnemyShoot tail presence.
7. **Compatibility alias consistency**
   - preserve old accessors through canonical factories;
   - add alias behavior tests and API report update.
8. **PacketIO lifecycle refactor**
   - state machine and close/error handling;
   - extract framing/queue/resolution components;
   - preserve public behavior with integration tests.
9. **Test/tooling gate improvements**
   - typecheck tests;
   - lint/test `.cjs`;
   - split shared helpers/large suites;
   - add coverage and packed-tarball smoke tests.
10. **Documentation and package hygiene**
    - current-vs-archival docs index;
    - README corrections;
    - license decision;
    - `.DS_Store`, unused Typedoc/Yarn/config cleanup.
11. **Mechanical formatting**
    - one formatter-only commit after functional diffs have landed.

Each commit should include its tests and any matching protocol/API
documentation. Do not combine packet renames, generated API changes, bulk
formatting, and runtime behavior changes in one commit.

## Definition of done for the next release

- notification logging cannot recurse, while the intentional raw-token
  `toString()` policy remains documented;
- `PacketIO` and corpus tooling resolve ids by explicit direction;
- ids 215 and 217 pass both incoming and outgoing integration fixtures;
- compressed integers, RC4 keys, and debug row widths reject invalid inputs;
- `PlayerData` no longer promises fields absent at runtime;
- all modeled backpack slots survive stat projection;
- the known ShowEffect, Notification-17, and Pic symmetry defects have tests;
- tests themselves are typechecked;
- `npm run check`, corpus direction fixtures, audit, and packed-tarball smoke
  tests pass;
- README/current docs match runtime direction and option behavior;
- unresolved layouts remain explicitly raw or factory-less rather than guessed.

## Final assessment

RealmLib is not in need of a rewrite. Its central registry, binary codecs,
capture discipline, and release checks provide a strong base. The next work
should concentrate on preserving direction through the runtime, hardening
boundary inputs, making public data contracts honest, and replacing ad hoc
debug strings with consistent structured inspection. After those correctness changes,
splitting `PacketIO`, notification effects, stat projection, and the largest
test suites will reduce future protocol-update risk without destabilizing the
public package.
