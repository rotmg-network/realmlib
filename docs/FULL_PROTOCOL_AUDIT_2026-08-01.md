# Full RealmLib protocol and log audit — 2026-08-01

This report supersedes the implementation conclusions in the narrower
[`PACKET_FINDINGS.md`](../PACKET_FINDINGS.md) audit and the smaller July replay.
It is a read-only protocol audit: no packet was sent to a live service.

## Executive result

The expanded audit found real wire defects that a parse-only or byte-length
check concealed:

- outgoing packet 30 normalizes a valid byte range `2..24` to `1`;
- packets 30 and 49 expose unsigned item types as negative numbers;
- packet 49 combines two independent signed bytes into one short;
- packet 117 preserves a now-known tail but assigns three public fields to the
  wrong wire values;
- packet 220 treats integers and a boolean as strings on voucher success;
- packet 233 crashes on the captured one-byte value `255`;
- current native serializers contradict RealmLib for packets 60, 93, and 124;
- incoming packet 179 is no longer structurally unknown and can be modeled;
- packet 180 is byte-preserving but collapses two separate fields;
- packet 44 turns the signed `numStars=-1` sentinel into `65535`;
- `PacketIO` can report the previous frame's size and cannot expose the
  direction used for direction-scoped protocol lookup.

Across the file-deduplicated replay, RealmLib consumed and re-encoded almost
all traffic, but that does **not** mean all public types or semantics are right.
Signedness errors and collapsed adjacent fields can round-trip byte-exactly.

## Scope and evidence discipline

### Current protocol baseline

- RealmLib: commit `e40cb6d` before this report.
- Protocol snapshot: Exalt `6.12.0.2.0`, metadata version 31.
- Current local client extraction:
  `6.12.0.2.0-cc966f991107921da18bfa387a333d77`.
- Native evidence used: `packet_structures.json`, generated current-client
  classes, field/call dataflow, and targeted native serializer steps.

The extracted `packets.json` name map is partly seeded from RealmLib and is not
independent proof. Native field access and raw wire bodies outrank it. Managed
field types also do not automatically identify wire widths: several managed
`int32` fields are deliberately narrowed by the serializer.

The registry/native pass visited all 211 registry records, all 204
factory-backed packet classes, all 191 current native packet structures, and
741 fixed-width codec call sites. The apparent totals differ because the
registry also carries direction-scoped raw/research/legacy records and two
id-less transports; the exact taxonomy is reconciled in the coverage ledger.

### Expanded log corpus

The search covered packet and related NDJSON under:

- `/Users/admin/dev/exalt-proxy/logs`;
- `/Users/admin/Downloads/logs` and top-level `realmproxy*.ndjson`;
- `/Users/admin/dev/logs/exalt`, `/Users/admin/dev/logs/logs`, and standalone
  RealmProxy captures under `/Users/admin/dev/logs` and `/Users/admin/dev`;
- relevant AppEngine and debug NDJSON for flow semantics;
- human-readable ProdMafia logs as contextual evidence only when no raw body
  was present.

Two complementary deduplication strategies were used:

1. The exhaustive codec replay found 91 nonempty packet-file candidates and 87
   unique whole-file SHA-256 hashes. It processed 10,650,570 frame rows, of
   which 31 were old logger records with an intentionally omitted HELLO body.
2. The claim/reward and economy audits examined 205 NDJSON candidates and
   deduplicated mirrored or sliced captures by event identity
   (`time`, connection, direction, id, and body; sequence where available).
   Their flow counts below are unique events, not repeated archive rows.

The full replay's 10,650,539 usable frame rows produced:

| Result                                  |      Count | Meaning                                                      |
| --------------------------------------- | ---------: | ------------------------------------------------------------ |
| mapped to a direction-scoped definition | 10,650,538 | one remaining row was injected test traffic                  |
| fully parsed                            | 10,650,531 | includes packets with an intentionally preserved opaque tail |
| byte-exact read/write                   | 10,648,266 | unchanged after decode and re-encode                         |
| non-exact read/write                    |      2,265 | all outgoing packet 30 at the same byte                      |
| typed leftovers                         |          4 | three voucher successes and one old party request            |
| parser exceptions                       |          3 | all incoming packet 233 with reward id 255                   |
| opaque packets                          |        447 | all packet 117; every tail is now structurally known         |
| organic unmapped frames                 |          0 | no evidence of a missing current organic id                  |
| injected unmapped frames                |          1 | outgoing id 123; not current protocol evidence               |

