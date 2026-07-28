import { Packet } from './packet';
import { PacketType } from './packet-type';
import * as IncomingPackets from './packets/incoming';
import * as OutgoingPackets from './packets/outgoing';

export type PacketDirection = 'incoming' | 'outgoing' | 'unknown';
export type PacketFactory = () => Packet;

/** Complete protocol metadata for one packet type. */
export interface PacketDefinition {
  /** Numeric wire id. Omitted for handshake-only packet types without a confirmed id. */
  readonly id?: number;
  readonly type: PacketType;
  readonly direction: PacketDirection;
  /** Constructor for packets whose wire structure is implemented. */
  readonly factory?: PacketFactory;
}

/**
 * Single source of truth for packet ids, directions, and constructors.
 * Entries without a factory remain name/id mapped for raw protocol research.
 */
export const PACKET_REGISTRY: readonly PacketDefinition[] = [
  { id: 0, type: PacketType.FAILURE, direction: 'incoming', factory: () => new IncomingPackets.FailurePacket() },
  { id: 1, type: PacketType.TELEPORT, direction: 'outgoing', factory: () => new OutgoingPackets.TeleportPacket() },
  { id: 3, type: PacketType.CLAIM_LOGIN_REWARD_MSG, direction: 'outgoing', factory: () => new OutgoingPackets.ClaimDailyRewardMessage() },
  { id: 4, type: PacketType.DELETE_PET, direction: 'incoming', factory: () => new IncomingPackets.DeletePetMessage() },
  { id: 5, type: PacketType.REQUESTTRADE, direction: 'outgoing', factory: () => new OutgoingPackets.RequestTradePacket() },
  { id: 6, type: PacketType.QUEST_FETCH_RESPONSE, direction: 'incoming', factory: () => new IncomingPackets.QuestFetchResponsePacket() },
  { id: 7, type: PacketType.JOINGUILD, direction: 'outgoing', factory: () => new OutgoingPackets.JoinGuildPacket() },
  { id: 8, type: PacketType.PING, direction: 'incoming', factory: () => new IncomingPackets.PingPacket() },
  { id: 9, type: PacketType.PLAYERTEXT, direction: 'outgoing', factory: () => new OutgoingPackets.PlayerTextPacket() },
  { id: 10, type: PacketType.NEWTICK, direction: 'incoming', factory: () => new IncomingPackets.NewTickPacket() },
  { id: 11, type: PacketType.SHOWEFFECT, direction: 'incoming', factory: () => new IncomingPackets.ShowEffectPacket() },
  { id: 12, type: PacketType.SERVERPLAYERSHOOT, direction: 'incoming', factory: () => new IncomingPackets.ServerPlayerShootPacket() },
  { id: 13, type: PacketType.USEITEM, direction: 'outgoing', factory: () => new OutgoingPackets.UseItemPacket() },
  { id: 14, type: PacketType.TRADEACCEPTED, direction: 'incoming', factory: () => new IncomingPackets.TradeAcceptedPacket() },
  { id: 15, type: PacketType.GUILDREMOVE, direction: 'outgoing', factory: () => new OutgoingPackets.GuildRemovePacket() },
  { id: 16, type: PacketType.PETUPGRADEREQUEST, direction: 'outgoing', factory: () => new OutgoingPackets.PetUpgradeRequestPacket() },
  { id: 17, type: PacketType.ENTER_ARENA, direction: 'outgoing', factory: () => new OutgoingPackets.EnterArenaPacket() },
  { id: 18, type: PacketType.GOTO, direction: 'incoming', factory: () => new IncomingPackets.GotoPacket() },
  { id: 19, type: PacketType.INVDROP, direction: 'outgoing', factory: () => new OutgoingPackets.InvDropPacket() },
  { id: 20, type: PacketType.OTHERHIT, direction: 'outgoing', factory: () => new OutgoingPackets.OtherHitPacket() },
  { id: 21, type: PacketType.NAMERESULT, direction: 'incoming', factory: () => new IncomingPackets.NameResultPacket() },
  { id: 22, type: PacketType.BUYRESULT, direction: 'incoming', factory: () => new IncomingPackets.BuyResultPacket() },
  { id: 23, type: PacketType.HATCH_PET, direction: 'incoming', factory: () => new IncomingPackets.HatchPetMessage() },
  { id: 24, type: PacketType.ACTIVE_PET_UPDATE_REQUEST, direction: 'outgoing', factory: () => new OutgoingPackets.ActivePetUpdateRequestPacket() },
  { id: 25, type: PacketType.ENEMYHIT, direction: 'outgoing', factory: () => new OutgoingPackets.EnemyHitPacket() },
  { id: 26, type: PacketType.GUILDRESULT, direction: 'incoming', factory: () => new IncomingPackets.GuildResultPacket() },
  { id: 27, type: PacketType.EDITACCOUNTLIST, direction: 'outgoing', factory: () => new OutgoingPackets.EditAccountListPacket() },
  { id: 28, type: PacketType.TRADECHANGED, direction: 'incoming', factory: () => new IncomingPackets.TradeChangedPacket() },
  { id: 30, type: PacketType.PLAYERSHOOT, direction: 'outgoing', factory: () => new OutgoingPackets.PlayerShootPacket() },
  { id: 31, type: PacketType.PONG, direction: 'outgoing', factory: () => new OutgoingPackets.PongPacket() },
  { id: 33, type: PacketType.PET_CHANGE_SKIN_MSG, direction: 'outgoing', factory: () => new OutgoingPackets.ChangePetSkinPacket() },
  { id: 34, type: PacketType.TRADEDONE, direction: 'incoming', factory: () => new IncomingPackets.TradeDonePacket() },
  { id: 35, type: PacketType.ENEMYSHOOT, direction: 'incoming', factory: () => new IncomingPackets.EnemyShootPacket() },
  { id: 36, type: PacketType.ACCEPTTRADE, direction: 'outgoing', factory: () => new OutgoingPackets.AcceptTradePacket() },
  { id: 37, type: PacketType.CHANGEGUILDRANK, direction: 'outgoing', factory: () => new OutgoingPackets.ChangeGuildRankPacket() },
  { id: 38, type: PacketType.PLAYSOUND, direction: 'incoming', factory: () => new IncomingPackets.PlaySoundPacket() },
  { id: 39, type: PacketType.VERIFY_EMAIL, direction: 'incoming', factory: () => new IncomingPackets.VerifyEmailPacket() },
  { id: 40, type: PacketType.SQUAREHIT, direction: 'outgoing', factory: () => new OutgoingPackets.SquareHitPacket() },
  { id: 41, type: PacketType.NEW_ABILITY, direction: 'incoming', factory: () => new IncomingPackets.NewAbilityMessage() },
  { id: 42, type: PacketType.UPDATE, direction: 'incoming', factory: () => new IncomingPackets.UpdatePacket() },
  { id: 44, type: PacketType.TEXT, direction: 'incoming', factory: () => new IncomingPackets.TextPacket() },
  { id: 45, type: PacketType.RECONNECT, direction: 'incoming', factory: () => new IncomingPackets.ReconnectPacket() },
  { id: 46, type: PacketType.DEATH, direction: 'incoming', factory: () => new IncomingPackets.DeathPacket() },
  { id: 47, type: PacketType.USEPORTAL, direction: 'outgoing', factory: () => new OutgoingPackets.UsePortalPacket() },
  { id: 48, type: PacketType.QUEST_ROOM_MSG, direction: 'outgoing', factory: () => new OutgoingPackets.GoToQuestRoomPacket() },
  { id: 49, type: PacketType.ALLYSHOOT, direction: 'incoming', factory: () => new IncomingPackets.AllyShootPacket() },
  { id: 50, type: PacketType.IMMINENT_ARENA_WAVE, direction: 'incoming', factory: () => new IncomingPackets.ImminentArenaWavePacket() },
  { id: 51, type: PacketType.RESKIN, direction: 'outgoing', factory: () => new OutgoingPackets.ReskinPacket() },
  { id: 52, type: PacketType.RESET_DAILY_QUESTS, direction: 'outgoing', factory: () => new OutgoingPackets.ResetDailyQuestsPacket() },
  { id: 53, type: PacketType.PET_CHANGE_FORM_MSG, direction: 'outgoing', factory: () => new OutgoingPackets.ReskinPetPacket() },
  { id: 55, type: PacketType.INVSWAP, direction: 'outgoing', factory: () => new OutgoingPackets.InvSwapPacket() },
  { id: 56, type: PacketType.CHANGETRADE, direction: 'outgoing', factory: () => new OutgoingPackets.ChangeTradePacket() },
  { id: 57, type: PacketType.CREATE, direction: 'outgoing', factory: () => new OutgoingPackets.CreatePacket() },
  { id: 58, type: PacketType.QUEST_REDEEM, direction: 'outgoing', factory: () => new OutgoingPackets.QuestRedeemPacket() },
  { id: 59, type: PacketType.CREATEGUILD, direction: 'outgoing', factory: () => new OutgoingPackets.CreateGuildPacket() },
  { id: 60, type: PacketType.SETCONDITION, direction: 'outgoing', factory: () => new OutgoingPackets.SetConditionPacket() },
  { id: 61, type: PacketType.LOAD, direction: 'outgoing', factory: () => new OutgoingPackets.LoadPacket() },
  { id: 62, type: PacketType.MOVE, direction: 'outgoing', factory: () => new OutgoingPackets.MovePacket() },
  { id: 63, type: PacketType.KEY_INFO_RESPONSE, direction: 'incoming', factory: () => new IncomingPackets.KeyInfoResponsePacket() },
  { id: 64, type: PacketType.AOE, direction: 'incoming', factory: () => new IncomingPackets.AoePacket() },
  { id: 65, type: PacketType.GOTOACK, direction: 'outgoing', factory: () => new OutgoingPackets.GotoAckPacket() },
  { id: 66, type: PacketType.GLOBAL_NOTIFICATION, direction: 'incoming', factory: () => new IncomingPackets.GlobalNotificationPacket() },
  { id: 67, type: PacketType.NOTIFICATION, direction: 'incoming', factory: () => new IncomingPackets.NotificationPacket() },
  { id: 68, type: PacketType.ARENA_DEATH, direction: 'incoming', factory: () => new IncomingPackets.ArenaDeathPacket() },
  { id: 69, type: PacketType.CLIENTSTAT, direction: 'incoming', factory: () => new IncomingPackets.ClientStatPacket() },
  { id: 74, type: PacketType.HELLO, direction: 'outgoing', factory: () => new OutgoingPackets.HelloPacket() },
  { id: 75, type: PacketType.DAMAGE, direction: 'incoming', factory: () => new IncomingPackets.DamagePacket() },
  { id: 76, type: PacketType.ACTIVEPETUPDATE, direction: 'incoming', factory: () => new IncomingPackets.ActivePetPacket() },
  { id: 77, type: PacketType.INVITEDTOGUILD, direction: 'incoming', factory: () => new IncomingPackets.InvitedToGuildPacket() },
  { id: 78, type: PacketType.PETYARDUPDATE, direction: 'incoming', factory: () => new IncomingPackets.PetYardUpdate() },
  { id: 79, type: PacketType.PASSWORD_PROMPT, direction: 'incoming', factory: () => new IncomingPackets.PasswordPromptPacket() },
  { id: 80, type: PacketType.ACCEPT_ARENA_DEATH, direction: 'outgoing', factory: () => new OutgoingPackets.AcceptArenaDeathPacket() },
  { id: 81, type: PacketType.UPDATEACK, direction: 'outgoing', factory: () => new OutgoingPackets.UpdateAckPacket() },
  { id: 82, type: PacketType.QUESTOBJID, direction: 'incoming', factory: () => new IncomingPackets.QuestObjectIdPacket() },
  { id: 83, type: PacketType.PIC, direction: 'incoming', factory: () => new IncomingPackets.PicPacket() },
  { id: 84, type: PacketType.REALM_HERO_LEFT_MSG, direction: 'incoming', factory: () => new IncomingPackets.RealmHeroesLeftPacket() },
  { id: 85, type: PacketType.BUY, direction: 'outgoing', factory: () => new OutgoingPackets.BuyPacket() },
  { id: 86, type: PacketType.TRADESTART, direction: 'incoming', factory: () => new IncomingPackets.TradeStartPacket() },
  { id: 87, type: PacketType.EVOLVE_PET, direction: 'incoming', factory: () => new IncomingPackets.EvolvedPetMessage() },
  { id: 88, type: PacketType.TRADEREQUESTED, direction: 'incoming', factory: () => new IncomingPackets.TradeRequestedPacket() },
  { id: 89, type: PacketType.AOEACK, direction: 'outgoing', factory: () => new OutgoingPackets.AoeAckPacket() },
  { id: 90, type: PacketType.PLAYERHIT, direction: 'outgoing', factory: () => new OutgoingPackets.PlayerHitPacket() },
  { id: 91, type: PacketType.CANCELTRADE, direction: 'outgoing', factory: () => new OutgoingPackets.CancelTradePacket() },
  { id: 92, type: PacketType.MAPINFO, direction: 'incoming', factory: () => new IncomingPackets.MapInfoPacket() },
  { id: 93, type: PacketType.LOGIN_REWARD_MSG, direction: 'incoming', factory: () => new IncomingPackets.ClaimDailyRewardResponse() },
  { id: 94, type: PacketType.KEY_INFO_REQUEST, direction: 'outgoing', factory: () => new OutgoingPackets.KeyInfoRequestPacket() },
  { id: 95, type: PacketType.INVRESULT, direction: 'incoming', factory: () => new IncomingPackets.InvResultPacket() },
  { id: 96, type: PacketType.QUEST_REDEEM_RESPONSE, direction: 'incoming', factory: () => new IncomingPackets.QuestRedeemResponsePacket() },
  { id: 97, type: PacketType.CHOOSENAME, direction: 'outgoing', factory: () => new OutgoingPackets.ChooseNamePacket() },
  { id: 98, type: PacketType.QUEST_FETCH_ASK, direction: 'outgoing', factory: () => new OutgoingPackets.QuestFetchAskPacket() },
  { id: 99, type: PacketType.ACCOUNTLIST, direction: 'incoming', factory: () => new IncomingPackets.AccountListPacket() },
  { id: 101, type: PacketType.CREATE_SUCCESS, direction: 'incoming', factory: () => new IncomingPackets.CreateSuccessPacket() },
  { id: 102, type: PacketType.CHECKCREDITS, direction: 'outgoing', factory: () => new OutgoingPackets.CheckCreditsPacket() },
  { id: 103, type: PacketType.GROUNDDAMAGE, direction: 'outgoing', factory: () => new OutgoingPackets.GroundDamagePacket() },
  { id: 104, type: PacketType.GUILDINVITE, direction: 'outgoing', factory: () => new OutgoingPackets.GuildInvitePacket() },
  { id: 105, type: PacketType.ESCAPE, direction: 'outgoing', factory: () => new OutgoingPackets.EscapePacket() },
  { id: 106, type: PacketType.FILE, direction: 'incoming', factory: () => new IncomingPackets.FilePacket() },
  { id: 107, type: PacketType.RESKIN_UNLOCK, direction: 'incoming', factory: () => new IncomingPackets.ReskinUnlockPacket() },
  { id: 108, type: PacketType.NEW_CHARACTER_INFORMATION, direction: 'incoming', factory: () => new IncomingPackets.NewCharacterInfoPacket() },
  { id: 109, type: PacketType.UNLOCK_INFORMATION, direction: 'incoming', factory: () => new IncomingPackets.UnlockInformationPacket() },
  { id: 112, type: PacketType.QUEUE_INFORMATION, direction: 'incoming', factory: () => new IncomingPackets.QueueInfoPacket() },
  { id: 113, type: PacketType.QUEUE_CANCEL, direction: 'outgoing', factory: () => new OutgoingPackets.QueueCancelPacket() },
  { id: 114, type: PacketType.EXALTATION_BONUS_CHANGED, direction: 'incoming', factory: () => new IncomingPackets.ExaltationUpdatePacket() },
  { id: 115, type: PacketType.REDEEM_EXALTATION_REWARD, direction: 'outgoing', factory: () => new OutgoingPackets.RedeemExaltationRewardPacket() },
  { id: 116, type: PacketType.EXALTATION_REDEEM_INFO, direction: 'incoming', factory: () => new IncomingPackets.ExaltationRedeemInfoPacket() },
  { id: 117, type: PacketType.VAULT_CONTENT, direction: 'incoming', factory: () => new IncomingPackets.VaultContentPacket() },
  { id: 118, type: PacketType.FORGE_REQUEST, direction: 'outgoing', factory: () => new OutgoingPackets.ForgeRequestPacket() },
  { id: 119, type: PacketType.FORGE_RESULT, direction: 'incoming', factory: () => new IncomingPackets.ForgeResultPacket() },
  { id: 120, type: PacketType.FORGE_UNLOCKED_BLUEPRINTS, direction: 'incoming', factory: () => new IncomingPackets.ForgeUnlockedBlueprints() },
  { id: 121, type: PacketType.SHOOTACK, direction: 'outgoing', factory: () => new OutgoingPackets.ShootAckPacket() },
  { id: 122, type: PacketType.CHANGE_ALLY_SHOOT, direction: 'outgoing', factory: () => new OutgoingPackets.ChangeAllyShootPacket() },
  { id: 123, type: PacketType.PLAYERS_LIST_MESSAGE, direction: 'incoming', factory: () => new IncomingPackets.PlayersListPacket() },
  { id: 124, type: PacketType.MODERATOR_ACTION_MESSAGE, direction: 'outgoing', factory: () => new OutgoingPackets.ModeratorActionMessagePacket() },
  { id: 125, type: PacketType.GET_PLAYERS_LIST_MESSAGE, direction: 'outgoing', factory: () => new OutgoingPackets.GetPlayersListPacket() },
  { id: 126, type: PacketType.CREEP_MOVE_MESSAGE, direction: 'outgoing', factory: () => new OutgoingPackets.CreepMoveMessagePacket() },
  { id: 129, type: PacketType.CUSTOM_MAP_DELETE, direction: 'outgoing', factory: () => new OutgoingPackets.CustomMapDeletePacket() },
  { id: 130, type: PacketType.CUSTOM_MAP_DELETE_RESPONSE, direction: 'incoming', factory: () => new IncomingPackets.CustomMapDeleteResponsePacket() },
  { id: 131, type: PacketType.CUSTOM_MAP_LIST, direction: 'outgoing', factory: () => new OutgoingPackets.CustomMapListPacket() },
  { id: 132, type: PacketType.CUSTOM_MAP_LIST_RESPONSE, direction: 'incoming', factory: () => new IncomingPackets.CustomMapListResponsePacket() },
  { id: 133, type: PacketType.CREEP_HIT, direction: 'outgoing', factory: () => new OutgoingPackets.CreepHitPacket() },
  // 135: bool + SlotObjectData + UniqueDataContainer + string; container framing unknown, no factory.
  { id: 135, type: PacketType.REFINE_RESULT, direction: 'incoming' },
  { id: 134, type: PacketType.PLAYER_CALLOUT, direction: 'outgoing', factory: () => new OutgoingPackets.PlayerCalloutPacket() },
  { id: 136, type: PacketType.BUY_REFINEMENT, direction: 'outgoing' },
  { id: 137, type: PacketType.DASH, direction: 'outgoing', factory: () => new OutgoingPackets.DashPacket() },
  { id: 138, type: PacketType.DASH_ACK, direction: 'outgoing', factory: () => new OutgoingPackets.DashAckPacket() },
  { id: 139, type: PacketType.STATS, direction: 'incoming', factory: () => new IncomingPackets.StatsPacket() },
  { id: 140, type: PacketType.BUY_CUSTOMISATION_SOCKET, direction: 'outgoing', factory: () => new OutgoingPackets.BuyCustomisationSocketPacket() },
  { id: 141, type: PacketType.BUY_CUSTOMISATION_SOCKET_RESULT, direction: 'incoming', factory: () => new IncomingPackets.BuyCustomisationSocketResultPacket() },
  { id: 142, type: PacketType.DRAW_DEBUG_SHAPE, direction: 'incoming', factory: () => new IncomingPackets.DrawDebugShapePacket() },
  { id: 143, type: PacketType.DRAW_DEBUG_ARROW, direction: 'incoming', factory: () => new IncomingPackets.DrawDebugArrowPacket() },
  { id: 144, type: PacketType.DASH_RESET, direction: 'incoming', factory: () => new IncomingPackets.DashResetPacket() },
  { id: 145, type: PacketType.FAVOUR_PET, direction: 'outgoing', factory: () => new OutgoingPackets.FavourPetPacket() },
  { id: 146, type: PacketType.SKIN_RECYCLE, direction: 'outgoing', factory: () => new OutgoingPackets.SkinRecyclePacket() },
  { id: 147, type: PacketType.SKIN_RECYCLE_RESPONSE, direction: 'incoming', factory: () => new IncomingPackets.SkinRecycleResponsePacket() },
  { id: 148, type: PacketType.DAMAGE_BOOST, direction: 'incoming', factory: () => new IncomingPackets.DamageBoostPacket() },
  { id: 149, type: PacketType.CLAIM_BATTLE_PASS, direction: 'outgoing', factory: () => new OutgoingPackets.ClaimBattlePassPacket() },
  { id: 150, type: PacketType.CLAIM_BP_MILESTONE_RESULT, direction: 'incoming', factory: () => new IncomingPackets.ClaimBpMilestoneResultPacket() },
  { id: 151, type: PacketType.BOOST_BP_MILESTONE, direction: 'outgoing', factory: () => new OutgoingPackets.BoostBpMilestonePacket() },
  { id: 152, type: PacketType.BOOST_BP_MILESTONE_RESULT, direction: 'incoming', factory: () => new IncomingPackets.BoostBpMilestoneResultPacket() },
  { id: 153, type: PacketType.ACCELERATOR_UPDATED, direction: 'incoming', factory: () => new IncomingPackets.AcceleratorUpdatedPacket() },
  { id: 154, type: PacketType.CONVERT_SEASONAL_CHARACTER, direction: 'outgoing', factory: () => new OutgoingPackets.ConvertSeasonalCharacterPacket() },
  { id: 155, type: PacketType.RETITLE, direction: 'outgoing', factory: () => new OutgoingPackets.RetitlePacket() },
  { id: 156, type: PacketType.SET_GRAVE_STONE, direction: 'outgoing', factory: () => new OutgoingPackets.SetGraveStonePacket() },
  { id: 157, type: PacketType.SET_ABILITY, direction: 'outgoing', factory: () => new OutgoingPackets.SetAbilityPacket() },
  { id: 159, type: PacketType.EMOTE, direction: 'outgoing', factory: () => new OutgoingPackets.EmotePacket() },
  { id: 160, type: PacketType.BUY_EMOTE, direction: 'outgoing', factory: () => new OutgoingPackets.BuyEmotePacket() },
  // 162 has no trace in the 6.12.0.2.0 client (no vtable, no factory binding); kept for id research only.
  { id: 162, type: PacketType.SET_TRACKED_SEASON, direction: 'unknown' },
  { id: 163, type: PacketType.CLAIM_MISSION, direction: 'outgoing', factory: () => new OutgoingPackets.ClaimMissionPacket() },
  { id: 164, type: PacketType.CLAIM_MISSION_RESULT, direction: 'incoming', factory: () => new IncomingPackets.ClaimMissionResultPacket() },
  { id: 165, type: PacketType.PROGRESS_UPDATE, direction: 'incoming', factory: () => new IncomingPackets.ProgressUpdatePacket() },
  { id: 166, type: PacketType.DAMAGE_WITH_EFFECT, direction: 'incoming', factory: () => new IncomingPackets.DamageWithEffectPacket() },
  { id: 167, type: PacketType.SET_DISCOVERABLE, direction: 'outgoing', factory: () => new OutgoingPackets.SetDiscoverablePacket() },
  { id: 169, type: PacketType.REALM_SCORE_UPDATE, direction: 'incoming', factory: () => new IncomingPackets.RealmScoreUpdatePacket() },
  { id: 170, type: PacketType.CLAIM_REWARDS_INFO_PROMPT, direction: 'incoming', factory: () => new IncomingPackets.ClaimRewardsInfoPromptPacket() },
  { id: 171, type: PacketType.CLAIM_CHEST_REWARD, direction: 'outgoing', factory: () => new OutgoingPackets.ClaimChestRewardPacket() },
  { id: 172, type: PacketType.CHEST_REWARD_RESULT, direction: 'incoming', factory: () => new IncomingPackets.ChestRewardResultPacket() },
  // 173/175/177/187 have no trace in the 6.12.0.2.0 client — superseded by the
  // 189-198 enchant cluster. Kept for id research against older builds only.
  { id: 173, type: PacketType.UNLOCK_ENCHANTMENT_SLOT, direction: 'unknown' },
  { id: 175, type: PacketType.UNLOCK_ENCHANTMENT, direction: 'unknown' },
  { id: 177, type: PacketType.APPLY_ENCHANTMENT, direction: 'unknown' },
  { id: 179, type: PacketType.ACCELERATOR_ADDED, direction: 'incoming' },
  { id: 180, type: PacketType.ACTIVATE_CRUCIBLE, direction: 'outgoing', factory: () => new OutgoingPackets.ActivateCruciblePacket() },
  { id: 181, type: PacketType.ACTIVATE_CRUCIBLE_RESULT, direction: 'incoming', factory: () => new IncomingPackets.ActivateCrucibleResultPacket() },
  { id: 182, type: PacketType.CRUCIBLE_REQUEST, direction: 'outgoing', factory: () => new OutgoingPackets.CrucibleRequestPacket() },
  { id: 183, type: PacketType.CRUCIBLE_RESPONSE, direction: 'incoming', factory: () => new IncomingPackets.CrucibleResponsePacket() },
  { id: 184, type: PacketType.TUTORIAL_STATE_CHANGED, direction: 'incoming', factory: () => new IncomingPackets.TutorialStateChangedPacket() },
  { id: 185, type: PacketType.UPGRADE_ENCHANTER, direction: 'incoming', factory: () => new IncomingPackets.UpgradeEnchanterPacket() },
  { id: 187, type: PacketType.UPGRADE_ENCHANTMENT, direction: 'unknown' },
  { id: 189, type: PacketType.REROLL_ALL_ENCHANTMENTS, direction: 'outgoing', factory: () => new OutgoingPackets.RerollAllEnchantmentsPacket() },
  { id: 190, type: PacketType.ENCHANT, direction: 'incoming', factory: () => new IncomingPackets.EnchantPacket() },
  { id: 191, type: PacketType.BUY_DUSTS, direction: 'outgoing', factory: () => new OutgoingPackets.BuyDustsPacket() },
  { id: 192, type: PacketType.BUY_DUSTS_RESULT, direction: 'incoming', factory: () => new IncomingPackets.BuyDustsResultPacket() },
  { id: 193, type: PacketType.PURCHASE_PET_SHADER, direction: 'outgoing', factory: () => new OutgoingPackets.PurchasePetShaderPacket() },
  { id: 194, type: PacketType.PET_SHADER_PURCHASE_RESULT, direction: 'incoming', factory: () => new IncomingPackets.PetShaderPurchaseResultPacket() },
  // 195/196 catalog names are DismantleItemsMessage / DismantleItemsResultMessage.
  { id: 195, type: PacketType.BLACKSMITH_REQUEST, direction: 'outgoing', factory: () => new OutgoingPackets.BlacksmithRequestPacket() },
  { id: 196, type: PacketType.BLACKSMITH_DISMANTLE, direction: 'incoming', factory: () => new IncomingPackets.BlacksmithDismantlePacket() },
  { id: 197, type: PacketType.SELECT_ENTRANCE, direction: 'outgoing', factory: () => new OutgoingPackets.SelectEntrancePacket() },
  { id: 198, type: PacketType.RESET_ENCHANTMENT_REROLL_COUNT, direction: 'outgoing', factory: () => new OutgoingPackets.ResetEnchantmentRerollCountPacket() },
  { id: 199, type: PacketType.RESET_ENCHANTMENT_REROLL_COUNT_RESULT, direction: 'incoming', factory: () => new IncomingPackets.ResetEnchantmentRerollCountResultPacket() },
  { id: 200, type: PacketType.CREATE_PARTY_MESSAGE, direction: 'outgoing', factory: () => new OutgoingPackets.CreatePartyPacket() },
  { id: 204, type: PacketType.PARTY_ACTION_RESULT, direction: 'outgoing', factory: () => new OutgoingPackets.PartyActionResultPacket() },
  { id: 207, type: PacketType.PARTY_ACTION, direction: 'incoming', factory: () => new IncomingPackets.PartyActionPacket() },
  { id: 208, type: PacketType.INCOMING_PARTY_INVITE, direction: 'incoming', factory: () => new IncomingPackets.IncomingPartyInvitePacket() },
  { id: 209, type: PacketType.PARTY_INVITE_RESPONSE, direction: 'outgoing', factory: () => new OutgoingPackets.PartyInviteResponsePacket() },
  { id: 210, type: PacketType.INCOMING_PARTY_MEMBER_INFO, direction: 'incoming', factory: () => new IncomingPackets.IncomingPartyMemberInfoPacket() },
  { id: 212, type: PacketType.PARTY_MEMBER_ADDED, direction: 'incoming', factory: () => new IncomingPackets.PartyMemberAddedPacket() },
  { id: 214, type: PacketType.PARTY_LIST_MESSAGE, direction: 'incoming', factory: () => new IncomingPackets.PartyListPacket() },
  { id: 215, type: PacketType.PARTY_JOIN_REQUEST, direction: 'outgoing', factory: () => new OutgoingPackets.PartyJoinRequestPacket() },
  { id: 215, type: PacketType.PARTY_JOIN_RESULT, direction: 'incoming', factory: () => new IncomingPackets.PartyJoinResultPacket() },
  { id: 217, type: PacketType.PARTY_REQUEST_RESPONSE, direction: 'incoming', factory: () => new IncomingPackets.PartyRequestResponsePacket() },
  { id: 217, type: PacketType.PARTY_JOIN_REQUEST_RESPONSE, direction: 'outgoing', factory: () => new OutgoingPackets.PartyJoinResponsePacket() },
  // 218: List<string> serverNames per the client dump (ForceReconnect/Queue);
  // list prefix width unconfirmed, so no factory yet.
  { id: 218, type: PacketType.FOR_RECONNECT, direction: 'incoming' },
  { id: 219, type: PacketType.REDEEM_VOUCHER, direction: 'outgoing', factory: () => new OutgoingPackets.RedeemVoucherPacket() },
  { id: 220, type: PacketType.VOUCHER_RESULT, direction: 'incoming', factory: () => new IncomingPackets.VoucherResultPacket() },
  { id: 222, type: PacketType.LOADING_SCREEN, direction: 'incoming', factory: () => new IncomingPackets.LoadingScreenPacket() },
  { id: 223, type: PacketType.PURCHASE_REQUEST, direction: 'outgoing', factory: () => new OutgoingPackets.PurchaseRequestPacket() },
  { id: 224, type: PacketType.UNLOCK_MISSION_TREE, direction: 'outgoing', factory: () => new OutgoingPackets.UnlockMissionTreePacket() },
  { id: 225, type: PacketType.UNLOCK_MISSION, direction: 'outgoing', factory: () => new OutgoingPackets.UnlockMissionPacket() },
  { id: 226, type: PacketType.GIFT_ITEMS, direction: 'outgoing', factory: () => new OutgoingPackets.GiftItemsPacket() },
  { id: 227, type: PacketType.GIFT_RESULT, direction: 'incoming', factory: () => new IncomingPackets.GiftResultPacket() },
  { id: 231, type: PacketType.STACKS, direction: 'incoming', factory: () => new IncomingPackets.StacksPacket() },
  { id: 232, type: PacketType.CLAIM_ACCOUNT_LEVEL_REWARD, direction: 'outgoing', factory: () => new OutgoingPackets.ClaimAccountLevelRewardPacket() },
  { id: 233, type: PacketType.CLAIM_ACCOUNT_LEVEL_REWARD_RESULT, direction: 'incoming', factory: () => new IncomingPackets.ClaimAccountLevelRewardResultPacket() },
  { id: 234, type: PacketType.CLAIM_REWARD, direction: 'outgoing', factory: () => new OutgoingPackets.ClaimRewardPacket() },
  { id: 235, type: PacketType.CLAIM_REWARD_RESULT, direction: 'incoming', factory: () => new IncomingPackets.ClaimRewardResultPacket() },
  { id: 236, type: PacketType.SLIPPING_INFO, direction: 'incoming', factory: () => new IncomingPackets.SlippingInfoPacket() },
  { id: 237, type: PacketType.CLAIM_DAILY_ITEM, direction: 'incoming', factory: () => new IncomingPackets.ClaimDailyItemPacket() },
  // 238: GiftInfo {string type, int32 area, string text, List<int32> items,
  // UserData{int32,string} from/to, int64 createdAt}; nested framing + int64
  // reader support pending, so no factory yet.
  { id: 238, type: PacketType.GIFT_NOTIFICATION, direction: 'incoming' },
  { id: 239, type: PacketType.CLAIM_REWARDS_INFO_REQUEST, direction: 'outgoing', factory: () => new OutgoingPackets.ClaimRewardsInfoRequestPacket() },
  // 1000 cannot be a wire id in the current build (ids are single bytes); legacy only.
  { id: 1000, type: PacketType.IP_ADDRESS, direction: 'unknown' },
  { type: PacketType.CHATTOKEN, direction: 'incoming', factory: () => new IncomingPackets.ChatToken() },
  { type: PacketType.CHATHELLO, direction: 'outgoing', factory: () => new OutgoingPackets.ChatHelloPacket() },
];

