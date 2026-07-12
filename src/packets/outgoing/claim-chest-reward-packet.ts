import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to claim a reward from a chest-reward container (e.g. an event chest).
 * The server answers with a `ChestRewardResultPacket` (id 172).
 *
 * Captured body `01 <slot> 0001` = a leading byte (observed 1), the
 * {@link SlotObjectData} of the reward being claimed (container objectId,
 * slotId, and the reward/container item type), then a trailing short
 * (observed 1). The two constant-looking fields are not yet confirmed.
 */
export class ClaimChestRewardPacket implements Packet {

  readonly type = PacketType.CLAIM_CHEST_REWARD;

  //#region packet-specific members
  /** A leading byte (observed 1). Purpose not yet confirmed. */
  unknownByte: number;
  /** The reward slot being claimed. */
  slotObject: SlotObjectData;
  /** A trailing short (observed 1). Purpose not yet confirmed. */
  unknownShort: number;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.slotObject = new SlotObjectData();
    this.unknownShort = 0;
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.slotObject = new SlotObjectData();
    this.slotObject.read(reader);
    this.unknownShort = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    this.slotObject.write(writer);
    writer.writeShort(this.unknownShort);
  }
}
