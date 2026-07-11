/**
 * Semantics of the `INVRESULT` packet, reverse-engineered from captured
 * sessions (see `InvResultPacket`). `INVRESULT` acknowledges *two* client
 * packets, discriminated by its `ackType` byte: `InvSwapPacket` and
 * `UseItemPacket`.
 *
 * Every `ackType = 1` INVRESULT arrived one RTT after a `USEITEM` of the 
 * same item — they are use acknowledgements, not server-initiated inventory corrections.
 */

/**
 * Which client packet an `InvResultPacket` acknowledges.
 */
export enum InvResultOrigin {
  /** Acknowledges the client's `InvSwapPacket`. */
  SwapAck = 0,
  /**
   * Acknowledges the client's `UseItemPacket`. `toSlot` is always the null
   * slot (objectId 0, objectType 0) regardless of whether the item was
   * consumed — a use ack is sent for every use. Consumption is observable
   * only via the inventory `INVENTORY_*` stat emptying, never from this
   * packet.
   */
  UseItemAck = 1,
}

/**
 * Observed bits of `InvResultPacket.flags` on use acks. This is a **bitfield**
 * (values combine, e.g. `0x60000 = Bit17 | Bit18`) whose meaning is not yet
 * decoded. It is **not** a consumption flag: the same ability is acked with
 * many different flag values across uses while never leaving its slot, and a
 * consumed potion can carry a non-zero value.
 *
 * These entries are named by bit position, not by meaning, so new captures
 * can extend the atlas without implying semantics. Values seen so far:
 * `0x0`, `0x40`, `0x1000`, `0x20000`, `0x40000`, `0x60000`, `0x80000`,
 * `0x84000`, `0x100000`, `0x160000`, `0x800000`, `0x800040`.
 */
export enum InvResultFlags {
  None = 0,
  Bit6 = 0x40,
  Bit12 = 0x1000,
  Bit14 = 0x4000,
  Bit17 = 0x20000,
  Bit18 = 0x40000,
  Bit19 = 0x80000,
  Bit20 = 0x100000,
  Bit23 = 0x800000,
}