The replay contains builds `6.12.0.0.0`, `6.12.0.1.0`, and `6.12.0.2.0`.
There are 1,150 modified and 683 injected rows. Injected traffic was retained
for codec stress evidence but excluded from semantic/value conclusions.

## Implement first: confirmed wire and data errors

### 1. Outgoing 30 `PLAYERSHOOT`: raw burst byte and unsigned item type

RealmLib currently reads `isBurst` with `readBoolean()` and writes it with
`writeBoolean()`. In 278,452 file-deduplicated bodies the wire byte used values
`0..24`; 2,265 bodies used `2..24`. Every one is normalized to `1` during a
RealmLib round-trip. These values occur in organic current-build traffic.

The same packet reads `containerType` as signed `i16`. Native evidence says
`u16`, and 12,476 captured bodies have values above `32767`; RealmLib currently
exposes those item types as negative.

Implementation:

- add a conservative `burstByte: number` using unsigned-byte codecs;
- retain `isBurst` as a deprecated boolean compatibility accessor that maps
  only constructor/setter use to `0/1` and never destroys a decoded raw value;
- use unsigned-short codecs for `containerType`;
- if a signed raw view is still needed, expose it as a deprecated computed
  alias rather than keeping the canonical property signed;
- test byte values `0, 1, 2, 24, 255` and item types `32767, 32768, 65535`.

### 2. Incoming 49 `ALLYSHOOT`: unsigned item type and split tail

Of 4,532,786 file-deduplicated bodies, 810,317 carry a `containerType` above
the signed-short maximum. Current RealmLib decodes all of those as negative.

The final `unknownShort` is also two separate signed bytes in the current
native deserializer:

```text
s8 unknownShotByte
s8 shootSource
```

Captured pairs include `(-1,0)`, `(-1,1)`, and `(0..6,0)`. All captured bodies
are 15 bytes; an extractor-produced extra `attackId` step is a false positive
and must not be appended.

Implementation:

- switch `containerType` to unsigned-short codecs;
- expose the two final bytes separately and type `shootSource` consistently
  with `PlayerShootSource`;
- retain `unknownShort` as a deprecated big-endian packing accessor;
- add high-bit item-type fixtures and both shoot-source values.

### 3. Incoming 233 account-level result: `rewardId` is `u8`

The event-deduplicated corpus contains 184 results: 78 successes and 106
failures. Success adds a conditional descriptor string. Every failure is
exactly `bool + u8`. Three captured bodies are `00ff`; the current compressed
integer reader treats `ff` as a continuation prefix and throws at end of frame.

Compressed and native encodings happen to agree only for values `0..63`.
RealmLib is therefore not merely using a different public representation.

Implementation:

```text
bool success
u8 rewardId
if success: str16 grantedRewardDescription
```

Use unsigned-byte codecs, retain the conditional reset behavior, and add
fixtures for `0`, `63`, `64`, `127`, `255`, plus success-to-failure reuse.

### 4. Incoming 220 voucher result: fixed conditional schema

The event-deduplicated corpus contains 119 results: one success, 116
not-found failures, and two already-claimed failures. Native order and captures
agree on:

```text
bool success
str16 errorMessage
str16 voucherCode
if success:
  str16 name
  str16 rewardItems
  i32 gold
  i32 battlePassDiscount
  bool battlePass
```

Current RealmLib loops over `str16` until fewer than two bytes remain. On the
successful frame it consumes two zero-valued `i32`s as four empty strings and
leaves the final boolean unread. Its getters are also shifted: the submitted
code is returned as `voucherName`, and the voucher name as `description`.

Implementation:

- add the eight typed fields and conditional success tail;
- clear all success-only fields when a reused instance reads a failure;
- retain `strings` only as a deprecated computed compatibility view;
- test nonzero gold/discount values so string framing cannot accidentally pass;
- never include voucher codes in diagnostics or fixtures.

### 5. Incoming 117 vault content: six shorts plus three strings

Every one of 447 replayed packet-117 rows has the same structural tail after
the five content lists:

```text
i16 vaultUpgradeCost
i16 materialUpgradeCost
i16 currentMaterialMax
i16 potionUpgradeCost
i16 currentPotionMax
i16 nextPotionMax
str16 vaultUniqueData
str16 materialUniqueData
str16 spoilsUniqueData
```

RealmLib reads only five shorts. Its `potionUpgradeCost`, `currentPotionMax`,
and `nextPotionMax` properties are therefore shifted, and the real final
capacity plus all three strings are hidden in `opaqueTail`. Observed
`nextPotionMax` values are 28 and 64.

Implementation:

- add `currentMaterialMax` and the three raw unique-data strings;
- consume/write the known tail explicitly;
- keep `opaqueTail` only for genuinely additional future bytes;
- add a captured body fixture and assert that the corpus becomes non-opaque.

### 6. Uncaptured but exact current native layout corrections

These have no raw frame in the expanded corpus, but direct current serializer
evidence is strong enough to implement with synthetic fixtures:

| Dir/id                             | Current RealmLib              | Exact current layout                                                  | Implementation                                                                              |
| ---------------------------------- | ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C→S 60 `SETCONDITION`              | `i8 effect + f32 duration`    | `u32 effect + f32 duration`                                           | use UInt32 codecs; test `0x80000000`                                                        |
| S→C 93 `LOGIN_REWARD_MSG`          | three `i32` values            | one `str16 message`                                                   | make message the only current wire field; keep numeric fields deprecated/non-wire if needed |
| C→S 124 `MODERATOR_ACTION_MESSAGE` | `i32 actionCode + one string` | `u8 actionCode + str16 playerNames + str16 reason + i16 durationDays` | add all fields; map deprecated `actionMessage` to `reason`                                  |
| S→C 179 `ACCELERATOR_ADDED`        | raw/factory-less              | `i32 value + i32 acceleratorType + i32 unknownInt`                    | implement/export/register; keep the last two semantics raw                                  |

Implementing 179 changes the generated completeness summary from 202 modeled
plus one raw wire packet to 203 modeled and zero raw wire packets.

### 7. Outgoing 180 crucible activation: two bytes, not a short

Nine file-deduplicated captures contain final byte pairs `(0,0)` eight times
and `(1,0)` once. Native layout is:

```text
str16 crucibleId
u8 activate
u8 crucibleType
```

Add the two canonical properties. Preserve `trailing` as a deprecated
big-endian packing accessor so existing callers keep source compatibility.

### 8. PacketIO and reusable-object correctness

- `rawPacket.size` currently uses the reusable reader's previous/default
  length before the reader is resized. It must use `frame.length`.
- Diagnostics always expose transport direction as `incoming`, even when a
  proxy configures `incomingDirection: 'outgoing'`. Preserve the transport
  field for compatibility and add `protocolDirection` so `(direction,id)` log
  joins are unambiguous.
- `UpdatePacket.read()` clears `hasTrailingByte` on an absent tail but leaves a
  prior `unknownByte` value in a reused instance. Reset the value to zero before
  the presence check.

Add consecutive-different-size raw-event tests, proxy-direction tests, and a
same-instance present-tail then absent-tail test.

## Public range, naming, and semantic corrections

These changes are byte-preserving for currently observed low values, but fix
the public value domain or a now-resolved meaning.

### Fixed-width signedness and discriminator corrections

Use unsigned codecs where current native types are `byte`/`uint16`:

