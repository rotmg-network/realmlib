import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { NotificationPayload } from '../../models';
import {
  notificationPayload,
  NotificationEffectState,
  readNotificationEffect,
  resetNotificationEffectState,
  writeNotificationEffect,
} from './notification-effect-codecs';

/** Received when the server displays a player or UI notification. */
export class NotificationPacket implements Packet, NotificationEffectState {

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
  /** Whether effect 17 carried its optional trailing short. */
  hasUiExtra: boolean;
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
  /** First raw int32 carried by effect 12; observed to vary by event/object. */
  objectTypeOrId: number;
  /** Second raw int32 carried by effect 12; stable within encounter families. */
  colorOrType: number;
  /** Effect-13 emote type. */
  emoteType: number;
  /**
   * An int32 carried by effect-18 notifications; echoes the value the client
   * sent in the preceding packet 224 (`Unknown224Packet`).
   */
  unknownInt: number;
  /** Raw body retained for an effect whose layout is not modeled. */
  unknownPayload: Buffer;

  constructor() {
    this.effect = 0;
    this.extra = 0;
    this.message = '';

    this.objectId = 0;
    this.uiExtra = 0;
    this.hasUiExtra = false;
    this.queuePos = 0;
    this.color = 0;
    this.pictureType = 0;
    this.senderObjectId = 0;
    this.numberOfStars = 0;
    this.progressMax = 0;
    this.progressValue = 0;
    this.hasProgressMax = false;
    this.hasProgressValue = false;
    this.objectTypeOrId = 0;
    this.colorOrType = 0;
    this.emoteType = 0;
    this.unknownInt = 0;
    this.unknownPayload = Buffer.alloc(0);
  }

  /** Returns an effect-discriminated view of this packet's payload. */
  get payload(): NotificationPayload {
    return notificationPayload(this);
  }

  read(reader: Reader): void {
    this.effect = reader.readByte();
    this.extra = reader.readByte();
    resetNotificationEffectState(this);
    readNotificationEffect(this, reader);
  }

  write(writer: Writer): void {
    writer.writeByte(this.effect);
    writer.writeByte(this.extra);

    writeNotificationEffect(this, writer);
  }

  toString(): string {
    return `[Notification] ${JSON.stringify(this.payload)}`;
  }
}
