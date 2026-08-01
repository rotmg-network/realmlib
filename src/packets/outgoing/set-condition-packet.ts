import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent when the player inflicts a condition effect.
 */
export class SetConditionPacket implements Packet {
  readonly type = PacketType.SETCONDITION;

  //#region packet-specific members
  /**
   * The unsigned condition-effect bitmask.
   */
  conditionEffect: number;
  /**
   * The duration of the condition effect.
   */
  conditionDuration: number;
  //#endregion

  constructor() {
    this.conditionEffect = 0;
    this.conditionDuration = 0;
  }

  write(writer: Writer): void {
    writer.writeUInt32(this.conditionEffect);
    writer.writeFloat(this.conditionDuration);
  }

  read(reader: Reader): void {
    this.conditionEffect = reader.readUInt32();
    this.conditionDuration = reader.readFloat();
  }
}
