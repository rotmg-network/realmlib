# RealmLib Log Corpus Findings - 2026-07-28

## Scope

This report covers every packet and AppEngine capture in
`/Users/admin/Downloads/logs`.

- 29 packet files and 29 AppEngine files
- 1,944,103,579 packet-log bytes
- 31,727,350 AppEngine-log bytes
- 6,696,861 packet records
- 7,802 AppEngine transactions
- 0 invalid JSON records
- Builds 6.12.0.0.0, 6.12.0.1.0, and 6.12.0.2.0

The packet corpus was replayed through the current RealmLib build. Capture-time
`type`, `parsed`, and `parseError` labels were also retained so old logger
failures could be distinguished from gaps that still exist in current source.
The AppEngine bodies were decoded structurally, but credentials and tokens are
not reproduced in this report.

## Executive Findings

| Priority | Finding                                                                                                           | Evidence                                                                                | Current status / RealmLib action                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Done     | `UPDATE.write()` added a byte absent from every captured frame                                                    | 469,625/469,625 frames parsed but re-encoded one byte longer                            | `hasTrailingByte` now preserves the legacy/variant tail only when present                                                 |
| Done     | `MAPINFO.write()` added realm-score fields to non-realm maps                                                      | 632/763 frames re-encoded eight bytes longer; only 131 realm frames have the score tail | `hasRealmScores` now preserves the optional `maxRealmScore`/`curRealmScore` pair                                          |
| Done     | `INVRESULT.unknownInt2` documentation was false                                                                   | 583/1,815 frames carry nonzero values with stable bit combinations                      | It is documented as a second unresolved bitfield and `InvResultSecondaryFlags` exposes raw bits without speculative names |
| Done     | `PLAYER_SHOOT` combined two bytes into one `int16`                                                                | Native serialization identifies a signed byte plus `PlayerShootSource`                  | The fields are now serialized separately; `ALLY_SHOOT` retains its native `int16`                                         |
| Done     | `SERVERPLAYERSHOOT.spellBomb` was a generic multi-shot tail                                                       | 3,356 frames carry count 2-19 and an unresolved angle increment                         | The canonical names are `hasMultiShot`, `numShots`, and `angleIncrement`; deprecated compatibility aliases remain         |
| Done     | Live `PacketIO` did not diagnose unread payload bytes                                                             | Strict replay checks leftovers, but the old live path did not                           | `packetLeftover` and `packetDiagnostic` report unread bytes without suppressing typed dispatch                            |
| Done     | `TRADESTART`, Notification 12, `STACKS` (id 231), id 166, chest claims, and Battle Pass read data were reconciled | The former 72 failures now parse and their regression fixtures pass                     | Current-client names are used where labels and native layout agree                                                        |
| P3       | Stat ids 156-158 remain semantically unresolved                                                                   | No stat id above 158; values alone do not establish names                               | Preserve conservative names and request controlled captures                                                               |

## Current Replay Result

All 6,696,861 packet records now map to a registered packet class, parse
without throwing, and consume their complete body:

- 0 unmapped ids
- 0 missing factories
- 0 parse errors
- 0 unread trailing bytes in modeled packet bodies

Deliberately raw wire definitions are reported separately as `opaque`; their
bodies are preserved without pretending a typed parser consumed them.

This supersedes the capture-time labels, which contain 250 errors, 321
leftovers, 5 unmapped frames, and 6,171 unparsed frames from older RealmLib
versions. Current RealmLib parses all captured instances of:

- 5,961 `STATS`
- 130 `REROLL_ALL_ENCHANTMENTS`
- packet 117 `VAULT_CONTENT`
- packet 148 `DAMAGE_BOOST`
- packet 166 `DAMAGE_WITH_EFFECT`
- packet 170 `CLAIM_REWARDS_INFO_PROMPT`
- packet 172 `CHEST_REWARD_RESULT`
- packet 237 `CLAIM_DAILY_ITEM`
- the captured party packet set

Capture-time `unparsed` and `unhandled` counts must therefore not be copied into
a current bug list without replaying the raw body.

Parsing is not the same as lossless serialization. The initial read-then-write
comparison found:

- 6,226,604 exact bodies
- 470,257 non-exact bodies
- 0 writer exceptions

Only two packet types differed: all 469,625 `UPDATE` frames and 632 non-realm
`MAPINFO` frames. Both writers now preserve optional-tail presence; regression
fixtures cover present and absent forms. Every captured body among the other
97 observed packet types already round-tripped byte-for-byte.

