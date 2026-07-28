# Protocol completeness

Generated from the canonical registry and Exalt 6.12.0.2.0.

This taxonomy does not assume that every embedded client class is a wire
packet. Factory-less definitions remain raw or research-only until framing
and layout evidence exists.

## Summary

| Category | Count | Meaning |
| --- | ---: | --- |
| Modeled wire packets | 198 | One-byte id, known direction, packet factory |
| Deliberately raw wire packets | 5 | One-byte id/direction known; layout not modeled |
| Registry research candidates | 5 | One-byte id retained with unresolved direction/layout |
| Legacy/non-wire metadata | 1 | Cannot be an active one-byte wire id |
| Modeled id-less transports | 2 | Separate transport/handshake packet without a game-wire id |
| Catalog nested/helper classes | 6 | Embedded class, not treated as a wire packet |
| Catalog research names | 73 | Not presumed to be packets without further evidence |

## Deliberately raw wire packets

- `incoming:135` — `REFINE_RESULT`
- `outgoing:136` — `BUY_REFINEMENT`
- `incoming:179` — `ACCELERATOR_ADDED`
- `incoming:218` — `FOR_RECONNECT`
- `incoming:238` — `GIFT_NOTIFICATION`

## Registry research candidates

- `unknown:162` — `SET_TRACKED_SEASON`
- `unknown:173` — `UNLOCK_ENCHANTMENT_SLOT`
- `unknown:175` — `UNLOCK_ENCHANTMENT`
- `unknown:177` — `APPLY_ENCHANTMENT`
- `unknown:187` — `UPGRADE_ENCHANTMENT`

## Legacy/non-wire metadata

- `unknown:1000` — `IP_ADDRESS`

## Modeled id-less transports

- `incoming:idless` — `CHATTOKEN`
- `outgoing:idless` — `CHATHELLO`

## Catalog nested/helper classes

- `GroundTileData`
- `ObjectData`
- `ObjectStatusData`
- `ResultDefinitionMessage`
- `StatData`
- `UserData`

## Catalog research names

These names are extraction leads only. Some are alternate names for modeled
packets; others may be nested/native classes. They are not completeness
failures until a wire id, direction, and framing are established.

- `AcceleratorAddedMessage`
- `AcceleratorUpdatedMessage`
- `AccountLevelClaimResultMessage`
- `AchievementProgressUpdateMessage`
- `ActivateCrucibleResultMessage`
- `AskForChestContents`
- `BaseEnchantmentResultMessage`
- `BoostBPMilestoneResultMessage`
- `BuyDusts`
- `BuyDustsResult`
- `BuyExtendMaterialsCapMessage`
- `BuyExtendMaterialsCapResultMessage`
- `BuyItemResultMessage`
- `BuyItemsMessage`
- `CharacterCreateFailure`
- `ChestRewardsInfo`
- `ClaimAccountLevel`
- `ClaimBPMilestoneMessage`
- `ClaimChestRewardSubmit`
- `ClaimCompetition`
- `ClaimCompetitionResult`
- `ClaimVoucher`
- `CustomMapDeleteResponse`
- `CustomMapListResponse`
- `DailyRewardResult`
- `DamageWithEffect`
- `DashResetMessage`
- `DismantleItemsMessage`
- `DismantleItemsResultMessage`
- `DrawDebugArrow`
- `DrawDebugShape`
- `EndUseMessage`
- `ExaltationRedeemInfoMessage`
- `ForceReconnectMessage`
- `GetDefinitionMessage`
- `GiftInfo`
- `GiftItemsMessage`
- `GiftResultMessage`
- `HeroLeft`
- `IncomingPartyInfo`
- `IncomingPartyInvitation`
- `IncomingPartyRequest`
- `InventoryDrop`
- `InventoryResult`
- `InventorySwap`
- `JoinedPartyMessage`
- `MarkAsFavorite`
- `MultipleMissionsProgressUpdate`
- `PartyAction`
- `PartyActionResult`
- `PartyInvitationResponse`
- `PartyRequestAck`
- `PartyRequestResponse`
- `PetShaderPurchaseResult`
- `PlayersListMessage`
- `PurchasePetShader`
- `QueueMessage`
- `RefineResultMessage`
- `RerollEnchantmentsResultMessage`
- `SaveLockUpdateMessage`
- `SetEntranceMessage`
- `ShootAckCounter`
- `SkinRecycleResponseMessage`
- `SlippingInfoMessage`
- `StacksMessage`
- `StartUseMessage`
- `StatBonusUpdate`
- `TutorialStateChangedMessage`
- `UnlockCustomizationMessage`
- `UnlockMission`
- `UnlockMissionTree`
- `UnlockNewSlot`
- `UnseasonRequest`
