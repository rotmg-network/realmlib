import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { NotificationEffect, NotificationPayload } from '../../models';

/** Received when the server displays a player or UI notification. */
export class NotificationPacket implements Packet {

  readonly type = PacketType.NOTIFICATION;
  /** Selects the per-effect payload layout. */
  effect: number;
  /**
   * Per-effect flags. For effect 11, bits 0-1 indicate that a leading
   * progress-bar message is present; captures also contain message-less
   * progress updates with both bits clear.
   */
  extra: number;
  /** Optional notification/localization message. */
  message: string;
  /**
   * The object id of the entity which the notification is for.
   */
  objectId: number;
  /**
   * extra UI component for some notifications
   */
  uiExtra: number;
  /**
   * The player's position in the realm queue.
   */
  queuePos: number;
    /**
   * The color of the notification text
   */
  color: number;
  /**
   * Picture to show for the type of notification
   */
  pictureType: number;
  /** Object id of the player who issued a dungeon call. */
  senderObjectId: number;
  /** Star count displayed with a dungeon call. */
  numberOfStars: number;
  /** Effect-11 progress-bar maximum. */
  progressMax: number;
  /** Effect-11 progress-bar current value. */
  progressValue: number;
  /** Whether effect 11 carried its trailing int32 maximum. */
  hasProgressMax: boolean;
  /** Whether effect 11 carried its trailing int16 current value. */
  hasProgressValue: boolean;
  /** Effect-13 emote type. */
  emoteType: number;
  /**
   * An int32 carried by effect-18 notifications; echoes the value the client
   * sent in the preceding packet 224 (`Unknown224Packet`).
   */
  unknownInt: number;

  constructor() {
    this.effect = 0;
    this.extra = 0;
    this.message = '';

    this.objectId = 0;
    this.uiExtra = 0;
    this.queuePos = 0;
    this.color = 0;
    this.pictureType = 0;
    this.senderObjectId = 0;
    this.numberOfStars = 0;
    this.progressMax = 0;
    this.progressValue = 0;
    this.hasProgressMax = false;
    this.hasProgressValue = false;
    this.emoteType = 0;
    this.unknownInt = 0;
  }

  /** Returns an effect-discriminated view of this packet's payload. */
  get payload(): NotificationPayload {
    switch (this.effect) {
      case NotificationEffect.GLOBAL:
        return {
          kind: 'ui',
          effect: NotificationEffect.GLOBAL,
          extra: this.extra,
          message: this.message,
          uiExtra: this.uiExtra,
        };
      case NotificationEffect.REALM_QUEUE:
        return {
          kind: 'queue',
          effect: NotificationEffect.REALM_QUEUE,
          extra: this.extra,
          objectId: this.objectId,
          queuePosition: this.queuePos,
        };
      case NotificationEffect.OBJECT:
        return {
          kind: 'object',
          effect: NotificationEffect.OBJECT,
          extra: this.extra,
          message: this.message,
          objectId: this.objectId,
          color: this.color,
        };
      case NotificationEffect.PLAYER_DEATH:
      case NotificationEffect.PORTAL_OPENED:
        return {
          kind: 'picture',
          effect: this.effect,
          extra: this.extra,
          message: this.message,
          pictureType: this.pictureType,
        };
      case NotificationEffect.PLAYER_CALLOUT:
        return {
          kind: 'callout',
          effect: NotificationEffect.PLAYER_CALLOUT,
          extra: this.extra,
          message: this.message,
          senderObjectId: this.senderObjectId,
          numberOfStars: this.numberOfStars,
        };
      case NotificationEffect.PROGRESS_BAR:
        return {
          kind: 'progress',
          effect: NotificationEffect.PROGRESS_BAR,
          extra: this.extra,
          message: (this.extra & 3) !== 0 ? this.message : undefined,
          maximum: this.hasProgressMax ? this.progressMax : undefined,
          value: this.hasProgressValue ? this.progressValue : undefined,
        };
      case NotificationEffect.EMOTE:
        return {
          kind: 'emote',
          effect: NotificationEffect.EMOTE,
          extra: this.extra,
          objectId: this.objectId,
          emoteType: this.emoteType,
        };
      case NotificationEffect.ITEM_BOUGHT_FOR_INVENTORY:
        return {
          kind: 'purchase',
          effect: NotificationEffect.ITEM_BOUGHT_FOR_INVENTORY,
          extra: this.extra,
          receiptXml: this.message,
          uiExtra: this.uiExtra,
        };
      case NotificationEffect.TREE_UNLOCKED:
        return {
          kind: 'tree-unlocked',
          effect: NotificationEffect.TREE_UNLOCKED,
          extra: this.extra,
          value: this.unknownInt,
          uiExtra: this.uiExtra,
        };
      case NotificationEffect.PLAYER:
      case NotificationEffect.SYSTEM:
      case NotificationEffect.ERROR:
      case NotificationEffect.STICKY:
      case NotificationEffect.TELEPORT_ERROR:
        return { kind: 'message', effect: this.effect, extra: this.extra, message: this.message };
      default:
        return { kind: 'unknown', effect: this.effect, extra: this.extra };
    }
  }

