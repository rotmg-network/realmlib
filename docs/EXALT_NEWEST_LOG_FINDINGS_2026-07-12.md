# Exalt `realmproxy-newest` findings — 2026-07-12

Source: `C:\Users\admin\Documents\DEV\exalt-proxy\logs\realmproxy-newest.ndjson`

## Capture integrity and coverage

The capture is 10,891,215 bytes and contains 30,008 valid JSON packet records
across 24 connection IDs. Its timestamps span 1,033,594 ms (about 17 minutes,
14 seconds). Eight frames are marked modified by the proxy; none are dropped or
injected.

Using the current committed realmlib, all 30,008 raw packet bodies decode with:

- zero unmapped packet IDs;
- zero missing packet factories;
- zero parse errors; and
- zero unread body bytes.

The capture uses build `6.12.0.0.0` and visits Nexus, Daily Quest Room, Pet Yard,
Vault, Realm of the Mad God, and Snake Pit. It contains 53 observed
direction/packet combinations.

The most frequent packets are:

| Packet | Direction | Count | Body bytes |
|---|---:|---:|---:|
| UPDATE | S→C | 6,582 | 12–20,102 |
| UPDATEACK | C→S | 6,567 | 0 |
| NEWTICK | S→C | 4,826 | 16–2,543 |
| MOVE | C→S | 4,782 | 22–142 |
| PLAYERSHOOT | C→S | 1,670 | 32 |
| ENEMYSHOOT | S→C | 906 | 21–26 |
| ENEMYHIT | C→S | 840 | 19 |
| REALM_SCORE_UPDATE | S→C | 632 | 4 |
| AOE / AOEACK | both | 597 each | 26 / 12 |
| SHOOTACK | C→S | 568 | 6 |
| SHOWEFFECT | S→C | 417 | 8–30 |

The activity sequence includes account-level claims 28–34, daily rewards,
multiple character creations using default and custom skins, pet yard/vault
loads, realm combat, and Snake Pit combat.

## CREATE flags: seasonal byte now confirmed

This capture supplies the missing controlled contrast from the master analysis.
CREATE remains seven bytes:

```text
int16 classType
int16 skinType
byte flag0
byte flag1
byte flag2
```

Successful requests correlate with the immediately returned
NEW_CHARACTER_INFORMATION XML as follows:

| Class | Skin | Tail | Returned character | XML seasonal | XML texture |
|---:|---:|---:|---:|---:|---:|
| Rogue `0x0300` | 0 | `00 00 01` | 24 | False | 0 |
| Rogue `0x0300` | 0 | `00 01 01` | 25 | True | 0 |
| Rogue `0x0300` | `0x78da` | `00 01 01` | 26 | True | 30938 |
| Rogue `0x0300` | `0x78da` | `00 01 01` | 27 | True | 30938 |
| Wizard `0x030e` | 0 | `00 01 01` | 28 | True | 0 |
| Wizard `0x030e` | `0x78de` | `00 00 01` | 29 | False | 30942 |
| Wizard `0x030e` | `0x78de` | `00 01 01` | 30 | True | 30942 |

An earlier `030e 78de 00 00 01` attempt received a generic FAILURE, but an
identical retry on the next connection succeeded and returned seasonal false.
The failed attempt therefore does not weaken the successful correlation.

Conclusions:

- `flag1` is definitively the seasonal flag. It changes independently of class
  and skin and exactly matches `<Seasonal>` in every successful result.
- `skinType` is confirmed to carry the selected custom skin: `0x78da = 30938`
  and `0x78de = 30942` exactly match `<Texture>`.
- `flag0` remains zero and `flag2` remains one in every sample. Their semantics
  are still not identified. The earlier `isChallenger` name for `flag0` was not
  proven and has been replaced with a raw flag name.

## Stat 80 is overloaded: pet format is not an enchantment blob

One pet object (object type 32567, object ID 139275, pet name `Baby`) receives
stat 80 with this value:

```text
AAFTBE0AoQC3AAkA
```

