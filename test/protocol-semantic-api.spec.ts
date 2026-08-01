import { expect } from 'chai';
import {
  AccountListAction,
  AccountListPacket,
  ActivePetUpdateRequestPacket,
  ActivePetUpdateType,
  BuyDustsPacket,
  BuyResultCode,
  BuyResultPacket,
  ClaimRewardColumn,
  ClaimRewardPacket,
  FavourPetOperation,
  FavourPetPacket,
  PurchaseRequestPacket,
  RedeemExaltationRewardPacket,
  ReskinPacket,
  SetDiscoverablePacket,
  SetGraveStonePacket,
  ShootAckPacket,
  UseItemPacket,
} from '../src';
import { parseHex, writeHex } from './support/codec';

describe('protocol semantic APIs', () => {
  it('builds active-pet set, clear, and release commands with current semantics', () => {
    const selected = ActivePetUpdateRequestPacket.setActive(85);
    expect(selected).to.include({ commandType: ActivePetUpdateType.SetActive, instanceId: 85 });
    expect(writeHex(selected)).to.equal('0100000055');

    const cleared = ActivePetUpdateRequestPacket.clearActive();
    expect(cleared).to.include({ commandType: ActivePetUpdateType.SetActive, instanceId: 0 });
    expect(writeHex(cleared)).to.equal('0100000000');

    expect(ActivePetUpdateRequestPacket.release(85)).to.include({
      commandType: ActivePetUpdateType.Release,
      instanceId: 85,
    });
    expect(ActivePetUpdateType.Follow).to.equal(ActivePetUpdateType.SetActive);
  });

  it('distinguishes account-list snapshots from incremental changes', () => {
    const packet = new AccountListPacket();
    expect(packet.lockAction).to.equal(AccountListAction.Snapshot);
    expect(packet.isSnapshot()).to.equal(true);

    packet.action = AccountListAction.Add;
    expect(packet.isAddition()).to.equal(true);
    packet.action = AccountListAction.Remove;
    expect(packet.isRemoval()).to.equal(true);
  });

  it('keeps renamed int32 fields byte-compatible', () => {
    const useItem = new UseItemPacket();
    useItem.abilityIndex = 17;
    expect(useItem.useItemFlag).to.equal(17);
    useItem.useItemFlag = 18;
    expect(useItem.abilityIndex).to.equal(18);

    const redeem = parseHex(new RedeemExaltationRewardPacket(), '80000000');
    expect(redeem.itemId).to.equal(-0x80000000);
    expect(redeem.unknownInt).to.equal(redeem.itemId);

    const gravestone = parseHex(new SetGraveStonePacket(), '0000002a00000007');
    expect(gravestone.gravestoneType).to.equal(42);
    gravestone.unknownInt = 43;
    expect(writeHex(gravestone)).to.equal('0000002b00000007');
  });

  it('keeps discoverability and favorite-title compatibility aliases', () => {
    const discoverable = parseHex(new SetDiscoverablePacket(), '010001');
    expect(discoverable.icon).to.equal(1);
    discoverable.unknownShort = 2;
    expect(writeHex(discoverable)).to.equal('010002');

    const title = FavourPetPacket.favoriteTitle(10, 20);
    expect(title).to.deep.include({ operation: FavourPetOperation.Title, values: [10, 20] });
    expect(writeHex(FavourPetPacket.title(10, 20))).to.equal(writeHex(title));
  });

  it('models packet 234 as an unsigned competition column and retains aliases', () => {
    const packet = ClaimRewardPacket.forColumn(ClaimRewardColumn.Column1);
    expect(packet.columnId).to.equal(1);
    expect(packet.unknownByte).to.equal(1);
    expect(writeHex(packet)).to.equal('01');

    packet.columnId = 255;
    expect(parseHex(new ClaimRewardPacket(), writeHex(packet)).columnId).to.equal(255);
  });

  it('keeps multiplexed purchase result success operation-specific', () => {
    const result = new BuyResultPacket();
    result.code = BuyResultCode.PetFeedSuccess;
    expect(result.isPetFeedSuccess()).to.equal(true);
    expect(result.isPetBackpackSuccess()).to.equal(false);
    result.code = BuyResultCode.PetBackpackSuccess;
    expect(result.isPetBackpackSuccess()).to.equal(true);
  });

  it('parses known raw economy strings without replacing them', () => {
    const dust = BuyDustsPacket.forQuantity(4, 7);
    expect(dust.value).to.equal('4:7');
    expect(dust.parsePurchase()).to.deep.equal({ tier: 4, quantity: 7 });
    dust.value = 'future-format';
    expect(dust.parsePurchase()).to.equal(undefined);

    const purchase = new PurchaseRequestPacket();
    purchase.request = PurchaseRequestPacket.build('Equipment', 31597, 1, 'Fame');
    expect(purchase.parseFields()).to.deep.equal({
      category: 'Equipment',
      itemId: 31597,
      quantity: 1,
      currency: 'Fame',
    });
    expect(purchase.request).to.equal('Equipment,31597,1,Fame');
  });

  it('documents and accepts observed boundary values without changing codecs', () => {
    const reskin = new ReskinPacket();
    expect(reskin.skinId).to.equal(0);

    const ack = new ShootAckPacket();
    ack.ackCount = 235;
    expect(parseHex(new ShootAckPacket(), writeHex(ack)).ackCount).to.equal(235);
  });
});
