# Exalt proxy log master findings — 2026-07-12

Source corpus: `C:\Users\admin\Documents\DEV\exalt-proxy\logs`

This document supersedes the three per-capture findings files in that directory
and incorporates the separate account-level packet analysis from 2026-07-12.
Every file present in the directory at the final analysis pass was inventoried.
Every NDJSON record was streamed, JSON-decoded, and—where it was a game packet—
reparsed from its raw body using the updated realmlib.

## Corpus and integrity

- 27 files were present: 19 packet captures, five AppEngine captures, and three
  earlier findings documents.
- Packet captures contained 1,641,586 records (521,060,487 bytes) across 483
  per-file connection IDs. Connection IDs restart between captures, so 483 is
  not a count of unique network sessions.
- AppEngine captures contained 1,161 HTTP records (9,491,450 bytes).
- All records were valid JSON.
- The packet logs mark 280 modified frames and 51 injected frames, with no
  dropped frames. Some captures overlap or are extracted from the larger
  timestamped sessions; counts describe the corpus, not independent events.
- After the implementations described below, all 1,641,586 packet bodies parse
  with zero unmapped IDs, factory failures, read errors, or unread bytes.
- All packet captures use game build `6.12.0.0.0` where MAPINFO exposes a build.

## File-by-file coverage

The final column is the number of unresolved parse groups after this update.

| File | Kind | Bytes | Records | Connection IDs | Unresolved |
|---|---:|---:|---:|---:|---:|
| realmproxy-biglog.ndjson | packets | 63,306,112 | 200,000 | 37 | 0 |
| realmproxy-castle1.ndjson | packets | 9,294,099 | 25,831 | 8 | 0 |
| realmproxy-cellar2.ndjson | packets | 22,189,625 | 68,478 | 13 | 0 |
| realmproxy-cults-desync.findings.md | prior findings | 4,966 | — | — | — |
| realmproxy-cults-desync.ndjson | packets | 21,375,538 | 80,883 | 30 | 0 |
| realmproxy-editaccountlist.ndjson | packets | 859,379 | 2,154 | 5 | 0 |
| realmproxy-enchant-dismantle-dupes.ndjson | packets | 19,837,488 | 65,237 | 20 | 0 |
| realmproxy-ep-staff-claimdaily.ndjson | packets | 2,944,800 | 7,733 | 25 | 0 |
| realmproxy-oryx-3.ndjson | packets | 59,182,234 | 200,000 | 9 | 0 |
| realmproxy-oryx-and-winecellar.findings.md | prior findings | 4,756 | — | — | — |
| realmproxy-oryx-and-winecellar.ndjson | packets | 24,798,145 | 76,583 | 26 | 0 |
| realmproxy-packets (1).ndjson | packets | 1,753,978 | 3,947 | 12 | 0 |
| realmproxy-packets (3).ndjson | packets | 4,299,483 | 11,476 | 20 | 0 |
| realmproxy-packets.ndjson | packets | 18,515,085 | 55,637 | 24 | 0 |
| realmproxy-retitle-reskin-etc.ndjson | packets | 4,172,344 | 11,917 | 14 | 0 |
| realmproxy-sessionOne.findings.md | prior findings | 5,591 | — | — | — |
| realmproxy-sessionOne.ndjson | packets | 5,022,715 | 13,016 | 18 | 0 |
| session-2026-07-09T23-01-52-493Z-appengine.ndjson | AppEngine | 2,915,791 | 289 | — | — |
| session-2026-07-09T23-01-52-493Z-packets.ndjson | packets | 40,563,053 | 124,044 | 37 | 0 |
| session-2026-07-10T01-44-20-510Z-appengine.ndjson | AppEngine | 1,843,168 | 395 | — | — |
| session-2026-07-10T01-44-20-510Z-packets.ndjson | packets | 105,199,346 | 332,598 | 57 | 0 |
| session-2026-07-10T11-36-43-674Z-appengine.ndjson | AppEngine | 3,040,196 | 270 | — | — |
| session-2026-07-10T11-36-43-674Z-packets.ndjson | packets | 56,303,621 | 177,364 | 61 | 0 |
| session-2026-07-12T13-41-59-786Z-appengine.ndjson | AppEngine | 676,999 | 127 | — | — |
| session-2026-07-12T13-41-59-786Z-packets.ndjson | packets | 46,244,155 | 141,429 | 48 | 0 |
| session-2026-07-12T20-29-40-150Z-appengine.ndjson | AppEngine | 1,015,296 | 80 | — | — |
| session-2026-07-12T20-29-40-150Z-packets.ndjson | packets | 15,199,287 | 43,259 | 19 | 0 |

Capture-specific highlights:

