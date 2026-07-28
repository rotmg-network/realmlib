import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { NotificationEffect, NotificationPayload } from '../../models';

/** Mutable fields owned by NotificationPacket and operated on by effect codecs. */
export interface NotificationEffectState {
  effect: number;
  extra: number;
  message: string;
  objectId: number;
  uiExtra: number;
  hasUiExtra: boolean;
  queuePos: number;
  color: number;
  pictureType: number;
  senderObjectId: number;
  numberOfStars: number;
  progressMax: number;
  progressValue: number;
  hasProgressMax: boolean;
  hasProgressValue: boolean;
  objectTypeOrId: number;
  colorOrType: number;
  emoteType: number;
  unknownInt: number;
  unknownPayload: Buffer;
}

interface NotificationEffectCodec {
  read(state: NotificationEffectState, reader: Reader): void;
  write(state: NotificationEffectState, writer: Writer): void;
  payload(state: NotificationEffectState): NotificationPayload;
}

const messageCodec: NotificationEffectCodec = {
  read: (state, reader) => {
    state.message = reader.readString();
  },
  write: (state, writer) => {
    writer.writeString(state.message);
  },
  payload: (state) => ({
    kind: 'message',
    effect: state.effect,
    extra: state.extra,
    message: state.message,
  }),
};

const codecs = new Map<number, NotificationEffectCodec>();
for (const effect of [
  NotificationEffect.PLAYER,
  NotificationEffect.SYSTEM,
  NotificationEffect.ERROR,
  NotificationEffect.STICKY,
  NotificationEffect.TELEPORT_ERROR,
]) {
  codecs.set(effect, messageCodec);
}

codecs.set(NotificationEffect.GLOBAL, {
  read: (state, reader) => {
    state.message = reader.readString();
    state.uiExtra = reader.readShort();
  },
  write: (state, writer) => {
    writer.writeString(state.message);
    writer.writeShort(state.uiExtra);
  },
  payload: (state) => ({
    kind: 'ui',
    effect: NotificationEffect.GLOBAL,
    extra: state.extra,
    message: state.message,
    uiExtra: state.uiExtra,
  }),
});

codecs.set(NotificationEffect.REALM_QUEUE, {
  read: (state, reader) => {
    state.objectId = reader.readInt32();
    state.queuePos = reader.readShort();
  },
  write: (state, writer) => {
    writer.writeInt32(state.objectId);
    writer.writeShort(state.queuePos);
  },
  payload: (state) => ({
    kind: 'queue',
    effect: NotificationEffect.REALM_QUEUE,
    extra: state.extra,
    objectId: state.objectId,
    queuePosition: state.queuePos,
  }),
});

codecs.set(NotificationEffect.OBJECT, {
  read: (state, reader) => {
    state.message = reader.readString();
    state.objectId = reader.readInt32();
    state.color = reader.readInt32();
  },
  write: (state, writer) => {
    writer.writeString(state.message);
    writer.writeInt32(state.objectId);
    writer.writeInt32(state.color);
  },
  payload: (state) => ({
    kind: 'object',
    effect: NotificationEffect.OBJECT,
    extra: state.extra,
    message: state.message,
    objectId: state.objectId,
    color: state.color,
  }),
});

const pictureCodec: NotificationEffectCodec = {
  read: (state, reader) => {
    state.message = reader.readString();
    state.pictureType = reader.readInt32();
  },
  write: (state, writer) => {
    writer.writeString(state.message);
    writer.writeInt32(state.pictureType);
  },
  payload: (state) => ({
    kind: 'picture',
    effect: state.effect as NotificationEffect.PLAYER_DEATH | NotificationEffect.PORTAL_OPENED,
    extra: state.extra,
    message: state.message,
    pictureType: state.pictureType,
  }),
};
codecs.set(NotificationEffect.PLAYER_DEATH, pictureCodec);
codecs.set(NotificationEffect.PORTAL_OPENED, pictureCodec);

codecs.set(NotificationEffect.PLAYER_CALLOUT, {
  read: (state, reader) => {
    state.message = reader.readString();
    state.senderObjectId = reader.readInt32();
    state.numberOfStars = reader.readShort();
  },
  write: (state, writer) => {
    writer.writeString(state.message);
    writer.writeInt32(state.senderObjectId);
    writer.writeShort(state.numberOfStars);
  },
  payload: (state) => ({
    kind: 'callout',
    effect: NotificationEffect.PLAYER_CALLOUT,
    extra: state.extra,
    message: state.message,
    senderObjectId: state.senderObjectId,
    numberOfStars: state.numberOfStars,
  }),
});

codecs.set(NotificationEffect.PROGRESS_BAR, {
  read: (state, reader) => {
    if ((state.extra & 3) !== 0 && reader.remaining >= 2) {
      state.message = reader.readString();
    }
    if (reader.remaining >= 4) {
      state.progressMax = reader.readInt32();
      state.hasProgressMax = true;
    }
    if (reader.remaining >= 2) {
      state.progressValue = reader.readShort();
      state.hasProgressValue = true;
    }
  },
  write: (state, writer) => {
    if ((state.extra & 3) !== 0) {
      writer.writeString(state.message);
    }
    if (state.hasProgressMax || state.progressMax !== 0) {
      writer.writeInt32(state.progressMax);
    }
    if (state.hasProgressValue || state.progressValue !== 0) {
      writer.writeShort(state.progressValue);
    }
  },
  payload: (state) => ({
    kind: 'progress',
    effect: NotificationEffect.PROGRESS_BAR,
    extra: state.extra,
    message: (state.extra & 3) !== 0 ? state.message : undefined,
    maximum: state.hasProgressMax ? state.progressMax : undefined,
    value: state.hasProgressValue ? state.progressValue : undefined,
  }),
});

