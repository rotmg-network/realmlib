import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received from the blacksmith in response to a `BlacksmithRequestPacket`.
 * The body is a success flag, an unsigned byte count, and that many affected
 * {@link SlotObjectData} entries. Dismantled slots have `objectType = -1`.
 */
export class BlacksmithDismantlePacket implements Packet {

  readonly type = PacketType.BLACKSMITH_DISMANTLE;

  //#region packet-specific members
  /**
   * If the dismantle attempt was successful.
   */
  success: boolean;
  /**
   * The items to dismantle.
   */
  slots: SlotObjectData[];
  //#endregion

  constructor() {
    this.success = false;
    this.slots = [];
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    const count = reader.readUnsignedByte();
    this.slots = new Array(count);
    for (let i = 0; i < count; i++) {
      this.slots[i] = new SlotObjectData();
      this.slots[i].read(reader);
    }
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeUnsignedByte(this.slots.length);
    for (const slot of this.slots) slot.write(writer);
  }
}
