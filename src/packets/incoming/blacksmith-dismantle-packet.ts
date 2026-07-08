import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received from the blacksmith in response to a `BlacksmithRequestPacket`.
 * The body is two leading bytes followed by the affected
 * {@link SlotObjectData}; after a dismantle the slot's `objectType` is `-1`
 * (empty), while its `objectId`/`slotId` echo the request.
 */
export class BlacksmithDismantlePacket implements Packet {

  readonly type = PacketType.BLACKSMITH_DISMANTLE;

  //#region packet-specific members
  /**
   * A leading byte (observed as 1). Purpose not yet confirmed.
   */
  unknownByte: number;
  /**
   * A second leading byte (observed as 1). Purpose not yet confirmed.
   */
  unknownByte2: number;
  /**
   * The affected inventory slot. After a dismantle `objectType` is `-1`.
   */
  slotObject: SlotObjectData;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.unknownByte2 = 0;
    this.slotObject = new SlotObjectData();
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.unknownByte2 = reader.readByte();
    this.slotObject = new SlotObjectData();
    this.slotObject.read(reader);
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    writer.writeByte(this.unknownByte2);
    this.slotObject.write(writer);
  }
}