- 12 server-player-shoot `unknownByte` and `numShots: u8`;
- 151 `milestone: u8`;
- 163 `slot: u8`, `subId: u16`;
- 164 `slot: u8`;
- 170 `chestType: u8`;
- 171 `execute: u8`;
- 234 competition `columnId: u8`;
- 237 daily `flag: u8`;
- 24 active-pet command and the pet-upgrade operation/payment bytes;
- 37 guild-rank `guildRank: u8`;
- 42 Update `levelType: u8`;
- 95 inventory-result `ackType: u8`;
- 119 forge-result `count: u8` (zero-count success is valid);
- 134 player-callout `calloutType: u8`;
- 140 customization `category` and `currency` bytes;
- 200 party minimum power `u16` and its five following `u8` fields;
- 209 party-invite response `accept: u8`;
- 45 reconnect `port: u16` (captured range is only 0–2050, so this is
  serializer-backed rather than a high-bit capture fix).

These low-range byte changes are native-type corrections: present captures
round-trip today, but the signed writers reject half of the actual domain.
Mission `subId=ffff` is the observed unsigned-wire sentinel. Preserve the
existing public `-1` convenience by translating `ffff` to and from `-1`, while
allowing canonical unsigned values `32768..65534` to survive.

Packet 44 `TEXT.numStars` has the opposite defect. It is native `i16`, and the
corpus contains raw `ffff`: the client receives the system/non-player sentinel
`-1`, while RealmLib currently exposes `65535`. Use signed-short codecs and add
a sentinel fixture. Keep `bubbleTime` on its proven one-byte wire codec:
19,744 exact bodies cover values `0..116`, so its managed `uint32` declaration
does not justify widening the frame.

Two native-only signedness follow-ups have weaker evidence and should be kept
separate from the confirmed fixes:

- outgoing 157 `SET_ABILITY.ability` is native signed `i8`, but the only
  captured value is 1; match native or defer until a negative capture;
- outgoing 133 `CREEP_HIT.bulletId` should be `u16` for parity with its own
  domain comment and sibling hit packets, but no raw packet-133 body exists.

Do not apply these rules indiscriminately. `SlotObjectData.objectType=-1`,
battle-pass tier `-1`, reroll artifact slot `-1`, map trailing short `-1`, and
unavailable vault costs `-1` are real signed sentinels. Party IDs
`0xffffffff`, player IDs `0xffff`, skin id 41905, and party-list page `0xff`
confirm that the existing party-model unsigned handling is correct.

`ShootAckPacket.ackCount` remains signed `i16`, but its comment is stale:
unmodified current traffic reaches 235, not merely 1–4. Update the documented
range and add a captured high-count fixture without changing the codec.

### Resolved field names and aliases

| Packet                       | Correction                                                                                        | Compatibility approach                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 13 `USEITEM`                 | trailing `i32` is `abilityIndex`, not `useItemFlag`                                               | canonical rename plus deprecated alias; keep the proven 29-byte layout                    |
| 24 active pet                | command 1 sets active pet; instance id 0 clears/unfollows; command 3 releases                     | `SetActive=1`, retain `Follow=1`, mark command 2 legacy/unobserved; builder inspects id 0 |
| 99 account list              | `lockAction`: snapshot -1, remove 0, add 1                                                        | enum/helpers; default constructor to -1; do not call every packet a snapshot              |
| 115 exaltation/chest request | `unknownInt` is strongly named `itemId` by native setters/owner                                   | canonical property plus deprecated alias; value domain remains uncaptured                 |
| 140 customization            | selection is `{category:u8,itemType:i32,currency:u8}`                                             | canonical names plus deprecated unknown-byte aliases                                      |
| 145 favour pet               | operation 2 stores a favorite-title pair, not necessarily the equipped Retitle pair               | correct docs/builders; keep it a separate mutation                                        |
| 156 gravestone               | first wire `i32` is `gravestoneType`; second remains unknown                                      | rename first field with alias                                                             |
| 167 discoverability          | trailing `i16` is named `icon`; 71 unique official captures all use 1                             | rename with deprecated alias; add true/false fixtures                                     |
| 185 `UPGRADE_ENCHANTER`      | handler owner is `AchievementsManager`; forge/enchanter semantics are unsupported                 | neutral documentation until semantics are resolved                                        |
| 234/235 competition          | request byte is competition column 0/1, not free/premium BP track                                 | canonical `columnId`; deprecate track names/builders                                      |
| 227 gift result              | third string is the displayed failure message; first string contains semicolon/comma item records | add `errorMessage` and lossless `parseItemTypes()`; preserve raw strings                  |

