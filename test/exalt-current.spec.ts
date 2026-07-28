import { expect } from 'chai';
import {
  ColorData,
  CustomMapData,
  CustomMapListPacket,
  CustomMapListResponsePacket,
  DashResetPacket,
  DebugShape,
  DEFAULT_PACKET_MAP,
  DrawDebugArrowPacket,
  DrawDebugShapePacket,
  ExaltationRedeemInfoPacket,
  getPacketDefinitionById,
  GetPlayersListPacket,
  GiftItemsPacket,
  InventoryOwnerType,
  MissionParticipants,
  PacketType,
  PartyJoinRequestPacket,
  PartyJoinResponsePacket,
  PartyJoinResultPacket,
  PartyRequestResponsePacket,
  PartyResponse,
  PlayersListPacket,
  Reader,
  ResetEnchantmentRerollCountPacket,
  ResetEnchantmentRerollCountResultPacket,
  StacksPacket,
  TextType,
  TutorialType,
  TutorialStateChangedPacket,
  WorldPosData,
  Writer,
} from '../src';

function roundTrip<T extends { read(reader: Reader): void; write(writer: Writer): void }>(
  packet: T,
  fresh: T,
): T {
  const writer = new Writer();
  packet.write(writer);
  const reader = new Reader(writer.index);
  writer.buffer.copy(reader.buffer, 0, 0, writer.index);
  fresh.read(reader);
  expect(reader.remaining).to.equal(0);
  return fresh;
}

