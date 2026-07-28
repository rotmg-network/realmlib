import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `ClaimChestRewardPacket` (id 171), listing what the
 * chest actually granted.
 *
 * The body is a short count followed by that many int32 item types. It was
 * previously modelled as `byte, byte, int32` from the single `00 01 00009414`
 * sample, which parses identically while the count is 1 but silently truncates
 * any multi-item grant. Three further samples (2026-07-27) are all `0001 <type>`
 * — 0x9588 chosen from a one-entry pool, 0x22fa and 0x33f1 rolled from ten-entry
 * pools — and the client's own "Drops from the chest" screen is a plural list,
 * which is what the count prefix is for.
 */
export class ChestRewardResultPacket implements Packet {
  readonly type = PacketType.CHEST_REWARD_RESULT;

  //#region packet-specific members
  /** The item types awarded by the claim. */
  items: number[];
  //#endregion

  constructor() {
    this.items = [];
  }

  read(reader: Reader): void {
    const count = reader.validateCollectionCount(reader.readShort(), 4, 'chest rewards');
    this.items = new Array<number>(count);
    for (let i = 0; i < count; i++) {
      this.items[i] = reader.readInt32();
    }
  }

  write(writer: Writer): void {
    writer.writeShort(this.items.length);
    for (const item of this.items) {
      writer.writeInt32(item);
    }
  }
}
