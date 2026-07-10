import { SlotObjectData, WorldPosData } from '../data';
import { InvResultPacket } from '../packets/incoming/inv-result-packet';
import { InvSwapPacket } from '../packets/outgoing/inv-swap-packet';

/** A plain slot reference used to build swaps without realmlib classes. */
export interface SlotRef {
  /** The id of the entity which owns the slot. */
  objectId: number;
  /** The index of the slot. */
  slotId: number;
  /** The item id in the slot, or -1 if it is empty. */
  objectType: number;
}

/**
 * Builds a ready-to-send `InvSwapPacket`.
 *
 * @param time The client time (ms since connect), as sent in MOVE packets.
 * @param position The player's current position.
 * @param from The slot the item is taken from.
 * @param to The slot the item is placed in (its `objectType` is the item
 * currently there, or -1 when empty).
 */
export function buildInvSwap(
  time: number,
  position: { x: number; y: number },
  from: SlotRef,
  to: SlotRef,
): InvSwapPacket {
  const swap = new InvSwapPacket();
  swap.time = time;
  swap.position = new WorldPosData(position.x, position.y);
  swap.slotObject1 = SlotObjectData.from(from.objectId, from.slotId, from.objectType);
  swap.slotObject2 = SlotObjectData.from(to.objectId, to.slotId, to.objectType);
  return swap;
}

/**
 * The semantic meaning of an `InvResultPacket` (see the packet docs for the
 * underlying `ackType`/null-slot/flags conventions).
 */
export type InvResultClassification =
  /** Acknowledges the client's own InvSwapPacket. */
  | { kind: 'swap-ack'; success: boolean; from: SlotObjectData; to: SlotObjectData }
  /**
   * Acknowledges a UseItemPacket. `flags` is the raw (undecoded) bitfield;
   * consumption is not knowable from the ack, so it is not reported here.
   */
  | { kind: 'use-ack'; from: SlotObjectData; flags: number };

/**
 * Classifies an `InvResultPacket` into its semantic meaning. Stateless — to
 * additionally verify that each use ack matches a USEITEM the client really
 * sent, feed packets through `InventoryTracker` instead.
 */
export function classifyInvResult(result: InvResultPacket): InvResultClassification {
  if (!result.isUseItemAck()) {
    return { kind: 'swap-ack', success: result.success, from: result.fromSlot, to: result.toSlot };
  }
  return { kind: 'use-ack', from: result.fromSlot, flags: result.flags };
}

/** A swap awaiting its acknowledgement. */
export interface PendingSwap {
  swap: InvSwapPacket;
  /** The caller's timestamp from {@link SwapCorrelator.sent}. */
  sentAt: number;
}

/**
 * Correlates sent `InvSwapPacket`s with their `INVRESULT` acknowledgements.
 *
 * Register each outgoing swap with {@link sent}; feed every incoming
 * `InvResultPacket` to {@link onResult}. Acks are matched to the oldest
 * pending swap that references the same slots, so unmatched pending swaps
 * (visible via {@link pending}) indicate the server never answered — an
 * early desync warning.
 */
export class SwapCorrelator {

  private queue: PendingSwap[] = [];

  /** Registers an outgoing swap. `sentAt` is any caller-side timestamp. */
  sent(swap: InvSwapPacket, sentAt: number): void {
    this.queue.push({ swap, sentAt });
  }

  /**
   * Processes an incoming result. If it is a swap ack matching a pending
   * swap's slots, that swap is removed from the queue and returned;
   * otherwise (use acks, unmatched acks) returns null.
   */
  onResult(result: InvResultPacket): PendingSwap | null {
    if (result.isUseItemAck()) {
      return null;
    }
    const index = this.queue.findIndex(({ swap }) =>
      this.slotsMatch(swap.slotObject1, result.fromSlot)
      && this.slotsMatch(swap.slotObject2, result.toSlot));
    if (index === -1) {
      return null;
    }
    return this.queue.splice(index, 1)[0];
  }

  /** Swaps still awaiting acknowledgement, oldest first. */
  pending(): readonly PendingSwap[] {
    return this.queue;
  }

  /**
   * Drops (and returns) pending swaps sent at or before `cutoff` — use with
   * the same clock passed to {@link sent} to expire swaps the server never
   * acknowledged.
   */
  expire(cutoff: number): PendingSwap[] {
    const expired = this.queue.filter((p) => p.sentAt <= cutoff);
    this.queue = this.queue.filter((p) => p.sentAt > cutoff);
    return expired;
  }

  /**
   * An ack echoes the swap's slots but swaps which item sits where, so match
   * on owner + slot index only.
   */
  private slotsMatch(a: SlotObjectData, b: SlotObjectData): boolean {
    return a.objectId === b.objectId && a.slotId === b.slotId;
  }
}