The corpus covers 99 of the 208 current one-byte direction-scoped wire
mappings. The registry also
retains legacy `IP_ADDRESS = 1000`, explicitly marked as non-wire because the
frame id is one byte.
Therefore, "every captured packet parses" must not be read as validation of
uncaptured features such as vouchers, Battle Pass claims, pet upgrades, gifts,
dash, guild administration, custom maps, or most customization purchases.

The generated [protocol completeness report](PROTOCOL_COMPLETENESS.md)
separates modeled wire packets, deliberately raw wire packets, research
candidates, legacy metadata, and id-less transports. None of the raw or
research-only definitions appears in this corpus. A future raw-wire capture is
preserved and diagnosed as opaque; research candidates are not treated as
confirmed wire packets until direction and framing evidence exists.

## Confirmed Packet Structures

### Reconciled: `TRADESTART` / `TradeItem`

Every captured trade item uses the following layout, now implemented by
`TradeItem`:

```text
int32 item
int32 slotType
bool tradeable
bool included
UTF itemData
```

For example, the start of one record is:

```text
00000a74 00000002 00 00 0014 414149456f4150395f5f335f5f66384641413d3d
```

This decodes to item `0x0a74`, slot type `2`, two false booleans, and
`"AAIEoAP9__3__f8FAA=="`. Empty strings and observed lengths of 16 and 20
characters also occur. The value resembles the item metadata used elsewhere,
but the corpus does not prove its internal semantics.

`TRADESTART` is:

```text
int16 clientItemCount
TradeItem[clientItemCount]
UTF partnerName
int16 partnerItemCount
TradeItem[partnerItemCount]
int32 partnerObjectId
byte trailingValue
```

The collection-size checks and trailing byte are correct. All seven captured
frames now parse and re-encode exactly.

### Reconciled: `NOTIFICATION` effect 12

All 61 effect-12 frames use:

```text
byte effect = 12
byte extra = 26
UTF message
int32 valueA
int32 valueB
```

Observed messages include:

- `Monument destroyed!`
- `Bridge open!`
- conductor-under-attack messages
- wave labels

`valueB` is stable within an encounter family (`13,609,858` or `13,900,602`);
wave messages use `2,828,840`. `valueA` changes with the event or object and
includes wave-associated values 88, 148, and 268. The layout is confirmed, but
the semantic names are not. Suggested initial fields are `objectTypeOrId` and
`colorOrType`, with raw aliases until a controlled capture distinguishes them.

`NotificationEffect.BEHAVIOUR = 12`, the reader/writer branch, and the typed
`behaviour` payload are now present. All 61 frames parse and re-encode exactly.

### Reconciled: incoming id 231 `STACKS`

Native code identifies the exact eight-byte shape as `StacksState`:

```text
u8 hp, mp, attack, defense, speed, vitality, wisdom, dexterity
```

Bodies alternate:

```text
00000000 00000001
00000000 00000000
00000000 00000001
00000000 00000000
```

Each transition follows `USEITEM` for item `37998` (`0x946e`, Silver Star
(SB)). The final byte therefore changes the dexterity stack counter between 0
and 1. `StacksPacket` now exposes all eight named counters, and the same
`StacksState` model is used by packet 139 `STATS`.

### Reconciled: packet 166 is generic `DAMAGE_WITH_EFFECT`

Both frames parse with the current RealmLib layout:

```text
int32 targetId
u8 effectCount
u8 effects[effectCount]
u16 damage
u8 info
u16 bulletId
int32 ownerObjectId
u8 magnitudeEffect
float magnitude
```

The samples are:

```text
target=277 effects=[22] damage=0 info=0 bullet=0 owner=0x00ffffff
magnitudeEffect=22 magnitude=6.0

target=277 effects=[38] damage=0 info=0 bullet=0 owner=0x00ffffff
magnitudeEffect=22 magnitude=6.0
```

Effect 38 is `CURSE` in the current client enum. The comments and regression
fixture now reflect the generic leading-effect list. Both frames round-trip
exactly.

### Confirmed daily-login exchange

One complete exchange establishes the current packet-237 behavior:

1. Client packet 3 sends `UTF claimKey + UTF "nonconsecutive"`.
2. A notification reports `s.daily_reward_claimed`.
3. Server packet 237 returns `byte(1) + the same claimKey + the same mode`.

