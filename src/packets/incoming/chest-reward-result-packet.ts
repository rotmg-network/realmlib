import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `ClaimChestRewardPacket` (id 171). Reports the
 * outcome of a chest-reward claim.
 *
 * Captured body `00 01 00009414` = two leading bytes (observed 0 and 1),
 * then an int32 which is the awarded item type (`0x9414` = 37908 in the
 * sample). The two leading bytes are unconfirmed (likely a success flag and/or
 * a reward count) — from a single sample.
 */
export class ChestRewardResultPacket implements Packet {

  readonly type = PacketType.CHEST_REWARD_RESULT;

  //#region packet-specific members
  /** A leading byte (observed 0). Purpose not yet confirmed. */
  unknownByte: number;
  /** A second leading byte (observed 1). Purpose not yet confirmed. */
  unknownByte2: number;
  /** The item type awarded by the claim. */
  itemType: number;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.unknownByte2 = 0;
    this.itemType = 0;
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.unknownByte2 = reader.readByte();
    this.itemType = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    writer.writeByte(this.unknownByte2);
    writer.writeInt32(this.itemType);
  }
}
