import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to the blacksmith to act on the item in a given inventory slot
 * (e.g. to dismantle/craft it). The body is a single leading byte followed
 * by the target {@link SlotObjectData}.
 */
export class BlacksmithRequestPacket implements Packet {

  readonly type = PacketType.BLACKSMITH_REQUEST;

  //#region packet-specific members
  /**
   * A leading byte (observed as 1). Purpose not yet confirmed.
   */
  unknownByte: number;
  /**
   * The inventory slot the request targets. `objectType` is the item being
   * acted on.
   */
  slotObject: SlotObjectData;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.slotObject = new SlotObjectData();
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.slotObject = new SlotObjectData();
    this.slotObject.read(reader);
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    this.slotObject.write(writer);
  }
}
