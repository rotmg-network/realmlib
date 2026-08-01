import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to activate a crucible (packet 180).
 */
export class ActivateCruciblePacket implements Packet {
  readonly type = PacketType.ACTIVATE_CRUCIBLE;

  //#region packet-specific members
  /** Identifier of the crucible being activated. */
  crucibleId: string;
  /** Raw unsigned activation byte (observed as 0 or 1). */
  activate: number;
  /** Raw unsigned crucible-type byte. */
  crucibleType: number;
  //#endregion

  constructor() {
    this.crucibleId = '';
    this.activate = 0;
    this.crucibleType = 0;
  }

  read(reader: Reader): void {
    this.crucibleId = reader.readString();
    this.activate = reader.readUnsignedByte();
    this.crucibleType = reader.readUnsignedByte();
  }

  write(writer: Writer): void {
    writer.writeString(this.crucibleId);
    writer.writeUnsignedByte(this.activate);
    writer.writeUnsignedByte(this.crucibleType);
  }

  /**
   * Compatibility view which packs `activate` and `crucibleType` as the signed
   * big-endian short exposed by older RealmLib releases.
   * @deprecated Use `activate` and `crucibleType` separately.
   */
  get trailing(): number {
    const packed = ((this.activate & 0xff) << 8) | (this.crucibleType & 0xff);
    return packed >= 0x8000 ? packed - 0x10000 : packed;
  }

  set trailing(value: number) {
    const packed = value & 0xffff;
    this.activate = packed >>> 8;
    this.crucibleType = packed & 0xff;
  }
}
