import { SlotObjectData } from '../../data/slot-object-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Result of a dungeon-modifier refinement request (packet 135).
 *
 * The current client reads the success flag first. The remaining fields are
 * present only on success. `uniqueData` is one UTF string which the client
 * parses into its `UniqueDataContainer`; it is intentionally kept raw here so
 * unknown and future unique-data variants remain lossless.
 */
export class RefineResultPacket implements Packet {
  readonly type = PacketType.REFINE_RESULT;

  success: boolean;
  slotObject: SlotObjectData;
  /** Serialized `UniqueDataContainer` string. */
  uniqueData: string;
  /**
   * Dungeon-modifier data derived by the client from `uniqueData`.
   *
   * This is not an additional wire field. RealmLib leaves it empty because the
   * unique-data grammar is versioned independently of the packet protocol.
   */
  mods: string;

  constructor() {
    this.success = false;
    this.slotObject = new SlotObjectData();
    this.uniqueData = '';
    this.mods = '';
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    if (!this.success) {
      this.slotObject = new SlotObjectData();
      this.uniqueData = '';
      this.mods = '';
      return;
    }

    this.slotObject = new SlotObjectData();
    this.slotObject.read(reader);
    this.uniqueData = reader.readString();
    this.mods = '';
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    if (!this.success) {
      return;
    }

    this.slotObject.write(writer);
    writer.writeString(this.uniqueData);
  }
}
