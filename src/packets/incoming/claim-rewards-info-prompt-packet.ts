import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to describe a chest's reward pool — either in response to the
 * client's `ClaimRewardsInfoRequestPacket` (id 239), or unprompted after a
 * `UseItemPacket` on a chest. The body is an int32 chest item type, a byte
 * chest type, then a short-length-prefixed array of int32 item ids.
 *
 * Both fields are pinned down by the 2026-07-27 capture:
 *
 * - `chestItemType` is the chest's own object type, not a separate table key.
 *   `UseItem(objectId 0x249, slot 0x10, type 0xff27)` was answered by a prompt
 *   for 0xff27, and the `ClaimChestRewardPacket` that followed named 0xff27 in
 *   its `SlotObjectData`. That is what lets id 239 ask by a bare int32.
 * - `chestType` is the item's `<ChestType>` XML tag: 2 = the player picks one
 *   entry (`choiceIndex` on the claim selects it), 3 = the server rolls one and
 *   the list is display-only. Six chests captured, all six agree with their XML.
 *
 * `items` is in display order — a type-3 Tarot Card Pack granted index 2 of its
 * ten, which is the third row shown to the player.
 */
export class ClaimRewardsInfoPromptPacket implements Packet {
  readonly type = PacketType.CLAIM_REWARDS_INFO_PROMPT;

  //#region packet-specific members
  /** The chest's item type (echoes the `ClaimRewardsInfoRequestPacket`'s value). */
  chestItemType: number;
  /**
   * The chest's `<ChestType>`: 2 = the player chooses an entry, 3 = the server
   * rolls one at random and this list is a preview.
   */
  chestType: number;
  /** The item types this chest can grant, in display order. */
  items: number[];
  //#endregion

  constructor() {
    this.chestItemType = 0;
    this.chestType = 0;
    this.items = [];
  }

  read(reader: Reader): void {
    this.chestItemType = reader.readInt32();
    this.chestType = reader.readUnsignedByte();
    const count = reader.validateCollectionCount(reader.readShort(), 4, 'claimable rewards');
    this.items = new Array<number>(count);
    for (let i = 0; i < count; i++) {
      this.items[i] = reader.readInt32();
    }
  }

  write(writer: Writer): void {
    writer.writeInt32(this.chestItemType);
    writer.writeUnsignedByte(this.chestType);
    writer.writeShort(this.items.length);
    for (const item of this.items) {
      writer.writeInt32(item);
    }
  }
}
