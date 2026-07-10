import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received about an inventory change. This is **dual-purpose**:
 *
 * 1. an acknowledgement of the client's {@link InvSwapPacket} (`serverInitiated`
 *    is 0), or
 * 2. a server-*pushed* inventory mutation the client did not request
 *    (`serverInitiated` is 1) — e.g. the server removing/correcting an item.
 *    A push whose `toSlot` is the **null slot** (objectId 0, slotId 0,
 *    objectType 0) is an item being taken away/consumed.
 *
 * Server pushes are how the server force-corrects a desynced inventory: captures
 * show the same `fromSlot` cleared repeatedly, which is what a player sees as an
 * item "desyncing".
 */
export class InvResultPacket implements Packet {

  readonly type = PacketType.INVRESULT;

  //#region packet-specific members
  /** Whether the operation succeeded (also true for server-initiated pushes). */
  success: boolean;
  /**
   * 0 when this acknowledges the client's `InvSwapPacket`; 1 when the server
   * pushed this inventory change on its own (see class docs). Was previously
   * documented as "always 0" — it is not.
   */
  serverInitiated: number;
  /** The slot the item moved from (for a push, the slot being cleared). */
  fromSlot: SlotObjectData;
  /** The slot the item moved to (the null slot — objectId 0 — means removed). */
  toSlot: SlotObjectData;
  /**
   * Flags. Usually 0; observed `0x1000` (4096) on repeated server-side removals
   * of the same item/slot. Was previously documented as "always 0".
   */
  flags: number;
  /** Purpose unknown; observed 0. */
  unknownInt2: number;
  //#endregion

  constructor() {
    this.success = false;
    this.serverInitiated = 0;
    this.fromSlot = new SlotObjectData();
    this.toSlot = new SlotObjectData();
    this.flags = 0;
    this.unknownInt2 = 0;
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.serverInitiated = reader.readByte();
    this.fromSlot.read(reader);
    this.toSlot.read(reader);
    this.flags = reader.readInt32();
    this.unknownInt2 = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeByte(this.serverInitiated);
    this.fromSlot.write(writer);
    this.toSlot.write(writer);
    writer.writeInt32(this.flags);
    writer.writeInt32(this.unknownInt2);
  }
}