Extractor labels for incoming 235 and 237 are swapped by structural matching.
Captures prove RealmLib's current ID meanings are correct: 235 carries
competition result XML, while 237 echoes the daily-login key/category. Fix
provenance/name generation; do **not** swap RealmLib's IDs.

### Result and operation semantics

- `BuyResultPacket` is multiplexed. Unique official results include codes -1,
  0, 2, 3, 7, 10, and 13. Code 7 is pet-feed success and 13 pet-backpack
  success; `result === 0` is not a universal success predicate. Add a raw-safe
  `BuyResultCode` enum and reconcile by the originating operation.
- `ReskinPacket.skinId=0` is an observed base/default skin selection. Three
  extra reskin rows were injected and must not be treated as organic values.
- `BuyDustsPacket.value` has observed `tier:quantity` forms. A parser/builder
  may be added, but the raw string must remain authoritative.
- `PurchaseRequestPacket.request` has two unique organic four-field examples
  consistent with `category,itemId,quantity,currency`. Keep it raw until
  escaping/quoting rules are observed.
- Forge success can legitimately return a zero result count. Do not equate
  success with a nonempty returned list. Its count byte should be unsigned.
- SetDiscoverable, emote, reskin, and customization counts must exclude the
  many explicitly injected boundary probes when documenting official values.

## Request/result and reconciliation findings

### Claims and rewards

- Daily 3→237: 26 unique requests and 25 exact key/category echoes. Packet 93
  never appeared. Treat 237 as the observed acknowledgement/state response;
  packet 93's current role remains uncaptured.
- Battle pass 149→150: five natural requests, all successful. Tiers include 2
  and signed sentinel -1; its exact user-facing meaning remains unproven.
  Competition packets 234/235 are unrelated.
- Mission 163→164: 75 requests and 73 slot-correlated responses; 9 success and
  64 failure, with slots reaching 62. The response omits board and mission.
- Chest: 236 prompt events, 84 claims, and 79 results after event deduplication. All
  79 `execute=1` claims received a result; five `execute=0` claims did not.
  Observed chest types are 1, 2, and 3. Results contain one item in this corpus.
- Voucher responses echo the submitted code, but codes must not enter logs.
- Account-level: outgoing reward id remains `i32`; invalid `-1` requests
  produced response id 255, demonstrating server-side byte narrowing.
- Competition 234→235: six natural pairs; column 0 and column 1 returned
  different manifests that match `/missions/getCompetition`. Results do not
  echo the column, so serialize this mutation.
- Packet 114 is power-up state: 1,326 deduplicated frames confirm `i16 class +
eight compressed integers`. It is not an exaltation-redemption result.

### Economy, pets, account, and profile

- Active pet command 1 plus a nonzero id selects a pet; command 1 plus id 0
  clears it; command 3 is followed by `DELETE_PET`. No command 2 was observed.
- Account-list packet 99 with action 1 arrived as an incremental add after a
  slash command. Action -1 is the full-snapshot form; action 0 removes.
- Seasonal conversion is not inherently reconnect-only: all 22 unique
  requests were followed by blueprint state, and most by Update/InvResult;
  only six reconnected. Treat those as convergence evidence, not unique acks.
- Reroll 189→190: 183 unique requests each received an immediate success.
  Dust 191→192: four unique requests each received success.
- Forge 118→119: three unique successes, all with zero result count.
  Blacksmith 195→196: five unique successes returned matching list counts.
- Retitle and favorite-title operations can diverge in the same millisecond;
  they must not share one pending mutation identity.
- Pet skin changes were followed by Update rather than BuyResult. Purchase
  result correlation must remain operation-specific.

AppEngine endpoints are separate mutation/state surfaces. Successful calls to
dust-cost, owned-pet-skins, customization purchase, shop purchase, and char-list
help explain semantics but do not prove socket framing. No credentials, tokens,
account ids, character ids, voucher strings, or recipient names are reproduced
in this report.

