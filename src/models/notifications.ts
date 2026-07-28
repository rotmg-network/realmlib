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
  /** Shares wire value 15 with {@link INVITE} in the current client. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- current client defines both names
  MISSIONS_REFRESH = 15,
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
  /** @deprecated Use {@link MISSIONS_PROGRESS_ONLY_REFRESH}. */
  MISSIONS_PROGRESS_REFRESH = 99,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- compatibility alias
  MISSIONS_PROGRESS_ONLY_REFRESH = 99,
}

/**
 * Legacy notification values which do not fit the signed-byte effect field of
 * {@link NotificationPacket}. Their wire channel remains unresolved.
 */
export enum LegacyNotificationValue {
  REALM_THRESHOLD = 1001,
  DUST = 1002,
}

// Namespace merge preserves the deprecated runtime property without admitting
// these values into the signed-byte NotificationEffect enum type.
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace NotificationEffect {
  /**
   * @deprecated This value is not serializable as a `NotificationPacket`
   * effect. Use {@link LegacyNotificationValue.REALM_THRESHOLD}.
   */
  export const REALM_THRESHOLD = LegacyNotificationValue.REALM_THRESHOLD;
  /**
   * @deprecated This value is not serializable as a `NotificationPacket`
   * effect. Use {@link LegacyNotificationValue.DUST}.
   */
  export const DUST = LegacyNotificationValue.DUST;
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
      kind: 'behaviour';
      effect: NotificationEffect.BEHAVIOUR;
      extra: number;
      message: string;
      objectTypeOrId: number;
      colorOrType: number;
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
      uiExtra?: number;
    }
  | {
      kind: 'tree-unlocked';
      effect: NotificationEffect.TREE_UNLOCKED;
      extra: number;
      value: number;
      uiExtra: number;
    }
  | { kind: 'unknown'; effect: number; extra: number };

/**
 * Chat text kind on the `TEXT` packet, from client enum `FBAIGIMMLKK`
 * (build 6.12.0.2.0).
 */
export enum TextKind {
  Normal = 1,
  AutoTranslated = 2
}

/**
 * Moderation action kinds, from client enum `DBPELDFMMPI` (build 6.12.0.2.0);
 * pairs with `MODERATOR_ACTION_MESSAGE` (124).
 */
export enum ModerationAction {
  MuteAccount = 0,
  UnmuteAccount = 1,
  Kick = 2,
  AccountBlock = 3
}
