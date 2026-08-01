import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to set/select a gravestone. Layout from the 6.12.0.2.0 client binary
 * (class `OJGOEAHEMPN`, vtable id 156): two int32s, written in the reverse of
 * their memory-offset order (the fields below are in native WIRE order).
 * Native setter dataflow identifies the first value as the gravestone type;
 * the second remains unresolved. No wire capture exists yet.
 */
export class SetGraveStonePacket implements Packet {
  readonly type = PacketType.SET_GRAVE_STONE;

  //#region packet-specific members
  /** Gravestone type selected by the account. */
  gravestoneType: number;
  /** Second int32 on the wire. Purpose unknown. */
  unknownInt2: number;
  //#endregion

  constructor() {
    this.gravestoneType = 0;
    this.unknownInt2 = 0;
  }

  /** @deprecated Use {@link SetGraveStonePacket.gravestoneType}. */
  get unknownInt(): number {
    return this.gravestoneType;
  }

  set unknownInt(value: number) {
    this.gravestoneType = value;
  }

  read(reader: Reader): void {
    this.gravestoneType = reader.readInt32();
    this.unknownInt2 = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.gravestoneType);
    writer.writeInt32(this.unknownInt2);
  }
}
