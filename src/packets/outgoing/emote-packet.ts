import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent when the player performs an emote. Reverse-engineered from samples across
 * two sessions, all of the form `00 00 14 32 | <int32> | 01`: the first int32
 * was constant (5170), the second increased monotonically (a client timestamp),
 * and a trailing byte was 1. The meaning of the first and last fields is not
 * fully confirmed.
 */
export class EmotePacket implements Packet {

  readonly type = PacketType.EMOTE;

  //#region packet-specific members
  /** The emote to perform (observed constant 5170). */
  emoteType: number;
  /** The current client time (observed increasing). */
  time: number;
  /** A trailing byte (observed 1). */
  unknownByte: number;
  //#endregion

  constructor() {
    this.emoteType = 0;
    this.time = 0;
    this.unknownByte = 0;
  }

  read(reader: Reader): void {
    this.emoteType = reader.readInt32();
    this.time = reader.readInt32();
    this.unknownByte = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.emoteType);
    writer.writeInt32(this.time);
    writer.writeByte(this.unknownByte);
  }
}
