# Account-mutation and reward protocol audit

> **Superseded implementation note (2026-08-01):** the exhaustive registry,
> native-serializer, and expanded-log replay in
> [`docs/FULL_PROTOCOL_AUDIT_2026-08-01.md`](docs/FULL_PROTOCOL_AUDIT_2026-08-01.md)
> found additional wire defects that this narrower audit missed. In particular,
> the layouts stated below for incoming IDs 93, 117, 220, and 233 are not safe
> implementation guidance, and the linked report contains further signedness
> and semantic corrections. It is authoritative for the next protocol
> implementation wave; this file remains useful for mutation reconciliation
> policy and compatibility history.

Audited 2026-08-01. This is a defensive wire-compatibility audit: no packet was
sent to a live service. Conclusions distinguish client serializer evidence,
redacted local captures, and assumptions that still require a controlled private
server capture.

## Scope, versions, and evidence

- RealmLib baseline: `87b0ead` plus the pre-existing working-tree changes that
  renamed packet 224. The audit preserves its deprecated `Unknown224Packet` and
  `unknownInt` compatibility surface.
- Protocol snapshot: Exalt **6.12.0.2.0**, metadata version 31
  (`protocol/exalt-current.json`).
- Local extraction check: `rotmg-extractor/output/publish/windows/client/current`
  resolves to the same locally available `6.12.0.2.0-cc966f991107921da18bfa387a333d77`
  serializer catalog. No newer local catalog was found.
- Evidence order: native serializer/catalog, raw directional packet capture,
  repeated decoded capture, then repository fixtures. Names inferred only from
  a token or a single sample remain raw.

### Log-corpus manifest (redacted)

| Corpus                       |     Files examined | Session time source                | Encoding / direction                                                      | Deduplication and use                                                                                     |
| ---------------------------- | -----------------: | ---------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `ProdMafia/Local Store/logs` |   119 `.log` files | `session-YYYY-MM-DD_HH-MM-SS` name | human-readable client logs; no reliable raw direction                     | retained as contextual client/version evidence only                                                       |
| `exalt-proxy/logs`           | 52 `.ndjson` files | ISO timestamp in name / `time`     | UTF-8 NDJSON, `dir`, numeric `id`, decoded `type`, raw `body`, `leftover` | SHA-256 de-duplication of packet NDJSON found 66 distinct bodies among 110 files across proxy + Downloads |
| `Downloads/logs`             | 58 `.ndjson` files | ISO timestamp in name / `time`     | same proxy schema; appengine files are HTTP-side, not socket frames       | used only where packet direction/framing was present                                                      |

The manifest deliberately records paths only at corpus level and never copies
account IDs, character IDs, keys, voucher strings, recipient names, raw bodies,
or HTTP credentials into this report. Representative values below are synthetic
or public item/type constants. Packet captures cover forge, blacksmith, gift,
account-list, reskin, and ground-damage flows; most named claim packets have no
new raw capture in this pass, so their layout confidence is serializer-backed.

## Direction-scoped inventory and layouts

All fixed-width values are big-endian. `str16` means an unsigned 16-bit UTF-8
**byte** length followed by bytes. `Slot` is three signed int32 values in order
`objectId, slotId, objectType`. `cint` is the signed DECA compressed integer.
`u8`/`i8`, `u16`/`i16`, and `i32` state both width and signedness. Array reads
allocate a fresh array, so a second decode cannot retain a prior packet's data.

### Outgoing claims, purchases, mutations, and edits

