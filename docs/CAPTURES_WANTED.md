# realmlib capture playbook — toward full coverage

## UPDATE 2026-07-27 (late) — client-binary extraction landed

The rotmg-extractor dump (packet_structures.json, 178 vtable-exact layouts +
the incoming message factory) resolved most of this playbook without captures.
Landed in realmlib: 115, 129, 130, 133, 136(doc), 146, 147, 148, 151, 152, 153,
156, 166 (= DamageWithEffect, ex-STASIS), 167, 181 (= ActivateCrucibleResult),
193/194, 198/199, 222, 224 (= UnlockMissionTree), 225, 226, 227, 231,
236, 116, 135(id), 132(id), plus enum batches. **173/175/177/187 and 162 do
not exist in build 6.12.0.2.0** (superseded by the 189–198 cluster), and
**1000 cannot be a wire id** (ids are single bytes).

What captures are still worth taking, in order:

1. **Verification passes** — one real body each for the newly modelled
   packets above (they are client-binary-derived, not wire-observed).
   Highest value: 115+116 (exaltation redeem), 146→147 (skin recycle),
   151→152 (BP milestone boost), 156, 167, 236.
2. **Nested-framing blockers** — 132 (custom map list), 135 (refine result),
   218 (server-name list), 238 (GiftInfo).
   A single body each pins the list/struct framing.
3. **Naming ambiguities** — buy a **dust bundle** at the enchanter (settles
   whether 191/192 are BuyDusts/Result vs reroll-count reset); trigger an
   accelerator gain (separates 153 updated vs 179 added); capture 222's
   context (SaveLockUpdate vs TutorialStateChanged); a gift send (226).
4. **A failed enchant/reroll** — the 190 body should then carry the error
   string after the bool, confirming the truncation-on-success reading.
5. The original wishlist below still applies for enums and `unknown*` fields
   (trades, parties, failures, payment types, effect bitmasks).

Anything below that talks about capturing 173/175/177/187 or "the enchanting
cluster" is obsolete — those ids are gone; enchanting flows through
185/189–192/195–199.

---

Goal: model every packet realmlib registers, name every `unknown*` field, and
fill every enum. This is the shopping list for Exalt captures, organised into
**themed sessions** so one client run knocks out a whole cluster.

Exalt build these target: **6.12.0.2.0** (matches `protocol/exalt-current.json`).

## Capture hygiene — do this for every session

Model quality depends on more than the bytes. For each session keep **both**:

1. **The proxy packet log** (the 28 MB session-style dump), not a pre-sliced
   subset — the interesting packets are often the ones the slices drop.
2. **The appengine / HTTP capture** from the same account+session. Naming a
   field is almost always "the wire number equals the number this XML returns":
   `/char/list`, `/account/listPowerUpStats`, `/missions/getPlayerMissions`,
   `/account/purchaseCustomization`, forge/fame endpoints, etc.

For each packet of interest note: **id**, **direction** (C→S vs S→C), the **full
hex body**, the **packets immediately before/after it** (request/response pairing
is how we tell echoes from new data), and the **account/char state** at the time.

**Wrong beats missing.** A single sample that happens to round-trip is *not*
proof of structure (that mistake is why 0.1–0.4 needed re-doing). Prefer:
- ≥2 samples with a field that actually *varies*, so lockstep coincidences show.
- at least one value that breaks an ambiguity (a count ≥ 65536 to kill int32-vs-
  short; a discriminator taking a third value; a negative to prove signedness).

Legend: **[P]** unmodelled packet (no factory), **[F]** modelled but has
`unknown*` fields to name, **[E]** enum needing more values.

---

## Predicted byte layouts — predict-and-verify

For each unmodelled packet, the layout below is the **hypothesis** to check the
captured bytes against, derived from this build's conventions:

- **Result/ack packets** = `byte success` + `short code` (confirmed on 141).
- **Item/skin lists** = `short count` + `int32[count]` (CHEST_REWARD_RESULT,
  BUY_CUSTOMISATION_SOCKET, CLAIM_REWARDS_INFO_PROMPT).
- **Slot-targeted ops** = `SlotObjectData` = 3 × int32 =
  `int32 ownerObjectId, int32 slotId, int32 itemType` (12 bytes; INVSWAP,
  CLAIM_CHEST_REWARD).
- **Datastore ids** = UTF string = `uint16 length` + utf8 digits (CLAIM_BATTLE_PASS).
- **Toggles** = a single `byte` (0/1); **sentinels** = signed, e.g. `ff` = −1.

