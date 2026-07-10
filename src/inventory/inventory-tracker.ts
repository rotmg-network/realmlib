import { ObjectStatusData, StatData } from '../data';
import { StatType, inventorySlotIndex } from '../models';
import { InvResultPacket } from '../packets/incoming/inv-result-packet';
import { MapInfoPacket } from '../packets/incoming/mapinfo-packet';
import { NewTickPacket } from '../packets/incoming/newtick-packet';
import { UpdatePacket } from '../packets/incoming/update-packet';
import { UseItemPacket } from '../packets/outgoing/use-item-packet';

/**
 * An object (player, container, loot bag, ...) whose inventory-carrying stats
 * have been observed in the current map.
 */
export interface TrackedObject {
  objectId: number;
  /** The object's type, or -1 if only seen via NEWTICK (which omits it). */
  objectType: number;
  /** The object's name, if it has broadcast a NAME stat. */
  name?: string;
  /** Whether the object has broadcast SEASONAL_CHARACTER_STAT = 1. */
  seasonal?: boolean;
  /**
   * Flat slot index (0-11 inventory, 12-19 backpack) -> item id, -1 = empty.
   * Only slots that have actually been transmitted are present.
   */
  slots: Map<number, number>;
}

/** A location of an item: which object holds it, and in which flat slot. */
export interface ItemLocation {
  objectId: number;
  slotIndex: number;
}

/**
 * Events produced by {@link InventoryTracker.applyInvResult}.
 */
export type InventoryEvent =
  /** Acknowledges the client's InvSwapPacket. */
  | { kind: 'swap-ack'; result: InvResultPacket }
  /**
   * Acknowledges the client's UseItemPacket. Whether the item was consumed
   * is **not** knowable from the ack (see {@link InvResultPacket}); consumers
   * that need it should compare the slot's item before and after the next
   * stat update. `flags` is passed through verbatim.
   */
  | { kind: 'use-ack'; result: InvResultPacket }
  /**
   * A use-shaped ack (`ackType = 1`) with no matching `UseItemPacket` fed
   * via {@link applyUseItem} — either uses aren't being fed to the tracker,
   * or the server really did clear a slot unprompted. Only the latter is a
   * desync signal, so this event is only meaningful when uses are fed.
   */
  | { kind: 'unmatched-use-ack'; result: InvResultPacket };

/**
 * Reconstructs per-object inventory state from the packet stream.
 *
 * Feed it MAPINFO, UPDATE, NEWTICK, USEITEM and INVRESULT packets (in stream
 * order) and it maintains a *map-scoped* view of every object's inventory
 * slots plus a classification of every INVRESULT. Map-scoped is the crucial
 * part: object ids are reissued on every map transition, so any cross-map
 * accumulation makes one item look like many (see exalt-proxy
 * docs/inventory-desync.md). The tracker therefore resets on every
 * {@link applyMapInfo}.
 */
export class InventoryTracker {

  /** The name of the current map, from the last MAPINFO. */
  mapName = '';
  /** How many maps have been entered (MAPINFO packets applied). */
  mapCount = 0;

  private objects = new Map<number, TrackedObject>();
  /** item id -> count of USEITEMs not yet acknowledged by an INVRESULT. */
  private pendingUses = new Map<number, number>();

  /** All objects observed in the current map. */
  get objectsInView(): ReadonlyMap<number, TrackedObject> {
    return this.objects;
  }

  /**
   * Resets all state for a new map. Call for every MAPINFO packet.
   */
  applyMapInfo(mapInfo: MapInfoPacket): void {
    this.objects.clear();
    this.pendingUses.clear();
    this.mapName = mapInfo.name;
    this.mapCount++;
  }

  /**
   * Applies newly visible objects and drops. Call for every UPDATE packet.
   */
  applyUpdate(update: UpdatePacket): void {
    for (const obj of update.newObjects) {
      this.applyStatus(obj.status, obj.objectType);
    }
    for (const objectId of update.drops) {
      this.objects.delete(objectId);
    }
  }

  /**
   * Applies per-tick stat deltas. Call for every NEWTICK packet. NEWTICK
   * statuses omit the object type, so objects first seen here get type -1
   * until an UPDATE names them.
   */
  applyNewTick(newTick: NewTickPacket): void {
    for (const status of newTick.statuses) {
      this.applyStatus(status, null);
    }
  }

  /**
   * Registers an outgoing item use so its INVRESULT ack can be matched.
   * Call for every USEITEM the client sends.
   */
  applyUseItem(useItem: UseItemPacket): void {
    const item = useItem.slotObject.objectType;
    this.pendingUses.set(item, (this.pendingUses.get(item) ?? 0) + 1);
  }

  /**
   * Classifies an INVRESULT. A use ack is matched against pending uses of
   * the same item (registered via {@link applyUseItem}); a use-shaped ack
   * with no pending use is reported as `unmatched-use-ack` — the only shape
   * that could indicate a genuine server-side correction.
   */
  applyInvResult(result: InvResultPacket): InventoryEvent[] {
    if (!result.isUseItemAck()) {
      return [{ kind: 'swap-ack', result }];
    }
    const item = result.fromSlot.objectType;
    const pending = this.pendingUses.get(item) ?? 0;
    if (pending > 0) {
      if (pending === 1) this.pendingUses.delete(item);
      else this.pendingUses.set(item, pending - 1);
      return [{ kind: 'use-ack', result }];
    }
    return [{ kind: 'unmatched-use-ack', result }];
  }

  /** The tracked state of an object, if it has been seen this map. */
  getObject(objectId: number): TrackedObject | undefined {
    return this.objects.get(objectId);
  }

  /**
   * Every location currently holding `itemType` in this map. Within a single
   * map, several locations for the same item *type* can be legitimate
   * (multiple copies of a potion); across maps it usually means stale object
   * ids, which this tracker guards against by resetting per map.
   */
  locationsOf(itemType: number): ItemLocation[] {
    const locations: ItemLocation[] = [];
    for (const [objectId, obj] of this.objects) {
      for (const [slotIndex, item] of obj.slots) {
        if (item === itemType) {
          locations.push({ objectId, slotIndex });
        }
      }
    }
    return locations;
  }

  private applyStatus(status: ObjectStatusData, objectType: number | null): void {
    let obj = this.objects.get(status.objectId);
    if (!obj) {
      obj = { objectId: status.objectId, objectType: objectType ?? -1, slots: new Map() };
      this.objects.set(status.objectId, obj);
    } else if (objectType !== null) {
      obj.objectType = objectType;
    }
    for (const stat of status.stats) {
      this.applyStat(obj, stat);
    }
  }

  private applyStat(obj: TrackedObject, stat: StatData): void {
    const slotIndex = inventorySlotIndex(stat.statType);
    if (slotIndex !== null) {
      obj.slots.set(slotIndex, stat.statValue);
      return;
    }
    if (stat.statType === StatType.NAME_STAT) {
      obj.name = stat.stringStatValue;
    } else if (stat.statType === StatType.SEASONAL_CHARACTER_STAT) {
      obj.seasonal = stat.statValue !== 0;
    }
  }
}
