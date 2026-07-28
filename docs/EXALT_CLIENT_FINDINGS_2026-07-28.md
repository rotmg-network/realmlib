# Current Exalt Client Findings - 2026-07-28

## Scope

This scan covers the current Windows client extracted at:

`/Users/admin/dev/rotmg-extractor/output/publish/windows/client/current`

The build identifies itself as Exalt `6.12.0.2.0`, build
`8962e0af9385d908e270cac3248d393303e989e8e`, with build hash
`cc966f991107921da18bfa387a333d77`. The primary sources were
`packet_structures.json`, `enums.json`, `labels.json`, `readable.cs`, `dump.cs`,
and targeted native disassembly of `GameAssembly.dll`.

## MAPINFO Optional Tail

The 632 non-realm `MAPINFO` packets do not omit an unknown structure. They omit
two realm-only score fields:

```text
if packetReader.remaining > 0:
    int32 maxRealmScore
    int32 curRealmScore
else:
    maxRealmScore = 0
    curRealmScore = 0
```

The client does not read a presence flag. It checks whether bytes remain after
the preceding `int16` field. This explains the corpus exactly: 131 realm
packets contain the eight-byte tail and 632 non-realm packets do not.

Native disassembly also corrected the fields immediately before that tail:

```text
int16 viewRadius
int16 secondRadius
bool unknownBool
int32 unknownInt
UTF dungeonModifiers
int16 unknownTrailingShort
[optional int32 maxRealmScore, int32 curRealmScore]
```

Across all 763 captures, both radius values are 15, the boolean is false, and
the trailing short is -1. The unknown int32 is zero in 762 packets and
`0x120717` in one The Third Dimension packet. RealmLib now preserves tail
presence with `MapInfoPacket.hasRealmScores`, so non-realm packets serialize
byte-for-byte.

## Packet Inventory

The native inventory contains 191 direction-scoped packet registrations.
RealmLib now has a registry entry for every one. Newly added or corrected
registrations include:

| ID | Direction | Current client name | RealmLib type |
| --- | --- | --- | --- |
| 116 | S to C | `ExaltationRedeemInfoMessage` | `EXALTATION_REDEEM_INFO` |
| 123 | S to C | `PlayersListMessage` | `PLAYERS_LIST_MESSAGE` |
| 125 | C to S | `GetPlayersListMessage` | `GET_PLAYERS_LIST_MESSAGE` |
| 131 | C to S | `CustomMapList` | `CUSTOM_MAP_LIST` |
| 132 | S to C | `CustomMapListResponse` | `CUSTOM_MAP_LIST_RESPONSE` |
| 142 | S to C | `DrawDebugShape` | `DRAW_DEBUG_SHAPE` |
| 143 | S to C | `DrawDebugArrow` | `DRAW_DEBUG_ARROW` |
| 144 | S to C | `DashResetMessage` | `DASH_RESET` |
| 184 | S to C | `TutorialStateChangedMessage` | `TUTORIAL_STATE_CHANGED` |
| 191 | C to S | `BuyDusts` | `BUY_DUSTS` |
| 192 | S to C | `BuyDustsResult` | `BUY_DUSTS_RESULT` |
| 198 | C to S | `ResetEnchantmentRerollCount` | `RESET_ENCHANTMENT_REROLL_COUNT` |
| 199 | S to C | `ResetEnchantmentRerollCountResult` | `RESET_ENCHANTMENT_REROLL_COUNT_RESULT` |
| 226 | C to S | `GiftItemsMessage` | `GIFT_ITEMS` |
| 231 | S to C | `StacksMessage` | `STACKS` |

Packet ids are direction-scoped, not globally unique:

- id 215 outgoing is a party join request; incoming is its join result.
- id 217 incoming is a party request response; outgoing is the join-request
  response.

The registry and reconciliation gate now index `(direction, id)` pairs. Numeric
lookups in the legacy bidirectional packet map continue to prefer incoming
definitions.

Four current native structures remain deliberately registered without a packet
factory because their nested framing is not yet certain:

- 135 `RefineResult`
- 136 `BuyRefinement`
- 218 `ForReconnect`
- 238 `GiftNotification`

These should be completed from a wire body or by resolving the exact nested
serializer, not inferred from labels alone.

## Corrected Wire Structures

`PLAYER_SHOOT` ends with two signed bytes, not one `int16`: a raw byte followed
by `PlayerShootSource` (`Primary = 0`, `Ability = 1`).

`Stats` and `StacksMessage` both carry `StacksState`, an eight-byte structure:

```text
u8 hp
u8 mp
u8 attack
u8 defense
u8 speed
u8 vitality
u8 wisdom
u8 dexterity
```

The former `int32 + int32` parser consumed the correct number of bytes but hid
the individual counters. For example, captured bytes
`00 00 02 00 00 00 00 00` mean `attack = 2`, not integer state 512.

`CustomMapListResponse` is:

```text
int32 count
repeat count:
    UTF name
    int32 mapId
    int32 unknownInt
    bool owned
```

The request packet has no body.

## Recovered Enums

High-confidence enums added from `enums.json` and corroborating labels:

- `PlayerShootSource`: Primary 0, Ability 1
- `DebugShape`: Square 0, Circle 1
- `InventoryOwnerType`: Player 0, OtherPlayer 1, Npc 2, Lootbag 3, Pet 4
- `CrucibleType`: Crucibles 0, ModifierEvents 1, BloodRitual 2
- `MissionParticipants`: None 0, RegularOnly 1, SeasonalOnly 2,
  CrucibleOnly 4, All 255
- `TextType`: Xp 0 through BXP 9
- `TutorialType`: None 0 through JournalClickType 15

The current `MapObjectTypes` values 0-60 match RealmLib's existing
`ContainerType`; `MapObjectType` is now exported as the current-client alias.
The client object XML contains 12,387 `SlotType` declarations and no value
outside RealmLib's existing 1-31 enum.

## Validation

The new packet tests cover optional `MAPINFO` tails, direction-reused party
ids, player-list request/response separation, debug drawing, custom maps,
zero-body messages, recovered packet names, stack counters, and the split
enchantment operations. The protocol snapshot and reconciliation script were
updated to represent direction-scoped ids.