Worked example (this is the method): **140** was predicted `short count + {byte,
int32, byte}` and the 19:40 session's `0001 00 00001007 01` matched byte-exact,
with **141** = `01 0000` = `byte success(1) + short code(0)`. Both confirmed.

| id | dir | predicted layout | how to confirm |
|---|---|---|---|
| **115 REDEEM_EXALTATION_REWARD** | C→S | `int32 objType` (class, e.g. 785) `[+ byte stat/index]` | first 4 bytes = the class you exalted; expect a fresh `114` for that class in reply; watch for `ExaltationRedeemInfoMessage` |
| **136 BUY_REFINEMENT** | C→S | `int32 itemType [+ int32 count]` | itemType resolves in objects.xml; reply is `byte success + short code` (new incoming id — flag it) |
| **146 SKIN_RECYCLE** | C→S | `short count + int32[count] skinTypes` (or bare `int32`) | **recycle exactly 2 skins in one action** to prove the count prefix; cross-ref `/account/ownedSkins` |
| **151 BOOST_BP_MILESTONE** | C→S | `string passId + byte milestone` (parallels 149) | passId = `uint16 len`+digits; cross-ref `/season/bpInfo`; reply `BoostBPMilestoneResultMessage` |
| **156 SET_GRAVE_STONE** | C→S | `int32 gravestoneType` | type in objects.xml (gravestone); follow-up `47 RESKIN_UNLOCK` type `4` (Gravestone) |
| **162 SET_TRACKED_SEASON** | C→S | `int32 seasonId` (e.g. 50/51) or `string seasonId` | value = a season id from `/missions/getClientSeasons`; int32 50 = `00000032`, a string starts `0002…` |
| **167 SET_DISCOVERABLE** | C→S | `byte discoverable` (0/1) | capture both toggles — a single `00` / `01` |
| **231 UNKNOWN231** | S→C | `int32 unknown + int32 active` | trigger item `0x946e` while logging local ability phase/cooldown; the corpus confirms `0,1` activation and `0,0` deactivation, but not field-one semantics |
| **173 UNLOCK_ENCHANTMENT_SLOT** | C→S | `SlotObjectData target` (12B) `[+ byte slotIndex]` | the 12B triple = (playerId, invSlot, itemType) of a preceding INVSWAP/USEITEM; stat-80 blob gains a slot |
| **175 UNLOCK_ENCHANTMENT** | C→S | `SlotObjectData target + int32 enchantmentType` | enchantmentType resolves via `EnchantType`; item's `parseEnchantments` changes |
| **177 APPLY_ENCHANTMENT** | C→S | `SlotObjectData target + byte enchantSlot + int32 enchantmentType` | which enchant slot filled matches `byte`; new id in the stat-80 blob = `int32` |
| **187 UPGRADE_ENCHANTMENT** | C→S | `SlotObjectData target + byte enchantSlot` | the upgraded slot index = `byte`; blob's id at that slot bumps |
| **238 GIFT_NOTIFICATION** | S→C | `int32 giftId` or `short count + …` | fires on a received/pending gift; cross-ref `/craigsgift/info`; keep neighbours |
| **166 DAMAGE_WITH_EFFECT** | S→C | `int32 targetId + u8 effectCount + u8[] effects + u16 damage + u8 info + u16 bulletId + int32 ownerObjectId + u8 magnitudeEffect + float magnitude` | vary the leading and magnitude-bearing effects independently; Curse (38) before a Stasis (22) magnitude is already confirmed |
| **148 DAMAGE_BOOST** | S→C | `int32 objectId + int32 amount [+ int32 durationMs]` | objectId = the buffed entity; fires when a damage buff applies |

Each result packet you find that isn't already registered is itself a new id to
add (like 141) — model it `byte success + short code` unless the bytes say
otherwise, and flag it so the id table stays in sync.

---

## Session 1 — Enchanting (fully blind, highest value)

Open the Enchantments screen and perform **each** action once, on an item you can
spare, noting which UI action produced which id/body:

- **[P] 173 UNLOCK_ENCHANTMENT_SLOT** — unlock a new enchant slot.
- **[P] 175 UNLOCK_ENCHANTMENT** — unlock/learn an enchantment.
- **[P] 177 APPLY_ENCHANTMENT** — apply an enchantment to an item.
- **[P] 187 UPGRADE_ENCHANTMENT** — upgrade an existing enchantment.
- Confirm the already-modelled siblings fire too: `189 REROLL_ALL_ENCHANTMENTS`,
  `191 RESET_ENCHANTMENT_REROLL_COUNT` (+ `192` result), `190 ENCHANT`,
  `185 UPGRADE_ENCHANTER`.
