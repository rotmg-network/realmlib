import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to reroll an item's enchantments. The server acknowledges with an
 * `EnchantPacket`, then publishes the resulting enchantments in stat 80 on a
 * subsequent `NewTickPacket`.
 *
 * Current-build layout (confirmed across 124 Exalt 6.12 requests):
 * `artifactMode:u8, equipmentSlotId:u16, artifactInventorySlot:i16,
 * lockedSlotCount:u8, lockedSlotIndices:u8[count]`.
 */
export class RerollAllEnchantmentsPacket implements Packet {

  readonly type = PacketType.REROLL_ALL_ENCHANTMENTS;

  //#region packet-specific members
  /**
   * Selects the artifact source. Observed as `0` when an inventory artifact is
   * supplied and `1` when {@link artifactInventorySlot} is `-1`. The official
   * enum names are not yet known.
   */
  artifactMode: number;
  /**
   * Equipment/inventory slot whose stat-80 entry is rerolled.
   */
  equipmentSlotId: number;
  /**
   * Inventory slot containing the artifact card, or `-1` when no artifact is
   * supplied.
   */
  artifactInventorySlot: number;
  /**
   * Zero-based enchantment-slot indices which the server must preserve while
   * rerolling the other positions.
   */
  lockedSlotIndices: number[];
  //#endregion

  constructor() {
    this.artifactMode = 0;
    this.equipmentSlotId = 0;
    this.artifactInventorySlot = -1;
    this.lockedSlotIndices = [];
  }

  read(reader: Reader): void {
    this.artifactMode = reader.readUnsignedByte();
    this.equipmentSlotId = reader.readUnsignedShort();
    this.artifactInventorySlot = reader.readShort();
    const lockedSlotCount = reader.readUnsignedByte();
    this.lockedSlotIndices = new Array<number>(lockedSlotCount);
    for (let i = 0; i < lockedSlotCount; i++) {
      this.lockedSlotIndices[i] = reader.readUnsignedByte();
    }
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.artifactMode);
    writer.writeUnsignedShort(this.equipmentSlotId);
    writer.writeShort(this.artifactInventorySlot);
    writer.writeUnsignedByte(this.lockedSlotIndices.length);
    for (const lockedSlotIndex of this.lockedSlotIndices) {
      writer.writeUnsignedByte(lockedSlotIndex);
    }
  }
}
