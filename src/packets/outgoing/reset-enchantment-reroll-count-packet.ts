import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Requests an enchantment reroll-count reset. The payload remains an opaque
 * client-defined string; capture evidence is still needed to document its
 * internal format.
 */
export class ResetEnchantmentRerollCountPacket implements Packet {

  readonly type = PacketType.RESET_ENCHANTMENT_REROLL_COUNT;

  //#region packet-specific members
  /** Client-defined reroll reset payload. */
  value: string;
  //#endregion

  constructor() {
    this.value = '';
  }

  read(reader: Reader): void {
    this.value = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.value);
  }

  /** @deprecated Use {@link value}. */
  get unknownString(): string {
    return this.value;
  }

  /** @deprecated Use {@link value}. */
  set unknownString(value: string) {
    this.value = value;
  }
}

/** @deprecated Use {@link ResetEnchantmentRerollCountPacket}. */
export const Unknown198Packet = ResetEnchantmentRerollCountPacket;
/** @deprecated Use {@link ResetEnchantmentRerollCountPacket}. */
export type Unknown198Packet = ResetEnchantmentRerollCountPacket;