|  ID | Class (compatibility name)                     | Exact body layout                                                                                  | Confidence / notes                                                                                        |
| --: | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
|   3 | `ClaimDailyRewardMessage`                      | `str16 claimKey, str16 claimType`                                                                  | confirmed layout; key/type values are account-specific                                                    |
|  27 | `EditAccountListPacket`                        | `i32 accountListId, bool8 add, i32 objectId`                                                       | confirmed; `0=Lock`, `1=Ignore`; object ID is not an account-id string                                    |
|  48 | `GoToQuestRoomPacket`                          | empty                                                                                              | confirmed ignored/request behavior only; causes reconnect flow, not an account write                      |
|  51 | `ReskinPacket`                                 | `i32 skinId`                                                                                       | strongly supported; result/state is not a direct acknowledgement                                          |
|  85 | `BuyPacket`                                    | `i32 objectType, i32 quantity`                                                                     | confirmed layout; server owns price/currency validation                                                   |
|  97 | `ChooseNamePacket`                             | `str16 name`                                                                                       | confirmed layout; Unicode normalization/server limits unresolved                                          |
| 103 | `GroundDamagePacket`                           | `i32 time, float32 x, float32 y`                                                                   | confirmed gameplay acknowledgement, not persistent account mutation                                       |
| 115 | `RedeemExaltationRewardPacket`                 | `i32 itemId`                                                                                       | confirmed native setter/owner name; retain `unknownInt` compatibility alias                               |
| 118 | `ForgeRequestPacket`                           | `i32 resultItemType, i32 count, Slot[count]`                                                       | confirmed; count is element count, minimum 12 bytes/item                                                  |
| 136 | `BuyRefinementPacket`                          | `Slot, i16 action, u8 count, u8 modifierIndex[count]`                                              | confirmed native serializer; actions 1–4 modeled; byte narrowing is intentional                           |
| 140 | `BuyCustomisationSocketPacket`                 | `i16 count, (u8 category, i32 itemType, u8 currency)[count]`                                       | confirmed native names/types; retain raw-byte compatibility aliases                                       |
| 146 | `SkinRecyclePacket`                            | `Slot`                                                                                             | confirmed layout; slot state must be reconciled from inventory                                            |
| 149 | `ClaimBattlePassPacket`                        | `str16 passId, i8 tier`                                                                            | confirmed; `-1` observed sentinel, exact server semantics unresolved                                      |
| 151 | `BoostBpMilestonePacket`                       | `str16 passId, u8 milestone`                                                                       | confirmed native type; observed values remain low                                                         |
| 154 | `ConvertSeasonalCharacterPacket`               | empty                                                                                              | confirmed empty request; authoritative state arrives through refresh/reconnect                            |
| 155 | `RetitlePacket`                                | `i32 titleId, i32 secondaryTitleId`                                                                | confirmed layout/order; zero is observed empty/sentinel                                                   |
| 156 | `SetGraveStonePacket`                          | `i32 gravestoneType, i32 unknownInt2`                                                              | first value resolved from current native field flow; second remains raw                                   |
| 160 | `BuyEmotePacket`                               | `i32 emoteType`                                                                                    | confirmed layout                                                                                          |
| 163 | `ClaimMissionPacket`                           | `i32 boardId, i32 missionId, u8 slot, u16 subId`                                                   | confirmed capture + native types; `subId=65535` is the observed sentinel                                  |
| 167 | `SetDiscoverablePacket`                        | `bool8 discoverable, i16 icon`                                                                     | confirmed native name; all 71 unique official captures use icon 1                                         |
| 171 | `ClaimChestRewardPacket`                       | `u8 execute, Slot, i16 choiceIndex`                                                                | confirmed. `execute=1` commits; `0` observed with no direct result. Choice applies to type-2 prompt pools |
| 189 | `RerollAllEnchantmentsPacket`                  | `u8 artifactMode, u16 equipmentSlotId, i16 artifactInventorySlot, u8 count, u8 lockedIndex[count]` | confirmed serializer; `artifactInventorySlot=-1` observed sentinel                                        |
| 191 | `BuyDustsPacket`                               | `str16 value`                                                                                      | confirmed layout; raw value semantics unresolved                                                          |
| 193 | `PurchasePetShaderPacket`                      | `i32 petId, i32 unknownInt`                                                                        | confirmed serializer; second value unresolved                                                             |
| 195 | `BlacksmithRequestPacket`                      | `u8 count, Slot[count]`                                                                            | confirmed; fresh array avoids stale slots                                                                 |
| 198 | `ResetEnchantmentRerollCountPacket`            | `str16 value`                                                                                      | confirmed layout; raw value semantics unresolved                                                          |
| 219 | `RedeemVoucherPacket`                          | `str16 code`                                                                                       | confirmed layout; never log or retry a code automatically                                                 |
| 223 | `PurchaseRequestPacket`                        | `str16 request`                                                                                    | confirmed envelope; observed comma-separated content is only strongly supported                           |
| 224 | `UnlockMissionTreePacket` (`Unknown224Packet`) | `i32 boardId`                                                                                      | confirmed catalog + capture; compatibility aliases retained                                               |
| 225 | `UnlockMissionPacket`                          | `i32 boardId, i32 missionId`                                                                       | confirmed serializer; no new capture                                                                      |
| 226 | `GiftItemsPacket` (`Unknown226Packet`)         | `str16 items, str16 recipient`                                                                     | confirmed serializer; both fields stay raw                                                                |
| 232 | `ClaimAccountLevelRewardPacket`                | `str16 selectedChoiceSlots, i32 rewardId`                                                          | confirmed; commas/empty positions are meaningful                                                          |
| 234 | `ClaimRewardPacket`                            | `u8 columnId` (`unknownByte` / `track` compatibility aliases)                                      | competition column 0/1, not a free/premium Battle Pass selector                                           |
| 239 | `ClaimRewardsInfoRequestPacket`                | `i32 chestItemType`                                                                                | confirmed; response prompt echoes type                                                                    |