The current `ClaimDailyItemPacket` structure is correct. Its documentation can
now state that the strings are echoed from the claim request in this flow.

### Chest claims and results

The corpus contains:

- 129 `CLAIM_REWARDS_INFO_PROMPT`
- 67 `CLAIM_CHEST_REWARD`
- 64 `CHEST_REWARD_RESULT`

The leading request byte has observable behavior:

- 64 requests with value 1 all receive packet 172 shortly afterward.
- 3 requests with value 0 receive no packet 172.
- All value-0 requests target item `65489` (`0xffd1`) with choice index 0.

Treat this as a claim/execute/confirmation field, not an unknown byte that is
always 1. The exact UI meaning of value 0 still needs a controlled capture.

All 64 result frames contain:

```text
int16 count = 1
int32 itemType
```

The list parser is structurally correct, but no multi-item result is present in
this corpus. Observed choice indexes are 0, 2, 3, 6, and 8.

## Remaining Wire Differences

### Resolved: `UPDATE` optional trailing byte

All 469,625 `UPDATE` bodies end immediately after the compressed drop list.
`UpdatePacket.read()` correctly treats its final byte as optional, but
`write()` always emits `unknownByte` (default 0). Consequently, every captured
frame gains `00` when re-encoded.

`hasTrailingByte` is now set from `reader.remaining > 0`, and `unknownByte` is
serialized only when that flag is true. A constructor-built packet opts out.

This matters for a proxy that decodes, modifies, and forwards `UPDATE`: the
current writer changes otherwise untouched traffic.

### Resolved: `MAPINFO` optional realm-score tail

Only the 131 `Realm of the Mad God` frames carry:

```text
int32 maxRealmScore = 300000
int32 curRealmScore
```

The other 632 frames end after `unknownShort2 = -1`. `hasRealmScores` now
tracks this presence and the writer only emits the pair when present.

Native disassembly corrected the preceding layout to two int16 radii, a bool,
and an int32. The one non-default int32 is a `The Third Dimension` frame:

```text
unknownShort1 = 0x120717
unknownBool = false
dungeonModifier = ""
```

The other 762 frames use `0/false`. One sample is not enough to name the int32.

### Resolved: `INVRESULT` has two unresolved bitfields

The first `flags` field uses the already documented raw bits. This corpus adds
no bit outside the current `InvResultFlags` atlas.

The following `unknownInt2` is not always zero:

- zero: 1,232
- nonzero: 583
- observed atomic bits: 5, 10, 11, 15, 16, 18, 22, 27, and 30
- observed combinations include `0x8400`, `0x400400`, `0x408400`,
  `0x408420`, and `0x448400`

Nonzero values occur on `ackType = 1` use acknowledgements; all 721 inventory
mutation acknowledgements use zero. `InvResultSecondaryFlags` exposes the raw
bit positions without assigning unproven semantic names.

### Resolved: shot-tail models obscure byte structure

`PlayerShootPacket.unknownShort` was read as signed `int16`. Native code shows
that its two bytes are independent:

- player values are only `0xff00` and `0xff01`
- the first is a still-unresolved signed byte
- the second is `PlayerShootSource`: Primary 0 or Ability 1

`AllyShootPacket` has a separate native layout and correctly retains its
trailing signed int16.
The optional five-byte tail on `SERVERPLAYERSHOOT` is also generic multi-shot
data rather than a `spellBomb` discriminator:

- absent on 52,475 frames
- present on 3,356 frames
- count values 2-19
- angle values are regular radian increments such as pi/12, pi/6, pi/3,
  2pi/3, and 2pi/5

The fields are now `hasMultiShot`, `numShots`, and `angleIncrement`, with
deprecated compatibility accessors for the old spell-specific names. The
fixed `unknownByte` also ranges 0-13 and is likely shot-related, but the corpus
does not establish its exact role.

### Resolved: strict leftovers in live `PacketIO`

The offline replay explicitly checks `reader.remaining === 0`.
`PacketIO.constructPacket()` now emits `packetLeftover` and a
`packetDiagnostic` with status `leftover` when a typed parser leaves body bytes
unread. The typed packet is still dispatched so diagnostics do not turn an
otherwise recoverable protocol addition into a client disconnect.

## Combat Behavior

High-volume combat counts:

