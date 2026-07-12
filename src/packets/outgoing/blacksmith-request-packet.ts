import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to dismantle one or more blacksmith items. The body is an unsigned
 * byte count followed by that many {@link SlotObjectData} entries.
 */
export class BlacksmithRequestPacket implements Packet {

  readonly type = PacketType.BLACKSMITH_REQUEST;

  //#region packet-specific members
  /**
   * A leading byte (observed as 1). Purpose not yet confirmed.
   */
  slots: SlotObjectData[];
  //#endregion

  constructor() {
    this.slots = [];
  }

  read(reader: Reader): void {
    const count = reader.readUnsignedByte();
    this.slots = new Array(count);
    for (let i = 0; i < count; i++) {
      this.slots[i] = new SlotObjectData();
      this.slots[i].read(reader);
    }
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.slots.length);
    for (const slot of this.slots) slot.write(writer);
  }
}
