import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received periodically while in a realm to update the current realm score.
 * Observed as a single 4-byte value that increases monotonically over the
 * lifetime of a realm.
 */
export class RealmScoreUpdatePacket implements Packet {

  readonly type = PacketType.REALM_SCORE_UPDATE;

  //#region packet-specific members
  /**
   * The current realm score.
   */
  realmScore: number;
  //#endregion

  constructor() {
    this.realmScore = 0;
  }

  read(reader: Reader): void {
    this.realmScore = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.realmScore);
  }
}
