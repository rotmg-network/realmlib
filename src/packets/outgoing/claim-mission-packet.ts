import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to claim a mission reward. Reverse-engineered from a single sample
 * (`00000032 00000002 01 ffff`); the field meanings are not yet confirmed.
 */
export class ClaimMissionPacket implements Packet {

  readonly type = PacketType.CLAIM_MISSION;

  //#region packet-specific members
  /** First int32 (observed as 50). Purpose not yet confirmed. */
  unknownInt: number;
  /** Second int32 (observed as 2). Purpose not yet confirmed. */
  unknownInt2: number;
  /** A byte (observed as 1). Purpose not yet confirmed. */
  unknownByte: number;
  /** A trailing short (observed as -1). Purpose not yet confirmed. */
  unknownShort: number;
  //#endregion

  constructor() {
    this.unknownInt = 0;
    this.unknownInt2 = 0;
    this.unknownByte = 0;
    this.unknownShort = 0;
  }

  read(reader: Reader): void {
    this.unknownInt = reader.readInt32();
    this.unknownInt2 = reader.readInt32();
    this.unknownByte = reader.readByte();
    this.unknownShort = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.unknownInt);
    writer.writeInt32(this.unknownInt2);
    writer.writeByte(this.unknownByte);
    writer.writeShort(this.unknownShort);
  }
}
