import { UnlockInformationType } from '../../models/unlock-information';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Announces that an account feature has been unlocked. The current wire body
 * is one int32. A captured value of {@link UnlockInformationType.VAULT} was
 * immediately followed by `s.vault_unlocked` and authoritative vault content.
 */
export class UnlockInformationPacket implements Packet {

  readonly type = PacketType.UNLOCK_INFORMATION;

  /** Raw unlock kind; use {@link UnlockInformationType} for known values. */
  unlockType: number;

  constructor() {
    this.unlockType = 0;
  }

  read(reader: Reader): void {
    this.unlockType = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.unlockType);
  }
}
