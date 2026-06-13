import { PacketType } from './packet-type';

/**
 * A bidirectional map of packet types and their IDs.
 */
export interface PacketMap {
  [key: number]: any;
  [key: string]: any;
}

/**
 * Numeric packet id -> `PacketType` for the current game build.
 * The ids are build specific and change between releases; this is the
 * single place they are defined.
 */
const ID_TO_TYPE: { [id: number]: PacketType } = {
  0: PacketType.FAILURE,
  1: PacketType.TELEPORT,
  3: PacketType.CLAIM_LOGIN_REWARD_MSG,
  4: PacketType.DELETE_PET,
  5: PacketType.REQUESTTRADE,
  6: PacketType.QUEST_FETCH_RESPONSE,
  7: PacketType.JOINGUILD,
  8: PacketType.PING,
  9: PacketType.PLAYERTEXT,
  10: PacketType.NEWTICK,
  11: PacketType.SHOWEFFECT,
  12: PacketType.SERVERPLAYERSHOOT,
  13: PacketType.USEITEM,
  14: PacketType.TRADEACCEPTED,
  15: PacketType.GUILDREMOVE,
  16: PacketType.PETUPGRADEREQUEST,
  17: PacketType.ENTER_ARENA,
  18: PacketType.GOTO,
  19: PacketType.INVDROP,
  20: PacketType.OTHERHIT,
  21: PacketType.NAMERESULT,
  22: PacketType.BUYRESULT,
  23: PacketType.HATCH_PET,
  24: PacketType.ACTIVE_PET_UPDATE_REQUEST,
  25: PacketType.ENEMYHIT,
  26: PacketType.GUILDRESULT,
  27: PacketType.EDITACCOUNTLIST,
  28: PacketType.TRADECHANGED,
  30: PacketType.PLAYERSHOOT,
  31: PacketType.PONG,
  33: PacketType.PET_CHANGE_SKIN_MSG,
  34: PacketType.TRADEDONE,
  35: PacketType.ENEMYSHOOT,
  36: PacketType.ACCEPTTRADE,
  37: PacketType.CHANGEGUILDRANK,
  38: PacketType.PLAYSOUND,
  39: PacketType.VERIFY_EMAIL,
  40: PacketType.SQUAREHIT,
  41: PacketType.NEW_ABILITY,
  42: PacketType.UPDATE,
  44: PacketType.TEXT,
  45: PacketType.RECONNECT,
  46: PacketType.DEATH,
  47: PacketType.USEPORTAL,
  48: PacketType.QUEST_ROOM_MSG,
  49: PacketType.ALLYSHOOT,
  50: PacketType.IMMINENT_ARENA_WAVE,
  51: PacketType.RESKIN,
  52: PacketType.RESET_DAILY_QUESTS,
  53: PacketType.PET_CHANGE_FORM_MSG,
  55: PacketType.INVSWAP,
  56: PacketType.CHANGETRADE,
  57: PacketType.CREATE,
  58: PacketType.QUEST_REDEEM,
  59: PacketType.CREATEGUILD,
  60: PacketType.SETCONDITION,
  61: PacketType.LOAD,
  62: PacketType.MOVE,
  63: PacketType.KEY_INFO_RESPONSE,
  64: PacketType.AOE,
  65: PacketType.GOTOACK,
  66: PacketType.GLOBAL_NOTIFICATION,
  67: PacketType.NOTIFICATION,
  68: PacketType.ARENA_DEATH,
  69: PacketType.CLIENTSTAT,
  74: PacketType.HELLO,
  75: PacketType.DAMAGE,
  76: PacketType.ACTIVEPETUPDATE,
  77: PacketType.INVITEDTOGUILD,
  78: PacketType.PETYARDUPDATE,
  79: PacketType.PASSWORD_PROMPT,
  80: PacketType.ACCEPT_ARENA_DEATH,
  81: PacketType.UPDATEACK,
  82: PacketType.QUESTOBJID,
  83: PacketType.PIC,
  84: PacketType.REALM_HERO_LEFT_MSG,
  85: PacketType.BUY,
  86: PacketType.TRADESTART,
  87: PacketType.EVOLVE_PET,
  88: PacketType.TRADEREQUESTED,
  89: PacketType.AOEACK,
  90: PacketType.PLAYERHIT,
  91: PacketType.CANCELTRADE,
  92: PacketType.MAPINFO,
  93: PacketType.LOGIN_REWARD_MSG,
  94: PacketType.KEY_INFO_REQUEST,
  95: PacketType.INVRESULT,
  96: PacketType.QUEST_REDEEM_RESPONSE,
  97: PacketType.CHOOSENAME,
  98: PacketType.QUEST_FETCH_ASK,
  99: PacketType.ACCOUNTLIST,
  100: PacketType.SHOOTACK,
  101: PacketType.CREATE_SUCCESS,
  102: PacketType.CHECKCREDITS,
  103: PacketType.GROUNDDAMAGE,
  104: PacketType.GUILDINVITE,
  105: PacketType.ESCAPE,
  106: PacketType.FILE,
  107: PacketType.RESKIN_UNLOCK,
  108: PacketType.NEW_CHARACTER_INFORMATION,
  109: PacketType.UNLOCK_INFORMATION,
  112: PacketType.QUEUE_INFORMATION,
  114: PacketType.EXALTATION_BONUS_CHANGED,
  117: PacketType.VAULT_CONTENT,
  118: PacketType.FORGE_REQUEST,
  119: PacketType.FORGE_RESULT,
  120: PacketType.FORGE_UNLOCKED_BLUEPRINTS,
  122: PacketType.SHOW_ALLY_SHOOT,
};

/**
 * The default bidirectional packet map for the current build. `PacketIO`
 * uses this when no custom map is supplied.
 */
export const DEFAULT_PACKET_MAP: PacketMap = {};
for (const [id, type] of Object.entries(ID_TO_TYPE)) {
  DEFAULT_PACKET_MAP[Number(id)] = type;
  DEFAULT_PACKET_MAP[type] = Number(id);
}
