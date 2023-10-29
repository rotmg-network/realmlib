import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when a notification is received by the player
 */
export class NotificationPacket implements Packet {

  readonly type = PacketType.NOTIFICATION;
  /**
   *  specifies which type of notification it is
   */
  effect: number;
  /**
   * dont really know 
   */
  extra: number;
  /**
   * The notification message
   */
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
   * The position in the Que that you are in.
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
  /**
  * Type of the emote to display
  */
  emoteId: number;
  /**
   * I have no idea wtf this is
   */
  unknown1: number;
  /**
   * I have no idea what this is either
   */
  unknown2: number;

  constructor() {
    this.effect = 0;
    this.extra = 0;
    this.message = '';

    this.objectId = 0;
    this.uiExtra = 0;
    this.queuePos = 0;
    this.color = 0;
    this.pictureType = 0;
    this.emoteId = 0;
    this.unknown1
    this.unknown2
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
      this.message = reader.readString();
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
    } else if (this.effect === 10) { // DungeonCall
      this.message = reader.readString();
      this.unknown1 = reader.readInt32();
      this.unknown2 = reader.readShort();
    } else if (this.effect === 13) { // Emote
      this.objectId = reader.readInt32();
      this.emoteId = reader.readInt32();
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
      writer.writeString(this.message);
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
    } else if (this.effect === 10) { // DungeonCall
      writer.writeString(this.message);
      writer.writeInt32(this.unknown1);
      writer.writeShort(this.unknown2);
    } else if (this.effect === 13) { // Emote
      writer.writeInt32(this.objectId);
      writer.writeInt32(this.emoteId);
    }
  }

  toString(): string {
    return `[Notification] ObjectId: ${this.objectId}\n
    Message: ${this.message}\n
    Color: ${this.color}`;
  }
}
