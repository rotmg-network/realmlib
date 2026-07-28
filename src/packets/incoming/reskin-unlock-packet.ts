import { ReskinUnlockType } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to notify the player that a new skin has been unlocked
 */
export class ReskinUnlockPacket implements Packet {
  readonly type = PacketType.RESKIN_UNLOCK;

  /**
   * The kind of unlock (RealmShark: `unlockType`).
   */
  unlockType: ReskinUnlockType;
  /**
   * The id of the skin that was unlocked (RealmShark: `unlockId`).
   */
  unlockId: number;

  constructor() {
    this.unlockType = 0 as ReskinUnlockType;
    this.unlockId = 0;
  }

  read(reader: Reader): void {
    this.unlockType = reader.readUnsignedByte() as ReskinUnlockType;
    this.unlockId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.unlockType);
    writer.writeInt32(this.unlockId);
  }

  toString(): string {
    return `[ReskinUnlock] type: ${this.unlockType}, unlockId: ${this.unlockId}`;
  }
}
