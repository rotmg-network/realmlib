import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Selects or configures a class ability at a world-space target.
 *
 * First captured from a Druid in Exalt 6.12.0.2.0. The selector's official
 * enum values and whether every value uses a target position are not yet
 * known, so {@link ability} intentionally remains a numeric byte.
 */
export class SetAbilityPacket implements Packet {

  readonly type = PacketType.SET_ABILITY;

  //#region packet-specific members
  /** Client game time in milliseconds. */
  time: number;
  /** Provisional ability/form selector; observed as `1`. */
  ability: number;
  /** World-space target requested for the ability. */
  target: WorldPosData;
  //#endregion

  constructor() {
    this.time = 0;
    this.ability = 0;
    this.target = new WorldPosData();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
    writer.writeUnsignedByte(this.ability);
    this.target.write(writer);
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
    this.ability = reader.readUnsignedByte();
    this.target.read(reader);
  }
}
