import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received with slipping (ice-physics) parameters for the player. Layout
 * from the 6.12.0.2.0 client binary (class `JJBNOICAGNM`, incoming factory
 * id 236): four float32s, handled via the player/character class. The name
 * comes from the catalog's `SlippingInfoMessage` — the only remaining
 * catalog name that fits a four-float body — so treat it as tentative; the
 * individual floats cannot be named from the dump. No wire capture exists
 * yet.
 */
export class SlippingInfoPacket implements Packet {
  readonly type = PacketType.SLIPPING_INFO;

  //#region packet-specific members
  /** First float. Purpose unknown (friction/acceleration parameters). */
  unknownFloat: number;
  /** Second float. Purpose unknown. */
  unknownFloat2: number;
  /** Third float. Purpose unknown. */
  unknownFloat3: number;
  /** Fourth float. Purpose unknown. */
  unknownFloat4: number;
  //#endregion

  constructor() {
    this.unknownFloat = 0;
    this.unknownFloat2 = 0;
    this.unknownFloat3 = 0;
    this.unknownFloat4 = 0;
  }

  read(reader: Reader): void {
    this.unknownFloat = reader.readFloat();
    this.unknownFloat2 = reader.readFloat();
    this.unknownFloat3 = reader.readFloat();
    this.unknownFloat4 = reader.readFloat();
  }

  write(writer: Writer): void {
    writer.writeFloat(this.unknownFloat);
    writer.writeFloat(this.unknownFloat2);
    writer.writeFloat(this.unknownFloat3);
    writer.writeFloat(this.unknownFloat4);
  }
}