- **[E] EnchantType**, **[E] DustType** — vary which enchantment and which dust
  you use so we see more than one enum value; cross-ref the item's stat-80 blob
  (`parseEnchantments`) and any forge/dust XML.

No enchant transaction exists in any capture to date — the 2026-07-27 session
opened the screen but enchanted nothing.

## Session 2 — Exaltation (biggest data blind spot)

Fresh client launch, proxy on, keep both logs.

- **[P] 115 REDEEM_EXALTATION_REWARD** — open the Exaltations panel and redeem
  one reward.
- Capture whatever the panel *loads* on open, plus any `/account/*` HTTP it
  fetches — no exaltation state exists in any capture (`/char/list` doesn't carry
  it). This also finally decides whether id 114 is power-up-only or dual-purpose.
- Note the class exalted and the stat, so the body can be cross-referenced.

## Session 3 — Customisation / wardrobe

- **[F] 140 BUY_CUSTOMISATION_SOCKET** — the two unknown bytes are unseparated.
  Do these as **distinct actions**: equip a single **dye**, then a single
  **cloth**, then **clear** one slot. That splits socket-index-vs-category from
  apply-vs-clear.
- **Ambiguity killer:** touch any customisation item whose type is **≥ 0x10000**
  (65536). One such id settles the int32-vs-short reading of 140 for good.
- **[P] 146 SKIN_RECYCLE** — recycle a skin in the recycler.
- **[P] 156 SET_GRAVE_STONE** — set/select a gravestone.
- **[E] ReskinUnlockType** / **[E] CustomizationCategory** — unlock one of each:
  skin, pet skin, title, gravestone, emote, entrance. `47 RESKIN_UNLOCK` carries
  the category; cross-ref `/account/purchaseCustomization`.
- Fire `51 RESKIN`, `155 RETITLE`, `160 BUY_EMOTE`, `159 EMOTE`,
  `33 PET_CHANGE_SKIN_MSG` for regression coverage.

## Session 4 — Battle pass & seasons

