import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';

/**
 * Sent to convert a seasonal character into a normal character. Current
 * captures converge through blueprint state and commonly Update/InvResult;
 * only a minority reconnect, so reconnect must not be treated as the sole
 * acknowledgement or success condition.
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