## Assumptions explicitly rejected or retained

### Do not implement these extractor suggestions mechanically

- Packet 6 `QUEST_FETCH_RESPONSE`: 53 captured rows consume and re-encode with
  RealmLib's existing footer. Managed declarations suggesting more `int32`
  fields do not establish different wire bytes.
- Packet 13 `USEITEM`: 5,397 captured 29-byte bodies confirm the current byte
  `useType` plus trailing `i32`; the managed-only boolean is not an extra wire
  byte. Rename the trailing field to `abilityIndex`, but do not expand layout.
- Packet 23 `HATCH_PET`: three older captures end after the existing three
  fields. Current native metadata lists an `isSkinUnlocked` boolean only at
  metadata confidence. Do not append it unconditionally without a current body;
  if implemented defensively, preserve presence explicitly.
- Packet 49 `ALLYSHOOT`: all bodies are 15 bytes. Do not append the extractor's
  false-positive `attackId` step.
- Bullet ids on packets 25, 30, 40, 90, and 133 have managed `uint32`
  declarations but are narrowed to two wire bytes by native access and capture
  sizes. Keep the proven two-byte wire codecs.
- Packet 107 `RESKIN_UNLOCK`: the managed nested enum/value is a derived object,
  not additional bytes; all 18 captures are exactly five bytes.
- Packet 114's managed `int32[]` is the fixed eight-value compressed wire model
  already implemented by RealmLib.
- Packet 135 `REFINE_RESULT`: native disassembly reads success, Slot, and one
  `str16` unique-data value; `mods` is derived from that container. Do not add a
  second wire string from the structure summary.
- Packet 238 `GIFT_NOTIFICATION`: the nested `GiftInfo` expands through a
  discarded/read int32 and one JSON string. Do not invent additional nesting
  bytes without a capture.

### Versioned and artificial anomalies

- The only outgoing 215 body with a fifth byte is from build `6.12.0.0.0`.
  Current `6.12.0.2.0` native serialization writes only the `u32 partyId`.
  Preserve a diagnostic/fixture for the old variant; do not force-write the
  extra byte in the current packet.
- Outgoing id 123 is an injected five-zero-byte `GET_PLAYERS_LIST` experiment.
  Current protocol correctly uses incoming 123 for `PLAYERS_LIST_MESSAGE` and
  outgoing 125 for the empty request.
- IDs 162, 173, 175, 177, and 187 remain research-only historical candidates;
  they are absent from the current build. ID 1000 cannot be a one-byte wire id.

## Protocol metadata and documentation fixes

- Update `protocol/exalt-current.json` for incoming 147 to canonical
  `SkinRecycleResponseMessage`, `SkinRecycleResponsePacket`, direction
  incoming, confidence 100. Keep `UNKNOWN147` as a deprecated alias.
- Raise outgoing 204 and incoming 207 to confidence 100; current
  constant-vtable structures confirm those directions.
- Keep the curated incoming 222 `SAVE_LOCK_UPDATE` decision. The generated
  `packets.json` value `LOADING_SCREEN` is registry-seeded/stale evidence.
- Regenerate `PROTOCOL_COMPLETENESS.md` after modeling 179.
- Correct dated docs that still call 135/136/218/238 factory-less or call 147
  unknown. All four former blockers now have factories.
- Replace the July claim that every non-Update/MAPINFO body round-trips: the
  expanded current-build corpus disproves it for packet 30.

The current baseline also fails only the generated API-report stage of
`npm run check`: commit `e40cb6d` exported `NotificationEffectState` and its
read/write/reset/payload helpers, while `etc/realmlib.api.md` still contains the
older forgotten-export view. Type checking, lint, formatting, coverage, build,
strict protocol reconciliation, package lint, and package smoke all pass.
Run `npm run api:update` as part of the implementation wave, review that API
delta, then rerun the complete check; the audit documents themselves do not
change the public API.

## Exhaustive registry coverage ledger

