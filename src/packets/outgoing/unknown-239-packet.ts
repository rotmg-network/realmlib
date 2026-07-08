import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 239 (client -> server). The body is a single int32
 * which the server echoes back as the `promptId` of a
 * `ClaimRewardsInfoPromptPacket` (170) — i.e. this appears to request the
 * reward info for a given prompt id.
 */
export class Unknown239Packet implements Packet {

  readonly type = PacketType.UNKNOWN239;

  //#region packet-specific members
  /** The prompt id being requested (echoed back in packet 170). */
  promptId: number;
  //#endregion

  constructor() {
    this.promptId = 0;
  }

  read(reader: Reader): void {
    this.promptId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.promptId);
  }
}