| Packet               |     Count |
| -------------------- | --------: |
| `ALLYSHOOT`          | 3,900,958 |
| `ENEMYSHOOT`         |   167,123 |
| `PLAYERSHOOT`        |   140,204 |
| `ENEMYHIT`           |    55,972 |
| `DAMAGE`             |    50,828 |
| `PLAYERHIT`          |    27,830 |
| `OTHERHIT`           |    24,090 |
| `AOE`                |    17,444 |
| `AOEACK`             |    14,563 |
| `ESCAPE`             |       149 |
| `DEATH`              |        94 |
| `GROUNDDAMAGE`       |         6 |
| `DAMAGE_WITH_EFFECT` |         2 |

The proxy transformed combat traffic heavily:

- 26,994 of 27,830 `PLAYERHIT` packets were dropped (97.0%).
- 9,384 of 14,563 generated `AOEACK` packets were dropped (64.4%).
- 220 `OTHERHIT`, 77 `PLAYERSHOOT`, 1,638 `UPDATEACK`, and 784 `MOVE`
  packets were dropped.
- 40 `PLAYERHIT`, 30 `MOVE`, and 27 `PLAYERSHOOT` packets were injected.

These are deliberate proxy/client behavior, not RealmLib parse loss.

Of 17,444 `AOE` packets, 13,416 are armor-piercing. Common values are damage 25
(9,024), effect 4 (9,255), and radius 0.75 (9,459). `DAMAGE.info` uses all four
values 0-3:

- 0: 45,498
- 1: 2,798
- 2: 2,189
- 3: 343

That is consistent with a two-bit flags field and supports retaining bitmask
semantics.

### AOE/ACK backlog anomaly

Most connections have one accepted-or-dropped `AOEACK` for each `AOE`. The
2,881-packet corpus gap is dominated by one Realm connection in
`session-2026-07-23T17-34-29-781Z`:

- 2,827 `AOE`
- 6 dropped `AOEACK`
- 1 accepted and 38 dropped `PLAYERHIT`
- hundreds of `UPDATE` and `AOE` records share timestamp `1784844562546`
- the connection ends with a six-byte `FAILURE` body and no `ESCAPE` or `DEATH`

This looks like a receive/event-loop backlog or a server burst. It is not
evidence that the AOE parser is wrong, but it is a useful stress fixture for
consumers that correlate server damage with generated acknowledgements.

## Connection, Queue, and HTTP Behavior

The 829 `FAILURE` packets use only currently modeled codes:

| Code | Count | Description                                                    |
| ---: | ----: | -------------------------------------------------------------- |
|    0 |   758 | 663 realm-full, 42 temporary-IP-ban, 13 dungeon-full, 40 empty |
|    3 |    22 | empty; every frame immediately follows `LOAD`                  |
|    5 |    15 | empty; every frame immediately follows `HELLO`                 |
|   15 |    34 | empty; every frame immediately follows `QUEUE_INFORMATION`     |

The code-15 sequence confirms the current `FailureCode.ServerQueue` meaning:
queue positions range 1-18, maximum positions range 5-18, then the server sends
failure 15. Consumers must treat this as queue/session control, not a malformed
connection. Code 3 remains intentionally unresolved; its consistent placement
after `LOAD` is useful context for its comment but not enough to name it.

The AppEngine corpus has 7,802 transactions. The 2,760 `<Error>` responses are:

- 2,753 `/calendar/getForClient`: internal error, wait five minutes
- 3 `/char/list`: wait and reconnect
- 3 `/account/verifyAccessTokenClient`: expired access token
- 1 `/account/verify`: invalid email

This supports exponential/backoff handling around account-service polling.
In particular, repeatedly polling calendar or mission endpoints while the
service asks for five minutes creates noise and avoidable load. No credentials
or token material is included in this report.

## Battle Pass Read Model

No game-socket Battle Pass claim packets are present: ids 149, 150, 234, and
235 have zero records. The corpus therefore cannot validate claim-request or
claim-result wire formats.

It does contain 44 successful `POST /season/bpInfo` responses for pass
`4769974225240064`, `The Astral Path`. Confirmed response details:

- 77 milestones
- `claimed` is an array of string ids, not numbers
- `repeatables` is an object keyed by string milestone id
- final observed repeatable state is `{"77":3}`
- `exalted` transitions from false to true
- `exaltedPrice` is 1200
- both weekly caps are 700,000,000
- reward objects contain `coupons`, `exaltedCoupons`, `credits`,
  `exaltedCredits`, `items`, and `exaltItems`