- `biglog`, `castle1`, `cellar2`, `oryx-3`, and the timestamped July 9/10 logs
  provide the broad combat, effect, stat, Oryx, Wine Cellar, Lost Halls, Cultist,
  and inventory coverage.
- `cults-desync` covers conversion, creation, guild flows, and the Cultist
  modifier/stat cases that originally exposed desynchronization.
- `editaccountlist` confirms lock/ignore list edits; its ten EDITACCOUNTLIST
  requests and the equivalent timestamped capture decode consistently.
- `enchant-dismantle-dupes` and `packets (3)` cover forge, enchantment rerolls,
  one- and three-item blacksmith dismantles, and dust changes.
- `ep-staff-claimdaily` covers daily quest fetch/claim and daily-login packets.
- `retitle-reskin-etc` and its timestamped source cover RETITLE, RESKIN, mission,
  chest reward, enchantment, pet, and daily-login flows.
- `sessionOne`, `packets`, `oryx-and-winecellar`, and their timestamped sources
  corroborate seasonal conversion/creation and dungeon combat findings.
- The final July 12 session covers all 35 account-level claims, character death,
  seasonal creation, NEW_CHARACTER_INFORMATION, and progress telemetry.

## Packet frequency and protocol coverage

The corpus contains 93 observed direction/packet combinations. The busiest are:

| Packet | Direction | Count | Body bytes |
|---|---:|---:|---:|
| DAMAGE | S→C | 254,951 | 14–15 |
| UPDATE | S→C | 224,036 | 12–34,862 |
| UPDATEACK | C→S | 223,345 | 0 |
| NEWTICK | S→C | 151,384 | 16–4,866 |
| MOVE | C→S | 151,011 | 22–154 |
| SHOWEFFECT | S→C | 124,403 | 2–30 |
| ENEMYSHOOT | S→C | 99,143 | 21–26 |
| PLAYERSHOOT | C→S | 73,084 | 32 |
| SHOOTACK | C→S | 67,701 | 6 |
| ENEMYHIT | C→S | 54,475 | 19 |
| ALLYSHOOT | S→C | 44,425 | 15 |
| OTHERHIT | C→S | 40,697 | 14 |
| SERVERPLAYERSHOOT | S→C | 36,792 | 29–34 |
| NOTIFICATION | S→C | 31,958 | 2–154 |
| REALM_SCORE_UPDATE | S→C | 19,986 | 4 |

All previously reconstructed packet layouts—including DAMAGE, DEATH, MAPINFO,
UPDATE, notifications, inventory acknowledgements, combat packets, forge,
crucible, retitle, chest rewards, daily items, and account-level rewards—were
validated against every occurrence in the corpus.

## Newly corrected layouts from the full corpus

### BLACKSMITH_REQUEST (195)

The leading byte is an unsigned item count, not an unknown action byte. It is
followed by exactly that many `SlotObjectData` values:

```text
uint8 count
SlotObjectData slots[count]
```

Both one-item (13-byte) and three-item (37-byte) requests were captured. The
three-item body targets slots 4, 7, and 5 of object 585.

### BLACKSMITH_DISMANTLE (196)

The response is:

```text
bool success
uint8 count
SlotObjectData slots[count]
```

The one- and three-item responses mirror their requests. Successful dismantles
return `objectType = -1` for each emptied slot.

### QUEST_REDEEM (58)

The sole current-build sample completely decodes as:

```text
UTF questId
int32 item
int16 slotCount
SlotObjectData slots[slotCount]
int16 trailingValue
```

Observed values were quest ID `6475722579804160`, item `47369`, one slot
`(objectId=212, slotId=4, objectType=34734)`, and trailing value zero. The item
field is corroborated by the live client source. The trailing short is retained
but remains semantically unnamed because only one value was captured.

### REROLL_ALL_ENCHANTMENTS (189)

Twenty-seven samples have six- or seven-byte bodies. The existing leading byte,
two shorts, and final byte remain valid. One mode adds an optional byte before
the final byte:

```text
byte leadingValue
int16 slotOrIndex
int16 secondaryValue
[byte optionalMode]
byte trailingValue
```

The unique seven-byte vector is `01 0008 ffff 01 00`. The optional byte is not
named more strongly from a single occurrence.

### SHOWEFFECT size and IDs

Presence-mask bit `0x80` means a signed byte `size`; the default when absent is
100. It is no longer represented as a generic extra byte. Across 124,403 frames,
effect IDs observed were 1–8, 10–23, 25–26, 31, 33, and 35–40. ID 35 is the
client-confirmed Summoner Magic Circle. IDs 36–40 are represented explicitly but
remain unnamed until their render semantics are controlled or recovered.

## Consolidated confirmed findings