  read(reader: Reader): void {
    this.effect = reader.readByte();
    this.extra = reader.readByte();
    if (this.effect === 0) { // StatIncrease
      this.message = reader.readString();
    } else if (this.effect === 1) { // ServerMessage
      this.message = reader.readString();
    } else if (this.effect === 2) { // ErrorMessage
      this.message = reader.readString();
    } else if (this.effect === 3) { // KeepMessage
      this.message = reader.readString();
    } else if (this.effect === 4) { // UI
      this.message = reader.readString();
      this.uiExtra = reader.readShort();
    } else if (this.effect === 5) { // Queue
      this.objectId = reader.readInt32();
      this.queuePos = reader.readShort();
    } else if (this.effect === 6) { // ObjectText/json
      this.message = reader.readString();
      this.objectId = reader.readInt32();
      this.color = reader.readInt32();
    } else if (this.effect === 7) { // Death
      this.message = reader.readString();
      this.pictureType = reader.readInt32();
    } else if (this.effect === 8) { // DungeonOpened
      this.message = reader.readString();
      this.pictureType = reader.readInt32();
    } else if (this.effect === 9) { // JSON-key message, e.g. {"k":"s.teleport_target_not_found"}
      this.message = reader.readString();
    } else if (this.effect === 10) { // DungeonCall
      this.message = reader.readString();
      this.senderObjectId = reader.readInt32();
      this.numberOfStars = reader.readShort();
    } else if (this.effect === 11) { // ProgressBar
      // `extra & 3` controls only the optional message. Captures include both
      // full boss labels (extra 0x2a) and message-less updates (extra 0x28).
      if ((this.extra & 3) !== 0 && reader.remaining >= 2) {
        this.message = reader.readString();
      }
      // Some effect-11 frames are only the effect/extra pair, so preserve the
      // presence of each trailing field instead of manufacturing zero bytes.
      if (reader.remaining >= 4) {
        this.progressMax = reader.readInt32();
        this.hasProgressMax = true;
      }
      if (reader.remaining >= 2) {
        this.progressValue = reader.readShort();
        this.hasProgressValue = true;
      }
    } else if (this.effect === 13) { // Emote
      this.objectId = reader.readInt32();
      this.emoteType = reader.readInt32();
    } else if (this.effect === 17) { // PurchaseResult
      // Receipt for a purchase request (packet 223). The string is an XML
      // document, e.g.
      //   <Success><ItemsInventory>31597</ItemsInventory><Credits>0</Credits>
      //   <Fame>777</Fame><Recipient>OpJokrrr</Recipient>
      //   <CampaignProgress>...</CampaignProgress></Success>
      // followed by a trailing short. Confirmed from the 2026-07-26 proxy
      // capture, where the absence of this branch abandoned 239 of 241 bytes.
      this.message = reader.readString();
      if (reader.remaining >= 2) {
        this.uiExtra = reader.readShort();
      }
    } else if (this.effect === 18) { // reverse-engineered from a single sample
      // int32 echoes the value sent in the preceding packet 224.
      this.unknownInt = reader.readInt32();
      this.uiExtra = reader.readShort();
    }
  }

  write(writer: Writer): void {
    writer.writeByte(this.effect);
    writer.writeByte(this.extra);

    if (this.effect === 0) { // StatIncrease
      writer.writeString(this.message);
    } else if (this.effect === 1) { // ServerMessage
      writer.writeString(this.message);
    } else if (this.effect === 2) { // ErrorMessage
      writer.writeString(this.message);
    } else if (this.effect === 3) { // KeepMessage
      writer.writeString(this.message);
    } else if (this.effect === 4) { // UI
      writer.writeString(this.message);
      writer.writeShort(this.uiExtra);
    } else if (this.effect === 5) { // Queue
      writer.writeInt32(this.objectId);
      writer.writeShort(this.queuePos);
    } else if (this.effect === 6) { // ObjectText/json
      writer.writeString(this.message);
      writer.writeInt32(this.objectId);
      writer.writeInt32(this.color);
    } else if (this.effect === 7) { // Death
      writer.writeString(this.message);
      writer.writeInt32(this.pictureType);
    } else if (this.effect === 8) { // DungeonOpened
      writer.writeString(this.message);
      writer.writeInt32(this.pictureType);
    } else if (this.effect === 9) { // JSON-key message
      writer.writeString(this.message);
    } else if (this.effect === 10) { // DungeonCall
      writer.writeString(this.message);
      writer.writeInt32(this.senderObjectId);
      writer.writeShort(this.numberOfStars);
    } else if (this.effect === 11) { // ProgressBar
      if ((this.extra & 3) !== 0) {
        writer.writeString(this.message);
      }
      if (this.hasProgressMax || this.progressMax !== 0) {
        writer.writeInt32(this.progressMax);
      }
      if (this.hasProgressValue || this.progressValue !== 0) {
        writer.writeShort(this.progressValue);
      }
    } else if (this.effect === 13) { // Emote
      writer.writeInt32(this.objectId);
      writer.writeInt32(this.emoteType);
    } else if (this.effect === 17) { // PurchaseResult
      writer.writeString(this.message);
      writer.writeShort(this.uiExtra);
    } else if (this.effect === 18) { // reverse-engineered from a single sample
      writer.writeInt32(this.unknownInt);
      writer.writeShort(this.uiExtra);
    }
  }

  toString(): string {
    return `[Notification] ObjectId: ${this.objectId}\n
    Message: ${this.message}\n
    Color: ${this.color}\n\n
    ${this}`;
  }
}
