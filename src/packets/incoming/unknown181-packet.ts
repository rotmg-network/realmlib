import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to `ACTIVATE_CRUCIBLE` (180). A single result bool
 * (observed 1 following crucible activity in the 2026-07-26 capture).
 *
 * Formerly `Unknown181Packet`. The 6.12.0.2.0 client binary settles it:
 * class `FDDGDIKABKI` at incoming factory id 181 is registered by
 * `CruciblesManager`, i.e. the catalog's `ActivateCrucibleResultMessage`,
 * pairing with outgoing 180.
 */
export class ActivateCrucibleResultPacket implements Packet {
  readonly type = PacketType.ACTIVATE_CRUCIBLE_RESULT;

  //#region packet-specific members
  /** Whether the crucible activation succeeded (observed true). */
  result: boolean;
  //#endregion

  constructor() {
    this.result = false;
  }

  /**
   * Backward-compatible numeric alias for {@link ActivateCrucibleResultPacket.result}.
   * @deprecated The body is a boolean success flag.
   */
  get value(): number {
    return this.result ? 1 : 0;
  }

  set value(value: number) {
    this.result = value !== 0;
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
  }
}

/** @deprecated Renamed {@link ActivateCrucibleResultPacket}. */
export const Unknown181Packet = ActivateCrucibleResultPacket;
/** @deprecated Renamed {@link ActivateCrucibleResultPacket}. */
export type Unknown181Packet = ActivateCrucibleResultPacket;