Every string uses UTF-8 byte length, not character length. Writer range checks
reject NaN, non-integral values, and values outside the encoded width. The wire
format does not contain an operation, transaction, or callback ID for any
audited outgoing request.

### Incoming direct results and state packets

|  ID | Class                                     | Exact body layout                                                                                                        | Completion role                                                       |
| --: | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
|  21 | `NameResultPacket`                        | `bool8 success, str16 errorText`                                                                                         | direct name result; no canonical name is returned                     |
|  22 | `BuyResultPacket`                         | `i32 result, str16 resultString`                                                                                         | direct result, result code semantics unresolved                       |
|  93 | `ClaimDailyRewardResponse`                | `str16 message`                                                                                                          | exact current native layout; no raw capture                           |
|  99 | `AccountListPacket`                       | `i32 accountListId, i16 count, str16 accountId[count], i32 lockAction`                                                   | `-1` snapshot, `0` remove, `1` add; account IDs are strings           |
| 107 | `ReskinUnlockPacket`                      | `u8 unlockType, i32 unlockId`                                                                                            | unlock/state signal, not necessarily an ack for reskin selection      |
| 114 | `ExaltationUpdatePacket`                  | `i16 classType, cint dex,spd,vit,wis,def,atk,mana,life`                                                                  | confirmed power-up totals, not an exaltation claim result             |
| 116 | `ExaltationRedeemInfoPacket`              | `bool8 result, str16 message`                                                                                            | direct result for 115 flow only by catalog/name; correlation unproven |
| 119 | `ForgeResultPacket`                       | `bool8 success, u8 count, Slot[count]`                                                                                   | direct forge result; zero-count success is valid                      |
| 120 | `ForgeUnlockedBlueprints`                 | `bool8 rawFlag, cint count, cint blueprintId[count]`                                                                     | blueprint state update                                                |
| 135 | `RefineResultPacket`                      | `bool8 success, [Slot, str16 uniqueData if success]`                                                                     | conditional tail is confirmed; raw unique-data preserved              |
| 141 | `BuyCustomisationSocketResultPacket`      | `bool8 success, str16 message`                                                                                           | direct result                                                         |
| 147 | `SkinRecycleResponsePacket`               | `bool8 result, Slot`                                                                                                     | result plus resultant slot identity                                   |
| 150 | `ClaimBpMilestoneResultPacket`            | `bool8 success`                                                                                                          | direct acknowledgement only; grant may be separate flow               |
| 152 | `BoostBpMilestoneResultPacket`            | `bool8 result`                                                                                                           | direct acknowledgement only                                           |
| 164 | `ClaimMissionResultPacket`                | `u8 slot, bool8 success, str16 message`                                                                                  | correlates only by slot; board/mission absent                         |
| 170 | `ClaimRewardsInfoPromptPacket`            | `i32 chestItemType, u8 chestType, i16 count, i32 itemType[count]`                                                        | pre-claim pool, not success                                           |
| 172 | `ChestRewardResultPacket`                 | `i16 count, i32 itemType[count]`                                                                                         | grant list; no success flag                                           |
| 192 | `BuyDustsResultPacket`                    | `bool8 success`                                                                                                          | direct acknowledgement only                                           |
| 194 | `PetShaderPurchaseResultPacket`           | `bool8 result`                                                                                                           | direct acknowledgement only                                           |
| 196 | `BlacksmithDismantlePacket`               | `bool8 success, u8 count, Slot[count]`                                                                                   | direct blacksmith result                                              |
| 199 | `ResetEnchantmentRerollCountResultPacket` | `bool8 success`                                                                                                          | direct acknowledgement only                                           |
| 220 | `VoucherResultPacket`                     | `bool8 success, str16 error, str16 code, [str16 name, str16 items, i32 gold, i32 discount, bool8 battlePass if success]` | fixed conditional schema; arbitrary string iteration is unsafe        |
| 227 | `GiftResultPacket`                        | `bool8 result, bool8 raw, str16 raw1, raw2, raw3`                                                                        | sender-side result only; recipient delivery separate                  |
| 233 | `ClaimAccountLevelRewardResultPacket`     | `bool8 success, u8 rewardId, [str16 description if success]`                                                             | conditional description; captured `rewardId=255` disproves `cint`     |
| 235 | `ClaimRewardResultPacket`                 | `bool8 success, str16 xml, str16 trailingString`                                                                         | result manifest; second string observed empty but must be read        |
| 237 | `ClaimDailyItemPacket`                    | `u8 flag, str16 key, str16 category`                                                                                     | daily state/update, not a universal claim ack                         |
| 238 | `GiftNotificationPacket`                  | `i32 unknownInt, str16 giftInfoJson`                                                                                     | recipient/pending-gift notification; JSON preserved raw if invalid    |