RealmLib currently has 203 one-byte direction-scoped wire entries: 202 modeled
and incoming 179 deliberately raw. The expanded corpus observed 138 of them.
Every observed entry was included in the full replay; every unobserved entry
was checked against the current native serializer/catalog and source. The
actionable native-only mismatches are listed above.

Observed incoming ids:

```text
0, 4, 6, 10, 11, 12, 14, 18, 22, 23, 28, 34, 35, 38, 41, 42, 44,
45, 46, 49, 64, 67, 69, 75, 76, 77, 78, 82, 84, 86, 88, 92, 95, 96,
99, 101, 107, 108, 109, 112, 114, 117, 119, 120, 139, 141, 148, 150,
164, 165, 166, 169, 170, 172, 181, 183, 185, 190, 192, 196, 207, 210,
212, 214, 220, 231, 233, 235, 237
```

Observed outgoing ids:

```text
1, 3, 5, 7, 9, 13, 16, 19, 20, 24, 25, 27, 30, 33, 36, 40, 47, 48,
51, 52, 55, 56, 57, 58, 61, 62, 65, 74, 81, 85, 89, 90, 98, 102, 103,
104, 105, 118, 121, 122, 134, 137, 138, 140, 145, 149, 154, 155, 157,
159, 160, 163, 167, 171, 180, 182, 189, 191, 195, 197, 200, 204, 215,
219, 223, 224, 232, 234, 239
```

Unobserved incoming ids:

```text
8, 21, 26, 39, 50, 63, 66, 68, 79, 83, 87, 93, 106, 116, 123, 130,
132, 135, 142, 143, 144, 147, 152, 153, 179, 184, 194, 199, 208, 215,
217, 218, 222, 227, 236, 238
```

Unobserved outgoing ids:

```text
15, 17, 31, 37, 53, 59, 60, 80, 91, 94, 97, 113, 115, 124, 125,
126, 129, 131, 133, 136, 146, 151, 156, 193, 198, 209, 217, 225, 226
```

The two modeled id-less chat transports were source-reviewed but do not appear
as ordinary one-byte socket frames. The five research candidates and legacy id
1000 are outside the 203-entry wire total.

## Recommended implementation sequence

1. **Loss/corruption wave:** packets 30, 49, 117, 220, and 233.
2. **Exact native mismatch wave:** packets 60, 93, 124, 179, and 180.
3. **Transport/state wave:** raw-event size, protocol direction, and Update
   same-instance reset.
4. **Public range/API wave:** unsigned fields, packet 24 active-pet semantics,
   packet 99 actions, packet 140 names, packet 167 icon, packet 234 competition
   naming, and the compatibility aliases listed above.
5. **Metadata/docs wave:** 147, 204, 207, completeness regeneration, and stale
   dated findings.

For each public API wave, run `npm run api:update` before `npm run check`.
Required fixtures include:

- exact captured success and failure branches for 220 and 233;
- high-bit boundaries for all corrected unsigned fields;
- same-instance success→failure and optional-tail→absent-tail reads;
- all observed packet-30 burst values and packet-49 tail pairs;
- a packet-117 body with all six capacity/cost fields and three unique-data
  strings;
- synthetic exact native layouts for uncaptured 60, 93, 124, and 179;
- injected/modified provenance tests so artificial values never become
  semantic documentation.

## Captures still worth obtaining

Highest-value controlled current-build captures are:

- 60, 93, and 124 to complement exact native layouts;
- 115/116 exaltation/chest redemption;
- 135/136 refinement purchase/result;
- 146/147 skin recycle;
- 151/152 Battle Pass milestone boost;
- 156 gravestone selection;
- 179 accelerator-added after the parser exists;
- 193/194 pet shader and 198/199 reroll reset;
- 208/209/215/217 party variants;
- 218/222 reconnect/loading state;
- 226/227/238 gift send/result/notification;
- a current-build packet 23 to decide whether the metadata-only boolean is
  ever present.

Use one controlled action at a time, retain request/result/state neighbors,
record build and direction, exclude injected probes from semantic counts, and
redact account, character, key, code, recipient, and credential material.
