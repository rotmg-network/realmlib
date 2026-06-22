import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent when playing the Summoner class and a spawned creep minion has to move.
 */
export class CreepMoveMessagePacket implements Packet {

  readonly type = PacketType.CREEP_MOVE_MESSAGE;

  //#region packet-specific members
  /** The object id of the Summoner's creep to move. */
  objectId: number;
  /** The server time. */
  serverTime: number;
  /** The position to move the creep to. */
  position: WorldPosData;
  /** Whether the Summoner ability key is held down. */
  hold: boolean;
  //#endregion

  constructor() {
    this.objectId = 0;
    this.serverTime = 0;
    this.position = new WorldPosData();
    this.hold = false;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectId);
    writer.writeInt32(this.serverTime);
    this.position.write(writer);
    writer.writeBoolean(this.hold);
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
    this.serverTime = reader.readInt32();
    this.position.read(reader);
    this.hold = reader.readBoolean();
  }
}
