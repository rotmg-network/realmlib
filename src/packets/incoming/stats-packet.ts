import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { StacksState } from '../../data';

/**
 * Updates the eight temporary base-stat stack counters for a character.
 */
export class StatsPacket implements Packet {
  readonly type = PacketType.STATS;

  //#region packet-specific members
  /** The object id the stats are for. */
  objectId: number;
  /** HP/MP/attack/defense/speed/vitality/wisdom/dexterity stack counters. */
  state: StacksState;
  //#endregion

  constructor() {
    this.objectId = 0;
    this.state = new StacksState();
  }

  /**
   * @deprecated The former int32 parser combined hp/mp/attack/defense. Use
   * `state` instead.
   */
  get unknownInt1(): number {
    return (
      (this.state.hp << 24) | (this.state.mp << 16) | (this.state.attack << 8) | this.state.defense
    );
  }

  /**
   * @deprecated The former int32 parser combined speed/vitality/wisdom/
   * dexterity. Use `state` instead.
   */
  get unknownInt2(): number {
    return (
      (this.state.speed << 24) |
      (this.state.vitality << 16) |
      (this.state.wisdom << 8) |
      this.state.dexterity
    );
  }

  /** @deprecated Use the named byte counters on `state`. */
  get abilityStateUnits(): number {
    return this.unknownInt1 / 256;
  }

  read(reader: Reader): void {
    this.objectId = reader.readCompressedInt();
    this.state.read(reader);
  }

  write(writer: Writer): void {
    writer.writeCompressedInt(this.objectId);
    this.state.write(writer);
  }
}
