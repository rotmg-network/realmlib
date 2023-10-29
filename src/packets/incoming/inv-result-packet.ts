import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * > Unknown.
 */
export class InvResultPacket implements Packet {

  readonly type = PacketType.INVRESULT;

  //#region packet-specific members
  /**
   * > Unknown.
   */
  unknownBool: boolean;

  unknownByte: number;

  fromSlot: SlotObjectData;

  toSlot: SlotObjectData;

  unknownInt1: number;

  unknownInt2: number;
  //#endregion

  constructor() {
    this.unknownBool = false; // Probable success bool
    this.unknownByte = 0;
    this.fromSlot = new SlotObjectData();
    this.toSlot = new SlotObjectData();
    this.unknownInt1 = 0;
    this.unknownInt2 = 0;
  }

  read(reader: Reader): void {
    this.unknownBool = reader.readBoolean();
    this.unknownByte = reader.readByte();
    this.fromSlot.read(reader);
    this.toSlot.read(reader);
    this.unknownInt1 = reader.readInt32();
    this.unknownInt2 = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.unknownBool);
    writer.writeByte(this.unknownByte);
    this.fromSlot.write(writer);
    this.toSlot.write(writer);
    writer.writeInt32(this.unknownInt1);
    writer.writeInt32(this.unknownInt2);
  }
}
