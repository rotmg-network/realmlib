import { expect } from 'chai';
import {
  InventoryTracker,
  InvResultFlags,
  InvResultOrigin,
  InvResultPacket,
  InvSwapPacket,
  MapInfoPacket,
  NewTickPacket,
  ObjectStatusData,
  Reader,
  SlotObjectData,
  StatData,
  StatType,
  SwapCorrelator,
  UpdatePacket,
  UseItemPacket,
  buildInvSwap,
  classifyInvResult,
  inventorySlotIndex,
  slotIndexToStatType,
} from '../src';

/** Reads a packet class from captured hex. */
function fromHex<T extends { read(reader: Reader): void }>(packet: T, hex: string): T {
  const buf = Buffer.from(hex, 'hex');
  const reader = new Reader(buf.length);
  buf.copy(reader.buffer, 0, 0, buf.length);
  reader.index = 0;
  packet.read(reader);
  return packet;
}

// Real captured INVRESULT bodies (cults session).
const SWAP_ACK_HEX = '01000000d93300000000ffffffff0000d9320000000400000baf0000000000000000';
// Use ack for the Rogue cloak (item 2648): null toSlot, flags 0x1000.
const USE_ACK_HEX = '0101000004aa0000000100000a580000000000000000000000000000100000000000';

function statData(statType: number, statValue: number): StatData {
  const stat = new StatData();
  stat.statType = statType;
  stat.statValue = statValue;
  return stat;
}

function status(objectId: number, stats: StatData[]): ObjectStatusData {
  const s = new ObjectStatusData();
  s.objectId = objectId;
  s.stats = stats;
  return s;
}

function mapInfo(name: string): MapInfoPacket {
  const p = new MapInfoPacket();
  p.name = name;
  return p;
}

describe('inventory stat helpers', () => {
  it('maps INVENTORY_0..11 to slots 0..11', () => {
    expect(inventorySlotIndex(StatType.INVENTORY_0_STAT)).to.equal(0);
    expect(inventorySlotIndex(StatType.INVENTORY_11_STAT)).to.equal(11);
  });

  it('maps BACKPACK_0..7 to slots 12..19', () => {
    expect(inventorySlotIndex(StatType.BACKPACK_0_STAT)).to.equal(12);
    expect(inventorySlotIndex(StatType.BACKPACK_7_STAT)).to.equal(19);
  });

  it('returns null for non-inventory stats', () => {
    expect(inventorySlotIndex(StatType.MAX_HP_STAT)).to.equal(null);
    expect(inventorySlotIndex(StatType.NAME_STAT)).to.equal(null);
  });

  it('round-trips through slotIndexToStatType', () => {
    for (let i = 0; i < 20; i++) {
      expect(inventorySlotIndex(slotIndexToStatType(i)!)).to.equal(i);
    }
    expect(slotIndexToStatType(20)).to.equal(null);
    expect(slotIndexToStatType(-1)).to.equal(null);
  });
});

describe('SlotObjectData helpers', () => {
  it('identifies empty and null slots', () => {
    expect(SlotObjectData.from(1194, 1, -1).isEmpty()).to.equal(true);
    expect(SlotObjectData.from(1194, 1, 2648).isEmpty()).to.equal(false);
    expect(SlotObjectData.from(0, 0, 0).isNull()).to.equal(true);
    expect(SlotObjectData.from(1194, 0, 0).isNull()).to.equal(false);
  });

  it('supports equals and clone', () => {
    const slot = SlotObjectData.from(55603, 0, 2991);
    expect(slot.equals(slot.clone())).to.equal(true);
    expect(slot.equals(SlotObjectData.from(55603, 1, 2991))).to.equal(false);
  });
});

