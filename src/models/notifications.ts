/** Notification types sent in the NOTIFICATION packet. */
export enum NotificationEffect {
  PLAYER = 0,
  SYSTEM = 1,
  ERROR = 2,
  STICKY = 3,
  GLOBAL = 4,
  REALM_QUEUE = 5,
  OBJECT = 6,
  PLAYER_DEATH = 7,
  PORTAL_OPENED = 8,
  TELEPORT_ERROR = 9,
  PLAYER_CALLOUT = 10,
  PROGRESS_BAR = 11,
  BEHAVIOUR = 12,
  EMOTE = 13,
  VICTORY = 14,
  INVITE = 15,
  CRUCIBLE_DATA_REFRESH = 16,
  ITEM_BOUGHT_FOR_INVENTORY = 17,
  TREE_UNLOCKED = 18,
  MISSION_UNLOCKED = 19,
  BLUEPRINT_UNLOCKED = 20,
  WITH_ICON = 21,
  FAME_BONUS = 22,
  FORGE_FIRE = 23,
  WIND_DIRECTION_CHANGE = 24,
  BLOOD_RITUAL_REFRESH = 25,
  MISSIONS_PROGRESS_REFRESH = 99,
  REALM_THRESHOLD = 1001,
  DUST = 1002,
}

/** Typed view of the effect-specific NOTIFICATION payload. */
export type NotificationPayload =
  | { kind: 'message'; effect: number; extra: number; message: string }
  | { kind: 'ui'; effect: NotificationEffect.GLOBAL; extra: number; message: string; uiExtra: number }
  | {
      kind: 'queue';
      effect: NotificationEffect.REALM_QUEUE;
      extra: number;
      objectId: number;
      queuePosition: number;
    }
  | {
      kind: 'object';
      effect: NotificationEffect.OBJECT;
      extra: number;
      message: string;
      objectId: number;
      color: number;
    }
  | {
      kind: 'picture';
      effect: NotificationEffect.PLAYER_DEATH | NotificationEffect.PORTAL_OPENED;
      extra: number;
      message: string;
      pictureType: number;
    }
  | {
      kind: 'callout';
      effect: NotificationEffect.PLAYER_CALLOUT;
      extra: number;
      message: string;
      senderObjectId: number;
      numberOfStars: number;
    }
  | {
      kind: 'progress';
      effect: NotificationEffect.PROGRESS_BAR;
      extra: number;
      message?: string;
      maximum?: number;
      value?: number;
    }
  | {
      kind: 'emote';
      effect: NotificationEffect.EMOTE;
      extra: number;
      objectId: number;
      emoteType: number;
    }
  | {
      kind: 'purchase';
      effect: NotificationEffect.ITEM_BOUGHT_FOR_INVENTORY;
      extra: number;
      receiptXml: string;
      uiExtra: number;
    }
  | {
      kind: 'tree-unlocked';
      effect: NotificationEffect.TREE_UNLOCKED;
      extra: number;
      value: number;
      uiExtra: number;
    }
  | { kind: 'unknown'; effect: number; extra: number };
