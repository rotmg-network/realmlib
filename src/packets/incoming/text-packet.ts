import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when a chat message is sent by another player or NPC
 */
export class TextPacket implements Packet {

  readonly type = PacketType.TEXT;

  /**
   * The sender of the message
   */
  name: string;
  /**
   * The object id of the sender
   */
  objectId: number;
  /**
   * The number of stars of the sender
   */
  numStars: number;
  /**
   * The length of time to display the chat bubble for
   */
  bubbleTime: number;
  /**
   * The recipient of the message
   */
  recipient: string;
  /**
   * The content of the message
   */
  text: string;
  /**
   * > Unknown.
   */
  cleanText: string;
  /**
   * Whether or not the sender of the message is a supporter
   */
  isSupporter: boolean;
  /**
   * The star background of the player
   */
  starBackground: number;

  constructor() {
    this.name = '';
    this.objectId = 0;
    this.numStars = 0;
    this.bubbleTime = 0;
    this.recipient = '';
    this.text = '';
    this.cleanText = '';
    this.isSupporter = false;
    this.starBackground = 0;
  }

  read(reader: Reader): void {
    this.name = reader.readString();
    this.objectId = reader.readInt32();
    this.numStars = reader.readUnsignedShort();
    this.bubbleTime = reader.readUnsignedByte();
    this.recipient = reader.readString();
    this.text = reader.readString();
    this.cleanText = reader.readString();
    this.isSupporter = reader.readBoolean();
    this.starBackground = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeString(this.name);
    writer.writeInt32(this.objectId);
    writer.writeUnsignedShort(this.numStars);
    writer.writeUnsignedByte(this.bubbleTime);
    writer.writeString(this.recipient);
    writer.writeString(this.text);
    writer.writeString(this.cleanText);
    writer.writeBoolean(this.isSupporter);
    writer.writeInt32(this.starBackground);
  }

  toString(): string {
    return `[Text] Name: ${this.name}\n
    ObjectId: ${this.objectId}\n
    NumStars: ${this.numStars}\n
    BubbleTime: ${this.bubbleTime}\n
    Recipient: ${this.recipient}\n
    Text: ${this.text}\n
    CleanText: ${this.cleanText}\n
    IsSupporter: ${this.isSupporter}\n
    StarBg: ${this.starBackground}`;
  }
}
