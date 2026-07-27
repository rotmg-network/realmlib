import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to claim a reward from a chest item, spending it. The server answers
 * with a `ChestRewardResultPacket` (id 172).
 *
 * Body is `01 <SlotObjectData> <short choiceIndex>`. The slot object names
 * where the chest sits: `01 00000249 00000010 0000ff27 0000` followed an
 * `InvSwapPacket` moving the chest from the vault into player slot 16 and a
 * `UseItemPacket` on `(0x249, 16, 0xff27)` — objectId is the player, slotId the
 * inventory slot, objectType the chest. A second claim in the same session used
 * slot 0x0c, so the slot tracks wherever the chest happens to be.
 *
 * `choiceIndex` selects from the `ClaimRewardsInfoPromptPacket` pool for a
 * `chestType` 2 chest, and is 0 (ignored) for `chestType` 3, which the server
 * rolls itself.
 *
 * Ordering matters: `UseItemPacket` does NOT consume a chest, it only makes the
 * server send the pool. In the capture the chest sat in the player's slot for
 * ~150 packets between prompt and claim while the player read the popup. Only
 * this packet spends it, so a cancelled prompt leaves the item intact.
 */
export class ClaimChestRewardPacket implements Packet {

  readonly type = PacketType.CLAIM_CHEST_REWARD;

  //#region packet-specific members
  /** A leading byte, 1 in every capture. Purpose not yet confirmed. */
  unknownByte: number;
  /** Where the chest sits: player objectId, inventory slot, chest item type. */
  slotObject: SlotObjectData;
  /** Index into the prompt's pool for a `chestType` 2 chest; 0 otherwise. */
  choiceIndex: number;
  //#endregion

  constructor() {
    this.unknownByte = 1;
    this.slotObject = new SlotObjectData();
    this.choiceIndex = 0;
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.slotObject = new SlotObjectData();
    this.slotObject.read(reader);
    this.choiceIndex = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    this.slotObject.write(writer);
    writer.writeShort(this.choiceIndex);
  }
}
