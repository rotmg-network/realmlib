import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Updates whether the account save lock is active (packet 222).
 *
 * The 6.12.0.2.0 client identifies the incoming class as
 * `SaveLockUpdateMessage` and reads one bool into its `saveLock` field.
 */
export class SaveLockUpdatePacket implements Packet {
  readonly type = PacketType.SAVE_LOCK_UPDATE;

  //#region packet-specific members
  /** Whether the account save lock is active. */
  saveLock: boolean;
  //#endregion

  constructor() {
    this.saveLock = false;
  }

  read(reader: Reader): void {
    this.saveLock = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.saveLock);
  }

  /** @deprecated Use {@link SaveLockUpdatePacket.saveLock}. */
  get unknownBool(): boolean {
    return this.saveLock;
  }

  set unknownBool(value: boolean) {
    this.saveLock = value;
  }
}

/** @deprecated Use {@link SaveLockUpdatePacket}. */
export const LoadingScreenPacket = SaveLockUpdatePacket;
/** @deprecated Use {@link SaveLockUpdatePacket}. */
export type LoadingScreenPacket = SaveLockUpdatePacket;