- item entries contain `amount`, `autoconsume`, and `type`
- milestone 77 carries `bxp_interval = 50,000,000`

Observed progression snapshots include:

|         BXP | Claimed count | Exalted | Repeatables |
| ----------: | ------------: | ------- | ----------- |
| 138,035,180 |             0 | false   | `{}`        |
| 139,076,601 |             0 | false   | `{}`        |
| 266,517,571 |             0 | false   | `{}`        |
| 347,835,301 |            24 | false   | `{}`        |
| 600,944,869 |            77 | true    | `{"77":3}`  |

This validates the current separate Battle Pass read model only. State changes
happened between packet-capture windows, so they cannot be attributed to a
particular socket packet from this data.

## Enum Inventory

### No new numeric enum member

No captured discriminant falls outside the current enums:

- condition effects: 0, 2-7, 14, 16, 19, 22, 27, 30, 35, 38, 48, 49
- damage flags: 0-3 (`Kill` and `ArmorPierce`; no captured `Laser` bit)
- party actions: 6; party action results: 4-6
- active-pet request type: 1 (`Follow`)
- reskin unlock type: 1 (`Skin`)
- trade result: 0 and 1
- favour operation: 0 (`Pet`)

There is no `PETUPGRADEREQUEST` frame in this corpus, so it supplies no new
`PetUpgradeType` evidence. Likewise, no voucher request/result, gift result,
global notification, Battle Pass socket claim, or dash packet is present.

### No new stat id

All observed `STATS` entries are within ids 0-158. No stat id above 158 appears.
Ids 156, 157, and 158 remain insufficiently identified:

- 156: observed values 9-18
- 157: observed values 0-9
- 158: 217,006 observations, range 0-60,000, common values 0, 10,000, and 7,000

Stat 158 appears on many object families, not just players. Do not assign a
specific semantic name from these value distributions alone.

### Condition effects

Packet 166 adds one useful enum observation: effect 38 is present in the
leading effect list while effect 22 remains the magnitude-bearing trailing
effect. Both ids already exist in the client enum (`CURSE` and `STASIS`).

### Show and notification effects

Observed `SHOWEFFECT` ids:

```text
1,2,3,4,5,6,7,8,10,11,12,14,15,16,17,18,19,20,21,22,23,24,25,31,33,35,36,37,38,39,40
```

Observed `NOTIFICATION` ids:

```text
0,1,2,4,5,6,7,8,9,10,11,12,13,14,16
```

No new numeric enum member is required from these sets. Effect 12 needs its
known payload and is implemented in the current source.

## Packet Comment and Naming Updates

The following source comments can be improved directly from this corpus:

- `src/packets/incoming/ally-shoot-packet.ts`: replace the remaining generic
  comments once native field labels or controlled captures identify them.
- `src/packets/incoming/forge-unlocked-blueprints.ts`: the leading
  `unknownFlag` is false in 235 frames and true in 497; the five observed
  blueprint ids are 580, 2881, 2987, 17499, and 28837.
- `src/packets/incoming/trade-done-packet.ts`: `description` is a localization
  JSON string in all seven frames: six success and one cancellation.
- `src/packets/incoming/failure-packet.ts`: add the observed sequence context
  for codes 3, 5, and 15.
- `src/io/packetio.ts`: the class comment now states the actual framing:
  plaintext big-endian total length, plaintext packet id, RC4-encrypted body;
  RC4 state advances for every frame even when no typed listener exists; TCP
  chunks may contain partial or multiple frames.
- `src/io/packetio.ts`: diagnostics can trigger parsing even when no
  packet-type listener exists, and unread bytes are reported explicitly.

## Recommended Remaining Work

1. Replace the remaining placeholder packet comments listed above as
   controlled captures provide evidence.
2. Keep the full-corpus parser and round-trip scans as regression tools. The
   strict replay should remain zero-error, and only explicitly documented
   non-round-trippable packet types should be allowed.

## Follow-up Captures

- Trade an enchanted and an unenchanted copy of the same item to establish
  whether the added UTF field is exactly `ItemData`.
- Vary one temporary stat stack at a time to verify each `StacksState` byte
  against the on-screen counter.
- Send the same chest claim once with leading value 0 and once with value 1
  from a controlled prompt state.
- Capture an actual Battle Pass milestone claim with ids 149/150 visible.
- Change only one power-up or account-level state per session to resolve stats
  156-158 without semantic guessing.