- CREATE is always seven bytes in all 19 samples: two shorts followed by three
  flag bytes. Captured class types are 768, 782, and 797; every observed tail is
  `00 01 01`. This supports the current three-byte representation but still does
  not independently identify all flag names because no contrasting tail exists.
- Account-level reward IDs 232/233 are confirmed by 35 request/response pairs:
  UTF selected-choice slots + int32 account level, then bool success + compressed
  account level + UTF granted description.
- Packet 165 is one UTF progress/pool string. The corpus expands the vocabulary
  to `prog`, `pool`, and `trees`, including combined `pool/...|#prog/...` and
  `pool/...|#trees/...` strings. Tuple semantics remain provisional.
- Stat 6 is a UTF EXP value (6,544 occurrences), and treating it as numeric would
  desynchronize the status array.
- Stat 24 is the seasonal flag (8,644 numeric occurrences, values 0/1).
- Stat 61 is BXP, not alternate texture (5,095 numeric occurrences). It reaches
  266,517,571 across the multi-account corpus.
- Stats 71/72 and 127/147 are UTF material/dust amount and cap maps. Stat 128 is
  a UTF crucible identifier, empty or `6646626776023040` here. Stat 121 is a UTF
  modifier list. Stat 130 is expanded backpack slots (0 or 8).
- Stat 152 behaves as account level across multiple accounts (597 occurrences,
  values 5–89). Stat 153 behaves as account-level XP (5,712 occurrences, range
  2,825–17,209,745). AppEngine Account/Chars XML independently exposes matching
  `AccountLvl` and `ALXPCurrent` concepts.
- Stat 80 enchantment strings use a three-byte header, declared slot count,
  little-endian uint16 IDs, `0xfffd` empties, and optional suffix bytes. The full
  corpus validates decoding without consuming suffixes as enchantments.
- NEW_CHARACTER_INFORMATION strings may be XML fragments with siblings after
  `</Char>` and must be parsed under a synthetic root. Equipment preserves an
  optional `#uniqueItemId` component; quickslots use item/count pairs.
- UPDATE ends after its drop array in current captures unless an actual optional
  byte is present. MAPINFO realm tails and the extended DEATH layout remain
  fully validated.

## Still unidentified or deliberately provisional

No parsing defect remains, but these semantics are not justified strongly enough
to name:

- Stat 74 is a multiplier-like numeric value (131,191 samples, 700–1,100).
- Stat 75 is object/texture-like (8,724 samples, 0–65,466).
- Stat 148 occurs on many non-player objects with values 0–8.
- Stat 149 is usually -1 on players but has value 2648 in some player records.
- Stat 154 is zero in all 426 player samples.
- Stat 155 is an empty UTF string in all 8,589 samples.
- Stats 156/157 correlate with player class/object types but span 9–19 and 0–10.
- Stat 158 is not “always zero”: 120,935 samples include 0, 3,000, 4,000, 5,000,
  6,000, 7,000, and 10,000 across many entity types.
- SHOWEFFECT IDs 36–40 and the optional REROLL_ALL_ENCHANTMENTS mode byte need
  controlled captures or authoritative client behavior before semantic naming.
- Packet 224 remains structurally known as one int32 but semantically unknown;
  the corpus contains one sample.

## AppEngine correlation

The five HTTP logs cover 44 endpoint spellings. High-value endpoints include
`/account/list`, `/char/list`, `/account/verify`, `/accountLevelRewards/getConfig`,
daily login, missions, seasons, achievements, shop/deals, dust costs, pet skins,
and public static data. Response roots include `Account`, `Chars`, `AppSettings`,
`LoginRewards`, `Missions`, `CompetitionData`, `Deals`, and `PetSkins`.

These records corroborate account level/XP, character seasonal state, BXP,
equipment unique IDs, dust/material maps and caps, account-level reward config,
and character XML fragment handling. Authentication material in the captures is
redacted; the master report intentionally contains no credentials or access
tokens.

## Implemented in realmlib

1. Added a reproducible streaming corpus analyzer at
   `scripts/analyze-log-corpus.cjs`.
2. Corrected blacksmith request/result packets to count-prefixed slot arrays.
3. Corrected QUEST_REDEEM to include its int32 item and trailing short.
4. Added the optional REROLL_ALL_ENCHANTMENTS mode byte.
5. Corrected SHOWEFFECT bit `0x80` to the size field and expanded VisualEffect
   coverage through ID 40 without inventing names for unknown effects.
6. Retained the previously implemented account rewards, progress update,
   stat/BXP/account-level, enchantment, XML fragment, and name-decoration fixes.
7. Added captured-vector and round-trip tests for every new correction.

Final verification: 143 tests pass, TypeScript compilation succeeds, and a
post-build replay of the full packet corpus reports zero unresolved frames.
