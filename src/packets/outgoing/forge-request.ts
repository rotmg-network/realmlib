import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';


export class ForgeRequestPacket implements Packet {

  readonly type = PacketType.FORGE_REQUEST;

  /**
   * The object id of the item to forge.
   */
  objectId: number;
  /**
   * The items to dismantle.
   */
  slotsUsed: SlotObjectData;

  constructor() {
    this.objectId = 0;
    this.slotsUsed = new SlotObjectData();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectId);
    this.slotsUsed.write(writer);
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
    this.slotsUsed.read(reader)
  }
}