`FailurePacket`, `InvResultPacket`, `VaultContentPacket`, `UpdatePacket`,
`NewTickPacket`, `StatsPacket`, `StacksPacket`, `ProgressUpdatePacket`,
`UnlockInformationPacket`, `UpgradeEnchanterPacket`, `EnchantPacket`,
`AcceleratorUpdatedPacket`, `NotificationPacket`, `GlobalNotificationPacket`,
`ReconnectPacket`, and `ForReconnectPacket` are reconciliation evidence, not a
universal acknowledgement. In particular, an INVRESULT use acknowledgement does
not prove consumption; inspect authoritative inventory state.

## Request/result correlation and reconciliation matrix

| Request family                          | Candidate response / correlation                         | Authoritative success                                  | Ambiguous timeout/reconnect handling                                                               | Confidence                         |
| --------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| daily                                   | 93, 237, failure                                         | 93 plus refreshed daily/inventory state                | mark unknown; refresh; never replay key automatically                                              | strongly supported                 |
| mission/tree unlock                     | 164 (slot only), progress/notification, failure          | matching slot plus mission-state refresh               | one in flight per board/slot; reconnect invalidates local pending state                            | strongly supported                 |
| generic/battle-pass/account-level claim | 235, 150, 233, notification/stats/inventory              | direct success plus reward/account refresh             | no operation ID: serialize account-wide claims and refresh before any retry                        | strongly supported                 |
| chest                                   | 170 prompt by chest type; 172 after execute=1; inventory | 172 plus slot/inventory update                         | do not replay; chest may already be consumed after a lost result                                   | confirmed                          |
| voucher                                 | 220                                                      | 220 result plus account refresh                        | never automatic retry; code can have committed                                                     | confirmed layout, policy inference |
| forge/blacksmith/refine/recycle/reroll  | 119/196/135/147/199, INVRESULT/update/vault              | result plus returned slot/inventory snapshot           | one in flight per overlapping `objectId:slotId`; refresh before retry                              | strongly supported                 |
| purchases/dusts/pet/customisation/emote | 22/192/194/141, notification/stats/inventory             | result plus currency/delivery state                    | no client price/currency is authoritative; retry only after refresh                                | strongly supported                 |
| gift                                    | 227 sender result; 238 recipient notification            | sender result and independent recipient delivery       | no automatic retry; sender and recipient have separate convergence                                 | strongly supported                 |
| account list/name/profile               | 99/21/unlock/notification, failure                       | 99 snapshot (`-1`) or incremental add/remove (`1`/`0`) | per-list/session generation required by consumer; stale result must not overwrite newer local edit | strongly supported                 |

## Confirmed changes and deterministic coverage

1. **Packet 224 integration repaired.** `UnlockMissionTreePacket` is now
   exported under its canonical name and registered factory can build again.
   `Unknown224Packet` and `unknownInt` remain deprecated aliases. The protocol
   snapshot now names the canonical class.