describe('current Exalt packet structures', () => {
  it('models direction-scoped party packet ids', () => {
    expect(getPacketDefinitionById(215, 'outgoing')?.type).to.equal(PacketType.PARTY_JOIN_REQUEST);
    expect(getPacketDefinitionById(215, 'incoming')?.type).to.equal(PacketType.PARTY_JOIN_RESULT);
    expect(getPacketDefinitionById(217, 'incoming')?.type).to.equal(
      PacketType.PARTY_REQUEST_RESPONSE,
    );
    expect(getPacketDefinitionById(217, 'outgoing')?.type).to.equal(
      PacketType.PARTY_JOIN_REQUEST_RESPONSE,
    );

    expect(DEFAULT_PACKET_MAP[215]).to.equal(PacketType.PARTY_JOIN_RESULT);
    expect(DEFAULT_PACKET_MAP[PacketType.PARTY_JOIN_REQUEST]).to.equal(215);
    expect(DEFAULT_PACKET_MAP[217]).to.equal(PacketType.PARTY_REQUEST_RESPONSE);
    expect(DEFAULT_PACKET_MAP[PacketType.PARTY_JOIN_REQUEST_RESPONSE]).to.equal(217);
  });

  it('separates the player-list request and response ids', () => {
    const request = new GetPlayersListPacket();
    const writer = new Writer();
    request.write(writer);
    expect(writer.index).to.equal(0);
    expect(DEFAULT_PACKET_MAP[PacketType.GET_PLAYERS_LIST_MESSAGE]).to.equal(125);

    const response = new PlayersListPacket();
    response.playersList = 'Alice,Bob';
    expect(roundTrip(response, new PlayersListPacket()).playersList).to.equal('Alice,Bob');
    expect(DEFAULT_PACKET_MAP[123]).to.equal(PacketType.PLAYERS_LIST_MESSAGE);
  });

  it('round-trips debug drawing packets', () => {
    const shape = new DrawDebugShapePacket();
    shape.color = new ColorData(1, 0.5, 0.25, 1);
    shape.position = new WorldPosData(12.5, 24.5);
    shape.shape = DebugShape.Circle;
    shape.time = 2;
    shape.scale = 3;
    const shapeOut = roundTrip(shape, new DrawDebugShapePacket());
    expect(shapeOut.shape).to.equal(DebugShape.Circle);
    expect(shapeOut.position.x).to.equal(12.5);

    const arrow = new DrawDebugArrowPacket();
    arrow.color = new ColorData(0, 1, 0, 1);
    arrow.startPosition = new WorldPosData(1, 2);
    arrow.endPosition = new WorldPosData(3, 4);
    arrow.time = 5;
    arrow.scale = 6;
    const arrowOut = roundTrip(arrow, new DrawDebugArrowPacket());
    expect(arrowOut.endPosition).to.deep.include({ x: 3, y: 4 });
  });

  it('models current zero-body notifications', () => {
    for (const packet of [new DashResetPacket(), new TutorialStateChangedPacket()]) {
      const writer = new Writer();
      packet.write(writer);
      expect(writer.index).to.equal(0);
    }
  });

  it('uses recovered names for previously unknown current packets', () => {
    const exaltation = new ExaltationRedeemInfoPacket();
    exaltation.result = true;
    exaltation.message = 'ok';
    expect(roundTrip(exaltation, new ExaltationRedeemInfoPacket()).message).to.equal('ok');
    expect(DEFAULT_PACKET_MAP[116]).to.equal(PacketType.EXALTATION_REDEEM_INFO);

    const gift = new GiftItemsPacket();
    gift.items = 'item-data';
    gift.recipient = 'Alice';
    expect(roundTrip(gift, new GiftItemsPacket()).recipient).to.equal('Alice');
    expect(DEFAULT_PACKET_MAP[PacketType.GIFT_ITEMS]).to.equal(226);

    const stacks = new StacksPacket();
    stacks.state.attack = 2;
    stacks.state.dexterity = 1;
    const stacksOut = roundTrip(stacks, new StacksPacket());
    expect(stacksOut.state).to.deep.include({ attack: 2, dexterity: 1 });
    expect(DEFAULT_PACKET_MAP[231]).to.equal(PacketType.STACKS);
  });

  it('separates dust purchases from reroll-count resets', () => {
    expect(DEFAULT_PACKET_MAP[191]).to.equal(PacketType.BUY_DUSTS);
    expect(DEFAULT_PACKET_MAP[192]).to.equal(PacketType.BUY_DUSTS_RESULT);
    expect(DEFAULT_PACKET_MAP[PacketType.RESET_ENCHANTMENT_REROLL_COUNT]).to.equal(198);
    expect(DEFAULT_PACKET_MAP[199]).to.equal(PacketType.RESET_ENCHANTMENT_REROLL_COUNT_RESULT);

    const reset = new ResetEnchantmentRerollCountPacket();
    reset.value = 'payload';
    expect(roundTrip(reset, new ResetEnchantmentRerollCountPacket()).value).to.equal('payload');

    const result = new ResetEnchantmentRerollCountResultPacket();
    result.success = true;
    expect(roundTrip(result, new ResetEnchantmentRerollCountResultPacket()).success).to.equal(true);
  });

  it('exports recovered current-client enums', () => {
    expect(InventoryOwnerType.Pet).to.equal(4);
    expect(MissionParticipants.All).to.equal(255);
    expect(TextType.Exaltation).to.equal(8);
    expect(TutorialType.EnterPortalType).to.equal(14);
  });

  it('round-trips the current custom-map list structure', () => {
    const requestWriter = new Writer();
    new CustomMapListPacket().write(requestWriter);
    expect(requestWriter.index).to.equal(0);

    const map = new CustomMapData();
    map.name = 'Test map';
    map.mapId = 123;
    map.unknownInt = 456;
    map.owned = true;
    const response = new CustomMapListResponsePacket();
    response.maps = [map];

    const out = roundTrip(response, new CustomMapListResponsePacket());
    expect(out.maps).to.have.length(1);
    expect(out.maps[0]).to.deep.include({
      name: 'Test map',
      mapId: 123,
      unknownInt: 456,
      owned: true,
    });
  });

  it('uses exact current party payloads', () => {
    const join = new PartyJoinRequestPacket();
    join.partyId = 0x12345678;
    expect(roundTrip(join, new PartyJoinRequestPacket()).partyId).to.equal(0x12345678);

    const result = new PartyJoinResultPacket();
    result.partyId = 0x12345678;
    result.state = PartyResponse.Accepted;
    const resultOut = roundTrip(result, new PartyJoinResultPacket());
    expect(resultOut.state).to.equal(PartyResponse.Accepted);

    const incomingResponse = new PartyRequestResponsePacket();
    incomingResponse.name = 'Alice';
    incomingResponse.classId = 0x030e;
    incomingResponse.skinId = 0x1234;
    incomingResponse.state = PartyResponse.Pending;
    expect(roundTrip(incomingResponse, new PartyRequestResponsePacket()).name).to.equal('Alice');

    const outgoingResponse = new PartyJoinResponsePacket();
    outgoingResponse.name = 'Bob';
    outgoingResponse.classId = 0x0300;
    outgoingResponse.skinId = 0;
    outgoingResponse.state = PartyResponse.Declined;
    expect(roundTrip(outgoingResponse, new PartyJoinResponsePacket()).state).to.equal(
      PartyResponse.Declined,
    );
  });
});
