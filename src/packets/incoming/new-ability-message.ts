import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when a new ability has been unlocked by the player.
 */
export class NewAbilityMessage implements Packet {

  readonly type = PacketType.NEW_ABILITY;

  /**
   * The type of ability which has been unlocked.
   */
  abilityType: number;

  constructor() {
    this.abilityType = 0;
  }

  read(reader: Reader): void {
    this.abilityType = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.abilityType);
  }

  toString(): string {
    return `[NewAbilityMessage] Type: ${this.abilityType}`;
  }
}
