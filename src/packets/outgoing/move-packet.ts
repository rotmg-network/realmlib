import { MoveRecord } from '../../data';
import { WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to acknowledge a `NewTickPacket`, and to notify the
 * server of the client's current position and time.
 */
export class MovePacket implements Packet {

  readonly type = PacketType.MOVE;

  //#region packet-specific members
  /**
   * The tick id of the `NewTickPacket` which this is acknowledging.
   */
  tickId: number;
  /**
   * The current client time.
   */
  time: number;
  /**
   * The move records of the client.
   *
   * This property has to have atleast one moverecord in it.
   */
  records: MoveRecord[];
  //#endregion

  constructor() {
    this.tickId = 0;
    this.time = 0;
    this.records = [];
  }

  write(writer: Writer): void {
    writer.writeInt32(this.tickId);
    writer.writeUInt32(this.time);
    writer.writeShort(this.records.length);
    for (const record of this.records) {
      record.write(writer);
    }
  }

  read(reader: Reader): void {
    this.tickId = reader.readInt32();
    this.time = reader.readUInt32();
    this.records = new Array(reader.readShort());
    for (let i = 0; i < this.records.length; i++) {
      this.records[i] = new MoveRecord();
      this.records[i].read(reader);
    }
  }
}
