import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 234 (client -> server). The body is a single byte
 * (observed as both 0 and 1); the server replies with a
 * `ClaimRewardResultPacket` carrying an XML reward manifest. The byte likely
 * selects the free or premium reward track, but that meaning is not proven.
 */
export class ClaimRewardPacket implements Packet {

  readonly type = PacketType.CLAIM_REWARD;

  //#region packet-specific members
  /** A single byte (observed as 0 and 1). Purpose not yet confirmed. */
  unknownByte: number;
  //#endregion

  constructor() {
    this.unknownByte = 0;
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
  }
}