codecs.set(NotificationEffect.BEHAVIOUR, {
  read: (state, reader) => {
    state.message = reader.readString();
    state.objectTypeOrId = reader.readInt32();
    state.colorOrType = reader.readInt32();
  },
  write: (state, writer) => {
    writer.writeString(state.message);
    writer.writeInt32(state.objectTypeOrId);
    writer.writeInt32(state.colorOrType);
  },
  payload: (state) => ({
    kind: 'behaviour',
    effect: NotificationEffect.BEHAVIOUR,
    extra: state.extra,
    message: state.message,
    objectTypeOrId: state.objectTypeOrId,
    colorOrType: state.colorOrType,
  }),
});

codecs.set(NotificationEffect.EMOTE, {
  read: (state, reader) => {
    state.objectId = reader.readInt32();
    state.emoteType = reader.readInt32();
  },
  write: (state, writer) => {
    writer.writeInt32(state.objectId);
    writer.writeInt32(state.emoteType);
  },
  payload: (state) => ({
    kind: 'emote',
    effect: NotificationEffect.EMOTE,
    extra: state.extra,
    objectId: state.objectId,
    emoteType: state.emoteType,
  }),
});

codecs.set(NotificationEffect.ITEM_BOUGHT_FOR_INVENTORY, {
  read: (state, reader) => {
    state.message = reader.readString();
    if (reader.remaining >= 2) {
      state.uiExtra = reader.readShort();
      state.hasUiExtra = true;
    }
  },
  write: (state, writer) => {
    writer.writeString(state.message);
    if (state.hasUiExtra || state.uiExtra !== 0) {
      writer.writeShort(state.uiExtra);
    }
  },
  payload: (state) => ({
    kind: 'purchase',
    effect: NotificationEffect.ITEM_BOUGHT_FOR_INVENTORY,
    extra: state.extra,
    receiptXml: state.message,
    uiExtra: state.hasUiExtra ? state.uiExtra : undefined,
  }),
});

codecs.set(NotificationEffect.TREE_UNLOCKED, {
  read: (state, reader) => {
    state.unknownInt = reader.readInt32();
    state.uiExtra = reader.readShort();
  },
  write: (state, writer) => {
    writer.writeInt32(state.unknownInt);
    writer.writeShort(state.uiExtra);
  },
  payload: (state) => ({
    kind: 'tree-unlocked',
    effect: NotificationEffect.TREE_UNLOCKED,
    extra: state.extra,
    value: state.unknownInt,
    uiExtra: state.uiExtra,
  }),
});

const zeroBodyEffects = new Set<number>([
  NotificationEffect.VICTORY,
  NotificationEffect.INVITE,
  NotificationEffect.CRUCIBLE_DATA_REFRESH,
  NotificationEffect.MISSION_UNLOCKED,
  NotificationEffect.BLUEPRINT_UNLOCKED,
  NotificationEffect.WITH_ICON,
  NotificationEffect.FAME_BONUS,
  NotificationEffect.FORGE_FIRE,
  NotificationEffect.WIND_DIRECTION_CHANGE,
  NotificationEffect.BLOOD_RITUAL_REFRESH,
  NotificationEffect.MISSIONS_PROGRESS_ONLY_REFRESH,
]);

export function resetNotificationEffectState(state: NotificationEffectState): void {
  state.message = '';
  state.objectId = 0;
  state.uiExtra = 0;
  state.hasUiExtra = false;
  state.queuePos = 0;
  state.color = 0;
  state.pictureType = 0;
  state.senderObjectId = 0;
  state.numberOfStars = 0;
  state.progressMax = 0;
  state.progressValue = 0;
  state.hasProgressMax = false;
  state.hasProgressValue = false;
  state.objectTypeOrId = 0;
  state.colorOrType = 0;
  state.emoteType = 0;
  state.unknownInt = 0;
  state.unknownPayload = Buffer.alloc(0);
}

export function readNotificationEffect(
  state: NotificationEffectState,
  reader: Reader,
): void {
  const codec = codecs.get(state.effect);
  if (codec) {
    codec.read(state, reader);
  } else if (!zeroBodyEffects.has(state.effect)) {
    state.unknownPayload = Buffer.from(reader.buffer.subarray(reader.index, reader.length));
    reader.index = reader.length;
  }
}

export function writeNotificationEffect(
  state: NotificationEffectState,
  writer: Writer,
): void {
  const codec = codecs.get(state.effect);
  if (codec) {
    codec.write(state, writer);
  } else if (!zeroBodyEffects.has(state.effect)) {
    for (const byte of state.unknownPayload) {
      writer.writeUnsignedByte(byte);
    }
  }
}

export function notificationPayload(state: NotificationEffectState): NotificationPayload {
  return codecs.get(state.effect)?.payload(state) ?? {
    kind: 'unknown',
    effect: state.effect,
    extra: state.extra,
    rawPayload: state.unknownPayload.length ? Buffer.from(state.unknownPayload) : undefined,
  };
}