Decoded bytes:

```text
00 01 53 04 4d 00 a1 00 b7 00 09 00
```

This is not the player equipment-enchantment format, whose observed header is
`00 02 04`. The same status update contains pet stats 81–85, stat 114 pointing
to owner object 139274, and stat 148 value 1, firmly locating this value on a
pet rather than a player inventory.

Before this update, `parseEnchantments()` treated byte 2 (`0x53`) as a declared
count of 83, consumed the remaining bytes as four supposed enchantment IDs, and
returned `[0x4d04, 0xa100, 0xb700, 0x0900]`. That interpretation was invalid.

Recommended behavior is to discriminate the format before decoding:

- decode enchantment IDs only for the confirmed `00 02 <count>` format;
- expose the header/version and raw bytes for other formats; and
- do not report IDs or an enchanted slot for an unrecognized/pet format.

The semantics of the version-1 pet blob itself remain unknown from one sample.

## Account-level reward confirmation

Seven request/result pairs claim reward IDs 28–34. Every result succeeds and
the confirmed layouts decode without leftovers:

| Reward ID | Selected slots | Granted description |
|---:|---|---|
| 28 | `,1` | `item:Blueprint_48` |
| 29 | `1` | `item:Superburger` |
| 30 | `1` | `boost_loot:2` |
| 31 | `1` | `item:Backpack` |
| 32 | `1` | `char_start_with:all:3:Ring of Defense` |
| 33 | `1` | `fame:800` |
| 34 | `1,2,3` | three Stat Potion Choice Chests |

This independently confirms the `rewardId` interpretation introduced after the
master report and again demonstrates that empty choice positions are meaningful.

## Stat and XML corroboration

- Stat 6 is UTF EXP in all 280 occurrences.
- Stat 24 remains a numeric seasonal flag (305 occurrences, values 0/1).
- Stat 61 is numeric BXP (224 occurrences), ranging from 7,267,850 to 7,363,074.
- Stat 152 is constant account level 34 on the captured characters.
- Stat 153 is account-level XP, increasing from 351,117 to 353,338.
- Stats 71/72 and 127/147 retain the confirmed UTF material/dust map formats.
- Stat 128 is empty or crucible ID `6646626776023040`.
- Stat 130 is 0 or 8 expanded backpack slots.
- Stats 155/156/157 are respectively empty UTF, numeric 9, and numeric 0 in this
  capture. Stat 158 is zero here, but the master corpus already proves nonzero
  values, so it must not be named from this narrower sample.
- A player name appears as `AnAngryPikey,a4cc`, adding another one-suffix example
  but not proving whether the suffix is a title, background, or other decoration.
- All nine NEW_CHARACTER_INFORMATION packets parse successfully as XML fragments.

## SHOWEFFECT observations

Observed effect IDs are 1, 2, 4, 5, 7, 15, 20, 35, 36, and 37. In particular:

- ID 35 occurs once in Realm and remains consistent with Summoner Magic Circle.
- ID 36 occurs six times in Realm with presence mask `0x7f`.
- ID 37 occurs twice in Realm with presence mask `0x60`.

The capture supplies usage evidence for IDs 36/37 but not enough context to name
their rendering semantics. No SHOWEFFECT uses size bit `0x80` in this capture.

## Implemented realmlib update

The findings from this log are now implemented:

1. Stat-80/enchantment decoding is header-aware. Only complete `00 02 <count>`
   equipment blobs produce enchantment IDs; pet/version-1 and truncated blobs
   expose their format/header/raw bytes without false IDs.
2. CREATE exposes the first and third tail values as unproven raw flags and
   retains the confirmed middle flag as `isSeasonal`.
3. Captured seasonal/non-seasonal vectors cover default and custom skins, and
   regression tests cover the pet blob and truncated equipment data.

`flag0` and `flag2` remain deliberately provisional because the capture does not
vary them.

No packet framing change is otherwise required: the complete log decodes cleanly
with the updated realmlib.
