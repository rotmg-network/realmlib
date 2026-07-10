import { SlotObjectData } from '../../data';
import { InvResultOrigin } from '../../models/inv-result';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to acknowledge an inventory-affecting client packet. This is
 * **dual-purpose**, discriminated by `ackType`:
 *
 * 1. `ackType = 0`: acknowledges the client's {@link InvSwapPacket} —
 *    `fromSlot`/`toSlot` echo the swap's slots with the items in their new
 *    places.
 * 2. `ackType = 1`: acknowledges the client's `UseItemPacket` — `fromSlot`
 *    is the used item's slot and `toSlot` is always the **null slot**
 *    (objectId 0, objectType 0). The null `toSlot` does **not** mean the item
 *    was consumed: a use ack is sent for every use, consuming or not.
 *
 * Whether the item was actually consumed must be read from the inventory
 * itself (the slot's `INVENTORY_*` stat emptying), **not** from this packet.
 * `flags` does not indicate consumption — see the field docs.
 *
 * In captures, every `ackType = 1` INVRESULT followed a `USEITEM` of the
 * same item within ~0.25s (330+/330+ across four sessions) — this packet was
 * previously misread as a server-initiated "forced removal"/desync corrector,
 * which it is not.
 */
export class InvResultPacket implements Packet {

  readonly type = PacketType.INVRESULT;

  //#region packet-specific members
  /** Whether the operation succeeded (true for use acks too). */
  success: boolean;
  /**
   * Which client packet this acknowledges: 0 = `InvSwapPacket`,
   * 1 = `UseItemPacket` (see {@link InvResultOrigin} and the class docs).
   */
  ackType: number;
  /** The slot the item moved from (for a use ack, the used item's slot). */
  fromSlot: SlotObjectData;
  /**
   * The slot the item moved to. Always the null slot (objectId 0) on use
   * acks — this is not a signal of consumption (see the class docs).
   */
  toSlot: SlotObjectData;
  /**
   * Always 0 on swap acks. On use acks it is a **bitfield** whose meaning is
   * not yet decoded — crucially it does *not* indicate consumption: the same
   * ability (e.g. item 2608) is acked with `0x0`, `0x20000`, `0x60000`,
   * `0x100000`, ... on different uses while never leaving its slot, and a
   * consumed potion can carry `0x20000` too. Bits combine
   * (`0x60000 = 0x20000 | 0x40000`). See `InvResultFlags` for the observed
   * bit atlas.
   */
  flags: number;
  /** Purpose unknown; observed 0. */
  unknownInt2: number;
  //#endregion

  constructor() {
    this.success = false;
    this.ackType = 0;
    this.fromSlot = new SlotObjectData();
    this.toSlot = new SlotObjectData();
    this.flags = 0;
    this.unknownInt2 = 0;
  }

  /**
   * The {@link InvResultOrigin} of this ack (typed view of `ackType`).
   */
  get origin(): InvResultOrigin {
    return this.ackType as InvResultOrigin;
  }

  /**
   * Whether this acknowledges a `UseItemPacket` rather than an
   * `InvSwapPacket`.
   */
  isUseItemAck(): boolean {
    return this.ackType === InvResultOrigin.UseItemAck;
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.ackType = reader.readByte();
    this.fromSlot.read(reader);
    this.toSlot.read(reader);
    this.flags = reader.readInt32();
    this.unknownInt2 = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeByte(this.ackType);
    this.fromSlot.write(writer);
    this.toSlot.write(writer);
    writer.writeInt32(this.flags);
    writer.writeInt32(this.unknownInt2);
  }
}