- **[P] 151 BOOST_BP_MILESTONE** — boost/skip a battle-pass milestone.
- **[P] 162 SET_TRACKED_SEASON** — set the tracked season in the seasons UI.
- Re-capture `149 CLAIM_BATTLE_PASS` with the **−1 tier** path ("claim
  everything") to confirm the sentinel against a second sample.
- **[E] MissionTrackingState**, **[E] MissionState** — the season UI drives these.

## Session 5 — Missions

- Claim rewards from **several different missions** (different boards/trees), so
  `163 CLAIM_MISSION`'s `slot` is seen varying independently of `missionId`
  again, on more than one board.
- **[E] MissionObjectiveType**, **[E] MissionRewardKind** — open a spread of
  missions with different objectives/reward kinds; cross-ref
  `/missions/getPlayerMissions`.
- Confirm `165 PROGRESS_UPDATE` and any `MultipleMissionsProgressUpdate`.

## Session 6 — Refinement

- **[P] 136 BUY_REFINEMENT** — buy a refinement upgrade; capture request +
  the result (RefineResult) it draws.

## Session 7 — Vault, inventory, stats

- **[F] 117 VAULT_CONTENT** (1 unknown) — open vault, gift chest, material
  storage; move items in/out. Cross-ref `/char/list` vault/material contents.
- **[F] 95 INVRESULT** (1 unknown) + **[E] InvResultOrigin** / **[E]
  InvResultFlags** — do inventory swaps/drops that succeed *and* fail (full
  inventory, soulbound, etc.) so more flag/origin values appear.
- **[F] 139 STATS** (2 unknowns, `unknownInt1/256` step) — capture the STATS
  packet across a level-up / stat change to see what the step tracks.
- **[F] 55 INVSWAP / 19 INVDROP** — vary source/target containers (equip, pack,
  vault, pet feed) for the `SlotObjectData` coverage.

## Session 8 — Trading

- **[E] TradeResult** — run trades that end every way: completed, cancelled by
  each side, and a declined/failed trade. Capture `86 TRADESTART`
  (**[F]** 1 unknown), `28 TRADECHANGED`, `34 TRADEDONE`, `14 TRADEACCEPTED`.

## Session 9 — Party

- **[E] PartyAction** / **[E] PartyActionResult** / **[E] PartyResponse** — run
  the full matrix: create, invite, accept, decline, join-request, approve/deny,
  kick, leave, disband. Covers `200/204/207/208/209/210/212/214/215/217` and
  **[F] 210 INCOMING_PARTY_MEMBER_INFO** (1 unknown) and **[F] 215
  PARTY_JOIN_REQUEST** (1 unknown).

## Session 10 — Social, gifts, privacy

- **[P] 167 SET_DISCOVERABLE** — toggle discoverable on/off (capture both).
- **[P] 238 GIFT_NOTIFICATION** (incoming) — have someone gift you an item, or
  claim a pending gift, to trigger it; cross-ref any GiftInfo HTTP.

## Session 11 — Forge / blacksmith

- **[F] 120 FORGE_UNLOCKED_BLUEPRINTS** (1 unknown) — open the forge; capture
  the blueprint list. Cross-ref forge/blueprint XML.
- `118 FORGE_REQUEST` / `119 FORGE_RESULT`, `195 BLACKSMITH_REQUEST`,
  `196 BLACKSMITH_DISMANTLE` — forge and dismantle one item each.
- **[E] DustType** again if not covered in Session 1.

## Session 12 — Combat & effects (opportunistic, run a dungeon)

- **[P] 148 DAMAGE_BOOST** (incoming) — trigger a damage-boost effect (berserk /
  damaging buff consumable) and capture it mid-combat.
- **166 DAMAGE_WITH_EFFECT** — fight enemies with several magnitude-bearing
  conditions. The generic layout and incoming direction are confirmed; vary
  the leading and trailing effects independently to refine semantics.
- **[F]** shooting packets with unknown fields, captured in live combat:
  `49 ALLYSHOOT` (2), `12 SERVERPLAYERSHOOT` (2), `30 PLAYERSHOOT` (2),
  `46 DEATH` (1), `18 GOTO` (1), `42 UPDATE` (1), `92 MAPINFO` (3).
- **[E] ConditionEffectBits / ConditionEffectBits2 / VisualEffect /
  ParticleEffect** — get hit by a variety of status effects and abilities so the
  effect bitmasks and visual/particle ids are exercised.

## Session 13 — Custom maps

- **[P] 131 CUSTOM_MAP_LIST** — open the custom-maps list.
- **[P] 129 CUSTOM_MAP_DELETE** — delete a custom map.
  (Only worth it if you use the Realm Editor / custom games at all.)

## Session 14 — Reconnect & loading transitions

- **[P] 218 FOR_RECONNECT** / **[P] 222 LOADING_SCREEN** — capture a full
  nexus → realm → dungeon → nexus cycle and any forced reconnect; these fire on
  transitions and are currently `unknown`-direction guesses.

## Session 15 — Currencies & failures

- **[E] PaymentType** — buy the *same kind* of thing with **gold**, **fame**, and
  **realm gold / credits** so every payment enum value is seen (`85 BUY`,
  `102 CHECKCREDITS`, `223 PURCHASE_REQUEST`, `22 BUYRESULT`).
- **[E] FailureCode / FailureMessage / ProtocolError** — deliberately trigger
  failures: bad name choice, insufficient funds, wrong password prompt, an
  out-of-sync move. `0 FAILURE` carries these.

---

## Lower priority / probably skip

`133 CREEP_HIT`, `147 UNKNOWN147`, `1000 IP_ADDRESS` are niche or internal.
`218`/`222` are low value beyond confirming direction. Model only if a capture
lands in your lap.

## Enums that are data-driven, not capture-driven

`ObjectType`, `PortalType`, `ContainerType`, `Classes`, `StatType`,
`GameId`, `ContainerArea`, `ItemCategory` come from the game's XML assets, not
from packet captures — fill them from `objects.xml` / assets, not proxy logs.

## Quick cross-reference: gap → session

| Gap | Where |
|---|---|
| 115, exaltation state | S2 |
| 136 | S6 |
| 140 unknown bytes | S3 |
| 146, 156, customization enums | S3 |
| 148, 166, effect enums, shoot unknowns | S12 |
| 151, 162, BP −1 tier | S4 |
| 167, 238 | S10 |
| 173/175/177/187, EnchantType, DustType | S1 |
| 129/131 | S13 |
| 218/222 | S14 |
| Mission enums, CLAIM_MISSION spread | S4/S5 |
| Vault/InvResult/STATS unknowns | S7 |
| TradeResult | S8 |
| Party enums + unknowns | S9 |
| Forge blueprints unknown | S11 |
| PaymentType, Failure enums | S15 |
