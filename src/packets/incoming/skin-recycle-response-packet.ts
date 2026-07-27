import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to `SKIN_RECYCLE` (146). Layout from the 6.12.0.2.0
 * client binary (class `CGCHNDIKOOH`, incoming factory id 147): a result bool
 * and a `SlotObjectData`. Formerly registered as `UNKNOWN147`; the name comes
 * from the catalog's `SkinRecycleResponseMessage` and the 146→147
 * request/response adjacency that this build uses consistently
 * (129/130, 131/132, 180/181, 195/196). No wire capture exists yet.
 */
export class SkinRecycleResponsePacket implements Packet {

  readonly type = PacketType.SKIN_RECYCLE_RESPONSE;

  //#region packet-specific members
  /** Whether the recycle succeeded. */
  result: boolean;
  /** The slot involved in the recycle. */
  slotObject: SlotObjectData;
  //#endregion

  constructor() {
    this.result = false;
    this.slotObject = new SlotObjectData();
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
    this.slotObject = new SlotObjectData();
    this.slotObject.read(reader);
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
    this.slotObject.write(writer);
  }
}
