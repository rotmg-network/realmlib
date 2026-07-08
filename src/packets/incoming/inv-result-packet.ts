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
   * > If the swap was successful.
   */
  success: boolean;

  unknownByte: number; // always 0

  fromSlot: SlotObjectData;

  toSlot: SlotObjectData;

  unknownInt1: number; // always 0

  unknownInt2: number; // always 0
  //#endregion

  constructor() {
    this.success = false; // Probable success bool
    this.unknownByte = 0;
    this.fromSlot = new SlotObjectData();
    this.toSlot = new SlotObjectData();
    this.unknownInt1 = 0;
    this.unknownInt2 = 0;
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.unknownByte = reader.readByte();
    this.fromSlot.read(reader);
    this.toSlot.read(reader);
    this.unknownInt1 = reader.readInt32();
    this.unknownInt2 = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeByte(this.unknownByte);
    this.fromSlot.write(writer);
    this.toSlot.write(writer);
    writer.writeInt32(this.unknownInt1);
    writer.writeInt32(this.unknownInt2);
  }
}