2. **Compatibility aliases retained.** The renamed ShootAck field still exposes
   deprecated `unknownShort`; notification effect 99's compatibility alias
   remains exported.
3. **Regression tests added.** `test/account-mutation-reward-audit.spec.ts`
   verifies direction-plus-ID lookup, 224 aliases, signed battle-pass sentinel,
   conditional account-level tails, result-array clearing on repeated reads,
   voucher string resetting, forge slot round trips, and account-list reset.
4. **Mutation reconciliation implemented.** `MutationCoordinator` provides
   opt-in operation/resource guards, duplicate suppression, monotonically
   increasing local IDs, reconnect-to-unknown transitions, resource retention
   while an outcome is ambiguous, and stale/duplicate terminal-result rejection.
   It never sends or replays packets.
5. **Inventory resource identity implemented.** `SlotObjectData.sameLocation`
   and `locationKey` identify overlapping slots without conflating the current
   item type with the owner/slot location.
6. **Refresh backoff implemented.** `refreshBackoffDelayMs` supplies bounded
   exponential backoff with injectable downward jitter for authoritative state
   refreshes only; it is deliberately not a mutation retry helper.

Existing implementation already correctly covers the audit's prior high-risk
wire fixes: ForgeResult writes its count before slots; chest rewards use an i16
element count; account-level description is success-conditional; and all
audited collection readers replace rather than append their arrays. The later
expanded audit supersedes the former arbitrary-string voucher parser.

## Controlled negative cases and race invariants

Offline tests cover zero-count rereads, success-to-failure conditional tails,
negative battle-pass byte sentinel, canonical/compatibility aliases, and slot
round trips. The codec rejects truncated input, malformed collection counts,
overflow, NaN, invalid integer widths, and UTF-8 strings longer than 65535
bytes before socket I/O. Unknown enum values remain raw numeric values.

Required consumer invariants for untestable server outcomes:

| Interleaving                                   | Required invariant / RealmLib consumer action                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| claim response lost, duplicate claim attempted | keep operation `unknown`; suppress duplicate identity; refresh reward state before user-initiated retry |
| two claims target one reward                   | serialize by reward/board/slot, not merely packet type                                                  |
| forge and inventory swap overlap a slot        | lock the exact owner/slot until result plus inventory reconciliation                                    |
| purchase retry after balance changed           | do not retry on timeout; refresh currency/delivery first                                                |
| gift sender success before recipient delivery  | sender success is final only for sender; recipient remains separately pending                           |
| two sessions edit a list                       | apply snapshot action `-1` by generation; apply actions `0/1` as ordered remove/add deltas              |
| late success follows authoritative update      | authoritative inventory/list/state wins; discard stale UI result                                        |
| reconnect after send                           | all pending mutations become `unknown`, never auto-replayed                                             |

RealmLib is a packet/transport library and does not own an account-state store,
so it cannot guess correlation or apply authoritative account state. Consumers
can use the opt-in `MutationCoordinator` to model `pending`, `confirmed`,
`failed`, and `unknown`, enforce one-in-flight operation/resource guards, hold
ambiguous operations across reconnects, and reject late local IDs. Consumers
still decide when a direct result plus refreshed account/inventory state is
authoritative.

## Datastore contention assessment

No packet capture or local client evidence connects these client flows to High
Replication Datastore contention, entity-group topology, or a transaction over
60 seconds. The wire evidence does show multiple mutable account resources and
no client-visible idempotency/correlation ID, so automatic retries, reconnect
replay, concurrent list edits, and overlapping inventory operations **could**
amplify server writes. That is an inference about client amplification, not a
claim about backend implementation. Server code, transaction traces, datastore
keys/entity groups, and metrics are required to establish contention.

## Unresolved findings / captures required

- 156's second int32, 191/198 raw-string grammar, 193's second int32, and 226's
  raw-string grammar.
- Full result correlation for reskin, retitle, gravestone, discoverability,
  conversion, pet operations, and generic purchases; no operation ID has been
  observed.
- Non-success chest `execute=0`, all account-list validation/normalization,
  gift final-delivery timing, inventory-full fallback, rollover boundaries, and
  private-server negative validation behavior.
- Controlled authorized captures should include exactly one mutation at a time,
  a redacted request/result/state timeline, intentional response loss only in
  a private fixture, and no replayed production account traffic.