const BY_TYPE = new Map<PacketType, PacketDefinition>();
const BY_ID_AND_DIRECTION = new Map<string, PacketDefinition>();
const idDirectionKey = (id: number, direction: PacketDirection): string => `${direction}:${id}`;
for (const definition of PACKET_REGISTRY) {
  Object.freeze(definition);
}
Object.freeze(PACKET_REGISTRY);
for (const definition of PACKET_REGISTRY) {
  if (BY_TYPE.has(definition.type)) {
    throw new Error(`Duplicate packet type in registry: ${definition.type}`);
  }
  BY_TYPE.set(definition.type, definition);
  if (definition.id !== undefined) {
    const key = idDirectionKey(definition.id, definition.direction);
    if (BY_ID_AND_DIRECTION.has(key)) {
      throw new Error(`Duplicate ${definition.direction} packet id in registry: ${definition.id}`);
    }
    BY_ID_AND_DIRECTION.set(key, definition);
  }
}

/** Looks up packet metadata by type. */
export function getPacketDefinition(type: PacketType): PacketDefinition | undefined {
  return BY_TYPE.get(type);
}

/**
 * Looks up packet metadata by numeric wire id and direction.
 *
 * Packet ids are direction-scoped in the current protocol: for example, ids
 * 215 and 217 each identify different incoming and outgoing party messages.
 */
export function getPacketDefinitionById(
  id: number,
  direction: PacketDirection = 'incoming',
): PacketDefinition | undefined {
  return BY_ID_AND_DIRECTION.get(idDirectionKey(id, direction))
    ?? BY_ID_AND_DIRECTION.get(idDirectionKey(id, 'unknown'));
}
