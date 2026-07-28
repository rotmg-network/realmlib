import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Result of an enchantment reroll-count reset request.
 */
export class ResetEnchantmentRerollCountResultPacket implements Packet {
  readonly type = PacketType.RESET_ENCHANTMENT_REROLL_COUNT_RESULT;

  //#region packet-specific members
  /** Result flag. */
  success: boolean;
  //#endregion

  constructor() {
    this.success = false;
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
  }
}

/** @deprecated Use `ResetEnchantmentRerollCountResultPacket`. */
export class Unknown199Packet extends ResetEnchantmentRerollCountResultPacket {
  get result(): boolean {
    return this.success;
  }

  set result(value: boolean) {
    this.success = value;
  }
}