describe('InvResultPacket semantics', () => {
  it('classifies the captured swap ack', () => {
    const packet = fromHex(new InvResultPacket(), SWAP_ACK_HEX);
    expect(packet.origin).to.equal(InvResultOrigin.SwapAck);
    expect(packet.isUseItemAck()).to.equal(false);
    const classified = classifyInvResult(packet);
    expect(classified.kind).to.equal('swap-ack');
  });

  it('classifies the captured cloak use as a use ack, flags a raw bitfield', () => {
    const packet = fromHex(new InvResultPacket(), USE_ACK_HEX);
    expect(packet.origin).to.equal(InvResultOrigin.UseItemAck);
    expect(packet.isUseItemAck()).to.equal(true);
    // flags is a passthrough bitfield, NOT a consumption signal.
    expect(packet.flags).to.equal(InvResultFlags.Bit12);
    const classified = classifyInvResult(packet);
    expect(classified.kind).to.equal('use-ack');
    if (classified.kind === 'use-ack') {
      expect(classified.from.objectType).to.equal(2648);
      expect(classified.flags).to.equal(0x1000);
    }
  });

  it('treats a flags-0 use ack as a use ack (consumption is not derivable)', () => {
    const packet = new InvResultPacket();
    packet.ackType = 1;
    packet.fromSlot = SlotObjectData.from(99, 4, 2991);
    packet.toSlot = SlotObjectData.from(0, 0, 0);
    expect(packet.isUseItemAck()).to.equal(true);
    const classified = classifyInvResult(packet);
    expect(classified.kind).to.equal('use-ack');
    if (classified.kind === 'use-ack') expect(classified.flags).to.equal(0);
  });

  it('recognises combined flag bits from the Oryx captures', () => {
    // 0x60000 seen on ability item 2608 = Bit17 | Bit18; not consumed.
    expect(InvResultFlags.Bit17 | InvResultFlags.Bit18).to.equal(0x60000);
    expect(InvResultFlags.Bit20 | InvResultFlags.Bit18 | InvResultFlags.Bit17).to.equal(0x160000);
  });
});

describe('buildInvSwap', () => {
  it('builds a packet matching the captured swap', () => {
    const swap = buildInvSwap(
      1234,
      { x: 10.5, y: 20.25 },
      { objectId: 55603, slotId: 0, objectType: 2991 },
      { objectId: 55602, slotId: 4, objectType: -1 },
    );
    expect(swap.time).to.equal(1234);
    expect(swap.position.x).to.equal(10.5);
    expect(swap.slotObject1.objectId).to.equal(55603);
    expect(swap.slotObject1.objectType).to.equal(2991);
    expect(swap.slotObject2.slotId).to.equal(4);
    expect(swap.slotObject2.isEmpty()).to.equal(true);
  });
});

describe('SwapCorrelator', () => {
  function swapFor(from: SlotObjectData, to: SlotObjectData): InvSwapPacket {
    return buildInvSwap(0, { x: 0, y: 0 }, from, to);
  }

  it('matches an ack to its pending swap', () => {
    const correlator = new SwapCorrelator();
    const swap = swapFor(SlotObjectData.from(55603, 0, 2991), SlotObjectData.from(55602, 4, -1));
    correlator.sent(swap, 100);
    const ack = fromHex(new InvResultPacket(), SWAP_ACK_HEX);
    const matched = correlator.onResult(ack);
    expect(matched).to.not.equal(null);
    expect(matched!.swap).to.equal(swap);
    expect(correlator.pending()).to.have.length(0);
  });

  it('ignores use acks and leaves swaps pending', () => {
    const correlator = new SwapCorrelator();
    const swap = swapFor(SlotObjectData.from(1, 0, 5), SlotObjectData.from(2, 1, -1));
    correlator.sent(swap, 100);
    const useAck = fromHex(new InvResultPacket(), USE_ACK_HEX);
    expect(correlator.onResult(useAck)).to.equal(null);
    expect(correlator.pending()).to.have.length(1);
  });

  it('expires unacknowledged swaps', () => {
    const correlator = new SwapCorrelator();
    correlator.sent(swapFor(SlotObjectData.from(1, 0, 5), SlotObjectData.from(2, 1, -1)), 100);
    correlator.sent(swapFor(SlotObjectData.from(3, 0, 6), SlotObjectData.from(4, 1, -1)), 300);
    const expired = correlator.expire(200);
    expect(expired).to.have.length(1);
    expect(correlator.pending()).to.have.length(1);
  });
});

