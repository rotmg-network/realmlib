import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to describe a set of claimable rewards. The body is an int32 prompt
 * id, a single byte, then a short-length-prefixed array of int32 reward/item
 * ids. The prompt id matches the value the client sent in the preceding
 * packet 239 (`Unknown239Packet`).
 */
export class ClaimRewardsInfoPromptPacket implements Packet {

  readonly type = PacketType.CLAIM_REWARDS_INFO_PROMPT;

  //#region packet-specific members
  /** The prompt id (echoes the value sent in packet 239). */
  promptId: number;
  /** A byte (observed as 2-3). Purpose not yet confirmed. */
  unknownByte: number;
  /** The reward/item ids offered by this prompt. */
  items: number[];
  //#endregion

  constructor() {
    this.promptId = 0;
    this.unknownByte = 0;
    this.items = [];
  }

  read(reader: Reader): void {
    this.promptId = reader.readInt32();
    this.unknownByte = reader.readByte();
    const count = reader.readShort();
    this.items = new Array<number>(count);
    for (let i = 0; i < count; i++) {
      this.items[i] = reader.readInt32();
    }
  }

  write(writer: Writer): void {
    writer.writeInt32(this.promptId);
    writer.writeByte(this.unknownByte);
    writer.writeShort(this.items.length);
    for (const item of this.items) {
      writer.writeInt32(item);
    }
  }
}
