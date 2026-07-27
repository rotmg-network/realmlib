import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Packet 222, server -> client. Layout from the 6.12.0.2.0 client binary
 * (class `EJKNOPDKIEA`, incoming factory id 222): a single bool whose field
 * token is a state flag, not the shared "result" token. It is registered
 * during connect-time setup. `LOADING_SCREEN` is realmlib's legacy name for
 * the id and is not a catalog name — the catalog candidates are
 * `SaveLockUpdateMessage` and `TutorialStateChangedMessage`; a capture with
 * surrounding context is needed to pick. No wire capture exists yet.
 */
export class LoadingScreenPacket implements Packet {

  readonly type = PacketType.LOADING_SCREEN;

  //#region packet-specific members
  /** The single bool body — a state flag of unknown meaning. */
  unknownBool: boolean;
  //#endregion

  constructor() {
    this.unknownBool = false;
  }

  read(reader: Reader): void {
    this.unknownBool = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.unknownBool);
  }
}