describe('InventoryTracker', () => {
  function updateWith(...statuses: ObjectStatusData[]): UpdatePacket {
    const p = new UpdatePacket();
    p.newObjects = statuses.map((s) => {
      const obj = { objectType: 768, status: s } as any;
      return obj;
    });
    return p;
  }

  function tickWith(...statuses: ObjectStatusData[]): NewTickPacket {
    const p = new NewTickPacket();
    p.statuses = statuses;
    return p;
  }

  it('tracks slots from UPDATE and NEWTICK', () => {
    const tracker = new InventoryTracker();
    tracker.applyMapInfo(mapInfo('Nexus'));
    tracker.applyUpdate(updateWith(status(1194, [
      statData(StatType.INVENTORY_1_STAT, 2648),
      statData(StatType.SEASONAL_CHARACTER_STAT, 1),
    ])));
    expect(tracker.getObject(1194)!.slots.get(1)).to.equal(2648);
    expect(tracker.getObject(1194)!.seasonal).to.equal(true);

    tracker.applyNewTick(tickWith(status(1194, [statData(StatType.INVENTORY_1_STAT, -1)])));
    expect(tracker.getObject(1194)!.slots.get(1)).to.equal(-1);
  });

  it('locates items and resets per map (the stale-object trap)', () => {
    const tracker = new InventoryTracker();
    tracker.applyMapInfo(mapInfo('Nexus'));
    tracker.applyUpdate(updateWith(status(55367, [statData(StatType.INVENTORY_1_STAT, 2648)])));
    expect(tracker.locationsOf(2648)).to.deep.equal([{ objectId: 55367, slotIndex: 1 }]);

    // Map change: same item, new object id. Without the reset this would
    // read as a duplicate — the exact false positive from the cults log.
    tracker.applyMapInfo(mapInfo('Vault'));
    tracker.applyUpdate(updateWith(status(585, [statData(StatType.INVENTORY_1_STAT, 2648)])));
    expect(tracker.locationsOf(2648)).to.deep.equal([{ objectId: 585, slotIndex: 1 }]);
    expect(tracker.mapCount).to.equal(2);
  });

  it('matches a use ack to a registered USEITEM', () => {
    const tracker = new InventoryTracker();
    tracker.applyMapInfo(mapInfo('Cultist Hideout'));
    const use = new UseItemPacket();
    use.slotObject = SlotObjectData.from(1194, 1, 2648);
    tracker.applyUseItem(use);

    const events = tracker.applyInvResult(fromHex(new InvResultPacket(), USE_ACK_HEX));
    expect(events.map((e) => e.kind)).to.deep.equal(['use-ack']);
    const ack = events[0] as Extract<typeof events[0], { kind: 'use-ack' }>;
    // The ack carries the raw flags; consumption is not derivable from it.
    expect(ack.result.flags).to.equal(0x1000);
  });

  it('reports a use-shaped ack with no registered use as unmatched', () => {
    const tracker = new InventoryTracker();
    tracker.applyMapInfo(mapInfo('Cultist Hideout'));
    const events = tracker.applyInvResult(fromHex(new InvResultPacket(), USE_ACK_HEX));
    expect(events.map((e) => e.kind)).to.deep.equal(['unmatched-use-ack']);
  });

  it('resets pending uses on map change', () => {
    const tracker = new InventoryTracker();
    tracker.applyMapInfo(mapInfo('Cultist Hideout'));
    const use = new UseItemPacket();
    use.slotObject = SlotObjectData.from(1194, 1, 2648);
    tracker.applyUseItem(use);
    tracker.applyMapInfo(mapInfo('Nexus'));
    const events = tracker.applyInvResult(fromHex(new InvResultPacket(), USE_ACK_HEX));
    expect(events.map((e) => e.kind)).to.deep.equal(['unmatched-use-ack']);
  });

  it('classifies swap acks without touching pending uses', () => {
    const tracker = new InventoryTracker();
    tracker.applyMapInfo(mapInfo('Nexus'));
    const events = tracker.applyInvResult(fromHex(new InvResultPacket(), SWAP_ACK_HEX));
    expect(events.map((e) => e.kind)).to.deep.equal(['swap-ack']);
  });

  it('matches a flags-0 use ack without inferring consumption', () => {
    const tracker = new InventoryTracker();
    tracker.applyMapInfo(mapInfo('Guild Hall'));
    const use = new UseItemPacket();
    use.slotObject = SlotObjectData.from(99, 4, 2991);
    tracker.applyUseItem(use);
    const result = new InvResultPacket();
    result.ackType = 1;
    result.fromSlot = SlotObjectData.from(99, 4, 2991);
    result.toSlot = SlotObjectData.from(0, 0, 0);
    const events = tracker.applyInvResult(result);
    expect(events.map((e) => e.kind)).to.deep.equal(['use-ack']);
    const ack = events[0] as Extract<typeof events[0], { kind: 'use-ack' }>;
    expect(ack.result.flags).to.equal(0); // no consumption claim from flags
  });
});
