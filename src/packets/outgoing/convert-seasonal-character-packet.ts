import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';

/**
 * Sent to the server when the player wants to convert a seasonal character into a normal character.
 */
export class ConvertSeasonalCharacterPacket implements Packet {

  readonly type = PacketType.CONVERT_SEASONAL_CHARACTER;

  write(): void {
    // empty
  }

  read(): void {
    // empty
  }
}
