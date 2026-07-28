import { expect } from 'chai';
import * as Core from '../src/core';
import * as Data from '../src/data';
import * as Models from '../src/models';
import * as Packets from '../src/packets';
import * as Protocol from '../src/protocol';
import * as Root from '../src';

describe('additive package entry points', () => {
  it('reuse the root API constructors and metadata', () => {
    expect(Core.PacketIO).to.equal(Root.PacketIO);
    expect(Core.Reader).to.equal(Root.Reader);
    expect(Data.StatData).to.equal(Root.StatData);
    expect(Models.StatType).to.equal(Root.StatType);
    expect(Packets.PingPacket).to.equal(Root.PingPacket);
    expect(Protocol.PACKET_REGISTRY).to.equal(Root.PACKET_REGISTRY);
  });

  it('provides stable packet-family namespaces', () => {
    expect(Packets.PetPackets.PetUpgradeRequestPacket).to.equal(Root.PetUpgradeRequestPacket);
    expect(Packets.PartyPackets.PartyJoinResultPacket).to.equal(Root.PartyJoinResultPacket);
    expect(Packets.InventoryTradePackets.VaultContentPacket).to.equal(Root.VaultContentPacket);
  });
});
